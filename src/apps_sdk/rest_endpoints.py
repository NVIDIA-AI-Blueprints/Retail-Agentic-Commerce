"""REST endpoints for widget cart flows and ACP proxy operations."""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.events import (
    checkout_events,
    emit_agent_activity_event,
    emit_checkout_event,
)
from src.apps_sdk.recommendation_helpers import (
    record_recommendation_attribution_event,
)
from src.apps_sdk.schemas import (
    ACPCreateSessionRequest,
    ACPUpdateSessionRequest,
    CartAddRequest,
    CartCheckoutRequest,
    CartUpdateRequest,
    RecommendationClickRequest,
    ShippingUpdateRequest,
)
from src.apps_sdk.tools import add_to_cart, checkout

router = APIRouter()

# Keep logger namespace stable across refactor for log continuity.
logger = logging.getLogger("src.apps_sdk.main")

# Store active sessions for the widget
active_sessions: dict[str, str] = {}  # cart_id -> session_id


@router.post("/recommendations/click", tags=["metrics"])
async def api_recommendation_click(
    request: RecommendationClickRequest,
) -> dict[str, bool]:
    """Track a recommendation click event for attribution analytics."""
    await record_recommendation_attribution_event(
        event_type="click",
        product_id=request.product_id,
        session_id=request.session_id,
        recommendation_request_id=request.recommendation_request_id,
        position=request.position,
        source=request.source,
    )
    return {"recorded": True}


@router.post("/cart/add", tags=["cart"])
async def api_add_to_cart(request: CartAddRequest) -> dict[str, Any]:
    """REST endpoint to add an item to the cart."""
    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/add",
        method="POST",
        status="pending",
        summary=f"Adding {request.product_id} to cart...",
    )

    result = await add_to_cart(
        request.product_id,
        request.quantity,
        request.cart_id,
    )

    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/add",
        method="POST",
        status="success",
        summary=f"Added {request.quantity}x {request.product_id}",
        status_code=200,
    )

    return result


@router.post("/cart/update", tags=["cart"])
async def api_update_cart(request: CartUpdateRequest) -> dict[str, Any]:
    """REST endpoint to update cart (quantity changes, removals)."""
    from src.apps_sdk.tools.cart import calculate_cart_totals, carts, get_cart_meta

    cart_id = request.cart_id or f"cart_{uuid4().hex[:12]}"
    item_count = len(request.cart_items)

    action_summary = {
        "update": f"Updating cart ({item_count} items)",
        "remove": "Removing item from cart",
        "clear": "Clearing cart",
    }.get(request.action, "Updating cart")

    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/update",
        method="POST",
        status="pending",
        summary=action_summary,
        session_id=cart_id,
    )

    carts[cart_id] = [
        {
            "id": item.get("id"),
            "name": item.get("name"),
            "basePrice": item.get("basePrice"),
            "quantity": item.get("quantity"),
            "variant": item.get("variant"),
            "size": item.get("size"),
        }
        for item in request.cart_items
    ]

    totals = calculate_cart_totals(carts[cart_id])
    total_quantity = sum(item["quantity"] for item in carts[cart_id])

    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/update",
        method="POST",
        status="success",
        summary=f"Cart updated: {total_quantity} items, ${totals['total'] / 100:.2f}",
        status_code=200,
        session_id=cart_id,
    )

    return {
        "cartId": cart_id,
        "items": carts[cart_id],
        "itemCount": total_quantity,
        **totals,
        "_meta": get_cart_meta(cart_id),
    }


@router.post("/cart/shipping", tags=["cart"])
async def api_update_shipping(request: ShippingUpdateRequest) -> dict[str, Any]:
    """REST endpoint to update shipping option."""
    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/shipping",
        method="POST",
        status="pending",
        summary=f"Updating shipping to {request.shipping_option_name}...",
        session_id=request.cart_id,
    )

    price_display = (
        "Free"
        if request.shipping_price == 0
        else f"${request.shipping_price / 100:.2f}"
    )

    emit_checkout_event(
        event_type="session_update",
        endpoint="/cart/shipping",
        method="POST",
        status="success",
        summary=f"Shipping: {request.shipping_option_name} ({price_display})",
        status_code=200,
        session_id=request.cart_id,
    )

    return {
        "cartId": request.cart_id,
        "shippingOptionId": request.shipping_option_id,
        "shippingOptionName": request.shipping_option_name,
        "shippingPrice": request.shipping_price,
    }


@router.post("/acp/sessions", tags=["acp"])
async def acp_create_session(request: ACPCreateSessionRequest) -> dict[str, Any]:
    """Create a checkout session on the Merchant API."""
    checkout_events.clear()

    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    merchant_api_key = settings.merchant_api_key

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            body: dict[str, Any] = {"items": request.items}
            if request.buyer:
                body["buyer"] = request.buyer
            if request.fulfillment_address:
                body["fulfillment_address"] = request.fulfillment_address
            if request.discounts is not None:
                body["discounts"] = request.discounts

            response = await client.post(
                f"{merchant_api_url}/checkout_sessions",
                headers={
                    "Authorization": f"Bearer {merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json=body,
            )

            if response.status_code == 201:
                data = response.json()
                session_id = data.get("id", "")

                emit_checkout_event(
                    event_type="session_create",
                    endpoint="/checkout_sessions",
                    method="POST",
                    status="success",
                    summary=f"Session {session_id[-12:]} created",
                    status_code=201,
                    session_id=session_id,
                )

                line_items = data.get("line_items", [])
                for line_item in line_items:
                    promotion = line_item.get("promotion")
                    if promotion:
                        item_info = line_item.get("item", {})
                        product_id = item_info.get("id", "unknown")
                        product_name = line_item.get("name") or product_id
                        stock_count = promotion.get("stock_count", 0)

                        emit_agent_activity_event(
                            agent_type="promotion",
                            product_id=product_id,
                            product_name=product_name,
                            action=promotion.get("action", "NO_PROMO"),
                            discount_amount=line_item.get("discount", 0),
                            reason_codes=promotion.get("reason_codes", []),
                            reasoning=promotion.get("reasoning", ""),
                            stock_count=stock_count,
                            base_price=line_item.get("base_amount", 0),
                        )

                return data

            error_text = response.text
            emit_checkout_event(
                event_type="session_create",
                endpoint="/checkout_sessions",
                method="POST",
                status="error",
                summary=f"Failed: {response.status_code}",
                status_code=response.status_code,
            )
            raise HTTPException(status_code=response.status_code, detail=error_text)

    except httpx.ConnectError as e:
        emit_checkout_event(
            event_type="session_create",
            endpoint="/checkout_sessions",
            method="POST",
            status="error",
            summary="Connection failed",
            status_code=503,
        )
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/acp/sessions/{session_id}", tags=["acp"])
async def acp_update_session(
    session_id: str, request: ACPUpdateSessionRequest
) -> dict[str, Any]:
    """Update a checkout session on the Merchant API."""
    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    merchant_api_key = settings.merchant_api_key

    update_parts: list[str] = []
    if request.items:
        update_parts.append(f"{len(request.items)} items")
    if request.fulfillment_option_id:
        update_parts.append("shipping")
    if request.fulfillment_address:
        update_parts.append("address")
    if request.discounts is not None:
        update_parts.append("discounts")
    update_summary = ", ".join(update_parts) or "session"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            body: dict[str, Any] = {}
            if request.items is not None:
                body["items"] = request.items
            if request.fulfillment_option_id is not None:
                body["fulfillment_option_id"] = request.fulfillment_option_id
            if request.fulfillment_address is not None:
                body["fulfillment_address"] = request.fulfillment_address
            if request.discounts is not None:
                body["discounts"] = request.discounts

            response = await client.post(
                f"{merchant_api_url}/checkout_sessions/{session_id}",
                headers={
                    "Authorization": f"Bearer {merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json=body,
            )

            if response.status_code == 200:
                data = response.json()

                emit_checkout_event(
                    event_type="session_update",
                    endpoint=f"/checkout_sessions/{session_id[-12:]}",
                    method="POST",
                    status="success",
                    summary=f"Updated {update_summary}",
                    status_code=200,
                    session_id=session_id,
                )

                return data

            error_text = response.text
            emit_checkout_event(
                event_type="session_update",
                endpoint=f"/checkout_sessions/{session_id[-12:]}",
                method="POST",
                status="error",
                summary=f"Failed: {response.status_code}",
                status_code=response.status_code,
                session_id=session_id,
            )
            raise HTTPException(status_code=response.status_code, detail=error_text)

    except httpx.ConnectError as e:
        emit_checkout_event(
            event_type="session_update",
            endpoint=f"/checkout_sessions/{session_id[-12:]}",
            method="POST",
            status="error",
            summary="Connection failed",
            status_code=503,
            session_id=session_id,
        )
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/cart/sync", tags=["cart"])
async def api_sync_cart(request: CartCheckoutRequest) -> dict[str, Any]:
    """Sync the widget's cart state with the server."""
    from src.apps_sdk.tools.cart import calculate_cart_totals, carts, get_cart_meta

    cart_id = request.cart_id or f"cart_{uuid4().hex[:12]}"

    carts[cart_id] = [
        {
            "id": item.get("id"),
            "name": item.get("name"),
            "basePrice": item.get("basePrice"),
            "quantity": item.get("quantity"),
            "variant": item.get("variant"),
            "size": item.get("size"),
        }
        for item in request.cart_items
    ]

    totals = calculate_cart_totals(carts[cart_id])

    return {
        "cartId": cart_id,
        "items": carts[cart_id],
        "itemCount": sum(item["quantity"] for item in carts[cart_id]),
        **totals,
        "_meta": get_cart_meta(cart_id),
    }


@router.post("/cart/checkout", tags=["cart"])
async def api_checkout(request: CartCheckoutRequest) -> dict[str, Any]:
    """Process checkout after syncing cart state."""
    from src.apps_sdk.tools.cart import carts

    cart_id = request.cart_id or f"cart_{uuid4().hex[:12]}"

    carts[cart_id] = [
        {
            "id": item.get("id"),
            "name": item.get("name"),
            "basePrice": item.get("basePrice"),
            "quantity": item.get("quantity"),
            "variant": item.get("variant"),
            "size": item.get("size"),
        }
        for item in request.cart_items
    ]

    logger.info(
        f"Checkout REST API called for cart {cart_id} with {len(carts[cart_id])} items, customer: {request.customer_name}"
    )

    result = await checkout(cart_id, customer_name=request.customer_name)

    if result.get("success") is True:
        order_id = str(result.get("orderId") or "")
        for item in request.cart_items:
            recommendation_request_id = item.get("recommendationRequestId") or item.get(
                "recommendation_request_id"
            )
            product_id = item.get("id") or item.get("productId")
            if (
                not isinstance(recommendation_request_id, str)
                or not recommendation_request_id
            ):
                continue
            if not isinstance(product_id, str) or not product_id:
                continue
            quantity_raw = item.get("quantity")
            price_raw = (
                item.get("basePrice") if "basePrice" in item else item.get("base_price")
            )
            quantity = (
                quantity_raw
                if isinstance(quantity_raw, int) and quantity_raw > 0
                else 1
            )
            unit_price = (
                price_raw if isinstance(price_raw, int) and price_raw >= 0 else 0
            )
            position_raw = item.get("recommendationPosition")
            position = position_raw if isinstance(position_raw, int) else None

            await record_recommendation_attribution_event(
                event_type="purchase",
                product_id=product_id,
                session_id=request.cart_id,
                recommendation_request_id=recommendation_request_id,
                position=position,
                order_id=order_id or None,
                quantity=quantity,
                revenue_cents=unit_price * quantity,
                source="apps_sdk_checkout",
            )
    return result

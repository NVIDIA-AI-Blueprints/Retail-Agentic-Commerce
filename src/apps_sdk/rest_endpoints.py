"""REST endpoints for widget cart flows and ACP proxy operations."""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException

from src.apps_sdk.events import (
    emit_checkout_event,
)
from src.apps_sdk.recommendation_helpers import (
    record_purchase_attribution,
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
from src.apps_sdk.tools.acp_sessions import (
    ACPSessionError,
    create_acp_session,
    update_acp_session,
)

router = APIRouter()

# Keep logger namespace stable across refactor for log continuity.
logger = logging.getLogger("src.apps_sdk.main")

# Store active sessions for the widget
active_sessions: dict[str, str] = {}  # cart_id -> session_id


@router.post("/recommendations/click", tags=["metrics"])
async def api_recommendation_click(
    request: RecommendationClickRequest,
) -> dict[str, bool]:
    """Track a recommendation click event for attribution analytics.

    .. deprecated::
        Prefer the ``track-recommendation-click`` MCP tool for new integrations.
    """
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
    """Create a checkout session on the Merchant API.

    .. deprecated::
        Prefer the ``create-checkout-session`` MCP tool for new integrations.
    """
    try:
        return await create_acp_session(
            items=request.items,
            buyer=request.buyer,
            fulfillment_address=request.fulfillment_address,
            discounts=request.discounts,
        )
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
    except ACPSessionError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


@router.post("/acp/sessions/{session_id}", tags=["acp"])
async def acp_update_session(
    session_id: str, request: ACPUpdateSessionRequest
) -> dict[str, Any]:
    """Update a checkout session on the Merchant API.

    .. deprecated::
        Prefer the ``update-checkout-session`` MCP tool for new integrations.
    """
    try:
        return await update_acp_session(
            session_id=session_id,
            items=request.items,
            fulfillment_option_id=request.fulfillment_option_id,
            fulfillment_address=request.fulfillment_address,
            discounts=request.discounts,
        )
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
    except ACPSessionError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


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
    """Process checkout after syncing cart state.

    .. deprecated::
        Prefer the ``checkout`` MCP tool (with cartItems/customerName) for new integrations.
    """
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

    if result.get("success"):
        await record_purchase_attribution(
            cart_items=request.cart_items,
            session_id=request.cart_id,
            order_id=str(result.get("orderId") or ""),
        )
    return result

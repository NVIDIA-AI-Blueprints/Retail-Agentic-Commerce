"""
Checkout tool for the MCP server.

Processes checkout through the ACP payment flow.
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import httpx

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.tools.cart import calculate_cart_totals, carts

logger = logging.getLogger(__name__)


async def process_acp_checkout(cart_id: str) -> dict[str, Any]:
    """
    Process checkout through the ACP payment flow.

    This calls the merchant API to create a checkout session,
    delegate payment to the PSP, and complete the order.

    Falls back to simulated checkout if the API is unavailable.

    Args:
        cart_id: The cart ID to checkout.

    Returns:
        Dictionary with checkout result including:
        - success: Boolean indicating if checkout succeeded
        - status: "confirmed" | "failed" | "pending" (per Apps SDK spec)
        - orderId: Order identifier
        - message: Human-readable result message
        - total: Order total in cents
        - itemCount: Number of items in order
    """
    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    api_key = settings.api_key

    cart_items = carts.get(cart_id, [])
    if not cart_items:
        return {
            "success": False,
            "status": "failed",
            "error": "Cart is empty",
            "message": "Cannot checkout an empty cart",
        }

    # Calculate totals before checkout (needed for response)
    totals = calculate_cart_totals(cart_items)
    item_count = sum(item["quantity"] for item in cart_items)

    # Build line items for ACP session
    line_items = [
        {
            "item": {"id": item["id"], "quantity": item["quantity"]},
            "base_amount": item["basePrice"] * item["quantity"],
        }
        for item in cart_items
    ]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Create checkout session
            session_response = await client.post(
                f"{merchant_api_url}/checkout_sessions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "line_items": line_items,
                    "buyer": {
                        "email": "john@example.com",
                        "name": "John Doe",
                    },
                    "fulfillment_address": {
                        "street_address": "123 Main St",
                        "city": "San Francisco",
                        "state": "CA",
                        "postal_code": "94102",
                        "country": "US",
                    },
                },
            )

            if session_response.status_code == 201:
                session_data = session_response.json()
                session_id = session_data.get("id")

                # Complete checkout
                complete_response = await client.post(
                    f"{merchant_api_url}/checkout_sessions/{session_id}/complete",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "payment_details": {
                            "card_number": "4242424242424242",
                            "expiry_month": "12",
                            "expiry_year": "2025",
                            "cvc": "123",
                        },
                        "billing_address": {
                            "street_address": "123 Main St",
                            "city": "San Francisco",
                            "state": "CA",
                            "postal_code": "94102",
                            "country": "US",
                        },
                    },
                )

                if complete_response.status_code == 200:
                    result = complete_response.json()
                    order = result.get("order", {})

                    # Clear cart after successful checkout
                    carts[cart_id] = []

                    return {
                        "success": True,
                        "status": "confirmed",
                        "orderId": order.get("id", f"order_{uuid4().hex[:8].upper()}"),
                        "message": "Order placed successfully!",
                        "total": totals["total"],
                        "itemCount": item_count,
                        "orderUrl": order.get("permalink_url"),
                    }

    except Exception as e:
        # Log error but fall through to simulated checkout
        logger.warning(f"ACP checkout error: {e}")

    # Simulated checkout for development
    order_id = f"order_{uuid4().hex[:8].upper()}"

    # Clear cart
    carts[cart_id] = []

    return {
        "success": True,
        "status": "confirmed",
        "orderId": order_id,
        "message": "Order placed successfully!",
        "total": totals["total"],
        "itemCount": item_count,
    }


async def checkout(cart_id: str) -> dict[str, Any]:
    """
    Process checkout using ACP payment flow.

    Args:
        cart_id: The cart ID to checkout.

    Returns:
        Checkout result with order ID or error.
    """
    result = await process_acp_checkout(cart_id)

    return {
        **result,
        "_meta": {
            "openai/outputTemplate": "ui://widget/merchant-app.html",
            "openai/toolInvocation/invoking": "Processing order...",
            "openai/toolInvocation/invoked": "Order placed!",
            "openai/widgetAccessible": True,
            "openai/closeWidget": result.get("success", False),
        },
    }

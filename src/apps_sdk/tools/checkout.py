# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Checkout tool for the MCP server.

Processes checkout through the ACP payment flow with PSP delegation.
Emits SSE events for Protocol Inspector integration.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any
from uuid import uuid4

import httpx

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.tools.cart import calculate_cart_totals, carts

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


def _emit_event(
    event_type: str,
    endpoint: str,
    method: str = "POST",
    status: str = "success",
    summary: str | None = None,
    status_code: int | None = None,
    session_id: str | None = None,
    order_id: str | None = None,
    event_id: str | None = None,
) -> None:
    """Emit checkout event to SSE subscribers.

    Lazy import to avoid circular dependency.

    Args:
        event_id: Stable event ID for matching pending/complete events.
                  Must be the same for both pending and success/error events.
    """
    try:
        from src.apps_sdk.main import emit_checkout_event

        emit_checkout_event(
            event_type=event_type,
            endpoint=endpoint,
            method=method,
            status=status,
            summary=summary,
            status_code=status_code,
            session_id=session_id,
            order_id=order_id,
            event_id=event_id,
        )
    except ImportError:
        # Module not loaded yet, skip event emission
        pass


async def process_acp_checkout(
    cart_id: str, customer_name: str | None = None
) -> dict[str, Any]:
    """
    Process checkout through the ACP payment flow with PSP delegation.

    Flow:
    1. Create checkout session on merchant API
    2. Delegate payment to PSP → get vault token
    3. Complete checkout with vault token

    Falls back to simulated checkout if the API is unavailable.

    Args:
        cart_id: The cart ID to checkout.
        customer_name: Customer's full name for personalized messages.

    Returns:
        Dictionary with checkout result including:
        - success: Boolean indicating if checkout succeeded
        - status: "confirmed" | "failed" | "pending" (per Apps SDK spec)
        - orderId: Order identifier
        - message: Human-readable result message
        - total: Order total in cents
        - itemCount: Number of items in order
    """
    # Parse customer name into first and last name for API calls
    name_parts = (customer_name or "Customer").strip().split(maxsplit=1)
    first_name = name_parts[0] if name_parts else "Customer"
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    full_name = customer_name or "Customer"
    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    psp_api_url = settings.psp_api_url
    merchant_api_key = settings.merchant_api_key
    psp_api_key = settings.psp_api_key

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

    # Build items for ACP session (only id and quantity needed)
    items = [{"id": item["id"], "quantity": item["quantity"]} for item in cart_items]

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: Create checkout session on merchant API
            logger.info(f"Creating checkout session for cart {cart_id}")
            # Generate stable event ID for matching pending/complete events
            session_create_event_id = f"evt_session_create_{uuid4().hex[:12]}"
            _emit_event(
                "session_create",
                "/checkout_sessions",
                status="pending",
                summary=f"Creating session for {item_count} item(s)",
                event_id=session_create_event_id,
            )
            session_response = await client.post(
                f"{merchant_api_url}/checkout_sessions",
                headers={
                    "Authorization": f"Bearer {merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "items": items,
                    "buyer": {
                        "first_name": first_name,
                        "last_name": last_name or None,
                        "email": "customer@example.com",
                    },
                    "fulfillment_address": {
                        "name": full_name,
                        "line_one": "123 Main St",
                        "city": "San Francisco",
                        "state": "CA",
                        "postal_code": "94102",
                        "country": "US",
                    },
                },
            )

            if session_response.status_code != 201:
                logger.warning(
                    f"Failed to create checkout session: {session_response.status_code}"
                )
                raise Exception("Failed to create checkout session")

            session_data = session_response.json()
            session_id = session_data.get("id")
            logger.info(f"Created checkout session: {session_id}")
            _emit_event(
                "session_create",
                "/checkout_sessions",
                status="success",
                summary=f"Session {session_id} created",
                status_code=201,
                session_id=session_id,
                event_id=session_create_event_id,
            )

            # Get the first available fulfillment option
            fulfillment_options = session_data.get("fulfillment_options", [])
            selected_option_id = None
            if fulfillment_options:
                selected_option_id = fulfillment_options[0].get("id")

            # Step 2: Update checkout session to select shipping option
            if selected_option_id:
                logger.info(
                    f"Updating session {session_id} with fulfillment option {selected_option_id}"
                )
                update_response = await client.post(
                    f"{merchant_api_url}/checkout_sessions/{session_id}",
                    headers={
                        "Authorization": f"Bearer {merchant_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "fulfillment_option_id": selected_option_id,
                    },
                )

                if update_response.status_code != 200:
                    logger.warning(
                        f"Failed to update checkout session: {update_response.status_code} - {update_response.text}"
                    )
                    # Continue anyway - session might still be completable
                else:
                    session_data = update_response.json()
                    logger.info(
                        f"Session status after update: {session_data.get('status')}"
                    )

            # Step 3: Delegate payment to PSP to get vault token (need session total)
            logger.info(f"Delegating payment to PSP for session {session_id}")
            # Generate stable event ID for matching pending/complete events
            delegate_payment_event_id = f"evt_delegate_payment_{uuid4().hex[:12]}"
            _emit_event(
                "delegate_payment",
                "/agentic_commerce/delegate_payment",
                status="pending",
                summary="Delegating payment to PSP...",
                session_id=session_id,
                event_id=delegate_payment_event_id,
            )
            idempotency_key = f"checkout_{cart_id}_{uuid4().hex[:8]}"
            expires_at = datetime.now(UTC) + timedelta(hours=1)

            delegate_response = await client.post(
                f"{psp_api_url}/agentic_commerce/delegate_payment",
                headers={
                    "Authorization": f"Bearer {psp_api_key}",
                    "Content-Type": "application/json",
                    "Idempotency-Key": idempotency_key,
                },
                json={
                    "payment_method": {
                        "type": "card",
                        "card_number_type": "fpan",
                        "virtual": False,
                        "number": "4242424242424242",
                        "exp_month": "12",
                        "exp_year": "2027",
                        "display_card_funding_type": "credit",
                        "display_last4": "4242",
                    },
                    "allowance": {
                        "reason": "one_time",
                        "max_amount": totals["total"],
                        "currency": "USD",
                        "checkout_session_id": session_id,
                        "merchant_id": "merchant_acp_demo",
                        "expires_at": expires_at.isoformat(),
                    },
                    "risk_signals": [
                        {
                            "type": "card_testing",
                            "action": "authorized",
                        }
                    ],
                    "billing_address": {
                        "name": full_name,
                        "line_one": "123 Main St",
                        "city": "San Francisco",
                        "state": "CA",
                        "country": "US",
                        "postal_code": "94102",
                    },
                },
            )

            if delegate_response.status_code not in (200, 201):
                logger.warning(
                    f"Failed to delegate payment: {delegate_response.status_code} - {delegate_response.text}"
                )
                raise Exception("Failed to delegate payment to PSP")

            delegate_data = delegate_response.json()
            vault_token_id = delegate_data.get("id")
            logger.info(f"Received vault token: {vault_token_id}")
            _emit_event(
                "delegate_payment",
                "/agentic_commerce/delegate_payment",
                status="success",
                summary=f"Vault token {vault_token_id} received",
                status_code=201,
                session_id=session_id,
                event_id=delegate_payment_event_id,
            )

            # Step 4: Complete checkout with vault token
            logger.info(f"Completing checkout session {session_id} with vault token")
            # Generate stable event ID for matching pending/complete events
            session_complete_event_id = f"evt_session_complete_{uuid4().hex[:12]}"
            _emit_event(
                "session_complete",
                f"/checkout_sessions/{session_id}/complete",
                status="pending",
                summary="Completing checkout...",
                session_id=session_id,
                event_id=session_complete_event_id,
            )
            complete_response = await client.post(
                f"{merchant_api_url}/checkout_sessions/{session_id}/complete",
                headers={
                    "Authorization": f"Bearer {merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "payment_data": {
                        "token": vault_token_id,
                        "provider": "stripe",
                        "billing_address": {
                            "name": full_name,
                            "line_one": "123 Main St",
                            "city": "San Francisco",
                            "state": "CA",
                            "postal_code": "94102",
                            "country": "US",
                        },
                    },
                },
            )

            if complete_response.status_code == 200:
                result = complete_response.json()
                order = result.get("order", {})
                order_id = order.get("id", f"order_{uuid4().hex[:8].upper()}")

                # Clear cart after successful checkout
                carts[cart_id] = []

                logger.info(f"Checkout completed successfully: {order_id}")
                _emit_event(
                    "session_complete",
                    f"/checkout_sessions/{session_id}/complete",
                    status="success",
                    summary=f"Order {order_id} confirmed",
                    status_code=200,
                    session_id=session_id,
                    order_id=order_id,
                    event_id=session_complete_event_id,
                )
                return {
                    "success": True,
                    "status": "confirmed",
                    "orderId": order_id,
                    "message": "Order placed successfully!",
                    "total": totals["total"],
                    "itemCount": item_count,
                    "orderUrl": order.get("permalink_url"),
                }
            else:
                logger.error(
                    f"Failed to complete checkout: {complete_response.status_code} - {complete_response.text}"
                )
                _emit_event(
                    "session_complete",
                    f"/checkout_sessions/{session_id}/complete",
                    status="error",
                    summary=f"Checkout failed: {complete_response.status_code}",
                    status_code=complete_response.status_code,
                    session_id=session_id,
                    event_id=session_complete_event_id,
                )
                return {
                    "success": False,
                    "status": "failed",
                    "error": f"Checkout completion failed: {complete_response.status_code}",
                    "message": "Failed to complete checkout",
                }

    except httpx.ConnectError as e:
        logger.warning(f"Connection error during checkout: {e}")
        logger.info("Falling back to simulated checkout")

        # Simulated checkout fallback when API is unavailable
        order_id = f"order_{uuid4().hex[:8].upper()}"
        carts[cart_id] = []  # Clear cart

        return {
            "success": True,
            "status": "confirmed",
            "orderId": order_id,
            "message": "Order placed successfully! (simulated)",
            "total": totals["total"],
            "itemCount": item_count,
        }
    except Exception as e:
        logger.error(f"ACP checkout error: {e}")
        return {
            "success": False,
            "status": "failed",
            "error": str(e),
            "message": f"Checkout failed: {e}",
        }


async def checkout(cart_id: str, customer_name: str | None = None) -> dict[str, Any]:
    """
    Process checkout using ACP payment flow.

    Args:
        cart_id: The cart ID to checkout.
        customer_name: Customer's full name for personalized messages.

    Returns:
        Checkout result with order ID or error.
    """
    result = await process_acp_checkout(cart_id, customer_name=customer_name)

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

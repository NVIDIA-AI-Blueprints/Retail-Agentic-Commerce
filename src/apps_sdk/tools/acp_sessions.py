"""Shared ACP session logic for both MCP tools and REST endpoints.

Provides reusable functions for creating and updating checkout sessions
on the Merchant API. Both MCP tool handlers and REST endpoints delegate here.
"""

from __future__ import annotations

import logging
import re
from typing import Any

import httpx

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.events import (
    emit_agent_activity_event,
    emit_checkout_event,
)

logger = logging.getLogger("src.apps_sdk.main")

#: Session IDs are UUIDs or short hex tokens — reject anything else.
_SAFE_SESSION_ID = re.compile(r"^[a-zA-Z0-9_-]+$")


class ACPSessionError(Exception):
    """Raised when a Merchant API checkout session request fails."""

    def __init__(self, message: str, status_code: int) -> None:
        self.status_code = status_code
        super().__init__(message)


async def create_acp_session(
    items: list[dict[str, Any]],
    buyer: dict[str, str] | None = None,
    fulfillment_address: dict[str, str] | None = None,
    discounts: dict[str, list[str]] | None = None,
) -> dict[str, Any]:
    """Create a checkout session on the Merchant API.

    Clears the checkout event history before creating a new session so
    the Protocol Inspector shows a clean timeline per checkout flow.

    Args:
        items: Line items with ``id`` and ``quantity``.
        buyer: Optional buyer information.
        fulfillment_address: Optional shipping address.
        discounts: Optional discount codes.

    Returns:
        The full session response from the Merchant API.

    Raises:
        httpx.ConnectError: When the Merchant API is unreachable.
        ACPSessionError: For non-201 responses (carries the HTTP status code).
    """
    from src.apps_sdk.events import checkout_events

    checkout_events.clear()

    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    merchant_api_key = settings.merchant_api_key

    async with httpx.AsyncClient(timeout=15.0) as client:
        body: dict[str, Any] = {"items": items}
        if buyer:
            body["buyer"] = buyer
        if fulfillment_address:
            body["fulfillment_address"] = fulfillment_address
        if discounts is not None:
            body["discounts"] = discounts

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
        raise ACPSessionError(
            f"Failed to create checkout session: {response.status_code} {error_text}",
            status_code=response.status_code,
        )


async def update_acp_session(
    session_id: str,
    items: list[dict[str, Any]] | None = None,
    fulfillment_option_id: str | None = None,
    fulfillment_address: dict[str, str] | None = None,
    discounts: dict[str, list[str]] | None = None,
) -> dict[str, Any]:
    """Update a checkout session on the Merchant API.

    Args:
        session_id: The session to update.
        items: Optional updated line items.
        fulfillment_option_id: Optional selected shipping option.
        fulfillment_address: Optional updated shipping address.
        discounts: Optional discount codes.

    Returns:
        The updated session response from the Merchant API.

    Raises:
        httpx.ConnectError: When the Merchant API is unreachable.
        ACPSessionError: For non-200 responses (carries the HTTP status code).
        ValueError: If ``session_id`` contains unsafe characters.
    """
    if not _SAFE_SESSION_ID.match(session_id):
        raise ValueError(f"Invalid session_id: {session_id!r}")
    settings = get_apps_sdk_settings()
    merchant_api_url = settings.merchant_api_url
    merchant_api_key = settings.merchant_api_key

    update_parts: list[str] = []
    if items:
        update_parts.append(f"{len(items)} items")
    if fulfillment_option_id:
        update_parts.append("shipping")
    if fulfillment_address:
        update_parts.append("address")
    if discounts is not None:
        update_parts.append("discounts")
    update_summary = ", ".join(update_parts) or "session"

    async with httpx.AsyncClient(timeout=15.0) as client:
        body: dict[str, Any] = {}
        if items is not None:
            body["items"] = items
        if fulfillment_option_id is not None:
            body["fulfillment_option_id"] = fulfillment_option_id
        if fulfillment_address is not None:
            body["fulfillment_address"] = fulfillment_address
        if discounts is not None:
            body["discounts"] = discounts

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
        raise ACPSessionError(
            f"Failed to update checkout session: {response.status_code} {error_text}",
            status_code=response.status_code,
        )

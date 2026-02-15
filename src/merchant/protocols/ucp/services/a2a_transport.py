"""A2A transport service layer for UCP checkout operations.

Handles contextId-to-session mapping, action routing, and response
transformation.  Protocol-level concerns (JSON-RPC envelope, idempotency,
agent card) are handled by the ``agent_executor`` module and the route
handler in ``main.py``.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, cast

from a2a.types import DataPart, Message, Part
from pydantic import ValidationError
from sqlmodel import Session

from src.merchant.config import get_settings
from src.merchant.domain.checkout.models import (
    CheckoutSessionResponse,
    PaymentProviderEnum,
)
from src.merchant.domain.checkout.service import (
    SessionNotFoundError,
    cancel_checkout_session,
    complete_checkout_session_from_data,
    create_checkout_session_from_data,
    get_checkout_session,
    update_checkout_session_from_data,
)
from src.merchant.protocols.ucp.api.schemas.checkout import (
    UCPCapabilityVersion,
    UCPDiscountsInput,
    UCPLineItemInput,
    UCPPaymentHandler,
)
from src.merchant.protocols.ucp.services.negotiation import (
    NegotiationFailureError,
    build_business_profile,
    compute_capability_intersection,
    fetch_platform_profile,
    get_platform_order_webhook_url,
    parse_ucp_agent_header,
    transform_to_ucp_response,
)
from src.merchant.protocols.ucp.services.post_purchase_webhook import (
    trigger_post_purchase_flow_ucp,
)
from src.merchant.services.post_purchase import OrderItem

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# A2A UCP Constants (sourced from official spec: checkout-a2a.md)
# ---------------------------------------------------------------------------

A2A_UCP_EXTENSION_URL = "https://ucp.dev/2026-01-23/specification/reference/"
UCP_CHECKOUT_KEY = "a2a.ucp.checkout"
UCP_PAYMENT_DATA_KEY = "a2a.ucp.checkout.payment"
UCP_RISK_SIGNALS_KEY = "a2a.ucp.checkout.risk_signals"
UCP_AGENT_HEADER = "UCP-Agent"

# ---------------------------------------------------------------------------
# Context-to-Session Mapping (in-memory)
# ---------------------------------------------------------------------------

_context_sessions: dict[str, str] = {}
_context_order_webhook_urls: dict[str, str] = {}


def get_checkout_id_for_context(context_id: str) -> str | None:
    """Look up checkout session ID for an A2A contextId."""
    return _context_sessions.get(context_id)


def set_checkout_id_for_context(context_id: str, checkout_id: str) -> None:
    """Store checkout session ID for an A2A contextId."""
    _context_sessions[context_id] = checkout_id


def get_order_webhook_url_for_context(context_id: str) -> str | None:
    """Look up negotiated order webhook URL for an A2A contextId."""
    return _context_order_webhook_urls.get(context_id)


def set_order_webhook_url_for_context(context_id: str, webhook_url: str) -> None:
    """Store negotiated order webhook URL for an A2A contextId."""
    _context_order_webhook_urls[context_id] = webhook_url


def clear_context_sessions() -> None:
    """Clear all context-to-session mappings (for testing)."""
    _context_sessions.clear()
    _context_order_webhook_urls.clear()


# ---------------------------------------------------------------------------
# Capability Negotiation (A2A-specific wrapper)
# ---------------------------------------------------------------------------


# Type alias for negotiation result
_A2ANegotiationResult = tuple[
    dict[str, list[UCPCapabilityVersion]],
    dict[str, list[UCPPaymentHandler]] | None,
    str | None,
]


async def negotiate_a2a_capabilities(
    ucp_agent_header: str,
    request_base_url: str,
) -> _A2ANegotiationResult:
    """Run UCP capability negotiation from UCP-Agent header value.

    Returns (negotiated_capabilities, payment_handlers, order_webhook_url).

    Raises:
        ValueError / httpx.RequestError  -- discovery failures (JSON-RPC error)
        NegotiationFailureError          -- negotiation failures (JSON-RPC result)
    """
    profile_url = parse_ucp_agent_header(ucp_agent_header)
    platform_profile = await fetch_platform_profile(profile_url)

    # Protocol-level version validation
    ucp_block = platform_profile.get("ucp", {})
    platform_version = ucp_block.get("version")
    if not isinstance(platform_version, str):
        raise ValueError("Platform profile malformed")

    settings = get_settings()
    parsed_platform = datetime.strptime(platform_version, "%Y-%m-%d").date()
    parsed_business = datetime.strptime(settings.ucp_version, "%Y-%m-%d").date()
    if parsed_platform > parsed_business:
        raise NegotiationFailureError(
            code="VERSION_UNSUPPORTED",
            content=(
                f"Platform UCP version {platform_version} is not supported. "
                f"This business implements version {settings.ucp_version}."
            ),
        )

    business_profile = build_business_profile(request_base_url=request_base_url)
    negotiated = compute_capability_intersection(business_profile, platform_profile)
    if not negotiated:
        raise NegotiationFailureError(
            code="CAPABILITIES_INCOMPATIBLE",
            content="No compatible capabilities in intersection",
        )
    order_webhook_url = get_platform_order_webhook_url(platform_profile, negotiated)
    return negotiated, business_profile.ucp.payment_handlers, order_webhook_url


# ---------------------------------------------------------------------------
# Action Extraction Helpers (using SDK Part / DataPart types)
# ---------------------------------------------------------------------------


def extract_action(message: Message) -> tuple[str, dict[str, Any]]:
    """Extract the action name and its data payload from the first DataPart.

    Returns (action_name, data_dict_without_action_key).
    Raises ValueError when no action is found.
    """
    for part in message.parts:
        if (
            isinstance(part.root, DataPart)
            and part.root.data
            and "action" in part.root.data
        ):
            data = dict(part.root.data)
            action = data.pop("action")
            if not isinstance(action, str):
                raise ValueError("action must be a string")
            return action, data
    raise ValueError("No action found in message parts")


def extract_payment_data(
    parts: list[Part],
) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    """Extract payment instruments and risk signals from DataParts."""
    payment: dict[str, Any] | None = None
    risk_signals: dict[str, Any] | None = None
    for part in parts:
        if isinstance(part.root, DataPart) and part.root.data:
            if UCP_PAYMENT_DATA_KEY in part.root.data:
                payment = part.root.data[UCP_PAYMENT_DATA_KEY]
            if UCP_RISK_SIGNALS_KEY in part.root.data:
                risk_signals = part.root.data[UCP_RISK_SIGNALS_KEY]
    return payment, risk_signals


def _extract_ucp_discounts_payload(data: dict[str, Any]) -> dict[str, list[str]] | None:
    """Validate and normalize UCP discount extension payload."""
    raw_discounts = data.get("discounts")
    if raw_discounts is None:
        return None
    try:
        discounts = UCPDiscountsInput.model_validate(raw_discounts)
    except ValidationError as exc:
        raise ValueError(f"Invalid UCP discounts payload: {exc}") from exc
    return {"codes": discounts.codes}


def _extract_line_items(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract line-items from UCP action payloads."""
    items_raw: Any = data.get("line_items")
    if items_raw is None:
        return []
    if not isinstance(items_raw, list):
        raise ValueError("line_items must be an array")
    parsed_items: list[dict[str, Any]] = []
    for entry in cast(list[Any], items_raw):
        try:
            line_item = UCPLineItemInput.model_validate(entry)
        except ValidationError as exc:
            raise ValueError(f"Invalid UCP line_items payload: {exc}") from exc
        parsed_items.append({"id": line_item.item.id, "quantity": line_item.quantity})
    return parsed_items


# ---------------------------------------------------------------------------
# Action Handlers (delegate to checkout service)
# ---------------------------------------------------------------------------


async def handle_create(
    data: dict[str, Any],
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
    order_webhook_url: str | None = None,
) -> dict[str, Any]:
    """Handle create_checkout action."""
    items = _extract_line_items(data)
    if not items:
        raise ValueError("line_items is required for create_checkout")

    buyer = data.get("buyer")
    fulfillment_address = data.get("fulfillment_address")
    discounts = _extract_ucp_discounts_payload(data)

    acp_response = await create_checkout_session_from_data(
        db,
        items=items,
        buyer=cast(dict[str, Any] | None, buyer),
        fulfillment_address=cast(dict[str, Any] | None, fulfillment_address),
        discounts=discounts,
        protocol="ucp",
    )

    set_checkout_id_for_context(context_id, acp_response.id)
    if order_webhook_url:
        set_order_webhook_url_for_context(context_id, order_webhook_url)
    return _to_checkout_data_part(acp_response, negotiated, payment_handlers)


async def handle_update(
    data: dict[str, Any],
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    action: str = "update_checkout",
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
) -> dict[str, Any]:
    """Handle add_to_checkout, remove_from_checkout, and update_checkout."""
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    existing = get_checkout_session(db, session_id)

    if action == "add_to_checkout":
        product_id = data.get("product_id") or data.get("id")
        quantity = data.get("quantity", 1)
        if not product_id:
            raise ValueError("product_id required for add_to_checkout")

        existing_items = [
            {"id": li.item.id, "quantity": li.item.quantity}
            for li in existing.line_items
        ]
        found = False
        for item in existing_items:
            if item["id"] == product_id:
                item["quantity"] = int(item["quantity"]) + int(quantity)
                found = True
                break
        if not found:
            existing_items.append({"id": str(product_id), "quantity": int(quantity)})
        update_kwargs: dict[str, Any] = {"items": existing_items}

    elif action == "remove_from_checkout":
        product_id = data.get("product_id") or data.get("id")
        if not product_id:
            raise ValueError("product_id required for remove_from_checkout")

        items = [
            {"id": li.item.id, "quantity": li.item.quantity}
            for li in existing.line_items
            if li.item.id != product_id
        ]
        update_kwargs = {"items": items if items else None}

    else:
        items = _extract_line_items(data)
        update_kwargs = {"items": items if items else None}
        buyer = data.get("buyer")
        if buyer is not None:
            update_kwargs["buyer"] = buyer
        fulfillment_address = data.get("fulfillment_address")
        if fulfillment_address is not None:
            update_kwargs["fulfillment_address"] = fulfillment_address
        fulfillment_option_id = data.get("fulfillment_option_id")
        if fulfillment_option_id is not None:
            update_kwargs["fulfillment_option_id"] = fulfillment_option_id
        discounts = _extract_ucp_discounts_payload(data)
        if discounts is not None:
            update_kwargs["discounts"] = discounts

    acp_response = await update_checkout_session_from_data(
        db,
        session_id,
        items=cast(list[dict[str, Any]] | None, update_kwargs.get("items")),
        buyer=cast(dict[str, Any] | None, update_kwargs.get("buyer")),
        fulfillment_address=cast(
            dict[str, Any] | None, update_kwargs.get("fulfillment_address")
        ),
        fulfillment_option_id=cast(
            str | None, update_kwargs.get("fulfillment_option_id")
        ),
        discounts=cast(dict[str, list[str]] | None, update_kwargs.get("discounts")),
    )
    return _to_checkout_data_part(acp_response, negotiated, payment_handlers)


def handle_get(
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
) -> dict[str, Any]:
    """Handle get_checkout action."""
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    acp_response = get_checkout_session(db, session_id)
    return _to_checkout_data_part(acp_response, negotiated, payment_handlers)


def _resolve_payment_provider(handler_id: str) -> PaymentProviderEnum:
    """Map a UCP payment handler_id to the internal PaymentProviderEnum."""
    handler_map: dict[str, PaymentProviderEnum] = {
        "processor_tokenizer": PaymentProviderEnum.STRIPE,
    }
    provider = handler_map.get(handler_id)
    if provider is None:
        raise ValueError(f"Unsupported payment handler_id: {handler_id}")
    return provider


def _is_advertised_payment_handler(
    handler_id: str,
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None,
) -> bool:
    if payment_handlers is None:
        return False
    for versions in payment_handlers.values():
        for handler in versions:
            if handler.id == handler_id:
                return True
    return False


def _extract_customer_name(session: CheckoutSessionResponse) -> str:
    if session.buyer and session.buyer.first_name:
        return session.buyer.first_name
    return "Customer"


def _extract_order_items(session: CheckoutSessionResponse) -> list[OrderItem]:
    items: list[OrderItem] = []
    for line_item in session.line_items:
        item_name = line_item.name or line_item.item.id
        items.append({"name": item_name, "quantity": line_item.item.quantity})
    if not items:
        return [{"name": "your order", "quantity": 1}]
    return items


async def handle_complete(
    parts: list[Part],
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
    fire_background: Any | None = None,
) -> dict[str, Any]:
    """Handle complete_checkout action with payment data from DataParts.

    Per checkout-a2a.md, payment MUST be submitted as a DataPart with
    key ``a2a.ucp.checkout.payment`` containing an ``instruments`` array.
    """
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    payment, _risk_signals = extract_payment_data(parts)

    if not payment or "instruments" not in payment:
        raise ValueError(
            "Payment data required: submit a2a.ucp.checkout.payment "
            "DataPart with instruments array"
        )

    instruments_list = cast(list[Any], payment.get("instruments", []))
    if not instruments_list:
        raise ValueError("Payment instruments array must not be empty")

    instrument = cast(dict[str, Any], instruments_list[0])
    credential = cast(dict[str, Any], instrument.get("credential", {}))
    token_val: str = str(credential.get("token") or credential.get("id") or "")
    if not token_val:
        raise ValueError("Payment credential token is required")

    handler_id: str = str(
        instrument.get("handler_id") or instrument.get("handler") or ""
    )
    if not handler_id:
        raise ValueError("Payment instrument handler_id is required")
    if not _is_advertised_payment_handler(handler_id, payment_handlers):
        raise ValueError(f"Unsupported payment handler_id: {handler_id}")
    provider = _resolve_payment_provider(handler_id)

    acp_response = complete_checkout_session_from_data(
        db,
        session_id,
        payment_data={"token": token_val, "provider": provider.value},
        buyer=None,
    )
    result = _to_checkout_data_part(acp_response, negotiated, payment_handlers)

    if acp_response.order:
        result[UCP_CHECKOUT_KEY]["order"] = {
            "id": acp_response.order.id,
            "permalink_url": acp_response.order.permalink_url,
        }
        negotiated_webhook_url = get_order_webhook_url_for_context(context_id)
        fallback_webhook_url = get_settings().ucp_order_webhook_url
        webhook_url = negotiated_webhook_url or fallback_webhook_url

        if fire_background is not None:
            fire_background(
                trigger_post_purchase_flow_ucp,
                checkout_session=acp_response,
                customer_name=_extract_customer_name(acp_response),
                items=_extract_order_items(acp_response),
                language="en",
                webhook_url=webhook_url,
                negotiated=negotiated,
            )
        else:
            logger.warning(
                "UCP order %s completed without background task context; "
                "post-purchase webhook skipped",
                acp_response.order.id,
            )

    return result


def handle_cancel(
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
) -> dict[str, Any]:
    """Handle cancel_checkout action."""
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    acp_response = cancel_checkout_session(db, session_id)
    return _to_checkout_data_part(acp_response, negotiated, payment_handlers)


# ---------------------------------------------------------------------------
# Response Transformation
# ---------------------------------------------------------------------------


def _to_checkout_data_part(
    acp_response: CheckoutSessionResponse,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
) -> dict[str, Any]:
    """Convert an ACP response into a dict suitable for a DataPart."""
    ucp_response = transform_to_ucp_response(acp_response, negotiated, payment_handlers)
    checkout_dict = ucp_response.model_dump(mode="json", by_alias=True)
    return {UCP_CHECKOUT_KEY: checkout_dict}


# ---------------------------------------------------------------------------
# Action Dispatcher
# ---------------------------------------------------------------------------

SUPPORTED_ACTIONS = {
    "create_checkout",
    "add_to_checkout",
    "remove_from_checkout",
    "update_checkout",
    "get_checkout",
    "complete_checkout",
    "cancel_checkout",
}


async def dispatch_action(
    action: str,
    data: dict[str, Any],
    message: Message,
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
    order_webhook_url: str | None = None,
    fire_background: Any | None = None,
) -> dict[str, Any]:
    """Route an action string to the appropriate handler.

    Returns the DataPart dict ({UCP_CHECKOUT_KEY: ...}).
    """
    if action not in SUPPORTED_ACTIONS:
        raise ValueError(f"Unknown action: {action}")

    if action == "create_checkout":
        return await handle_create(
            data,
            context_id,
            db,
            negotiated,
            payment_handlers,
            order_webhook_url=order_webhook_url,
        )

    if action in ("add_to_checkout", "remove_from_checkout", "update_checkout"):
        return await handle_update(
            data,
            context_id,
            db,
            negotiated,
            action=action,
            payment_handlers=payment_handlers,
        )

    if action == "get_checkout":
        return handle_get(context_id, db, negotiated, payment_handlers)

    if action == "complete_checkout":
        return await handle_complete(
            message.parts,
            context_id,
            db,
            negotiated,
            payment_handlers,
            fire_background=fire_background,
        )

    # cancel_checkout
    return handle_cancel(context_id, db, negotiated, payment_handlers)

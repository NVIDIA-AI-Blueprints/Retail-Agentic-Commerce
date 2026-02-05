"""A2A transport service layer for UCP checkout operations.

Handles JSON-RPC 2.0 protocol logic, contextId-to-session mapping,
action routing, messageId idempotency, and agent card construction.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, cast

from sqlmodel import Session

from src.merchant.api.a2a_schemas import A2AMessage, A2APart
from src.merchant.api.schemas import (
    CheckoutSessionResponse,
    CreateCheckoutRequest,
    ItemInput,
    PaymentDataInput,
    PaymentProviderEnum,
    UpdateCheckoutRequest,
)
from src.merchant.api.ucp_schemas import UCPCapabilityVersion
from src.merchant.config import get_settings
from src.merchant.services.checkout import (
    SessionNotFoundError,
    cancel_checkout_session,
    complete_checkout_session,
    create_checkout_session,
    get_checkout_session,
    update_checkout_session,
)
from src.merchant.services.idempotency import get_idempotency_store
from src.merchant.services.ucp import (
    build_business_profile,
    compute_capability_intersection,
    fetch_platform_profile,
    parse_ucp_agent_header,
    transform_to_ucp_response,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# A2A UCP Constants (sourced from official spec: checkout-a2a.md)
# ---------------------------------------------------------------------------

A2A_UCP_EXTENSION_URL = "https://ucp.dev/specification/reference?v=2026-01-11"
UCP_CHECKOUT_KEY = "a2a.ucp.checkout"
UCP_PAYMENT_DATA_KEY = "a2a.ucp.checkout.payment"
UCP_RISK_SIGNALS_KEY = "a2a.ucp.checkout.risk_signals"
UCP_AGENT_HEADER = "UCP-Agent"

# ---------------------------------------------------------------------------
# JSON-RPC 2.0 Error Codes
# ---------------------------------------------------------------------------

JSONRPC_PARSE_ERROR = -32700
JSONRPC_INVALID_REQUEST = -32600
JSONRPC_METHOD_NOT_FOUND = -32601
JSONRPC_INVALID_PARAMS = -32602
JSONRPC_SESSION_NOT_FOUND = -32000
JSONRPC_INVALID_STATE = -32001
JSONRPC_DISCOVERY_FAILURE = -32002

# ---------------------------------------------------------------------------
# Context-to-Session Mapping (in-memory)
# ---------------------------------------------------------------------------

_context_sessions: dict[str, str] = {}


def get_checkout_id_for_context(context_id: str) -> str | None:
    """Look up checkout session ID for an A2A contextId."""
    return _context_sessions.get(context_id)


def set_checkout_id_for_context(context_id: str, checkout_id: str) -> None:
    """Store checkout session ID for an A2A contextId."""
    _context_sessions[context_id] = checkout_id


def clear_context_sessions() -> None:
    """Clear all context-to-session mappings (for testing)."""
    _context_sessions.clear()


# ---------------------------------------------------------------------------
# JSON-RPC Response Builders
# ---------------------------------------------------------------------------


def build_jsonrpc_error(
    request_id: Any,
    code: int,
    message: str,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a JSON-RPC 2.0 error response."""
    error: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        error["data"] = data
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "error": error,
    }


def build_jsonrpc_result(
    request_id: Any,
    context_id: str,
    parts: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build a JSON-RPC 2.0 success response wrapping an A2A Message."""
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "result": {
            "messageId": str(uuid.uuid4()),
            "contextId": context_id,
            "role": "agent",
            "kind": "message",
            "parts": parts,
        },
    }


# ---------------------------------------------------------------------------
# Idempotency via existing IdempotencyStore
# ---------------------------------------------------------------------------


def check_message_idempotency(
    message_id: str, request_body: bytes
) -> dict[str, Any] | None:
    """Return cached response for a duplicate messageId, or None."""
    store = get_idempotency_store()
    entry, _is_conflict = store.get(
        idempotency_key=f"a2a:{message_id}",
        body=request_body,
        path="/a2a",
        method="POST",
    )
    if entry is not None:
        return entry.response_body
    return None


def store_message_idempotency(
    message_id: str,
    request_body: bytes,
    response_body: dict[str, Any],
) -> None:
    """Persist a response keyed by messageId for future duplicate detection."""
    store = get_idempotency_store()
    store.store(
        idempotency_key=f"a2a:{message_id}",
        body=request_body,
        path="/a2a",
        method="POST",
        response_status=200,
        response_body=response_body,
    )


# ---------------------------------------------------------------------------
# Capability Negotiation (A2A-specific wrapper)
# ---------------------------------------------------------------------------


async def negotiate_a2a_capabilities(
    ucp_agent_header: str,
    request_base_url: str,
) -> dict[str, list[UCPCapabilityVersion]]:
    """Run UCP capability negotiation from UCP-Agent header value.

    Raises ValueError / httpx.RequestError on failure (caller maps to
    JSON-RPC error codes).
    """
    profile_url = parse_ucp_agent_header(ucp_agent_header)
    platform_profile = await fetch_platform_profile(profile_url)

    # Version validation
    ucp_block = platform_profile.get("ucp", {})
    platform_version = ucp_block.get("version")
    if not isinstance(platform_version, str):
        raise ValueError("Platform profile malformed")

    settings = get_settings()
    parsed_platform = datetime.strptime(platform_version, "%Y-%m-%d").date()
    parsed_business = datetime.strptime(settings.ucp_version, "%Y-%m-%d").date()
    if parsed_platform > parsed_business:
        raise ValueError("Platform profile version unsupported")

    business_profile = build_business_profile(request_base_url=request_base_url)
    negotiated = compute_capability_intersection(business_profile, platform_profile)
    if not negotiated:
        raise ValueError("Platform does not support checkout capability")
    return negotiated


# ---------------------------------------------------------------------------
# Action Extraction Helpers
# ---------------------------------------------------------------------------


def extract_action(message: A2AMessage) -> tuple[str, dict[str, Any]]:
    """Extract the action name and its data payload from the first DataPart.

    Returns (action_name, data_dict_without_action_key).
    Raises ValueError when no action is found.
    """
    for part in message.parts:
        if part.data and "action" in part.data:
            data = dict(part.data)
            action = data.pop("action")
            if not isinstance(action, str):
                raise ValueError("action must be a string")
            return action, data
    raise ValueError("No action found in message parts")


def extract_payment_data(
    parts: list[A2APart],
) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    """Extract payment instruments and risk signals from DataParts."""
    payment: dict[str, Any] | None = None
    risk_signals: dict[str, Any] | None = None
    for part in parts:
        if part.data:
            if UCP_PAYMENT_DATA_KEY in part.data:
                payment = part.data[UCP_PAYMENT_DATA_KEY]
            if UCP_RISK_SIGNALS_KEY in part.data:
                risk_signals = part.data[UCP_RISK_SIGNALS_KEY]
    return payment, risk_signals


# ---------------------------------------------------------------------------
# Action Handlers (delegate to Phase 2 checkout service)
# ---------------------------------------------------------------------------


async def handle_create(
    data: dict[str, Any],
    _context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, Any]:
    """Handle create_checkout action."""
    items_raw: Any = data.get("line_items") or data.get("items") or []
    items: list[ItemInput] = []
    if isinstance(items_raw, list):
        typed_list = cast(list[Any], items_raw)
        for entry in typed_list:
            ri = cast(dict[str, Any], entry)
            pid: str = str(ri.get("product_id") or ri.get("id", ""))
            qty: int = int(ri.get("quantity", 1))
            items.append(ItemInput(id=pid, quantity=qty))
    if not items:
        # Single-item shorthand: product_id + quantity at top level
        product_id = data.get("product_id")
        if product_id:
            items = [
                ItemInput(id=str(product_id), quantity=int(data.get("quantity", 1)))
            ]

    if not items:
        raise ValueError("No items provided for create_checkout")

    request = CreateCheckoutRequest(items=items)
    acp_response = await create_checkout_session(db, request, protocol="ucp")

    set_checkout_id_for_context(_context_id, acp_response.id)
    return _to_checkout_data_part(acp_response, negotiated)


async def handle_update(
    data: dict[str, Any],
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
    action: str = "update_checkout",
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
            ItemInput(id=li.item.id, quantity=li.item.quantity)
            for li in existing.line_items
        ]
        found = False
        for item in existing_items:
            if item.id == product_id:
                item.quantity += quantity
                found = True
                break
        if not found:
            existing_items.append(ItemInput(id=product_id, quantity=quantity))

        request = UpdateCheckoutRequest(items=existing_items)

    elif action == "remove_from_checkout":
        product_id = data.get("product_id") or data.get("id")
        if not product_id:
            raise ValueError("product_id required for remove_from_checkout")

        items = [
            ItemInput(id=li.item.id, quantity=li.item.quantity)
            for li in existing.line_items
            if li.item.id != product_id
        ]
        request = UpdateCheckoutRequest(items=items if items else None)

    else:
        raw_items: Any = data.get("line_items") or data.get("items") or []
        items: list[ItemInput] = []
        if isinstance(raw_items, list):
            typed_items = cast(list[Any], raw_items)
            for entry in typed_items:
                ri = cast(dict[str, Any], entry)
                pid = str(ri.get("product_id") or ri.get("id", ""))
                qty = int(ri.get("quantity", 1))
                items.append(ItemInput(id=pid, quantity=qty))
        request = UpdateCheckoutRequest(items=items if items else None)

    acp_response = await update_checkout_session(db, session_id, request)
    return _to_checkout_data_part(acp_response, negotiated)


def handle_get(
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, Any]:
    """Handle get_checkout action."""
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    acp_response = get_checkout_session(db, session_id)
    return _to_checkout_data_part(acp_response, negotiated)


def _resolve_payment_provider(handler_id: str) -> PaymentProviderEnum:
    """Map a UCP payment handler_id to the internal PaymentProviderEnum.

    The business advertises payment handlers in the UCP profile (e.g.,
    ``com.example.processor_tokenizer``).  The platform submits a
    ``handler_id`` referencing one of those handlers.  This function maps
    that handler_id to the internal provider enum used by the checkout
    service.

    Falls back to STRIPE for this reference implementation since it is
    the only PSP currently configured.
    """
    handler_map: dict[str, PaymentProviderEnum] = {
        "processor_tokenizer": PaymentProviderEnum.STRIPE,
    }
    return handler_map.get(handler_id, PaymentProviderEnum.STRIPE)


def handle_complete(
    parts: list[A2APart],
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
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
    token_val: str = str(credential.get("token", ""))
    if not token_val:
        raise ValueError("Payment credential token is required")

    handler_id: str = str(instrument.get("handler_id", ""))
    provider = _resolve_payment_provider(handler_id)

    payment_data = PaymentDataInput(token=token_val, provider=provider)

    acp_response = complete_checkout_session(db, session_id, payment_data, buyer=None)
    result = _to_checkout_data_part(acp_response, negotiated)

    if acp_response.order:
        result[UCP_CHECKOUT_KEY]["order"] = {
            "id": acp_response.order.id,
            "permalink_url": acp_response.order.permalink_url,
        }

    return result


def handle_cancel(
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, Any]:
    """Handle cancel_checkout action."""
    session_id = get_checkout_id_for_context(context_id)
    if not session_id:
        raise SessionNotFoundError(session_id="unknown")

    acp_response = cancel_checkout_session(db, session_id)
    return _to_checkout_data_part(acp_response, negotiated)


# ---------------------------------------------------------------------------
# Response Transformation
# ---------------------------------------------------------------------------


def _to_checkout_data_part(
    acp_response: CheckoutSessionResponse,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, Any]:
    """Convert an ACP response into a dict suitable for a DataPart."""
    ucp_response = transform_to_ucp_response(acp_response, negotiated)
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
    message: A2AMessage,
    context_id: str,
    db: Session,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, Any]:
    """Route an action string to the appropriate handler.

    Returns the DataPart dict ({UCP_CHECKOUT_KEY: ...}).
    """
    if action not in SUPPORTED_ACTIONS:
        raise ValueError(f"Unknown action: {action}")

    if action == "create_checkout":
        return await handle_create(data, context_id, db, negotiated)

    if action in ("add_to_checkout", "remove_from_checkout", "update_checkout"):
        return await handle_update(data, context_id, db, negotiated, action=action)

    if action == "get_checkout":
        return handle_get(context_id, db, negotiated)

    if action == "complete_checkout":
        return handle_complete(message.parts, context_id, db, negotiated)

    # cancel_checkout
    return handle_cancel(context_id, db, negotiated)


# ---------------------------------------------------------------------------
# Agent Card Builder
# ---------------------------------------------------------------------------


def _build_agent_card_capabilities(
    base_url: str,
) -> dict[str, list[dict[str, Any]]]:
    """Derive Agent Card capabilities from the business profile.

    This ensures the Agent Card and ``/.well-known/ucp`` discovery
    advertise the same capabilities from a single source of truth
    (``build_business_profile``).  The format is converted from the
    Pydantic ``UCPCapabilityVersion`` models to the map-keyed dict
    form required by the A2A Agent Card spec.
    """
    profile = build_business_profile(request_base_url=base_url)
    caps: dict[str, list[dict[str, Any]]] = {}
    for cap_name, versions in profile.ucp.capabilities.items():
        cap_entries: list[dict[str, Any]] = []
        for ver in versions:
            entry: dict[str, Any] = {"version": ver.version}
            if ver.extends:
                entry["extends"] = ver.extends
            cap_entries.append(entry)
        caps[cap_name] = cap_entries
    return caps


def build_agent_card(base_url: str) -> dict[str, Any]:
    """Build the A2A Agent Card dynamically from configuration.

    Capabilities are derived from ``build_business_profile()`` so they
    stay in sync with the UCP discovery endpoint.
    """
    return {
        "name": "Agentic Commerce Merchant Agent",
        "description": "UCP-compliant merchant checkout agent",
        "protocolVersion": "0.3.0",
        "url": f"{base_url}/a2a",
        "preferredTransport": "JSONRPC",
        "version": "1.0.0",
        "provider": {
            "organization": "Agentic Commerce",
            "url": base_url,
        },
        "capabilities": {
            "extensions": [
                {
                    "uri": A2A_UCP_EXTENSION_URL,
                    "description": "Business agent supporting UCP",
                    "params": {
                        "capabilities": _build_agent_card_capabilities(base_url),
                    },
                }
            ],
            "streaming": False,
        },
        "defaultInputModes": ["text", "text/plain", "application/json"],
        "defaultOutputModes": ["text", "text/plain", "application/json"],
        "skills": [
            {
                "id": "checkout",
                "name": "Checkout",
                "description": (
                    "Manage checkout sessions - add items, update, complete, or cancel"
                ),
                "tags": ["shopping", "checkout", "ucp"],
            }
        ],
    }

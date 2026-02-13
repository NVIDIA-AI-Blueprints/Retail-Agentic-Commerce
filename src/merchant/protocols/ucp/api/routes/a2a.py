"""A2A (Agent-to-Agent) JSON-RPC 2.0 transport endpoint for UCP checkout.

Implements the checkout-a2a.md binding specification. All UCP checkout
operations are exposed via the ``message/send`` JSON-RPC method with
structured DataPart actions.
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, cast

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session

from src.merchant.api.dependencies import verify_api_key
from src.merchant.config import get_settings
from src.merchant.db.database import get_session
from src.merchant.domain.checkout.service import (
    InvalidStateTransitionError,
    ProductNotFoundError,
    SessionNotFoundError,
)
from src.merchant.protocols.ucp.api.schemas.a2a import A2AMessage
from src.merchant.protocols.ucp.services.a2a_transport import (
    A2A_UCP_EXTENSION_URL,
    JSONRPC_DISCOVERY_FAILURE,
    JSONRPC_INVALID_PARAMS,
    JSONRPC_INVALID_REQUEST,
    JSONRPC_INVALID_STATE,
    JSONRPC_METHOD_NOT_FOUND,
    JSONRPC_PARSE_ERROR,
    JSONRPC_SESSION_NOT_FOUND,
    UCP_AGENT_HEADER,
    UCP_CHECKOUT_KEY,
    build_jsonrpc_error,
    build_jsonrpc_result,
    check_message_idempotency,
    dispatch_action,
    extract_action,
    negotiate_a2a_capabilities,
    store_message_idempotency,
)
from src.merchant.protocols.ucp.services.negotiation import NegotiationFailureError

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/a2a",
    tags=["ucp-a2a"],
    dependencies=[Depends(verify_api_key)],
)


@router.post(
    "",
    summary="A2A JSON-RPC 2.0 Endpoint",
    description="Handles UCP checkout operations via A2A message/send.",
)
async def handle_a2a_request(
    http_request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
) -> JSONResponse:
    """Process an A2A JSON-RPC 2.0 request.

    Steps:
    1. Parse JSON body
    2. Validate JSON-RPC envelope
    3. Validate method is ``message/send``
    4. Extract and validate required headers
    5. Check messageId idempotency
    6. Route action to checkout handler
    7. Store idempotency entry
    8. Return JSON-RPC result with checkout DataPart
    """
    # ---- 1. Parse raw JSON body ----
    raw_body = await http_request.body()
    try:
        body = json.loads(raw_body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JSONResponse(
            build_jsonrpc_error(None, JSONRPC_PARSE_ERROR, "Parse error"),
        )

    if not isinstance(body, dict):
        return JSONResponse(
            build_jsonrpc_error(None, JSONRPC_PARSE_ERROR, "Parse error"),
        )

    body_dict: dict[str, Any] = cast(dict[str, Any], body)
    request_id: Any = body_dict.get("id")

    # ---- 2. Validate JSON-RPC envelope ----
    if (
        body_dict.get("jsonrpc") != "2.0"
        or "method" not in body_dict
        or "id" not in body_dict
    ):
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_REQUEST,
                "Invalid Request: missing jsonrpc, method, or id",
            ),
        )

    # ---- 3. Validate method ----
    method_name = str(body_dict["method"])
    if method_name != "message/send":
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_METHOD_NOT_FOUND,
                f"Method not found: {method_name}",
            ),
        )

    # ---- 4. Extract and validate required headers ----
    ucp_agent_value = http_request.headers.get(UCP_AGENT_HEADER)
    if not ucp_agent_value:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                "Invalid params",
                {"detail": f"Missing required header: {UCP_AGENT_HEADER}"},
            ),
        )

    x_a2a_ext = http_request.headers.get("X-A2A-Extensions")
    if not x_a2a_ext:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                "Invalid params",
                {"detail": "Missing required header: X-A2A-Extensions"},
            ),
        )

    if A2A_UCP_EXTENSION_URL not in x_a2a_ext:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                "Invalid params",
                {"detail": "X-A2A-Extensions must contain UCP extension URI"},
            ),
        )

    # ---- 5. Parse message from params ----
    params_val: Any = body_dict.get("params", {})
    params = cast(dict[str, Any], params_val) if isinstance(params_val, dict) else {}
    message_raw: Any = params.get("message")
    if not isinstance(message_raw, dict):
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                "Invalid params: missing message object",
            ),
        )

    try:
        message = A2AMessage.model_validate(message_raw)
    except Exception:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                "Invalid params: malformed message",
            ),
        )

    # ---- 6. Check idempotency ----
    cached = check_message_idempotency(message.message_id, raw_body)
    if cached is not None:
        logger.info("A2A idempotency hit for messageId=%s", message.message_id)
        return JSONResponse(cached)

    # ---- 7. Resolve contextId ----
    context_id = message.context_id or str(uuid.uuid4())

    # ---- 8. Negotiate capabilities ----
    base_url = str(http_request.base_url).rstrip("/")
    try:
        (
            negotiated,
            payment_handlers,
            order_webhook_url,
        ) = await negotiate_a2a_capabilities(ucp_agent_value, base_url)
    except NegotiationFailureError as exc:
        # Per spec: negotiation failure → JSON-RPC result, not error
        settings = get_settings()
        failure_body: dict[str, Any] = {
            "ucp": {"version": settings.ucp_version, "capabilities": {}},
            "messages": [
                {
                    "type": "error",
                    "code": exc.code,
                    "content": exc.content,
                    "severity": "requires_buyer_input",
                }
            ],
        }
        if settings.ucp_continue_url:
            failure_body["continue_url"] = settings.ucp_continue_url
        result = build_jsonrpc_result(
            request_id=request_id,
            context_id=context_id,
            parts=[{"kind": "data", "data": {UCP_CHECKOUT_KEY: failure_body}}],
        )
        return JSONResponse(result)
    except ValueError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_DISCOVERY_FAILURE,
                str(exc),
            ),
        )
    except httpx.RequestError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_DISCOVERY_FAILURE,
                f"Platform profile unreachable: {exc}",
            ),
        )

    # ---- 9. Extract and dispatch action ----
    try:
        action, action_data = extract_action(message)
    except ValueError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                f"Invalid params: {exc}",
            ),
        )

    try:
        data_part = await dispatch_action(
            action=action,
            data=action_data,
            message=message,
            context_id=context_id,
            db=db,
            negotiated=negotiated,
            payment_handlers=payment_handlers,
            order_webhook_url=order_webhook_url,
            background_tasks=background_tasks,
        )
    except SessionNotFoundError:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_SESSION_NOT_FOUND,
                "Checkout session not found for this context",
            ),
        )
    except ProductNotFoundError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                exc.message,
            ),
        )
    except InvalidStateTransitionError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_STATE,
                exc.message,
            ),
        )
    except ValueError as exc:
        return JSONResponse(
            build_jsonrpc_error(
                request_id,
                JSONRPC_INVALID_PARAMS,
                str(exc),
            ),
        )

    # ---- 10. Build success response ----
    result = build_jsonrpc_result(
        request_id=request_id,
        context_id=context_id,
        parts=[{"kind": "data", "data": data_part}],
    )

    # ---- 11. Store idempotency ----
    store_message_idempotency(message.message_id, raw_body, result)

    return JSONResponse(result)

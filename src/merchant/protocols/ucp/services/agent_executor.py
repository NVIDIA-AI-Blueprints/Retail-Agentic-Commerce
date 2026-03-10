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

"""A2A Agent Executor for UCP checkout operations.

Implements the SDK AgentExecutor ABC, encapsulating all UCP checkout domain
logic: header validation, idempotency, capability negotiation, action
dispatch, and response building.  The SDK's DefaultRequestHandler +
JSONRPCHandler handle JSON-RPC parsing, error codes, and response wrapping.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

import httpx
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentExtension,
    AgentProvider,
    AgentSkill,
    DataPart,
    InvalidParamsError,
    Message,
    Part,
    Role,
    UnsupportedOperationError,
)
from a2a.utils.errors import ServerError
from sqlmodel import Session

from src.merchant.config import get_settings
from src.merchant.db import get_engine
from src.merchant.domain.checkout.service import (
    InvalidStateTransitionError,
    ProductNotFoundError,
    SessionNotFoundError,
)
from src.merchant.protocols.ucp.services.a2a_transport import (
    A2A_UCP_EXTENSION_URL,
    UCP_AGENT_HEADER,
    UCP_CHECKOUT_KEY,
    dispatch_action,
    extract_action,
    negotiate_a2a_capabilities,
)
from src.merchant.protocols.ucp.services.negotiation import NegotiationFailureError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory message-level idempotency cache
# ---------------------------------------------------------------------------

_idempotency_cache: dict[str, Message] = {}


def check_idempotency(message_id: str) -> Message | None:
    """Return cached response Message for a duplicate messageId, or None."""
    return _idempotency_cache.get(message_id)


def store_idempotency(message_id: str, response: Message) -> None:
    """Persist a response Message keyed by messageId."""
    _idempotency_cache[message_id] = response


def clear_idempotency_cache() -> None:
    """Clear the idempotency cache (for testing)."""
    _idempotency_cache.clear()


# ---------------------------------------------------------------------------
# Header validation errors
# ---------------------------------------------------------------------------


class UcpHeaderError(Exception):
    """Raised when a required UCP header is missing or invalid."""

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


# ---------------------------------------------------------------------------
# Agent Executor — domain logic for UCP checkout over A2A
# ---------------------------------------------------------------------------


class UCPCheckoutAgentExecutor(AgentExecutor):
    """Processes A2A ``message/send`` requests for UCP checkout operations.

    Subclasses the SDK ``AgentExecutor`` ABC so the full SDK transport stack
    (DefaultRequestHandler → JSONRPCHandler → A2AStarletteApplication) handles
    JSON-RPC parsing, error codes, and response wrapping.
    """

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        """Execute UCP checkout logic for a single message/send request."""
        message = context.message
        if message is None:
            raise ServerError(error=InvalidParamsError(message="No message in request"))

        # ---- 1. Check idempotency by messageId ----
        cached = check_idempotency(message.message_id)
        if cached is not None:
            logger.info("A2A idempotency hit for messageId=%s", message.message_id)
            await event_queue.enqueue_event(cached)
            return

        # ---- 2. Extract headers from call context ----
        headers: dict[str, str] = {}
        if context.call_context:
            headers = context.call_context.state.get("headers", {})

        settings = get_settings()
        base_url = settings.ucp_base_url or (
            f"http://{headers.get('host', 'localhost:8000')}"
        )

        # ---- 3. Validate required UCP headers ----
        try:
            _validate_ucp_headers(headers)
        except UcpHeaderError as exc:
            raise ServerError(
                error=InvalidParamsError(
                    message="Invalid params",
                    data={"detail": exc.detail},
                )
            ) from exc

        # ---- 4. Resolve contextId ----
        context_id = context.context_id or message.context_id or str(uuid.uuid4())

        # ---- 5. Negotiate capabilities ----
        ucp_agent_value = (
            headers.get("ucp-agent") or headers.get(UCP_AGENT_HEADER) or ""
        )
        try:
            (
                negotiated,
                payment_handlers,
                order_webhook_url,
            ) = await negotiate_a2a_capabilities(ucp_agent_value, base_url)
        except NegotiationFailureError as exc:
            failure_msg = build_negotiation_failure_message(context_id, exc)
            await event_queue.enqueue_event(failure_msg)
            return
        except (ValueError, httpx.RequestError) as exc:
            raise ServerError(error=InvalidParamsError(message=str(exc))) from exc

        # ---- 6. Extract and dispatch action ----
        with Session(get_engine()) as db:
            try:
                action, action_data = extract_action(message)
                data_part = await dispatch_action(
                    action=action,
                    data=action_data,
                    message=message,
                    context_id=context_id,
                    db=db,
                    negotiated=negotiated,
                    payment_handlers=payment_handlers,
                    order_webhook_url=order_webhook_url,
                    fire_background=_fire_background,
                )
            except SessionNotFoundError as exc:
                raise ServerError(
                    error=InvalidParamsError(
                        message="Checkout session not found for this context"
                    )
                ) from exc
            except ProductNotFoundError as exc:
                raise ServerError(
                    error=InvalidParamsError(message=exc.message)
                ) from exc
            except InvalidStateTransitionError as exc:
                raise ServerError(
                    error=InvalidParamsError(message=exc.message)
                ) from exc
            except ValueError as exc:
                raise ServerError(error=InvalidParamsError(message=str(exc))) from exc

        # ---- 7. Build response Message, enqueue, store idempotency ----
        response_message = _build_response_message(context_id, data_part)
        store_idempotency(message.message_id, response_message)
        await event_queue.enqueue_event(response_message)

    async def cancel(
        self,
        context: RequestContext,  # noqa: ARG002
        event_queue: EventQueue,  # noqa: ARG002
    ) -> None:
        """Cancel is not supported for UCP checkout."""
        raise ServerError(error=UnsupportedOperationError())


# ---------------------------------------------------------------------------
# Header validation helper
# ---------------------------------------------------------------------------


def _validate_ucp_headers(headers: dict[str, str]) -> None:
    """Validate required UCP headers; raise UcpHeaderError on failure."""
    ucp_agent_value = headers.get("ucp-agent") or headers.get(UCP_AGENT_HEADER)
    if not ucp_agent_value:
        raise UcpHeaderError(f"Missing required header: {UCP_AGENT_HEADER}")

    x_a2a_ext = headers.get("x-a2a-extensions") or headers.get("X-A2A-Extensions")
    if not x_a2a_ext:
        raise UcpHeaderError("Missing required header: X-A2A-Extensions")

    if A2A_UCP_EXTENSION_URL not in x_a2a_ext:
        raise UcpHeaderError("X-A2A-Extensions must contain UCP extension URI")


# ---------------------------------------------------------------------------
# Background task adapter
# ---------------------------------------------------------------------------


def _fire_background(func: Any, *args: Any, **kwargs: Any) -> None:
    """Adapter matching BackgroundTasks.add_task signature for asyncio."""
    asyncio.create_task(func(*args, **kwargs))


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------


def _build_response_message(context_id: str, data_part: dict[str, Any]) -> Message:
    """Wrap a checkout DataPart dict in an SDK Message."""
    return Message(
        role=Role.agent,
        message_id=str(uuid.uuid4()),
        context_id=context_id,
        parts=[Part(root=DataPart(data=data_part))],
    )


def build_negotiation_failure_message(
    context_id: str,
    exc: NegotiationFailureError,
) -> Message:
    """Build a success-response Message for a negotiation failure.

    Per the UCP spec, negotiation failure is returned as a JSON-RPC *result*
    (not an error) containing a DataPart with the failure information.
    """
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
    return _build_response_message(context_id, {UCP_CHECKOUT_KEY: failure_body})


# ---------------------------------------------------------------------------
# Agent Card builder (SDK AgentCard model)
# ---------------------------------------------------------------------------


def _build_agent_card_capabilities(
    base_url: str,
) -> dict[str, list[dict[str, Any]]]:
    """Derive Agent Card capabilities from the business profile."""
    from src.merchant.protocols.ucp.services.negotiation import (
        build_business_profile,
    )

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


def build_sdk_agent_card(base_url: str) -> AgentCard:
    """Build an A2A Agent Card using the SDK model.

    Capabilities are derived from ``build_business_profile()`` so they stay
    in sync with the UCP discovery endpoint.
    """
    return AgentCard(
        name="Agentic Commerce Merchant Agent",
        description="UCP-compliant merchant checkout agent",
        url=f"{base_url}/a2a",
        version="1.0.0",
        protocol_version="0.3.0",
        preferred_transport="JSONRPC",
        provider=AgentProvider(
            organization="Agentic Commerce",
            url=base_url,
        ),
        capabilities=AgentCapabilities(
            streaming=False,
            extensions=[
                AgentExtension(
                    uri=A2A_UCP_EXTENSION_URL,
                    description="Business agent supporting UCP",
                    params={
                        "capabilities": _build_agent_card_capabilities(base_url),
                    },
                )
            ],
        ),
        default_input_modes=["text", "text/plain", "application/json"],
        default_output_modes=["text", "text/plain", "application/json"],
        skills=[
            AgentSkill(
                id="checkout",
                name="Checkout",
                description=(
                    "Manage checkout sessions - add items, update, complete, or cancel"
                ),
                tags=["shopping", "checkout", "ucp"],
            )
        ],
    )

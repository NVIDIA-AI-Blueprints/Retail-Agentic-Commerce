"""SSE event stream utilities and routes for Protocol Inspector."""

from __future__ import annotations

import asyncio
import contextlib
import json
from collections import deque
from collections.abc import AsyncGenerator
from datetime import datetime
from typing import Any

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(tags=["events"])

# Event queue for SSE subscribers (simple in-memory, use Redis for production)
checkout_events: deque[dict[str, Any]] = deque(maxlen=100)
event_subscribers: list[asyncio.Queue[dict[str, Any]]] = []


def emit_checkout_event(
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
    """Emit a checkout event to all SSE subscribers."""
    event = {
        "id": event_id or f"evt_{datetime.now().timestamp()}",
        "type": event_type,
        "endpoint": endpoint,
        "method": method,
        "status": status,
        "summary": summary,
        "statusCode": status_code,
        "sessionId": session_id,
        "orderId": order_id,
        "timestamp": datetime.now().isoformat(),
    }
    checkout_events.append(event)

    for queue in event_subscribers:
        with contextlib.suppress(asyncio.QueueFull):
            queue.put_nowait(event)


def emit_agent_activity_event(
    agent_type: str,
    product_id: str,
    product_name: str,
    action: str,
    discount_amount: int,
    reason_codes: list[str],
    reasoning: str,
    stock_count: int = 0,
    base_price: int = 0,
    signals: dict[str, str] | None = None,
) -> None:
    """Emit a promotion agent activity event to all SSE subscribers."""
    event = {
        "id": f"agent_{datetime.now().timestamp()}",
        "agentType": agent_type,
        "productId": product_id,
        "productName": product_name,
        "action": action,
        "discountAmount": discount_amount,
        "reasonCodes": reason_codes,
        "reasoning": reasoning,
        "stockCount": stock_count,
        "basePrice": base_price,
        "timestamp": datetime.now().isoformat(),
    }
    if signals is not None:
        event["signals"] = signals
    checkout_events.append(event)

    for queue in event_subscribers:
        with contextlib.suppress(asyncio.QueueFull):
            queue.put_nowait(event)


def emit_recommendation_pending_event(
    *,
    event_id: str,
    product_id: str,
    product_name: str,
    cart_items: list[dict[str, Any]],
) -> None:
    """Emit a *pending* recommendation event so the Agent Activity Panel
    immediately shows a "Generating" card while the ARAG agent works.
    """
    event: dict[str, Any] = {
        "id": event_id,
        "agentType": "recommendation",
        "status": "pending",
        "productId": product_id,
        "productName": product_name,
        "cartItems": cart_items,
        "timestamp": datetime.now().isoformat(),
    }
    checkout_events.append(event)
    for queue in event_subscribers:
        with contextlib.suppress(asyncio.QueueFull):
            queue.put_nowait(event)


def emit_recommendation_complete_event(
    *,
    event_id: str,
    product_id: str,
    product_name: str,
    cart_items: list[dict[str, Any]],
    recommendations: list[dict[str, Any]],
    user_intent: str | None = None,
    pipeline_trace: dict[str, Any] | None = None,
    recommendation_request_id: str | None = None,
    latency_ms: int = 0,
    error: str | None = None,
) -> None:
    """Emit a *completed* recommendation event that updates the pending card
    with the final results (or error).
    """
    status = "error" if error else "success"
    event: dict[str, Any] = {
        "id": event_id,
        "agentType": "recommendation",
        "status": status,
        "productId": product_id,
        "productName": product_name,
        "cartItems": cart_items,
        "recommendations": recommendations,
        "recommendationRequestId": recommendation_request_id,
        "latencyMs": latency_ms,
        "timestamp": datetime.now().isoformat(),
    }
    if user_intent is not None:
        event["userIntent"] = user_intent
    if pipeline_trace is not None:
        event["pipelineTrace"] = pipeline_trace
    if error is not None:
        event["error"] = error

    checkout_events.append(event)
    for queue in event_subscribers:
        with contextlib.suppress(asyncio.QueueFull):
            queue.put_nowait(event)


async def event_generator() -> AsyncGenerator[dict[str, Any], None]:
    """Yield checkout and agent events as SSE frames."""
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=50)
    event_subscribers.append(queue)
    try:
        while True:
            event = await queue.get()
            event_type = "agent_activity" if "agentType" in event else "checkout"
            yield {"event": event_type, "data": json.dumps(event)}
    finally:
        event_subscribers.remove(queue)


@router.get("/events")
async def checkout_events_stream() -> EventSourceResponse:
    """SSE endpoint for checkout events."""
    return EventSourceResponse(event_generator())


@router.delete("/events")
async def clear_checkout_events() -> dict[str, str]:
    """Clear all stored checkout events."""
    checkout_events.clear()
    return {"message": "Checkout events cleared"}

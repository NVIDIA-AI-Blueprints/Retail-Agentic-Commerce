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
) -> None:
    """Emit an agent activity event to all SSE subscribers."""
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

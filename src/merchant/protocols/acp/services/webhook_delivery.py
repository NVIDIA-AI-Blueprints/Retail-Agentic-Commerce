"""ACP webhook delivery service for client-agent events."""

import hashlib
import hmac
import json
import logging
from datetime import UTC, datetime
from typing import Any, TypedDict

import httpx

from src.merchant.config import get_settings

logger = logging.getLogger(__name__)


class OrderEventData(TypedDict):
    """Standard ACP order event data."""

    type: str
    order_id: str
    checkout_session_id: str
    permalink_url: str
    status: str
    refunds: list[dict[str, Any]]


class ShippingUpdateData(TypedDict, total=False):
    """ACP shipping update event data."""

    type: str
    checkout_session_id: str
    order_id: str
    status: str
    language: str
    subject: str
    message: str
    tracking_url: str


class WebhookEvent(TypedDict):
    """ACP webhook event structure."""

    type: str
    data: OrderEventData | ShippingUpdateData


def generate_webhook_signature(payload: str, timestamp: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for ACP webhook payload."""
    signed_payload = f"{timestamp}.{payload}"
    return hmac.new(
        secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


async def send_webhook(
    event: WebhookEvent,
    webhook_url: str | None = None,
    webhook_secret: str | None = None,
    timeout: float = 10.0,
) -> bool:
    """Send a signed ACP webhook event to the client agent."""
    settings = get_settings()
    url = webhook_url or settings.webhook_url
    secret = webhook_secret or settings.webhook_secret

    if not url:
        logger.warning("Webhook URL not configured, skipping webhook delivery")
        return False

    if not secret:
        logger.warning("Webhook secret not configured, skipping webhook delivery")
        return False

    payload = json.dumps(event)
    timestamp = datetime.now(UTC).isoformat()
    signature = generate_webhook_signature(payload, timestamp, secret)
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Timestamp": timestamp,
        "X-Webhook-Signature": signature,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, content=payload, headers=headers)

        if response.status_code == 200:
            logger.info(
                "Webhook delivered successfully to %s (event: %s)",
                url,
                event["type"],
            )
            return True
        logger.warning(
            "Webhook delivery failed: %s %s (status: %d)",
            url,
            event["type"],
            response.status_code,
        )
        return False
    except httpx.TimeoutException:
        logger.warning("Webhook delivery timed out: %s", url)
        return False
    except httpx.RequestError as exc:
        logger.warning("Webhook delivery error: %s - %s", url, str(exc))
        return False


async def send_shipping_update_webhook(
    checkout_session_id: str,
    order_id: str,
    status: str,
    language: str,
    subject: str,
    message: str,
    tracking_url: str | None = None,
) -> bool:
    """Send an ACP shipping update webhook event."""
    event: WebhookEvent = {
        "type": "shipping_update",
        "data": {
            "type": "shipping_update",
            "checkout_session_id": checkout_session_id,
            "order_id": order_id,
            "status": status,
            "language": language,
            "subject": subject,
            "message": message,
        },
    }
    if tracking_url:
        event["data"]["tracking_url"] = tracking_url  # type: ignore[typeddict-item]
    return await send_webhook(event)


async def send_order_created_webhook(
    checkout_session_id: str,
    order_id: str,
    permalink_url: str,
) -> bool:
    """Send an ACP order_created webhook event."""
    event: WebhookEvent = {
        "type": "order_created",
        "data": {
            "type": "order",
            "order_id": order_id,
            "checkout_session_id": checkout_session_id,
            "permalink_url": permalink_url,
            "status": "created",
            "refunds": [],
        },
    }
    return await send_webhook(event)

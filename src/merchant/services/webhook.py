"""Webhook delivery service for sending events to client agents.

This service implements the ACP webhook delivery pattern where the merchant
sends signed webhook events to the client agent's webhook endpoint.

Architecture (per ACP spec and Feature 11):
- Merchant Backend generates message via Post-Purchase Agent
- Merchant Backend signs payload with HMAC-SHA256
- Merchant Backend POSTs to Client Agent's webhook URL
- Client Agent verifies signature and displays notification

Security:
- All webhooks are signed using HMAC-SHA256
- Signature is computed as: HMAC(secret, "timestamp.payload")
- Headers: X-Webhook-Signature, X-Webhook-Timestamp
"""

import hashlib
import hmac
import json
import logging
import time
import uuid
from base64 import urlsafe_b64encode
from datetime import UTC, datetime
from typing import Any, TypedDict
from urllib.parse import urlparse

import httpx

from src.merchant.config import get_settings

logger = logging.getLogger(__name__)


# =============================================================================
# Webhook Event Types (per ACP spec)
# =============================================================================


class OrderEventData(TypedDict):
    """Standard ACP order event data."""

    type: str  # "order"
    order_id: str
    checkout_session_id: str
    permalink_url: str
    status: str  # created|confirmed|shipped|fulfilled|canceled
    refunds: list[dict[str, Any]]


class ShippingUpdateData(TypedDict, total=False):
    """Extended shipping update event data (ACP extension)."""

    type: str  # "shipping_update"
    checkout_session_id: str
    order_id: str
    status: str  # order_confirmed|order_shipped|out_for_delivery|delivered
    language: str  # en|es|fr
    subject: str
    message: str
    tracking_url: str  # Optional


class WebhookEvent(TypedDict):
    """Webhook event structure."""

    type: str  # order_created|order_updated|shipping_update
    data: OrderEventData | ShippingUpdateData


class UCPOrderWebhookEvent(TypedDict):
    """UCP order webhook envelope."""

    event_id: str
    created_time: str
    order: dict[str, Any]


# =============================================================================
# Signature Generation
# =============================================================================


def generate_webhook_signature(payload: str, timestamp: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for webhook payload.

    Args:
        payload: JSON string payload
        timestamp: ISO 8601 timestamp
        secret: Webhook secret key

    Returns:
        Hex-encoded HMAC-SHA256 signature
    """
    signed_payload = f"{timestamp}.{payload}"
    signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return signature


def _base64url_encode(raw: bytes) -> str:
    return urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _base64url_encode_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return _base64url_encode(encoded)


def generate_ucp_request_signature(
    payload: str,
    webhook_url: str,
    secret: str,
    ttl_seconds: int = 300,
) -> str:
    """Generate Request-Signature header value for UCP webhooks.

    This implementation emits a compact JWT-like token carrying the request
    integrity claims referenced by UCP webhook docs:
    iat, exp, aud, htu, htm, and body_sha256.
    """
    issued_at = int(time.time())
    body_sha256 = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    audience = urlparse(webhook_url).netloc
    claims: dict[str, Any] = {
        "iat": issued_at,
        "exp": issued_at + ttl_seconds,
        "aud": audience,
        "htu": webhook_url,
        "htm": "POST",
        "body_sha256": body_sha256,
        "nonce": str(uuid.uuid4()),
    }

    header = {"alg": "HS256", "typ": "JWT"}
    signing_input = (
        f"{_base64url_encode_json(header)}.{_base64url_encode_json(claims)}"
    )
    signature = hmac.new(
        secret.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return f"{signing_input}.{_base64url_encode(signature)}"


# =============================================================================
# Webhook Delivery
# =============================================================================


async def send_webhook(
    event: WebhookEvent,
    webhook_url: str | None = None,
    webhook_secret: str | None = None,
    timeout: float = 10.0,
) -> bool:
    """Send a signed webhook event to the client agent.

    Args:
        event: Webhook event to send
        webhook_url: Target URL (defaults to settings.webhook_url)
        webhook_secret: Secret for signing (defaults to settings.webhook_secret)
        timeout: Request timeout in seconds

    Returns:
        True if webhook was delivered successfully, False otherwise
    """
    settings = get_settings()
    url = webhook_url or settings.webhook_url
    secret = webhook_secret or settings.webhook_secret

    if not url:
        logger.warning("Webhook URL not configured, skipping webhook delivery")
        return False

    if not secret:
        logger.warning("Webhook secret not configured, skipping webhook delivery")
        return False

    # Serialize payload
    payload = json.dumps(event)
    timestamp = datetime.now(UTC).isoformat()

    # Generate signature
    signature = generate_webhook_signature(payload, timestamp, secret)

    # Prepare headers
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
        else:
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
    except httpx.RequestError as e:
        logger.warning("Webhook delivery error: %s - %s", url, str(e))
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
    """Send a shipping update webhook event.

    This is a convenience function for sending post-purchase agent messages
    to the client agent's webhook endpoint.

    Args:
        checkout_session_id: Original checkout session ID
        order_id: Order identifier
        status: Shipping status (order_confirmed, order_shipped, etc.)
        language: Message language (en, es, fr)
        subject: Message subject line
        message: Full message body
        tracking_url: Optional tracking URL

    Returns:
        True if delivered successfully, False otherwise
    """
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

    # Add optional tracking URL
    if tracking_url:
        event["data"]["tracking_url"] = tracking_url  # type: ignore[typeddict-item]

    return await send_webhook(event)


async def send_order_created_webhook(
    checkout_session_id: str,
    order_id: str,
    permalink_url: str,
) -> bool:
    """Send an order_created webhook event.

    Args:
        checkout_session_id: Checkout session ID
        order_id: Order identifier
        permalink_url: Customer-accessible order URL

    Returns:
        True if delivered successfully, False otherwise
    """
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


async def send_ucp_order_webhook(
    event: UCPOrderWebhookEvent,
    webhook_url: str | None = None,
    shared_secret: str | None = None,
    timeout: float = 10.0,
) -> bool:
    """Send a UCP order webhook event to the platform callback URL."""
    settings = get_settings()
    url = webhook_url or settings.ucp_order_webhook_url
    secret = shared_secret or settings.webhook_secret

    if not url:
        logger.warning("UCP order webhook URL not configured, skipping delivery")
        return False
    if not secret:
        logger.warning("Webhook secret not configured, skipping UCP delivery")
        return False

    payload = json.dumps(event)
    request_signature = generate_ucp_request_signature(payload, url, secret)
    headers = {
        "Content-Type": "application/json",
        "Request-Signature": request_signature,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, content=payload, headers=headers)

        if 200 <= response.status_code < 300:
            logger.info("UCP order webhook delivered to %s", url)
            return True

        logger.warning(
            "UCP order webhook delivery failed: %s (status: %d)",
            url,
            response.status_code,
        )
        return False
    except httpx.TimeoutException:
        logger.warning("UCP order webhook delivery timed out: %s", url)
        return False
    except httpx.RequestError as exc:
        logger.warning("UCP order webhook delivery error: %s - %s", url, str(exc))
        return False

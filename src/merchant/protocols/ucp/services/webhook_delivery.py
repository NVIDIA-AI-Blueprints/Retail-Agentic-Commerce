"""UCP order webhook delivery service."""

import hashlib
import hmac
import json
import logging
import time
import uuid
from base64 import urlsafe_b64encode
from typing import Any, TypedDict
from urllib.parse import urlparse

import httpx

from src.merchant.config import get_settings

logger = logging.getLogger(__name__)


class UCPOrderWebhookEvent(TypedDict):
    """UCP order webhook envelope."""

    event_id: str
    created_time: str
    order: dict[str, Any]


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
    """Generate Request-Signature header value for UCP webhooks."""
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
    signing_input = f"{_base64url_encode_json(header)}.{_base64url_encode_json(claims)}"
    signature = hmac.new(
        secret.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return f"{signing_input}.{_base64url_encode(signature)}"


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

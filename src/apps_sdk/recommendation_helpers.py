"""Recommendation and metrics helpers for Apps SDK MCP handlers."""

from __future__ import annotations

import json
import logging
import os
from typing import Any, cast

import httpx

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.schemas import CartItemInput

settings = get_apps_sdk_settings()
RECOMMENDATION_AGENT_URL = settings.recommendation_agent_url

# Merchant API URL for product lookups
MERCHANT_API_URL = os.environ.get("MERCHANT_API_URL", "http://localhost:8000")

# Keep logger namespace stable across refactor for log continuity.
logger = logging.getLogger("src.apps_sdk.main")


def search_meta() -> dict[str, Any]:
    """Metadata for search products (entry point tool)."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Searching products...",
        "openai/toolInvocation/invoked": "Products found",
        "openai/widgetAccessible": True,
    }


def cart_meta(cart_id: str) -> dict[str, Any]:
    """Metadata for cart widget."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Updating cart...",
        "openai/toolInvocation/invoked": "Cart updated",
        "openai/widgetAccessible": True,
        "openai/widgetSessionId": cart_id,
    }


def checkout_meta(success: bool) -> dict[str, Any]:
    """Metadata for checkout completion."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Processing order...",
        "openai/toolInvocation/invoked": "Order placed!" if success else "Order failed",
        "openai/widgetAccessible": True,
        "openai/closeWidget": success,
    }


def recommendations_meta() -> dict[str, Any]:
    """Metadata for recommendations tool."""
    return {
        "openai/toolInvocation/invoking": "Getting recommendations...",
        "openai/toolInvocation/invoked": "Recommendations ready",
    }


def classify_outcome_status(
    *,
    agent_type: str,
    error_message: str | None,
) -> tuple[str, str | None]:
    """Map tool-level error messages to normalized outcome statuses."""
    if not error_message:
        return "success", None

    message = error_message.lower()
    if agent_type == "search" and "no products found" in message:
        return "success", None
    if "timeout" in message:
        return "error_timeout", "timeout"
    if "unavailable" in message or "connect" in message or "agent error" in message:
        return "error_upstream", "upstream_error"
    if "validation" in message:
        return "error_validation", "validation_error"
    return "error_internal", "internal_error"


async def record_apps_sdk_outcome(
    *,
    agent_type: str,
    status: str,
    latency_ms: int,
    error_code: str | None = None,
) -> None:
    """Best-effort metrics handoff to Merchant API for dashboard aggregation."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.post(
                f"{settings.merchant_api_url}/metrics/agent-outcomes",
                headers={
                    "Authorization": f"Bearer {settings.merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "agent_type": agent_type,
                    "channel": "apps_sdk",
                    "status": status,
                    "latency_ms": max(latency_ms, 0),
                    "error_code": error_code,
                },
            )
            if response.status_code >= 400:
                logger.warning(
                    "Failed to record %s outcome (status=%d): %s",
                    agent_type,
                    response.status_code,
                    response.text,
                )
    except Exception as exc:
        logger.warning("Unable to record %s outcome: %s", agent_type, exc)


async def record_recommendation_attribution_event(
    *,
    event_type: str,
    product_id: str,
    session_id: str | None = None,
    recommendation_request_id: str | None = None,
    position: int | None = None,
    order_id: str | None = None,
    quantity: int = 1,
    revenue_cents: int = 0,
    source: str = "apps_sdk",
) -> None:
    """Best-effort recording of recommendation attribution events."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.post(
                f"{settings.merchant_api_url}/metrics/recommendation-attribution",
                headers={
                    "Authorization": f"Bearer {settings.merchant_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "event_type": event_type,
                    "product_id": product_id,
                    "session_id": session_id,
                    "recommendation_request_id": recommendation_request_id,
                    "position": position,
                    "order_id": order_id,
                    "quantity": max(quantity, 1),
                    "revenue_cents": max(revenue_cents, 0),
                    "source": source,
                },
            )
            if response.status_code >= 400:
                logger.warning(
                    "Failed to record recommendation attribution event (%s): %s",
                    event_type,
                    response.text,
                )
    except Exception as exc:
        logger.warning(
            "Unable to record recommendation attribution event (%s): %s",
            event_type,
            exc,
        )


def _parse_agent_response(raw_result: Any) -> dict[str, Any]:
    """Parse the ARAG agent response into a typed dictionary."""
    parsed: dict[str, Any] = {}

    if isinstance(raw_result, dict):
        result_dict = cast(dict[str, Any], raw_result)
        value = result_dict.get("value")
        if isinstance(value, str):
            loaded = json.loads(value)
            if isinstance(loaded, dict):
                parsed = cast(dict[str, Any], loaded)
        elif isinstance(value, dict):
            parsed = cast(dict[str, Any], value)
        elif "recommendations" in result_dict:
            parsed = result_dict
    elif isinstance(raw_result, str):
        loaded = json.loads(raw_result)
        if isinstance(loaded, dict):
            parsed = cast(dict[str, Any], loaded)

    return parsed


async def call_recommendation_agent(
    product_id: str,
    product_name: str,
    cart_items: list[CartItemInput],
) -> dict[str, Any]:
    """Call the ARAG recommendation agent at port 8004."""
    agent_cart_items = [
        {
            "product_id": product_id,
            "name": product_name,
            "category": "apparel",
            "price": 2500,  # Default price, could be passed in
        }
    ]

    for item in cart_items:
        agent_cart_items.append(
            {
                "product_id": item.product_id,
                "name": item.name,
                "category": "apparel",
                "price": item.price,
            }
        )

    payload = {
        "input_message": json.dumps(
            {
                "cart_items": agent_cart_items,
                "session_context": {
                    "browse_history": ["casual wear", "t-shirts"],
                    "price_range_viewed": [2000, 5000],
                },
            }
        )
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{RECOMMENDATION_AGENT_URL}/generate",
                json=payload,
            )
            response.raise_for_status()
            raw_result = response.json()

            parsed_result: dict[str, Any] = _parse_agent_response(raw_result)

            recommendations: list[dict[str, Any]] = list(
                parsed_result.get("recommendations", [])
            )
            enriched = await enrich_recommendations(recommendations)

            return {
                "recommendations": enriched,
                "userIntent": parsed_result.get("user_intent"),
                "pipelineTrace": parsed_result.get("pipeline_trace"),
            }
    except httpx.TimeoutException:
        logger.error("Recommendation agent timeout")
        return {"recommendations": [], "error": "Recommendation agent timeout"}
    except httpx.HTTPStatusError as e:
        logger.error(f"Recommendation agent HTTP error: {e}")
        return {
            "recommendations": [],
            "error": f"Agent error: {e.response.status_code}",
        }
    except (httpx.ConnectError, httpx.ConnectTimeout) as e:
        logger.warning(f"Recommendation agent not available: {e}")
        return {"recommendations": [], "error": "Recommendation agent unavailable"}
    except Exception as e:
        logger.error(f"Recommendation agent error: {e}")
        return {"recommendations": [], "error": str(e)}


async def enrich_recommendations(
    recommendations: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Enrich recommendations with full product details from merchant API."""
    if not recommendations:
        return recommendations

    async with httpx.AsyncClient(timeout=5.0) as client:
        for rec in recommendations:
            product_id = rec.get("product_id")
            if not product_id:
                continue

            try:
                response = await client.get(f"{MERCHANT_API_URL}/products/{product_id}")
                if response.status_code == 200:
                    product = response.json()
                    rec["price"] = product.get("base_price")
                    rec["sku"] = product.get("sku")
                    rec["image_url"] = product.get("image_url")
                    rec["stock_count"] = product.get("stock_count")
                    rec["product_name"] = product.get("name", rec.get("product_name"))
                else:
                    logger.warning(f"Product {product_id} not found in merchant API")
            except Exception as e:
                logger.warning(f"Failed to enrich product {product_id}: {e}")

    return recommendations

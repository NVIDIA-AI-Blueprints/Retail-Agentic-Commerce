# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
"""Run one functional CI request against each NAT agent."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from typing import Any, cast


def require(condition: bool, message: str) -> None:
    """Raise a functional-check error when a stable response contract is missing."""
    if not condition:
        raise RuntimeError(message)


def require_text(result: dict[str, Any], field: str, agent: str) -> str:
    """Return a required non-empty response field."""
    value = result.get(field)
    if not isinstance(value, str) or not value.strip():
        raise RuntimeError(f"{agent} returned an empty or missing {field!r}")
    return value


def require_object_list(
    result: dict[str, Any], field: str, agent: str
) -> list[dict[str, Any]]:
    """Return a required non-empty list of JSON objects."""
    value: Any = result.get(field)
    if not isinstance(value, list) or not value:
        raise RuntimeError(f"{agent} returned no {field}")

    objects: list[dict[str, Any]] = []
    for item in cast(list[Any], value):
        if not isinstance(item, dict):
            raise RuntimeError(f"{agent} returned an invalid {field} list")
        objects.append(cast(dict[str, Any], item))
    return objects


def call_agent(
    agent: str,
    port: int,
    input_message: dict[str, Any],
    timeout: int,
) -> dict[str, Any]:
    """Execute a NAT workflow and unwrap its JSON response value."""
    request = urllib.request.Request(
        f"http://{agent}-agent:{port}/generate",
        data=json.dumps({"input_message": json.dumps(input_message)}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = response.status
            raw_response = response.read().decode()
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")
        raise RuntimeError(
            f"{agent} returned HTTP {error.code}: {detail[:1000]}"
        ) from error
    except (TimeoutError, urllib.error.URLError) as error:
        reason = getattr(error, "reason", str(error))
        raise RuntimeError(f"{agent} request failed: {reason}") from error

    require(status == 200, f"{agent} returned HTTP {status}")

    try:
        envelope = json.loads(raw_response)
        value = envelope.get("value")
        result = json.loads(value) if isinstance(value, str) else value
    except (AttributeError, json.JSONDecodeError, TypeError) as error:
        raise RuntimeError(
            f"{agent} returned invalid JSON: {raw_response[:1000]}"
        ) from error

    require(
        isinstance(result, dict),
        f"{agent} response did not contain a JSON object in 'value'",
    )
    return result


def check_promotion() -> None:
    """Verify promotion classification with real business signals."""
    allowed_actions = {
        "NO_PROMO",
        "FREE_SHIPPING",
        "DISCOUNT_5_PCT",
        "DISCOUNT_10_PCT",
        "DISCOUNT_15_PCT",
    }
    result = call_agent(
        "promotion",
        8002,
        {
            "product_id": "prod_3",
            "product_name": "Graphic Tee",
            "base_price_cents": 3200,
            "stock_count": 200,
            "min_margin": 0.18,
            "lowest_competitor_price_cents": 2800,
            "signals": {
                "inventory_pressure": "high",
                "competition_position": "above_market",
                "seasonal_urgency": "off_season",
                "product_lifecycle": "growth",
                "demand_velocity": "accelerating",
            },
            "allowed_actions": sorted(allowed_actions),
        },
        timeout=60,
    )
    require(
        result.get("product_id") == "prod_3",
        "promotion returned the wrong product_id",
    )
    require(
        result.get("action") in allowed_actions,
        "promotion returned an unsupported action",
    )
    require_text(result, "reasoning", "promotion")
    print(f"promotion functional check passed: {result['action']}")


def check_post_purchase() -> None:
    """Verify shipping-message generation with real order context."""
    result = call_agent(
        "post-purchase",
        8003,
        {
            "brand_persona": {
                "company_name": "Acme T-Shirts",
                "tone": "friendly",
                "preferred_language": "en",
            },
            "order": {
                "order_id": "ci-order-001",
                "customer_name": "Jordan",
                "items": [{"name": "Classic Tee", "quantity": 1}],
                "tracking_url": "https://track.example.com/ci-order-001",
                "estimated_delivery": "2099-01-15",
            },
            "status": "order_shipped",
        },
        timeout=60,
    )
    require(
        result.get("order_id") == "ci-order-001",
        "post-purchase returned the wrong order_id",
    )
    require(
        result.get("status") == "order_shipped",
        "post-purchase returned the wrong status",
    )
    require(
        result.get("language") == "en",
        "post-purchase returned the wrong language",
    )
    require_text(result, "subject", "post-purchase")
    require_text(result, "message", "post-purchase")
    print("post-purchase functional check passed")


def check_recommendation() -> None:
    """Verify Milvus-backed complementary product recommendations."""
    result = call_agent(
        "recommendation",
        8004,
        {
            "query": "Recommend products that complement a Classic Tee",
            "cart_items": [
                {
                    "product_id": "prod_1",
                    "name": "Classic Tee",
                    "category": "tops",
                    "price": 2500,
                }
            ],
            "session_context": {"browse_history": ["casual wear", "jeans"]},
        },
        timeout=120,
    )
    recommendations = require_object_list(result, "recommendations", "recommendation")
    require(
        all(
            bool(item.get("product_id")) and item.get("product_id") != "prod_1"
            for item in recommendations
        ),
        "recommendation returned an invalid product or an item already in the cart",
    )
    print(f"recommendation functional check passed: {len(recommendations)} product(s)")


def check_search() -> None:
    """Verify Milvus-backed product search with a known catalog query."""
    result = call_agent(
        "search",
        8005,
        {"query": "Classic Tee", "category": "tops", "limit": 3},
        timeout=60,
    )
    results = require_object_list(result, "results", "search")
    require(
        len(results) <= 3 and all(bool(item.get("product_id")) for item in results),
        "search returned an invalid product list",
    )
    print(f"search functional check passed: {len(results)} product(s)")


def main() -> int:
    """Run all NAT functional checks sequentially to avoid rate-limit bursts."""
    try:
        check_promotion()
        check_post_purchase()
        check_recommendation()
        check_search()
    except Exception as error:
        print(f"::error::NAT functional check failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

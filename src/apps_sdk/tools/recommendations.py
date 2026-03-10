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

"""
Search products tool for the MCP server.

This module provides the search_products MCP tool which serves as the
entry point for widget discovery per the Apps SDK spec.

This module delegates search entirely to the NAT RAG search agent and
enriches results from the merchant API - no hardcoded product data.
"""

from __future__ import annotations

import json
import logging
from typing import Any, cast

import httpx

from src.apps_sdk.config import get_apps_sdk_settings

logger = logging.getLogger(__name__)

settings = get_apps_sdk_settings()
SEARCH_AGENT_URL = settings.search_agent_url
MERCHANT_API_URL = settings.merchant_api_url
SEARCH_MIN_SIMILARITY = settings.search_min_similarity
SEARCH_DISTANCE_CUTOFF = settings.search_distance_cutoff

DEFAULT_USER = {
    "id": "user_demo123",
    "name": "John Doe",
    "email": "john@example.com",
    "loyaltyPoints": 1250,
    "tier": "Gold",
    "memberSince": "2024-03-15",
}


def _error_search_response(
    query: str,
    category: str | None,
    message: str,
) -> dict[str, Any]:
    return {
        "products": [],
        "query": query,
        "category": category,
        "totalResults": 0,
        "error": message,
        "user": DEFAULT_USER,
        "theme": "dark",
        "locale": "en-US",
        "_meta": {
            "openai/outputTemplate": "ui://widget/merchant-app.html",
            "openai/toolInvocation/invoking": "Searching products...",
            "openai/toolInvocation/invoked": message,
            "openai/widgetAccessible": True,
        },
    }


def _extract_similarity(item: dict[str, Any]) -> float | None:
    similarity = item.get("similarity")
    if isinstance(similarity, (int, float)):
        return float(similarity)

    score = item.get("score")
    if isinstance(score, (int, float)):
        return 1 / (1 + float(score))

    distance = item.get("distance")
    if isinstance(distance, (int, float)):
        return 1 / (1 + float(distance))

    return None


def _extract_distance(item: dict[str, Any]) -> float | None:
    distance = item.get("distance")
    if isinstance(distance, (int, float)):
        return float(distance)
    return None


def _parse_search_agent_response(raw_result: Any) -> dict[str, Any]:
    """Parse the search agent response into a typed dictionary."""
    parsed: dict[str, Any] = {}

    if isinstance(raw_result, dict):
        raw_dict = cast(dict[str, Any], raw_result)
        value = raw_dict.get("value")
        if isinstance(value, str):
            loaded = json.loads(value)
            if isinstance(loaded, dict):
                parsed = cast(dict[str, Any], loaded)
        elif isinstance(value, dict):
            parsed = cast(dict[str, Any], value)
        elif "results" in raw_dict:
            parsed = raw_dict
    elif isinstance(raw_result, str):
        loaded = json.loads(raw_result)
        if isinstance(loaded, dict):
            parsed = cast(dict[str, Any], loaded)

    return parsed


async def _fetch_product_from_merchant(product_id: str) -> dict[str, Any] | None:
    """Fetch a product from the merchant API.

    This is the single source of truth for product data.
    Returns None if the product doesn't exist in the merchant database.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{MERCHANT_API_URL}/products/{product_id}")
            if response.status_code != 200:
                logger.debug(
                    f"Product {product_id} not found in merchant API: {response.status_code}"
                )
                return None
            product = response.json()
            return {
                "id": product.get("id", product_id),
                "sku": product.get("sku", ""),
                "name": product.get("name", ""),
                "basePrice": product.get("base_price", product.get("price_cents", 0)),
                "stockCount": product.get("stock_count", 0),
                "category": product.get("category", ""),
                "description": product.get("description", ""),
                "imageUrl": product.get("image_url"),
            }
    except Exception as e:
        logger.warning(f"Failed to fetch product {product_id} from merchant API: {e}")
        return None


async def call_search_agent(
    query: str,
    category: str | None,
    limit: int,
) -> dict[str, Any]:
    """Call the NAT RAG search agent to retrieve top products."""
    payload = {
        "input_message": json.dumps(
            {
                "query": query,
                "category": category,
                "limit": limit,
            }
        )
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{SEARCH_AGENT_URL}/generate",
                json=payload,
            )
            response.raise_for_status()
            raw_result = response.json()
            parsed = _parse_search_agent_response(raw_result)
            return {
                "query": parsed.get("query", query),
                "results": parsed.get("results", []),
            }
    except httpx.TimeoutException:
        return {"results": [], "error": "Search agent timeout"}
    except httpx.HTTPStatusError as e:
        return {"results": [], "error": f"Agent error: {e.response.status_code}"}
    except (httpx.ConnectError, httpx.ConnectTimeout) as e:
        return {"results": [], "error": f"Search agent unavailable: {e}"}
    except Exception as e:
        return {"results": [], "error": str(e)}


async def search_products(
    query: str,
    category: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Search for products by query and optional category.

    Delegates search entirely to the NAT RAG search agent, then enriches
    results from the merchant API. Returns 0 results if no matching products
    exist in the database (e.g., searching for "skirts" when none exist).

    This is the entry point tool that exposes the widget URI to clients.
    The client discovers the widget location by calling this tool and reading
    the _meta.openai/outputTemplate field in the response.

    Args:
        query: Search query for products.
        category: Optional category filter.
        limit: Maximum number of results to return (default: 10, max: 50).

    Returns:
        Dictionary containing products, query info, and widget metadata.
    """
    limit = min(limit, 50)

    logger.info(f"Search request: query='{query}', category={category}, limit={limit}")

    agent_result = await call_search_agent(query=query, category=category, limit=limit)
    if agent_result.get("error"):
        logger.warning(f"Search agent error: {agent_result.get('error')}")
        return _error_search_response(
            query=query,
            category=category,
            message="Search agent unavailable. Try again.",
        )

    agent_items = agent_result.get("results", [])
    logger.info(f"Search agent returned {len(agent_items)} results")

    if SEARCH_DISTANCE_CUTOFF > 0:
        filtered_items: list[dict[str, Any]] = []
        has_distances = False
        for item in agent_items:
            distance = _extract_distance(item)
            if distance is None:
                continue
            has_distances = True
            if distance <= SEARCH_DISTANCE_CUTOFF:
                filtered_items.append(item)
        if has_distances:
            logger.info(
                "Applied distance filter (max=%s): %s -> %s",
                SEARCH_DISTANCE_CUTOFF,
                len(agent_items),
                len(filtered_items),
            )
            agent_items = filtered_items

    if SEARCH_MIN_SIMILARITY > 0:
        filtered_items: list[dict[str, Any]] = []
        has_scores = False
        for item in agent_items:
            similarity = _extract_similarity(item)
            if similarity is None:
                continue
            has_scores = True
            if similarity >= SEARCH_MIN_SIMILARITY:
                filtered_items.append(item)
        if has_scores:
            logger.info(
                f"Applied similarity filter (min={SEARCH_MIN_SIMILARITY}): {len(agent_items)} -> {len(filtered_items)}"
            )
            agent_items = filtered_items

    results: list[dict[str, Any]] = []
    for item in agent_items:
        product_id = item.get("product_id") or item.get("productId")
        if not product_id:
            logger.warning(f"Agent returned item without product_id: {item}")
            continue

        enriched = await _fetch_product_from_merchant(product_id)
        if enriched:
            results.append(enriched)
        else:
            logger.debug(
                f"Product {product_id} returned by agent not found in merchant database (skipping)"
            )

    if len(results) > limit:
        results = results[:limit]

    if not results:
        logger.info(f"No products found for query '{query}'")
        return _error_search_response(
            query=query,
            category=category,
            message=f"No products found for '{query}'.",
        )

    logger.info(f"Returning {len(results)} products for query '{query}'")
    return {
        "products": results,
        "query": query,
        "category": category,
        "totalResults": len(results),
        "user": DEFAULT_USER,
        "theme": "dark",
        "locale": "en-US",
        "_meta": {
            "openai/outputTemplate": "ui://widget/merchant-app.html",
            "openai/toolInvocation/invoking": "Searching products...",
            "openai/toolInvocation/invoked": f"Found {len(results)} products",
            "openai/widgetAccessible": True,
        },
    }

"""
Search products tool for the MCP server.

This module provides the search_products MCP tool which serves as the
entry point for widget discovery per the Apps SDK spec.
"""

from __future__ import annotations

from typing import Any

from src.data.product_catalog import PRODUCTS

# Transform catalog products to widget format
CATALOG_PRODUCTS = [
    {
        "id": p["id"],
        "sku": p["sku"],
        "name": p["name"],
        "basePrice": p["price_cents"],
        "stockCount": p["stock_count"],
        "category": p["category"],
        "description": p["description"],
        "imageUrl": p["image_url"],
    }
    for p in PRODUCTS
]

# Default user context for widget
DEFAULT_USER = {
    "id": "user_demo123",
    "name": "John Doe",
    "email": "john@example.com",
    "loyaltyPoints": 1250,
    "tier": "Gold",
    "memberSince": "2024-03-15",
}


async def search_products(
    query: str,
    category: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Search for products by query and optional category.

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
    # Filter products based on query (simple case-insensitive search)
    query_lower = query.lower()
    filtered_products = [
        p
        for p in CATALOG_PRODUCTS
        if query_lower in str(p["name"]).lower()
        or query_lower in str(p.get("category", "")).lower()
        or query_lower in str(p.get("sku", "")).lower()
        or query_lower in str(p.get("description", "")).lower()
    ]

    # Apply category filter if provided
    if category:
        category_lower = category.lower()
        filtered_products = [
            p
            for p in filtered_products
            if category_lower in str(p.get("category", "")).lower()
            or category_lower in str(p["name"]).lower()
        ]

    # If no matches, return all products (for demo purposes)
    if not filtered_products:
        filtered_products = CATALOG_PRODUCTS

    # Apply limit
    limit = min(limit, 50)
    results = filtered_products[:limit]

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

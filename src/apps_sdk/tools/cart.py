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
Cart tools for the MCP server.

Manages shopping cart state with add, remove, update, and get operations.
Product data is fetched from the merchant API (single source of truth).
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import httpx

from src.apps_sdk.config import get_apps_sdk_settings

logger = logging.getLogger(__name__)
settings = get_apps_sdk_settings()
MERCHANT_API_URL = settings.merchant_api_url

# In-memory cart storage (use database in production)
# Exported for use by checkout module
carts: dict[str, list[dict[str, Any]]] = {}


def get_or_create_cart(
    cart_id: str | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    """Get existing cart or create a new one.

    Args:
        cart_id: Optional cart ID to look up or use for new cart.

    Returns:
        Tuple of (cart_id, cart_items list).
    """
    if cart_id and cart_id in carts:
        return cart_id, carts[cart_id]
    new_id = cart_id or f"cart_{uuid4().hex[:12]}"
    carts[new_id] = []
    return new_id, carts[new_id]


async def find_product(product_id: str) -> dict[str, Any] | None:
    """Find a product by ID from the merchant API.

    Args:
        product_id: The product ID to look up.

    Returns:
        Product dictionary or None if not found.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{MERCHANT_API_URL}/products/{product_id}")
            if response.status_code != 200:
                logger.debug(f"Product {product_id} not found in merchant API")
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
        logger.warning(f"Failed to fetch product {product_id}: {e}")
        return None


def calculate_cart_totals(items: list[dict[str, Any]]) -> dict[str, int]:
    """Calculate cart totals.

    Args:
        items: List of cart items with basePrice and quantity fields.

    Returns:
        Dictionary with subtotal, shipping, tax, and total in cents.
    """
    subtotal = sum(item["basePrice"] * item["quantity"] for item in items)
    shipping = 500 if items else 0  # $5.00 shipping
    tax = int(subtotal * 0.0875)  # 8.75% tax
    total = subtotal + shipping + tax
    return {
        "subtotal": subtotal,
        "shipping": shipping,
        "tax": tax,
        "total": total,
    }


def get_cart_meta(cart_id: str) -> dict[str, Any]:
    """Metadata for cart widget."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Updating cart...",
        "openai/toolInvocation/invoked": "Cart updated",
        "openai/widgetAccessible": True,
        "openai/widgetSessionId": cart_id,
    }


async def add_to_cart(
    product_id: str,
    quantity: int = 1,
    cart_id: str | None = None,
) -> dict[str, Any]:
    """
    Add a product to the shopping cart.

    Args:
        product_id: The product ID to add.
        quantity: Number of items to add (default: 1).
        cart_id: Existing cart ID, or None to create new cart.

    Returns:
        Updated cart state with items and totals.
    """
    cart_id, cart_items = get_or_create_cart(cart_id)
    product = await find_product(product_id)

    if not product:
        return {
            "error": f"Product not found: {product_id}",
            "cartId": cart_id,
            "items": cart_items,
            "_meta": get_cart_meta(cart_id),
        }

    # Check if product already in cart
    existing = next((item for item in cart_items if item["id"] == product_id), None)
    if existing:
        existing["quantity"] += quantity
    else:
        cart_items.append({**product, "quantity": quantity})

    totals = calculate_cart_totals(cart_items)

    return {
        "cartId": cart_id,
        "items": cart_items,
        "itemCount": sum(item["quantity"] for item in cart_items),
        **totals,
        "_meta": get_cart_meta(cart_id),
    }


async def remove_from_cart(
    product_id: str,
    cart_id: str,
) -> dict[str, Any]:
    """
    Remove a product from the shopping cart.

    Args:
        product_id: The product ID to remove.
        cart_id: The cart ID.

    Returns:
        Updated cart state.
    """
    if cart_id not in carts:
        return {
            "error": "Cart not found",
            "cartId": cart_id,
            "items": [],
            "_meta": get_cart_meta(cart_id),
        }

    cart_items = carts[cart_id]
    carts[cart_id] = [item for item in cart_items if item["id"] != product_id]
    cart_items = carts[cart_id]

    totals = calculate_cart_totals(cart_items)

    return {
        "cartId": cart_id,
        "items": cart_items,
        "itemCount": sum(item["quantity"] for item in cart_items),
        **totals,
        "_meta": get_cart_meta(cart_id),
    }


async def update_cart_quantity(
    product_id: str,
    quantity: int,
    cart_id: str,
) -> dict[str, Any]:
    """
    Update the quantity of a product in the cart.

    Args:
        product_id: The product ID to update.
        quantity: New quantity (0 to remove).
        cart_id: The cart ID.

    Returns:
        Updated cart state.
    """
    if quantity <= 0:
        return await remove_from_cart(product_id, cart_id)

    if cart_id not in carts:
        return {
            "error": "Cart not found",
            "cartId": cart_id,
            "items": [],
            "_meta": get_cart_meta(cart_id),
        }

    cart_items = carts[cart_id]
    for item in cart_items:
        if item["id"] == product_id:
            item["quantity"] = quantity
            break

    totals = calculate_cart_totals(cart_items)

    return {
        "cartId": cart_id,
        "items": cart_items,
        "itemCount": sum(item["quantity"] for item in cart_items),
        **totals,
        "_meta": get_cart_meta(cart_id),
    }


async def get_cart(cart_id: str) -> dict[str, Any]:
    """
    Get the current cart state.

    Args:
        cart_id: The cart ID.

    Returns:
        Current cart state with items and totals.
    """
    if cart_id not in carts:
        return {
            "cartId": cart_id,
            "items": [],
            "itemCount": 0,
            "subtotal": 0,
            "shipping": 0,
            "tax": 0,
            "total": 0,
            "_meta": get_cart_meta(cart_id),
        }

    cart_items = carts[cart_id]
    totals = calculate_cart_totals(cart_items)

    return {
        "cartId": cart_id,
        "items": cart_items,
        "itemCount": sum(item["quantity"] for item in cart_items),
        **totals,
        "_meta": get_cart_meta(cart_id),
    }

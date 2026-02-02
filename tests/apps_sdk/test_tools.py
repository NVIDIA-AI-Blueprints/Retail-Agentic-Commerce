"""Tests for Apps SDK tools.

Tests cover:
- MCP Tools (exposed to ChatGPT):
  - search_products: Entry point tool that returns products and widget URI
  - add_to_cart: Adding items to cart
  - remove_from_cart: Removing items from cart
  - update_cart_quantity: Updating item quantities
  - get_cart: Retrieving cart state
  - checkout: Processing checkout
"""

from unittest.mock import AsyncMock, patch

import pytest

from src.apps_sdk.tools.cart import (
    add_to_cart,
    carts,
    get_cart,
    remove_from_cart,
    update_cart_quantity,
)
from src.apps_sdk.tools.checkout import checkout
from src.apps_sdk.tools.recommendations import search_products

# =============================================================================
# SEARCH PRODUCTS TESTS (Entry Point MCP Tool)
# =============================================================================


class TestSearchProducts:
    """Tests for the search_products MCP tool.

    This is the entry point tool per the Apps SDK spec that exposes
    the widget URI to clients via _meta.openai/outputTemplate.
    """

    @pytest.mark.asyncio
    async def test_returns_products_and_metadata(self) -> None:
        """Happy path: Returns products, query info, and widget metadata."""
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(
                return_value={
                    "results": [{"product_id": "prod_1", "score": 0.4}],
                    "query": "tee",
                }
            ),
        ):
            result = await search_products(query="tee")

        assert "products" in result
        assert "query" in result
        assert "totalResults" in result
        assert "_meta" in result
        assert result["query"] == "tee"

    @pytest.mark.asyncio
    async def test_search_filters_by_query(self) -> None:
        """Search returns empty list when agent returns no results."""
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(return_value={"results": []}),
        ):
            result = await search_products(query="jeans")

        assert result["totalResults"] == 0
        assert result["products"] == []

    @pytest.mark.asyncio
    async def test_search_with_category_filter(self) -> None:
        """Search with category filter narrows results."""
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(
                return_value={"results": [{"product_id": "prod_1", "score": 0.4}]}
            ),
        ):
            result = await search_products(query="tee", category="white")

        assert "products" in result
        assert result["category"] == "white"

    @pytest.mark.asyncio
    async def test_search_respects_limit(self) -> None:
        """Search respects the limit parameter."""
        items = [
            {"product_id": "prod_1", "score": 0.4},
            {"product_id": "prod_2", "score": 0.4},
        ]
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(return_value={"results": items}),
        ):
            result = await search_products(query="tee", limit=1)

        assert len(result["products"]) <= 1

    @pytest.mark.asyncio
    async def test_search_max_limit_is_50(self) -> None:
        """Search clamps limit to maximum of 50."""
        items = [{"product_id": "prod_1", "score": 0.4} for _ in range(60)]
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(return_value={"results": items}),
        ):
            result = await search_products(query="tee", limit=100)

        # Limit should be clamped to 50 internally
        assert len(result["products"]) <= 50

    @pytest.mark.asyncio
    async def test_metadata_includes_widget_uri(self) -> None:
        """Metadata includes widget URI for client discovery."""
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(
                return_value={
                    "results": [{"product_id": "prod_2", "score": 0.4}],
                    "query": "tee",
                }
            ),
        ):
            result = await search_products(query="tee")

        meta = result["_meta"]
        assert "openai/outputTemplate" in meta
        assert meta["openai/outputTemplate"] == "ui://widget/merchant-app.html"
        assert meta["openai/widgetAccessible"] is True

    @pytest.mark.asyncio
    async def test_search_agent_unavailable_returns_error(self) -> None:
        """Agent failures return an error response."""
        with patch(
            "src.apps_sdk.tools.recommendations.call_search_agent",
            new=AsyncMock(
                return_value={"results": [], "error": "Search agent timeout"}
            ),
        ):
            result = await search_products(query="nonexistent_product_xyz123", limit=50)

        assert result["totalResults"] == 0
        assert result["products"] == []
        assert "error" in result

    @pytest.mark.asyncio
    async def test_search_filters_by_similarity_threshold(self) -> None:
        """Search filters out results below the similarity threshold.

        Score is converted to similarity via 1/(1+score):
        - prod_1 score=0.1 -> similarity=0.909 (passes min 0.35)
        - prod_2 score=5.0 -> similarity=0.167 (filtered out)
        """
        mock_product = {
            "id": "prod_1",
            "sku": "TS-001",
            "name": "Classic White Tee",
            "basePrice": 2500,
            "stockCount": 100,
            "category": "tops",
            "description": "A classic white t-shirt",
            "imageUrl": "/prod_1.jpeg",
        }
        with (
            patch(
                "src.apps_sdk.tools.recommendations.call_search_agent",
                new=AsyncMock(
                    return_value={
                        "results": [
                            {"product_id": "prod_1", "score": 0.1},
                            {"product_id": "prod_2", "score": 5.0},
                        ]
                    }
                ),
            ),
            patch(
                "src.apps_sdk.tools.recommendations._fetch_product_from_merchant",
                new=AsyncMock(return_value=mock_product),
            ),
        ):
            result = await search_products(query="tee", limit=3)

        assert result["totalResults"] == 1
        assert result["products"][0]["id"] == "prod_1"

    @pytest.mark.asyncio
    async def test_missing_product_uses_merchant_fallback(self) -> None:
        """Missing catalog IDs are enriched via merchant API fallback."""
        with (
            patch(
                "src.apps_sdk.tools.recommendations.call_search_agent",
                new=AsyncMock(
                    return_value={
                        "results": [{"product_id": "prod_missing", "score": 0.2}]
                    }
                ),
            ),
            patch(
                "src.apps_sdk.tools.recommendations._fetch_product_from_merchant",
                new=AsyncMock(
                    return_value={
                        "id": "prod_missing",
                        "sku": "TS-999",
                        "name": "Limited Tee",
                        "basePrice": 3900,
                        "stockCount": 5,
                        "category": "tops",
                        "description": "Limited edition tee",
                        "imageUrl": "/prod_99.jpeg",
                    }
                ),
            ),
        ):
            result = await search_products(query="limited tee", limit=3)

        assert result["products"][0]["id"] == "prod_missing"


# =============================================================================
# CART TESTS
# =============================================================================


class TestAddToCart:
    """Tests for the add_to_cart tool."""

    @pytest.mark.asyncio
    async def test_add_product_creates_cart(self) -> None:
        """Adding a product creates a new cart if none exists."""
        result = await add_to_cart(product_id="prod_1", quantity=1)

        assert "cartId" in result
        assert result["cartId"].startswith("cart_")
        assert len(result["items"]) == 1
        assert result["itemCount"] == 1

    @pytest.mark.asyncio
    async def test_add_product_to_existing_cart(self) -> None:
        """Adding a product to an existing cart works correctly."""
        # Create cart first
        first_result = await add_to_cart(product_id="prod_1", quantity=1)
        cart_id = first_result["cartId"]

        # Add another product
        result = await add_to_cart(product_id="prod_2", quantity=2, cart_id=cart_id)

        assert result["cartId"] == cart_id
        assert len(result["items"]) == 2
        assert result["itemCount"] == 3  # 1 + 2

    @pytest.mark.asyncio
    async def test_add_existing_product_increases_quantity(self) -> None:
        """Adding an existing product increases its quantity."""
        first_result = await add_to_cart(product_id="prod_1", quantity=1)
        cart_id = first_result["cartId"]

        result = await add_to_cart(product_id="prod_1", quantity=2, cart_id=cart_id)

        assert len(result["items"]) == 1
        assert result["items"][0]["quantity"] == 3

    @pytest.mark.asyncio
    async def test_add_invalid_product_returns_error(self) -> None:
        """Adding an invalid product returns an error."""
        result = await add_to_cart(product_id="invalid_product")

        assert "error" in result
        assert "not found" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_cart_totals_calculated_correctly(self) -> None:
        """Cart totals (subtotal, tax, shipping, total) are calculated."""
        # Mock product from conftest has base_price=2500
        result = await add_to_cart(product_id="prod_1", quantity=2)

        expected_subtotal = 2500 * 2  # mock product price * quantity

        assert result["subtotal"] == expected_subtotal
        assert result["shipping"] == 500  # $5.00
        assert "tax" in result
        assert "total" in result
        assert result["total"] > result["subtotal"]

    @pytest.mark.asyncio
    async def test_metadata_includes_session_id(self) -> None:
        """Cart metadata includes widgetSessionId for state correlation."""
        result = await add_to_cart(product_id="prod_1")

        meta = result["_meta"]
        assert meta["openai/widgetSessionId"] == result["cartId"]


class TestRemoveFromCart:
    """Tests for the remove_from_cart tool."""

    @pytest.mark.asyncio
    async def test_remove_product_from_cart(self) -> None:
        """Removing a product removes it from the cart."""
        # Set up cart
        add_result = await add_to_cart(product_id="prod_1")
        await add_to_cart(product_id="prod_2", cart_id=add_result["cartId"])
        cart_id = add_result["cartId"]

        # Remove first product
        result = await remove_from_cart(product_id="prod_1", cart_id=cart_id)

        assert len(result["items"]) == 1
        assert result["items"][0]["id"] == "prod_2"

    @pytest.mark.asyncio
    async def test_remove_from_nonexistent_cart(self) -> None:
        """Removing from a nonexistent cart returns error."""
        result = await remove_from_cart(product_id="prod_1", cart_id="nonexistent_cart")

        assert "error" in result
        assert "not found" in result["error"].lower()


class TestUpdateCartQuantity:
    """Tests for the update_cart_quantity tool."""

    @pytest.mark.asyncio
    async def test_update_quantity(self) -> None:
        """Updating quantity changes the item count."""
        add_result = await add_to_cart(product_id="prod_1", quantity=1)
        cart_id = add_result["cartId"]

        result = await update_cart_quantity(
            product_id="prod_1", quantity=5, cart_id=cart_id
        )

        assert result["items"][0]["quantity"] == 5
        assert result["itemCount"] == 5

    @pytest.mark.asyncio
    async def test_update_to_zero_removes_item(self) -> None:
        """Setting quantity to 0 removes the item."""
        add_result = await add_to_cart(product_id="prod_1")
        cart_id = add_result["cartId"]

        result = await update_cart_quantity(
            product_id="prod_1", quantity=0, cart_id=cart_id
        )

        assert len(result["items"]) == 0


class TestGetCart:
    """Tests for the get_cart tool."""

    @pytest.mark.asyncio
    async def test_get_existing_cart(self) -> None:
        """Getting an existing cart returns its state."""
        add_result = await add_to_cart(product_id="prod_1", quantity=2)
        cart_id = add_result["cartId"]

        result = await get_cart(cart_id=cart_id)

        assert result["cartId"] == cart_id
        assert result["itemCount"] == 2
        assert len(result["items"]) == 1

    @pytest.mark.asyncio
    async def test_get_nonexistent_cart(self) -> None:
        """Getting a nonexistent cart returns empty state."""
        result = await get_cart(cart_id="nonexistent_cart")

        assert result["cartId"] == "nonexistent_cart"
        assert result["items"] == []
        assert result["itemCount"] == 0
        assert result["total"] == 0


# =============================================================================
# CHECKOUT TESTS
# =============================================================================


class TestCheckout:
    """Tests for the checkout tool."""

    @pytest.mark.asyncio
    async def test_checkout_empty_cart_fails(self) -> None:
        """Checking out an empty cart returns error."""
        # Create empty cart
        carts["empty_cart"] = []

        result = await checkout(cart_id="empty_cart")

        assert result["success"] is False
        assert result["status"] == "failed"
        assert "empty" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_checkout_success_simulated(self) -> None:
        """Successful checkout (simulated) returns order details."""
        # Add items to cart
        add_result = await add_to_cart(product_id="prod_1", quantity=2)
        cart_id = add_result["cartId"]

        result = await checkout(cart_id=cart_id)

        assert result["success"] is True
        assert result["status"] == "confirmed"
        assert "orderId" in result
        assert result["orderId"].startswith("order_")
        assert "total" in result
        assert "itemCount" in result
        assert result["itemCount"] == 2

    @pytest.mark.asyncio
    async def test_checkout_clears_cart(self) -> None:
        """Checkout clears the cart after success."""
        add_result = await add_to_cart(product_id="prod_1")
        cart_id = add_result["cartId"]

        await checkout(cart_id=cart_id)

        # Verify cart is cleared
        cart_result = await get_cart(cart_id=cart_id)
        assert cart_result["items"] == []

    @pytest.mark.asyncio
    async def test_checkout_metadata_closes_widget(self) -> None:
        """Successful checkout metadata includes closeWidget flag."""
        add_result = await add_to_cart(product_id="prod_1")
        cart_id = add_result["cartId"]

        result = await checkout(cart_id=cart_id)

        meta = result["_meta"]
        assert meta["openai/closeWidget"] is True

    @pytest.mark.asyncio
    async def test_checkout_with_multiple_items(self) -> None:
        """Checkout works with multiple different products."""
        add_result = await add_to_cart(product_id="prod_1", quantity=1)
        cart_id = add_result["cartId"]
        await add_to_cart(product_id="prod_2", quantity=2, cart_id=cart_id)
        await add_to_cart(product_id="prod_3", quantity=1, cart_id=cart_id)

        result = await checkout(cart_id=cart_id)

        assert result["success"] is True
        assert result["itemCount"] == 4  # 1 + 2 + 1


# =============================================================================
# MCP OUTPUT SCHEMA COMPLIANCE TESTS
# =============================================================================


class TestOutputSchemaCompliance:
    """Tests verifying MCP tool output matches Apps SDK spec patterns."""

    @pytest.mark.asyncio
    async def test_cart_output_has_required_fields(self) -> None:
        """Cart operations return all required fields per spec."""
        result = await add_to_cart(product_id="prod_1")

        # Required fields per Apps SDK spec
        assert "cartId" in result
        assert "items" in result
        assert "itemCount" in result
        assert "_meta" in result

        # Widget metadata
        assert "openai/outputTemplate" in result["_meta"]
        assert "openai/widgetSessionId" in result["_meta"]

    @pytest.mark.asyncio
    async def test_checkout_output_has_required_fields(self) -> None:
        """Checkout output includes all required fields per spec."""
        add_result = await add_to_cart(product_id="prod_1")
        result = await checkout(cart_id=add_result["cartId"])

        # Required fields per Apps SDK spec
        assert "success" in result
        assert "status" in result  # Added for spec compliance
        assert "orderId" in result
        assert "total" in result
        assert "itemCount" in result
        assert "_meta" in result

        # Status should be one of the defined values
        assert result["status"] in ("confirmed", "failed", "pending")

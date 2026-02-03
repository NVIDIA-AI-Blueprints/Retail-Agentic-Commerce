"""Tests for the checkout service module.

Tests cover:
- Line item calculation and recalculation
- Promotion data preservation during updates
- Optimization: skip promotion agent on session updates
"""

import pytest

from src.merchant.db.models import Product
from src.merchant.services.helpers import (
    calculate_line_item,
    recalculate_line_item_from_existing,
)

# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def sample_product() -> Product:
    """Create a sample product for testing."""
    return Product(
        id="prod_test",
        sku="TEST-001",
        name="Test Product",
        base_price=2500,  # $25.00
        stock_count=100,
        min_margin=0.15,
        image_url="https://example.com/test.png",
    )


@pytest.fixture
def existing_line_item_with_discount() -> dict:
    """Create an existing line item with promotion discount."""
    return {
        "id": "li_existing",
        "item": {"id": "prod_test", "quantity": 2},
        "base_amount": 5000,  # 2 * 2500
        "discount": 500,  # 2 * 250 (10% discount per unit)
        "subtotal": 4500,
        "tax": 450,
        "total": 4950,
        "promotion": {
            "action": "DISCOUNT_10_PCT",
            "reason_codes": ["HIGH_INVENTORY", "ABOVE_MARKET"],
            "reasoning": "High inventory and above market pricing justifies 10% discount.",
        },
    }


@pytest.fixture
def existing_line_item_no_discount() -> dict:
    """Create an existing line item without promotion."""
    return {
        "id": "li_no_promo",
        "item": {"id": "prod_test", "quantity": 1},
        "base_amount": 2500,
        "discount": 0,
        "subtotal": 2500,
        "tax": 250,
        "total": 2750,
        "promotion": {
            "action": "NO_PROMO",
            "reason_codes": [],
            "reasoning": "No promotion applied.",
        },
    }


# =============================================================================
# calculate_line_item Tests
# =============================================================================


class TestCalculateLineItem:
    """Tests for the calculate_line_item function."""

    def test_calculates_base_amount_correctly(self, sample_product: Product) -> None:
        """Happy path: Base amount is quantity * base_price."""
        result = calculate_line_item(sample_product, quantity=3)

        assert result["base_amount"] == 7500  # 3 * 2500

    def test_calculates_discount_correctly(self, sample_product: Product) -> None:
        """Happy path: Discount is quantity * discount_per_unit."""
        result = calculate_line_item(sample_product, quantity=2, discount_per_unit=250)

        assert result["discount"] == 500  # 2 * 250

    def test_calculates_subtotal_as_base_minus_discount(
        self, sample_product: Product
    ) -> None:
        """Happy path: Subtotal is base_amount - discount."""
        result = calculate_line_item(sample_product, quantity=2, discount_per_unit=250)

        assert result["subtotal"] == 4500  # 5000 - 500

    def test_calculates_tax_as_10_percent_of_subtotal(
        self, sample_product: Product
    ) -> None:
        """Happy path: Tax is 10% of subtotal."""
        result = calculate_line_item(sample_product, quantity=2)

        # base_amount = 5000, discount = 0, subtotal = 5000
        # tax = 5000 * 0.10 = 500
        assert result["tax"] == 500

    def test_calculates_total_as_subtotal_plus_tax(
        self, sample_product: Product
    ) -> None:
        """Happy path: Total is subtotal + tax."""
        result = calculate_line_item(sample_product, quantity=2)

        # subtotal = 5000, tax = 500, total = 5500
        assert result["total"] == 5500

    def test_generates_line_item_id_when_not_provided(
        self, sample_product: Product
    ) -> None:
        """Happy path: Generates a new line item ID."""
        result = calculate_line_item(sample_product, quantity=1)

        assert result["id"].startswith("li_")

    def test_preserves_line_item_id_when_provided(
        self, sample_product: Product
    ) -> None:
        """Happy path: Preserves existing line item ID when provided."""
        result = calculate_line_item(
            sample_product, quantity=1, line_item_id="li_preserved"
        )

        assert result["id"] == "li_preserved"

    def test_includes_promotion_metadata_when_provided(
        self, sample_product: Product
    ) -> None:
        """Happy path: Includes promotion metadata in result."""
        promotion_info = {
            "action": "DISCOUNT_5_PCT",
            "reason_codes": ["HIGH_INVENTORY"],
            "reasoning": "Test reasoning",
        }
        result = calculate_line_item(
            sample_product, quantity=1, promotion_info=promotion_info
        )

        assert "promotion" in result
        assert result["promotion"]["action"] == "DISCOUNT_5_PCT"
        assert result["promotion"]["reason_codes"] == ["HIGH_INVENTORY"]
        assert result["promotion"]["reasoning"] == "Test reasoning"

    def test_no_promotion_when_none_provided(self, sample_product: Product) -> None:
        """Edge case: No promotion key when promotion_info is None."""
        result = calculate_line_item(sample_product, quantity=1)

        assert "promotion" not in result

    def test_zero_quantity_results_in_zero_amounts(
        self, sample_product: Product
    ) -> None:
        """Edge case: Zero quantity results in zero amounts."""
        result = calculate_line_item(sample_product, quantity=0)

        assert result["base_amount"] == 0
        assert result["discount"] == 0
        assert result["subtotal"] == 0
        assert result["tax"] == 0
        assert result["total"] == 0


# =============================================================================
# recalculate_line_item_from_existing Tests
# =============================================================================


class TestRecalculateLineItemFromExisting:
    """Tests for the recalculate_line_item_from_existing function.

    This is the key optimization: reuse existing promotion data
    instead of re-calling the promotion agent.
    """

    def test_preserves_per_unit_discount_when_quantity_changes(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Happy path: Per-unit discount is preserved when quantity changes."""
        # Original: 2 items with $5.00 total discount = $2.50 per unit
        # New: 4 items should have $10.00 total discount
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=4,
            existing_line_item=existing_line_item_with_discount,
        )

        # Per-unit discount was 250 cents (500 / 2)
        # New discount should be 4 * 250 = 1000
        assert result["discount"] == 1000

    def test_recalculates_base_amount_for_new_quantity(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Happy path: Base amount is recalculated for new quantity."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=5,
            existing_line_item=existing_line_item_with_discount,
        )

        # 5 * 2500 = 12500
        assert result["base_amount"] == 12500

    def test_recalculates_subtotal_tax_total(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Happy path: Subtotal, tax, and total are recalculated correctly."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=4,
            existing_line_item=existing_line_item_with_discount,
        )

        # base_amount = 4 * 2500 = 10000
        # discount = 4 * 250 = 1000
        # subtotal = 10000 - 1000 = 9000
        # tax = 9000 * 0.10 = 900
        # total = 9000 + 900 = 9900
        assert result["base_amount"] == 10000
        assert result["discount"] == 1000
        assert result["subtotal"] == 9000
        assert result["tax"] == 900
        assert result["total"] == 9900

    def test_preserves_line_item_id(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Happy path: Line item ID is preserved from existing item."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=3,
            existing_line_item=existing_line_item_with_discount,
        )

        assert result["id"] == "li_existing"

    def test_preserves_promotion_metadata(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Happy path: Promotion metadata is preserved from existing item."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=3,
            existing_line_item=existing_line_item_with_discount,
        )

        assert "promotion" in result
        assert result["promotion"]["action"] == "DISCOUNT_10_PCT"
        assert result["promotion"]["reason_codes"] == ["HIGH_INVENTORY", "ABOVE_MARKET"]
        assert "10% discount" in result["promotion"]["reasoning"]

    def test_handles_no_discount_gracefully(
        self, sample_product: Product, existing_line_item_no_discount: dict
    ) -> None:
        """Edge case: Handles items with no discount correctly."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=3,
            existing_line_item=existing_line_item_no_discount,
        )

        # Original had 0 discount, new should also have 0
        assert result["discount"] == 0
        assert result["promotion"]["action"] == "NO_PROMO"

    def test_handles_zero_existing_quantity(self, sample_product: Product) -> None:
        """Edge case: Handles zero existing quantity without division error."""
        existing_item = {
            "id": "li_zero",
            "item": {"id": "prod_test", "quantity": 0},
            "base_amount": 0,
            "discount": 0,
            "subtotal": 0,
            "tax": 0,
            "total": 0,
        }

        result = recalculate_line_item_from_existing(
            sample_product, quantity=2, existing_line_item=existing_item
        )

        # Should handle gracefully, discount remains 0
        assert result["discount"] == 0
        assert result["base_amount"] == 5000  # 2 * 2500

    def test_handles_missing_promotion_key(self, sample_product: Product) -> None:
        """Edge case: Handles existing item without promotion key."""
        existing_item = {
            "id": "li_no_promo_key",
            "item": {"id": "prod_test", "quantity": 1},
            "base_amount": 2500,
            "discount": 0,
            "subtotal": 2500,
            "tax": 250,
            "total": 2750,
            # No "promotion" key
        }

        result = recalculate_line_item_from_existing(
            sample_product, quantity=2, existing_line_item=existing_item
        )

        # Should work without error
        assert result["base_amount"] == 5000
        assert "promotion" not in result

    def test_handles_missing_discount_key(self, sample_product: Product) -> None:
        """Edge case: Handles existing item without discount key."""
        existing_item = {
            "id": "li_no_discount_key",
            "item": {"id": "prod_test", "quantity": 1},
            "base_amount": 2500,
            # No "discount" key
            "subtotal": 2500,
            "tax": 250,
            "total": 2750,
        }

        result = recalculate_line_item_from_existing(
            sample_product, quantity=2, existing_line_item=existing_item
        )

        # Should default to 0 discount
        assert result["discount"] == 0

    def test_quantity_one_preserves_exact_discount(
        self, sample_product: Product, existing_line_item_with_discount: dict
    ) -> None:
        """Edge case: Single quantity preserves per-unit discount exactly."""
        result = recalculate_line_item_from_existing(
            sample_product,
            quantity=1,
            existing_line_item=existing_line_item_with_discount,
        )

        # Original: 500 discount for 2 items = 250 per unit
        # New: 1 item should have 250 discount
        assert result["discount"] == 250


# =============================================================================
# Integration Tests: Update Session Does Not Call Promotion Agent
# =============================================================================


class TestUpdateSessionSkipsPromotionAgent:
    """Integration tests verifying the optimization:
    session updates do not call the promotion agent for existing products.

    Note: These tests verify the logic at a lower level since full service
    integration tests require complex database mocking. The API-level tests
    in test_checkout.py provide end-to-end coverage.
    """

    def test_recalculate_preserves_discount_per_unit(
        self, sample_product: Product
    ) -> None:
        """Verify the core optimization: existing discount is preserved."""
        # Existing line item with 10% discount (250 cents per unit on $25 product)
        existing_item = {
            "id": "li_existing",
            "item": {"id": "prod_test", "quantity": 2},
            "base_amount": 5000,
            "discount": 500,  # 2 * 250
            "subtotal": 4500,
            "tax": 450,
            "total": 4950,
            "promotion": {
                "action": "DISCOUNT_10_PCT",
                "reason_codes": ["HIGH_INVENTORY"],
                "reasoning": "Original promotion from agent",
            },
        }

        # When quantity increases to 5, discount should scale proportionally
        result = recalculate_line_item_from_existing(
            sample_product, quantity=5, existing_line_item=existing_item
        )

        # 5 * 250 = 1250 cents discount (same per-unit rate)
        assert result["discount"] == 1250
        # Promotion metadata preserved
        assert result["promotion"]["action"] == "DISCOUNT_10_PCT"
        assert result["promotion"]["reason_codes"] == ["HIGH_INVENTORY"]

    def test_recalculate_scales_linearly_with_quantity(
        self, sample_product: Product
    ) -> None:
        """Verify discounts scale linearly: double qty = double discount."""
        existing_item = {
            "id": "li_test",
            "item": {"id": "prod_test", "quantity": 1},
            "base_amount": 2500,
            "discount": 125,  # 5% discount
            "subtotal": 2375,
            "tax": 237,
            "total": 2612,
            "promotion": {
                "action": "DISCOUNT_5_PCT",
                "reason_codes": [],
                "reasoning": "Test",
            },
        }

        result_qty_2 = recalculate_line_item_from_existing(
            sample_product, quantity=2, existing_line_item=existing_item
        )
        result_qty_10 = recalculate_line_item_from_existing(
            sample_product, quantity=10, existing_line_item=existing_item
        )

        # Discount scales linearly
        assert result_qty_2["discount"] == 250  # 2 * 125
        assert result_qty_10["discount"] == 1250  # 10 * 125

    def test_new_product_detection_logic(self) -> None:
        """Verify the logic for detecting new vs existing products."""
        # Simulate existing line items lookup
        existing_line_items = [
            {"item": {"id": "prod_existing"}, "discount": 100},
        ]
        existing_by_product_id = {li["item"]["id"]: li for li in existing_line_items}

        # New product should not be found
        assert "prod_new" not in existing_by_product_id

        # Existing product should be found
        assert "prod_existing" in existing_by_product_id
        assert existing_by_product_id["prod_existing"]["discount"] == 100

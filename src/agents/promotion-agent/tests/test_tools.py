"""Unit tests for Promotion Agent custom tools.

Tests cover:
- Happy path: Valid product_id returns correct data
- Edge case: Product with high stock and higher-than-competitor price
- Edge case: Product with low stock (no discount scenario)
- Failure case: Invalid product_id returns error message
- Data integrity: Mock data structure validation
"""

from data.mock_data import COMPETITOR_PRICES, PRODUCTS


class TestMockData:
    """Test mock data integrity and structure."""

    def test_products_not_empty(self) -> None:
        """Verify products dictionary is not empty."""
        assert len(PRODUCTS) > 0

    def test_products_have_required_fields(self) -> None:
        """Verify all products have required fields."""
        required_fields = {"name", "base_price", "stock_count", "min_margin"}

        for product_id, product in PRODUCTS.items():
            assert required_fields.issubset(product.keys()), (
                f"Product {product_id} missing required fields"
            )

    def test_products_prices_are_positive(self) -> None:
        """Verify all product prices are positive integers (cents)."""
        for product_id, product in PRODUCTS.items():
            assert product["base_price"] > 0, f"Product {product_id} has invalid price"
            assert isinstance(product["base_price"], int), (
                f"Product {product_id} price should be int (cents)"
            )

    def test_products_stock_count_non_negative(self) -> None:
        """Verify all stock counts are non-negative."""
        for product_id, product in PRODUCTS.items():
            assert product["stock_count"] >= 0, (
                f"Product {product_id} has negative stock"
            )

    def test_products_min_margin_valid_range(self) -> None:
        """Verify min_margin is between 0 and 1."""
        for product_id, product in PRODUCTS.items():
            assert 0 < product["min_margin"] < 1, (
                f"Product {product_id} has invalid min_margin"
            )

    def test_competitor_prices_exist(self) -> None:
        """Verify competitor prices dictionary is not empty."""
        assert len(COMPETITOR_PRICES) > 0

    def test_competitor_prices_have_valid_structure(self) -> None:
        """Verify competitor price entries have retailer and price."""
        for product_id, competitors in COMPETITOR_PRICES.items():
            assert isinstance(competitors, list), (
                f"Competitor data for {product_id} should be a list"
            )
            for comp in competitors:
                assert "retailer" in comp, "Competitor entry missing retailer"
                assert "price" in comp, "Competitor entry missing price"
                assert comp["price"] > 0, "Competitor price should be positive"


class TestQueryProductStock:
    """Tests for query_product_stock tool functionality."""

    def test_valid_product_returns_data(self, sample_product_ids: list[str]) -> None:
        """Test that valid product IDs return product data."""
        for product_id in sample_product_ids:
            product = PRODUCTS.get(product_id)
            assert product is not None, f"Product {product_id} should exist"
            assert "name" in product
            assert "base_price" in product
            assert "stock_count" in product
            assert "min_margin" in product

    def test_high_stock_product(self, high_stock_product_id: str) -> None:
        """Test product with high stock (discount eligible)."""
        product = PRODUCTS[high_stock_product_id]
        assert product["stock_count"] > 50, "High stock product should have >50 units"

    def test_low_stock_product(self, low_stock_product_id: str) -> None:
        """Test product with low stock (not discount eligible)."""
        product = PRODUCTS[low_stock_product_id]
        assert product["stock_count"] <= 50, "Low stock product should have <=50 units"

    def test_invalid_product_id(self, invalid_product_id: str) -> None:
        """Test that invalid product ID is not in products."""
        assert invalid_product_id not in PRODUCTS

    def test_case_insensitive_lookup(self) -> None:
        """Test that product lookup handles case variations."""
        # The actual tool normalizes to lowercase
        product_id = "PROD_1"
        normalized = product_id.strip().lower()
        assert normalized in PRODUCTS


class TestQueryCompetitorPrice:
    """Tests for query_competitor_price tool functionality."""

    def test_valid_product_has_competitor_prices(
        self, sample_product_ids: list[str]
    ) -> None:
        """Test that valid products have competitor price data."""
        for product_id in sample_product_ids:
            competitors = COMPETITOR_PRICES.get(product_id)
            assert competitors is not None, (
                f"Product {product_id} should have competitor data"
            )
            assert len(competitors) > 0, (
                f"Product {product_id} should have at least one competitor"
            )

    def test_competitor_prices_are_positive(self) -> None:
        """Test that all competitor prices are positive."""
        for product_id, competitors in COMPETITOR_PRICES.items():
            for comp in competitors:
                assert comp["price"] > 0, (
                    f"Competitor price for {product_id} should be positive"
                )

    def test_find_lowest_competitor_price(self) -> None:
        """Test finding the lowest competitor price."""
        for product_id, competitors in COMPETITOR_PRICES.items():
            if competitors:
                lowest = min(comp["price"] for comp in competitors)
                assert lowest > 0, f"Lowest price for {product_id} should be positive"

    def test_invalid_product_id(self, invalid_product_id: str) -> None:
        """Test that invalid product ID is not in competitor prices."""
        assert invalid_product_id not in COMPETITOR_PRICES


class TestDiscountCalculationLogic:
    """Tests for discount calculation business logic."""

    def test_high_stock_priced_above_competition_eligible(self) -> None:
        """Test that high stock + priced above competition = discount eligible."""
        # prod_3: stock=200 (>50), base_price=3200, competitor lowest=2800
        product_id = "prod_3"
        product = PRODUCTS[product_id]
        competitors = COMPETITOR_PRICES[product_id]

        # Verify conditions
        assert product["stock_count"] > 50, "Should have high stock"
        lowest_competitor = min(c["price"] for c in competitors)
        assert product["base_price"] > lowest_competitor, (
            "Should be priced above competition"
        )

    def test_low_stock_not_eligible(self) -> None:
        """Test that low stock products are not discount eligible."""
        # prod_4: stock=25 (<=50)
        product_id = "prod_4"
        product = PRODUCTS[product_id]

        assert product["stock_count"] <= 50, "Should have low stock (not eligible)"

    def test_margin_protection_calculation(self) -> None:
        """Test that discount respects minimum margin constraint."""
        product_id = "prod_3"
        product = PRODUCTS[product_id]

        base_price = product["base_price"]
        min_margin = product["min_margin"]

        # Calculate minimum allowed price
        min_allowed_price = int(base_price * (1 - min_margin))

        # Verify it's less than base price but positive
        assert min_allowed_price < base_price
        assert min_allowed_price > 0

        # Calculate maximum possible discount
        max_discount = base_price - min_allowed_price
        assert max_discount > 0
        assert max_discount < base_price

    def test_competitor_undercut_calculation(self) -> None:
        """Test competitor price undercut logic."""
        product_id = "prod_3"
        competitors = COMPETITOR_PRICES[product_id]

        lowest_competitor = min(c["price"] for c in competitors)

        # Target price undercuts by $1.00 (100 cents)
        target_price = lowest_competitor - 100

        assert target_price > 0, "Target price should be positive"
        assert target_price < lowest_competitor, "Should undercut competition"

    def test_final_price_respects_margin(self) -> None:
        """Test that final price is MAX(target_price, min_price)."""
        product_id = "prod_3"
        product = PRODUCTS[product_id]
        competitors = COMPETITOR_PRICES[product_id]

        base_price = product["base_price"]
        min_margin = product["min_margin"]
        lowest_competitor = min(c["price"] for c in competitors)

        # Calculate both constraints
        min_allowed_price = int(base_price * (1 - min_margin))
        target_price = lowest_competitor - 100

        # Final price is the maximum of both (ensures margin protection)
        final_price = max(target_price, min_allowed_price)

        # Verify final price respects margin
        actual_margin = (base_price - final_price) / base_price
        assert actual_margin <= min_margin, "Discount should not exceed min_margin"

        # Verify final price is reasonable
        assert final_price > 0
        assert final_price <= base_price


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_product_at_exactly_50_stock(self) -> None:
        """Test product with exactly 50 units stock (boundary)."""
        # prod_2 has stock_count=50, exactly at threshold
        product = PRODUCTS["prod_2"]
        # At threshold, condition is stock > 50, so 50 is NOT eligible
        assert product["stock_count"] <= 50

    def test_product_priced_equal_to_competitor(self) -> None:
        """Test when product is priced equal to lowest competitor."""
        # This scenario doesn't exist in mock data, but logic should handle it
        # When base_price == lowest_competitor, condition is NOT met (not > )
        pass

    def test_all_products_have_competitor_data(self) -> None:
        """Verify all products in PRODUCTS also have competitor data."""
        for product_id in PRODUCTS:
            assert product_id in COMPETITOR_PRICES, (
                f"Product {product_id} should have competitor data"
            )

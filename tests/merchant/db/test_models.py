"""Tests for SQLModel database models."""

from datetime import UTC, datetime

import pytest

from src.merchant.db.models import (
    CheckoutSession,
    CheckoutStatus,
    CompetitorPrice,
    Product,
)


class TestProductModel:
    """Test suite for the Product model."""

    def test_product_creation_with_all_fields(self) -> None:
        """Happy path: Product can be created with all required fields."""
        product = Product(
            id="prod_test",
            sku="TEST-001",
            name="Test Product",
            base_price=1000,
            stock_count=50,
            min_margin=0.10,
            image_url="https://example.com/image.png",
        )

        assert product.id == "prod_test"
        assert product.sku == "TEST-001"
        assert product.name == "Test Product"
        assert product.base_price == 1000
        assert product.stock_count == 50
        assert product.min_margin == 0.10
        assert product.image_url == "https://example.com/image.png"

    def test_product_price_in_cents(self) -> None:
        """Edge case: Product price is stored in cents."""
        product = Product(
            id="prod_cents",
            sku="CENTS-001",
            name="Cents Test",
            base_price=2500,
            stock_count=10,
            min_margin=0.15,
            image_url="https://example.com/image.png",
        )

        assert product.base_price == 2500
        assert product.base_price / 100 == 25.00

    def test_product_min_margin_as_decimal(self) -> None:
        """Edge case: Minimum margin is stored as decimal (0.15 = 15%)."""
        product = Product(
            id="prod_margin",
            sku="MARGIN-001",
            name="Margin Test",
            base_price=1000,
            stock_count=10,
            min_margin=0.15,
            image_url="https://example.com/image.png",
        )

        assert product.min_margin == 0.15
        assert product.min_margin * 100 == 15.0


class TestCompetitorPriceModel:
    """Test suite for the CompetitorPrice model."""

    def test_competitor_price_creation(self) -> None:
        """Happy path: CompetitorPrice can be created with required fields."""
        now = datetime.now(UTC)
        competitor_price = CompetitorPrice(
            product_id="prod_1",
            retailer_name="TestRetailer",
            price=2400,
            updated_at=now,
        )

        assert competitor_price.id is None
        assert competitor_price.product_id == "prod_1"
        assert competitor_price.retailer_name == "TestRetailer"
        assert competitor_price.price == 2400
        assert competitor_price.updated_at == now

    def test_competitor_price_default_updated_at(self) -> None:
        """Edge case: CompetitorPrice gets default updated_at if not provided."""
        competitor_price = CompetitorPrice(
            product_id="prod_1",
            retailer_name="TestRetailer",
            price=2400,
        )

        assert competitor_price.updated_at is not None
        assert isinstance(competitor_price.updated_at, datetime)


class TestCheckoutSessionModel:
    """Test suite for the CheckoutSession model."""

    def test_checkout_session_creation_with_defaults(self) -> None:
        """Happy path: CheckoutSession has sensible defaults."""
        session = CheckoutSession(id="checkout_test")

        assert session.id == "checkout_test"
        assert session.status == CheckoutStatus.NOT_READY_FOR_PAYMENT
        assert session.currency == "USD"
        assert session.locale == "en-US"
        assert session.line_items_json == "[]"
        assert session.buyer_json is None
        assert session.fulfillment_address_json is None
        assert session.fulfillment_options_json == "[]"
        assert session.selected_fulfillment_option_id is None
        assert session.totals_json == "{}"
        assert session.order_json is None
        assert session.messages_json == "[]"
        assert session.links_json == "[]"
        assert session.metadata_json == "{}"

    def test_checkout_session_status_transitions(self) -> None:
        """Edge case: CheckoutSession status can be set to any valid status."""
        session = CheckoutSession(id="checkout_status")

        assert session.status == CheckoutStatus.NOT_READY_FOR_PAYMENT

        session.status = CheckoutStatus.READY_FOR_PAYMENT
        assert session.status == CheckoutStatus.READY_FOR_PAYMENT

        session.status = CheckoutStatus.COMPLETED
        assert session.status == CheckoutStatus.COMPLETED

        session.status = CheckoutStatus.CANCELED
        assert session.status == CheckoutStatus.CANCELED

    def test_checkout_session_timestamps(self) -> None:
        """Edge case: CheckoutSession has created_at and updated_at timestamps."""
        session = CheckoutSession(id="checkout_timestamps")

        assert session.created_at is not None
        assert session.updated_at is not None
        assert isinstance(session.created_at, datetime)
        assert isinstance(session.updated_at, datetime)


class TestCheckoutStatusEnum:
    """Test suite for the CheckoutStatus enum."""

    def test_checkout_status_values(self) -> None:
        """Happy path: CheckoutStatus has correct string values."""
        assert CheckoutStatus.NOT_READY_FOR_PAYMENT.value == "not_ready_for_payment"
        assert CheckoutStatus.READY_FOR_PAYMENT.value == "ready_for_payment"
        assert CheckoutStatus.COMPLETED.value == "completed"
        assert CheckoutStatus.CANCELED.value == "canceled"

    def test_checkout_status_is_string_enum(self) -> None:
        """Edge case: CheckoutStatus values are strings."""
        for status in CheckoutStatus:
            assert isinstance(status.value, str)

    @pytest.mark.parametrize(
        "status_value",
        ["not_ready_for_payment", "ready_for_payment", "completed", "canceled"],
    )
    def test_checkout_status_from_string(self, status_value: str) -> None:
        """Edge case: CheckoutStatus can be created from string value."""
        status = CheckoutStatus(status_value)
        assert status.value == status_value

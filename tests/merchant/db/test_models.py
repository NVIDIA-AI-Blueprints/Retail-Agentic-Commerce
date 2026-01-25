"""Tests for SQLModel database models."""

from datetime import UTC, datetime

import pytest

from src.merchant.db.models import (
    BrowseHistory,
    CheckoutSession,
    CheckoutStatus,
    CompetitorPrice,
    Customer,
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


class TestCustomerModel:
    """Test suite for the Customer model."""

    def test_customer_creation_with_all_fields(self) -> None:
        """Happy path: Customer can be created with all required fields."""
        now = datetime.now(UTC)
        customer = Customer(
            id="cust_test",
            email="test@example.com",
            name="Test User",
            created_at=now,
        )

        assert customer.id == "cust_test"
        assert customer.email == "test@example.com"
        assert customer.name == "Test User"
        assert customer.created_at == now

    def test_customer_default_created_at(self) -> None:
        """Edge case: Customer gets default created_at if not provided."""
        customer = Customer(
            id="cust_default",
            email="default@example.com",
            name="Default User",
        )

        assert customer.created_at is not None
        assert isinstance(customer.created_at, datetime)

    def test_customer_browse_history_relationship(self) -> None:
        """Edge case: Customer has browse_history relationship initialized."""
        customer = Customer(
            id="cust_rel",
            email="rel@example.com",
            name="Relationship User",
        )

        # Relationship is initialized as empty list
        assert customer.browse_history == []


class TestBrowseHistoryModel:
    """Test suite for the BrowseHistory model."""

    def test_browse_history_creation_with_all_fields(self) -> None:
        """Happy path: BrowseHistory can be created with all fields."""
        now = datetime.now(UTC)
        entry = BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="casual wear",
            product_id="prod_1",
            price_viewed=2500,
            viewed_at=now,
        )

        assert entry.id is None  # Auto-generated on insert
        assert entry.customer_id == "cust_1"
        assert entry.category == "tops"
        assert entry.search_term == "casual wear"
        assert entry.product_id == "prod_1"
        assert entry.price_viewed == 2500
        assert entry.viewed_at == now

    def test_browse_history_minimal_fields(self) -> None:
        """Edge case: BrowseHistory works with only required fields."""
        entry = BrowseHistory(
            customer_id="cust_1",
            category="bottoms",
        )

        assert entry.customer_id == "cust_1"
        assert entry.category == "bottoms"
        assert entry.search_term is None
        assert entry.product_id is None
        assert entry.price_viewed == 0
        assert entry.viewed_at is not None

    def test_browse_history_price_in_cents(self) -> None:
        """Edge case: BrowseHistory price is stored in cents."""
        entry = BrowseHistory(
            customer_id="cust_1",
            category="tops",
            price_viewed=3500,
        )

        assert entry.price_viewed == 3500
        assert entry.price_viewed / 100 == 35.00

    def test_browse_history_default_viewed_at(self) -> None:
        """Edge case: BrowseHistory gets default viewed_at if not provided."""
        entry = BrowseHistory(
            customer_id="cust_1",
            category="accessories",
        )

        assert entry.viewed_at is not None
        assert isinstance(entry.viewed_at, datetime)

    @pytest.mark.parametrize(
        "category",
        ["tops", "bottoms", "accessories", "footwear", "outerwear"],
    )
    def test_browse_history_various_categories(self, category: str) -> None:
        """Happy path: BrowseHistory accepts various category values."""
        entry = BrowseHistory(
            customer_id="cust_1",
            category=category,
        )

        assert entry.category == category

"""SQLModel database models for the Agentic Commerce middleware."""

from datetime import UTC, datetime
from enum import Enum
from typing import ClassVar

from sqlmodel import Field, Relationship, SQLModel


def _utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(UTC)


class CheckoutStatus(str, Enum):
    """Checkout session status as per ACP specification."""

    NOT_READY_FOR_PAYMENT = "not_ready_for_payment"
    READY_FOR_PAYMENT = "ready_for_payment"
    COMPLETED = "completed"
    CANCELED = "canceled"


class Product(SQLModel, table=True):
    """Product model representing items available for purchase.

    Attributes:
        id: Unique product identifier (e.g., "prod_1")
        sku: Stock keeping unit code
        name: Product display name
        base_price: Base price in cents (e.g., 2500 = $25.00)
        stock_count: Current inventory quantity
        min_margin: Minimum profit margin (e.g., 0.15 = 15%)
        image_url: URL to product image
    """

    id: str = Field(primary_key=True)
    sku: str = Field(unique=True, index=True)
    name: str
    base_price: int
    stock_count: int
    min_margin: float
    image_url: str

    competitor_prices: list["CompetitorPrice"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class CompetitorPrice(SQLModel, table=True):
    """Competitor pricing data for dynamic pricing logic.

    Attributes:
        id: Auto-generated primary key
        product_id: Foreign key to Product
        retailer_name: Name of the competing retailer
        price: Competitor's price in cents
        updated_at: Timestamp of last price update
    """

    __tablename__: ClassVar[str] = "competitor_price"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    product_id: str = Field(foreign_key="product.id", index=True)
    retailer_name: str
    price: int
    updated_at: datetime = Field(default_factory=_utc_now)

    product: Product | None = Relationship(back_populates="competitor_prices")


class CheckoutSession(SQLModel, table=True):
    """Checkout session model representing the ACP checkout state.

    Attributes:
        id: Unique session identifier (e.g., "checkout_abc123")
        status: Current checkout status
        currency: ISO 4217 currency code (default: USD)
        locale: BCP 47 language tag (default: en-US)
        line_items_json: JSON string of line items array
        buyer_json: JSON string of buyer information
        fulfillment_address_json: JSON string of shipping address
        fulfillment_options_json: JSON string of available shipping options
        selected_fulfillment_option_id: ID of selected shipping option
        totals_json: JSON string of price totals
        order_json: JSON string of order details (after completion)
        messages_json: JSON string of messages array
        links_json: JSON string of HATEOAS links
        metadata_json: JSON string of additional metadata
        created_at: Session creation timestamp
        updated_at: Last modification timestamp
        expires_at: Session expiration timestamp
    """

    __tablename__: ClassVar[str] = "checkout_session"  # type: ignore[assignment]

    id: str = Field(primary_key=True)
    status: CheckoutStatus = Field(default=CheckoutStatus.NOT_READY_FOR_PAYMENT)
    currency: str = Field(default="USD")
    locale: str = Field(default="en-US")

    line_items_json: str = Field(default="[]")
    buyer_json: str | None = Field(default=None)
    fulfillment_address_json: str | None = Field(default=None)
    fulfillment_options_json: str = Field(default="[]")
    selected_fulfillment_option_id: str | None = Field(default=None)
    totals_json: str = Field(default="{}")
    order_json: str | None = Field(default=None)
    messages_json: str = Field(default="[]")
    links_json: str = Field(default="[]")
    metadata_json: str = Field(default="{}")

    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)
    expires_at: datetime | None = Field(default=None)

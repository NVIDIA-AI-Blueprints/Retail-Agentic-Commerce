"""SQLModel database models for the Agentic Commerce middleware."""

from datetime import UTC, datetime
from enum import StrEnum
from typing import ClassVar, Optional

from sqlmodel import Field, Relationship, SQLModel


def _utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(UTC)


class CheckoutStatus(StrEnum):
    """Checkout session status as per ACP specification."""

    NOT_READY_FOR_PAYMENT = "not_ready_for_payment"
    READY_FOR_PAYMENT = "ready_for_payment"
    COMPLETED = "completed"
    CANCELED = "canceled"


class AgentInvocationStatus(StrEnum):
    """Normalized status for recorded agent invocations."""

    SUCCESS = "success"
    FALLBACK_SUCCESS = "fallback_success"
    ERROR_TIMEOUT = "error_timeout"
    ERROR_UPSTREAM = "error_upstream"
    ERROR_VALIDATION = "error_validation"
    ERROR_INTERNAL = "error_internal"


class AgentInvocationChannel(StrEnum):
    """Invocation channel for agent calls."""

    ACP = "acp"
    APPS_SDK = "apps_sdk"
    UCP = "ucp"


class RecommendationAttributionEventType(StrEnum):
    """Lifecycle events for recommendation attribution."""

    IMPRESSION = "impression"
    CLICK = "click"
    PURCHASE = "purchase"


class Customer(SQLModel, table=True):
    """Customer model representing shoppers in the system.

    Attributes:
        id: Unique customer identifier (e.g., "cust_1")
        email: Customer email address
        name: Customer display name
        created_at: Account creation timestamp
    """

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=_utc_now)

    browse_history: list["BrowseHistory"] = Relationship(
        back_populates="customer",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class BrowseHistory(SQLModel, table=True):
    """Browse history model for tracking customer browsing behavior.

    Used by the recommendation agent to understand user preferences.
    Price range can be computed from min/max of prices in browse history.

    Attributes:
        id: Auto-generated primary key
        customer_id: Foreign key to Customer
        category: Product category viewed (e.g., "tops", "bottoms")
        search_term: Optional search term used (e.g., "casual wear")
        product_id: Optional product ID if specific product was viewed
        price_viewed: Price of product viewed in cents (for price range computation)
        viewed_at: Timestamp when item was viewed
    """

    __tablename__: ClassVar[str] = "browse_history"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    customer_id: str = Field(foreign_key="customer.id", index=True)
    category: str = Field(index=True)
    search_term: str | None = Field(default=None)
    product_id: str | None = Field(default=None, foreign_key="product.id")
    price_viewed: int = Field(default=0)  # Price in cents
    viewed_at: datetime = Field(default_factory=_utc_now)

    customer: Optional["Customer"] = Relationship(back_populates="browse_history")
    product: Optional["Product"] = Relationship(back_populates="browse_views")


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
    browse_views: list["BrowseHistory"] = Relationship(back_populates="product")


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
        protocol: Protocol origin ("acp" or "ucp")
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
    protocol: str = Field(default="acp")
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


class AgentInvocationOutcome(SQLModel, table=True):
    """Recorded outcome for each agent invocation."""

    __tablename__: ClassVar[str] = "agent_invocation_outcome"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=_utc_now, index=True)
    agent_type: str = Field(index=True)
    channel: AgentInvocationChannel = Field(
        default=AgentInvocationChannel.ACP, index=True
    )
    status: AgentInvocationStatus = Field(
        default=AgentInvocationStatus.SUCCESS, index=True
    )
    latency_ms: int = Field(default=0)

    request_id: str | None = Field(default=None, index=True)
    session_id: str | None = Field(default=None, index=True)
    error_code: str | None = Field(default=None, index=True)


class RecommendationAttributionEvent(SQLModel, table=True):
    """Recommendation attribution event for conversion funnel analytics."""

    __tablename__: ClassVar[str] = "recommendation_attribution_event"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=_utc_now, index=True)
    event_type: RecommendationAttributionEventType = Field(
        default=RecommendationAttributionEventType.IMPRESSION,
        index=True,
    )
    session_id: str | None = Field(default=None, index=True)
    recommendation_request_id: str | None = Field(default=None, index=True)
    product_id: str = Field(index=True)
    position: int | None = Field(default=None)
    order_id: str | None = Field(default=None, index=True)
    quantity: int = Field(default=1)
    revenue_cents: int = Field(default=0)
    source: str = Field(default="apps_sdk", index=True)

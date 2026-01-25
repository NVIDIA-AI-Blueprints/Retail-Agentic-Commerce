"""Database connection and session management for the Agentic Commerce middleware."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta

from sqlmodel import Session, SQLModel, create_engine, select

from src.merchant.config import get_settings
from src.merchant.db.models import BrowseHistory, CompetitorPrice, Customer, Product

# Create engine lazily to allow settings to be loaded
_engine = None


def get_engine():
    """Get or create the database engine.

    Returns:
        Engine: SQLAlchemy engine instance.
    """
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.database_url,
            echo=settings.debug,
            connect_args={"check_same_thread": False},
        )
    return _engine


def get_session() -> Generator[Session, None, None]:
    """Get a database session.

    Yields:
        Session: A SQLModel session for database operations.
    """
    with Session(get_engine()) as session:
        yield session


def init_db() -> None:
    """Initialize the database by creating all tables."""
    SQLModel.metadata.create_all(get_engine())


def seed_data(session: Session) -> None:
    """Seed the database with initial product and competitor price data.

    Args:
        session: Database session for operations.
    """
    existing_product = session.exec(select(Product).limit(1)).first()
    if existing_product is not None:
        return

    products = [
        Product(
            id="prod_1",
            sku="TS-001",
            name="Classic Tee",
            base_price=2500,
            stock_count=100,
            min_margin=0.15,
            image_url="https://placehold.co/400x400/png?text=Classic+Tee",
        ),
        Product(
            id="prod_2",
            sku="TS-002",
            name="V-Neck Tee",
            base_price=2800,
            stock_count=50,
            min_margin=0.12,
            image_url="https://placehold.co/400x400/png?text=V-Neck+Tee",
        ),
        Product(
            id="prod_3",
            sku="TS-003",
            name="Graphic Tee",
            base_price=3200,
            stock_count=200,
            min_margin=0.18,
            image_url="https://placehold.co/400x400/png?text=Graphic+Tee",
        ),
        Product(
            id="prod_4",
            sku="TS-004",
            name="Premium Tee",
            base_price=4500,
            stock_count=25,
            min_margin=0.20,
            image_url="https://placehold.co/400x400/png?text=Premium+Tee",
        ),
    ]

    for product in products:
        session.add(product)

    session.commit()

    competitor_prices = [
        CompetitorPrice(
            product_id="prod_1",
            retailer_name="FashionMart",
            price=2400,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_1",
            retailer_name="StyleHub",
            price=2600,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_2",
            retailer_name="FashionMart",
            price=2700,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_2",
            retailer_name="TrendyWear",
            price=2900,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="StyleHub",
            price=3000,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="FashionMart",
            price=3100,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="TrendyWear",
            price=3300,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_4",
            retailer_name="StyleHub",
            price=4300,
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_4",
            retailer_name="TrendyWear",
            price=4600,
            updated_at=datetime.now(UTC),
        ),
    ]

    for competitor_price in competitor_prices:
        session.add(competitor_price)

    session.commit()

    # Seed customer data
    customer = Customer(
        id="cust_1",
        email="demo@example.com",
        name="Demo Shopper",
        created_at=datetime.now(UTC),
    )
    session.add(customer)
    session.commit()

    # Seed browse history for demo customer
    # Simulates a customer browsing casual/summer clothes over the past week
    base_time = datetime.now(UTC)
    browse_entries = [
        # Day 1: Browsing casual tops
        BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="casual wear",
            product_id="prod_1",
            price_viewed=2500,
            viewed_at=base_time - timedelta(days=6, hours=14),
        ),
        BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="summer clothes",
            product_id="prod_2",
            price_viewed=2800,
            viewed_at=base_time - timedelta(days=6, hours=13),
        ),
        # Day 2: Looking at graphic tees
        BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="graphic tee",
            product_id="prod_3",
            price_viewed=3200,
            viewed_at=base_time - timedelta(days=5, hours=10),
        ),
        # Day 3: Exploring bottoms to match
        BrowseHistory(
            customer_id="cust_1",
            category="bottoms",
            search_term="casual shorts",
            price_viewed=3500,
            viewed_at=base_time - timedelta(days=4, hours=16),
        ),
        BrowseHistory(
            customer_id="cust_1",
            category="bottoms",
            search_term="summer pants",
            price_viewed=4000,
            viewed_at=base_time - timedelta(days=4, hours=15),
        ),
        # Day 4: Back to tops, different style
        BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="v-neck",
            product_id="prod_2",
            price_viewed=2800,
            viewed_at=base_time - timedelta(days=3, hours=20),
        ),
        # Day 5: Looking at accessories
        BrowseHistory(
            customer_id="cust_1",
            category="accessories",
            search_term="summer accessories",
            price_viewed=2000,
            viewed_at=base_time - timedelta(days=2, hours=11),
        ),
        # Day 6: Checking premium options
        BrowseHistory(
            customer_id="cust_1",
            category="tops",
            search_term="premium tee",
            product_id="prod_4",
            price_viewed=4500,
            viewed_at=base_time - timedelta(days=1, hours=9),
        ),
        # Today: More casual browsing
        BrowseHistory(
            customer_id="cust_1",
            category="bottoms",
            search_term="joggers",
            price_viewed=3800,
            viewed_at=base_time - timedelta(hours=3),
        ),
        BrowseHistory(
            customer_id="cust_1",
            category="footwear",
            search_term="casual sneakers",
            price_viewed=5500,
            viewed_at=base_time - timedelta(hours=1),
        ),
    ]

    for entry in browse_entries:
        session.add(entry)

    session.commit()


def init_and_seed_db() -> None:
    """Initialize the database and seed with initial data."""
    init_db()
    with Session(get_engine()) as session:
        seed_data(session)


def reset_engine() -> None:
    """Reset the database engine. Useful for testing."""
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None

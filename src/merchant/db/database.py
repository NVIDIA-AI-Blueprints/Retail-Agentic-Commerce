"""Database connection and session management for the Agentic Commerce middleware."""

from collections.abc import Generator
from datetime import UTC, datetime

from sqlmodel import Session, SQLModel, create_engine, select

from src.merchant.config import get_settings
from src.merchant.db.models import CompetitorPrice, Product

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

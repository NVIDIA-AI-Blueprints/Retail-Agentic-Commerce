"""Database connection and session management for the Agentic Commerce middleware."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta

from sqlmodel import Session, SQLModel, create_engine, select

from src.data.product_catalog import PRODUCTS
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
            echo=settings.log_sql,  # Only log SQL when explicitly enabled
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

    # Import products from shared catalog
    for p in PRODUCTS:
        session.add(
            Product(
                id=p["id"],
                sku=p["sku"],
                name=p["name"],
                base_price=p["price_cents"],
                stock_count=p["stock_count"],
                min_margin=p["min_margin"],
                image_url=p["image_url"],
                lifecycle=p["lifecycle"],
                demand_velocity=p["demand_velocity"],
            )
        )

    session.commit()

    # Competitor pricing data for all products
    # Prices are strategically set to demonstrate promotion scenarios:
    # - Some competitors are cheaper (triggers price match discounts)
    # - Some competitors are same price (triggers small incentive discounts)
    # - Some competitors are more expensive (no discount needed)
    competitor_prices = [
        # --- Tops: T-Shirts (prod_1 to prod_4) ---
        # prod_1: Classic Tee ($25.00) - Competitors cheaper, should trigger discount
        CompetitorPrice(
            product_id="prod_1",
            retailer_name="FashionMart",
            price=2400,  # $24.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_1",
            retailer_name="StyleHub",
            price=2350,  # $23.50 - cheapest
            updated_at=datetime.now(UTC),
        ),
        # prod_2: V-Neck Tee ($28.00) - One cheaper, one same
        CompetitorPrice(
            product_id="prod_2",
            retailer_name="FashionMart",
            price=2700,  # $27.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_2",
            retailer_name="TrendyWear",
            price=2800,  # $28.00 - same price
            updated_at=datetime.now(UTC),
        ),
        # prod_3: Graphic Tee ($32.00) - Competitors cheaper, good discount demo
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="StyleHub",
            price=3000,  # $30.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="FashionMart",
            price=2950,  # $29.50 - cheapest
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_3",
            retailer_name="TrendyWear",
            price=3100,  # $31.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # prod_4: Premium Tee ($45.00) - Mixed pricing
        CompetitorPrice(
            product_id="prod_4",
            retailer_name="StyleHub",
            price=4300,  # $43.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_4",
            retailer_name="TrendyWear",
            price=4600,  # $46.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # --- Bottoms (prod_5 to prod_8) ---
        # prod_5: Classic Denim Jeans ($59.00) - Competitors cheaper
        CompetitorPrice(
            product_id="prod_5",
            retailer_name="DenimDirect",
            price=5500,  # $55.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_5",
            retailer_name="JeansWorld",
            price=5700,  # $57.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # prod_6: Khaki Chinos ($45.00) - Same and cheaper mix
        CompetitorPrice(
            product_id="prod_6",
            retailer_name="FashionMart",
            price=4400,  # $44.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_6",
            retailer_name="StyleHub",
            price=4500,  # $45.00 - same
            updated_at=datetime.now(UTC),
        ),
        # prod_7: Cargo Shorts ($35.00) - All more expensive (no discount)
        CompetitorPrice(
            product_id="prod_7",
            retailer_name="FashionMart",
            price=3700,  # $37.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_7",
            retailer_name="OutdoorGear",
            price=3900,  # $39.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # prod_8: Athletic Joggers ($42.00) - Competitor cheaper
        CompetitorPrice(
            product_id="prod_8",
            retailer_name="SportStyle",
            price=3900,  # $39.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_8",
            retailer_name="AthleticWear",
            price=4100,  # $41.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # --- Outerwear (prod_9 to prod_11) ---
        # prod_9: Denim Jacket ($75.00) - Competitors cheaper
        CompetitorPrice(
            product_id="prod_9",
            retailer_name="DenimDirect",
            price=7200,  # $72.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_9",
            retailer_name="JeansWorld",
            price=7000,  # $70.00 - cheapest
            updated_at=datetime.now(UTC),
        ),
        # prod_10: Lightweight Hoodie ($55.00) - Mixed
        CompetitorPrice(
            product_id="prod_10",
            retailer_name="StyleHub",
            price=5200,  # $52.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_10",
            retailer_name="FashionMart",
            price=5600,  # $56.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # prod_11: Bomber Jacket ($89.00) - All more expensive
        CompetitorPrice(
            product_id="prod_11",
            retailer_name="StyleHub",
            price=9200,  # $92.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_11",
            retailer_name="TrendyWear",
            price=9500,  # $95.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # --- Accessories (prod_12 to prod_14) ---
        # prod_12: Canvas Belt ($18.00) - Competitors cheaper
        CompetitorPrice(
            product_id="prod_12",
            retailer_name="AccessoryZone",
            price=1650,  # $16.50 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_12",
            retailer_name="FashionMart",
            price=1750,  # $17.50 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # prod_13: Classic Sunglasses ($22.00) - Same price
        CompetitorPrice(
            product_id="prod_13",
            retailer_name="ShadesPlus",
            price=2200,  # $22.00 - same
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_13",
            retailer_name="EyewearExpress",
            price=2100,  # $21.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # prod_14: Baseball Cap ($15.00) - More expensive competitors
        CompetitorPrice(
            product_id="prod_14",
            retailer_name="CapCity",
            price=1700,  # $17.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_14",
            retailer_name="HeadwearHub",
            price=1600,  # $16.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # --- Footwear (prod_15 to prod_17) ---
        # prod_15: Canvas Sneakers ($49.00) - Competitors cheaper
        CompetitorPrice(
            product_id="prod_15",
            retailer_name="ShoeWarehouse",
            price=4500,  # $45.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_15",
            retailer_name="FootwearFactory",
            price=4700,  # $47.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        # prod_16: Leather Loafers ($85.00) - Mixed pricing
        CompetitorPrice(
            product_id="prod_16",
            retailer_name="ShoeWarehouse",
            price=8200,  # $82.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_16",
            retailer_name="FootwearFactory",
            price=8800,  # $88.00 - more expensive
            updated_at=datetime.now(UTC),
        ),
        # prod_17: Athletic Running Shoes ($95.00) - Competitor cheaper
        CompetitorPrice(
            product_id="prod_17",
            retailer_name="SportStyle",
            price=8900,  # $89.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_17",
            retailer_name="AthleticWear",
            price=9200,  # $92.00 - cheaper
            updated_at=datetime.now(UTC),
        ),
        CompetitorPrice(
            product_id="prod_17",
            retailer_name="RunnersPro",
            price=9400,  # $94.00 - cheaper
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

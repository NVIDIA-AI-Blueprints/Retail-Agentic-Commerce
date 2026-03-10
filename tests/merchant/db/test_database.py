# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Tests for database initialization and session management."""

import contextlib
import os
import tempfile
from collections.abc import Generator
from unittest.mock import patch

import pytest
from sqlmodel import Session, select

from src.data.product_catalog import PRODUCTS
from src.merchant.db.database import (
    get_engine,
    get_session,
    init_and_seed_db,
    init_db,
    reset_engine,
    seed_data,
)
from src.merchant.db.models import (
    BrowseHistory,
    CheckoutSession,
    CompetitorPrice,
    Customer,
    Product,
)


@pytest.fixture
def temp_db_url() -> Generator[str, None, None]:
    """Create a temporary database file for testing.

    Yields:
        str: SQLite connection URL for the temporary database.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        temp_path = f.name

    db_url = f"sqlite:///{temp_path}"
    yield db_url

    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def reset_db_engine() -> Generator[None, None, None]:
    """Reset the database engine before and after each test.

    Yields:
        None
    """
    reset_engine()
    yield
    reset_engine()


@pytest.mark.usefixtures("reset_db_engine")
class TestDatabaseInitialization:
    """Test suite for database initialization."""

    def test_init_db_creates_tables(self, temp_db_url: str) -> None:
        """Happy path: init_db creates all required tables."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                products = session.exec(select(Product)).all()
                assert products == []

                competitor_prices = session.exec(select(CompetitorPrice)).all()
                assert competitor_prices == []

                checkout_sessions = session.exec(select(CheckoutSession)).all()
                assert checkout_sessions == []

    def test_init_db_is_idempotent(self, temp_db_url: str) -> None:
        """Edge case: Calling init_db multiple times does not raise errors."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()
            init_db()
            init_db()


@pytest.mark.usefixtures("reset_db_engine")
class TestSeedData:
    """Test suite for database seeding."""

    def test_seed_data_creates_products(self, temp_db_url: str) -> None:
        """Happy path: seed_data creates all products from shared catalog."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                seed_data(session)

                products = session.exec(select(Product)).all()
                assert len(products) == len(PRODUCTS)

    def test_seed_data_creates_competitor_prices(self, temp_db_url: str) -> None:
        """Happy path: seed_data creates competitor prices for products."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                seed_data(session)

                competitor_prices = session.exec(select(CompetitorPrice)).all()
                assert len(competitor_prices) > 0

    def test_seed_data_is_idempotent(self, temp_db_url: str) -> None:
        """Edge case: Calling seed_data multiple times does not duplicate data."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                seed_data(session)
                seed_data(session)
                seed_data(session)

                products = session.exec(select(Product)).all()
                assert len(products) == len(PRODUCTS)

    def test_seed_data_product_fields(self, temp_db_url: str) -> None:
        """Happy path: Seeded products have correct field values."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                seed_data(session)

                classic_tee = session.exec(
                    select(Product).where(Product.id == "prod_1")
                ).first()

                assert classic_tee is not None
                assert classic_tee.sku == "TS-001"
                assert classic_tee.name == "Classic Tee"
                assert classic_tee.base_price == 2500
                assert classic_tee.stock_count == 100
                assert classic_tee.min_margin == 0.15
                assert classic_tee.image_url == "/prod_1.jpeg"

    def test_seed_data_image_urls_match_catalog(self, temp_db_url: str) -> None:
        """Happy path: All products have image URLs from shared catalog."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            engine = get_engine()
            with Session(engine) as session:
                seed_data(session)

                products = session.exec(select(Product)).all()

                # Build lookup from catalog
                catalog_images = {p["id"]: p["image_url"] for p in PRODUCTS}

                for product in products:
                    assert product.image_url == catalog_images[product.id]


@pytest.mark.usefixtures("reset_db_engine")
class TestGetSession:
    """Test suite for get_session dependency."""

    def test_get_session_yields_session(self, temp_db_url: str) -> None:
        """Happy path: get_session yields a valid Session object."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_db()

            session_gen = get_session()
            session = next(session_gen)

            assert isinstance(session, Session)

            with contextlib.suppress(StopIteration):
                next(session_gen)


@pytest.mark.usefixtures("reset_db_engine")
class TestInitAndSeedDb:
    """Test suite for init_and_seed_db convenience function."""

    def test_init_and_seed_db_initializes_and_seeds(self, temp_db_url: str) -> None:
        """Happy path: init_and_seed_db creates tables and seeds data."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                products = session.exec(select(Product)).all()
                assert len(products) == len(PRODUCTS)

                competitor_prices = session.exec(select(CompetitorPrice)).all()
                assert len(competitor_prices) > 0


@pytest.mark.usefixtures("reset_db_engine")
class TestCompetitorPriceRelationship:
    """Test suite for Product-CompetitorPrice relationship."""

    def test_competitor_prices_linked_to_products(self, temp_db_url: str) -> None:
        """Happy path: Competitor prices are correctly linked to products."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                competitor_prices = session.exec(
                    select(CompetitorPrice).where(
                        CompetitorPrice.product_id == "prod_1"
                    )
                ).all()

                assert len(competitor_prices) >= 2

                for cp in competitor_prices:
                    assert cp.product_id == "prod_1"
                    assert cp.price > 0
                    assert cp.retailer_name != ""


@pytest.mark.usefixtures("reset_db_engine")
class TestCustomerAndBrowseHistorySeeding:
    """Test suite for Customer and BrowseHistory seeding."""

    def test_seed_data_creates_customer(self, temp_db_url: str) -> None:
        """Happy path: seed_data creates a demo customer."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                customers = session.exec(select(Customer)).all()
                assert len(customers) == 1

                customer = customers[0]
                assert customer.id == "cust_1"
                assert customer.email == "demo@example.com"
                assert customer.name == "Demo Shopper"

    def test_seed_data_creates_browse_history(self, temp_db_url: str) -> None:
        """Happy path: seed_data creates browse history entries."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                entries = session.exec(select(BrowseHistory)).all()
                assert len(entries) == 10  # 10 browse history entries seeded

    def test_browse_history_linked_to_customer(self, temp_db_url: str) -> None:
        """Happy path: Browse history entries are linked to the demo customer."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                entries = session.exec(
                    select(BrowseHistory).where(BrowseHistory.customer_id == "cust_1")
                ).all()

                assert len(entries) == 10
                for entry in entries:
                    assert entry.customer_id == "cust_1"

    def test_browse_history_has_varied_categories(self, temp_db_url: str) -> None:
        """Happy path: Browse history includes multiple categories."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                entries = session.exec(select(BrowseHistory)).all()

                categories = {entry.category for entry in entries}
                # Should have multiple categories
                assert len(categories) >= 3
                assert "tops" in categories
                assert "bottoms" in categories

    def test_browse_history_price_range_computable(self, temp_db_url: str) -> None:
        """Happy path: Price range can be computed from browse history."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                entries = session.exec(
                    select(BrowseHistory).where(BrowseHistory.customer_id == "cust_1")
                ).all()

                prices = [e.price_viewed for e in entries if e.price_viewed > 0]
                assert len(prices) > 0

                min_price = min(prices)
                max_price = max(prices)

                # Verify the range is reasonable (2000-5500 cents based on seed data)
                assert min_price >= 2000
                assert max_price <= 6000
                # Price range is the tuple (min, max)
                price_range = [min_price, max_price]
                assert price_range[0] < price_range[1]

    def test_browse_history_has_search_terms(self, temp_db_url: str) -> None:
        """Happy path: Browse history includes search terms."""
        with patch("src.merchant.db.database.get_settings") as mock_settings:
            mock_settings.return_value.database_url = temp_db_url
            mock_settings.return_value.debug = False
            mock_settings.return_value.log_sql = False

            init_and_seed_db()

            engine = get_engine()
            with Session(engine) as session:
                entries = session.exec(select(BrowseHistory)).all()

                search_terms = [e.search_term for e in entries if e.search_term]
                assert len(search_terms) > 0
                assert "casual wear" in search_terms
                assert "summer clothes" in search_terms

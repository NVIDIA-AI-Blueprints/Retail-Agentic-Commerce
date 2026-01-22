"""Pytest configuration and fixtures for Promotion Agent tests."""

import sys
from pathlib import Path

import pytest

# Add the promotion-agent directory to the Python path for imports
AGENT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(AGENT_DIR))


@pytest.fixture
def sample_product_ids() -> list[str]:
    """Return a list of valid product IDs for testing."""
    return ["prod_1", "prod_2", "prod_3", "prod_4"]


@pytest.fixture
def high_stock_product_id() -> str:
    """Return a product ID with high stock (>50 units)."""
    return "prod_3"  # stock_count: 200


@pytest.fixture
def low_stock_product_id() -> str:
    """Return a product ID with low stock (<=50 units)."""
    return "prod_4"  # stock_count: 25


@pytest.fixture
def invalid_product_id() -> str:
    """Return an invalid product ID for error testing."""
    return "prod_999"

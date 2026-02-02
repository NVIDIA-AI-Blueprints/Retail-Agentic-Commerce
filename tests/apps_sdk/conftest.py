"""Pytest configuration and fixtures for Apps SDK tests."""

from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from src.apps_sdk.main import app
from src.apps_sdk.tools.cart import carts

# Mock products that match the normalized schema from find_product (camelCase)
MOCK_PRODUCTS: dict[str, dict[str, Any]] = {
    "prod_1": {
        "id": "prod_1",
        "sku": "TS-001",
        "name": "Classic White Tee",
        "basePrice": 2500,
        "stockCount": 100,
        "category": "tops",
        "description": "A classic white t-shirt",
        "imageUrl": "/prod_1.jpeg",
    },
    "prod_2": {
        "id": "prod_2",
        "sku": "TS-002",
        "name": "Navy Blue Polo",
        "basePrice": 3500,
        "stockCount": 50,
        "category": "tops",
        "description": "A navy blue polo shirt",
        "imageUrl": "/prod_2.jpeg",
    },
    "prod_3": {
        "id": "prod_3",
        "sku": "TS-003",
        "name": "Black Hoodie",
        "basePrice": 4500,
        "stockCount": 30,
        "category": "outerwear",
        "description": "A comfortable black hoodie",
        "imageUrl": "/prod_3.jpeg",
    },
}


async def mock_find_product(product_id: str) -> dict[str, Any] | None:
    """Mock find_product that returns from MOCK_PRODUCTS."""
    return MOCK_PRODUCTS.get(product_id)


@pytest.fixture(autouse=True)
def reset_cart_storage() -> Generator[None, None, None]:
    """Reset in-memory cart storage between tests.

    This ensures tests are isolated and don't affect each other.
    """
    carts.clear()
    yield
    carts.clear()


@pytest.fixture(autouse=True)
def mock_merchant_api() -> Generator[None, None, None]:
    """Mock the merchant API calls for cart operations.

    This prevents actual HTTP calls during tests.
    """
    with patch(
        "src.apps_sdk.tools.cart.find_product",
        new=AsyncMock(side_effect=mock_find_product),
    ):
        yield


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the Apps SDK FastAPI application.

    Yields:
        TestClient: A test client instance for making HTTP requests.
    """
    with TestClient(app) as test_client:
        yield test_client

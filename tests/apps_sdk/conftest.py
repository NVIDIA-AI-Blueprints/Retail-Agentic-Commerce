"""Pytest configuration and fixtures for Apps SDK tests."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from src.apps_sdk.main import app
from src.apps_sdk.tools.cart import carts


@pytest.fixture(autouse=True)
def reset_cart_storage() -> Generator[None, None, None]:
    """Reset in-memory cart storage between tests.

    This ensures tests are isolated and don't affect each other.
    """
    carts.clear()
    yield
    carts.clear()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the Apps SDK FastAPI application.

    Yields:
        TestClient: A test client instance for making HTTP requests.
    """
    with TestClient(app) as test_client:
        yield test_client

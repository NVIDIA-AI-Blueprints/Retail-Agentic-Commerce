"""Pytest configuration and fixtures."""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from src.merchant.config import get_settings
from src.merchant.main import app
from src.merchant.services.idempotency import reset_idempotency_store

# Test API key for authentication tests
TEST_API_KEY = "test-api-key-12345"


@pytest.fixture(autouse=True)
def setup_test_environment() -> Generator[None, None, None]:
    """Set up test environment variables and clean up after tests.

    This fixture runs automatically for all tests to ensure:
    - API_KEY environment variable is set for authenticated requests
    - Settings cache is cleared to pick up the new environment variable
    - Idempotency store is cleared between tests
    """
    # Clear settings cache before setting environment variable
    get_settings.cache_clear()

    # Set up test API key
    original_api_key = os.environ.get("API_KEY")
    os.environ["API_KEY"] = TEST_API_KEY

    # Clear cache again to pick up the new value
    get_settings.cache_clear()

    yield

    # Clean up
    reset_idempotency_store()
    get_settings.cache_clear()
    if original_api_key is not None:
        os.environ["API_KEY"] = original_api_key
    elif "API_KEY" in os.environ:
        del os.environ["API_KEY"]
    get_settings.cache_clear()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI application.

    This client does NOT include authentication headers.
    Use `auth_client` for authenticated requests.

    Yields:
        TestClient: A test client instance for making HTTP requests.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_client() -> Generator[TestClient, None, None]:
    """Create an authenticated test client for the FastAPI application.

    This client includes the Authorization header with a valid API key.

    Yields:
        TestClient: An authenticated test client instance.
    """
    with TestClient(app) as test_client:
        test_client.headers["Authorization"] = f"Bearer {TEST_API_KEY}"
        yield test_client


@pytest.fixture
def auth_client_x_api_key() -> Generator[TestClient, None, None]:
    """Create a test client authenticated via X-API-Key header.

    Yields:
        TestClient: A test client using X-API-Key authentication.
    """
    with TestClient(app) as test_client:
        test_client.headers["X-API-Key"] = TEST_API_KEY
        yield test_client

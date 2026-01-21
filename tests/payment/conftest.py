"""Pytest configuration and fixtures for PSP tests."""

import os
from collections.abc import Generator
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.payment.config import get_payment_settings
from src.payment.db.database import get_engine, reset_engine
from src.payment.main import app
from src.payment.services.idempotency import clear_idempotency_store

# Test API keys
TEST_PSP_API_KEY = "test-psp-api-key-12345"
TEST_MERCHANT_API_KEY = "test-api-key-12345"


@pytest.fixture(autouse=True)
def setup_psp_test_environment() -> Generator[None, None, None]:
    """Set up PSP test environment variables and clean up after tests.

    This fixture runs automatically for all PSP tests to ensure:
    - PSP_API_KEY environment variable is set for authenticated requests
    - API_KEY environment variable is set for merchant service
    - Settings cache is cleared to pick up the new environment variables
    - Database is clean between tests
    """
    # Clear settings cache before setting environment variables
    get_payment_settings.cache_clear()

    # Store original values
    original_psp_api_key = os.environ.get("PSP_API_KEY")
    original_api_key = os.environ.get("API_KEY")

    # Set up test API keys
    os.environ["PSP_API_KEY"] = TEST_PSP_API_KEY
    os.environ["API_KEY"] = TEST_MERCHANT_API_KEY

    # Clear cache again to pick up the new values
    get_payment_settings.cache_clear()

    yield

    # Clean up idempotency store
    engine = get_engine()
    with Session(engine) as session:
        clear_idempotency_store(session)

    # Reset engine
    reset_engine()

    # Restore original values
    get_payment_settings.cache_clear()
    if original_psp_api_key is not None:
        os.environ["PSP_API_KEY"] = original_psp_api_key
    elif "PSP_API_KEY" in os.environ:
        del os.environ["PSP_API_KEY"]

    if original_api_key is not None:
        os.environ["API_KEY"] = original_api_key
    elif "API_KEY" in os.environ:
        del os.environ["API_KEY"]

    get_payment_settings.cache_clear()


@pytest.fixture
def psp_client() -> Generator[TestClient, None, None]:
    """Create a test client for the PSP application.

    This client does NOT include authentication headers.
    Use `psp_auth_client` for authenticated requests.

    Yields:
        TestClient: A test client instance for making HTTP requests.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def psp_auth_client() -> Generator[TestClient, None, None]:
    """Create an authenticated test client for the PSP application.

    This client includes the Authorization header with a valid PSP API key.

    Yields:
        TestClient: An authenticated test client instance.
    """
    with TestClient(app) as test_client:
        test_client.headers["Authorization"] = f"Bearer {TEST_PSP_API_KEY}"
        yield test_client


@pytest.fixture
def valid_checkout_session_id() -> str:
    """Create a valid checkout session and return its ID.

    This fixture creates a checkout session via the merchant API
    to be used in PSP tests.

    Returns:
        The ID of the created checkout session.
    """
    # Import merchant app and create a client for it
    from src.merchant.main import app as merchant_app

    with TestClient(merchant_app) as merchant_client:
        merchant_client.headers["Authorization"] = f"Bearer {TEST_MERCHANT_API_KEY}"
        response = merchant_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        return response.json()["id"]


@pytest.fixture
def valid_delegate_payment_request(valid_checkout_session_id: str) -> dict:
    """Create a valid delegate payment request body.

    Args:
        valid_checkout_session_id: ID of a valid checkout session.

    Returns:
        A dictionary with valid delegate payment request data.
    """
    expires_at = datetime.now(UTC) + timedelta(hours=1)
    return {
        "payment_method": {
            "type": "card",
            "card_number_type": "fpan",
            "virtual": False,
            "number": "4111111111111111",
            "exp_month": "12",
            "exp_year": "2027",
            "display_card_funding_type": "credit",
            "display_last4": "1111",
        },
        "allowance": {
            "reason": "one_time",
            "max_amount": 5000,
            "currency": "usd",
            "checkout_session_id": valid_checkout_session_id,
            "merchant_id": "merchant_001",
            "expires_at": expires_at.isoformat(),
        },
        "risk_signals": [{"type": "card_testing", "action": "authorized"}],
    }


@pytest.fixture
def expired_delegate_payment_request(valid_checkout_session_id: str) -> dict:
    """Create a delegate payment request with an expired allowance.

    Args:
        valid_checkout_session_id: ID of a valid checkout session.

    Returns:
        A dictionary with expired delegate payment request data.
    """
    expires_at = datetime.now(UTC) - timedelta(hours=1)
    return {
        "payment_method": {
            "type": "card",
            "card_number_type": "fpan",
            "virtual": False,
            "number": "4111111111111111",
            "exp_month": "12",
            "exp_year": "2027",
            "display_card_funding_type": "credit",
            "display_last4": "1111",
        },
        "allowance": {
            "reason": "one_time",
            "max_amount": 5000,
            "currency": "usd",
            "checkout_session_id": valid_checkout_session_id,
            "merchant_id": "merchant_001",
            "expires_at": expires_at.isoformat(),
        },
        "risk_signals": [{"type": "card_testing", "action": "authorized"}],
    }

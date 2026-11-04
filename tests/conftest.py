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

"""Pytest configuration and fixtures."""

import os
from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from src.merchant.config import get_settings
from src.merchant.main import app
from src.merchant.services.idempotency import reset_idempotency_store
from src.merchant.services.payment import PaymentResult
from src.merchant.services.promotion import PromotionAction, PromotionDecisionOutput

# Test API key for authentication tests
TEST_API_KEY = "test-api-key-12345"


@pytest.fixture(autouse=True)
def setup_test_environment() -> Generator[None, None, None]:
    """Set up test environment variables and clean up after tests.

    This fixture runs automatically for all tests to ensure:
    - MERCHANT_API_KEY environment variable is set for authenticated requests
    - Settings cache is cleared to pick up the new environment variable
    - Idempotency store is cleared between tests
    """
    # Clear settings cache before setting environment variable
    get_settings.cache_clear()

    # Set up test API key (config expects MERCHANT_API_KEY)
    original_api_key = os.environ.get("MERCHANT_API_KEY")
    os.environ["MERCHANT_API_KEY"] = TEST_API_KEY

    # Clear cache again to pick up the new value
    get_settings.cache_clear()

    yield

    # Clean up
    reset_idempotency_store()
    get_settings.cache_clear()
    if original_api_key is not None:
        os.environ["MERCHANT_API_KEY"] = original_api_key
    elif "MERCHANT_API_KEY" in os.environ:
        del os.environ["MERCHANT_API_KEY"]
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


@pytest.fixture(autouse=True)
def mock_promotion_agent() -> Generator[AsyncMock, None, None]:
    """Mock the promotion agent client to return NO_PROMO by default.

    This ensures tests are deterministic and don't require the promotion
    agent to be running. Tests that need to verify promotion behavior
    can override this mock in their test methods.

    Yields:
        AsyncMock: The mocked get_promotion_decision method.
    """
    mock_decision = PromotionDecisionOutput(
        product_id="",
        action=PromotionAction.NO_PROMO.value,
        reason_codes=["NO_URGENCY"],
        reasoning="Mocked: No promotion applied in test environment.",
    )

    with patch(
        "src.merchant.services.promotion.PromotionAgentClient.get_promotion_decision",
        new_callable=AsyncMock,
        return_value=mock_decision,
    ) as mock:
        yield mock


@pytest.fixture(autouse=True)
def mock_psp_payment(
    request: pytest.FixtureRequest,
) -> Generator[MagicMock | None, None, None]:
    """Mock the merchant's PSP client so checkout completion does not need a PSP.

    The mock approves every charge. Tests that assert payment enforcement can
    configure ``side_effect`` on the yielded mock. Tests marked ``real_psp``
    keep the real client (and route its HTTP calls themselves).

    Yields:
        MagicMock for ``PSPClient.create_and_process_payment_intent`` or None.
    """
    if request.node.get_closest_marker("real_psp") is not None:
        yield None
        return

    def _approve(
        *, vault_token: str, amount: int, currency: str, checkout_session_id: str
    ) -> PaymentResult:
        del vault_token, checkout_session_id
        return PaymentResult(
            payment_intent_id="pi_test_mock", amount=amount, currency=currency
        )

    with patch(
        "src.merchant.services.payment.PSPClient.create_and_process_payment_intent",
        autospec=False,
        side_effect=_approve,
    ) as mock:
        yield mock

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

"""Payment enforcement on POST /checkout_sessions/{id}/complete (issue #112).

An order must only be created after the merchant has charged the presented
vault token through the PSP for the server-computed session total.
"""

import uuid
from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.merchant.config import get_settings
from src.merchant.services.payment import (
    PaymentDeclinedError,
    PaymentProcessorUnavailableError,
)
from src.payment.config import get_payment_settings
from src.payment.db.database import get_engine as get_psp_engine
from src.payment.db.models import PaymentIntent, VaultToken, VaultTokenStatus
from src.payment.main import app as psp_app

TEST_PSP_API_KEY = "test-psp-api-key-12345"


def _create_ready_session(auth_client: TestClient) -> str:
    """Create a checkout session that is ready for payment."""
    create_response = auth_client.post(
        "/checkout_sessions",
        json={
            "items": [{"id": "prod_1", "quantity": 1}],
            "buyer": {"first_name": "Pay", "email": "pay@example.com"},
            "fulfillment_address": {
                "name": "Pay User",
                "line_one": "1 Payment St",
                "city": "Pay City",
                "state": "PY",
                "country": "US",
                "postal_code": "00000",
            },
        },
    )
    session_id = create_response.json()["id"]
    fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]
    auth_client.post(
        f"/checkout_sessions/{session_id}",
        json={"fulfillment_option_id": fulfillment_option_id},
    )
    return session_id


def _session_total(auth_client: TestClient, session_id: str) -> int:
    session = auth_client.get(f"/checkout_sessions/{session_id}").json()
    return next(t["amount"] for t in session["totals"] if t["type"] == "total")


def _complete(auth_client: TestClient, session_id: str, token: str) -> httpx.Response:
    return auth_client.post(
        f"/checkout_sessions/{session_id}/complete",
        json={"payment_data": {"token": token, "provider": "stripe"}},
    )


def _assert_not_completed(auth_client: TestClient, session_id: str) -> None:
    session = auth_client.get(f"/checkout_sessions/{session_id}").json()
    assert session["status"] == "ready_for_payment"
    assert session.get("order") is None


class TestCompleteChargesPayment:
    """Merchant-side behavior with the PSP client mocked (autouse fixture)."""

    def test_complete_charges_server_computed_total(
        self, auth_client: TestClient, mock_psp_payment: MagicMock
    ) -> None:
        """The PSP is charged the session total, currency, session id and token."""
        session_id = _create_ready_session(auth_client)
        total = _session_total(auth_client, session_id)

        response = _complete(auth_client, session_id, "vt_presented")

        assert response.status_code == 200
        mock_psp_payment.assert_called_once_with(
            vault_token="vt_presented",
            amount=total,
            currency="usd",
            checkout_session_id=session_id,
        )

    def test_declined_payment_returns_402_without_order(
        self, auth_client: TestClient, mock_psp_payment: MagicMock
    ) -> None:
        """Failure case: a PSP decline returns 402 and no order is created."""
        mock_psp_payment.side_effect = PaymentDeclinedError(
            "Vault token 'tok_fake' not found", psp_code="vault_token_not_found"
        )
        session_id = _create_ready_session(auth_client)

        response = _complete(auth_client, session_id, "tok_fake")

        assert response.status_code == 402
        detail = response.json()["detail"]
        assert detail["type"] == "invalid_request"
        assert detail["code"] == "payment_declined"
        assert detail["param"] == "$.payment_data.token"
        assert "tok_fake" in detail["message"]
        _assert_not_completed(auth_client, session_id)

    def test_psp_unavailable_returns_503_without_order(
        self, auth_client: TestClient, mock_psp_payment: MagicMock
    ) -> None:
        """Failure case: an unreachable PSP returns 503 and no order is created."""
        mock_psp_payment.side_effect = PaymentProcessorUnavailableError(
            "Payment processor is unavailable."
        )
        session_id = _create_ready_session(auth_client)

        response = _complete(auth_client, session_id, "vt_any")

        assert response.status_code == 503
        detail = response.json()["detail"]
        assert detail["type"] == "service_unavailable"
        assert detail["code"] == "payment_processor_unavailable"
        _assert_not_completed(auth_client, session_id)

    def test_retry_after_decline_can_complete(
        self, auth_client: TestClient, mock_psp_payment: MagicMock
    ) -> None:
        """Edge case: a declined attempt leaves the session completable."""
        session_id = _create_ready_session(auth_client)
        approve = mock_psp_payment.side_effect
        mock_psp_payment.side_effect = PaymentDeclinedError("declined")
        assert _complete(auth_client, session_id, "vt_bad").status_code == 402

        mock_psp_payment.side_effect = approve
        response = _complete(auth_client, session_id, "vt_good")

        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    def test_not_ready_session_is_not_charged(
        self, auth_client: TestClient, mock_psp_payment: MagicMock
    ) -> None:
        """Edge case: readiness is checked before any charge is attempted."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = response.json()["id"]

        assert _complete(auth_client, session_id, "vt_any").status_code == 405
        mock_psp_payment.assert_not_called()


@pytest.mark.real_psp
class TestCompleteWithRealPSP:
    """End-to-end: merchant complete -> real PSP app (shared database)."""

    @pytest.fixture
    def psp_client(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> Generator[TestClient, None, None]:
        """Run the PSP app in-process and route the merchant's PSP calls to it."""
        monkeypatch.setenv("PSP_API_KEY", TEST_PSP_API_KEY)
        get_settings.cache_clear()
        get_payment_settings.cache_clear()

        with TestClient(psp_app) as client:

            def _route(url: str, **kwargs: Any) -> httpx.Response:
                path = httpx.URL(url).path
                return client.post(path, json=kwargs["json"], headers=kwargs["headers"])

            with patch("src.merchant.services.payment.httpx.post", side_effect=_route):
                client.headers["Authorization"] = f"Bearer {TEST_PSP_API_KEY}"
                yield client

        get_settings.cache_clear()
        get_payment_settings.cache_clear()

    @staticmethod
    def _delegate(
        psp_client: TestClient, checkout_session_id: str, max_amount: int
    ) -> str:
        response = psp_client.post(
            "/agentic_commerce/delegate_payment",
            json={
                "payment_method": {
                    "type": "card",
                    "card_number_type": "fpan",
                    "virtual": False,
                    "number": "4242424242424242",
                    "exp_month": "12",
                    "exp_year": "2030",
                    "display_card_funding_type": "credit",
                    "display_last4": "4242",
                },
                "allowance": {
                    "reason": "one_time",
                    "max_amount": max_amount,
                    "currency": "usd",
                    "checkout_session_id": checkout_session_id,
                    "merchant_id": "merchant_test",
                    "expires_at": (datetime.now(UTC) + timedelta(hours=1)).isoformat(),
                },
                "risk_signals": [{"type": "card_testing", "action": "authorized"}],
            },
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        assert response.status_code == 201, response.text
        return response.json()["id"]

    @staticmethod
    def _vault_token(token_id: str) -> VaultToken:
        with Session(get_psp_engine()) as db:
            token = db.get(VaultToken, token_id)
            assert token is not None
            return token

    @pytest.mark.usefixtures("psp_client")
    def test_fabricated_token_cannot_complete_checkout(
        self, auth_client: TestClient
    ) -> None:
        """Issue #112: an arbitrary token must not yield an order."""
        session_id = _create_ready_session(auth_client)

        response = _complete(auth_client, session_id, "tok_fabricated")

        assert response.status_code == 402
        assert response.json()["detail"]["code"] == "payment_declined"
        _assert_not_completed(auth_client, session_id)

    def test_delegated_token_is_charged_and_consumed(
        self, auth_client: TestClient, psp_client: TestClient
    ) -> None:
        """Happy path: a valid delegated token is charged the session total."""
        session_id = _create_ready_session(auth_client)
        total = _session_total(auth_client, session_id)
        token_id = self._delegate(psp_client, session_id, max_amount=total)

        response = _complete(auth_client, session_id, token_id)

        assert response.status_code == 200, response.text
        assert response.json()["status"] == "completed"
        assert response.json()["order"]["checkout_session_id"] == session_id
        assert self._vault_token(token_id).status == VaultTokenStatus.CONSUMED
        with Session(get_psp_engine()) as db:
            intents = db.exec(
                select(PaymentIntent).where(PaymentIntent.vault_token_id == token_id)
            ).all()
        assert [(i.amount, i.currency) for i in intents] == [(total, "usd")]

    def test_token_bound_to_other_session_is_rejected(
        self, auth_client: TestClient, psp_client: TestClient
    ) -> None:
        """Failure case: a token delegated for session A cannot pay for session B."""
        session_a = _create_ready_session(auth_client)
        session_b = _create_ready_session(auth_client)
        token_id = self._delegate(psp_client, session_a, max_amount=1_000_000)

        response = _complete(auth_client, session_b, token_id)

        assert response.status_code == 402
        assert session_a in response.json()["detail"]["message"]
        _assert_not_completed(auth_client, session_b)
        assert self._vault_token(token_id).status == VaultTokenStatus.ACTIVE

    def test_allowance_below_total_is_rejected(
        self, auth_client: TestClient, psp_client: TestClient
    ) -> None:
        """Failure case: the client-chosen allowance cannot undercut the total."""
        session_id = _create_ready_session(auth_client)
        total = _session_total(auth_client, session_id)
        token_id = self._delegate(psp_client, session_id, max_amount=total - 1)

        response = _complete(auth_client, session_id, token_id)

        assert response.status_code == 402
        _assert_not_completed(auth_client, session_id)
        assert self._vault_token(token_id).status == VaultTokenStatus.ACTIVE

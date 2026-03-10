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

"""Tests for the PSP delegated payment API endpoints."""

import uuid

from fastapi.testclient import TestClient


class TestDelegatePayment:
    """Test suite for POST /agentic_commerce/delegate_payment endpoint."""

    def test_delegate_payment_returns_201(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Valid delegate payment request returns 201."""
        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )

        assert response.status_code == 201

    def test_delegate_payment_returns_vault_token_id(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Response contains vault token ID."""
        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        data = response.json()

        assert "id" in data
        assert data["id"].startswith("vt_")

    def test_delegate_payment_returns_created_timestamp(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Response contains created timestamp."""
        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        data = response.json()

        assert "created" in data

    def test_delegate_payment_returns_metadata(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Response contains metadata."""
        idempotency_key = str(uuid.uuid4())
        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": idempotency_key},
        )
        data = response.json()

        assert "metadata" in data
        assert data["metadata"]["source"] == "agent_checkout"
        assert data["metadata"]["merchant_id"] == "merchant_001"
        assert data["metadata"]["idempotency_key"] == idempotency_key

    def test_delegate_payment_validates_checkout_session(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Invalid checkout session ID returns 404."""
        # Modify request to use non-existent checkout session
        request = valid_delegate_payment_request.copy()
        request["allowance"] = request["allowance"].copy()
        request["allowance"]["checkout_session_id"] = "nonexistent_session"

        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )

        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["code"] == "checkout_session_not_found"

    def test_delegate_payment_requires_risk_signal(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Empty risk_signals array returns 422."""
        # Modify request to have empty risk_signals
        request = valid_delegate_payment_request.copy()
        request["risk_signals"] = []

        response = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )

        assert response.status_code == 422

    def test_delegate_payment_idempotency_cached(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Same idempotency key with same request returns cached response."""
        idempotency_key = str(uuid.uuid4())

        # First request
        response1 = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response1.status_code == 201
        data1 = response1.json()

        # Second request with same idempotency key
        response2 = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response2.status_code == 201
        data2 = response2.json()

        # Should return same vault token ID
        assert data1["id"] == data2["id"]

    def test_delegate_payment_idempotency_conflict(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Same idempotency key with different request returns 409."""
        idempotency_key = str(uuid.uuid4())

        # First request
        response1 = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response1.status_code == 201

        # Second request with same idempotency key but different body
        modified_request = valid_delegate_payment_request.copy()
        modified_request["allowance"] = modified_request["allowance"].copy()
        modified_request["allowance"]["max_amount"] = 9999

        response2 = psp_auth_client.post(
            "/agentic_commerce/delegate_payment",
            json=modified_request,
            headers={"Idempotency-Key": idempotency_key},
        )

        assert response2.status_code == 409
        data = response2.json()
        assert data["detail"]["code"] == "request_not_idempotent"

    def test_delegate_payment_requires_auth(
        self,
        psp_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Missing API key returns 401."""
        response = psp_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )

        assert response.status_code == 401

    def test_delegate_payment_rejects_invalid_key(
        self,
        psp_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Invalid API key returns 403."""
        response = psp_client.post(
            "/agentic_commerce/delegate_payment",
            json=valid_delegate_payment_request,
            headers={
                "Authorization": "Bearer invalid-key",
                "Idempotency-Key": str(uuid.uuid4()),
            },
        )

        assert response.status_code == 403


class TestCreateAndProcessPaymentIntent:
    """Test suite for POST /agentic_commerce/create_and_process_payment_intent endpoint."""

    def _create_vault_token(self, client: TestClient, request_data: dict) -> str:
        """Helper to create a vault token and return its ID."""
        response = client.post(
            "/agentic_commerce/delegate_payment",
            json=request_data,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        return response.json()["id"]

    def test_create_payment_intent_returns_200(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Valid payment intent request returns 200."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )

        assert response.status_code == 200

    def test_payment_intent_returns_completed_status(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Payment intent has completed status."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )
        data = response.json()

        assert data["status"] == "completed"

    def test_payment_intent_returns_intent_id(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Response contains payment intent ID."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )
        data = response.json()

        assert "id" in data
        assert data["id"].startswith("pi_")

    def test_payment_intent_returns_vault_token_id(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Happy path: Response contains vault token ID reference."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )
        data = response.json()

        assert data["vault_token_id"] == vault_token_id

    def test_payment_intent_validates_token_exists(
        self,
        psp_auth_client: TestClient,
    ) -> None:
        """Failure case: Non-existent vault token returns 404."""
        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": "vt_nonexistent",
                "amount": 2500,
                "currency": "usd",
            },
        )

        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["code"] == "vault_token_not_found"

    def test_payment_intent_rejects_consumed_token(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Consumed vault token returns 409."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        # First payment succeeds
        response1 = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )
        assert response1.status_code == 200

        # Second payment fails because token is consumed
        response2 = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 1000,
                "currency": "usd",
            },
        )

        assert response2.status_code == 409
        data = response2.json()
        assert data["detail"]["code"] == "vault_token_consumed"

    def test_payment_intent_rejects_expired_token(
        self,
        psp_auth_client: TestClient,
        expired_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Expired vault token returns 410."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, expired_delegate_payment_request
        )

        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )

        assert response.status_code == 410
        data = response.json()
        assert data["detail"]["code"] == "vault_token_expired"

    def test_payment_intent_validates_amount(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Amount exceeding allowance returns 422."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        # max_amount is 5000, try to charge 6000
        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 6000,
                "currency": "usd",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert data["detail"]["code"] == "amount_exceeds_allowance"

    def test_payment_intent_validates_currency(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Failure case: Currency mismatch returns 422."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        # Allowance is in USD, try to charge in EUR
        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "eur",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert data["detail"]["code"] == "currency_mismatch"

    def test_payment_intent_consumes_token(
        self,
        psp_auth_client: TestClient,
        valid_delegate_payment_request: dict,
    ) -> None:
        """Side effect: Token status changes to consumed after payment."""
        vault_token_id = self._create_vault_token(
            psp_auth_client, valid_delegate_payment_request
        )

        # Process payment
        response = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 2500,
                "currency": "usd",
            },
        )
        assert response.status_code == 200

        # Verify token is consumed by trying to use it again
        response2 = psp_auth_client.post(
            "/agentic_commerce/create_and_process_payment_intent",
            json={
                "vault_token": vault_token_id,
                "amount": 100,
                "currency": "usd",
            },
        )
        assert response2.status_code == 409
        assert response2.json()["detail"]["code"] == "vault_token_consumed"


class TestHealthCheck:
    """Test suite for GET /health endpoint."""

    def test_health_check_returns_200(self, psp_client: TestClient) -> None:
        """Happy path: Health check returns 200."""
        response = psp_client.get("/health")
        assert response.status_code == 200

    def test_health_check_returns_ok_status(self, psp_client: TestClient) -> None:
        """Happy path: Health check returns ok status."""
        response = psp_client.get("/health")
        data = response.json()
        assert data["status"] == "ok"

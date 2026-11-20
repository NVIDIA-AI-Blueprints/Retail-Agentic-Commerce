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

"""Tests for the merchant's PSP client (payment processing on complete)."""

from collections.abc import Generator
from typing import Any
from unittest.mock import patch

import httpx
import pytest

from src.merchant.services.payment import (
    PaymentDeclinedError,
    PaymentProcessorUnavailableError,
    PSPClient,
)

pytestmark = pytest.mark.real_psp

PSP_URL = "http://psp.test"
INTENT_PATH = "/agentic_commerce/create_and_process_payment_intent"


@pytest.fixture
def psp_responses() -> Generator[list[httpx.Response | Exception], None, None]:
    """Queue of responses (or exceptions) returned by the patched httpx.post."""
    queue: list[httpx.Response | Exception] = []
    yield queue


@pytest.fixture
def sent_requests(
    psp_responses: list[httpx.Response | Exception],
) -> Generator[list[dict[str, Any]], None, None]:
    """Patch httpx.post in the PSP client and record outgoing requests."""
    sent: list[dict[str, Any]] = []

    def _fake_post(url: str, **kwargs: Any) -> httpx.Response:
        sent.append({"url": url, **kwargs})
        item = psp_responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return item

    with patch("src.merchant.services.payment.httpx.post", side_effect=_fake_post):
        yield sent


def _charge(client: PSPClient) -> Any:
    return client.create_and_process_payment_intent(
        vault_token="vt_abc",
        amount=3200,
        currency="usd",
        checkout_session_id="checkout_123",
    )


def _completed_body() -> dict[str, Any]:
    return {
        "id": "pi_123",
        "vault_token_id": "vt_abc",
        "amount": 3200,
        "currency": "usd",
        "status": "completed",
        "created_at": "2026-01-01T00:00:00Z",
        "completed_at": "2026-01-01T00:00:00Z",
    }


class TestPSPClient:
    """Behavior of PSPClient.create_and_process_payment_intent."""

    @pytest.mark.usefixtures("sent_requests")
    def test_completed_payment_returns_result(
        self,
        psp_responses: list[httpx.Response | Exception],
    ) -> None:
        """Happy path: a completed intent is returned as a PaymentResult."""
        psp_responses.append(httpx.Response(200, json=_completed_body()))

        result = _charge(PSPClient(PSP_URL + "/", "psp-key"))

        assert result.payment_intent_id == "pi_123"
        assert result.amount == 3200
        assert result.currency == "usd"

    def test_sends_session_binding_amount_and_auth(
        self,
        psp_responses: list[httpx.Response | Exception],
        sent_requests: list[dict[str, Any]],
    ) -> None:
        """The request carries token, amount, currency, session id and API key."""
        psp_responses.append(httpx.Response(200, json=_completed_body()))

        _charge(PSPClient(PSP_URL, "psp-key", timeout=3.0))

        [request] = sent_requests
        assert request["url"] == PSP_URL + INTENT_PATH
        assert request["json"] == {
            "vault_token": "vt_abc",
            "amount": 3200,
            "currency": "usd",
            "checkout_session_id": "checkout_123",
        }
        assert request["headers"]["Authorization"] == "Bearer psp-key"
        assert request["timeout"] == 3.0

    @pytest.mark.parametrize(
        ("status_code", "code"),
        [
            (404, "vault_token_not_found"),
            (409, "vault_token_consumed"),
            (410, "vault_token_expired"),
            (422, "amount_exceeds_allowance"),
            (422, "checkout_session_mismatch"),
        ],
    )
    @pytest.mark.usefixtures("sent_requests")
    def test_psp_rejection_raises_declined(
        self,
        psp_responses: list[httpx.Response | Exception],
        status_code: int,
        code: str,
    ) -> None:
        """Failure case: PSP 4xx rejections become PaymentDeclinedError."""
        psp_responses.append(
            httpx.Response(
                status_code,
                json={"detail": {"code": code, "message": f"rejected: {code}"}},
            )
        )

        with pytest.raises(PaymentDeclinedError) as exc_info:
            _charge(PSPClient(PSP_URL, "psp-key"))

        assert exc_info.value.psp_code == code
        assert exc_info.value.message == f"rejected: {code}"

    @pytest.mark.usefixtures("sent_requests")
    def test_non_completed_status_raises_declined(
        self,
        psp_responses: list[httpx.Response | Exception],
    ) -> None:
        """Failure case: a 200 without a completed status is not a settled payment."""
        body = _completed_body() | {"status": "pending"}
        psp_responses.append(httpx.Response(200, json=body))

        with pytest.raises(PaymentDeclinedError):
            _charge(PSPClient(PSP_URL, "psp-key"))

    @pytest.mark.parametrize(
        "response",
        [
            httpx.Response(401, json={"detail": "missing key"}),
            httpx.Response(403, json={"detail": "bad key"}),
            httpx.Response(500, text="boom"),
            httpx.ConnectError("refused"),
            httpx.ReadTimeout("slow"),
        ],
        ids=["401", "403", "500", "connect-error", "timeout"],
    )
    @pytest.mark.usefixtures("sent_requests")
    def test_psp_failure_raises_unavailable(
        self,
        psp_responses: list[httpx.Response | Exception],
        response: httpx.Response | Exception,
    ) -> None:
        """Failure case: auth/server/network problems are not payment declines."""
        psp_responses.append(response)

        with pytest.raises(PaymentProcessorUnavailableError):
            _charge(PSPClient(PSP_URL, "psp-key"))

    @pytest.mark.usefixtures("sent_requests")
    def test_non_json_error_body_still_declines(
        self,
        psp_responses: list[httpx.Response | Exception],
    ) -> None:
        """Edge case: a 4xx with a non-JSON body still raises a decline."""
        psp_responses.append(httpx.Response(422, text="not json"))

        with pytest.raises(PaymentDeclinedError) as exc_info:
            _charge(PSPClient(PSP_URL, "psp-key"))

        assert exc_info.value.psp_code is None
        assert exc_info.value.message == "Payment was declined."

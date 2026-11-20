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

"""PSP client used by the merchant to charge a delegated vault token.

Per the ACP delegated-payment flow, the client agent only obtains a vault token
(``delegate_payment``); the merchant is responsible for charging it with
``create_and_process_payment_intent`` before an order is created.
"""

import logging
from dataclasses import dataclass
from typing import Any, cast

import httpx

from src.merchant.config import get_settings

logger = logging.getLogger(__name__)


class PaymentDeclinedError(Exception):
    """Raised when the PSP rejects the payment (token, amount, currency, binding)."""

    def __init__(self, message: str, psp_code: str | None = None):
        self.message = message
        self.psp_code = psp_code
        super().__init__(message)


class PaymentProcessorUnavailableError(Exception):
    """Raised when the PSP cannot be reached or fails unexpectedly."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class PaymentResult:
    """A settled payment returned by the PSP."""

    payment_intent_id: str
    amount: int
    currency: str


class PSPClient:
    """Synchronous HTTP client for the PSP payment intent API."""

    def __init__(self, base_url: str, api_key: str, timeout: float = 10.0):
        """Initialize the PSP client.

        Args:
            base_url: Base URL of the PSP service (e.g., http://localhost:8001).
            api_key: PSP API key sent as a Bearer token.
            timeout: Request timeout in seconds.
        """
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def create_and_process_payment_intent(
        self,
        *,
        vault_token: str,
        amount: int,
        currency: str,
        checkout_session_id: str,
    ) -> PaymentResult:
        """Charge a vault token for a checkout session.

        Args:
            vault_token: Vault token presented by the client in ``payment_data``.
            amount: Server-computed amount to charge, in minor units.
            currency: ISO 4217 currency code of the checkout session.
            checkout_session_id: Session the vault token must be bound to.

        Returns:
            PaymentResult for the completed payment intent.

        Raises:
            PaymentDeclinedError: The PSP rejected the payment.
            PaymentProcessorUnavailableError: The PSP is unreachable or errored.
        """
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            response = httpx.post(
                f"{self.base_url}/agentic_commerce/create_and_process_payment_intent",
                json={
                    "vault_token": vault_token,
                    "amount": amount,
                    "currency": currency,
                    "checkout_session_id": checkout_session_id,
                },
                headers=headers,
                timeout=self.timeout,
            )
        except httpx.HTTPError as e:
            logger.error("PSP request failed: %s", e)
            raise PaymentProcessorUnavailableError(
                "Payment processor is unavailable."
            ) from e

        if response.status_code == 200:
            body: dict[str, Any] = response.json()
            if body.get("status") != "completed":
                raise PaymentDeclinedError(
                    f"Payment was not completed (status={body.get('status')})."
                )
            return PaymentResult(
                payment_intent_id=str(body["id"]),
                amount=int(body["amount"]),
                currency=str(body["currency"]),
            )

        # 4xx (other than PSP auth problems) means the payment itself was refused.
        if 400 <= response.status_code < 500 and response.status_code not in (
            401,
            403,
        ):
            message, code = _extract_psp_error(response)
            logger.warning(
                "PSP declined payment | status=%d code=%s", response.status_code, code
            )
            raise PaymentDeclinedError(message, psp_code=code)

        logger.error(
            "PSP returned unexpected status %d: %s",
            response.status_code,
            response.text[:500],
        )
        raise PaymentProcessorUnavailableError("Payment processor returned an error.")


def _extract_psp_error(response: httpx.Response) -> tuple[str, str | None]:
    """Return (message, code) from a PSP error response."""
    default_message = "Payment was declined."
    try:
        body: Any = response.json()
    except ValueError:
        return default_message, None
    if not isinstance(body, dict):
        return default_message, None
    detail: Any = cast(dict[str, Any], body).get("detail")
    if isinstance(detail, dict):
        typed_detail = cast(dict[str, Any], detail)
        message = typed_detail.get("message")
        code = typed_detail.get("code")
        return (
            str(message) if message else default_message,
            str(code) if code is not None else None,
        )
    return default_message, None


def get_psp_client() -> PSPClient:
    """Build a PSP client from the merchant settings."""
    settings = get_settings()
    return PSPClient(
        base_url=settings.psp_api_url,
        api_key=settings.psp_api_key,
        timeout=settings.psp_timeout,
    )

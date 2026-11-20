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

"""Retry safety of the checkout tool against the real merchant and PSP apps.

The tool's HTTP calls are routed in-process to the merchant API and the PSP,
so these tests exercise their real Idempotency-Key handling. A checkout whose
``/complete`` response is lost after the merchant placed the order must, when
retried, return that order instead of placing a second one.
"""

import importlib
from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from src.apps_sdk.tools.cart import add_to_cart, carts
from src.apps_sdk.tools.checkout import process_acp_checkout
from src.merchant.config import get_settings
from src.merchant.main import app as merchant_app
from src.merchant.protocols.acp.api.routes import checkout as merchant_routes
from src.merchant.services.idempotency import reset_idempotency_store
from src.payment.config import get_payment_settings
from src.payment.main import app as psp_app

MERCHANT_KEY = "test-api-key-12345"
PSP_KEY = "test-psp-api-key-12345"

# The tools package re-exports the checkout() function under the module's name.
checkout_module = importlib.import_module("src.apps_sdk.tools.checkout")


class MerchantAndPSP:
    """Routes the checkout tool's requests to the merchant and PSP apps.

    Records every request and response. ``lose_complete_responses`` drops that
    many ``/complete`` responses after the merchant has processed the request,
    the way a timeout or a dropped connection would. ``fail_complete_with``
    answers the next ``/complete`` with that status without reaching the merchant.
    ``refuse_connections`` fails that many requests as if the server were down.
    ``refuse_session_reads`` does the same for that many ``GET`` requests.
    """

    def __init__(self, merchant: TestClient, psp: TestClient) -> None:
        self.merchant = merchant
        self.psp = psp
        self.lose_complete_responses = 0
        self.fail_complete_with: int | None = None
        self.refuse_connections = 0
        self.refuse_session_reads = 0
        self.calls: list[tuple[httpx.Request, httpx.Response]] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        if self.refuse_connections:
            self.refuse_connections -= 1
            raise httpx.ConnectError("Connection refused", request=request)
        if request.method == "GET" and self.refuse_session_reads:
            self.refuse_session_reads -= 1
            raise httpx.ConnectError("Connection refused", request=request)
        if request.url.path.endswith("/complete") and self.fail_complete_with:
            response = httpx.Response(self.fail_complete_with, json={})
            self.fail_complete_with = None
            self.calls.append((request, response))
            return response
        if request.url.port == 8001:
            client, api_key = self.psp, PSP_KEY
        else:
            client, api_key = self.merchant, MERCHANT_KEY
        headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in ("authorization", "host", "content-length")
        }
        headers["Authorization"] = f"Bearer {api_key}"
        upstream = client.request(
            request.method, request.url.path, headers=headers, content=request.content
        )
        response = httpx.Response(
            upstream.status_code, headers=upstream.headers, content=upstream.content
        )
        self.calls.append((request, response))

        if request.url.path.endswith("/complete") and self.lose_complete_responses:
            self.lose_complete_responses -= 1
            raise httpx.RemoteProtocolError(
                "Server disconnected without sending a response.", request=request
            )
        return response

    def ids_created(self, path_suffix: str) -> set[str]:
        """IDs in successful responses to POSTs whose path ends with the suffix."""
        return {
            resp.json()["id"]
            for req, resp in self.calls
            if req.url.path.endswith(path_suffix) and resp.status_code in (200, 201)
        }

    def orders_placed(self) -> set[str]:
        return {
            resp.json()["order"]["id"]
            for req, resp in self.calls
            if req.url.path.endswith("/complete") and resp.status_code == 200
        }

    def complete_statuses(self) -> list[int]:
        return [
            resp.status_code
            for req, resp in self.calls
            if req.url.path.endswith("/complete")
        ]

    def keys_sent(self, path_suffix: str) -> list[str | None]:
        return [
            req.headers.get("Idempotency-Key")
            for req, _ in self.calls
            if req.method == "POST" and req.url.path.endswith(path_suffix)
        ]


@pytest.fixture
def services(monkeypatch: pytest.MonkeyPatch) -> Generator[MerchantAndPSP, None, None]:
    """Run the merchant and PSP apps and route the checkout tool to them.

    The merchant's post-purchase agent and webhook calls are stubbed out.
    """
    monkeypatch.setenv("MERCHANT_API_KEY", MERCHANT_KEY)
    monkeypatch.setenv("PSP_API_KEY", PSP_KEY)
    get_settings.cache_clear()
    get_payment_settings.cache_clear()

    with TestClient(merchant_app) as merchant, TestClient(psp_app) as psp:
        router = MerchantAndPSP(merchant, psp)
        original_client = httpx.AsyncClient

        class RoutedAsyncClient(original_client):
            def __init__(self, **kwargs: Any) -> None:
                super().__init__(transport=httpx.MockTransport(router), **kwargs)

            async def __aenter__(self) -> "RoutedAsyncClient":
                return self

            async def __aexit__(self, *_args: Any) -> None:
                await self.aclose()

        with (
            patch.object(httpx, "AsyncClient", RoutedAsyncClient),
            patch(
                "src.merchant.protocols.acp.api.routes.checkout.trigger_post_purchase_flow",
                new=AsyncMock(),
            ),
        ):
            yield router

    get_payment_settings.cache_clear()


@pytest.fixture
def merchant_fails_after_order(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    """Make the merchant's first ``/complete`` place the order and then fail.

    The merchant answers 500, so its idempotency middleware caches nothing.
    Returns the IDs of every order the merchant placed.
    """
    placed: list[str] = []
    real_complete = merchant_routes.complete_checkout_session

    def complete_then_fail(*args: Any, **kwargs: Any) -> Any:
        response = real_complete(*args, **kwargs)
        placed.append(response.order.id)
        if len(placed) == 1:
            raise HTTPException(status_code=500, detail="failed after commit")
        return response

    monkeypatch.setattr(
        merchant_routes, "complete_checkout_session", complete_then_fail
    )
    return placed


async def _cart_with(product_id: str) -> str:
    result = await add_to_cart(product_id, 1)
    return result["cartId"]


class TestCheckoutRetry:
    """A retried checkout reuses the lost attempt's idempotency keys."""

    async def test_retry_after_lost_complete_response_places_one_order(
        self, services: MerchantAndPSP
    ) -> None:
        cart_id = await _cart_with("prod_1")
        services.lose_complete_responses = 1

        first = await process_acp_checkout(cart_id, customer_name="Ada Lovelace")
        assert first["success"] is False
        assert carts[cart_id], "cart is kept when the outcome is unknown"
        (order_id,) = services.orders_placed()

        second = await process_acp_checkout(cart_id, customer_name="Ada Lovelace")

        assert second["success"] is True
        assert second["orderId"] == order_id
        assert services.orders_placed() == {order_id}
        assert len(services.ids_created("/checkout_sessions")) == 1
        assert len(services.ids_created("/delegate_payment")) == 1
        assert carts[cart_id] == []
        for suffix in ("/checkout_sessions", "/delegate_payment", "/complete"):
            first_key, retry_key = services.keys_sent(suffix)
            assert first_key is not None
            assert first_key == retry_key

    async def test_new_cart_gets_new_key(self, services: MerchantAndPSP) -> None:
        first_cart = await _cart_with("prod_1")
        second_cart = await _cart_with("prod_1")

        assert (await process_acp_checkout(first_cart))["success"] is True
        assert (await process_acp_checkout(second_cart))["success"] is True

        first_key, second_key = services.keys_sent("/checkout_sessions")
        assert first_key is not None
        assert second_key is not None
        assert first_key != second_key
        assert len(services.orders_placed()) == 2

    async def test_next_checkout_of_same_cart_after_success_is_new_order(
        self, services: MerchantAndPSP
    ) -> None:
        cart_id = await _cart_with("prod_1")
        first = await process_acp_checkout(cart_id)
        await add_to_cart("prod_1", 1, cart_id=cart_id)
        second = await process_acp_checkout(cart_id)

        assert first["success"] is True
        assert second["success"] is True
        assert first["orderId"] != second["orderId"]
        assert len(services.orders_placed()) == 2
        first_key, second_key = services.keys_sent("/complete")
        assert first_key is not None
        assert first_key != second_key

    async def test_changed_cart_after_lost_response_starts_new_attempt(
        self, services: MerchantAndPSP
    ) -> None:
        cart_id = await _cart_with("prod_1")
        services.lose_complete_responses = 1
        assert (await process_acp_checkout(cart_id))["success"] is False

        await add_to_cart("prod_2", 1, cart_id=cart_id)
        retry = await process_acp_checkout(cart_id)

        assert retry["success"] is True
        first_key, retry_key = services.keys_sent("/checkout_sessions")
        assert first_key != retry_key

    async def test_attempt_key_expires(self, services: MerchantAndPSP) -> None:
        cart_id = await _cart_with("prod_1")
        services.lose_complete_responses = 1
        assert (await process_acp_checkout(cart_id))["success"] is False

        # Retry a day later, long after the attempt (and its allowance) expired.
        with patch.object(checkout_module, "datetime") as fake_datetime:
            fake_datetime.now.return_value = datetime.now(UTC) + timedelta(days=1)
            retry = await process_acp_checkout(cart_id)

        assert retry["success"] is True
        first_key, retry_key = services.keys_sent("/checkout_sessions")
        assert first_key is not None
        assert first_key != retry_key

    @pytest.mark.parametrize(
        ("status_code", "same_key"),
        [(400, False), (503, True)],
    )
    async def test_failed_complete_response(
        self, services: MerchantAndPSP, status_code: int, same_key: bool
    ) -> None:
        """A 4xx with no order on the session starts over; a 5xx keeps the key."""
        cart_id = await _cart_with("prod_1")
        services.fail_complete_with = status_code
        assert (await process_acp_checkout(cart_id))["success"] is False

        retry = await process_acp_checkout(cart_id)

        assert retry["success"] is True
        assert len(services.orders_placed()) == 1
        first_key, retry_key = services.keys_sent("/complete")
        assert first_key is not None
        assert (first_key == retry_key) is same_key

    async def test_retry_after_merchant_restart_starts_fresh(
        self, services: MerchantAndPSP
    ) -> None:
        """A merchant restart loses its cached responses; the cart must not stick.

        The PSP keeps its cache, so it refuses the old key for the retry's new
        session (409). That ends the attempt and the next call starts over.
        """
        cart_id = await _cart_with("prod_1")
        services.lose_complete_responses = 1
        assert (await process_acp_checkout(cart_id))["success"] is False
        reset_idempotency_store()

        first_retry = await process_acp_checkout(cart_id)
        second_retry = await process_acp_checkout(cart_id)

        assert first_retry["success"] is False
        assert second_retry["success"] is True
        first_key, retry_key, next_key = services.keys_sent("/delegate_payment")
        assert first_key is not None
        assert first_key == retry_key != next_key

    async def test_simulated_checkout_ends_attempt(
        self, services: MerchantAndPSP
    ) -> None:
        """After the offline fallback clears the cart, a new cart is new work."""
        cart_id = await _cart_with("prod_1")
        services.lose_complete_responses = 1
        assert (await process_acp_checkout(cart_id))["success"] is False
        (lost_order_id,) = services.orders_placed()

        services.refuse_connections = 1
        simulated = await process_acp_checkout(cart_id)
        assert simulated["success"] is True
        assert carts[cart_id] == []

        await add_to_cart("prod_1", 1, cart_id=cart_id)
        next_checkout = await process_acp_checkout(cart_id)

        assert next_checkout["success"] is True
        assert next_checkout["orderId"] != lost_order_id
        first_key, next_key = services.keys_sent("/checkout_sessions")
        assert first_key is not None
        assert first_key != next_key

    @pytest.mark.usefixtures("services")
    async def test_order_placed_before_5xx_is_returned(
        self, merchant_fails_after_order: list[str]
    ) -> None:
        """The merchant placed the order and then answered 500."""
        cart_id = await _cart_with("prod_1")

        result = await process_acp_checkout(cart_id)

        (order_id,) = merchant_fails_after_order
        assert result["success"] is True
        assert result["orderId"] == order_id
        assert carts[cart_id] == []

    async def test_retry_after_5xx_returns_order_placed_before_it(
        self, services: MerchantAndPSP, merchant_fails_after_order: list[str]
    ) -> None:
        """Nothing was cached for the 500, so the retried /complete gets a 405.

        The tool must still return the order instead of starting over.
        """
        cart_id = await _cart_with("prod_1")
        services.refuse_session_reads = 1
        assert (await process_acp_checkout(cart_id))["success"] is False
        assert carts[cart_id], "cart is kept when the outcome is unknown"

        retry = await process_acp_checkout(cart_id)

        (order_id,) = merchant_fails_after_order
        assert retry["success"] is True
        assert retry["orderId"] == order_id
        assert carts[cart_id] == []
        assert services.complete_statuses() == [500, 405]
        first_key, retry_key = services.keys_sent("/complete")
        assert first_key is not None
        assert first_key == retry_key

    async def test_refused_complete_keeps_key_while_session_is_unreadable(
        self, services: MerchantAndPSP, merchant_fails_after_order: list[str]
    ) -> None:
        """A 405 alone does not prove there is no order; the key must survive."""
        cart_id = await _cart_with("prod_1")
        services.refuse_session_reads = 2
        assert (await process_acp_checkout(cart_id))["success"] is False
        assert (await process_acp_checkout(cart_id))["success"] is False

        retry = await process_acp_checkout(cart_id)

        (order_id,) = merchant_fails_after_order
        assert retry["success"] is True
        assert retry["orderId"] == order_id
        assert services.complete_statuses() == [500, 405, 405]

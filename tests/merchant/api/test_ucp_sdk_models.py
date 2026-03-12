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

"""Tests for UCP SDK-compatible Pydantic models in sdk_models.py."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.merchant.protocols.ucp.sdk_models import (
    A2a,
    CheckoutResponse,
    Discovery,
    DiscoveryProfile,
    Embedded,
    FulfillmentEvent,
    ItemResponse,
    LineItemResponse,
    Link,
    Mcp,
    MessageError,
    MessageInfo,
    MessageWarning,
    Order,
    OrderLineItem,
    OrderLineItemQuantity,
    PaymentHandlerResponse,
    PaymentResponse,
    Response,
    ResponseCheckout,
    ResponseOrder,
    Rest,
    SigningKey,
    TotalResponse,
    UcpDiscoveryProfile,
    UcpService,
    Version,
)

# ---------------------------------------------------------------------------
# Version
# ---------------------------------------------------------------------------


class TestVersion:
    def test_valid_version(self) -> None:
        v = Version.model_validate("2026-01-11")
        assert v.root == "2026-01-11"

    def test_invalid_version_rejected(self) -> None:
        with pytest.raises(ValidationError):
            Version.model_validate("v1.0.0")


# ---------------------------------------------------------------------------
# Transport bindings
# ---------------------------------------------------------------------------


class TestTransportBindings:
    def test_rest_binding(self) -> None:
        r = Rest.model_validate(
            {
                "schema": "https://ucp.dev/services/shopping/rest.openapi.json",
                "endpoint": "https://merchant.example/api",
            }
        )
        assert str(r.endpoint) == "https://merchant.example/api"

    def test_a2a_binding(self) -> None:
        a = A2a.model_validate(
            {"endpoint": "https://merchant.example/.well-known/agent-card.json"}
        )
        assert "agent-card" in str(a.endpoint)

    def test_mcp_binding(self) -> None:
        m = Mcp.model_validate(
            {
                "schema": "https://ucp.dev/services/shopping/mcp.openrpc.json",
                "endpoint": "https://merchant.example/mcp",
            }
        )
        assert str(m.endpoint) == "https://merchant.example/mcp"

    def test_embedded_binding(self) -> None:
        e = Embedded.model_validate(
            {"schema": "https://ucp.dev/services/shopping/embedded.openrpc.json"}
        )
        assert "embedded" in str(e.schema_)


# ---------------------------------------------------------------------------
# UcpService
# ---------------------------------------------------------------------------


class TestUcpService:
    def test_service_with_a2a(self) -> None:
        s = UcpService.model_validate(
            {
                "version": "2026-01-11",
                "spec": "https://ucp.dev/specification/overview",
                "a2a": {
                    "endpoint": "https://merchant.example/.well-known/agent-card.json"
                },
            }
        )
        assert s.a2a is not None
        assert s.rest is None

    def test_service_round_trip(self) -> None:
        payload = {
            "version": "2026-01-11",
            "spec": "https://ucp.dev/specification/overview",
            "rest": {
                "schema": "https://ucp.dev/services/shopping/rest.openapi.json",
                "endpoint": "https://merchant.example/api",
            },
        }
        s = UcpService.model_validate(payload)
        dumped = s.model_dump(mode="json", by_alias=True)
        assert dumped["version"] == "2026-01-11"
        assert dumped["rest"]["endpoint"] == "https://merchant.example/api"


# ---------------------------------------------------------------------------
# Capabilities
# ---------------------------------------------------------------------------


class TestCapabilities:
    def test_discovery_capability(self) -> None:
        d = Discovery.model_validate(
            {
                "name": "dev.ucp.shopping.checkout",
                "version": "2026-01-11",
                "spec": "https://ucp.dev/specification/checkout",
            }
        )
        assert d.name == "dev.ucp.shopping.checkout"
        assert d.extends is None

    def test_response_capability(self) -> None:
        r = Response.model_validate(
            {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
        )
        assert r.name == "dev.ucp.shopping.checkout"

    def test_capability_with_extends(self) -> None:
        d = Discovery.model_validate(
            {
                "name": "dev.ucp.shopping.discount",
                "version": "2026-01-11",
                "extends": "dev.ucp.shopping.checkout",
            }
        )
        assert d.extends == "dev.ucp.shopping.checkout"

    def test_extra_fields_allowed(self) -> None:
        d = Discovery.model_validate(
            {
                "name": "dev.ucp.shopping.checkout",
                "version": "2026-01-11",
                "x_extends_all": ["dev.ucp.shopping.checkout"],
            }
        )
        dumped = d.model_dump(mode="json")
        assert "x_extends_all" in dumped


# ---------------------------------------------------------------------------
# Metadata envelopes
# ---------------------------------------------------------------------------


class TestMetadataEnvelopes:
    def test_discovery_profile(self) -> None:
        dp = DiscoveryProfile.model_validate(
            {
                "version": "2026-01-11",
                "services": {
                    "dev.ucp.shopping": {
                        "version": "2026-01-11",
                        "spec": "https://ucp.dev/specification/overview",
                        "a2a": {"endpoint": "https://merchant.example/agent-card.json"},
                    }
                },
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            }
        )
        assert len(dp.capabilities) == 1

    def test_response_checkout(self) -> None:
        rc = ResponseCheckout.model_validate(
            {
                "version": "2026-01-11",
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            }
        )
        assert rc.capabilities[0].name == "dev.ucp.shopping.checkout"

    def test_response_order(self) -> None:
        ro = ResponseOrder.model_validate(
            {
                "version": "2026-01-11",
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            }
        )
        assert len(ro.capabilities) == 1


# ---------------------------------------------------------------------------
# PaymentHandlerResponse
# ---------------------------------------------------------------------------


class TestPaymentHandlerResponse:
    def test_valid_handler(self) -> None:
        h = PaymentHandlerResponse.model_validate(
            {
                "id": "processor_tokenizer",
                "name": "com.example.processor_tokenizer",
                "version": "2026-01-11",
                "spec": "https://ucp.dev/specification/checkout",
                "config_schema": "https://ucp.dev/schemas/shopping/payment_handler_config.json",
                "instrument_schemas": [
                    "https://ucp.dev/schemas/shopping/payment_handler_config.json"
                ],
                "config": {"merchant_id": "acct_123"},
            }
        )
        assert h.id == "processor_tokenizer"
        assert h.config["merchant_id"] == "acct_123"


# ---------------------------------------------------------------------------
# Shopping types
# ---------------------------------------------------------------------------


class TestShoppingTypes:
    def test_total_response(self) -> None:
        t = TotalResponse.model_validate(
            {"type": "total", "display_text": "Total", "amount": 2750}
        )
        assert t.amount == 2750

    def test_total_response_rejects_negative(self) -> None:
        with pytest.raises(ValidationError):
            TotalResponse.model_validate(
                {"type": "total", "display_text": "Total", "amount": -1}
            )

    def test_item_response(self) -> None:
        i = ItemResponse.model_validate(
            {"id": "prod_1", "title": "Classic Tee", "price": 2500}
        )
        assert i.title == "Classic Tee"

    def test_line_item_response(self) -> None:
        li = LineItemResponse.model_validate(
            {
                "id": "li_1",
                "item": {"id": "prod_1", "title": "Classic Tee", "price": 2500},
                "quantity": 2,
                "totals": [
                    {"type": "subtotal", "display_text": "Subtotal", "amount": 5000}
                ],
            }
        )
        assert li.quantity == 2
        assert li.item.price == 2500

    def test_line_item_rejects_zero_quantity(self) -> None:
        with pytest.raises(ValidationError):
            LineItemResponse.model_validate(
                {
                    "id": "li_1",
                    "item": {"id": "prod_1", "title": "Tee", "price": 2500},
                    "quantity": 0,
                    "totals": [],
                }
            )

    def test_link(self) -> None:
        lnk = Link.model_validate(
            {"type": "terms_of_service", "url": "https://merchant.example/terms"}
        )
        assert lnk.type == "terms_of_service"

    def test_message_info(self) -> None:
        m = MessageInfo.model_validate(
            {"type": "info", "content": "Welcome to checkout"}
        )
        assert m.content == "Welcome to checkout"

    def test_message_error(self) -> None:
        m = MessageError.model_validate(
            {
                "type": "error",
                "code": "invalid_quantity",
                "content": "Quantity must be positive",
                "severity": "recoverable",
            }
        )
        assert m.severity == "recoverable"

    def test_message_warning(self) -> None:
        m = MessageWarning.model_validate(
            {"type": "warning", "code": "low_stock", "content": "Only 2 left"}
        )
        assert m.code == "low_stock"

    def test_signing_key(self) -> None:
        sk = SigningKey.model_validate(
            {"kid": "key-1", "kty": "EC", "crv": "P-256", "x": "abc", "alg": "ES256"}
        )
        assert sk.kid == "key-1"


# ---------------------------------------------------------------------------
# PaymentResponse
# ---------------------------------------------------------------------------


class TestPaymentResponse:
    def test_payment_with_handlers(self) -> None:
        pr = PaymentResponse.model_validate(
            {
                "handlers": [
                    {
                        "id": "ph_1",
                        "name": "com.example.tokenizer",
                        "version": "2026-01-11",
                        "spec": "https://ucp.dev/specification/checkout",
                        "config_schema": "https://ucp.dev/schemas/shopping/config.json",
                        "instrument_schemas": [
                            "https://ucp.dev/schemas/shopping/config.json"
                        ],
                        "config": {},
                    }
                ]
            }
        )
        assert len(pr.handlers) == 1
        assert pr.selected_instrument_id is None


# ---------------------------------------------------------------------------
# CheckoutResponse
# ---------------------------------------------------------------------------


class TestCheckoutResponse:
    def test_full_checkout_response_round_trip(self) -> None:
        payload = {
            "ucp": {
                "version": "2026-01-11",
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            },
            "id": "checkout_abc",
            "status": "incomplete",
            "currency": "USD",
            "line_items": [
                {
                    "id": "li_1",
                    "item": {"id": "prod_1", "title": "Classic Tee", "price": 2500},
                    "quantity": 1,
                    "totals": [
                        {
                            "type": "subtotal",
                            "display_text": "Subtotal",
                            "amount": 2500,
                        },
                        {"type": "total", "display_text": "Total", "amount": 2500},
                    ],
                }
            ],
            "totals": [{"type": "total", "display_text": "Total", "amount": 2500}],
            "links": [
                {"type": "terms_of_service", "url": "https://merchant.example/terms"},
                {"type": "privacy_policy", "url": "https://merchant.example/privacy"},
            ],
            "payment": {
                "handlers": [
                    {
                        "id": "ph_1",
                        "name": "com.example.tokenizer",
                        "version": "2026-01-11",
                        "spec": "https://ucp.dev/specification/checkout",
                        "config_schema": "https://ucp.dev/schemas/shopping/config.json",
                        "instrument_schemas": [
                            "https://ucp.dev/schemas/shopping/config.json"
                        ],
                        "config": {},
                    }
                ]
            },
        }
        cr = CheckoutResponse.model_validate(payload)
        dumped = cr.model_dump(mode="json")
        assert dumped["id"] == "checkout_abc"
        assert dumped["status"] == "incomplete"
        assert len(dumped["line_items"]) == 1
        assert dumped["payment"]["handlers"][0]["id"] == "ph_1"

    def test_checkout_rejects_invalid_status(self) -> None:
        with pytest.raises(ValidationError):
            CheckoutResponse.model_validate(
                {
                    "ucp": {"version": "2026-01-11", "capabilities": []},
                    "id": "c1",
                    "status": "bogus",
                    "currency": "USD",
                    "line_items": [],
                    "totals": [],
                    "links": [],
                    "payment": {"handlers": []},
                }
            )


# ---------------------------------------------------------------------------
# Discovery profile
# ---------------------------------------------------------------------------


class TestUcpDiscoveryProfile:
    def test_full_discovery_profile_round_trip(self) -> None:
        payload = {
            "ucp": {
                "version": "2026-01-11",
                "services": {
                    "dev.ucp.shopping": {
                        "version": "2026-01-11",
                        "spec": "https://ucp.dev/specification/overview",
                        "a2a": {"endpoint": "https://merchant.example/agent-card.json"},
                    }
                },
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            },
            "payment": {
                "handlers": [
                    {
                        "id": "ph_1",
                        "name": "com.example.tokenizer",
                        "version": "2026-01-11",
                        "spec": "https://ucp.dev/specification/checkout",
                        "config_schema": "https://ucp.dev/schemas/shopping/config.json",
                        "instrument_schemas": [
                            "https://ucp.dev/schemas/shopping/config.json"
                        ],
                        "config": {},
                    }
                ]
            },
            "signing_keys": [
                {"kid": "k1", "kty": "EC", "crv": "P-256", "x": "abc", "alg": "ES256"}
            ],
        }
        dp = UcpDiscoveryProfile.model_validate(payload)
        dumped = dp.model_dump(mode="json")
        assert dumped["ucp"]["version"] == "2026-01-11"
        assert dumped["payment"]["handlers"][0]["id"] == "ph_1"
        assert dumped["signing_keys"][0]["kid"] == "k1"


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------


class TestOrder:
    def test_full_order_round_trip(self) -> None:
        """Mirrors the payload built by post_purchase_webhook._build_ucp_order_event."""
        payload = {
            "ucp": {
                "version": "2026-01-11",
                "capabilities": [
                    {"name": "dev.ucp.shopping.checkout", "version": "2026-01-11"}
                ],
            },
            "id": "order_abc",
            "checkout_id": "checkout_abc",
            "permalink_url": "https://merchant.example/orders/order_abc",
            "line_items": [
                {
                    "id": "li_1",
                    "item": {"id": "prod_1", "title": "Classic Tee", "price": 2500},
                    "quantity": {"total": 2, "fulfilled": 0},
                    "totals": [
                        {
                            "type": "subtotal",
                            "display_text": "Subtotal",
                            "amount": 5000,
                        },
                        {"type": "tax", "display_text": "Tax", "amount": 500},
                        {"type": "total", "display_text": "Total", "amount": 5500},
                    ],
                    "status": "processing",
                }
            ],
            "fulfillment": {
                "events": [
                    {
                        "id": "ful_abc123",
                        "occurred_at": "2026-01-15T12:00:00+00:00",
                        "type": "order_confirmed",
                        "line_items": [{"id": "prod_1", "quantity": 2}],
                        "tracking_url": "https://track.example/orders/order_abc",
                        "description": "Your order has been confirmed.",
                    }
                ]
            },
            "totals": [
                {"type": "subtotal", "display_text": "Subtotal", "amount": 5000},
                {"type": "tax", "display_text": "Tax", "amount": 500},
                {"type": "total", "display_text": "Total", "amount": 5500},
            ],
        }
        order = Order.model_validate(payload)
        dumped = order.model_dump(mode="json")
        assert dumped["id"] == "order_abc"
        assert dumped["checkout_id"] == "checkout_abc"
        assert dumped["line_items"][0]["quantity"]["total"] == 2
        assert dumped["line_items"][0]["status"] == "processing"
        assert dumped["fulfillment"]["events"][0]["type"] == "order_confirmed"
        assert len(dumped["totals"]) == 3

    def test_order_rejects_invalid_line_item_status(self) -> None:
        with pytest.raises(ValidationError):
            OrderLineItem.model_validate(
                {
                    "id": "li_1",
                    "item": {"id": "p1", "title": "Tee", "price": 100},
                    "quantity": {"total": 1, "fulfilled": 0},
                    "totals": [],
                    "status": "bogus",
                }
            )

    def test_order_line_item_quantity_rejects_negative(self) -> None:
        with pytest.raises(ValidationError):
            OrderLineItemQuantity.model_validate({"total": -1, "fulfilled": 0})

    def test_fulfillment_event_round_trip(self) -> None:
        fe = FulfillmentEvent.model_validate(
            {
                "id": "ful_1",
                "occurred_at": "2026-01-15T12:00:00+00:00",
                "type": "shipped",
                "line_items": [{"id": "prod_1", "quantity": 1}],
                "tracking_number": "1Z999AA10123456784",
                "carrier": "UPS",
            }
        )
        dumped = fe.model_dump(mode="json")
        assert dumped["tracking_number"] == "1Z999AA10123456784"
        assert dumped["carrier"] == "UPS"

    def test_order_with_fulfillment_expectations(self) -> None:
        order = Order.model_validate(
            {
                "ucp": {"version": "2026-01-11", "capabilities": []},
                "id": "order_1",
                "checkout_id": "checkout_1",
                "permalink_url": "https://merchant.example/orders/order_1",
                "line_items": [
                    {
                        "id": "li_1",
                        "item": {"id": "p1", "title": "Tee", "price": 100},
                        "quantity": {"total": 1, "fulfilled": 1},
                        "totals": [{"type": "total", "amount": 100}],
                        "status": "fulfilled",
                    }
                ],
                "fulfillment": {
                    "expectations": [
                        {
                            "id": "exp_1",
                            "line_items": [{"id": "p1", "quantity": 1}],
                            "method_type": "shipping",
                            "destination": {
                                "street_address": "123 Main St",
                                "address_locality": "Springfield",
                                "postal_code": "12345",
                            },
                        }
                    ]
                },
                "totals": [{"type": "total", "amount": 100}],
            }
        )
        assert order.fulfillment.expectations is not None
        assert len(order.fulfillment.expectations) == 1

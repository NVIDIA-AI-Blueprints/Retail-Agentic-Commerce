"""Tests for the UCP schema bridge adapters backed by ucp_sdk."""

from __future__ import annotations

from src.merchant.api.ucp_schemas import (
    UCPBusinessProfile,
    UCPCapabilityVersion,
    UCPCheckoutResponse,
    UCPCheckoutStatus,
    UCPItem,
    UCPLineItem,
    UCPMessage,
    UCPMessageType,
    UCPMetadata,
    UCPPaymentHandler,
    UCPResponseMetadata,
    UCPService,
    UCPTotal,
    UCPTotalType,
    to_sdk_checkout_response,
    to_sdk_discovery_profile,
)
from src.merchant.services.ucp import build_business_profile


def test_to_sdk_discovery_profile_supports_current_wire_shape() -> None:
    profile = UCPBusinessProfile(
        ucp=UCPMetadata(
            version="2026-01-11",
            services={
                "dev.ucp.shopping": [
                    UCPService(
                        version="2026-01-11",
                        transport="a2a",
                        endpoint="http://localhost:8000/.well-known/agent-card.json",
                    )
                ]
            },
            capabilities={
                "dev.ucp.shopping.checkout": [
                    UCPCapabilityVersion(version="2026-01-11")
                ],
                "dev.ucp.shopping.discount": [
                    UCPCapabilityVersion(
                        version="2026-01-11",
                        extends=[
                            "dev.ucp.shopping.checkout",
                            "dev.ucp.shopping.cart",
                        ],
                    )
                ],
            },
            payment_handlers={
                "com.example.processor_tokenizer": [
                    UCPPaymentHandler(id="processor_tokenizer", version="2026-01-11")
                ]
            },
        )
    )

    sdk_profile = to_sdk_discovery_profile(profile)
    dumped = sdk_profile.model_dump(mode="json")

    assert dumped["ucp"]["version"] == "2026-01-11"
    cap_names = {cap["name"] for cap in dumped["ucp"]["capabilities"]}
    assert "dev.ucp.shopping.checkout" in cap_names
    assert "dev.ucp.shopping.discount" in cap_names


def test_to_sdk_checkout_response_supports_current_wire_shape() -> None:
    response = UCPCheckoutResponse(
        ucp=UCPResponseMetadata(
            version="2026-01-11",
            capabilities={
                "dev.ucp.shopping.checkout": [
                    UCPCapabilityVersion(version="2026-01-11")
                ]
            },
            payment_handlers={
                "com.example.processor_tokenizer": [
                    UCPPaymentHandler(id="processor_tokenizer", version="2026-01-11")
                ]
            },
        ),
        id="checkout_123",
        status=UCPCheckoutStatus.INCOMPLETE,
        currency="USD",
        line_items=[
            UCPLineItem(
                id="li_123",
                item=UCPItem(id="prod_1", title="Classic Tee", price=2500),
                quantity=1,
                totals=[
                    UCPTotal(type=UCPTotalType.SUBTOTAL, label="Subtotal", amount=2500),
                    UCPTotal(type=UCPTotalType.TAX, label="Tax", amount=250),
                    UCPTotal(type=UCPTotalType.TOTAL, label="Total", amount=2750),
                ],
            )
        ],
        totals=[UCPTotal(type=UCPTotalType.TOTAL, label="Total", amount=2750)],
        messages=[
            UCPMessage(
                type=UCPMessageType.INFO,
                content="Welcome to checkout",
                path="$",
            )
        ],
    )

    sdk_response = to_sdk_checkout_response(response)
    dumped = sdk_response.model_dump(mode="json")

    assert dumped["status"] == "incomplete"
    assert dumped["id"] == "checkout_123"
    assert dumped["payment"]["handlers"][0]["id"] == "processor_tokenizer"


def test_build_business_profile_remains_sdk_validated() -> None:
    profile = build_business_profile(request_base_url="http://localhost:8000")
    assert profile.ucp.version == "2026-01-11"
    assert "dev.ucp.shopping.checkout" in profile.ucp.capabilities

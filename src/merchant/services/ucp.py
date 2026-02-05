"""UCP discovery profile helpers and checkout utilities."""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime, timedelta
from typing import Any, cast

import httpx

from src.merchant.api.schemas import (
    BuyerInput,
    CheckoutSessionResponse,
    CreateCheckoutRequest,
    ItemInput,
    LineItem,
    MessageError,
    MessageInfo,
    Total,
    TotalTypeEnum,
    UpdateCheckoutRequest,
)
from src.merchant.api.ucp_schemas import (
    UCPBusinessProfile,
    UCPBuyerInput,
    UCPCapabilityVersion,
    UCPCheckoutResponse,
    UCPCheckoutStatus,
    UCPCreateCheckoutRequest,
    UCPItem,
    UCPLineItem,
    UCPMessage,
    UCPMessageType,
    UCPMetadata,
    UCPPaymentHandler,
    UCPResponseMetadata,
    UCPService,
    UCPSigningKey,
    UCPTotal,
    UCPTotalType,
    UCPUpdateCheckoutRequest,
)
from src.merchant.config import get_settings

CACHE_TTL = timedelta(minutes=10)
CHECKOUT_CAPABILITY = "dev.ucp.shopping.checkout"
_profile_cache: dict[str, tuple[dict[str, Any], datetime]] = {}


def build_business_profile(request_base_url: str | None = None) -> UCPBusinessProfile:
    """Build static UCP business profile from configuration.

    Returns a minimal discovery profile with:
    - dev.ucp.shopping service (REST transport)
    - dev.ucp.shopping.checkout capability
    - dev.ucp.shopping.fulfillment extension
    - dev.ucp.shopping.discount capability
    - Optional static payment handler block
    - Top-level signing_keys for webhook verification

    Args:
        request_base_url: Fallback base URL from request if ucp_base_url not configured.
    """
    settings = get_settings()

    base_url = settings.ucp_base_url or request_base_url
    if not base_url:
        raise ValueError("ucp_base_url not configured and no request base URL provided")

    service_endpoint = f"{base_url.rstrip('/')}{settings.ucp_service_path}"

    signing_keys: list[UCPSigningKey] | None = None
    if settings.ucp_signing_key_x:
        signing_keys = [
            UCPSigningKey(
                kid=settings.ucp_signing_key_id,
                kty=settings.ucp_signing_key_kty,
                crv=settings.ucp_signing_key_crv,
                x=settings.ucp_signing_key_x,
                y=settings.ucp_signing_key_y or None,
                alg=settings.ucp_signing_key_alg,
            )
        ]

    agent_card_url = f"{base_url.rstrip('/')}/.well-known/agent-card.json"

    return UCPBusinessProfile(
        ucp=UCPMetadata(
            version=settings.ucp_version,
            services={
                "dev.ucp.shopping": [
                    UCPService(
                        version=settings.ucp_version,
                        spec="https://ucp.dev/specification/overview",
                        transport="rest",
                        endpoint=service_endpoint,
                    ),
                    UCPService(
                        version=settings.ucp_version,
                        spec="https://ucp.dev/specification/overview",
                        transport="a2a",
                        endpoint=agent_card_url,
                    ),
                ]
            },
            capabilities={
                "dev.ucp.shopping.checkout": [
                    UCPCapabilityVersion(version=settings.ucp_version)
                ],
                "dev.ucp.shopping.fulfillment": [
                    UCPCapabilityVersion(
                        version=settings.ucp_version,
                        extends="dev.ucp.shopping.checkout",
                    )
                ],
                "dev.ucp.shopping.discount": [
                    UCPCapabilityVersion(version=settings.ucp_version)
                ],
            },
            payment_handlers={
                "com.example.processor_tokenizer": [
                    UCPPaymentHandler(
                        id="processor_tokenizer",
                        version=settings.ucp_version,
                        config=None,
                    )
                ]
            },
        ),
        signing_keys=signing_keys,
    )


def clear_profile_cache() -> None:
    """Clear the in-memory platform profile cache (used in tests)."""
    _profile_cache.clear()


def parse_ucp_agent_header(header: str) -> str:
    """Parse RFC 8941 dictionary to extract profile URL."""
    match = re.search(r'profile="([^"]+)"', header)
    if not match:
        raise ValueError("Invalid UCP-Agent header: missing profile")
    return match.group(1)


async def fetch_platform_profile(profile_url: str) -> dict[str, Any]:
    """Fetch platform profile with caching (10 min TTL)."""
    now = datetime.now(UTC)
    cached = _profile_cache.get(profile_url)
    if cached and now < cached[1]:
        return cached[0]

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(profile_url)
        response.raise_for_status()
        try:
            profile = response.json()
        except json.JSONDecodeError as exc:
            raise ValueError("Platform profile invalid JSON") from exc

    if not isinstance(profile, dict):
        raise ValueError("Platform profile invalid JSON")

    profile = cast(dict[str, Any], profile)

    ucp_block = profile.get("ucp")
    if not isinstance(ucp_block, dict):
        raise ValueError("Profile missing 'ucp' key")

    ucp_block = cast(dict[str, Any], ucp_block)
    capabilities = ucp_block.get("capabilities")
    if not isinstance(capabilities, dict):
        raise ValueError("Profile missing 'ucp.capabilities' key")

    _profile_cache[profile_url] = (profile, now + CACHE_TTL)
    return profile


def compute_capability_intersection(
    business_profile: UCPBusinessProfile, platform_profile: dict[str, Any]
) -> dict[str, list[UCPCapabilityVersion]]:
    """Compute capability intersection (checkout-only, Phase 2)."""
    business_caps = business_profile.ucp.capabilities
    platform_caps = platform_profile.get("ucp", {}).get("capabilities", {})

    if not isinstance(platform_caps, dict):
        raise ValueError("Profile missing 'ucp.capabilities' key")

    if CHECKOUT_CAPABILITY in business_caps and CHECKOUT_CAPABILITY in platform_caps:
        return {CHECKOUT_CAPABILITY: business_caps[CHECKOUT_CAPABILITY]}

    return {}


def normalize_ucp_create_request(
    request: UCPCreateCheckoutRequest,
) -> CreateCheckoutRequest:
    """Convert UCP create request to internal ACP format."""
    return CreateCheckoutRequest(
        items=[
            ItemInput(id=line_item.item.id, quantity=line_item.quantity)
            for line_item in request.line_items
        ],
        buyer=convert_ucp_buyer(request.buyer),
    )


def normalize_ucp_update_request(
    request: UCPUpdateCheckoutRequest,
) -> UpdateCheckoutRequest:
    """Convert UCP update request to internal ACP format."""
    return UpdateCheckoutRequest(
        items=[
            ItemInput(id=line_item.item.id, quantity=line_item.quantity)
            for line_item in request.line_items
        ],
        buyer=convert_ucp_buyer(request.buyer),
    )


def transform_to_ucp_response(
    acp_response: CheckoutSessionResponse,
    negotiated_capabilities: dict[str, list[UCPCapabilityVersion]],
) -> UCPCheckoutResponse:
    """Convert ACP response to UCP format with negotiated capabilities."""
    return UCPCheckoutResponse(
        ucp=UCPResponseMetadata(
            version=get_settings().ucp_version,
            capabilities=negotiated_capabilities,
        ),
        id=acp_response.id,
        status=_map_ucp_status(acp_response.status.value),
        currency=acp_response.currency.upper(),
        line_items=[
            _convert_line_item(line_item) for line_item in acp_response.line_items
        ],
        totals=_convert_totals(acp_response.totals),
        messages=_convert_messages(acp_response.messages),
    )


def convert_ucp_buyer(buyer: UCPBuyerInput | None) -> BuyerInput | None:
    if buyer is None:
        return None
    return BuyerInput(
        first_name=buyer.first_name,
        last_name=buyer.last_name,
        email=buyer.email,
        phone_number=buyer.phone,
    )


def _map_ucp_status(status: str) -> UCPCheckoutStatus:
    mapping = {
        "not_ready_for_payment": UCPCheckoutStatus.INCOMPLETE,
        "ready_for_payment": UCPCheckoutStatus.READY_FOR_COMPLETE,
        "completed": UCPCheckoutStatus.COMPLETED,
        "canceled": UCPCheckoutStatus.CANCELED,
    }
    return mapping[status]


def _convert_line_item(line_item: LineItem) -> UCPLineItem:
    quantity = line_item.item.quantity
    unit_price = line_item.base_amount // quantity if quantity else 0
    return UCPLineItem(
        id=line_item.id,
        item=UCPItem(
            id=line_item.item.id,
            title=line_item.name or line_item.item.id,
            price=unit_price,
        ),
        quantity=quantity,
        totals=[
            UCPTotal(
                type=UCPTotalType.SUBTOTAL,
                label="Subtotal",
                amount=line_item.subtotal,
            ),
            UCPTotal(type=UCPTotalType.TAX, label="Tax", amount=line_item.tax),
            UCPTotal(type=UCPTotalType.TOTAL, label="Total", amount=line_item.total),
        ],
    )


def _convert_totals(totals: list[Total]) -> list[UCPTotal]:
    type_mapping = {
        TotalTypeEnum.SUBTOTAL: UCPTotalType.SUBTOTAL,
        TotalTypeEnum.DISCOUNT: UCPTotalType.DISCOUNT,
        TotalTypeEnum.ITEMS_DISCOUNT: UCPTotalType.ITEMS_DISCOUNT,
        TotalTypeEnum.TAX: UCPTotalType.TAX,
        TotalTypeEnum.TOTAL: UCPTotalType.TOTAL,
    }

    converted: list[UCPTotal] = []
    for total in totals:
        mapped_type = type_mapping.get(total.type)
        if mapped_type is None:
            continue
        converted.append(
            UCPTotal(
                type=mapped_type,
                label=total.display_text,
                amount=total.amount,
            )
        )
    return converted


def _convert_messages(messages: list[MessageInfo | MessageError]) -> list[UCPMessage]:
    converted: list[UCPMessage] = []
    for message in messages:
        if isinstance(message, MessageError):
            converted.append(
                UCPMessage(
                    type=UCPMessageType.ERROR,
                    code=message.code.value,
                    path=message.param,
                    content=message.content,
                )
            )
            continue

        converted.append(
            UCPMessage(
                type=UCPMessageType.INFO,
                path=message.param,
                content=message.content,
            )
        )

    return converted

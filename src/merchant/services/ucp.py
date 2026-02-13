"""UCP discovery profile helpers and checkout utilities."""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime, timedelta
from typing import Any, cast

import httpx

from src.merchant.api.schemas import (
    CheckoutSessionResponse,
    LineItem,
    MessageError,
    MessageInfo,
    MessageWarning,
    Total,
    TotalTypeEnum,
)
from src.merchant.api.ucp_schemas import (
    UCPBusinessProfile,
    UCPCapabilityVersion,
    UCPCheckoutResponse,
    UCPCheckoutStatus,
    UCPItem,
    UCPLineItem,
    UCPMessage,
    UCPMessageSeverity,
    UCPMessageType,
    UCPMetadata,
    UCPPaymentHandler,
    UCPResponseMetadata,
    UCPService,
    UCPSigningKey,
    UCPTotal,
    UCPTotalType,
    validate_business_profile_with_sdk,
    validate_checkout_response_with_sdk,
)
from src.merchant.config import get_settings

CACHE_TTL = timedelta(minutes=10)
CHECKOUT_CAPABILITY = "dev.ucp.shopping.checkout"
ORDER_CAPABILITY = "dev.ucp.shopping.order"
_profile_cache: dict[str, tuple[dict[str, Any], datetime]] = {}


class NegotiationFailureError(Exception):
    """Raised when capability negotiation fails.

    Covers ``CAPABILITIES_INCOMPATIBLE`` (empty intersection) and
    ``VERSION_UNSUPPORTED`` (platform UCP version too new).

    Per spec these are NOT transport errors -- callers return a JSON-RPC
    result (not error) with a UCP error body.
    """

    def __init__(self, code: str, content: str) -> None:
        super().__init__(content)
        self.code = code
        self.content = content


def build_business_profile(request_base_url: str | None = None) -> UCPBusinessProfile:
    """Build static UCP business profile from configuration.

    Returns a discovery profile with:
    - dev.ucp.shopping service (A2A transport)
    - dev.ucp.shopping.checkout capability
    - dev.ucp.shopping.fulfillment extension
    - dev.ucp.shopping.discount extension
    - Optional static payment handler block
    - Top-level signing_keys for webhook verification

    Args:
        request_base_url: Fallback base URL from request if ucp_base_url not configured.
    """
    settings = get_settings()

    base_url = settings.ucp_base_url or request_base_url
    if not base_url:
        raise ValueError("ucp_base_url not configured and no request base URL provided")

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

    profile = UCPBusinessProfile(
        ucp=UCPMetadata(
            version=settings.ucp_version,
            services={
                "dev.ucp.shopping": [
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
                "dev.ucp.shopping.order": [
                    UCPCapabilityVersion(version=settings.ucp_version)
                ],
                "dev.ucp.shopping.fulfillment": [
                    UCPCapabilityVersion(
                        version=settings.ucp_version,
                        extends="dev.ucp.shopping.checkout",
                    )
                ],
                "dev.ucp.shopping.discount": [
                    UCPCapabilityVersion(
                        version=settings.ucp_version,
                        extends=[
                            "dev.ucp.shopping.checkout",
                            "dev.ucp.shopping.cart",
                        ],
                    )
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

    # Validate using canonical SDK models while preserving current wire shape.
    validate_business_profile_with_sdk(profile)
    return profile


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


def _get_extends_list(cap: UCPCapabilityVersion) -> list[str]:
    """Normalize ``extends`` to a list (handles str | list[str] | None)."""
    if cap.extends is None:
        return []
    if isinstance(cap.extends, str):
        return [cap.extends]
    return list(cap.extends)


def _parse_cap_version(version_str: str) -> datetime:
    """Parse a YYYY-MM-DD capability version into a datetime for comparison."""
    return datetime.strptime(version_str, "%Y-%m-%d")


def _platform_cap_version_ok(
    platform_versions: list[dict[str, Any]],
    business_version: str,
) -> bool:
    """Return True if any platform capability version <= the business version."""
    business_dt = _parse_cap_version(business_version)
    for pv in platform_versions:
        raw_version = pv.get("version")
        if not isinstance(raw_version, str):
            continue
        try:
            if _parse_cap_version(raw_version) <= business_dt:
                return True
        except ValueError:
            continue
    return False


def compute_capability_intersection(
    business_profile: UCPBusinessProfile,
    platform_profile: dict[str, Any],
) -> dict[str, list[UCPCapabilityVersion]]:
    """Spec-compliant capability intersection with extension pruning.

    Algorithm (per UCP overview spec):
      1. Compute intersection: include business capability if the platform
         also declares it AND the platform's capability version is compatible
         (platform version <= business version).
      2. Prune orphaned extensions: remove any capability whose ``extends``
         parents are all absent from the intersection.
      3. Repeat step 2 until stable (handles transitive chains).
    """
    business_caps = business_profile.ucp.capabilities
    platform_caps = platform_profile.get("ucp", {}).get("capabilities", {})

    if not isinstance(platform_caps, dict):
        raise ValueError("Profile missing 'ucp.capabilities' key")

    # --- Step 1: Compute intersection with per-capability version check ---
    platform_caps_dict = cast(dict[str, Any], platform_caps)
    intersection: dict[str, list[UCPCapabilityVersion]] = {}
    for cap_name, business_versions in business_caps.items():
        platform_versions_raw: Any = platform_caps_dict.get(cap_name)
        if platform_versions_raw is None:
            continue
        if not isinstance(platform_versions_raw, list):
            continue
        platform_versions_list: list[dict[str, Any]] = cast(
            list[dict[str, Any]], platform_versions_raw
        )
        biz_version = business_versions[0].version if business_versions else ""
        if _platform_cap_version_ok(platform_versions_list, biz_version):
            intersection[cap_name] = business_versions

    # --- Steps 2-3: Iterative extension pruning ---
    changed = True
    while changed:
        changed = False
        to_remove: list[str] = []
        for cap_name, versions in intersection.items():
            for ver in versions:
                parents = _get_extends_list(ver)
                if parents and not any(p in intersection for p in parents):
                    to_remove.append(cap_name)
                    break
        for cap_name in to_remove:
            del intersection[cap_name]
            changed = True

    return intersection


def filter_capabilities_for_checkout(
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> dict[str, list[UCPCapabilityVersion]]:
    """Filter negotiated capabilities to only those relevant to checkout.

    Per spec, responses MUST include only capabilities that are in the
    negotiated intersection AND relevant to the operation type.
    For checkout: the root checkout capability plus extensions whose
    ``extends`` references checkout.
    """
    result: dict[str, list[UCPCapabilityVersion]] = {}
    for cap_name, versions in negotiated.items():
        if cap_name == CHECKOUT_CAPABILITY:
            result[cap_name] = versions
            continue
        for ver in versions:
            parents = _get_extends_list(ver)
            if CHECKOUT_CAPABILITY in parents:
                result[cap_name] = versions
                break
    return result


def get_platform_order_webhook_url(
    platform_profile: dict[str, Any],
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> str | None:
    """Extract UCP order webhook URL from platform profile capability config.

    The platform advertises order webhook callback support in
    ``dev.ucp.shopping.order[].config.webhook_url``.
    """
    if ORDER_CAPABILITY not in negotiated:
        return None

    ucp_block = platform_profile.get("ucp")
    if not isinstance(ucp_block, dict):
        return None

    capabilities = ucp_block.get("capabilities")
    if not isinstance(capabilities, dict):
        return None

    order_versions_raw = capabilities.get(ORDER_CAPABILITY)
    if not isinstance(order_versions_raw, list):
        return None

    for raw_version in cast(list[Any], order_versions_raw):
        if not isinstance(raw_version, dict):
            continue
        config = raw_version.get("config")
        if not isinstance(config, dict):
            continue
        webhook_url = config.get("webhook_url")
        if isinstance(webhook_url, str) and webhook_url.strip():
            return webhook_url.strip()

    return None


def transform_to_ucp_response(
    acp_response: CheckoutSessionResponse,
    negotiated_capabilities: dict[str, list[UCPCapabilityVersion]],
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None,
) -> UCPCheckoutResponse:
    """Convert ACP response to UCP format with negotiated capabilities.

    Capabilities are filtered to only those relevant to checkout before
    being included in the response.
    """
    filtered = filter_capabilities_for_checkout(negotiated_capabilities)
    response = UCPCheckoutResponse(
        ucp=UCPResponseMetadata(
            version=get_settings().ucp_version,
            capabilities=filtered,
            payment_handlers=payment_handlers,
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
    validate_checkout_response_with_sdk(response)
    return response


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


def _convert_messages(
    messages: list[MessageInfo | MessageWarning | MessageError],
) -> list[UCPMessage]:
    converted: list[UCPMessage] = []
    for message in messages:
        if isinstance(message, MessageError):
            converted.append(
                UCPMessage(
                    type=UCPMessageType.ERROR,
                    code=message.code.value,
                    path=message.param,
                    content=message.content,
                    severity=UCPMessageSeverity.RECOVERABLE,
                )
            )
            continue

        if isinstance(message, MessageWarning):
            converted.append(
                UCPMessage(
                    type=UCPMessageType.WARNING,
                    code=message.code,
                    path=message.param,
                    content=message.content,
                    severity=UCPMessageSeverity.REQUIRES_BUYER_REVIEW,
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

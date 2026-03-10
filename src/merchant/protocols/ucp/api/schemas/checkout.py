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

"""UCP schema bridge using local wire models plus SDK validation adapters.

This module preserves the current project wire contracts while adopting
`ucp_sdk` as the canonical schema dependency for contract validation.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Any, cast

from pydantic import BaseModel, ConfigDict, Field
from ucp_sdk.models._internal import (
    Discovery as SDKDiscoveryCapability,
)
from ucp_sdk.models._internal import (
    DiscoveryProfile as SDKDiscoveryProfile,
)
from ucp_sdk.models._internal import (
    Response as SDKResponseCapability,
)
from ucp_sdk.models._internal import (
    ResponseCheckout as SDKResponseCheckout,
)
from ucp_sdk.models._internal import (
    UcpService as SDKService,
)
from ucp_sdk.models.discovery.profile_schema import (
    Payment as SDKDiscoveryPayment,
)
from ucp_sdk.models.discovery.profile_schema import (
    UcpDiscoveryProfile as SDKUcpDiscoveryProfile,
)
from ucp_sdk.models.schemas.shopping.checkout_resp import (
    CheckoutResponse as SDKCheckoutResponse,
)
from ucp_sdk.models.schemas.shopping.payment_resp import PaymentResponse as SDKPayment
from ucp_sdk.models.schemas.shopping.types.payment_handler_resp import (
    PaymentHandlerResponse as SDKPaymentHandler,
)

DEFAULT_UCP_SPEC_URL = "https://ucp.dev/specification/overview"
DEFAULT_PAYMENT_HANDLER_SPEC_URL = "https://ucp.dev/specification/checkout"
DEFAULT_PAYMENT_HANDLER_SCHEMA_URL = (
    "https://ucp.dev/schemas/shopping/payment_handler_config.json"
)
DEFAULT_TOS_URL = "https://merchant.example/terms"
DEFAULT_PRIVACY_URL = "https://merchant.example/privacy"


class UCPService(BaseModel):
    """UCP service endpoint definition."""

    model_config = ConfigDict(populate_by_name=True)

    version: str
    transport: str
    endpoint: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")


class UCPCapabilityVersion(BaseModel):
    """UCP capability with version and optional extension parent(s)."""

    model_config = ConfigDict(populate_by_name=True)

    version: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")
    extends: str | list[str] | None = None


class UCPPaymentHandler(BaseModel):
    """Optional payment handler definition in current project wire shape."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    version: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")
    config: dict[str, Any] | None = None


class UCPSigningKey(BaseModel):
    """JWK signing key for webhook verification."""

    kid: str
    kty: str
    crv: str
    x: str
    y: str | None = None
    alg: str


class UCPMetadata(BaseModel):
    """Core UCP metadata in discovery profile."""

    version: str
    services: dict[str, list[UCPService]]
    capabilities: dict[str, list[UCPCapabilityVersion]]
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None


class UCPBusinessProfile(BaseModel):
    """Top-level UCP business profile returned by discovery."""

    ucp: UCPMetadata
    signing_keys: list[UCPSigningKey] | None = None


# =============================================================================
# UCP Checkout Schemas (current project wire subset)
# =============================================================================


class UCPCheckoutStatus(StrEnum):
    """UCP checkout status values used by this implementation."""

    INCOMPLETE = "incomplete"
    READY_FOR_COMPLETE = "ready_for_complete"
    COMPLETED = "completed"
    CANCELED = "canceled"


class UCPTotalType(StrEnum):
    """UCP total types used by this implementation."""

    SUBTOTAL = "subtotal"
    DISCOUNT = "discount"
    ITEMS_DISCOUNT = "items_discount"
    TAX = "tax"
    TOTAL = "total"


class UCPMessageType(StrEnum):
    """UCP message types."""

    INFO = "info"
    ERROR = "error"
    WARNING = "warning"


class UCPItemInput(BaseModel):
    """UCP item input for checkout requests."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(..., description="Product ID")


class UCPLineItemInput(BaseModel):
    """UCP line item input."""

    model_config = ConfigDict(extra="forbid")

    item: UCPItemInput = Field(..., description="Item reference")
    quantity: Annotated[int, Field(gt=0, description="Quantity")]


class UCPBuyerInput(BaseModel):
    """UCP buyer information input."""

    model_config = ConfigDict(extra="forbid")

    first_name: str = Field(..., description="First name")
    last_name: str | None = Field(default=None, description="Last name")
    email: str = Field(..., description="Email address")
    phone: str | None = Field(default=None, description="Phone number in E.164 format")


class UCPCreateCheckoutRequest(BaseModel):
    """Request body for creating a UCP checkout session."""

    model_config = ConfigDict(extra="forbid")

    line_items: Annotated[
        list[UCPLineItemInput], Field(min_length=1, description="Line items")
    ]
    buyer: UCPBuyerInput | None = Field(default=None, description="Buyer info")
    discounts: UCPDiscountsInput | None = Field(
        default=None, description="Discount extension request payload"
    )


class UCPUpdateCheckoutRequest(BaseModel):
    """Request body for updating a UCP checkout session (full replacement)."""

    model_config = ConfigDict(extra="forbid")

    line_items: list[UCPLineItemInput] | None = Field(
        default=None, description="Line items"
    )
    buyer: UCPBuyerInput | None = Field(default=None, description="Buyer info")
    discounts: UCPDiscountsInput | None = Field(
        default=None, description="Discount extension request payload"
    )


class UCPCompleteCheckoutRequest(BaseModel):
    """Request body for completing a UCP checkout session."""

    model_config = ConfigDict(extra="forbid")

    buyer: UCPBuyerInput | None = Field(default=None, description="Buyer info")
    payment: UCPPaymentInput = Field(..., description="UCP payment payload")


class UCPItem(BaseModel):
    """UCP item details in response."""

    id: str = Field(..., description="Product ID")
    title: str = Field(..., description="Product title")
    price: Annotated[int, Field(ge=0, description="Unit price in minor units")]


class UCPTotal(BaseModel):
    """UCP total line item."""

    type: UCPTotalType = Field(..., description="Total category")
    label: str = Field(..., description="Display label")
    amount: Annotated[int, Field(ge=0, description="Amount in minor units")]


class UCPLineItem(BaseModel):
    """UCP line item in response."""

    id: str = Field(..., description="Line item ID")
    item: UCPItem = Field(..., description="Item details")
    quantity: Annotated[int, Field(gt=0, description="Quantity")]
    totals: list[UCPTotal] = Field(..., description="Line item totals")


def _empty_discount_codes() -> list[str]:
    return []


def _empty_discount_allocations() -> list[UCPDiscountAllocation]:
    return []


def _empty_applied_discounts() -> list[UCPAppliedDiscount]:
    return []


class UCPDiscountsInput(BaseModel):
    """UCP discount input payload for discount extension."""

    model_config = ConfigDict(extra="forbid")

    codes: list[str] = Field(
        default_factory=_empty_discount_codes, description="Submitted discount codes"
    )


class UCPDiscountAllocation(BaseModel):
    """Discount allocation target and amount."""

    path: str = Field(..., description="JSONPath target for discount allocation")
    amount: Annotated[int, Field(ge=0, description="Allocated amount")]


class UCPAppliedDiscount(BaseModel):
    """Applied discount in UCP discount extension response shape."""

    id: str = Field(..., description="Applied discount ID")
    code: str | None = Field(default=None, description="Submitted discount code")
    title: str = Field(..., description="Display title for the discount")
    amount: Annotated[int, Field(ge=0, description="Applied amount")]
    automatic: bool = Field(default=False, description="Whether discount was automatic")
    method: str | None = Field(default=None, description="Allocation method")
    priority: int | None = Field(default=None, description="Stacking priority")
    allocations: list[UCPDiscountAllocation] = Field(
        default_factory=_empty_discount_allocations,
        description="Allocation breakdown",
    )


class UCPDiscounts(BaseModel):
    """UCP discount extension response payload."""

    codes: list[str] = Field(
        default_factory=_empty_discount_codes, description="Submitted discount codes"
    )
    applied: list[UCPAppliedDiscount] = Field(
        default_factory=_empty_applied_discounts,
        description="Applied discounts",
    )


class UCPPaymentCredentialInput(BaseModel):
    """UCP payment credential data."""

    model_config = ConfigDict(extra="forbid")

    token: str | None = Field(default=None, description="Credential token")
    id: str | None = Field(default=None, description="Credential identifier")


class UCPPaymentInstrumentInput(BaseModel):
    """UCP payment instrument submitted on complete checkout."""

    model_config = ConfigDict(extra="forbid")

    type: str = Field(..., description="Payment instrument type")
    handler_id: str = Field(..., description="Negotiated payment handler id")
    credential: UCPPaymentCredentialInput = Field(..., description="Credential payload")


class UCPPaymentInput(BaseModel):
    """UCP complete checkout payment payload."""

    model_config = ConfigDict(extra="forbid")

    instruments: Annotated[
        list[UCPPaymentInstrumentInput],
        Field(min_length=1, description="Payment instruments"),
    ]


class UCPMessageSeverity(StrEnum):
    """UCP message severity values per spec."""

    RECOVERABLE = "recoverable"
    REQUIRES_BUYER_INPUT = "requires_buyer_input"
    REQUIRES_BUYER_REVIEW = "requires_buyer_review"


class UCPMessage(BaseModel):
    """UCP message for checkout responses."""

    type: UCPMessageType = Field(..., description="Message type")
    code: str | None = Field(default=None, description="Optional code")
    path: str | None = Field(default=None, description="JSONPath for related field")
    content: str = Field(..., description="Message content")
    severity: UCPMessageSeverity | None = Field(
        default=None, description="Required when type is error"
    )


class UCPResponseMetadata(BaseModel):
    """UCP response metadata with negotiated capabilities."""

    version: str
    capabilities: dict[str, list[UCPCapabilityVersion]]
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None = None


class UCPCheckoutResponse(BaseModel):
    """UCP checkout response in the current project wire shape."""

    model_config = ConfigDict(populate_by_name=True)

    ucp: UCPResponseMetadata
    id: str
    status: UCPCheckoutStatus
    currency: str
    line_items: list[UCPLineItem]
    totals: list[UCPTotal]
    discounts: UCPDiscounts | None = None
    messages: Annotated[list[UCPMessage], Field(default_factory=list)]


# =============================================================================
# SDK Bridge Adapters
# =============================================================================


def _capability_parent_list(version: UCPCapabilityVersion) -> list[str]:
    if version.extends is None:
        return []
    if isinstance(version.extends, str):
        return [version.extends]
    return list(version.extends)


def _to_sdk_service(service: UCPService) -> SDKService:
    payload: dict[str, Any] = {
        "version": service.version,
        "spec": service.spec or DEFAULT_UCP_SPEC_URL,
    }

    if service.transport == "a2a":
        payload["a2a"] = {"endpoint": service.endpoint}
    elif service.transport == "rest":
        payload["rest"] = {
            "endpoint": service.endpoint,
            "schema": service.schema_url
            or "https://ucp.dev/services/shopping/rest.openapi.json",
        }
    elif service.transport == "mcp":
        payload["mcp"] = {
            "endpoint": service.endpoint,
            "schema": service.schema_url
            or "https://ucp.dev/services/shopping/mcp.openrpc.json",
        }
    elif service.transport == "embedded":
        payload["embedded"] = {
            "schema": service.schema_url
            or "https://ucp.dev/services/shopping/embedded.openrpc.json"
        }
    else:
        # Preserve backward compatibility: treat unknown transport as a2a.
        payload["a2a"] = {"endpoint": service.endpoint}

    return SDKService.model_validate(payload)


def _to_sdk_discovery_capability(
    name: str,
    version: UCPCapabilityVersion,
) -> SDKDiscoveryCapability:
    payload: dict[str, Any] = {
        "name": name,
        "version": version.version,
    }
    if version.spec:
        payload["spec"] = version.spec
    if version.schema_url:
        payload["schema"] = version.schema_url

    parents = _capability_parent_list(version)
    if parents:
        payload["extends"] = parents[0]
        if len(parents) > 1:
            payload["x_extends_all"] = parents

    return SDKDiscoveryCapability.model_validate(payload)


def _to_sdk_response_capability(
    name: str,
    version: UCPCapabilityVersion,
) -> SDKResponseCapability:
    payload: dict[str, Any] = {
        "name": name,
        "version": version.version,
    }
    if version.spec:
        payload["spec"] = version.spec
    if version.schema_url:
        payload["schema"] = version.schema_url

    parents = _capability_parent_list(version)
    if parents:
        payload["extends"] = parents[0]
        if len(parents) > 1:
            payload["x_extends_all"] = parents

    return SDKResponseCapability.model_validate(payload)


def _to_sdk_payment_handler(
    handler_namespace: str,
    handler: UCPPaymentHandler,
) -> SDKPaymentHandler:
    spec = handler.spec or DEFAULT_PAYMENT_HANDLER_SPEC_URL
    schema_url = handler.schema_url or DEFAULT_PAYMENT_HANDLER_SCHEMA_URL
    payload: dict[str, Any] = {
        "id": handler.id,
        "name": handler_namespace,
        "version": handler.version,
        "spec": spec,
        "config_schema": schema_url,
        "instrument_schemas": [schema_url],
        "config": handler.config or {},
    }
    return SDKPaymentHandler.model_validate(payload)


def _flatten_payment_handlers(
    payment_handlers: dict[str, list[UCPPaymentHandler]] | None,
) -> list[SDKPaymentHandler]:
    if payment_handlers is None:
        return []

    handlers: list[SDKPaymentHandler] = []
    for namespace, versions in payment_handlers.items():
        for handler in versions:
            handlers.append(_to_sdk_payment_handler(namespace, handler))
    return handlers


def _iter_capabilities(
    capabilities: dict[str, list[UCPCapabilityVersion]],
) -> list[tuple[str, UCPCapabilityVersion]]:
    flattened: list[tuple[str, UCPCapabilityVersion]] = []
    for capability_name, versions in capabilities.items():
        for version in versions:
            flattened.append((capability_name, version))
    return flattened


def to_sdk_discovery_profile(profile: UCPBusinessProfile) -> SDKUcpDiscoveryProfile:
    """Convert local discovery profile shape to SDK discovery model."""
    services_payload: dict[str, SDKService] = {}
    for service_name, versions in profile.ucp.services.items():
        if not versions:
            continue
        services_payload[service_name] = _to_sdk_service(versions[0])

    capabilities_payload = [
        _to_sdk_discovery_capability(name, version)
        for name, version in _iter_capabilities(profile.ucp.capabilities)
    ]

    payload: dict[str, Any] = {
        "ucp": SDKDiscoveryProfile.model_validate(
            {
                "version": profile.ucp.version,
                "services": services_payload,
                "capabilities": capabilities_payload,
            }
        )
    }

    payment_handlers = _flatten_payment_handlers(profile.ucp.payment_handlers)
    if payment_handlers:
        payload["payment"] = SDKDiscoveryPayment(handlers=payment_handlers)

    if profile.signing_keys:
        payload["signing_keys"] = [
            signing_key.model_dump(exclude_none=True)
            for signing_key in profile.signing_keys
        ]

    return SDKUcpDiscoveryProfile.model_validate(payload)


def _to_sdk_message(message: UCPMessage) -> dict[str, Any]:
    if message.type == UCPMessageType.ERROR:
        return {
            "type": "error",
            "code": message.code or "invalid",
            "path": message.path,
            "content": message.content,
            "severity": (
                message.severity.value
                if message.severity is not None
                else UCPMessageSeverity.RECOVERABLE.value
            ),
        }

    if message.type == UCPMessageType.WARNING:
        return {
            "type": "warning",
            "code": message.code or "warning",
            "path": message.path,
            "content": message.content,
        }

    return {
        "type": "info",
        "code": message.code,
        "path": message.path,
        "content": message.content,
    }


def to_sdk_checkout_response(response: UCPCheckoutResponse) -> SDKCheckoutResponse:
    """Convert local checkout response shape to SDK checkout model."""
    response_caps = [
        _to_sdk_response_capability(name, version)
        for name, version in _iter_capabilities(response.ucp.capabilities)
    ]

    sdk_payment_handlers = _flatten_payment_handlers(response.ucp.payment_handlers)

    payload: dict[str, Any] = {
        "ucp": SDKResponseCheckout.model_validate(
            {
                "version": response.ucp.version,
                "capabilities": response_caps,
            }
        ),
        "id": response.id,
        "status": response.status.value,
        "currency": response.currency,
        "line_items": [
            {
                "id": line_item.id,
                "item": {
                    "id": line_item.item.id,
                    "title": line_item.item.title,
                    "price": line_item.item.price,
                },
                "quantity": line_item.quantity,
                "totals": [
                    {
                        "type": total.type.value,
                        "display_text": total.label,
                        "amount": total.amount,
                    }
                    for total in line_item.totals
                ],
            }
            for line_item in response.line_items
        ],
        "totals": [
            {
                "type": total.type.value,
                "display_text": total.label,
                "amount": total.amount,
            }
            for total in response.totals
        ],
        "messages": [_to_sdk_message(message) for message in response.messages],
        "links": [
            {"type": "terms_of_service", "url": DEFAULT_TOS_URL},
            {"type": "privacy_policy", "url": DEFAULT_PRIVACY_URL},
        ],
        "payment": SDKPayment.model_validate({"handlers": sdk_payment_handlers}),
    }

    return SDKCheckoutResponse.model_validate(payload)


def validate_business_profile_with_sdk(profile: UCPBusinessProfile) -> None:
    """Validate discovery profile against SDK models."""
    to_sdk_discovery_profile(profile)


def validate_checkout_response_with_sdk(response: UCPCheckoutResponse) -> None:
    """Validate checkout response against SDK models."""
    to_sdk_checkout_response(response)


def sdk_summary_for_checkout(response: UCPCheckoutResponse) -> dict[str, Any]:
    """Return a compact summary of SDK-transformed checkout data for diagnostics."""
    sdk = to_sdk_checkout_response(response)
    checkout_data = sdk.model_dump(mode="json")
    return {
        "status": checkout_data.get("status"),
        "line_items": len(cast(list[Any], checkout_data.get("line_items", []))),
        "handlers": len(
            cast(
                list[Any],
                cast(dict[str, Any], checkout_data.get("payment", {})).get(
                    "handlers", []
                ),
            )
        ),
    }

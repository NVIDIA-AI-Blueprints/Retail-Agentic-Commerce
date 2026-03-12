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

"""UCP Pydantic models for schema validation.

Provides the subset of UCP wire-format models needed by the checkout and
order bridge adapters.  Field shapes mirror the UCP specification so that
``model_validate`` / ``model_dump`` round-trip the UCP wire format.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import AnyUrl, AwareDatetime, BaseModel, ConfigDict, Field, RootModel

# ---------------------------------------------------------------------------
# Primitives
# ---------------------------------------------------------------------------


class Version(RootModel[str]):
    """UCP protocol version in YYYY-MM-DD format."""

    root: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


# ---------------------------------------------------------------------------
# Transport bindings
# ---------------------------------------------------------------------------


class Rest(BaseModel):
    model_config = ConfigDict(extra="allow")
    schema_: AnyUrl = Field(..., alias="schema")
    endpoint: AnyUrl


class Mcp(BaseModel):
    model_config = ConfigDict(extra="allow")
    schema_: AnyUrl = Field(..., alias="schema")
    endpoint: AnyUrl


class A2a(BaseModel):
    model_config = ConfigDict(extra="allow")
    endpoint: AnyUrl


class Embedded(BaseModel):
    model_config = ConfigDict(extra="allow")
    schema_: AnyUrl = Field(..., alias="schema")


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class UcpService(BaseModel):
    model_config = ConfigDict(extra="allow")
    version: Version
    spec: AnyUrl
    rest: Rest | None = None
    mcp: Mcp | None = None
    a2a: A2a | None = None
    embedded: Embedded | None = None


class Services(RootModel[dict[str, UcpService]]):
    root: dict[str, UcpService]


# ---------------------------------------------------------------------------
# Capabilities
# ---------------------------------------------------------------------------


class _CapabilityBase(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: str | None = Field(None, pattern=r"^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$")
    version: Version | None = None
    spec: AnyUrl | None = None
    schema_: AnyUrl | None = Field(None, alias="schema")
    extends: str | None = Field(None, pattern=r"^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$")
    config: dict[str, Any] | None = None


class Discovery(_CapabilityBase):
    """Full capability declaration for discovery profiles."""


class Response(_CapabilityBase):
    """Capability reference in responses."""


# ---------------------------------------------------------------------------
# Metadata envelopes
# ---------------------------------------------------------------------------


class DiscoveryProfile(BaseModel):
    """Full UCP metadata for /.well-known/ucp discovery."""

    model_config = ConfigDict(extra="allow")
    version: Version
    services: Services
    capabilities: list[Discovery]


class ResponseCheckout(BaseModel):
    """UCP metadata for checkout responses."""

    model_config = ConfigDict(extra="allow")
    version: Version
    capabilities: list[Response]


class ResponseOrder(BaseModel):
    """UCP metadata for order responses."""

    model_config = ConfigDict(extra="allow")
    version: Version
    capabilities: list[Response]


# ---------------------------------------------------------------------------
# Payment handler
# ---------------------------------------------------------------------------


class PaymentHandlerResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    name: str
    version: Version
    spec: AnyUrl
    config_schema: AnyUrl
    instrument_schemas: list[AnyUrl]
    config: dict[str, Any]


# ---------------------------------------------------------------------------
# Shopping types (checkout response)
# ---------------------------------------------------------------------------


class TotalResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Literal[
        "items_discount", "subtotal", "discount", "fulfillment", "tax", "fee", "total"
    ]
    display_text: str | None = None
    amount: int = Field(..., ge=0)


class ItemResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    title: str
    price: int = Field(..., ge=0)
    image_url: AnyUrl | None = None


class LineItemResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    item: ItemResponse
    quantity: int = Field(..., ge=1)
    totals: list[TotalResponse]
    parent_id: str | None = None


class Buyer(BaseModel):
    model_config = ConfigDict(extra="allow")
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    email: str | None = None
    phone_number: str | None = None


class MessageError(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Literal["error"]
    code: str
    path: str | None = None
    content_type: Literal["plain", "markdown"] | None = "plain"
    content: str
    severity: Literal["recoverable", "requires_buyer_input", "requires_buyer_review"]


class MessageWarning(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Literal["warning"]
    code: str
    path: str | None = None
    content: str
    content_type: Literal["plain", "markdown"] | None = "plain"


class MessageInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Literal["info"]
    path: str | None = None
    code: str | None = None
    content_type: Literal["plain", "markdown"] | None = "plain"
    content: str


class Message(RootModel[MessageError | MessageWarning | MessageInfo]):
    root: MessageError | MessageWarning | MessageInfo = Field(..., title="Message")


class Link(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: str
    url: AnyUrl
    title: str | None = None


class OrderConfirmation(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    permalink_url: AnyUrl


class PostalAddress(BaseModel):
    model_config = ConfigDict(extra="allow")
    extended_address: str | None = None
    street_address: str | None = None
    address_locality: str | None = None
    address_region: str | None = None
    address_country: str | None = None
    postal_code: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    phone_number: str | None = None


class TokenCredentialResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: str


class CardCredential(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Literal["card"]
    card_number_type: Literal["fpan", "network_token", "dpan"]
    number: str | None = None
    expiry_month: int | None = None
    expiry_year: int | None = None
    name: str | None = None
    cvc: str | None = Field(None, max_length=4)
    cryptogram: str | None = None
    eci_value: str | None = None


class PaymentCredential(
    RootModel[TokenCredentialResponse | CardCredential],
):
    root: TokenCredentialResponse | CardCredential = Field(
        ..., title="Payment Credential"
    )


class PaymentInstrumentBase(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    handler_id: str
    type: str
    billing_address: PostalAddress | None = None
    credential: PaymentCredential | None = None


class CardPaymentInstrument(PaymentInstrumentBase):
    model_config = ConfigDict(extra="allow")
    type: Literal["card"]
    brand: str
    last_digits: str
    expiry_month: int | None = None
    expiry_year: int | None = None
    rich_text_description: str | None = None
    rich_card_art: AnyUrl | None = None


class PaymentInstrument(RootModel[CardPaymentInstrument]):
    root: CardPaymentInstrument = Field(..., title="Payment Instrument")


# ---------------------------------------------------------------------------
# Payment response
# ---------------------------------------------------------------------------


class PaymentResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    handlers: list[PaymentHandlerResponse]
    selected_instrument_id: str | None = None
    instruments: list[PaymentInstrument] | None = None


# ---------------------------------------------------------------------------
# Checkout response
# ---------------------------------------------------------------------------


class CheckoutResponse(BaseModel):
    """Base checkout schema."""

    model_config = ConfigDict(extra="allow")
    ucp: ResponseCheckout
    id: str
    line_items: list[LineItemResponse]
    buyer: Buyer | None = None
    status: Literal[
        "incomplete",
        "requires_escalation",
        "ready_for_complete",
        "complete_in_progress",
        "completed",
        "canceled",
    ]
    currency: str
    totals: list[TotalResponse]
    messages: list[Message] | None = None
    links: list[Link]
    expires_at: AwareDatetime | None = None
    continue_url: AnyUrl | None = None
    payment: PaymentResponse
    order: OrderConfirmation | None = None


# ---------------------------------------------------------------------------
# Discovery profile
# ---------------------------------------------------------------------------


class SigningKey(BaseModel):
    model_config = ConfigDict(extra="allow")
    kid: str
    kty: str
    crv: str | None = None
    x: str | None = None
    y: str | None = None
    n: str | None = None
    e: str | None = None
    use: Literal["sig", "enc"] | None = None
    alg: str | None = None


class Payment(BaseModel):
    """Payment configuration containing handlers (discovery context)."""

    model_config = ConfigDict(extra="allow")
    handlers: list[PaymentHandlerResponse] | None = None


class UcpDiscoveryProfile(BaseModel):
    """Schema for UCP discovery profile returned from /.well-known/ucp."""

    model_config = ConfigDict(extra="allow")
    ucp: DiscoveryProfile
    payment: Payment | None = None
    signing_keys: list[SigningKey] | None = None


# ---------------------------------------------------------------------------
# Order types
# ---------------------------------------------------------------------------


class OrderLineItemQuantity(BaseModel):
    model_config = ConfigDict(extra="allow")
    total: int = Field(..., ge=0)
    fulfilled: int = Field(..., ge=0)


class OrderLineItem(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    item: ItemResponse
    quantity: OrderLineItemQuantity
    totals: list[TotalResponse]
    status: Literal["processing", "partial", "fulfilled"]
    parent_id: str | None = None


class FulfillmentEventLineItem(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    quantity: int = Field(..., ge=1)


class FulfillmentEvent(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    occurred_at: AwareDatetime
    type: str
    line_items: list[FulfillmentEventLineItem]
    tracking_number: str | None = None
    tracking_url: AnyUrl | None = None
    carrier: str | None = None
    description: str | None = None


class Expectation(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    line_items: list[FulfillmentEventLineItem]
    method_type: Literal["shipping", "pickup", "digital"]
    destination: PostalAddress
    description: str | None = None
    fulfillable_on: str | None = None


class AdjustmentLineItem(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    quantity: int = Field(..., ge=1)


class Adjustment(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    type: str
    occurred_at: AwareDatetime
    status: Literal["pending", "completed", "failed"]
    line_items: list[AdjustmentLineItem] | None = None
    amount: int | None = None
    description: str | None = None


class Fulfillment(BaseModel):
    model_config = ConfigDict(extra="allow")
    expectations: list[Expectation] | None = None
    events: list[FulfillmentEvent] | None = None


class Order(BaseModel):
    """Order schema with immutable line items and append-only event logs."""

    model_config = ConfigDict(extra="allow")
    ucp: ResponseOrder
    id: str
    checkout_id: str
    permalink_url: AnyUrl
    line_items: list[OrderLineItem]
    fulfillment: Fulfillment
    adjustments: list[Adjustment] | None = None
    totals: list[TotalResponse]

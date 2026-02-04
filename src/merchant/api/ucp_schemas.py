"""Pydantic schemas for UCP discovery profile and checkout responses."""

from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field

from src.merchant.api.schemas import PaymentDataInput


class UCPService(BaseModel):
    """UCP service endpoint definition."""

    model_config = ConfigDict(populate_by_name=True)

    version: str
    transport: str  # "rest" for Phase 1
    endpoint: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")


class UCPCapabilityVersion(BaseModel):
    """UCP capability with version and optional extension parent."""

    model_config = ConfigDict(populate_by_name=True)

    version: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")
    extends: str | None = None  # For extensions like fulfillment


class UCPPaymentHandler(BaseModel):
    """Optional payment handler definition."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    version: str
    spec: str | None = None
    schema_url: str | None = Field(default=None, serialization_alias="schema")
    config: dict[str, Any] | None = None  # Optional handler config per spec


class UCPSigningKey(BaseModel):
    """JWK signing key for webhook verification.

    Supports both EC (P-256) and OKP (Ed25519) key types per spec.
    - EC P-256: kty="EC", crv="P-256", alg="ES256", x and y required
    - OKP Ed25519: kty="OKP", crv="Ed25519", alg="EdDSA", x required, y omitted
    """

    kid: str  # Key ID (e.g., "business_2025")
    kty: str  # Key type: "EC" or "OKP"
    crv: str  # Curve: "P-256" or "Ed25519"
    x: str  # Public key x coordinate (base64url)
    y: str | None = None  # Public key y coordinate (base64url, EC only)
    alg: str  # Algorithm: "ES256" or "EdDSA"


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
# UCP Checkout Schemas (Phase 2 - minimal fields)
# =============================================================================


class UCPCheckoutStatus(StrEnum):
    """UCP checkout status values (Phase 2 subset)."""

    INCOMPLETE = "incomplete"
    READY_FOR_COMPLETE = "ready_for_complete"
    COMPLETED = "completed"
    CANCELED = "canceled"


class UCPTotalType(StrEnum):
    """UCP total types (Phase 2 subset)."""

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


class UCPUpdateCheckoutRequest(BaseModel):
    """Request body for updating a UCP checkout session (full replacement)."""

    model_config = ConfigDict(extra="forbid")

    line_items: Annotated[
        list[UCPLineItemInput], Field(min_length=1, description="Line items")
    ]
    buyer: UCPBuyerInput | None = Field(default=None, description="Buyer info")


class UCPCompleteCheckoutRequest(BaseModel):
    """Request body for completing a UCP checkout session (Phase 2)."""

    model_config = ConfigDict(extra="forbid")

    buyer: UCPBuyerInput | None = Field(default=None, description="Buyer info")
    payment_data: PaymentDataInput = Field(..., description="Payment data")


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


class UCPMessage(BaseModel):
    """UCP message for checkout responses."""

    type: UCPMessageType = Field(..., description="Message type")
    code: str | None = Field(default=None, description="Optional error code")
    path: str | None = Field(default=None, description="JSONPath for related field")
    content: str = Field(..., description="Message content")


class UCPResponseMetadata(BaseModel):
    """UCP response metadata with negotiated capabilities."""

    version: str
    capabilities: dict[str, list[UCPCapabilityVersion]]


class UCPCheckoutResponse(BaseModel):
    """UCP checkout response (Phase 2 minimal fields)."""

    model_config = ConfigDict(populate_by_name=True)

    ucp: UCPResponseMetadata
    id: str
    status: UCPCheckoutStatus
    currency: str
    line_items: list[UCPLineItem]
    totals: list[UCPTotal]
    messages: Annotated[list[UCPMessage], Field(default_factory=list)]

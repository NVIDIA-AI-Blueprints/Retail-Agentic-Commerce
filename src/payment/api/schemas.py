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

"""Pydantic schemas for PSP delegated payment endpoints."""

from datetime import datetime
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

# =============================================================================
# Enums
# =============================================================================


class CardNumberTypeEnum(StrEnum):
    """Card number type."""

    FPAN = "fpan"
    DPAN = "dpan"


class AllowanceReasonEnum(StrEnum):
    """Allowance reason type."""

    ONE_TIME = "one_time"
    SUBSCRIPTION = "subscription"


class PaymentIntentStatusEnum(StrEnum):
    """Payment intent status."""

    PENDING = "pending"
    COMPLETED = "completed"


class RiskSignalTypeEnum(StrEnum):
    """Risk signal types."""

    CARD_TESTING = "card_testing"
    FRAUD = "fraud"
    VELOCITY = "velocity"


class RiskSignalActionEnum(StrEnum):
    """Risk signal actions."""

    AUTHORIZED = "authorized"
    BLOCKED = "blocked"
    REVIEW = "review"


# =============================================================================
# Input Models (Request Schemas)
# =============================================================================


class PaymentMethodInput(BaseModel):
    """Payment method input for delegate payment request."""

    model_config = ConfigDict(extra="forbid")

    type: str = Field(default="card", description="Payment method type")
    card_number_type: CardNumberTypeEnum = Field(
        ..., description="Card number type (fpan/dpan)"
    )
    virtual: bool = Field(default=False, description="Whether the card is virtual")
    number: Annotated[
        str, Field(min_length=13, max_length=19, description="Card number")
    ]
    exp_month: Annotated[
        str, Field(min_length=1, max_length=2, description="Expiry month")
    ]
    exp_year: Annotated[
        str, Field(min_length=2, max_length=4, description="Expiry year")
    ]
    display_card_funding_type: str = Field(
        default="credit", description="Display card funding type"
    )
    display_last4: Annotated[
        str, Field(min_length=4, max_length=4, description="Last 4 digits")
    ]


class AllowanceInput(BaseModel):
    """Allowance constraints for the vault token."""

    model_config = ConfigDict(extra="forbid")

    reason: AllowanceReasonEnum = Field(..., description="Allowance reason")
    max_amount: Annotated[
        int, Field(gt=0, description="Maximum allowed amount in minor units")
    ]
    currency: Annotated[
        str, Field(min_length=3, max_length=3, description="ISO 4217 currency code")
    ]
    checkout_session_id: str = Field(..., description="Associated checkout session ID")
    merchant_id: str = Field(..., description="Merchant identifier")
    expires_at: datetime = Field(..., description="Token expiration time (RFC 3339)")


class RiskSignalInput(BaseModel):
    """Risk signal for fraud prevention."""

    model_config = ConfigDict(extra="forbid")

    type: RiskSignalTypeEnum = Field(..., description="Risk signal type")
    action: RiskSignalActionEnum = Field(
        ..., description="Action taken for this signal"
    )


class BillingAddressInput(BaseModel):
    """Billing address for the payment method."""

    model_config = ConfigDict(extra="forbid")

    name: Annotated[str, Field(max_length=256, description="Cardholder name")]
    line_one: Annotated[str, Field(max_length=60, description="Address line 1")]
    line_two: Annotated[
        str | None, Field(default=None, max_length=60, description="Address line 2")
    ] = None
    city: Annotated[str, Field(max_length=60, description="City")]
    state: Annotated[str, Field(description="State/province")]
    country: Annotated[
        str,
        Field(
            min_length=2, max_length=2, description="Country code (ISO 3166-1 alpha-2)"
        ),
    ]
    postal_code: Annotated[str, Field(max_length=20, description="Postal code")]


class DelegatePaymentRequest(BaseModel):
    """Request body for delegating a payment method."""

    model_config = ConfigDict(extra="forbid")

    payment_method: PaymentMethodInput = Field(
        ..., description="Payment method details"
    )
    allowance: AllowanceInput = Field(..., description="Allowance constraints")
    risk_signals: Annotated[
        list[RiskSignalInput],
        Field(min_length=1, description="Risk signals (at least one required)"),
    ]
    billing_address: BillingAddressInput | None = Field(
        default=None, description="Billing address"
    )


class CreatePaymentIntentRequest(BaseModel):
    """Request body for creating and processing a payment intent."""

    model_config = ConfigDict(extra="forbid")

    vault_token: str = Field(..., description="Vault token ID")
    amount: Annotated[int, Field(gt=0, description="Payment amount in minor units")]
    currency: Annotated[
        str, Field(min_length=3, max_length=3, description="ISO 4217 currency code")
    ]


# =============================================================================
# Output Models (Response Schemas)
# =============================================================================


class VaultTokenMetadata(BaseModel):
    """Metadata in vault token response."""

    source: str = Field(..., description="Source of the vault token")
    merchant_id: str = Field(..., description="Merchant identifier")
    idempotency_key: str = Field(..., description="Idempotency key used")


class DelegatePaymentResponse(BaseModel):
    """Response for delegate payment endpoint."""

    id: str = Field(..., description="Vault token ID")
    created: datetime = Field(..., description="Creation timestamp")
    metadata: VaultTokenMetadata = Field(..., description="Token metadata")


class PaymentIntentResponse(BaseModel):
    """Response for payment intent endpoint."""

    id: str = Field(..., description="Payment intent ID")
    vault_token_id: str = Field(..., description="Associated vault token ID")
    amount: int = Field(..., description="Payment amount in minor units")
    currency: str = Field(..., description="ISO 4217 currency code")
    status: PaymentIntentStatusEnum = Field(..., description="Payment status")
    created_at: datetime = Field(..., description="Creation timestamp")
    completed_at: datetime | None = Field(
        default=None, description="Completion timestamp"
    )


# =============================================================================
# Error Response Schemas
# =============================================================================


class ErrorTypeEnum(StrEnum):
    """Error response types."""

    INVALID_REQUEST = "invalid_request"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    GONE = "gone"
    INTERNAL_ERROR = "internal_error"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"


class ErrorCodeEnum(StrEnum):
    """Error response codes."""

    CHECKOUT_SESSION_NOT_FOUND = "checkout_session_not_found"
    VAULT_TOKEN_NOT_FOUND = "vault_token_not_found"
    VAULT_TOKEN_CONSUMED = "vault_token_consumed"
    VAULT_TOKEN_EXPIRED = "vault_token_expired"
    AMOUNT_EXCEEDS_ALLOWANCE = "amount_exceeds_allowance"
    CURRENCY_MISMATCH = "currency_mismatch"
    REQUEST_NOT_IDEMPOTENT = "request_not_idempotent"
    MISSING_API_KEY = "missing_api_key"
    INVALID_API_KEY = "invalid_api_key"
    CONFIGURATION_ERROR = "configuration_error"
    VALIDATION_ERROR = "validation_error"


class ErrorResponse(BaseModel):
    """Error response schema."""

    type: ErrorTypeEnum = Field(..., description="Error type")
    code: ErrorCodeEnum = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable message")
    param: str | None = Field(default=None, description="Related parameter path")

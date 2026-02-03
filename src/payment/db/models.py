"""SQLModel database models for the PSP (Payment Service Provider)."""

from datetime import UTC, datetime
from enum import StrEnum
from typing import ClassVar

from sqlmodel import Field, SQLModel


def _utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(UTC)


class VaultTokenStatus(StrEnum):
    """Vault token status values."""

    ACTIVE = "active"
    CONSUMED = "consumed"


class PaymentIntentStatus(StrEnum):
    """Payment intent status values."""

    PENDING = "pending"
    COMPLETED = "completed"


class VaultToken(SQLModel, table=True):
    """Vault token model for delegated payment methods.

    Attributes:
        id: Unique vault token identifier (e.g., "vt_a1b2c3d4e5f6")
        idempotency_key: The idempotency key used to create this token
        payment_method_json: JSON string of payment method details
        allowance_json: JSON string of allowance constraints
        billing_address_json: JSON string of billing address (optional)
        risk_signals_json: JSON string of risk signals array
        status: Current vault token status (active/consumed)
        metadata_json: JSON string of additional metadata
        created_at: Token creation timestamp
    """

    __tablename__: ClassVar[str] = "vault_token"  # type: ignore[assignment]

    id: str = Field(primary_key=True)
    idempotency_key: str = Field(unique=True, index=True)
    payment_method_json: str
    allowance_json: str
    billing_address_json: str | None = Field(default=None)
    risk_signals_json: str = Field(default="[]")
    status: VaultTokenStatus = Field(default=VaultTokenStatus.ACTIVE)
    metadata_json: str = Field(default="{}")
    created_at: datetime = Field(default_factory=_utc_now)


class PaymentIntent(SQLModel, table=True):
    """Payment intent model for processing payments.

    Attributes:
        id: Unique payment intent identifier (e.g., "pi_x1y2z3w4v5u6")
        vault_token_id: Reference to the vault token used
        amount: Payment amount in minor units (cents)
        currency: ISO 4217 currency code (lowercase)
        status: Current payment intent status
        created_at: Intent creation timestamp
        completed_at: Payment completion timestamp (optional)
    """

    __tablename__: ClassVar[str] = "payment_intent"  # type: ignore[assignment]

    id: str = Field(primary_key=True)
    vault_token_id: str = Field(foreign_key="vault_token.id", index=True)
    amount: int
    currency: str
    status: PaymentIntentStatus = Field(default=PaymentIntentStatus.PENDING)
    created_at: datetime = Field(default_factory=_utc_now)
    completed_at: datetime | None = Field(default=None)


class IdempotencyRecord(SQLModel, table=True):
    """Idempotency record for ensuring request idempotency.

    Attributes:
        idempotency_key: The unique idempotency key (primary key)
        request_hash: SHA-256 hash of the request (method:path:body)
        response_status: HTTP status code of the cached response
        response_body_json: JSON string of the cached response body
        created_at: Record creation timestamp
    """

    __tablename__: ClassVar[str] = "idempotency_store"  # type: ignore[assignment]

    idempotency_key: str = Field(primary_key=True)
    request_hash: str = Field(index=True)
    response_status: int
    response_body_json: str
    created_at: datetime = Field(default_factory=_utc_now)

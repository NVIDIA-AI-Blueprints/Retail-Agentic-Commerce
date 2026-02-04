"""Pydantic schemas for UCP discovery profile."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


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

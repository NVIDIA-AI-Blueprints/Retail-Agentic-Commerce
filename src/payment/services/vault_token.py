"""Vault token service for delegated payment methods."""

import json
import uuid
from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from src.merchant.db.models import CheckoutSession
from src.payment.api.schemas import (
    DelegatePaymentRequest,
    DelegatePaymentResponse,
    VaultTokenMetadata,
)
from src.payment.db.models import VaultToken


class CheckoutSessionNotFoundError(Exception):
    """Raised when a checkout session is not found."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Checkout session '{session_id}' not found")


def generate_vault_token_id() -> str:
    """Generate a unique vault token ID.

    Returns:
        A unique vault token ID in the format 'vt_{uuid12}'
    """
    return f"vt_{uuid.uuid4().hex[:12]}"


def validate_checkout_session(db: Session, checkout_session_id: str) -> None:
    """Validate that a checkout session exists.

    Args:
        db: Database session
        checkout_session_id: The checkout session ID to validate

    Raises:
        CheckoutSessionNotFoundError: If the checkout session does not exist
    """
    statement = select(CheckoutSession).where(CheckoutSession.id == checkout_session_id)
    session = db.exec(statement).first()

    if session is None:
        raise CheckoutSessionNotFoundError(checkout_session_id)


def create_vault_token(
    db: Session,
    request: DelegatePaymentRequest,
    idempotency_key: str,
) -> DelegatePaymentResponse:
    """Create a vault token for delegated payment.

    Args:
        db: Database session
        request: The delegate payment request
        idempotency_key: The idempotency key from the request header

    Returns:
        DelegatePaymentResponse with the created vault token details

    Raises:
        CheckoutSessionNotFoundError: If the checkout session does not exist
    """
    # Validate checkout session exists
    validate_checkout_session(db, request.allowance.checkout_session_id)

    # Generate vault token ID
    vault_token_id = generate_vault_token_id()

    # Serialize nested objects to JSON
    payment_method_dict = request.payment_method.model_dump()
    allowance_dict = request.allowance.model_dump()
    risk_signals_list = [rs.model_dump() for rs in request.risk_signals]
    billing_address_json = None
    if request.billing_address is not None:
        billing_address_json = json.dumps(request.billing_address.model_dump())

    metadata = {
        "source": "agent_checkout",
        "merchant_id": request.allowance.merchant_id,
        "idempotency_key": idempotency_key,
    }

    # Create vault token record
    vault_token = VaultToken(
        id=vault_token_id,
        idempotency_key=idempotency_key,
        payment_method_json=json.dumps(payment_method_dict, default=str),
        allowance_json=json.dumps(allowance_dict, default=str),
        billing_address_json=billing_address_json,
        risk_signals_json=json.dumps(risk_signals_list, default=str),
        metadata_json=json.dumps(metadata),
    )

    db.add(vault_token)
    db.commit()
    db.refresh(vault_token)

    return DelegatePaymentResponse(
        id=vault_token.id,
        created=vault_token.created_at,
        metadata=VaultTokenMetadata(
            source="agent_checkout",
            merchant_id=request.allowance.merchant_id,
            idempotency_key=idempotency_key,
        ),
    )


def get_vault_token(db: Session, vault_token_id: str) -> VaultToken | None:
    """Get a vault token by ID.

    Args:
        db: Database session
        vault_token_id: The vault token ID

    Returns:
        The VaultToken if found, None otherwise
    """
    statement = select(VaultToken).where(VaultToken.id == vault_token_id)
    return db.exec(statement).first()


def get_allowance(vault_token: VaultToken) -> dict[str, Any]:
    """Get the allowance constraints from a vault token.

    Args:
        vault_token: The vault token

    Returns:
        The allowance constraints as a dictionary
    """
    result: dict[str, Any] = json.loads(vault_token.allowance_json)
    return result


def is_token_expired(vault_token: VaultToken) -> bool:
    """Check if a vault token is expired.

    Args:
        vault_token: The vault token to check

    Returns:
        True if the token is expired, False otherwise
    """
    allowance = get_allowance(vault_token)
    expires_at_str: str | None = allowance.get("expires_at")

    if expires_at_str is None:
        return False

    # Parse the expiration time
    expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
    return datetime.now(expires_at.tzinfo) > expires_at

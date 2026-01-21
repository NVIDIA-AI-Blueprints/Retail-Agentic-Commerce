"""Payment intent service for processing payments."""

import uuid
from datetime import UTC, datetime

from sqlmodel import Session

from src.payment.api.schemas import (
    CreatePaymentIntentRequest,
    PaymentIntentResponse,
    PaymentIntentStatusEnum,
)
from src.payment.db.models import PaymentIntent, PaymentIntentStatus, VaultTokenStatus
from src.payment.services.vault_token import (
    get_allowance,
    get_vault_token,
    is_token_expired,
)


class VaultTokenNotFoundError(Exception):
    """Raised when a vault token is not found."""

    def __init__(self, token_id: str):
        self.token_id = token_id
        super().__init__(f"Vault token '{token_id}' not found")


class VaultTokenConsumedError(Exception):
    """Raised when a vault token has already been consumed."""

    def __init__(self, token_id: str):
        self.token_id = token_id
        super().__init__(f"Vault token '{token_id}' has already been consumed")


class VaultTokenExpiredError(Exception):
    """Raised when a vault token has expired."""

    def __init__(self, token_id: str):
        self.token_id = token_id
        super().__init__(f"Vault token '{token_id}' has expired")


class AmountExceedsAllowanceError(Exception):
    """Raised when the payment amount exceeds the allowance."""

    def __init__(self, amount: int, max_amount: int):
        self.amount = amount
        self.max_amount = max_amount
        super().__init__(
            f"Payment amount {amount} exceeds maximum allowance of {max_amount}"
        )


class CurrencyMismatchError(Exception):
    """Raised when the currency doesn't match the allowance."""

    def __init__(self, requested: str, allowed: str):
        self.requested = requested
        self.allowed = allowed
        super().__init__(
            f"Currency '{requested}' does not match allowance currency '{allowed}'"
        )


def generate_payment_intent_id() -> str:
    """Generate a unique payment intent ID.

    Returns:
        A unique payment intent ID in the format 'pi_{uuid12}'
    """
    return f"pi_{uuid.uuid4().hex[:12]}"


def create_and_process_payment_intent(
    db: Session,
    request: CreatePaymentIntentRequest,
) -> PaymentIntentResponse:
    """Create and process a payment intent.

    Args:
        db: Database session
        request: The payment intent request

    Returns:
        PaymentIntentResponse with the processed payment intent details

    Raises:
        VaultTokenNotFoundError: If the vault token does not exist
        VaultTokenConsumedError: If the vault token has already been used
        VaultTokenExpiredError: If the vault token has expired
        AmountExceedsAllowanceError: If the amount exceeds the allowance
        CurrencyMismatchError: If the currency doesn't match
    """
    # Get the vault token
    vault_token = get_vault_token(db, request.vault_token)

    if vault_token is None:
        raise VaultTokenNotFoundError(request.vault_token)

    # Check if token is already consumed
    if vault_token.status == VaultTokenStatus.CONSUMED:
        raise VaultTokenConsumedError(request.vault_token)

    # Check if token is expired
    if is_token_expired(vault_token):
        raise VaultTokenExpiredError(request.vault_token)

    # Get allowance constraints
    allowance = get_allowance(vault_token)

    # Validate amount
    max_amount: int = allowance.get("max_amount", 0)
    if request.amount > max_amount:
        raise AmountExceedsAllowanceError(request.amount, max_amount)

    # Validate currency (case-insensitive comparison)
    allowed_currency: str = str(allowance.get("currency", "")).lower()
    if request.currency.lower() != allowed_currency:
        raise CurrencyMismatchError(request.currency.lower(), allowed_currency)

    # Generate payment intent ID
    payment_intent_id = generate_payment_intent_id()
    now = datetime.now(UTC)

    # Create payment intent record
    payment_intent = PaymentIntent(
        id=payment_intent_id,
        vault_token_id=vault_token.id,
        amount=request.amount,
        currency=request.currency.lower(),
        status=PaymentIntentStatus.COMPLETED,
        created_at=now,
        completed_at=now,
    )

    # Mark vault token as consumed (single-use)
    vault_token.status = VaultTokenStatus.CONSUMED

    db.add(payment_intent)
    db.commit()
    db.refresh(payment_intent)

    return PaymentIntentResponse(
        id=payment_intent.id,
        vault_token_id=payment_intent.vault_token_id,
        amount=payment_intent.amount,
        currency=payment_intent.currency,
        status=PaymentIntentStatusEnum.COMPLETED,
        created_at=payment_intent.created_at,
        completed_at=payment_intent.completed_at,
    )

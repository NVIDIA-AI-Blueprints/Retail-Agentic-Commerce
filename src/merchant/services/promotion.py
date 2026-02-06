"""Promotion service implementing the 3-layer hybrid architecture.

This service integrates with the Promotion Agent (NAT) to calculate
dynamic discounts based on inventory levels and competitor pricing.

Architecture:
- Layer 1: Deterministic computation (signals, allowed actions)
- Layer 2: LLM arbitration (call Promotion Agent REST API)
- Layer 3: Deterministic execution (apply discount)

This module includes:
- Enums for actions, signals, and reason codes
- TypedDicts for input/output formats
- Constants for thresholds and discount mappings
- Async client for calling the Promotion Agent REST API
- Service functions for the 3-layer logic

All prices are in CENTS (e.g., 2500 = $25.00).
"""

import asyncio
import json
import logging
import time
from enum import StrEnum
from typing import Any, TypedDict

import httpx
from sqlmodel import Session, select

from src.merchant.config import get_settings
from src.merchant.db.models import CompetitorPrice, Product
from src.merchant.services.agent_outcomes import record_agent_outcome

logger = logging.getLogger(__name__)


# =============================================================================
# Promotion Action Enum - Actions the LLM can select from
# =============================================================================


class PromotionAction(StrEnum):
    """Allowed promotion actions - LLM must choose from these only.

    The ACP endpoint filters this list based on margin constraints
    before sending to the agent.
    """

    NO_PROMO = "NO_PROMO"
    DISCOUNT_5_PCT = "DISCOUNT_5_PCT"
    DISCOUNT_10_PCT = "DISCOUNT_10_PCT"
    DISCOUNT_15_PCT = "DISCOUNT_15_PCT"
    FREE_SHIPPING = "FREE_SHIPPING"


# Map actions to discount percentages (used by ACP endpoint for execution)
ACTION_DISCOUNT_MAP: dict[PromotionAction, float] = {
    PromotionAction.NO_PROMO: 0.0,
    PromotionAction.DISCOUNT_5_PCT: 0.05,
    PromotionAction.DISCOUNT_10_PCT: 0.10,
    PromotionAction.DISCOUNT_15_PCT: 0.15,
    PromotionAction.FREE_SHIPPING: 0.0,  # No price discount, shipping benefit
}


# =============================================================================
# Signal Enums - Business signals computed by ACP endpoint
# =============================================================================


class InventoryPressure(StrEnum):
    """Inventory pressure signal based on stock_count."""

    HIGH = "high"  # stock_count > STOCK_THRESHOLD
    LOW = "low"  # stock_count <= STOCK_THRESHOLD


class CompetitionPosition(StrEnum):
    """Competition position signal based on price comparison."""

    ABOVE_MARKET = "above_market"  # base_price > lowest_competitor
    AT_MARKET = "at_market"  # base_price == lowest_competitor
    BELOW_MARKET = "below_market"  # base_price < lowest_competitor


# =============================================================================
# Thresholds - Used by ACP endpoint for signal computation
# =============================================================================

STOCK_THRESHOLD = 50  # Units above this = high inventory pressure


# =============================================================================
# Reason Codes - Standard codes returned by the agent
# =============================================================================


class ReasonCode(StrEnum):
    """Standard reason codes for promotion decisions."""

    HIGH_INVENTORY = "HIGH_INVENTORY"
    LOW_INVENTORY = "LOW_INVENTORY"
    ABOVE_MARKET = "ABOVE_MARKET"
    AT_MARKET = "AT_MARKET"
    BELOW_MARKET = "BELOW_MARKET"
    MARGIN_PROTECTED = "MARGIN_PROTECTED"
    NO_URGENCY = "NO_URGENCY"


# =============================================================================
# Input/Output TypedDicts - Contract between ACP endpoint and agent
# =============================================================================


class SignalsData(TypedDict):
    """Signals computed by ACP endpoint and sent to agent."""

    inventory_pressure: str  # InventoryPressure value
    competition_position: str  # CompetitionPosition value


class PromotionContextInput(TypedDict):
    """Input format sent from ACP endpoint to Promotion Agent."""

    product_id: str
    product_name: str
    base_price_cents: int
    stock_count: int
    min_margin: float
    lowest_competitor_price_cents: int
    signals: SignalsData
    allowed_actions: list[str]  # List of PromotionAction values


class PromotionDecisionOutput(TypedDict):
    """Output format returned by Promotion Agent to ACP endpoint."""

    product_id: str
    action: str  # PromotionAction value
    reason_codes: list[str]  # List of ReasonCode values
    reasoning: str


# =============================================================================
# Promotion Agent Client - Async REST client for agent communication
# =============================================================================


class PromotionAgentClient:
    """Async HTTP client for calling the Promotion Agent REST API.

    Designed for fail-open behavior: if the agent is unavailable,
    returns None and the checkout proceeds without discounts.
    """

    def __init__(self, base_url: str, timeout: float = 10.0):
        """Initialize the promotion agent client.

        Args:
            base_url: Base URL of the Promotion Agent (e.g., http://localhost:8002)
            timeout: Request timeout in seconds (default: 10.0 for NFR-LAT compliance)
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def get_promotion_decision(
        self, context: PromotionContextInput
    ) -> PromotionDecisionOutput | None:
        """Call the Promotion Agent to get a promotion decision.

        Args:
            context: Pre-computed promotion context from Layer 1.

        Returns:
            PromotionDecisionOutput if successful, None if agent unavailable.
            Fails open - logs warnings but does not raise exceptions.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # NAT /generate endpoint expects {"query": "<JSON string>"}
                response = await client.post(
                    f"{self.base_url}/generate",
                    json={"query": json.dumps(context)},
                    headers={"Content-Type": "application/json"},
                )

                if response.status_code != 200:
                    logger.warning(
                        "Promotion agent returned status %d: %s",
                        response.status_code,
                        response.text,
                    )
                    return None

                # Parse the agent response
                result = response.json()

                # NAT returns response in {"value": "<JSON string>"} format
                if "value" in result:
                    try:
                        decision = json.loads(result["value"])
                        return PromotionDecisionOutput(
                            product_id=decision.get(
                                "product_id", context["product_id"]
                            ),
                            action=decision.get(
                                "action", PromotionAction.NO_PROMO.value
                            ),
                            reason_codes=decision.get("reason_codes", []),
                            reasoning=decision.get("reasoning", ""),
                        )
                    except json.JSONDecodeError as e:
                        logger.warning(
                            "Failed to parse promotion agent response as JSON: %s", e
                        )
                        return None

                logger.warning(
                    "Unexpected response format from promotion agent: %s", result
                )
                return None

        except httpx.TimeoutException:
            logger.warning(
                "Promotion agent request timed out after %.1f seconds", self.timeout
            )
            return None
        except httpx.ConnectError as e:
            logger.warning(
                "Failed to connect to promotion agent at %s: %s", self.base_url, e
            )
            return None
        except asyncio.CancelledError:
            logger.warning("Promotion agent request was cancelled")
            raise
        except Exception as e:
            logger.warning("Unexpected error calling promotion agent: %s", e)
            return None


# =============================================================================
# Default client instance (configured via settings)
# =============================================================================

_default_client: PromotionAgentClient | None = None


def get_promotion_client(base_url: str, timeout: float = 10.0) -> PromotionAgentClient:
    """Get or create the default promotion agent client.

    Args:
        base_url: Base URL of the Promotion Agent.
        timeout: Request timeout in seconds.

    Returns:
        PromotionAgentClient instance.
    """
    global _default_client
    if _default_client is None or _default_client.base_url != base_url:
        _default_client = PromotionAgentClient(base_url, timeout)
    return _default_client


# =============================================================================
# Layer 1: Deterministic Computation
# =============================================================================


def compute_inventory_pressure(stock_count: int) -> InventoryPressure:
    """Compute inventory pressure signal from stock count.

    Args:
        stock_count: Current inventory units.

    Returns:
        HIGH if stock_count > STOCK_THRESHOLD, LOW otherwise.
    """
    if stock_count > STOCK_THRESHOLD:
        return InventoryPressure.HIGH
    return InventoryPressure.LOW


def compute_competition_position(
    base_price: int, lowest_competitor_price: int | None
) -> CompetitionPosition:
    """Compute competition position signal from price comparison.

    Args:
        base_price: Our base price in cents.
        lowest_competitor_price: Lowest competitor price in cents, or None if no data.

    Returns:
        ABOVE_MARKET, AT_MARKET, or BELOW_MARKET based on comparison.
        Returns BELOW_MARKET if no competitor data (assume we're competitive).
    """
    if lowest_competitor_price is None:
        return CompetitionPosition.BELOW_MARKET

    if base_price > lowest_competitor_price:
        return CompetitionPosition.ABOVE_MARKET
    elif base_price == lowest_competitor_price:
        return CompetitionPosition.AT_MARKET
    else:
        return CompetitionPosition.BELOW_MARKET


def filter_allowed_actions_by_margin(min_margin: float) -> list[str]:
    """Filter promotion actions that respect minimum margin constraint.

    An action is allowed if: base_price * (1 - discount) >= base_price * min_margin
    Simplified: discount <= (1 - min_margin)

    Args:
        min_margin: Minimum profit margin as decimal (e.g., 0.15 = 15%).

    Returns:
        List of allowed PromotionAction values as strings.
    """
    max_discount = 1.0 - min_margin
    allowed: list[str] = []

    for action, discount in ACTION_DISCOUNT_MAP.items():
        if discount < max_discount:
            allowed.append(action.value)

    # Always include NO_PROMO as fallback
    if PromotionAction.NO_PROMO.value not in allowed:
        allowed.insert(0, PromotionAction.NO_PROMO.value)

    return allowed


def get_lowest_competitor_price(db: Session, product_id: str) -> int | None:
    """Query the lowest competitor price for a product.

    Args:
        db: Database session.
        product_id: Product identifier.

    Returns:
        Lowest competitor price in cents, or None if no data.
    """
    statement = select(CompetitorPrice).where(CompetitorPrice.product_id == product_id)
    competitor_prices = db.exec(statement).all()

    if not competitor_prices:
        return None

    # Find lowest price manually since order_by has type issues with SQLModel
    lowest_price = min(cp.price for cp in competitor_prices)
    return lowest_price


def compute_promotion_context(db: Session, product: Product) -> PromotionContextInput:
    """Compute the full promotion context for a product (Layer 1).

    Queries database for competitor prices, computes signals, and
    filters allowed actions based on margin constraints.

    Args:
        db: Database session.
        product: Product database model.

    Returns:
        PromotionContextInput ready to send to the Promotion Agent.
    """
    # Get competitor pricing data
    lowest_competitor_price = get_lowest_competitor_price(db, product.id)

    # Compute signals
    inventory_pressure = compute_inventory_pressure(product.stock_count)
    competition_position = compute_competition_position(
        product.base_price, lowest_competitor_price
    )

    # Filter allowed actions by margin
    allowed_actions = filter_allowed_actions_by_margin(product.min_margin)

    # Build context
    signals = SignalsData(
        inventory_pressure=inventory_pressure.value,
        competition_position=competition_position.value,
    )

    return PromotionContextInput(
        product_id=product.id,
        product_name=product.name,
        base_price_cents=product.base_price,
        stock_count=product.stock_count,
        min_margin=product.min_margin,
        lowest_competitor_price_cents=lowest_competitor_price or product.base_price,
        signals=signals,
        allowed_actions=allowed_actions,
    )


# =============================================================================
# Layer 2: LLM Arbitration (Agent Call)
# =============================================================================


async def call_promotion_agent(
    context: PromotionContextInput,
    client: PromotionAgentClient | None = None,
) -> PromotionDecisionOutput | None:
    """Call the Promotion Agent to get a promotion decision (Layer 2).

    Handles fail-open behavior: returns None if agent is unavailable,
    allowing checkout to proceed without discounts.

    Args:
        context: Pre-computed promotion context from Layer 1.
        client: Optional custom client (uses default if not provided).

    Returns:
        PromotionDecisionOutput if successful, None if agent unavailable.
    """
    if client is None:
        settings = get_settings()
        client = get_promotion_client(
            settings.promotion_agent_url,
            settings.promotion_agent_timeout,
        )

    decision = await client.get_promotion_decision(context)

    if decision is None:
        logger.info(
            "Promotion agent unavailable for product %s, using NO_PROMO",
            context["product_id"],
        )

    return decision


# =============================================================================
# Layer 3: Deterministic Execution
# =============================================================================


def apply_promotion_action(base_price: int, action: str) -> int:
    """Apply a promotion action to calculate the discount amount (Layer 3).

    Args:
        base_price: Base price in cents.
        action: Selected action from PromotionAction enum.

    Returns:
        Discount amount in cents (not the final price).
    """
    try:
        promotion_action = PromotionAction(action)
        discount_rate = ACTION_DISCOUNT_MAP.get(promotion_action, 0.0)
    except ValueError:
        logger.warning("Invalid promotion action '%s', applying NO_PROMO", action)
        discount_rate = 0.0

    discount_cents = int(base_price * discount_rate)
    return discount_cents


def validate_discount_against_margin(
    base_price: int, discount: int, min_margin: float
) -> bool:
    """Validate that a discount respects the minimum margin constraint.

    Final check to ensure agent decision doesn't violate margin rules.

    Args:
        base_price: Base price in cents.
        discount: Proposed discount in cents.
        min_margin: Minimum profit margin as decimal.

    Returns:
        True if discount is valid, False if it violates margin constraint.
    """
    final_price = base_price - discount
    min_allowed_price = int(base_price * min_margin)

    return final_price >= min_allowed_price


# =============================================================================
# High-Level Service Functions
# =============================================================================


async def get_promotion_for_product(
    db: Session,
    product: Product,
    client: PromotionAgentClient | None = None,
) -> dict[str, Any]:
    """Get promotion decision for a single product.

    Executes all 3 layers: compute context, call agent, apply action.

    Args:
        db: Database session.
        product: Product database model.
        client: Optional custom client for testing.

    Returns:
        Dictionary with 'discount' (cents), 'action', 'reason_codes', 'reasoning'.
    """
    started = time.perf_counter()
    status = "success"
    error_code: str | None = None

    try:
        # Layer 1: Compute context
        context = compute_promotion_context(db, product)

        # Layer 2: Call agent
        decision = await call_promotion_agent(context, client)

        # Default to NO_PROMO if agent unavailable
        if decision is None:
            status = "fallback_success"
            error_code = "agent_unavailable"
            action = PromotionAction.NO_PROMO.value
            reason_codes: list[str] = []
            reasoning = "Agent unavailable, no discount applied"
        else:
            action = decision["action"]
            reason_codes = decision["reason_codes"]
            reasoning = decision["reasoning"]

        # Layer 3: Apply action
        discount = apply_promotion_action(product.base_price, action)

        # Final validation (fail closed if discount violates margin)
        if not validate_discount_against_margin(
            product.base_price, discount, product.min_margin
        ):
            logger.warning(
                "Discount %d violates margin for product %s, reverting to NO_PROMO",
                discount,
                product.id,
            )
            status = "fallback_success"
            error_code = "margin_protected"
            discount = 0
            action = PromotionAction.NO_PROMO.value
            reason_codes = ["MARGIN_PROTECTED"]
            reasoning = "Discount reverted to protect margin constraint"

        return {
            "discount": discount,
            "action": action,
            "reason_codes": reason_codes,
            "reasoning": reasoning,
        }
    except Exception:
        status = "error_internal"
        error_code = "internal_exception"
        raise
    finally:
        latency_ms = int((time.perf_counter() - started) * 1000)
        record_agent_outcome(
            agent_type="promotion",
            channel="acp",
            status=status,
            latency_ms=latency_ms,
            session_id=None,
            error_code=error_code,
        )


async def get_promotions_for_products(
    db: Session,
    products: list[Product],
    client: PromotionAgentClient | None = None,
) -> list[dict[str, Any]]:
    """Get promotion decisions for multiple products in parallel.

    Designed for asyncio.gather compatibility with other agents.

    Args:
        db: Database session.
        products: List of Product database models.
        client: Optional custom client for testing.

    Returns:
        List of promotion results in same order as input products.
    """
    tasks = [get_promotion_for_product(db, p, client) for p in products]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle any exceptions by returning NO_PROMO
    processed_results: list[dict[str, Any]] = []
    for i, result in enumerate(results):
        if isinstance(result, BaseException):
            logger.warning(
                "Exception getting promotion for product %s: %s",
                products[i].id,
                result,
            )
            processed_results.append(
                {
                    "discount": 0,
                    "action": PromotionAction.NO_PROMO.value,
                    "reason_codes": [],
                    "reasoning": f"Error: {result}",
                }
            )
        else:
            # result is dict[str, Any] after the isinstance check
            processed_results.append(result)

    return processed_results

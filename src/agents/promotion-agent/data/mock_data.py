"""Mock product and competitor price data for the Promotion Agent.

This data mirrors the merchant database schema and is used for standalone
agent testing without database dependencies.

All prices are in CENTS (e.g., 2500 = $25.00).

This module also defines the contract types between the ACP endpoint and
the Promotion Agent (enums, signals, thresholds).
"""

from enum import Enum
from typing import TypedDict

# =============================================================================
# Promotion Action Enum - Actions the LLM can select from
# =============================================================================


class PromotionAction(str, Enum):
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


class InventoryPressure(str, Enum):
    """Inventory pressure signal based on stock_count."""

    HIGH = "high"  # stock_count > STOCK_THRESHOLD
    LOW = "low"  # stock_count <= STOCK_THRESHOLD


class CompetitionPosition(str, Enum):
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


class ReasonCode(str, Enum):
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
# Mock Data - Product and Competitor Data (for ACP endpoint reference)
# =============================================================================


class ProductData(TypedDict):
    """Type definition for product data."""

    name: str
    base_price: int  # cents
    stock_count: int
    min_margin: float  # decimal (0.15 = 15%)


class CompetitorPriceData(TypedDict):
    """Type definition for competitor price data."""

    retailer: str
    price: int  # cents


PRODUCTS: dict[str, ProductData] = {
    "prod_1": {
        "name": "Classic Tee",
        "base_price": 2500,  # $25.00
        "stock_count": 100,
        "min_margin": 0.15,  # 15% minimum profit margin
    },
    "prod_2": {
        "name": "V-Neck Tee",
        "base_price": 2800,  # $28.00
        "stock_count": 50,
        "min_margin": 0.12,  # 12% minimum profit margin
    },
    "prod_3": {
        "name": "Graphic Tee",
        "base_price": 3200,  # $32.00
        "stock_count": 200,
        "min_margin": 0.18,  # 18% minimum profit margin
    },
    "prod_4": {
        "name": "Premium Tee",
        "base_price": 4500,  # $45.00
        "stock_count": 25,
        "min_margin": 0.20,  # 20% minimum profit margin
    },
}

COMPETITOR_PRICES: dict[str, list[CompetitorPriceData]] = {
    "prod_1": [
        {"retailer": "CompetitorA", "price": 2200},  # $22.00
        {"retailer": "CompetitorB", "price": 2400},  # $24.00
    ],
    "prod_2": [
        {"retailer": "CompetitorA", "price": 2600},  # $26.00
    ],
    "prod_3": [
        {"retailer": "CompetitorA", "price": 2800},  # $28.00
        {"retailer": "CompetitorC", "price": 3000},  # $30.00
    ],
    "prod_4": [
        {"retailer": "CompetitorB", "price": 4200},  # $42.00
    ],
}

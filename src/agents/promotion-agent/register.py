"""Custom NAT functions for the Promotion Agent.

This module registers custom tools with NVIDIA NeMo Agent Toolkit (NAT)
that allow the agent to query product stock and competitor pricing data.

These tools follow the NAT function registration pattern using the
@register_function decorator and generator syntax with yield.
"""

import logging
from typing import TYPE_CHECKING

from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig
from pydantic import BaseModel, Field

from data.mock_data import COMPETITOR_PRICES, PRODUCTS

if TYPE_CHECKING:
    from nat.builder.builder import Builder

logger = logging.getLogger(__name__)


# ============================================================================
# Tool 1: Query Product Stock
# ============================================================================


class QueryProductStockInput(BaseModel):
    """Input schema for querying product stock information."""

    product_id: str = Field(
        description="The product ID to query (e.g., prod_1, prod_2)",
        examples=["prod_1", "prod_2", "prod_3", "prod_4"],
    )


class QueryProductStockConfig(FunctionBaseConfig, name="query_product_stock"):
    """Configuration for the query_product_stock tool."""

    pass


@register_function(config_type=QueryProductStockConfig)
async def query_product_stock(
    config: QueryProductStockConfig, builder: "Builder"
) -> FunctionInfo:
    """Query product stock and pricing information.

    This tool retrieves product details including name, base price,
    current stock count, and minimum profit margin constraint.
    """

    async def _query_product_stock(product_id: str) -> str:
        """Execute the product stock query.

        Args:
            product_id: The product ID to look up.

        Returns:
            Formatted string with product information or error message.
        """
        logger.info(f"Querying product stock for: {product_id}")

        product_id_normalized = product_id.strip().lower()

        if product_id_normalized not in PRODUCTS:
            available_ids = list(PRODUCTS.keys())
            return (
                f"Error: Product '{product_id}' not found. "
                f"Available product IDs: {', '.join(available_ids)}"
            )

        product = PRODUCTS[product_id_normalized]

        base_price = product["base_price"]
        price_dollars = base_price / 100
        return (
            f"Product: {product['name']}\n"
            f"Product ID: {product_id_normalized}\n"
            f"Base Price: {base_price} cents (${price_dollars:.2f})\n"
            f"Stock Count: {product['stock_count']} units\n"
            f"Minimum Margin: {product['min_margin'] * 100:.0f}%"
        )

    yield FunctionInfo.from_fn(
        _query_product_stock,
        description=(
            "Query product stock and pricing information from the inventory database. "
            "Returns the product name, base price (in cents), current stock count, "
            "and minimum profit margin constraint. Use this to check inventory levels "
            "before calculating discounts."
        ),
        input_schema=QueryProductStockInput,
    )


# ============================================================================
# Tool 2: Query Competitor Prices
# ============================================================================


class QueryCompetitorPriceInput(BaseModel):
    """Input schema for querying competitor prices."""

    product_id: str = Field(
        description="The product ID to query competitor prices for",
        examples=["prod_1", "prod_2", "prod_3", "prod_4"],
    )


class QueryCompetitorPriceConfig(FunctionBaseConfig, name="query_competitor_price"):
    """Configuration for the query_competitor_price tool."""

    pass


@register_function(config_type=QueryCompetitorPriceConfig)
async def query_competitor_price(
    config: QueryCompetitorPriceConfig, builder: "Builder"
) -> FunctionInfo:
    """Query competitor pricing information for a product.

    This tool retrieves prices from competitor retailers to enable
    competitive pricing decisions.
    """

    async def _query_competitor_price(product_id: str) -> str:
        """Execute the competitor price query.

        Args:
            product_id: The product ID to look up competitor prices for.

        Returns:
            Formatted string with competitor prices or error message.
        """
        logger.info(f"Querying competitor prices for: {product_id}")

        product_id_normalized = product_id.strip().lower()

        if product_id_normalized not in COMPETITOR_PRICES:
            available_ids = list(COMPETITOR_PRICES.keys())
            return (
                f"Error: No competitor data for product '{product_id}'. "
                f"Available product IDs: {', '.join(available_ids)}"
            )

        competitors = COMPETITOR_PRICES[product_id_normalized]

        if not competitors:
            return f"No competitor prices available for product '{product_id}'."

        lines = [f"Competitor prices for product '{product_id_normalized}':"]
        lowest_price = float("inf")
        lowest_retailer = ""

        for comp in competitors:
            price_dollars = comp["price"] / 100
            retailer = comp["retailer"]
            price_cents = comp["price"]
            lines.append(f"  - {retailer}: {price_cents} cents (${price_dollars:.2f})")
            if price_cents < lowest_price:
                lowest_price = price_cents
                lowest_retailer = retailer

        lowest_dollars = lowest_price / 100
        lines.append(
            f"\nLowest competitor price: {int(lowest_price)} cents "
            f"(${lowest_dollars:.2f}) from {lowest_retailer}"
        )

        return "\n".join(lines)

    yield FunctionInfo.from_fn(
        _query_competitor_price,
        description=(
            "Query competitor pricing information for a specific product. "
            "Returns a list of competitor retailers and their prices (in cents), "
            "along with the lowest competitor price. Use this to determine "
            "competitive pricing strategies."
        ),
        input_schema=QueryCompetitorPriceInput,
    )

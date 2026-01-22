"""Mock product and competitor price data for the Promotion Agent.

This data mirrors the merchant database schema and is used for standalone
agent testing without database dependencies.

All prices are in CENTS (e.g., 2500 = $25.00).
"""

from typing import TypedDict


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

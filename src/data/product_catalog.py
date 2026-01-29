"""
Shared Product Catalog

Single source of truth for all product data used by both:
- SQLite seeder (src/merchant/db/database.py)
- Milvus seeder (src/agents/scripts/seed_milvus.py)

Fields:
- Core: id, sku, name, price_cents, stock_count
- SQLite-specific: min_margin, image_url
- Milvus-specific: category, subcategory, description, attributes
"""

from typing import TypedDict


class ProductData(TypedDict):
    """Type definition for product catalog entries."""

    id: str
    sku: str
    name: str
    price_cents: int
    stock_count: int
    min_margin: float
    image_url: str
    category: str
    subcategory: str
    description: str
    attributes: list[str]


PRODUCTS: list[ProductData] = [
    # --- Existing Merchant Products (Tees) ---
    {
        "id": "prod_1",
        "sku": "TS-001",
        "name": "Classic Tee",
        "price_cents": 2500,
        "stock_count": 100,
        "min_margin": 0.15,
        "image_url": "/prod_1.jpeg",
        "category": "tops",
        "subcategory": "t-shirts",
        "description": "Essential classic crew neck t-shirt in soft cotton. Perfect everyday basic for casual wear. Available in multiple colors.",
        "attributes": ["casual", "cotton", "crew-neck", "basic", "everyday"],
    },
    {
        "id": "prod_2",
        "sku": "TS-002",
        "name": "V-Neck Tee",
        "price_cents": 2800,
        "stock_count": 50,
        "min_margin": 0.12,
        "image_url": "/prod_2.jpeg",
        "category": "tops",
        "subcategory": "t-shirts",
        "description": "Stylish V-neck t-shirt with a modern slim fit. Soft blend fabric for comfort and style. Great for layering.",
        "attributes": ["casual", "slim-fit", "v-neck", "layering", "modern"],
    },
    {
        "id": "prod_3",
        "sku": "TS-003",
        "name": "Graphic Tee",
        "price_cents": 3200,
        "stock_count": 200,
        "min_margin": 0.18,
        "image_url": "/prod_3.jpeg",
        "category": "tops",
        "subcategory": "t-shirts",
        "description": "Bold graphic print t-shirt with unique artistic design. Statement piece for casual streetwear looks.",
        "attributes": ["casual", "streetwear", "graphic", "artistic", "statement"],
    },
    {
        "id": "prod_4",
        "sku": "TS-004",
        "name": "Premium Tee",
        "price_cents": 4500,
        "stock_count": 25,
        "min_margin": 0.20,
        "image_url": "/prod_4.jpeg",
        "category": "tops",
        "subcategory": "t-shirts",
        "description": "Luxury premium t-shirt in ultra-soft Pima cotton. Elevated basics with refined details and superior comfort.",
        "attributes": ["premium", "pima-cotton", "luxury", "refined", "comfort"],
    },
    # --- Bottoms (Cross-sell candidates for tees) ---
    {
        "id": "prod_5",
        "sku": "BT-001",
        "name": "Classic Denim Jeans",
        "price_cents": 5900,
        "stock_count": 75,
        "min_margin": 0.15,
        "image_url": "/prod_5.jpeg",
        "category": "bottoms",
        "subcategory": "jeans",
        "description": "Timeless straight-leg denim jeans in classic indigo wash. Versatile everyday staple that pairs with any top.",
        "attributes": ["casual", "denim", "straight-leg", "indigo", "versatile"],
    },
    {
        "id": "prod_6",
        "sku": "BT-002",
        "name": "Khaki Chinos",
        "price_cents": 4500,
        "stock_count": 60,
        "min_margin": 0.15,
        "image_url": "/prod_6.jpeg",
        "category": "bottoms",
        "subcategory": "chinos",
        "description": "Classic khaki chino pants with a modern tapered fit. Perfect for smart-casual looks from office to weekend.",
        "attributes": ["smart-casual", "chino", "tapered", "khaki", "versatile"],
    },
    {
        "id": "prod_7",
        "sku": "BT-003",
        "name": "Cargo Shorts",
        "price_cents": 3500,
        "stock_count": 90,
        "min_margin": 0.15,
        "image_url": "/prod_7.jpeg",
        "category": "bottoms",
        "subcategory": "shorts",
        "description": "Functional cargo shorts with multiple pockets. Relaxed fit perfect for summer casual wear and outdoor activities.",
        "attributes": ["casual", "summer", "cargo", "relaxed", "outdoor"],
    },
    {
        "id": "prod_8",
        "sku": "BT-004",
        "name": "Athletic Joggers",
        "price_cents": 4200,
        "stock_count": 45,
        "min_margin": 0.15,
        "image_url": "/prod_8.jpeg",
        "category": "bottoms",
        "subcategory": "joggers",
        "description": "Comfortable athletic joggers with tapered leg and elastic cuffs. Great for workouts or casual athleisure style.",
        "attributes": ["athletic", "joggers", "athleisure", "comfortable", "tapered"],
    },
    # --- Outerwear (Cross-sell candidates) ---
    {
        "id": "prod_9",
        "sku": "OW-001",
        "name": "Denim Jacket",
        "price_cents": 7500,
        "stock_count": 30,
        "min_margin": 0.18,
        "image_url": "/prod_9.jpeg",
        "category": "outerwear",
        "subcategory": "jackets",
        "description": "Classic denim trucker jacket in medium wash. Timeless layering piece that adds edge to any casual outfit.",
        "attributes": ["casual", "denim", "layering", "classic", "trucker"],
    },
    {
        "id": "prod_10",
        "sku": "OW-002",
        "name": "Lightweight Hoodie",
        "price_cents": 5500,
        "stock_count": 55,
        "min_margin": 0.15,
        "image_url": "/prod_10.jpeg",
        "category": "outerwear",
        "subcategory": "hoodies",
        "description": "Cozy lightweight hoodie in soft fleece. Perfect for layering over tees on cooler days or evenings.",
        "attributes": ["casual", "fleece", "layering", "cozy", "lightweight"],
    },
    {
        "id": "prod_11",
        "sku": "OW-003",
        "name": "Bomber Jacket",
        "price_cents": 8900,
        "stock_count": 20,
        "min_margin": 0.20,
        "image_url": "/prod_11.jpeg",
        "category": "outerwear",
        "subcategory": "jackets",
        "description": "Modern bomber jacket with ribbed cuffs and hem. Sleek silhouette for elevated casual style.",
        "attributes": ["modern", "bomber", "sleek", "elevated", "casual"],
    },
    # --- Accessories (Cross-sell candidates) ---
    {
        "id": "prod_12",
        "sku": "AC-001",
        "name": "Canvas Belt",
        "price_cents": 1800,
        "stock_count": 120,
        "min_margin": 0.12,
        "image_url": "/prod_12.jpeg",
        "category": "accessories",
        "subcategory": "belts",
        "description": "Casual canvas belt with brushed metal buckle. Essential accessory to complete any casual outfit.",
        "attributes": ["casual", "canvas", "essential", "accessory", "everyday"],
    },
    {
        "id": "prod_13",
        "sku": "AC-002",
        "name": "Classic Sunglasses",
        "price_cents": 2200,
        "stock_count": 80,
        "min_margin": 0.15,
        "image_url": "/prod_13.jpeg",
        "category": "accessories",
        "subcategory": "eyewear",
        "description": "Timeless wayfarer-style sunglasses with UV protection. Must-have accessory for sunny days.",
        "attributes": ["accessory", "wayfarer", "UV-protection", "classic", "summer"],
    },
    {
        "id": "prod_14",
        "sku": "AC-003",
        "name": "Baseball Cap",
        "price_cents": 1500,
        "stock_count": 150,
        "min_margin": 0.12,
        "image_url": "/prod_14.jpeg",
        "category": "accessories",
        "subcategory": "hats",
        "description": "Classic six-panel baseball cap with adjustable strap. Casual headwear for everyday style.",
        "attributes": ["casual", "baseball-cap", "adjustable", "everyday", "sporty"],
    },
    # --- Footwear (Cross-sell candidates) ---
    {
        "id": "prod_15",
        "sku": "FW-001",
        "name": "Canvas Sneakers",
        "price_cents": 4900,
        "stock_count": 65,
        "min_margin": 0.15,
        "image_url": "/prod_15.jpeg",
        "category": "footwear",
        "subcategory": "sneakers",
        "description": "Classic low-top canvas sneakers in clean white. Timeless casual footwear that goes with everything.",
        "attributes": ["casual", "canvas", "sneakers", "white", "versatile"],
    },
    {
        "id": "prod_16",
        "sku": "FW-002",
        "name": "Leather Loafers",
        "price_cents": 8500,
        "stock_count": 25,
        "min_margin": 0.20,
        "image_url": "/prod_16.jpeg",
        "category": "footwear",
        "subcategory": "loafers",
        "description": "Premium leather penny loafers for smart-casual occasions. Elevate your style from casual to refined.",
        "attributes": ["smart-casual", "leather", "loafers", "premium", "refined"],
    },
    {
        "id": "prod_17",
        "sku": "FW-003",
        "name": "Athletic Running Shoes",
        "price_cents": 9500,
        "stock_count": 40,
        "min_margin": 0.18,
        "image_url": "/prod_17.jpeg",
        "category": "footwear",
        "subcategory": "athletic",
        "description": "High-performance running shoes with cushioned sole and breathable mesh. For workouts or athleisure style.",
        "attributes": ["athletic", "running", "cushioned", "breathable", "performance"],
    },
]

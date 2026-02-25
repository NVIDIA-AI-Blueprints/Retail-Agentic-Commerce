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
    lifecycle: str
    demand_velocity: str


PRODUCTS: list[ProductData] = [
    # --- Tops (T-Shirts) ---
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
        "description": (
            "Essential classic crew neck t-shirt made from 100% ring-spun cotton"
            " in a relaxed regular fit. Pre-shrunk jersey knit fabric (5.3 oz)"
            " with reinforced shoulder seams for durability. Available in white,"
            " black, navy, heather grey, and forest green. Machine washable."
            " Perfect everyday basic for men and women — pair with jeans,"
            " chinos, or joggers for effortless casual wear."
        ),
        "attributes": [
            "casual", "cotton", "crew-neck", "basic", "everyday",
            "unisex", "regular-fit", "machine-washable", "ring-spun",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Modern slim-fit V-neck t-shirt in a soft cotton-polyester blend"
            " (60/40) for a smooth drape that holds its shape wash after wash."
            " Tapered side seams and a slightly longer hem make it ideal for"
            " layering under jackets, blazers, or open button-downs. Available"
            " in charcoal, white, burgundy, and olive. Lightweight 4.5 oz"
            " fabric suited for all seasons."
        ),
        "attributes": [
            "casual", "slim-fit", "v-neck", "layering", "modern",
            "cotton-blend", "lightweight", "tapered", "all-season",
        ],
        "lifecycle": "mature",
        "demand_velocity": "decelerating",
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
        "description": (
            "Bold graphic print t-shirt featuring original artist-designed"
            " artwork with water-based screen printing that won't crack or"
            " peel. 100% combed cotton with a semi-relaxed fit. Great as a"
            " streetwear statement piece or for casual weekend outfits."
            " Available in black, white, and sand colorways."
        ),
        "attributes": [
            "casual", "streetwear", "graphic", "artistic", "statement",
            "screen-print", "combed-cotton", "unisex",
        ],
        "lifecycle": "growth",
        "demand_velocity": "accelerating",
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
        "description": (
            "Luxury premium t-shirt crafted from ultra-soft long-staple"
            " Pima cotton with a 60-gauge single-jersey knit for an"
            " exceptionally smooth hand feel. Reinforced crew neck collar"
            " resists stretching. Finished with blind-stitched hems and"
            " side-seam construction for a refined silhouette. Ideal for"
            " elevated casual wear or business-casual layering. Available"
            " in white, black, and stone."
        ),
        "attributes": [
            "premium", "pima-cotton", "luxury", "refined", "comfort",
            "crew-neck", "business-casual", "long-staple",
        ],
        "lifecycle": "new_arrival",
        "demand_velocity": "accelerating",
    },
    # --- Bottoms ---
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
        "description": (
            "Timeless straight-leg denim jeans in a classic indigo wash"
            " with subtle whiskering. Made from 12 oz rigid denim"
            " (99% cotton, 1% elastane) for a comfortable fit that"
            " breaks in over time. Five-pocket construction with"
            " reinforced rivets at stress points. Mid-rise waist sits"
            " at the natural waistline. Also available in a slim-fit"
            " cut. Versatile enough for casual Friday at the office or"
            " weekend errands."
        ),
        "attributes": [
            "casual", "denim", "straight-leg", "indigo", "versatile",
            "mid-rise", "slim-fit", "rigid-denim", "five-pocket",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Classic khaki chino pants with a modern tapered fit that"
            " narrows from knee to ankle. Lightweight stretch-cotton"
            " twill (98% cotton, 2% spandex) for all-day comfort."
            " Flat-front design with a zip fly, button closure, and"
            " slant front pockets. Smart-casual staple that transitions"
            " easily from office to weekend — pair with loafers or"
            " sneakers. Also available in navy, olive, and stone."
        ),
        "attributes": [
            "smart-casual", "chino", "tapered", "khaki", "versatile",
            "stretch", "flat-front", "office-wear", "twill",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Functional cargo shorts with six pockets including two"
            " side cargo pockets with snap closures. Relaxed fit in"
            " durable ripstop cotton that resists tearing. 10-inch"
            " inseam hits just above the knee. Perfect for summer"
            " casual wear, hiking, camping, and outdoor activities."
            " Available in khaki, olive, and charcoal."
        ),
        "attributes": [
            "casual", "summer", "cargo", "relaxed", "outdoor",
            "ripstop", "hiking", "multi-pocket", "durable",
        ],
        "lifecycle": "clearance",
        "demand_velocity": "decelerating",
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
        "description": (
            "Comfortable athletic joggers with a tapered leg and"
            " ribbed elastic cuffs at the ankle. Made from moisture-"
            "wicking French terry fabric (80% cotton, 20% polyester)"
            " with four-way stretch for unrestricted movement. Elastic"
            " drawstring waistband and two zippered side pockets."
            " Great for gym workouts, yoga sessions, running, or"
            " athleisure casual wear. Available in black, heather"
            " grey, and navy."
        ),
        "attributes": [
            "athletic", "joggers", "athleisure", "comfortable", "tapered",
            "moisture-wicking", "stretch", "gym", "yoga", "running",
        ],
        "lifecycle": "growth",
        "demand_velocity": "accelerating",
    },
    # --- Outerwear ---
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
        "description": (
            "Classic denim trucker jacket in a medium stonewash finish."
            " Constructed from sturdy 13 oz cotton denim with copper-"
            "toned metal buttons and adjustable waist tabs for a"
            " customizable fit. Pointed collar, two chest flap pockets,"
            " and two side welt pockets. Timeless layering piece that"
            " pairs with everything from t-shirts to hoodies. Suitable"
            " for spring and fall transitional weather."
        ),
        "attributes": [
            "casual", "denim", "layering", "classic", "trucker",
            "spring", "fall", "stonewash", "cotton",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Cozy lightweight zip-up hoodie in brushed fleece fabric"
            " (280 gsm cotton-polyester blend). Features a lined hood"
            " with adjustable drawcord, front kangaroo pocket, and"
            " ribbed hem and cuffs. Perfect for layering over tees on"
            " cooler spring and fall days, evening walks, or post-"
            "workout cool-down. Available in black, heather grey,"
            " navy, and sage green."
        ),
        "attributes": [
            "casual", "fleece", "layering", "cozy", "lightweight",
            "zip-up", "hoodie", "spring", "fall", "cotton-blend",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Modern bomber jacket with a water-resistant nylon shell"
            " and quilted satin lining for warmth without bulk."
            " Ribbed knit collar, cuffs, and hem provide a snug seal"
            " against wind. Full-zip front with two side zip pockets"
            " and one interior pocket. Sleek silhouette for elevated"
            " casual style — wear over a tee or hoodie for a polished"
            " streetwear look. Suitable for cool weather and light rain."
        ),
        "attributes": [
            "modern", "bomber", "sleek", "elevated", "casual",
            "water-resistant", "nylon", "quilted", "wind-proof",
        ],
        "lifecycle": "new_arrival",
        "demand_velocity": "accelerating",
    },
    # --- Accessories ---
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
        "description": (
            "Casual woven canvas belt with a brushed antique-silver"
            " metal buckle. 1.5-inch wide strap made from heavy-duty"
            " cotton canvas with a leather-tipped end. Fits waist"
            " sizes 28-42 with a cut-to-fit design. Essential"
            " everyday accessory for jeans, chinos, or shorts."
            " Available in khaki, navy, olive, and black."
        ),
        "attributes": [
            "casual", "canvas", "essential", "accessory", "everyday",
            "woven", "cotton", "adjustable", "men",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Timeless wayfarer-style sunglasses with polarized lenses"
            " and full UV400 protection that blocks 100% of UVA and"
            " UVB rays. Lightweight acetate frame with spring hinges"
            " for a comfortable, secure fit. Scratch-resistant lenses"
            " reduce glare for driving, beach, and outdoor activities."
            " Includes microfiber pouch and hard case. Available in"
            " matte black, tortoiseshell, and clear frames."
        ),
        "attributes": [
            "accessory", "wayfarer", "UV-protection", "classic", "summer",
            "polarized", "acetate", "scratch-resistant", "unisex",
        ],
        "lifecycle": "growth",
        "demand_velocity": "accelerating",
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
        "description": (
            "Classic six-panel baseball cap with a pre-curved brim"
            " and adjustable metal snap-back closure that fits most"
            " head sizes. Made from breathable cotton twill with"
            " embroidered eyelets for ventilation. Low-profile crown"
            " for a clean, modern look. Perfect for sunny days,"
            " outdoor sports, running, or casual everyday style."
            " Available in black, navy, white, and khaki."
        ),
        "attributes": [
            "casual", "baseball-cap", "adjustable", "everyday", "sporty",
            "breathable", "cotton-twill", "snap-back", "unisex",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
    },
    # --- Footwear ---
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
        "description": (
            "Classic low-top canvas sneakers with a vulcanized rubber"
            " sole and cushioned foam insole for all-day comfort."
            " Durable cotton canvas upper with metal eyelets and"
            " cotton laces. Timeless casual footwear that pairs with"
            " jeans, shorts, or chinos. Available in white, black,"
            " navy, and red. Lightweight and flexible — great for"
            " walking, travel, and everyday wear."
        ),
        "attributes": [
            "casual", "canvas", "sneakers", "white", "versatile",
            "low-top", "rubber-sole", "lightweight", "walking",
        ],
        "lifecycle": "mature",
        "demand_velocity": "flat",
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
        "description": (
            "Premium full-grain leather penny loafers handcrafted"
            " with Blake-stitched construction for a sleek profile."
            " Cushioned leather insole and flexible rubber outsole"
            " for comfort from office to dinner. Slip-on design"
            " with classic penny strap detail. Smart-casual dress"
            " shoes suitable for business meetings, formal events,"
            " or elevated weekend outfits. Available in cognac,"
            " black, and dark brown."
        ),
        "attributes": [
            "smart-casual", "leather", "loafers", "premium", "refined",
            "dress-shoes", "formal", "slip-on", "handcrafted",
        ],
        "lifecycle": "clearance",
        "demand_velocity": "decelerating",
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
        "description": (
            "High-performance running shoes with responsive EVA"
            " cushioned midsole and breathable engineered mesh upper"
            " for maximum airflow. Rubber outsole with multi-"
            "directional traction pattern for grip on roads and"
            " trails. Padded collar and tongue for a secure,"
            " comfortable fit during long runs. Suitable for daily"
            " running, gym training, jogging, and athleisure style."
            " Available in black/white, grey/neon, and navy/orange."
        ),
        "attributes": [
            "athletic", "running", "cushioned", "breathable", "performance",
            "EVA-midsole", "mesh", "gym", "jogging", "trail",
        ],
        "lifecycle": "growth",
        "demand_velocity": "accelerating",
    },
]

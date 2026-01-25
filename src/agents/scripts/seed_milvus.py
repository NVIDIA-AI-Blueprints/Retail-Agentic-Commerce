#!/usr/bin/env python3
"""
Seed Milvus Vector Database with Product Catalog Embeddings

This script creates the product_catalog collection in Milvus and populates it
with product embeddings generated using NVIDIA's NV-EmbedQA-E5-v5 model.

Usage:
    cd src/agents
    source .venv/bin/activate
    python scripts/seed_milvus.py

Requirements:
    - Milvus running at localhost:19530 (docker compose up -d)
    - NVIDIA_API_KEY environment variable set
    - pymilvus installed (pip install pymilvus)
"""

import os
import sys
import json
import httpx
from typing import Any

# Check for required environment variable
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
if not NVIDIA_API_KEY:
    print("ERROR: NVIDIA_API_KEY environment variable is required")
    print("Set it with: export NVIDIA_API_KEY=nvapi-xxx")
    sys.exit(1)

MILVUS_URI = os.environ.get("MILVUS_URI", "http://localhost:19530")
COLLECTION_NAME = "product_catalog"
EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5"
EMBEDDING_DIM = 1024  # NV-EmbedQA-E5-v5 dimension
NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/embeddings"

# =============================================================================
# Product Catalog - Includes merchant products + cross-sell candidates
# =============================================================================
PRODUCTS = [
    # --- Existing Merchant Products (Tees) ---
    {
        "id": "prod_1",
        "sku": "TS-001",
        "name": "Classic Tee",
        "category": "tops",
        "subcategory": "t-shirts",
        "price_cents": 2500,
        "stock_count": 100,
        "description": "Essential classic crew neck t-shirt in soft cotton. Perfect everyday basic for casual wear. Available in multiple colors.",
        "attributes": ["casual", "cotton", "crew-neck", "basic", "everyday"],
    },
    {
        "id": "prod_2",
        "sku": "TS-002",
        "name": "V-Neck Tee",
        "category": "tops",
        "subcategory": "t-shirts",
        "price_cents": 2800,
        "stock_count": 50,
        "description": "Stylish V-neck t-shirt with a modern slim fit. Soft blend fabric for comfort and style. Great for layering.",
        "attributes": ["casual", "slim-fit", "v-neck", "layering", "modern"],
    },
    {
        "id": "prod_3",
        "sku": "TS-003",
        "name": "Graphic Tee",
        "category": "tops",
        "subcategory": "t-shirts",
        "price_cents": 3200,
        "stock_count": 200,
        "description": "Bold graphic print t-shirt with unique artistic design. Statement piece for casual streetwear looks.",
        "attributes": ["casual", "streetwear", "graphic", "artistic", "statement"],
    },
    {
        "id": "prod_4",
        "sku": "TS-004",
        "name": "Premium Tee",
        "category": "tops",
        "subcategory": "t-shirts",
        "price_cents": 4500,
        "stock_count": 25,
        "description": "Luxury premium t-shirt in ultra-soft Pima cotton. Elevated basics with refined details and superior comfort.",
        "attributes": ["premium", "pima-cotton", "luxury", "refined", "comfort"],
    },
    # --- Bottoms (Cross-sell candidates for tees) ---
    {
        "id": "prod_5",
        "sku": "BT-001",
        "name": "Classic Denim Jeans",
        "category": "bottoms",
        "subcategory": "jeans",
        "price_cents": 5900,
        "stock_count": 75,
        "description": "Timeless straight-leg denim jeans in classic indigo wash. Versatile everyday staple that pairs with any top.",
        "attributes": ["casual", "denim", "straight-leg", "indigo", "versatile"],
    },
    {
        "id": "prod_6",
        "sku": "BT-002",
        "name": "Khaki Chinos",
        "category": "bottoms",
        "subcategory": "chinos",
        "price_cents": 4500,
        "stock_count": 60,
        "description": "Classic khaki chino pants with a modern tapered fit. Perfect for smart-casual looks from office to weekend.",
        "attributes": ["smart-casual", "chino", "tapered", "khaki", "versatile"],
    },
    {
        "id": "prod_7",
        "sku": "BT-003",
        "name": "Cargo Shorts",
        "category": "bottoms",
        "subcategory": "shorts",
        "price_cents": 3500,
        "stock_count": 90,
        "description": "Functional cargo shorts with multiple pockets. Relaxed fit perfect for summer casual wear and outdoor activities.",
        "attributes": ["casual", "summer", "cargo", "relaxed", "outdoor"],
    },
    {
        "id": "prod_8",
        "sku": "BT-004",
        "name": "Athletic Joggers",
        "category": "bottoms",
        "subcategory": "joggers",
        "price_cents": 4200,
        "stock_count": 45,
        "description": "Comfortable athletic joggers with tapered leg and elastic cuffs. Great for workouts or casual athleisure style.",
        "attributes": ["athletic", "joggers", "athleisure", "comfortable", "tapered"],
    },
    # --- Outerwear (Cross-sell candidates) ---
    {
        "id": "prod_9",
        "sku": "OW-001",
        "name": "Denim Jacket",
        "category": "outerwear",
        "subcategory": "jackets",
        "price_cents": 7500,
        "stock_count": 30,
        "description": "Classic denim trucker jacket in medium wash. Timeless layering piece that adds edge to any casual outfit.",
        "attributes": ["casual", "denim", "layering", "classic", "trucker"],
    },
    {
        "id": "prod_10",
        "sku": "OW-002",
        "name": "Lightweight Hoodie",
        "category": "outerwear",
        "subcategory": "hoodies",
        "price_cents": 5500,
        "stock_count": 55,
        "description": "Cozy lightweight hoodie in soft fleece. Perfect for layering over tees on cooler days or evenings.",
        "attributes": ["casual", "fleece", "layering", "cozy", "lightweight"],
    },
    {
        "id": "prod_11",
        "sku": "OW-003",
        "name": "Bomber Jacket",
        "category": "outerwear",
        "subcategory": "jackets",
        "price_cents": 8900,
        "stock_count": 20,
        "description": "Modern bomber jacket with ribbed cuffs and hem. Sleek silhouette for elevated casual style.",
        "attributes": ["modern", "bomber", "sleek", "elevated", "casual"],
    },
    # --- Accessories (Cross-sell candidates) ---
    {
        "id": "prod_12",
        "sku": "AC-001",
        "name": "Canvas Belt",
        "category": "accessories",
        "subcategory": "belts",
        "price_cents": 1800,
        "stock_count": 120,
        "description": "Casual canvas belt with brushed metal buckle. Essential accessory to complete any casual outfit.",
        "attributes": ["casual", "canvas", "essential", "accessory", "everyday"],
    },
    {
        "id": "prod_13",
        "sku": "AC-002",
        "name": "Classic Sunglasses",
        "category": "accessories",
        "subcategory": "eyewear",
        "price_cents": 2200,
        "stock_count": 80,
        "description": "Timeless wayfarer-style sunglasses with UV protection. Must-have accessory for sunny days.",
        "attributes": ["accessory", "wayfarer", "UV-protection", "classic", "summer"],
    },
    {
        "id": "prod_14",
        "sku": "AC-003",
        "name": "Baseball Cap",
        "category": "accessories",
        "subcategory": "hats",
        "price_cents": 1500,
        "stock_count": 150,
        "description": "Classic six-panel baseball cap with adjustable strap. Casual headwear for everyday style.",
        "attributes": ["casual", "baseball-cap", "adjustable", "everyday", "sporty"],
    },
    # --- Footwear (Cross-sell candidates) ---
    {
        "id": "prod_15",
        "sku": "FW-001",
        "name": "Canvas Sneakers",
        "category": "footwear",
        "subcategory": "sneakers",
        "price_cents": 4900,
        "stock_count": 65,
        "description": "Classic low-top canvas sneakers in clean white. Timeless casual footwear that goes with everything.",
        "attributes": ["casual", "canvas", "sneakers", "white", "versatile"],
    },
    {
        "id": "prod_16",
        "sku": "FW-002",
        "name": "Leather Loafers",
        "category": "footwear",
        "subcategory": "loafers",
        "price_cents": 8500,
        "stock_count": 25,
        "description": "Premium leather penny loafers for smart-casual occasions. Elevate your style from casual to refined.",
        "attributes": ["smart-casual", "leather", "loafers", "premium", "refined"],
    },
    {
        "id": "prod_17",
        "sku": "FW-003",
        "name": "Athletic Running Shoes",
        "category": "footwear",
        "subcategory": "athletic",
        "price_cents": 9500,
        "stock_count": 40,
        "description": "High-performance running shoes with cushioned sole and breathable mesh. For workouts or athleisure style.",
        "attributes": ["athletic", "running", "cushioned", "breathable", "performance"],
    },
]


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings using NVIDIA NIM API.
    
    Args:
        texts: List of text strings to embed
        
    Returns:
        List of embedding vectors
    """
    print(f"  Generating embeddings for {len(texts)} texts...")
    
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "input": texts,
        "model": EMBEDDING_MODEL,
        "input_type": "passage",
        "encoding_format": "float",
        "truncate": "END",
    }
    
    with httpx.Client(timeout=60.0) as client:
        response = client.post(NIM_ENDPOINT, headers=headers, json=payload)
        response.raise_for_status()
        
    result = response.json()
    embeddings = [item["embedding"] for item in result["data"]]
    
    print(f"  Generated {len(embeddings)} embeddings (dim={len(embeddings[0])})")
    return embeddings


def create_milvus_collection():
    """Create the product_catalog collection in Milvus."""
    from pymilvus import (
        connections,
        Collection,
        CollectionSchema,
        FieldSchema,
        DataType,
        utility,
    )
    
    print(f"\n1. Connecting to Milvus at {MILVUS_URI}...")
    
    # Parse URI for host/port
    uri = MILVUS_URI.replace("http://", "").replace("https://", "")
    host, port = uri.split(":")
    
    connections.connect(alias="default", host=host, port=port)
    print("  Connected successfully")
    
    # Drop existing collection if exists
    if utility.has_collection(COLLECTION_NAME):
        print(f"\n2. Dropping existing collection '{COLLECTION_NAME}'...")
        utility.drop_collection(COLLECTION_NAME)
        print("  Collection dropped")
    else:
        print(f"\n2. Collection '{COLLECTION_NAME}' does not exist, will create new")
    
    # Define collection schema
    print(f"\n3. Creating collection '{COLLECTION_NAME}'...")
    
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, max_length=100),
        FieldSchema(name="sku", dtype=DataType.VARCHAR, max_length=50),
        FieldSchema(name="name", dtype=DataType.VARCHAR, max_length=200),
        FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=100),
        FieldSchema(name="subcategory", dtype=DataType.VARCHAR, max_length=100),
        FieldSchema(name="price_cents", dtype=DataType.INT64),
        FieldSchema(name="stock_count", dtype=DataType.INT64),
        # NAT milvus_retriever expects "text" as the default content field
        FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=2000),
        FieldSchema(name="attributes_json", dtype=DataType.VARCHAR, max_length=1000),
        # NAT milvus_retriever expects "vector" as the default vector field
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="Product catalog for ARAG recommendation agent",
    )
    
    collection = Collection(name=COLLECTION_NAME, schema=schema)
    print(f"  Collection created with {len(fields)} fields")
    
    # Create index on embedding field for vector search
    # NAT milvus_retriever defaults to L2 (Euclidean) metric type
    print("\n4. Creating vector index...")
    index_params = {
        "metric_type": "L2",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 128},
    }
    collection.create_index(field_name="vector", index_params=index_params)
    print("  Vector index created (IVF_FLAT, L2)")
    
    return collection


def seed_products(collection: Any):
    """Generate embeddings and insert products into Milvus."""
    print("\n5. Preparing product data...")
    
    # Create text for embedding - combine name + description + attributes
    embedding_texts = []
    for product in PRODUCTS:
        text = f"{product['name']}. {product['description']} Category: {product['category']}. Attributes: {', '.join(product['attributes'])}"
        embedding_texts.append(text)
    
    print(f"  Prepared {len(embedding_texts)} product texts for embedding")
    
    # Generate embeddings
    print("\n6. Generating embeddings via NVIDIA NIM API...")
    embeddings = get_embeddings(embedding_texts)
    
    # Prepare data for insertion
    print("\n7. Inserting products into Milvus...")
    
    data = [
        [p["id"] for p in PRODUCTS],
        [p["sku"] for p in PRODUCTS],
        [p["name"] for p in PRODUCTS],
        [p["category"] for p in PRODUCTS],
        [p["subcategory"] for p in PRODUCTS],
        [p["price_cents"] for p in PRODUCTS],
        [p["stock_count"] for p in PRODUCTS],
        # Use "text" field (maps to product description) for NAT retriever compatibility
        [p["description"] for p in PRODUCTS],
        [json.dumps(p["attributes"]) for p in PRODUCTS],
        embeddings,
    ]
    
    collection.insert(data)
    print(f"  Inserted {len(PRODUCTS)} products")
    
    # Load collection into memory for searching
    print("\n8. Loading collection into memory...")
    collection.load()
    print("  Collection loaded and ready for queries")
    
    return len(PRODUCTS)


def verify_collection(collection: Any):
    """Verify the collection by running a test query."""
    print("\n9. Running verification query...")
    
    # Generate embedding for a test query
    test_query = "casual pants to wear with a t-shirt"
    query_embedding = get_embeddings([test_query])[0]
    
    # Search using L2 metric (matches NAT default)
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    
    results = collection.search(
        data=[query_embedding],
        anns_field="vector",
        param=search_params,
        limit=5,
        output_fields=["id", "name", "category", "text"],
    )
    
    print(f"\n  Test query: '{test_query}'")
    print("  Top 5 results:")
    for i, hit in enumerate(results[0]):
        print(f"    {i+1}. {hit.entity.get('name')} ({hit.entity.get('category')}) - score: {hit.score:.4f}")
    
    return True


def main():
    """Main entry point."""
    print("=" * 60)
    print("MILVUS PRODUCT CATALOG SEEDER")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  Milvus URI: {MILVUS_URI}")
    print(f"  Collection: {COLLECTION_NAME}")
    print(f"  Embedding Model: {EMBEDDING_MODEL}")
    print(f"  Embedding Dimension: {EMBEDDING_DIM}")
    print(f"  Products to seed: {len(PRODUCTS)}")
    
    try:
        # Create collection
        collection = create_milvus_collection()
        
        # Seed products with embeddings
        count = seed_products(collection)
        
        # Verify with test query
        verify_collection(collection)
        
        print("\n" + "=" * 60)
        print(f"SUCCESS: Seeded {count} products into Milvus")
        print("=" * 60)
        print("\nThe recommendation agent can now retrieve real products!")
        print("Start the agent with:")
        print("  nat serve --config_file configs/recommendation.yml --port 8004")
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

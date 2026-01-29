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

import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx

# Add project root to path for shared imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from src.data.product_catalog import PRODUCTS

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
        Collection,
        CollectionSchema,
        DataType,
        FieldSchema,
        connections,
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
        print(
            f"    {i + 1}. {hit.entity.get('name')} ({hit.entity.get('category')}) - score: {hit.score:.4f}"
        )

    return True


def main():
    """Main entry point."""
    print("=" * 60)
    print("MILVUS PRODUCT CATALOG SEEDER")
    print("=" * 60)
    print("\nConfiguration:")
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

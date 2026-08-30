#!/usr/bin/env python3
"""
Seed AlloyDB AI (pgvector + ScaNN) with Product Catalog Embeddings.

Mirrors the behavior of `seed_milvus.py` but targets AlloyDB:
- Connects via psycopg (Postgres) + pgvector adapter.
- Generates 1024-dim embeddings via hosted NIM (nv-embedqa-e5-v5).
- TRUNCATEs and re-inserts all products (idempotent).
- Creates the ScaNN index AFTER data is loaded (AlloyDB requirement).
- Verifies with a vector similarity query.

Local validation usage:
    cd Retail-Agentic-Commerce/src/agents
    source .venv/bin/activate    # or your venv
    pip install "psycopg[binary]" pgvector httpx

    export NVIDIA_API_KEY=nvapi-...
    export ALLOYDB_HOST=<public_ip>
    export ALLOYDB_PASSWORD=$(cat ../../../.alloydb_password)
    python scripts/seed_alloydb.py

Environment Variables:
    NVIDIA_API_KEY        - Required for hosted NIM embeddings
    ALLOYDB_HOST          - AlloyDB instance public IP
    ALLOYDB_PORT          - Default: 5432
    ALLOYDB_DATABASE      - Default: catalog_vectors
    ALLOYDB_USER          - Default: postgres
    ALLOYDB_PASSWORD      - Postgres password for ALLOYDB_USER
    ALLOYDB_SSLMODE       - Default: require
    NIM_EMBED_BASE_URL    - Default: https://integrate.api.nvidia.com/v1
    NIM_EMBED_MODEL_NAME  - Default: nvidia/nv-embedqa-e5-v5
    SCANN_NUM_LEAVES      - Default: 50
    BATCH_SIZE            - Embedding batch size, default: 32
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx
import psycopg
from pgvector.psycopg import register_vector

try:
    sys.path.insert(0, "/app")
    from src.data.product_catalog import PRODUCTS
except ImportError:
    project_root = Path(__file__).parent.parent.parent.parent
    sys.path.insert(0, str(project_root))
    from src.data.product_catalog import PRODUCTS

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
NIM_EMBED_BASE_URL = os.environ.get(
    "NIM_EMBED_BASE_URL", "https://integrate.api.nvidia.com/v1"
)
EMBEDDING_MODEL = os.environ.get("NIM_EMBED_MODEL_NAME", "nvidia/nv-embedqa-e5-v5")
EMBED_API_URL = f"{NIM_EMBED_BASE_URL}/embeddings"
EMBEDDING_DIM = 1024

ALLOYDB_HOST = os.environ.get("ALLOYDB_HOST", "")
ALLOYDB_PORT = os.environ.get("ALLOYDB_PORT", "5432")
ALLOYDB_DATABASE = os.environ.get("ALLOYDB_DATABASE", "catalog_vectors")
ALLOYDB_USER = os.environ.get("ALLOYDB_USER", "postgres")
ALLOYDB_PASSWORD = os.environ.get("ALLOYDB_PASSWORD", "")
ALLOYDB_SSLMODE = os.environ.get("ALLOYDB_SSLMODE", "require")

SCANN_NUM_LEAVES = int(os.environ.get("SCANN_NUM_LEAVES", "50"))
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "32"))


def conninfo() -> str:
    return (
        f"host={ALLOYDB_HOST} port={ALLOYDB_PORT} dbname={ALLOYDB_DATABASE} "
        f"user={ALLOYDB_USER} password={ALLOYDB_PASSWORD} sslmode={ALLOYDB_SSLMODE}"
    )


def embed_batch(texts: list[str]) -> list[list[float]]:
    headers = {"Content-Type": "application/json"}
    if NVIDIA_API_KEY:
        headers["Authorization"] = f"Bearer {NVIDIA_API_KEY}"
    payload = {
        "input": texts,
        "model": EMBEDDING_MODEL,
        "input_type": "passage",
        "encoding_format": "float",
        "truncate": "END",
    }
    with httpx.Client(timeout=120.0) as client:
        resp = client.post(EMBED_API_URL, headers=headers, json=payload)
        resp.raise_for_status()
    data = resp.json()["data"]
    return [item["embedding"] for item in data]


def get_embeddings(texts: list[str]) -> list[list[float]]:
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH_SIZE):
        chunk = texts[i : i + BATCH_SIZE]
        print(
            f"  Embedding batch {i // BATCH_SIZE + 1}: "
            f"{len(chunk)} texts (offset {i})"
        )
        out.extend(embed_batch(chunk))
    return out


def build_rows() -> tuple[list[str], list[tuple]]:
    embedding_texts = []
    for p in PRODUCTS:
        attrs = ", ".join(p["attributes"])
        embedding_texts.append(
            f"{p['name']}. {p['description']} "
            f"Category: {p['category']}. Attributes: {attrs}"
        )

    embeddings = get_embeddings(embedding_texts)
    print(
        f"  Generated {len(embeddings)} embeddings "
        f"(dim={len(embeddings[0]) if embeddings else 0})"
    )

    rows: list[tuple] = []
    for p, vec in zip(PRODUCTS, embeddings, strict=True):
        rows.append(
            (
                p["id"],
                p["sku"],
                p["name"],
                p.get("category"),
                p.get("subcategory"),
                p.get("price_cents"),
                p.get("stock_count"),
                p["description"],
                json.dumps(p.get("attributes", [])),
                vec,
            )
        )
    return embedding_texts, rows


def seed():
    print("=" * 60)
    print("ALLOYDB PRODUCT CATALOG SEEDER")
    print("=" * 60)
    print(f"  Host:     {ALLOYDB_HOST}:{ALLOYDB_PORT}")
    print(f"  Database: {ALLOYDB_DATABASE}")
    print(f"  User:     {ALLOYDB_USER}")
    print(f"  Embed:    {EMBEDDING_MODEL} via {NIM_EMBED_BASE_URL}")
    print(f"  Products: {len(PRODUCTS)}")

    if not NVIDIA_API_KEY:
        print("\nERROR: NVIDIA_API_KEY is required")
        sys.exit(1)
    if not ALLOYDB_HOST or not ALLOYDB_PASSWORD:
        print("\nERROR: ALLOYDB_HOST and ALLOYDB_PASSWORD are required")
        sys.exit(1)

    print("\n1. Generating embeddings via hosted NIM...")
    _, rows = build_rows()

    print("\n2. Connecting to AlloyDB...")
    with psycopg.connect(conninfo()) as conn:
        register_vector(conn)
        with conn.cursor() as cur:
            print("\n3. TRUNCATEing products table (idempotent re-seed)...")
            cur.execute("TRUNCATE TABLE products")

            print("\n4. Dropping existing ScaNN index if present...")
            cur.execute("DROP INDEX IF EXISTS products_embedding_scann")

            print(f"\n5. INSERTing {len(rows)} products...")
            cur.executemany(
                """
                INSERT INTO products (
                    id, sku, name, category, subcategory,
                    price_cents, stock_count, text, attributes_json, embedding
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
                """,
                rows,
            )

            print(
                f"\n6. Creating ScaNN index "
                f"(num_leaves={SCANN_NUM_LEAVES}, cosine)..."
            )
            cur.execute(
                f"""
                CREATE INDEX products_embedding_scann
                    ON products
                    USING scann (embedding cosine)
                    WITH (num_leaves = {SCANN_NUM_LEAVES})
                """
            )

            print("\n7. ANALYZE products...")
            cur.execute("ANALYZE products")

        conn.commit()

        print("\n8. Verifying with a sample vector query...")
        test_query = "casual pants to wear with a t-shirt"
        query_vec = embed_batch([test_query])[0]
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, category,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM products
                ORDER BY embedding <=> %s::vector
                LIMIT 5
                """,
                (query_vec, query_vec),
            )
            rows = cur.fetchall()

        print(f"\n   Test query: '{test_query}'")
        print("   Top 5 results:")
        for i, (pid, name, cat, sim) in enumerate(rows, start=1):
            print(f"     {i}. [{pid}] {name} ({cat}) sim={sim:.4f}")

    print("\n" + "=" * 60)
    print(f"SUCCESS: Seeded {len(PRODUCTS)} products into AlloyDB")
    print("=" * 60)


if __name__ == "__main__":
    try:
        seed()
    except Exception as exc:
        print(f"\nERROR: {exc}")
        import traceback

        traceback.print_exc()
        sys.exit(1)

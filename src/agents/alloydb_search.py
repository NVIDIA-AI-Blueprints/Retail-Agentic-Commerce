"""AlloyDB AI vector search NAT function.

Registers a NAT function ``_type: alloydb_search`` that:

1. Accepts a ``query`` string from a tool-calling agent.
2. Embeds it via hosted NIM (or a NIM-compatible endpoint).
3. Runs an ANN cosine query against AlloyDB AI (pgvector + ScaNN).
4. Returns a JSON document with the top-k matches.

This provides an optional AlloyDB-backed search path for
``configs/search-alloydb.yml`` while leaving the default Milvus-backed
``configs/search.yml`` unchanged. It calls the embedder endpoint directly
rather than going through NAT's embedder abstraction, which keeps the
dependency surface small and matches what ``scripts/seed_alloydb.py`` already
does.

Connection modes:

* Password auth (``use_iam_auth=False``, default) — direct psycopg connection.
  Used for local testing against AlloyDB public IP.
* IAM auth (``use_iam_auth=True``) — google-cloud-alloydb-connector with the
  Cloud Run service account's identity. Used for Cloud Run deployment.

Required env vars at runtime (resolved via ``${...}`` in YAML or read here):

* ``NVIDIA_API_KEY`` — for hosted NIM embeddings.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx
from nat.builder.builder import Builder
from nat.builder.framework_enum import LLMFrameworkEnum
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig
from pydantic import Field

logger = logging.getLogger(__name__)


class AlloyDBSearchConfig(FunctionBaseConfig, name="alloydb_search"):
    """Configuration for the AlloyDB AI vector search function."""

    host: str | None = Field(
        default=None,
        description=(
            "AlloyDB instance host (public IP). Required when use_iam_auth=false; "
            "ignored when use_iam_auth=true (Connector uses alloydb_instance_uri)."
        ),
    )
    port: int = Field(default=5432, description="AlloyDB Postgres port.")
    database: str = Field(
        default="catalog_vectors", description="AlloyDB database name."
    )
    user: str = Field(default="postgres", description="Database user.")
    password: str | None = Field(
        default=None,
        description="Database password (ignored when use_iam_auth=true).",
    )
    sslmode: str = Field(default="require", description="psycopg sslmode.")
    table: str = Field(default="products", description="Vector-indexed table name.")
    embedding_column: str = Field(
        default="embedding", description="Vector column name in the table."
    )
    top_k: int = Field(default=10, ge=1, le=100, description="Top-k matches.")
    topic: str = Field(
        default="Search product catalog for items matching the user query",
        description="Tool description shown to the agent LLM.",
    )

    embedding_base_url: str = Field(
        default="https://integrate.api.nvidia.com/v1",
        description="OpenAI-compatible embeddings base URL (NIM).",
    )
    embedding_model_name: str = Field(
        default="nvidia/nv-embedqa-e5-v5",
        description="Embedding model identifier.",
    )

    use_iam_auth: bool = Field(
        default=False,
        description=(
            "If true, connect via google-cloud-alloydb-connector with IAM auth. "
            "Set this for Cloud Run; ``alloydb_instance_uri`` must be provided."
        ),
    )
    alloydb_instance_uri: str | None = Field(
        default=None,
        description=(
            "AlloyDB instance URI in the form "
            "projects/PROJECT/locations/REGION/clusters/CLUSTER/instances/INSTANCE. "
            "Required when use_iam_auth=true."
        ),
    )


def _embed_query(
    *, base_url: str, model: str, api_key: str, query: str
) -> list[float]:
    """Call the OpenAI-compatible embeddings endpoint and return one vector."""
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    payload = {
        "input": [query],
        "model": model,
        "input_type": "query",
        "encoding_format": "float",
        "truncate": "END",
    }
    with httpx.Client(timeout=60.0) as client:
        resp = client.post(f"{base_url}/embeddings", headers=headers, json=payload)
        resp.raise_for_status()
    return resp.json()["data"][0]["embedding"]


def _build_password_conn(config: AlloyDBSearchConfig):
    """Open a psycopg connection using password auth and return it.

    Caller is responsible for closing.
    """
    import psycopg
    from pgvector.psycopg import register_vector

    if not config.host:
        raise ValueError(
            "ALLOYDB_HOST (or alloydb_search.host) must be set when "
            "use_iam_auth=false"
        )
    if not config.password:
        raise ValueError(
            "ALLOYDB_PASSWORD (or alloydb_search.password) must be set when "
            "use_iam_auth=false"
        )
    conninfo = (
        f"host={config.host} port={config.port} dbname={config.database} "
        f"user={config.user} password={config.password} sslmode={config.sslmode}"
    )
    conn = psycopg.connect(conninfo)
    register_vector(conn)
    return conn


def _build_iam_conn(config: AlloyDBSearchConfig):
    """Open a connection using google-cloud-alloydb-connector + IAM auth."""
    from google.cloud.alloydb.connector import Connector, IPTypes  # type: ignore[import-not-found]
    from pgvector.psycopg import register_vector

    if not config.alloydb_instance_uri:
        raise ValueError("alloydb_instance_uri is required when use_iam_auth=True")

    connector = Connector()
    conn = connector.connect(
        config.alloydb_instance_uri,
        "psycopg",
        user=config.user,
        db=config.database,
        ip_type=IPTypes.PUBLIC,
        enable_iam_auth=True,
    )
    register_vector(conn)
    return conn


def _run_query(
    *, conn, table: str, embedding_column: str, query_vec: list[float], top_k: int
) -> list[dict[str, Any]]:
    sql = (
        f"SELECT id, sku, name, category, subcategory, "
        f"price_cents, stock_count, text, attributes_json, "
        f"1 - ({embedding_column} <=> %s::vector) AS similarity "
        f"FROM {table} "
        f"ORDER BY {embedding_column} <=> %s::vector "
        f"LIMIT %s"
    )
    with conn.cursor() as cur:
        cur.execute(sql, (query_vec, query_vec, top_k))
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
    return [dict(zip(cols, row, strict=True)) for row in rows]


@register_function(
    config_type=AlloyDBSearchConfig, framework_wrappers=[LLMFrameworkEnum.LANGCHAIN]
)
async def alloydb_search_function(config: AlloyDBSearchConfig, builder: Builder):
    """Yield a search function bound to an AlloyDB AI cosine vector index."""

    _ = builder
    api_key = os.environ.get("NVIDIA_API_KEY", "")

    async def search_products(query: str) -> str:
        """Search the product catalog with semantic vector similarity."""
        if not query or not query.strip():
            return json.dumps({"results": []})

        query_vec = _embed_query(
            base_url=config.embedding_base_url,
            model=config.embedding_model_name,
            api_key=api_key,
            query=query.strip(),
        )

        if config.use_iam_auth:
            conn = _build_iam_conn(config)
        else:
            conn = _build_password_conn(config)

        try:
            rows = _run_query(
                conn=conn,
                table=config.table,
                embedding_column=config.embedding_column,
                query_vec=query_vec,
                top_k=config.top_k,
            )
        finally:
            conn.close()

        results = [
            {
                "product_id": str(r.get("id", "")),
                "product_name": str(r.get("name", "")),
                "category": str(r.get("category") or ""),
                "subcategory": str(r.get("subcategory") or ""),
                "price_cents": int(r["price_cents"])
                if r.get("price_cents") is not None
                else None,
                "stock_count": int(r["stock_count"])
                if r.get("stock_count") is not None
                else None,
                "description": str(r.get("text") or ""),
                "score": float(r.get("similarity", 0.0)),
            }
            for r in rows
        ]

        logger.info(
            "alloydb_search: query=%r returned=%d top_score=%.4f",
            query[:80],
            len(results),
            results[0]["score"] if results else 0.0,
        )
        return json.dumps({"results": results})

    yield FunctionInfo.from_fn(search_products, description=config.topic)

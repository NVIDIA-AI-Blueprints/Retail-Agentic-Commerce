# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Catalog retrieval shared by the search and recommendation workflows."""

import json
from typing import Any

from langchain_core.embeddings import Embeddings
from langchain_core.tools import BaseTool, StructuredTool
from opentelemetry import trace
from opentelemetry.trace import StatusCode
from pydantic import BaseModel, Field
from pymilvus import AsyncMilvusClient

from .models import retry_nim


class ProductSearchInput(BaseModel):
    query: str = Field(
        description="The query to be searched in the configured data store"
    )


class CatalogRetriever:
    def __init__(
        self,
        embedder: Embeddings,
        milvus: AsyncMilvusClient,
        collection_name: str = "product_catalog",
        top_k: int = 10,
    ) -> None:
        self.embedder = embedder
        self.milvus = milvus
        self.collection_name = collection_name
        self.top_k = top_k

    async def retrieve(self, query: str) -> list[dict[str, Any]]:
        """Find the closest documents and retain the original Milvus L2 distances."""
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span(
            "product_catalog.retrieve",
            attributes={"openinference.span.kind": "RETRIEVER"},
            record_exception=False,
            set_status_on_exception=False,
        ) as span:
            try:
                # Keep the same catalog fields and top-k ordering at both call sites.
                schema = await self.milvus.describe_collection(self.collection_name)
                fields = [field["name"] for field in schema["fields"]]
                if "text" not in fields or "vector" not in fields:
                    raise ValueError(
                        "The catalog schema requires text and vector fields"
                    )
                vector = await retry_nim(lambda: self.embedder.aembed_query(query))
                hits = await self.milvus.search(
                    self.collection_name,
                    data=[vector],
                    limit=self.top_k,
                    anns_field="vector",
                    output_fields=[field for field in fields if field != "vector"],
                    search_params={"metric_type": "L2"},
                )
                documents = []
                for hit in hits[0]:
                    metadata = dict(hit["entity"])
                    content = metadata.pop("text")
                    metadata["distance"] = hit["distance"]
                    documents.append(
                        {
                            "page_content": content,
                            "metadata": metadata,
                            "document_id": str(hit["id"]),
                        }
                    )
                span.set_attribute("catalog.result_count", len(documents))
                return documents
            except Exception:
                span.set_status(StatusCode.ERROR)
                raise

    def product_search_tool(self, topic: str) -> BaseTool:
        """Expose the existing search tool schema and JSON document envelope."""

        async def search(query: str) -> str:
            return json.dumps({"results": await self.retrieve(query)})

        return StructuredTool.from_function(
            coroutine=search,
            name="product_search",
            description=(
                f"Retrieve document chunks related to {topic} "
                "which can be used to answer the provided question."
            ),
            args_schema=ProductSearchInput,
        )

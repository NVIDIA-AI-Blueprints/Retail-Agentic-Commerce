# SPDX-FileCopyrightText: Copyright (c) 2025-2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""ARAG custom components.

Only three components require custom Python code:

1. **rag_retriever** — retrieval adapter that builds query context and normalizes
   retriever documents to ARAG candidate items.
2. **text_function_adapter** — typed adapter that lets NAT ``chat_completion``
   steps participate in string-based control-flow chains.
3. **output_contract_guard** — deterministic schema guard for final output.

All recommendation semantics (NLI scoring, context synthesis, ranking) are
performed by LLM agents declared in ``configs/recommendation.yml``.
"""

import json
import logging
from typing import Any

from nat.builder.builder import Builder
from nat.builder.framework_enum import LLMFrameworkEnum
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.component_ref import FunctionRef
from nat.data_models.function import FunctionBaseConfig
from pydantic import Field

logger = logging.getLogger(__name__)


def _to_dict(value: Any) -> dict[str, Any] | None:
    """Best-effort conversion to a dictionary."""
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        dumped = value.model_dump()
        if isinstance(dumped, dict):
            return dumped
    if isinstance(value, str):
        try:
            loaded = json.loads(value)
        except json.JSONDecodeError:
            return None
        if isinstance(loaded, dict):
            return loaded
    return None


def _as_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _as_int(value: Any) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value))
        except ValueError:
            return 0
    return 0


def _dict_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _clean_str_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()]


# =============================================================================
# RAG Retriever — adapter around configured nat_retriever function
# =============================================================================


class RAGRetrieverConfig(FunctionBaseConfig, name="rag_retriever"):
    """Configuration for the RAG retriever adapter function."""

    top_k: int = Field(default=10, description="Number of candidate items to retrieve.")
    retrieval_tool_name: FunctionRef = Field(
        default=FunctionRef("product_search"),
        description="Retriever tool to execute (typically a nat_retriever function).",
    )


@register_function(
    config_type=RAGRetrieverConfig, framework_wrappers=[LLMFrameworkEnum.LANGCHAIN]
)
async def rag_retriever_function(config: RAGRetrieverConfig, builder: Builder):
    """Retrieve an initial recall set of candidate items via RAG."""

    retriever_tool = await builder.get_function(config.retrieval_tool_name)
    description_max_chars = 64

    def _parse_payload(
        input_message: str,
    ) -> tuple[str, str, list[dict[str, Any]], dict[str, Any]]:
        """Parse recommendation input and derive user/search query strings."""
        parsed = _to_dict(input_message) or {}
        query_value = _as_str(parsed.get("query") or parsed.get("user_query"))
        raw_query = query_value or input_message.strip() or "product recommendations"
        explicit_query_provided = bool(query_value)
        cart_items = _dict_list(parsed.get("cart_items"))

        session_value = _to_dict(parsed.get("session_context")) or {}
        browse_history = _clean_str_list(session_value.get("browse_history"))
        session_context = {"browse_history": browse_history} if browse_history else {}

        cart_names = [
            _as_str(item.get("name"))
            for item in cart_items
            if _as_str(item.get("name"))
        ]
        cart_categories = sorted(
            {
                _as_str(item.get("category"))
                for item in cart_items
                if _as_str(item.get("category"))
            }
        )

        query_parts: list[str] = []
        if cart_items or session_context:
            if cart_names:
                query_parts.append(
                    f"Find complementary products for: {', '.join(cart_names)}."
                )
            if cart_categories:
                query_parts.append(f"Cart categories: {', '.join(cart_categories)}.")
            if browse_history:
                query_parts.append(
                    f"Recent browsing themes: {', '.join(browse_history)}."
                )
            query_parts.append("Find complementary products not already in the cart.")

        search_query = " ".join(query_parts).strip() if query_parts else raw_query
        user_query = raw_query if explicit_query_provided else search_query
        return user_query, search_query, cart_items, session_context

    def _extract_documents(raw_output: Any) -> list[dict[str, Any]]:
        """Extract retriever documents from multiple output shapes."""
        output_dict = _to_dict(raw_output) or {}
        results = output_dict.get("results")
        if isinstance(results, list):
            documents: list[dict[str, Any]] = []
            for item in results:
                item_dict = _to_dict(item)
                if item_dict is not None:
                    documents.append(item_dict)
            return documents
        return []

    def _normalize_candidate(document: dict[str, Any]) -> dict[str, Any]:
        """Normalize a retrieved document to ARAG candidate schema."""
        metadata = document.get("metadata", {})
        if not isinstance(metadata, dict):
            metadata = {}

        document_id = document.get("document_id")
        product_id = str(
            metadata.get("id") or metadata.get("product_id") or document_id or ""
        )
        product_name = str(
            metadata.get("name")
            or metadata.get("product_name")
            or metadata.get("title")
            or product_id
        )
        description = str(
            document.get("page_content") or metadata.get("description") or ""
        )
        description = " ".join(description.split())
        if len(description) > description_max_chars:
            description = description[: description_max_chars - 3].rstrip() + "..."

        return {
            "product_id": product_id,
            "product_name": product_name,
            "category": str(metadata.get("category") or ""),
            "description": description,
        }

    async def retrieve_candidates(input_message: str) -> str:
        """Retrieve candidate items from the configured nat_retriever tool."""
        user_query, search_query, cart_items, session_context = _parse_payload(
            input_message
        )

        raw_retriever_output = await retriever_tool.acall_invoke(query=search_query)
        candidates = [
            _normalize_candidate(document)
            for document in _extract_documents(raw_retriever_output)
        ]

        retrieval_result = {
            "user_query": user_query,
            "search_query": search_query,
            "cart_items": cart_items,
            "session_context": session_context,
            "candidates": candidates[: config.top_k],
        }

        logger.info(
            "RAG Retriever: retrieved %d candidates for query: %s",
            len(retrieval_result["candidates"]),
            search_query,
        )
        return json.dumps(retrieval_result)

    yield FunctionInfo.from_fn(
        retrieve_candidates, description="Retrieve candidate items using RAG"
    )


# =============================================================================
# Text Function Adapter — typed wrapper for string-based control flow
# =============================================================================


class TextFunctionAdapterConfig(FunctionBaseConfig, name="text_function_adapter"):
    """Configuration for adapting a configured NAT function to text I/O."""

    function_name: FunctionRef = Field(
        description="Configured function to invoke with input_message text.",
    )
    description: str = Field(
        default="Invoke a configured function with text input and return text output.",
        description="Description of this function's use.",
    )


@register_function(
    config_type=TextFunctionAdapterConfig,
    framework_wrappers=[LLMFrameworkEnum.LANGCHAIN],
)
async def text_function_adapter(config: TextFunctionAdapterConfig, builder: Builder):
    """Expose a configured function as a string-in/string-out NAT function."""

    target_function = await builder.get_function(config.function_name)

    async def invoke_text(input_message: str) -> str:
        """Invoke the target function using NAT's input_message convention."""
        result = await target_function.acall_invoke(input_message=input_message)
        if isinstance(result, str):
            return result
        if hasattr(result, "model_dump"):
            dumped = result.model_dump()
            return json.dumps(dumped, default=str)
        return str(result)

    yield FunctionInfo.from_fn(invoke_text, description=config.description)


# =============================================================================
# Output Contract Guard — deterministic contract validation only
# =============================================================================


class OutputContractGuardConfig(FunctionBaseConfig, name="output_contract_guard"):
    """Configuration for final recommendation output contract validation."""

    max_recommendations: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Maximum number of recommendations to keep in final output.",
    )
    description: str = Field(
        default="Validate and normalize recommendation output contract.",
        description="Description of this function's use.",
    )


@register_function(
    config_type=OutputContractGuardConfig,
    framework_wrappers=[LLMFrameworkEnum.LANGCHAIN],
)
async def output_contract_guard_function(
    config: OutputContractGuardConfig, builder: Builder
):
    """Validate and normalize final recommendation payload shape."""

    def _normalize_recommendations(raw_value: Any) -> list[dict[str, Any]]:
        staged: list[dict[str, Any]] = []

        items = raw_value if isinstance(raw_value, list) else []
        for source_index, item in enumerate(items):
            item_dict = _to_dict(item)
            if item_dict is None:
                continue

            product_id = _as_str(item_dict.get("product_id"))
            product_name = _as_str(item_dict.get("product_name"))
            if not product_id or not product_name:
                continue

            source_rank = _as_int(item_dict.get("rank"))
            if source_rank <= 0:
                source_rank = source_index + 1

            staged.append(
                {
                    "product_id": product_id,
                    "product_name": product_name,
                    "reasoning": _as_str(item_dict.get("reasoning"))
                    or "Relevant to the shopper's current intent.",
                    "_source_rank": source_rank,
                    "_source_index": source_index,
                }
            )

        staged.sort(key=lambda item: (item["_source_rank"], item["_source_index"]))
        selected = staged[: config.max_recommendations]

        normalized: list[dict[str, Any]] = []
        for rank, item in enumerate(selected, start=1):
            normalized.append(
                {
                    "product_id": item["product_id"],
                    "product_name": item["product_name"],
                    "rank": rank,
                    "reasoning": item["reasoning"],
                }
            )

        return normalized

    async def guard_output(input_message: str) -> str:
        """Return normalized output with strict contract enforcement."""
        payload = _to_dict(input_message) or {}

        recommendations = _normalize_recommendations(payload.get("recommendations"))
        pipeline_trace = _to_dict(payload.get("pipeline_trace")) or {}

        candidates_received = _as_int(
            pipeline_trace.get(
                "candidates_received", payload.get("candidates_received")
            )
        )
        after_alignment_filter = _as_int(
            pipeline_trace.get(
                "after_alignment_filter", payload.get("after_alignment_filter")
            )
        )

        result: dict[str, Any] = {
            "recommendations": recommendations,
            "user_intent": _as_str(payload.get("user_intent")),
            "pipeline_trace": {
                "candidates_received": max(candidates_received, 0),
                "after_alignment_filter": max(after_alignment_filter, 0),
                "final_ranked": len(recommendations),
            },
        }

        if not recommendations:
            message = _as_str(payload.get("message"))
            result["message"] = (
                message or "No suitable cross-sell recommendations for current cart"
            )

        return json.dumps(result)

    _ = builder
    yield FunctionInfo.from_fn(guard_output, description=config.description)

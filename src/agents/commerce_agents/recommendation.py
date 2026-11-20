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

"""ARAG recommendation pipeline using concurrent analysis and a fixed stage order."""

import asyncio
import json
import logging
from collections.abc import Awaitable, Callable
from typing import Any, cast

logger = logging.getLogger(__name__)

type JsonObject = dict[str, Any]
type TextStage = Callable[[str], Awaitable[str]]
type Retriever = Callable[[str], Awaitable[list[JsonObject]]]

_DESCRIPTION_MAX_CHARS = 64
_NO_RECOMMENDATIONS = "No suitable cross-sell recommendations for current cart"


def _to_dict(value: object) -> JsonObject | None:
    """Parse a JSON object or pass through a dictionary."""
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    return cast(JsonObject, value) if isinstance(value, dict) else None


def _as_str(value: object) -> str:
    return str(value).strip() if value is not None else ""


def _as_int(value: object) -> int:
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value))
        except ValueError:
            return 0
    return 0


def _dict_list(value: object) -> list[JsonObject]:
    if not isinstance(value, list):
        return []
    return [
        cast(JsonObject, item)
        for item in cast(list[object], value)
        if isinstance(item, dict)
    ]


def _clean_str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [
        item.strip()
        for item in cast(list[object], value)
        if isinstance(item, str) and item.strip()
    ]


def _parse_payload(
    input_message: str,
) -> tuple[str, str, list[JsonObject], dict[str, list[str]]]:
    """Keep the user's query separate from the generated catalog search query."""
    parsed = _to_dict(input_message) or {}
    query_value = _as_str(parsed.get("query") or parsed.get("user_query"))
    raw_query = query_value or input_message.strip() or "product recommendations"
    cart_items = _dict_list(parsed.get("cart_items"))

    session_value = _to_dict(parsed.get("session_context")) or {}
    browse_history = _clean_str_list(session_value.get("browse_history"))
    session_context = {"browse_history": browse_history} if browse_history else {}

    cart_names = [
        _as_str(item.get("name")) for item in cart_items if _as_str(item.get("name"))
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
            query_parts.append(f"Recent browsing themes: {', '.join(browse_history)}.")
        query_parts.append("Find complementary products not already in the cart.")

    search_query = " ".join(query_parts).strip() if query_parts else raw_query
    user_query = raw_query if query_value else search_query
    return user_query, search_query, cart_items, session_context


def _normalize_candidate(document: JsonObject) -> dict[str, str]:
    """Map retriever metadata to the fields consumed by the model prompts."""
    raw_metadata = document.get("metadata")
    metadata = cast(JsonObject, raw_metadata) if isinstance(raw_metadata, dict) else {}
    product_id = str(
        metadata.get("id")
        or metadata.get("product_id")
        or document.get("document_id")
        or ""
    )
    product_name = str(
        metadata.get("name")
        or metadata.get("product_name")
        or metadata.get("title")
        or product_id
    )
    description = str(document.get("page_content") or metadata.get("description") or "")
    description = " ".join(description.split())
    if len(description) > _DESCRIPTION_MAX_CHARS:
        description = description[: _DESCRIPTION_MAX_CHARS - 3].rstrip() + "..."

    return {
        "product_id": product_id,
        "product_name": product_name,
        "category": str(metadata.get("category") or ""),
        "description": description,
    }


def _normalize_recommendations(
    raw_value: object, max_recommendations: int
) -> list[JsonObject]:
    staged: list[tuple[int, int, JsonObject]] = []

    if not isinstance(raw_value, list):
        return []
    for source_index, item in enumerate(cast(list[object], raw_value)):
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
            (
                source_rank,
                source_index,
                {
                    "product_id": product_id,
                    "product_name": product_name,
                    "reasoning": _as_str(item_dict.get("reasoning"))
                    or "Relevant to the shopper's current intent.",
                },
            )
        )

    staged.sort(key=lambda item: (item[0], item[1]))
    return [
        {
            "product_id": item["product_id"],
            "product_name": item["product_name"],
            "rank": rank,
            "reasoning": item["reasoning"],
        }
        for rank, (_, _, item) in enumerate(staged[:max_recommendations], start=1)
    ]


def _guard_output(output: str, max_recommendations: int) -> str:
    """Validate the response shape without reinterpreting recommendation choices."""
    payload = _to_dict(output) or {}
    raw_recommendations = payload.get("recommendations")
    recommendations = _normalize_recommendations(
        raw_recommendations, max_recommendations
    )
    pipeline_trace = _to_dict(payload.get("pipeline_trace")) or {}

    candidates_received = _as_int(
        pipeline_trace.get("candidates_received", payload.get("candidates_received"))
    )
    after_alignment_filter = _as_int(
        pipeline_trace.get(
            "after_alignment_filter", payload.get("after_alignment_filter")
        )
    )

    result: JsonObject = {
        "recommendations": recommendations,
        "user_intent": _as_str(payload.get("user_intent")),
        "pipeline_trace": {
            "candidates_received": max(candidates_received, 0),
            "after_alignment_filter": max(after_alignment_filter, 0),
            "final_ranked": len(recommendations),
        },
    }
    if not recommendations:
        result["message"] = _as_str(payload.get("message")) or _NO_RECOMMENDATIONS

    logger.info(
        "Recommendation output contract: parsed=%s raw=%d valid=%d "
        "candidates=%d filtered=%d",
        bool(payload),
        len(cast(list[object], raw_recommendations))
        if isinstance(raw_recommendations, list)
        else 0,
        len(recommendations),
        result["pipeline_trace"]["candidates_received"],
        result["pipeline_trace"]["after_alignment_filter"],
    )
    return json.dumps(result)


async def _labeled_analysis(name: str, stage: TextStage, payload: str) -> str:
    try:
        output = await stage(payload)
    except Exception as exc:
        # Keep the sibling branch usable and keep provider error details out of prompts.
        logger.exception("Recommendation branch %s failed", name)
        output = f"ERROR: {type(exc).__name__}"
    return f"{name}:\n{output}"


async def recommend(
    input_message: str,
    *,
    retrieve: Retriever,
    understand_user: TextStage,
    score_alignment: TextStage,
    summarize_context: TextStage,
    rank_items: TextStage,
    top_k: int = 10,
    max_recommendations: int = 3,
) -> str:
    """Retrieve candidates, run the four chat stages, and return the guarded JSON."""
    user_query, search_query, cart_items, session_context = _parse_payload(
        input_message
    )
    documents = await retrieve(search_query)
    candidates = [_normalize_candidate(document) for document in documents[:top_k]]
    logger.info("Retrieved %d recommendation candidates", len(candidates))
    retrieval_payload = json.dumps(
        {
            "user_query": user_query,
            "search_query": search_query,
            "cart_items": cart_items,
            "session_context": session_context,
            "candidates": candidates,
        }
    )

    understanding, alignment = await asyncio.gather(
        _labeled_analysis(
            "user_understanding_agent", understand_user, retrieval_payload
        ),
        _labeled_analysis("nli_agent", score_alignment, retrieval_payload),
    )
    summary = await summarize_context(f"{understanding}\n\n{alignment}")
    ranked = await rank_items(summary)
    return _guard_output(ranked, max_recommendations)

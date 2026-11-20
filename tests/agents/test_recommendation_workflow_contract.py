# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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

import asyncio
import json
from unittest.mock import AsyncMock

import pytest

from src.agents.commerce_agents.recommendation import recommend


@pytest.mark.asyncio
async def test_recommendation_runs_both_model_calls_before_context_summary() -> None:
    cart = [{"product_id": "cart-item", "name": "T-shirt", "category": "tops"}]
    input_message = json.dumps(
        {
            "user_query": "Complete my outfit",
            "cart_items": cart,
            "session_context": {
                "browse_history": [" weekend wear ", ""],
                "price_range_viewed": [1000, 5000],
            },
        }
    )
    documents = [
        {
            "document_id": f"product-{index}",
            "page_content": "very " * 20,
            "metadata": {"name": f"Product {index}", "category": "clothing"},
        }
        for index in range(12)
    ]
    retrieve = AsyncMock(return_value=documents)
    understanding_started = asyncio.Event()
    alignment_finished = asyncio.Event()
    understanding_finished = asyncio.Event()
    expected_query = (
        "Find complementary products for: T-shirt. Cart categories: tops. "
        "Recent browsing themes: weekend wear. "
        "Find complementary products not already in the cart."
    )
    expected_intent = '{"user_intent":"casual clothes"}'
    expected_alignment = '{"scored_candidates":[]}'
    expected_summary = '{"filtered_candidates":[]}'

    payloads: list[str] = []

    async def understand_user(payload: str) -> str:
        retrieve.assert_awaited_once_with(expected_query)
        payloads.append(payload)
        understanding_started.set()
        await alignment_finished.wait()
        understanding_finished.set()
        return expected_intent

    async def score_alignment(payload: str) -> str:
        await understanding_started.wait()
        payloads.append(payload)
        alignment_finished.set()
        return expected_alignment

    async def summarize_context(payload: str) -> str:
        assert understanding_finished.is_set()
        assert alignment_finished.is_set()
        assert payload == (
            f"user_understanding_agent:\n{expected_intent}\n\n"
            f"nli_agent:\n{expected_alignment}"
        )
        return expected_summary

    rank_items = AsyncMock(
        return_value=json.dumps(
            {
                "recommendations": [
                    {"product_id": "product-2", "product_name": "Product 2", "rank": 2},
                    {"product_id": "", "product_name": "Invalid entry", "rank": 1},
                    {"product_id": "product-0", "product_name": "Product 0", "rank": 1},
                ],
                "user_intent": "casual clothes",
                "pipeline_trace": {
                    "candidates_received": 10,
                    "after_alignment_filter": 2,
                    "final_ranked": 3,
                },
            }
        )
    )
    output = await asyncio.wait_for(
        recommend(
            input_message,
            retrieve=retrieve,
            understand_user=understand_user,
            score_alignment=score_alignment,
            summarize_context=summarize_context,
            rank_items=rank_items,
        ),
        timeout=2,
    )

    assert len(payloads) == 2
    assert payloads[0] == payloads[1]
    recall = json.loads(payloads[0])
    assert recall["user_query"] == "Complete my outfit"
    assert recall["search_query"] == expected_query
    assert recall["cart_items"] == cart
    assert recall["session_context"] == {"browse_history": ["weekend wear"]}
    assert len(recall["candidates"]) == 10
    assert recall["candidates"][0] == {
        "product_id": "product-0",
        "product_name": "Product 0",
        "category": "clothing",
        "description": ("very " * 12) + "v...",
    }
    rank_items.assert_awaited_once_with(expected_summary)
    result = json.loads(output)
    assert [
        (item["product_id"], item["rank"]) for item in result["recommendations"]
    ] == [
        ("product-0", 1),
        ("product-2", 2),
    ]
    assert result["pipeline_trace"] == {
        "candidates_received": 10,
        "after_alignment_filter": 2,
        "final_ranked": 2,
    }


@pytest.mark.asyncio
async def test_recommendation_continues_when_one_analysis_fails() -> None:
    summarize_context = AsyncMock(return_value='{"filtered_candidates":[]}')
    rank_items = AsyncMock(return_value="Invalid ranker JSON")
    output = await recommend(
        "Complement my T-shirt",
        retrieve=AsyncMock(return_value=[]),
        understand_user=AsyncMock(return_value='{"user_intent":"complete an outfit"}'),
        score_alignment=AsyncMock(side_effect=RuntimeError("provider unavailable")),
        summarize_context=summarize_context,
        rank_items=rank_items,
    )

    summarize_context.assert_awaited_once_with(
        'user_understanding_agent:\n{"user_intent":"complete an outfit"}\n\n'
        "nli_agent:\nERROR: RuntimeError"
    )
    rank_items.assert_awaited_once_with('{"filtered_candidates":[]}')
    assert json.loads(output) == {
        "recommendations": [],
        "user_intent": "",
        "pipeline_trace": {
            "candidates_received": 0,
            "after_alignment_filter": 0,
            "final_ranked": 0,
        },
        "message": "No suitable cross-sell recommendations for current cart",
    }

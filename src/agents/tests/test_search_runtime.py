# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Search loop and shared catalog tool regression tests."""

import asyncio
import json
from collections.abc import AsyncIterator, Sequence
from typing import Any
from unittest.mock import AsyncMock

import pytest
from langchain_core.callbacks import AsyncCallbackManagerForLLMRun
from langchain_core.embeddings import Embeddings
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage, ToolMessage
from langchain_core.outputs import ChatGenerationChunk, ChatResult
from langchain_core.utils.function_calling import convert_to_openai_tool
from pydantic import Field
from pymilvus import AsyncMilvusClient

from commerce_agents.retrieval import CatalogRetriever
from commerce_agents.search import build_search_workflow

type CatalogFixture = tuple[CatalogRetriever, AsyncMock, AsyncMock]


class StreamingModel(BaseChatModel):
    turns: list[list[AIMessageChunk]]
    requests: list[list[BaseMessage]] = Field(default_factory=list)

    @property
    def _llm_type(self) -> str:
        return "fixture"

    def bind_tools(self, tools: Sequence[Any], **kwargs: Any) -> BaseChatModel:
        return self

    def _generate(self, messages: list[BaseMessage], **kwargs: Any) -> ChatResult:
        raise AssertionError("Search must stream model turns")

    async def _astream(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: AsyncCallbackManagerForLLMRun | None = None,
        **kwargs: Any,
    ) -> AsyncIterator[ChatGenerationChunk]:
        self.requests.append(messages)
        for chunk in self.turns.pop(0):
            yield ChatGenerationChunk(message=chunk)


@pytest.fixture
def catalog() -> CatalogFixture:
    embeddings = AsyncMock(spec=Embeddings)
    embeddings.aembed_query.return_value = [0.25, 0.75]
    milvus = AsyncMock(spec=AsyncMilvusClient)
    milvus.describe_collection.return_value = {
        "fields": [{"name": name} for name in ("id", "name", "text", "vector")]
    }
    milvus.search.return_value = [
        [
            {
                "id": "prod_1",
                "distance": 0.125,
                "entity": {
                    "id": "prod_1",
                    "name": "Classic Cotton Tee",
                    "text": "Comfortable cotton T-shirt",
                },
            }
        ]
    ]
    return CatalogRetriever(embeddings, milvus), embeddings, milvus


def tool_call(call_id: str = "search_1") -> list[AIMessageChunk]:
    return [
        AIMessageChunk(
            content="",
            tool_call_chunks=[
                {
                    "name": "product_search",
                    "args": '{"query":',
                    "id": call_id,
                    "index": 0,
                }
            ],
        ),
        AIMessageChunk(
            content="",
            tool_call_chunks=[
                {"name": None, "args": '"cotton tee"}', "id": None, "index": 0}
            ],
        ),
    ]


def test_search_streams_tool_arguments_and_returns_a_grounded_answer(
    catalog: CatalogFixture,
) -> None:
    retriever, embeddings, milvus = catalog
    tool = retriever.product_search_tool(
        "Search product catalog for items matching the user query"
    )
    definition = convert_to_openai_tool(tool)["function"]
    assert definition == {
        "name": "product_search",
        "description": (
            "Retrieve document chunks related to Search product catalog for items "
            "matching the user query which can be used to answer the provided question."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "description": (
                        "The query to be searched in the configured data store"
                    ),
                    "type": "string",
                }
            },
            "required": ["query"],
        },
    }
    final = '{"results":[{"product_id":"prod_1","distance":0.125}]}'
    model = StreamingModel(turns=[tool_call(), [AIMessageChunk(content=final)]])
    run = build_search_workflow(model, tool, "Search the catalog.")

    result = asyncio.run(run('{"query":"cotton tee"}'))

    assert result == final
    embeddings.aembed_query.assert_awaited_once_with("cotton tee")
    milvus.search.assert_awaited_once_with(
        "product_catalog",
        data=[[0.25, 0.75]],
        limit=10,
        anns_field="vector",
        output_fields=["id", "name", "text"],
        search_params={"metric_type": "L2"},
    )
    _, _, requested_call, retrieved = model.requests[1]
    assert isinstance(requested_call, AIMessage)
    assert requested_call.additional_kwargs["tool_calls"][0]["id"] == "search_1"
    assert isinstance(retrieved, ToolMessage)
    assert retrieved.tool_call_id == "search_1"
    assert json.loads(str(retrieved.content)) == {
        "results": [
            {
                "document_id": "prod_1",
                "page_content": "Comfortable cotton T-shirt",
                "metadata": {
                    "id": "prod_1",
                    "name": "Classic Cotton Tee",
                    "distance": 0.125,
                },
            }
        ]
    }


@pytest.mark.parametrize(
    ("turn", "message"),
    [
        ([], "No response received from agent"),
        (
            [AIMessageChunk(content=" ")],
            "LLM returned an empty response (no content, no tool calls).",
        ),
        (
            [
                AIMessageChunk(
                    content="partial", response_metadata={"finish_reason": "length"}
                )
            ],
            "LLM output truncated (finish_reason='length').",
        ),
    ],
)
def test_search_surfaces_provider_failures(
    catalog: CatalogFixture, turn: list[AIMessageChunk], message: str
) -> None:
    retriever, _, _ = catalog
    model = StreamingModel(turns=[turn])
    run = build_search_workflow(
        model, retriever.product_search_tool("Search"), "Search."
    )
    with pytest.raises(RuntimeError) as error:
        asyncio.run(run("cotton tee"))
    assert str(error.value) == message


def test_search_bounds_tool_rounds(catalog: CatalogFixture) -> None:
    retriever, _, milvus = catalog
    model = StreamingModel(turns=[tool_call(str(i)) for i in range(3)])
    run = build_search_workflow(
        model, retriever.product_search_tool("Search"), "Search."
    )
    assert "could not produce a final answer within 2 iterations" in asyncio.run(
        run("cotton tee")
    )
    assert milvus.search.await_count == 2


def test_search_can_answer_after_two_tool_rounds(catalog: CatalogFixture) -> None:
    retriever, _, milvus = catalog
    answer = '{"results":[]}'
    model = StreamingModel(
        turns=[
            tool_call("first"),
            tool_call("second"),
            [AIMessageChunk(content=answer)],
        ]
    )
    run = build_search_workflow(
        model, retriever.product_search_tool("Search"), "Search."
    )
    assert asyncio.run(run("cotton tee")) == answer
    assert milvus.search.await_count == 2


def test_catalog_distinguishes_an_empty_catalog_result_from_failure(
    catalog: CatalogFixture,
) -> None:
    retriever, _, milvus = catalog
    milvus.search.return_value = [[]]
    assert asyncio.run(retriever.retrieve("cotton tee")) == []

    milvus.search.side_effect = RuntimeError("Milvus unavailable")
    with pytest.raises(RuntimeError, match="Milvus unavailable"):
        asyncio.run(retriever.retrieve("cotton tee"))

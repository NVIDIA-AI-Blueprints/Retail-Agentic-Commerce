# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

import json
from functools import partial
from unittest.mock import Mock

import httpx
import pytest

from src.agents.scripts import seed_milvus


@pytest.mark.parametrize(
    "model",
    ["nvidia/nemotron-3.5-embed-1b", "nvidia/Nemotron-3.5-Embed-1B-BF16"],
)
def test_catalog_seeder_uses_passage_and_query_modes(
    monkeypatch: pytest.MonkeyPatch, model: str
) -> None:
    payloads = []
    vector = [1.0] + [0.0] * 2047

    def embed(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        payloads.append(payload)
        return httpx.Response(
            200, json={"data": [{"embedding": vector} for _ in payload["input"]]}
        )

    monkeypatch.setattr(seed_milvus, "EMBEDDING_MODEL", model)
    monkeypatch.setattr(seed_milvus, "NVIDIA_API_KEY", "")
    client = partial(httpx.Client, transport=httpx.MockTransport(embed))
    monkeypatch.setattr(seed_milvus.httpx, "Client", client)
    collection = Mock()
    collection.search.return_value = [[]]

    assert seed_milvus.seed_products(collection) == len(seed_milvus.PRODUCTS)
    seed_milvus.verify_collection(collection)

    assert [payload["model"] for payload in payloads] == [model, model]
    assert [payload["input_type"] for payload in payloads] == ["passage", "query"]
    assert len(collection.insert.call_args.args[0][-1]) == len(seed_milvus.PRODUCTS)
    assert collection.search.call_args.kwargs["data"] == [vector]

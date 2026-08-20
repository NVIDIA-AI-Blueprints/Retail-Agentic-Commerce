# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from pathlib import Path


def _read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def test_search_workflow_uses_direct_retrieval_for_apps_sdk() -> None:
    config_text = _read("src/agents/configs/search.yml")
    register_text = _read("src/agents/register.py")

    assert "_type: deterministic_product_search" in config_text
    assert "retrieval_tool_name: product_search" in config_text
    assert "_type: tool_calling_agent" not in config_text
    assert "llm_name: search_llm" not in config_text

    assert 'name="deterministic_product_search"' in register_text
    assert "retriever_tool.acall_invoke(query=retriever_query)" in register_text

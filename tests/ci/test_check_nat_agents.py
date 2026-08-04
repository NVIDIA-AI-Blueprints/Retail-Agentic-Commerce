# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

import importlib.util
import io
import json
import urllib.error
from pathlib import Path
from types import ModuleType
from typing import Any
from unittest.mock import Mock

import pytest


def load_nat_checks() -> ModuleType:
    script_path = (
        Path(__file__).parents[2] / ".github" / "scripts" / "check_nat_agents.py"
    )
    spec = importlib.util.spec_from_file_location("check_nat_agents", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {script_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


NAT_CHECKS = load_nat_checks()


class SuccessfulResponse:
    status = 200

    def __init__(self, result: dict[str, Any]) -> None:
        self.body = json.dumps({"value": json.dumps(result)}).encode()

    def __enter__(self) -> SuccessfulResponse:
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self) -> bytes:
        return self.body


def workflow_error(status: int, message: str) -> urllib.error.HTTPError:
    body = json.dumps(
        {"code": "workflow_error", "message": message, "details": "RuntimeError"}
    ).encode()
    return urllib.error.HTTPError(
        "http://search-agent:8005/generate",
        status,
        "workflow error",
        hdrs=None,
        fp=io.BytesIO(body),
    )


def test_retries_once_for_empty_llm_response(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    empty_response = workflow_error(
        422,
        "LLM returned an empty response (no content, no tool calls). "
        "finish_reason=None, response_metadata={}",
    )
    urlopen = Mock(side_effect=[empty_response, SuccessfulResponse({"results": []})])
    sleep = Mock()
    monkeypatch.setattr(NAT_CHECKS.urllib.request, "urlopen", urlopen)
    monkeypatch.setattr(NAT_CHECKS.time, "sleep", sleep)

    result = NAT_CHECKS.call_agent("search", 8005, {"query": "Classic Tee"}, timeout=60)

    assert result == {"results": []}
    assert urlopen.call_count == 2
    sleep.assert_called_once_with(2)
    assert (
        "::warning::search received a transient empty LLM response"
        in capsys.readouterr().err
    )


def test_fails_after_repeated_empty_llm_response(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    errors = [
        workflow_error(422, NAT_CHECKS.EMPTY_LLM_RESPONSE_PREFIX),
        workflow_error(422, NAT_CHECKS.EMPTY_LLM_RESPONSE_PREFIX),
    ]
    urlopen = Mock(side_effect=errors)
    sleep = Mock()
    monkeypatch.setattr(NAT_CHECKS.urllib.request, "urlopen", urlopen)
    monkeypatch.setattr(NAT_CHECKS.time, "sleep", sleep)

    with pytest.raises(RuntimeError, match="search returned HTTP 422"):
        NAT_CHECKS.call_agent("search", 8005, {"query": "Classic Tee"}, timeout=60)

    assert urlopen.call_count == 2
    sleep.assert_called_once_with(2)


@pytest.mark.parametrize(
    ("status", "message"),
    [
        (500, NAT_CHECKS.EMPTY_LLM_RESPONSE_PREFIX),
        (422, "A different workflow failure"),
    ],
)
def test_does_not_retry_other_http_errors(
    monkeypatch: pytest.MonkeyPatch,
    status: int,
    message: str,
) -> None:
    urlopen = Mock(side_effect=workflow_error(status, message))
    sleep = Mock()
    monkeypatch.setattr(NAT_CHECKS.urllib.request, "urlopen", urlopen)
    monkeypatch.setattr(NAT_CHECKS.time, "sleep", sleep)

    with pytest.raises(RuntimeError, match=f"search returned HTTP {status}"):
        NAT_CHECKS.call_agent("search", 8005, {"query": "Classic Tee"}, timeout=60)

    assert urlopen.call_count == 1
    sleep.assert_not_called()

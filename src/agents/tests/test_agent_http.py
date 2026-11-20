# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import pytest
from fastapi.testclient import TestClient

from commerce_agents import server


@pytest.mark.parametrize("profile", server.PROFILES)
def test_agent_http_contract(profile: str, monkeypatch: pytest.MonkeyPatch) -> None:
    @asynccontextmanager
    async def open_workflow(
        profile_name: str, _: server.Profile
    ) -> AsyncIterator[server.Workflow]:
        assert profile_name == profile

        async def run(input_message: str) -> str:
            if input_message == "transient":
                raise RuntimeError("No response received from agent: private data")
            return input_message

        yield run

    monkeypatch.setenv("PHOENIX_ENDPOINT", "")
    monkeypatch.setattr(server, "open_workflow", open_workflow)
    with TestClient(server.create_app(profile)) as client:
        assert client.get("/health").json() == {"status": "healthy"}
        response = client.post("/generate", json={"input_message": '{"limit": 3}'})
        assert response.status_code == 200
        assert response.json() == {"value": '{"limit": 3}'}
        assert client.post("/generate", json={"input_message": {}}).status_code == 422

        response = client.post("/generate", json={"input_message": "transient"})
        assert response.status_code == 422
        assert response.json() == {
            "code": "workflow_error",
            "details": "RuntimeError",
            "message": "No response received from agent",
        }

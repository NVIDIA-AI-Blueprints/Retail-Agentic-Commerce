# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Serve the commerce workflows through the existing agent HTTP contract."""

import logging
import os
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from importlib.resources import files
from typing import Any

import yaml
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from opentelemetry import trace
from phoenix.otel import register
from pydantic import BaseModel, ConfigDict
from pymilvus import AsyncMilvusClient

from .models import (
    ModelSettings,
    completion,
    create_chat_model,
    create_embedder,
    inference_status,
)
from .recommendation import recommend
from .retrieval import CatalogRetriever
from .search import build_search_workflow

logger = logging.getLogger(__name__)
PROFILES = {
    "promotion": 8002,
    "post-purchase": 8003,
    "recommendation": 8004,
    "recommendation-ultrafast": 8004,
    "search": 8005,
}
TOOL_PROFILES = {"search", "recommendation-ultrafast"}
type Workflow = Callable[[str], Awaitable[str]]


class StageSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: str
    system_prompt: str


class Profile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project: str
    models: dict[str, ModelSettings]
    stages: dict[str, StageSettings]
    tool_topic: str = ""
    max_iterations: int = 2


class GenerateRequest(BaseModel):
    input_message: str


class GenerateResponse(BaseModel):
    value: str


def load_profile(name: str) -> Profile:
    if name not in PROFILES:
        raise ValueError(f"Unknown workflow {name!r}")
    config = files(__package__).joinpath("configs", f"{name}.yml")
    return Profile.model_validate(yaml.safe_load(config.read_text(encoding="utf-8")))


def completion_with_fallback(name: str, run: Workflow) -> Workflow:
    async def complete(input_message: str) -> str:
        try:
            return await run(input_message)
        except Exception as exc:
            # Preserve the callers' invalid-JSON fallback and ARAG's missing
            # branch handling without returning the input in an error string.
            logger.warning("Agent stage %s failed (%s)", name, type(exc).__name__)
            return "Agent could not generate a response."

    return complete


@asynccontextmanager
async def open_workflow(name: str, profile: Profile) -> AsyncIterator[Workflow]:
    models = {
        alias: create_chat_model(config) for alias, config in profile.models.items()
    }
    if name in {"promotion", "post-purchase"}:
        stage = profile.stages["main"]
        run = completion(
            name, models[stage.model], stage.system_prompt, trace.get_tracer(__name__)
        )
        yield completion_with_fallback(name, run)
        return

    milvus = AsyncMilvusClient(uri=os.getenv("MILVUS_URI", "http://localhost:19530"))
    try:
        retriever = CatalogRetriever(
            create_embedder(),
            milvus,
            collection_name=os.getenv("MILVUS_COLLECTION", "product_catalog"),
        )
        if name in TOOL_PROFILES:
            stage = profile.stages["main"]
            yield build_search_workflow(
                models[stage.model],
                retriever.product_search_tool(profile.tool_topic),
                stage.system_prompt,
                max_iterations=profile.max_iterations,
            )
        else:
            tracer = trace.get_tracer(__name__)
            stages = {
                label: completion_with_fallback(
                    label,
                    completion(label, models[stage.model], stage.system_prompt, tracer),
                )
                for label, stage in profile.stages.items()
            }

            async def run_recommendation(input_message: str) -> str:
                return await recommend(
                    input_message,
                    retrieve=retriever.retrieve,
                    understand_user=stages["user_understanding_agent"],
                    score_alignment=stages["nli_agent"],
                    summarize_context=stages["context_summary_agent"],
                    rank_items=stages["item_ranker_agent"],
                )

            yield run_recommendation
    finally:
        await milvus.close()


def workflow_error(exc: Exception) -> dict[str, str]:
    for prefix in ("No response received from agent", "LLM returned an empty response"):
        if isinstance(exc, RuntimeError) and str(exc).startswith(prefix):
            return {
                "code": "workflow_error",
                "details": "RuntimeError",
                "message": prefix,
            }
    if inference_status(exc) == 429:
        return {
            "code": "workflow_error",
            "details": "RuntimeError",
            "message": "No response received from agent (Too Many Requests)",
        }
    return {
        "code": "workflow_error",
        "details": "RuntimeError",
        "message": "Agent workflow failed",
    }


def create_app(name: str) -> FastAPI:
    profile = load_profile(name)

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[dict[str, Any]]:
        endpoint = os.getenv("PHOENIX_ENDPOINT", "http://localhost:6006/v1/traces")
        provider = None
        if endpoint:
            provider = register(
                project_name=os.getenv("PHOENIX_PROJECT_PREFIX", "") + profile.project,
                endpoint=endpoint,
                protocol="http/protobuf",
                batch=True,
                verbose=False,
            )
        try:
            async with open_workflow(name, profile) as run:
                yield {"workflow": run, "tracer": trace.get_tracer(__name__)}
        finally:
            if provider is not None:
                provider.shutdown()

    app = FastAPI(title=f"Commerce {name} agent", lifespan=lifespan)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "healthy"}

    @app.post("/generate", response_model=GenerateResponse)
    async def generate(
        body: GenerateRequest, request: Request
    ) -> GenerateResponse | JSONResponse:
        run: Workflow = request.state.workflow
        tracer: trace.Tracer = request.state.tracer
        with tracer.start_as_current_span(
            f"{name}.generate",
            attributes={"openinference.span.kind": "CHAIN"},
            record_exception=False,
        ) as span:
            try:
                return GenerateResponse(value=await run(body.input_message))
            except Exception as exc:
                span.set_status(trace.StatusCode.ERROR)
                logger.warning("%s workflow failed (%s)", name, type(exc).__name__)
                return JSONResponse(status_code=422, content=workflow_error(exc))

    return app

# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""NVIDIA inference settings and transport behavior shared by agent workflows."""

import asyncio
import logging
import os
import re
from collections.abc import Awaitable, Callable
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_nvidia_ai_endpoints import ChatNVIDIA, Model, NVIDIAEmbeddings
from langchain_nvidia_ai_endpoints._statics import MODEL_TABLE
from opentelemetry.trace import Span, StatusCode, Tracer
from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)
PUBLIC_NIM = "https://integrate.api.nvidia.com/v1"
TEMPORARY_STATUSES = {429, 500, 502, 503, 504}
RETRY_DELAYS = (0.25, 0.5, 1.0, 2.0)


class ModelSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    temperature: float
    max_tokens: int
    chat_template_kwargs: dict[str, Any]
    response_format: dict[str, Any] | None = None
    guided_json: dict[str, Any] | None = None


def create_chat_model(settings: ModelSettings) -> ChatNVIDIA:
    model = os.getenv("NIM_LLM_MODEL_NAME", "nvidia/nemotron-3.5-lightning-30b-a3b")
    # The pinned adapter performs synchronous model discovery for unknown hosted
    # IDs. NAT also supplied model metadata to bypass this extra startup request.
    MODEL_TABLE.setdefault(
        model, Model(id=model, model_type="chat", client="ChatNVIDIA")
    )
    return ChatNVIDIA(
        model=model,
        base_url=os.getenv("NIM_LLM_BASE_URL", PUBLIC_NIM),
        temperature=settings.temperature,
        max_completion_tokens=settings.max_tokens,
        model_kwargs=settings.model_dump(
            exclude={"temperature", "max_tokens"}, exclude_none=True
        ),
    )


def create_embedder() -> NVIDIAEmbeddings:
    return NVIDIAEmbeddings(
        model=os.getenv("NIM_EMBED_MODEL_NAME", "nvidia/nemotron-3.5-embed-1b"),
        base_url=os.getenv("NIM_EMBED_BASE_URL", PUBLIC_NIM),
        truncate="END",
    )


def inference_status(error: Exception) -> int | None:
    for status in (
        getattr(error, "status", None),
        getattr(error, "status_code", None),
        getattr(getattr(error, "response", None), "status_code", None),
    ):
        if isinstance(status, int):
            return status
    # The pinned adapter formats HTTP errors as "[status] title\n…".
    message = str(error)
    match = re.match(r"^\[(\d{3})\]", message)
    if match:
        return int(match[1])
    if "too many requests" in message.casefold():
        return 429
    return None


async def retry_nim[T](call: Callable[[], Awaitable[T]]) -> T:
    for delay in RETRY_DELAYS:
        try:
            return await call()
        except Exception as exc:
            status = inference_status(exc)
            if status not in TEMPORARY_STATUSES:
                raise
            logger.warning(
                "Retrying NIM inference after HTTP %s in %.2fs", status, delay
            )
            await asyncio.sleep(delay)
    return await call()


def record_model_metrics(span: Span, response: AIMessage) -> None:
    for key, label in (
        ("input_tokens", "prompt"),
        ("output_tokens", "completion"),
        ("total_tokens", "total"),
    ):
        if response.usage_metadata and key in response.usage_metadata:
            span.set_attribute(f"llm.token_count.{label}", response.usage_metadata[key])


def completion(
    name: str, model: ChatNVIDIA, system_prompt: str, tracer: Tracer
) -> Callable[[str], Awaitable[str]]:
    async def complete(input_message: str) -> str:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=input_message),
        ]
        with tracer.start_as_current_span(
            name,
            attributes={"openinference.span.kind": "LLM"},
            record_exception=False,
            set_status_on_exception=False,
        ) as span:
            try:
                response = await retry_nim(lambda: model.ainvoke(messages))
                record_model_metrics(span, response)
                return str(response.text)
            except Exception:
                span.set_status(StatusCode.ERROR)
                raise

    return complete

# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Bounded model and tool loop for product search and ultrafast recommendations."""

from collections.abc import Awaitable, Callable
from typing import Literal

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    convert_to_openai_messages,
)
from langchain_core.tools import BaseTool
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from opentelemetry import trace
from opentelemetry.trace import StatusCode

from .models import record_model_metrics, retry_nim


class SearchState(MessagesState):
    model_turns: int


def build_search_workflow(
    model: BaseChatModel,
    product_search: BaseTool,
    prompt: str,
    *,
    max_iterations: int = 2,
) -> Callable[[str], Awaitable[str]]:
    """Compile the two-node tool loop once for a search service."""
    bound_model = model.bind_tools([product_search])
    system = SystemMessage(content=prompt)

    async def call_model(state: SearchState) -> dict[str, list[BaseMessage] | int]:
        messages = [system, *state["messages"]]

        async def collect_stream() -> AIMessage:
            response: AIMessage | None = None
            try:
                async for chunk in bound_model.astream(messages):
                    if isinstance(response, AIMessageChunk) and isinstance(
                        chunk, AIMessageChunk
                    ):
                        response = response + chunk
                    elif isinstance(chunk, AIMessage):
                        response = chunk
            except ValueError as error:
                if str(error) == "No generation chunks were returned":
                    raise RuntimeError("No response received from agent") from error
                raise
            if response is None:
                raise RuntimeError("No response received from agent")
            if isinstance(response, AIMessageChunk):
                # ChatNVIDIA needs the OpenAI tool-call wire format in history.
                kwargs = dict(response.additional_kwargs)
                if response.tool_calls and not kwargs.get("tool_calls"):
                    kwargs["tool_calls"] = convert_to_openai_messages(response)[
                        "tool_calls"
                    ]
                response = AIMessage(
                    content=response.content,
                    additional_kwargs=kwargs,
                    response_metadata=response.response_metadata,
                    usage_metadata=response.usage_metadata,
                    id=response.id,
                )
            return response

        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span(
            "tool_calling.model",
            attributes={"openinference.span.kind": "LLM"},
            record_exception=False,
            set_status_on_exception=False,
        ) as span:
            try:
                response = await retry_nim(collect_stream)
                record_model_metrics(span, response)
                if response.response_metadata.get("finish_reason") == "length":
                    raise RuntimeError("LLM output truncated (finish_reason='length').")
                if (
                    not response.tool_calls
                    and not response.invalid_tool_calls
                    and not str(response.content).strip()
                ):
                    raise RuntimeError(
                        "LLM returned an empty response (no content, no tool calls)."
                    )
                return {"messages": [response], "model_turns": state["model_turns"] + 1}
            except Exception:
                span.set_status(StatusCode.ERROR)
                raise

    def next_step(state: SearchState) -> Literal["tools", "__end__"]:
        # A model turn after the final retrieval may answer, but cannot search again.
        response = state["messages"][-1]
        if (
            isinstance(response, AIMessage)
            and response.tool_calls
            and state["model_turns"] <= max_iterations
        ):
            return "tools"
        return "__end__"

    graph = StateGraph(SearchState)
    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode([product_search], handle_tool_errors=True))
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", next_step)
    graph.add_edge("tools", "agent")
    workflow = graph.compile()

    async def run(input_message: str) -> str:
        state = await workflow.ainvoke(
            {"messages": [HumanMessage(content=input_message)], "model_turns": 0},
            config={"recursion_limit": (max_iterations + 1) * 2},
        )
        response = state["messages"][-1]
        if isinstance(response, AIMessage) and response.tool_calls:
            return (
                "The tool calling agent could not produce a final answer within "
                f"{max_iterations} iterations. The agent repeatedly called tools "
                "without converging on a response."
            )
        return str(response.content)

    return run

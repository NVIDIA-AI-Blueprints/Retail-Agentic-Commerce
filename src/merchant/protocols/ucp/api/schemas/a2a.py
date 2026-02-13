"""Pydantic schemas for A2A (Agent-to-Agent) JSON-RPC 2.0 transport.

Defines request/response models for the A2A binding of UCP checkout capability
per checkout-a2a.md specification.
"""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class A2APart(BaseModel):
    """A2A message part (text or data).

    The A2A spec uses both ``type`` and ``kind`` for part discrimination.
    This model accepts either on input and always emits ``kind`` on output.
    """

    model_config = ConfigDict(populate_by_name=True)

    kind: str | None = Field(default=None)
    text: str | None = None
    data: dict[str, Any] | None = None

    @model_validator(mode="before")
    @classmethod
    def _accept_type_or_kind(cls, values: dict[str, Any]) -> dict[str, Any]:
        """Normalize incoming ``type`` field to ``kind``."""
        if "type" in values and "kind" not in values:
            values["kind"] = values.pop("type")
        return values

    @model_validator(mode="after")
    def _infer_kind(self) -> A2APart:
        """Infer kind from payload when not explicitly set."""
        if self.kind is None:
            self.kind = "data" if self.data is not None else "text"
        return self


class A2AMessage(BaseModel):
    """A2A message within a JSON-RPC request or response."""

    model_config = ConfigDict(populate_by_name=True)

    role: str = Field(..., description="Message role: 'user' or 'agent'")
    message_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        alias="messageId",
        description="Unique message identifier for idempotency",
    )
    context_id: str | None = Field(
        default=None,
        alias="contextId",
        description="A2A conversation context identifier",
    )
    kind: str = Field(default="message", description="Must be 'message'")
    parts: list[A2APart] = Field(  # type: ignore[assignment]
        default_factory=list, description="Message parts"
    )


class A2AJsonRpcRequest(BaseModel):
    """Top-level JSON-RPC 2.0 request envelope for A2A."""

    jsonrpc: str = Field(..., description="Must be '2.0'")
    id: str | int = Field(..., description="Request identifier")
    method: str = Field(..., description="JSON-RPC method name")
    params: dict[str, Any] = Field(
        default_factory=dict, description="Method parameters"
    )

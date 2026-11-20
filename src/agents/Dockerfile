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

# Shared image for the commerce agents and Milvus seeder.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN pip install uv

WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"
ENV UV_LINK_MODE=copy

COPY src/agents/pyproject.toml src/agents/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src/agents/README.md ./
COPY src/agents/commerce_agents ./commerce_agents
RUN uv sync --frozen --no-dev --no-editable

COPY src/agents/scripts ./scripts
COPY src/data ./src/data

# Compose selects the profile and port, or runs the one-shot seeder.

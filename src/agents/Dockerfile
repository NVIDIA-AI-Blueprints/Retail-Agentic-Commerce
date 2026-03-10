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

# NAT Agents Dockerfile
# Shared image for promotion, post-purchase, and recommendation agents

FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install uv

WORKDIR /app

# Copy agent-specific pyproject.toml, README, and custom component registration
COPY src/agents/pyproject.toml src/agents/README.md src/agents/register.py ./

# Install dependencies with prerelease support for nvidia-nat
RUN uv pip install -e ".[dev]" --system

# Copy agent configurations
COPY src/agents/configs ./configs

# Copy scripts (for seeding Milvus, etc.)
COPY src/agents/scripts ./scripts

# Copy shared data (product catalog for Milvus seeder)
COPY src/data ./src/data

# No default CMD - set via docker-compose command for each agent
# Examples:
# - nat serve --config_file configs/promotion.yml --port 8002
# - nat serve --config_file configs/post-purchase.yml --port 8003
# - nat serve --config_file configs/recommendation-ultrafast.yml --port 8004
# - python scripts/seed_milvus.py (for Milvus seeder)

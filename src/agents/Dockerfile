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

# Copy agent-specific pyproject.toml and README
COPY src/agents/pyproject.toml src/agents/README.md ./

# Install dependencies with prerelease support for nvidia-nat
RUN uv pip install -e ".[dev]" --prerelease=allow --system

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

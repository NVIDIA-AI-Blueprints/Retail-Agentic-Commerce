# Apps SDK MCP Server Dockerfile
# Multi-stage build: Node.js for widget, Python for server

# Stage 1: Build the React widget
FROM node:20-slim AS widget-builder

WORKDIR /widget

# Enable corepack for pnpm
RUN corepack enable

# Copy package files
COPY src/apps_sdk/web/package.json src/apps_sdk/web/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY src/apps_sdk/web ./
RUN pnpm build

# Stage 2: Python runtime
FROM python:3.12-slim AS runtime

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install uv

WORKDIR /app

# Copy and install Python dependencies
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY src/__init__.py ./src/__init__.py
COPY src/data ./src/data
COPY src/apps_sdk ./src/apps_sdk

# Copy built widget from builder stage (vite outputs to ../dist from /widget, so /dist)
COPY --from=widget-builder /dist ./src/apps_sdk/dist

EXPOSE 2091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:2091/health || exit 1

CMD ["uvicorn", "src.apps_sdk.main:app", "--host", "0.0.0.0", "--port", "2091"]

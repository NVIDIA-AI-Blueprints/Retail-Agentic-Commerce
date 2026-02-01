# Merchant API Dockerfile
FROM python:3.12-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install uv

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev

# Runtime stage
FROM base AS runtime
COPY --from=deps /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY src/__init__.py ./src/__init__.py
COPY src/data ./src/data
COPY src/merchant ./src/merchant

# Create data directory for SQLite
RUN mkdir -p /data

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.merchant.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Local Development

Use this when you want faster iteration outside the full Docker runtime. Services run on your host while infrastructure (Milvus, MinIO, Phoenix) stays in Docker.

## Quick Start

The fastest way to get running locally:

```bash
./install.sh   # install deps + start all 8 services
./stop.sh      # stop everything
```

`install.sh` handles prerequisite checks, dependency installation, environment setup, and launches all services in the background with health checks. Logs are written to `logs/<service>.log`.

When upgrading an existing hosted deployment, set `NIM_EMBED_MODEL_NAME=nvidia/nemotron-3.5-embed-1b` in `.env` and run `FORCE_RESEED=true ./install.sh` once to rebuild the Milvus product catalog. `logs/milvus-seeder.log` reports the embedding model used for seeding.

## Prerequisites

- Python 3.12+
- [uv](https://astral.sh/uv) package manager
- Node.js 20.9+ and pnpm
- Docker (for infrastructure services)
- NVIDIA API key configured in `.env`

## Infrastructure

Local development still requires the infrastructure stack running in Docker:

```bash
docker network create acp-infra-network || true
docker compose -f docker-compose.infra.yml up -d
```

## Agent Health

When running locally, agents are accessible on host ports:

```bash
curl http://localhost:8002/health   # promotion
curl http://localhost:8003/health   # post-purchase
curl http://localhost:8004/health   # recommendation
curl http://localhost:8005/health   # search
```

## Access URLs

| Service | URL |
|---------|-----|
| Demo UI | http://localhost:3000 |
| Merchant API | http://localhost:8000/docs |
| PSP | http://localhost:8001/docs |
| Apps SDK MCP | http://localhost:2091/docs |
| Phoenix Traces | http://localhost:6006 (requires Docker infra) |
| MinIO Console | http://localhost:9001 (requires Docker infra) |

## Manual Setup

<details>
<summary>Step-by-step manual setup (without install.sh)</summary>

### 1. Start Infra in Docker

```bash
docker network create acp-infra-network || true
docker compose -f docker-compose.infra.yml up -d
```

### 2. Run Backend Services

Run each service in a separate terminal:

```bash
# Terminal 1
uv venv
source .venv/bin/activate
uv sync
uvicorn src.merchant.main:app --reload
```

```bash
# Terminal 2
source .venv/bin/activate
uvicorn src.payment.main:app --reload --port 8001
```

```bash
# Terminal 3
source .venv/bin/activate
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### 3. Run Commerce Agents

Set the model and infrastructure variables in `.env` at the repository root. Run each agent command in a separate terminal from that directory.

```bash
uv run --project src/agents --frozen --env-file .env python -m commerce_agents promotion --port 8002
uv run --project src/agents --frozen --env-file .env python -m commerce_agents post-purchase --port 8003
uv run --project src/agents --frozen --env-file .env python -m commerce_agents recommendation --port 8004
uv run --project src/agents --frozen --env-file .env python -m commerce_agents search --port 8005
```

See the [agent integration guide](../src/agents/README.md) for configuration and evaluation.

### 4. Run UI

```bash
cd src/ui
cp env.example .env.local
pnpm install
pnpm dev
```

Optional Apps SDK widget dev server:

```bash
cd src/apps_sdk/web
pnpm install
pnpm dev
```

</details>

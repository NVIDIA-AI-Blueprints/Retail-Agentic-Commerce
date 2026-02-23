---
name: setup
description: Launch all services for the Retail Agentic Commerce project. Validates prerequisites, configures environment, and starts the full stack. Supports Docker deployment (recommended) and local development. Use when the user types "setup", "install", or asks to start/launch the project.
---

# Setup

This skill sets up and launches the Retail Agentic Commerce project. It supports two deployment modes.

## Step 1: Ask the User (MANDATORY)

**You MUST ask the user which deployment mode they want before proceeding. Do NOT skip this step. Do NOT assume a mode.**

Present these two options with Docker as the default:

1. **Docker (Recommended, default)** — runs everything in containers via Docker Compose. No local Python/Node setup needed.
2. **Local Development** — runs infrastructure in Docker, but backend services, agents, and UIs run directly on the host for faster iteration.

If the user says "setup" or "install" without specifying a mode, ask them. Default to Docker only if the user explicitly says "just do it" or "default".

---

## Shared Prerequisites (Both Modes)

### Environment Configuration

#### 1. Create `.env` from template (if it doesn't exist)

```bash
cp env.example .env
```

If `.env` already exists, do NOT overwrite it — check its contents instead.

#### 2. Validate `NVIDIA_API_KEY`

Read the `.env` file and check that `NVIDIA_API_KEY` is set to a real value:

- **Valid**: `NVIDIA_API_KEY=nvapi-...` (a real key starting with `nvapi-`)
- **Invalid**: `NVIDIA_API_KEY=nvapi-xxx`, `NVIDIA_API_KEY=`, or missing entirely

If the key is missing or is the placeholder `nvapi-xxx`:
1. Stop and tell the user:
   > Your `NVIDIA_API_KEY` is not configured. Get a free API key at https://build.nvidia.com/settings/api-keys and set it in your `.env` file.
2. Do NOT proceed until the user provides a valid key.

#### 3. Verify Public NIM Endpoint Configuration

Confirm these values are set in `.env` (they are the defaults from `env.example`):

```env
NIM_LLM_BASE_URL=https://integrate.api.nvidia.com/v1
NIM_EMBED_BASE_URL=https://integrate.api.nvidia.com/v1
```

If they point to a different host (e.g., a local NIM or internal server), inform the user and ask if they want to keep them or reset to public endpoints.

---

## Mode A: Docker Deployment

### Prerequisites

```bash
docker --version        # Required: Docker 24+
docker compose version  # Required: Docker Compose v2+
docker info > /dev/null 2>&1  # Daemon must be running
```

If any check fails, stop and inform the user what to install or start.

### Launch Services

```bash
docker network create acp-infra-network || true
docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d
```

This starts:
- **Infrastructure**: Milvus (vector DB), MinIO (object storage), etcd, Phoenix (tracing)
- **Backend**: Merchant API (port 8000), PSP service (port 8001), Apps SDK MCP (port 2091)
- **Agents**: Promotion (8002), Post-Purchase (8003), Recommendation (8004), Search (8005)
- **UI**: Next.js demo frontend
- **Nginx**: Reverse proxy exposing everything on port 80

### Wait for Services

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml ps
```

Milvus and agents may take 30–60 seconds to initialize.

### Health Verification

```bash
# Core services
curl -s http://localhost/api/health
curl -s http://localhost/psp/health
curl -s http://localhost/apps-sdk/health

# NAT agents (internal-only, check from merchant container)
docker compose -f docker-compose.infra.yml -f docker-compose.yml exec merchant \
  python -c "
import urllib.request as u
for name, url in [
    ('promotion', 'http://promotion-agent:8002/health'),
    ('post-purchase', 'http://post-purchase-agent:8003/health'),
    ('recommendation', 'http://recommendation-agent:8004/health'),
    ('search', 'http://search-agent:8005/health'),
]:
    try:
        status = u.urlopen(url, timeout=5).status
        print(f'{name}: {status}')
    except Exception as e:
        print(f'{name}: FAILED ({e})')
"
```

### Post-Setup Summary

```
Setup complete (Docker). All services are running.

  Demo UI:        http://localhost
  API Health:     http://localhost/api/health
  PSP Health:     http://localhost/psp/health
  Apps SDK Health: http://localhost/apps-sdk/health
  API OpenAPI:    http://localhost/api/openapi.json
  PSP OpenAPI:    http://localhost/psp/openapi.json
  Apps SDK OpenAPI: http://localhost/apps-sdk/openapi.json
  Phoenix Traces: http://localhost:6006
  MinIO Console:  http://localhost:9001
```

### Troubleshooting

- **Port conflicts**: `lsof -i :80` — stop the conflicting service or change the nginx port in `docker-compose.yml`
- **Crash loops**: `docker compose -f docker-compose.infra.yml -f docker-compose.yml logs -f <service-name>`
- **Full reset**: `docker compose -f docker-compose.infra.yml -f docker-compose.yml down -v` then re-run `up --build -d`

---

## Mode B: Local Development

### Prerequisites

- Docker 24+ and Docker Compose v2 (for infrastructure only)
- Python 3.12+ with `uv` installed
- Node.js 18+ with `pnpm` installed

Verify:

```bash
docker --version
docker compose version
docker info > /dev/null 2>&1
uv --version
python3 --version
node --version
pnpm --version
```

If any check fails, stop and inform the user what to install.

### 1. Start Infrastructure in Docker

```bash
docker network create acp-infra-network || true
docker compose -f docker-compose.infra.yml up -d
```

### 2. Install and Run Backend Services

From the project root, set up the Python environment and start each service in a separate terminal:

```bash
# Setup (once)
uv venv
source .venv/bin/activate
uv sync
```

```bash
# Terminal 1 — Merchant API (port 8000)
source .venv/bin/activate
uvicorn src.merchant.main:app --reload
```

```bash
# Terminal 2 — PSP (port 8001)
source .venv/bin/activate
uvicorn src.payment.main:app --reload --port 8001
```

```bash
# Terminal 3 — Apps SDK MCP (port 2091)
source .venv/bin/activate
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### 3. Install and Run NAT Agents

Agents have their own environment under `src/agents` and need NIM environment variables loaded:

```bash
# Setup (once)
cd src/agents
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
```

Each agent terminal must have the NIM env vars loaded from the project root `.env`. Source them before starting:

```bash
# Terminal 4 — Promotion Agent (port 8002)
cd src/agents
source .venv/bin/activate
source <(grep -E '^(NVIDIA_API_KEY|NIM_LLM_BASE_URL|NIM_LLM_MODEL_NAME|NIM_EMBED_BASE_URL|NIM_EMBED_MODEL_NAME|MILVUS_URI|PHOENIX_ENDPOINT)=' ../../.env | sed 's/^/export /')
nat serve --config_file configs/promotion.yml --port 8002
```

```bash
# Terminal 5 — Post-Purchase Agent (port 8003)
cd src/agents
source .venv/bin/activate
source <(grep -E '^(NVIDIA_API_KEY|NIM_LLM_BASE_URL|NIM_LLM_MODEL_NAME|NIM_EMBED_BASE_URL|NIM_EMBED_MODEL_NAME|MILVUS_URI|PHOENIX_ENDPOINT)=' ../../.env | sed 's/^/export /')
nat serve --config_file configs/post-purchase.yml --port 8003
```

```bash
# Terminal 6 — Recommendation Agent (port 8004)
cd src/agents
source .venv/bin/activate
source <(grep -E '^(NVIDIA_API_KEY|NIM_LLM_BASE_URL|NIM_LLM_MODEL_NAME|NIM_EMBED_BASE_URL|NIM_EMBED_MODEL_NAME|MILVUS_URI|PHOENIX_ENDPOINT)=' ../../.env | sed 's/^/export /')
nat serve --config_file configs/recommendation.yml --port 8004
```

```bash
# Terminal 7 — Search Agent (port 8005)
cd src/agents
source .venv/bin/activate
source <(grep -E '^(NVIDIA_API_KEY|NIM_LLM_BASE_URL|NIM_LLM_MODEL_NAME|NIM_EMBED_BASE_URL|NIM_EMBED_MODEL_NAME|MILVUS_URI|PHOENIX_ENDPOINT)=' ../../.env | sed 's/^/export /')
nat serve --config_file configs/search.yml --port 8005
```

### 4. Run UIs

```bash
# Terminal 8 — Demo UI (port 3000)
cd src/ui
cp env.example .env.local  # only needed on first setup
pnpm install
pnpm dev
```

```bash
# Terminal 9 — Apps SDK Widget dev server (port 3001)
cd src/apps_sdk/web
pnpm install
pnpm dev
```

### Health Verification

```bash
# Core services
curl -s http://localhost:8000/health
curl -s http://localhost:8001/health
curl -s http://localhost:2091/health

# NAT agents
curl -s http://localhost:8002/health
curl -s http://localhost:8003/health
curl -s http://localhost:8004/health
curl -s http://localhost:8005/health
```

### Post-Setup Summary

```
Setup complete (Local). All services are running.

  Demo UI:        http://localhost:3000
  Merchant API:   http://localhost:8000/docs
  PSP:            http://localhost:8001/docs
  Apps SDK MCP:   http://localhost:2091/docs
  Apps SDK Widget: http://localhost:3001
  Phoenix Traces: http://localhost:6006
  MinIO Console:  http://localhost:9001
```

---

## Execution Order (Strict)

Follow these steps in order — do not skip:

1. Ask the user: Docker or Local deployment
2. Validate `.env` exists and `NVIDIA_API_KEY` is a real key
3. Verify NIM endpoint URLs
4. Check prerequisites for the chosen mode
5. Start infrastructure
6. Start services (all at once for Docker, per-terminal for local)
7. Run health checks
8. Report success with URLs

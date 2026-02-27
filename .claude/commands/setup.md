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

### Quick Start

Run the automated setup script from the project root:

```bash
./install.sh
```

To stop all services:

```bash
./stop.sh
```

### What the Script Does

1. **Validates prerequisites** — Python 3.12+, `uv`, Node.js 18+, `pnpm`
2. **Configures environment** — Creates `.env` from `env.example` if missing, validates `NVIDIA_API_KEY`
3. **Installs dependencies** — Root venv (`uv sync`), agents venv (`uv pip install`), UI (`pnpm install`), Apps SDK widget
4. **Starts 8 services** in background with PID tracking
5. **Runs health checks** and prints a status table

### Services Started

| Service              | Port | Log File                          |
|----------------------|------|-----------------------------------|
| Merchant API         | 8000 | `logs/merchant.log`               |
| PSP                  | 8001 | `logs/psp.log`                    |
| Apps SDK MCP         | 2091 | `logs/apps-sdk.log`               |
| Promotion Agent      | 8002 | `logs/promotion-agent.log`        |
| Post-Purchase Agent  | 8003 | `logs/post-purchase-agent.log`    |
| Recommendation Agent | 8004 | `logs/recommendation-agent.log`   |
| Search Agent         | 8005 | `logs/search-agent.log`           |
| Demo UI              | 3000 | `logs/ui.log`                     |

### Post-Setup Summary

```
  Demo UI:         http://localhost:3000
  Merchant API:    http://localhost:8000/docs
  PSP:             http://localhost:8001/docs
  Apps SDK MCP:    http://localhost:2091/docs
  Phoenix Traces:  http://localhost:6006  (requires Docker infra)
  MinIO Console:   http://localhost:9001  (requires Docker infra)
```

### Troubleshooting

- **View logs**: `tail -f logs/<service>.log`
- **Port conflicts**: `lsof -i :<port>` — stop the conflicting process or change the port
- **Re-run setup**: `./install.sh` stops existing services first (idempotent)
- **Docker infrastructure** (Milvus, Phoenix, MinIO): Optional. Start with `docker compose -f docker-compose.infra.yml up -d`

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

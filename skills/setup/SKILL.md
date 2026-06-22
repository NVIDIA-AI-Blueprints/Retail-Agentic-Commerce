---
name: setup
description: Launch all services for the Retail-Agentic-Commerce project. Use when the user types setup, install, or asks to start, launch, or run the project stack.
---

# Setup

This skill sets up and launches the Retail-Agentic-Commerce project. It supports Docker deployment and local development.

## Ask First

Ask which deployment mode the user wants before proceeding unless they already specified one:

1. Docker, recommended default: runs everything in containers via Docker Compose.
2. Local development: runs infrastructure in Docker, but backend services, agents, and UIs run directly on the host.

If the user says "setup" or "install" without specifying a mode, ask them. Default to Docker only if the user explicitly says to use the default.

## Shared Prerequisites

Create `.env` from the template if it does not exist:

```bash
cp env.example .env
```

Do not overwrite an existing `.env`.

Validate that `NVIDIA_API_KEY` is set to a real key:

- Valid: starts with `nvapi-` and is not the placeholder.
- Invalid: missing, empty, or `nvapi-xxx`.

If the key is missing or placeholder, stop and tell the user to create a key at `https://build.nvidia.com/settings/api-keys` and set it in `.env`.

Confirm these public NIM endpoint defaults unless the user intentionally configured another host:

```env
NIM_LLM_BASE_URL=https://integrate.api.nvidia.com/v1
NIM_EMBED_BASE_URL=https://integrate.api.nvidia.com/v1
```

## Docker Deployment

Check prerequisites:

```bash
docker --version
docker compose version
docker info
```

Launch services:

```bash
docker network create acp-infra-network || true
docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d
```

Check service status:

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml ps
```

Verify core health endpoints:

```bash
curl -s http://localhost/api/health
curl -s http://localhost/psp/health
curl -s http://localhost/apps-sdk/health
```

Verify NAT agents from the merchant container because Docker agents are internal-only:

```bash
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

Report these URLs when Docker setup succeeds:

```text
Demo UI: http://localhost
API Health: http://localhost/api/health
PSP Health: http://localhost/psp/health
Apps SDK Health: http://localhost/apps-sdk/health
API OpenAPI: http://localhost/api/openapi.json
PSP OpenAPI: http://localhost/psp/openapi.json
Apps SDK OpenAPI: http://localhost/apps-sdk/openapi.json
Phoenix Traces: http://localhost:6006
MinIO Console: http://localhost:9001
```

## Local Development

Run the automated setup script from the repo root:

```bash
./install.sh
```

Stop services with:

```bash
./stop.sh
```

The script validates prerequisites, creates `.env` from `env.example` if missing, validates `NVIDIA_API_KEY`, installs dependencies, starts services, and runs health checks.

Expected local URLs:

```text
Demo UI: http://localhost:3000
Merchant API: http://localhost:8000/docs
PSP: http://localhost:8001/docs
Apps SDK MCP: http://localhost:2091/docs
Phoenix Traces: http://localhost:6006
MinIO Console: http://localhost:9001
```

## Troubleshooting

- View local logs with `tail -f logs/<service>.log`.
- Check Docker logs with `docker compose -f docker-compose.infra.yml -f docker-compose.yml logs -f <service-name>`.
- Inspect port conflicts with `lsof -i :<port>`.
- For Docker reset, run `docker compose -f docker-compose.infra.yml -f docker-compose.yml down -v`, then launch again.

## Completion Criteria

Report the chosen mode, commands run, health check results, URLs, and any services that failed to start.

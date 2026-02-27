# Docker Deployment

Full-stack deployment using Docker Compose. This is the recommended approach.

## Prerequisites

- Docker 24+
- Docker Compose v2
- NVIDIA API key ([create one](https://build.nvidia.com/settings/api-keys))

## 1. Set Environment Variables

By default the stack calls NVIDIA public NIMs hosted on `build.nvidia.com`.

**Required:**

```bash
export NVIDIA_API_KEY=<YOUR_KEY>
```

**Optional** — override the model or point to self-hosted NIMs:

```bash
export NIM_LLM_MODEL_NAME=nvidia/nemotron-3-nano-30b-a3b
export NIM_LLM_BASE_URL=https://HOST:POST/v1
export NIM_EMBED_BASE_URL=http://HOST:PORT/v1
```

## 2. Create Shared Docker Network (one-time)

```bash
docker network create acp-infra-network || true
```

## 3. Start Infrastructure + App Stack

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d
```

## 4. Verify Health

```bash
curl http://localhost/api/health
curl http://localhost/psp/health
curl http://localhost/apps-sdk/health
```

Agent services also expose `/health`, but in full Docker deployment they are internal-only (not published on `localhost`).

## 5. Open the Application

- Demo UI: http://localhost
- Phoenix traces: http://localhost:6006
- MinIO console: http://localhost:9001

## Common Operations

### Logs and Status

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml ps
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs -f merchant
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs -f nginx
```

### Agent Health (Troubleshooting)

Check from inside the merchant container:

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml exec merchant \
  python -c "import urllib.request as u; print('promotion', u.urlopen('http://promotion-agent:8002/health', timeout=5).status); print('post-purchase', u.urlopen('http://post-purchase-agent:8003/health', timeout=5).status); print('recommendation', u.urlopen('http://recommendation-agent:8004/health', timeout=5).status); print('search', u.urlopen('http://search-agent:8005/health', timeout=5).status)"
```

### Stop Services

```bash
# Stop app + infra containers
docker compose -f docker-compose.infra.yml -f docker-compose.yml down

# Stop and remove volumes (full reset)
docker compose -f docker-compose.infra.yml -f docker-compose.yml down -v
```

### Rebuild

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml build
docker compose -f docker-compose.infra.yml -f docker-compose.yml up -d
```

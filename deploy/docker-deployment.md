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

The hosted endpoint uses these model IDs. Update an existing `.env` if it overrides the embedding model.

```bash
export NIM_LLM_BASE_URL=https://integrate.api.nvidia.com/v1
export NIM_LLM_MODEL_NAME=nvidia/nemotron-3.5-lightning-30b-a3b
export NIM_EMBED_BASE_URL=https://integrate.api.nvidia.com/v1
export NIM_EMBED_MODEL_NAME=nvidia/nemotron-3.5-embed-1b
```

For self-hosted NIM, configure the app to use the local model IDs and prepare the NIM cache directories. Use an NGC API key with access to the images and model artifacts.

```bash
export NGC_API_KEY=<YOUR_NGC_KEY>
export LOCAL_NIM_CACHE="${LOCAL_NIM_CACHE:-$HOME/.cache/nim}"
mkdir -p "$LOCAL_NIM_CACHE/embedqa/cache" "$LOCAL_NIM_CACHE/embedqa/weights"
printf '%s' "$NGC_API_KEY" | docker login nvcr.io --username '$oauthtoken' --password-stdin
export NIM_LLM_BASE_URL=http://nemotron-lightning:8000/v1
export NIM_LLM_MODEL_NAME=nvidia/nemotron-3.5-lightning
export NIM_EMBED_BASE_URL=http://embedqa:8000/v1
export NIM_EMBED_MODEL_NAME=nvidia/Nemotron-3.5-Embed-1B-BF16
```

The embedding service uses `nvcr.io/nim/nvidia/nemotron-embed:2.4.1`. Set `UID` to the cache owner's numeric user ID if it differs from the Compose default of `1000`. See the [NVIDIA Embedding NIM guide](https://docs.nvidia.com/nim/nemo-retriever/embedding/2.4/getting-started.html).

## 2. Create Shared Docker Network (one-time)

```bash
docker network create acp-infra-network || true
```

## 3. Start Infrastructure + App Stack

For self-hosted NIM, start the model containers first. Wait for the embedding NIM to be ready and confirm its served model ID before starting the app.

```bash
docker compose -f docker-compose-nim.yml up -d
docker compose -f docker-compose-nim.yml logs --tail 50 embedqa
curl -fsS http://localhost:8011/v1/health/ready
curl -fsS http://localhost:8011/v1/models
```

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d
```

On an existing deployment, verify the new embedding endpoint before rebuilding the `product_catalog` collection. Rebuild when changing models or switching between hosted and self-hosted embeddings. Milvus needs vectors from the same model used for queries, even though both endpoints return 2,048 dimensions.

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml run --rm -e FORCE_RESEED=true milvus-seeder
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

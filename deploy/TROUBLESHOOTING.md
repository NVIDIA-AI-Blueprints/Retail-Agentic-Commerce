# Troubleshooting

Common issues when bringing up the stack for the first time, and how to
resolve them. Run `./scripts/check_stack.sh` first — it will point you at
the specific service that's failing.

## Setup and environment

| Symptom | Likely cause | Fix |
|---|---|---|
| `NVIDIA_API_KEY` errors, or 401/403 responses from agents/LLM calls | Key missing, unset, or still the placeholder from `env.example` | `cp env.example .env`, then set `NVIDIA_API_KEY=nvapi-...` with a key from [build.nvidia.com](https://build.nvidia.com/settings/api-keys) |
| `docker network create acp-infra-network` fails with "already exists" | Harmless — a leftover network from a previous run | Ignore; existing docs already guard this with `\|\| true` |
| Services can't reach each other in Docker mode | Containers on different Docker networks, or infra stack not started before the app stack | Start infra **and** app together: `docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d` |
| `install.sh` exits early / partial services | A prerequisite (Python 3.12+, `uv`, Node 20.9+, `pnpm`, Docker) is missing or too old | Re-check versions against [Prerequisites in local-development.md](local-development.md#prerequisites); `install.sh` checks these but stops on the first missing tool |

## Ports and connectivity

| Symptom | Likely cause | Fix |
|---|---|---|
| `curl: (7) Failed to connect` on a service port | Port already in use by another process, or that service didn't start | `lsof -i :<port>` (or `docker compose ps`) to see what's bound; check `logs/<service>.log` (local) or `docker compose logs -f <service>` (Docker) |
| Health check passes for Merchant/PSP/Apps SDK but agents fail | In full Docker deployment, agent ports (8002–8005) are **internal-only** and not published to `localhost` | Check agent health from inside the merchant container (see `deploy/docker-deployment.md#agent-health-troubleshooting`), not via `curl localhost:800x` |
| UI loads but shows no products / empty state | Backend services started before their data/vector store finished initializing | Give Milvus/MinIO a few extra seconds after `docker compose up`, then re-run `check_stack.sh` |

## Local NIM / GPU deployment

| Symptom | Likely cause | Fix |
|---|---|---|
| Agents time out or return errors only in local-NIM mode | `NIM_LLM_BASE_URL` / `NIM_EMBED_BASE_URL` point at containers that aren't running yet, or GPU memory is exhausted | Confirm you actually need local NIMs — the default deployment uses NVIDIA's hosted API and needs no GPU at all. If you do need local NIMs, follow `deploy/1_Deploy_Agentic_Commerce.ipynb` fully before switching these env vars |
| "insufficient GPU memory" on NIM container startup | Hardware below the documented minimum (1× A100/H100 80GB per model, 2 GPUs total) | See Hardware Requirements in the root `README.md`; use the hosted-API path instead if you don't have this hardware |

## Resetting

If you're stuck and want a clean slate:

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml down -v
docker network rm acp-infra-network 2>/dev/null || true
docker network create acp-infra-network
docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d
```

For local dev mode:

```bash
./stop.sh
rm -rf logs/*.log
./install.sh
```

Still stuck? Open a pull request describing the failure (issue creation is
currently disabled on this repo) with the output of `./scripts/check_stack.sh`
attached.

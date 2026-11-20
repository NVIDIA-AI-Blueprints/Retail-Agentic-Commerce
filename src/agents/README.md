# Commerce agents

Four FastAPI services run the merchant's promotion, post-purchase, recommendation, and search workflows. They call NVIDIA NIM through LangChain. Search and the optional ultrafast recommendation profile use a bounded LangGraph tool loop.

| Profile | Port | Workflow |
| --- | --- | --- |
| `promotion` | 8002 | Select an eligible action from merchant-provided signals |
| `post-purchase` | 8003 | Generate a shipping message in the shopper's language and the retailer's tone |
| `recommendation` | 8004 | Retrieve and rank complementary catalog products with ARAG |
| `search` | 8005 | Find relevant products using the Milvus search tool |
| `recommendation-ultrafast` | 8004 | Optional recommendation profile with a single tool loop |

The merchant computes checkout signals and enforces pricing and margin constraints. The promotion service returns an advisory action. Post-purchase messaging, search, and recommendations return content. Merchant and Apps SDK callers handle checkout state, product enrichment, and fallbacks.

## Run locally

From the repository root, configure `.env` and start [the shared infrastructure](../../deploy/local-development.md). Run each service in its own terminal.

```bash
uv sync --project src/agents --frozen --extra dev
uv run --project src/agents --frozen --env-file .env python -m commerce_agents promotion --port 8002
uv run --project src/agents --frozen --env-file .env python -m commerce_agents post-purchase --port 8003
uv run --project src/agents --frozen --env-file .env python -m commerce_agents recommendation --port 8004
uv run --project src/agents --frozen --env-file .env python -m commerce_agents search --port 8005
```

For the optional profile, substitute `recommendation-ultrafast` in the command for port 8004. Docker Compose uses the default ARAG profile. See [Docker deployment](../../deploy/docker-deployment.md) for the full stack and self-hosted NIM.

| Variable | Default or purpose |
| --- | --- |
| `NVIDIA_API_KEY` | Access key for NVIDIA's hosted API |
| `NIM_LLM_BASE_URL`, `NIM_EMBED_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NIM_LLM_MODEL_NAME` | `nvidia/nemotron-3.5-lightning-30b-a3b` |
| `NIM_EMBED_MODEL_NAME` | `nvidia/nemotron-3.5-embed-1b` |
| `MILVUS_URI` | `http://localhost:19530` |
| `MILVUS_COLLECTION` | `product_catalog` by default. Select an already seeded collection for benchmarking. |
| `PHOENIX_ENDPOINT` | OTLP endpoint, such as `http://localhost:6006/v1/traces` |
| `PHOENIX_PROJECT_PREFIX` | Optional project prefix for comparison runs |

Search and recommendations must query the collection with the same embedding model that seeded it. When switching models, follow the [Milvus reseeding instructions](../../deploy/docker-deployment.md#3-start-infrastructure--app-stack).

## HTTP contract

Each service exposes `GET /health` and `POST /generate`. The body has an `input_message` string containing the input JSON. On success, the `value` string contains the workflow output JSON.

```bash
curl -fsS http://localhost:8005/health
curl -fsS http://localhost:8005/generate \
  -H 'Content-Type: application/json' \
  -d '{"input_message":"{\"query\":\"Classic Tee\",\"category\":\"tops\",\"limit\":3}"}'
```

| Profile | Input | Output in `value` |
| --- | --- | --- |
| Promotion | Product, prices, inventory, signals, `allowed_actions` | Product ID, action, reason codes, short explanation |
| Post-purchase | Brand persona, order, shipping status | Order ID, status, language, subject, message |
| Recommendation | Cart items, optional query and browsing context | Ranked items, inferred intent, pipeline counts |
| Search | Query, optional category, result limit | Original query and catalog hits with product ID, name, snippet, and distance |

Model settings and prompts are in [commerce_agents/configs](commerce_agents/configs). Example payloads are in [data/eval](data/eval).

## Recommendation pipeline

The service retrieves ten candidates from Milvus and gives the same context to User Understanding and NLI. Both model calls run concurrently. Context Summary waits for both branches, reads the labeled branch outputs, and passes the synthesized context to Item Ranker. If a branch fails, context synthesis still receives the available branch result. The output guard normalizes the response and limits it to three recommendations.

Phoenix traces use the workflow's project name. A root span captures each run. Child spans expose model calls and retrieval so you can check that User Understanding and NLI overlap. Search uses the Milvus vector distance expected by the Apps SDK filters.

## Compare two runtimes

Capture the baseline before changing the runtime. Start both runtimes on separate ports and use the same NIM models, Milvus collection, and inputs. From the repository root:

```bash
mkdir -p artifacts
python -m src.agents.scripts.compare_agents capture \
  --lane baseline --port-offset 10000 --output artifacts/baseline.jsonl
python -m src.agents.scripts.compare_agents capture \
  --lane candidate --output artifacts/candidate.jsonl
python -m src.agents.scripts.compare_agents compare \
  --baseline artifacts/baseline.jsonl --candidate artifacts/candidate.jsonl \
  --review-dir artifacts/quality-review
```

The capture includes the 44 repository eval cases, two widget fixtures, and a repeat of selected cases. The report checks matching inputs, compares p50/p95, and counts HTTP outcomes and contract checks. Some legacy search requests and recommendation carts refer to products outside the demo catalog. Use the widget fixtures for known catalog behavior. Review the blinded output cards for relevance, language, and tone before opening the lane key.

The [NeMo Agent Toolkit guide](../../docs/NEMO_AGENT_TOOLKIT_DOCUMENTATION.md) describes the previous runtime and its profiler. The [archived agent guide](https://github.com/NVIDIA-AI-Blueprints/Retail-Agentic-Commerce/blob/5032ce6ce9fa3a67061e72d59e0d8c91ab821537/src/agents/README.md#evaluation--profiling) contains the old eval commands and historical benchmark results.

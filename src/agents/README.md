# ACP Agents

NAT-powered agents for the Agentic Commerce Protocol (ACP) reference implementation. These agents provide intelligent decision-making capabilities for e-commerce operations using NVIDIA NeMo Agent Toolkit.

## Architecture Overview

All ACP agents follow a **3-layer hybrid architecture** that combines deterministic computation with LLM arbitration:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Deterministic Computation                             │
│  - Query data from database                                     │
│  - Compute signals and context                                  │
│  - Filter allowed options by business constraints               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API call with context
┌─────────────────────────────────────────────────────────────────┐
│                    NAT Agent (nat serve)                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: LLM Arbitration                                       │
│  - Receive pre-computed context                                 │
│  - Analyze business signals                                     │
│  - Select action or generate content (classification/generation)│
│  - Return decision with reasoning                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns decision/content
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Deterministic Execution                               │
│  - Apply selected action                                        │
│  - Validate against constraints                                 │
│  - Fail closed if invalid                                       │
└─────────────────────────────────────────────────────────────────┘
```

> **Key Principle:** The LLM never computes prices, performs calculations, or accesses databases directly. It selects strategies from pre-approved sets or generates content from structured context. All math, data access, and enforcement are deterministic.

## Available Agents

| Agent | Config | Port | Purpose |
|-------|--------|------|---------|
| Promotion Agent | `configs/promotion.yml` | 8002 | Strategy arbiter for dynamic pricing |
| Post-Purchase Agent | `configs/post-purchase.yml` | 8003 | Multilingual shipping message generator |
| Recommendation Agent (ARAG) | `configs/recommendation.yml` | 8004 | Multi-agent personalized recommendations |
| Search Agent (RAG) | `configs/search.yml` | 8005 | Lightweight semantic product search |

## Installation

```bash
cd src/agents

# Create virtual environment with uv (recommended)
uv venv --python 3.12 .venv
source .venv/bin/activate

# Install with dev dependencies
uv pip install -e ".[dev]"

# Or with pip
pip install -e ".[dev]"
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM | Yes | — |
| `MILVUS_URI` | Milvus vector database URI | For Recommendation + Search | `http://localhost:19530` |
| `PHOENIX_ENDPOINT` | Phoenix observability endpoint | No | `http://localhost:6006` |

```bash
export NVIDIA_API_KEY=<your_nvidia_api_key>
```

### Shared Infrastructure (Milvus + Phoenix)

The Recommendation and Search agents require **Milvus** for vector search. **Phoenix** provides optional LLM observability and tracing.

| Service | Port | Purpose |
|---------|------|---------|
| Milvus | 19530 | Vector similarity search for product embeddings |
| Phoenix | 6006 | LLM observability UI and trace collection |
| MinIO | 9001 | Object storage for Milvus |

**Starting infrastructure:**

```bash
# From project root
docker compose up -d

# Verify services
curl -s http://localhost:9091/healthz  # Milvus — should return "OK"
curl -s http://localhost:6006/healthz  # Phoenix — should return "OK"
```

**Seeding the product catalog:**

```bash
cd src/agents
source .venv/bin/activate
uv pip install -e ".[dev]"
python scripts/seed_milvus.py
```

**Stopping infrastructure:**

```bash
docker compose down      # Stop services
docker compose down -v   # Stop and remove all data
```

| UI | URL |
|----|-----|
| Phoenix (traces, LLM calls) | http://localhost:6006 |
| MinIO Console (optional) | http://localhost:9001 |

---

## Promotion Agent

The Promotion Agent selects optimal promotion actions based on pre-computed business signals.

**Workflow Type:** `chat_completion` | **Port:** 8002

```bash
# Start as REST endpoint
nat serve --config_file configs/promotion.yml --port 8002

# Test with direct input
nat run --config_file configs/promotion.yml --input '{
  "product_id": "prod_3",
  "product_name": "Graphic Tee",
  "base_price_cents": 3200,
  "stock_count": 200,
  "min_margin": 0.18,
  "lowest_competitor_price_cents": 2800,
  "signals": {
    "inventory_pressure": "high",
    "competition_position": "above_market"
  },
  "allowed_actions": ["NO_PROMO", "DISCOUNT_5_PCT", "DISCOUNT_10_PCT", "DISCOUNT_15_PCT"]
}'
```

**Example Output:**
```json
{
  "product_id": "prod_3",
  "action": "DISCOUNT_10_PCT",
  "reason_codes": ["HIGH_INVENTORY", "ABOVE_MARKET", "MARGIN_PROTECTED"],
  "reasoning": "High inventory and above-market pricing justify a 10% discount."
}
```

### Input Format

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | Product identifier |
| `product_name` | string | Human-readable product name |
| `base_price_cents` | int | Original price in cents (context only) |
| `stock_count` | int | Current inventory units |
| `min_margin` | float | Minimum profit margin (0.18 = 18%) |
| `lowest_competitor_price_cents` | int | Lowest competitor price in cents |
| `signals.inventory_pressure` | string | `"high"` or `"low"` |
| `signals.competition_position` | string | `"above_market"`, `"at_market"`, or `"below_market"` |
| `allowed_actions` | list[string] | Actions filtered by margin constraints |

### Available Actions

| Action | Description | Discount |
|--------|-------------|----------|
| `NO_PROMO` | No discount applied | 0% |
| `DISCOUNT_5_PCT` | 5% discount | 5% |
| `DISCOUNT_10_PCT` | 10% discount | 10% |
| `DISCOUNT_15_PCT` | 15% discount | 15% |
| `FREE_SHIPPING` | Free shipping benefit | 0% (price) |

---

## Post-Purchase Agent

The Post-Purchase Agent generates multilingual shipping update messages based on brand persona and order context.

**Workflow Type:** `chat_completion` | **Port:** 8003

```
┌─────────────────────────────────────────────────────────────────┐
│                    Order Lifecycle Event                        │
│       (order_confirmed → shipped → out_for_delivery → delivered)│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/merchant/services/post_purchase.py             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Build Message Request                                 │
│  - Load Brand Persona (company_name, tone, language)            │
│  - Gather Order Context (customer_name, product, tracking_url)  │
│  - Determine shipping status                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /generate with JSON context
┌─────────────────────────────────────────────────────────────────┐
│            Post-Purchase Agent (nat serve :8003)                │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: LLM Message Generation                                │
│  - Apply tone: friendly | professional | casual | urgent        │
│  - Generate in language: EN | ES | FR                           │
│  - Create subject line and message body                         │
│  - Sign with company name                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns {subject, message, language}
┌─────────────────────────────────────────────────────────────────┐
│              src/merchant/services/post_purchase.py             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Validate & Deliver                                    │
│  - Validate response format                                     │
│  - Fallback to templates if agent unavailable                   │
│  - Queue for webhook delivery                                   │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Start as REST endpoint
nat serve --config_file configs/post-purchase.yml --port 8003

# Test with direct input
nat run --config_file configs/post-purchase.yml --input '{
  "brand_persona": {
    "company_name": "Acme T-Shirts",
    "tone": "friendly",
    "preferred_language": "en"
  },
  "order": {
    "order_id": "order_xyz789",
    "customer_name": "John",
    "product_name": "Classic Tee",
    "tracking_url": "https://track.example.com/abc123",
    "estimated_delivery": "2026-01-28"
  },
  "status": "order_shipped"
}'
```

**Example Output:**
```json
{
  "order_id": "order_xyz789",
  "status": "order_shipped",
  "language": "en",
  "subject": "Your Classic Tee is on its way! 🚚",
  "message": "Hey John! Great news - your Classic Tee is on its way! 🚚\n\nTrack your package: https://track.example.com/abc123\n\nExpected delivery: January 28, 2026\n\n- The Acme T-Shirts Team"
}
```

### Input Format

| Field | Type | Description |
|-------|------|-------------|
| `brand_persona.company_name` | string | Retailer's name |
| `brand_persona.tone` | string | `"friendly"`, `"professional"`, `"casual"`, `"urgent"` |
| `brand_persona.preferred_language` | string | `"en"`, `"es"`, `"fr"` |
| `order.order_id` | string | Order identifier |
| `order.customer_name` | string | Customer's first name |
| `order.product_name` | string | Name of purchased product |
| `order.tracking_url` | string | Package tracking URL (optional) |
| `order.estimated_delivery` | string | ISO date format (optional) |
| `status` | string | Shipping status |

### Supported Tones

| Tone | Description |
|------|-------------|
| `friendly` | Warm, enthusiastic, uses emojis sparingly |
| `professional` | Formal, courteous, no emojis |
| `casual` | Relaxed, informal, may use emojis |
| `urgent` | Direct, action-oriented, time-sensitive |

### Shipping Statuses

| Status | Description |
|--------|-------------|
| `order_confirmed` | Order received and confirmed |
| `order_shipped` | Package shipped, tracking available |
| `out_for_delivery` | Package arriving today |
| `delivered` | Package delivered |

---

## Recommendation Agent (ARAG)

The Recommendation Agent implements an **Agentic Retrieval Augmented Generation (ARAG)** framework based on [SIGIR 2025 research](https://arxiv.org/pdf/2506.21931). This multi-agent approach achieves significant improvement over vanilla RAG for personalized recommendations.

**Workflow Type:** `sequential_executor` (multi-agent orchestration) | **Port:** 8004

### Why ARAG?

Traditional RAG retrieves documents based on embedding similarity alone. ARAG introduces **multi-agent reasoning** into the retrieval pipeline:

| Approach | NDCG@5 | Hit@5 | Improvement |
|----------|--------|-------|-------------|
| Recency-based | 0.309 | 0.395 | — |
| Vanilla RAG | 0.299 | 0.379 | — |
| **ARAG** | **0.439** | **0.535** | **+42%** |

### Multi-Agent Pipeline

All ARAG agents are orchestrated within a **single NAT workflow** (`configs/recommendation.yml`) using NAT's multi-agent pattern. Specialized agents are defined as `functions` and executed by a `sequential_executor` with parallel fan-out for UUA and NLI via a custom `parallel_executor` component.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Checkout / Cart Update                        │
│              (add_to_cart → get_recommendations)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           src/merchant/services/recommendation.py               │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Build Recommendation Request                          │
│  - Validate cart items exist in product catalog                 │
│  - Gather session context (browse history, price range)         │
│  - Determine eligible product categories                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /generate with JSON context
┌─────────────────────────────────────────────────────────────────┐
│         Recommendation Agent (ARAG) (nat serve :8004)           │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: ARAG Multi-Agent Pipeline                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      Sequential Executor (sequential_executor workflow)   │ │
│  │  - Receives cart items + session context                   │ │
│  │  - Orchestrates specialized agents in sequence             │ │
│  │  - Parallel fan-out for UUA + NLI via parallel_executor    │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│            ┌────────────────┼────────────────┐                   │
│            │                │                │                   │
│            ▼                ▼                ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ product_     │  │ user_under-  │  │ nli_align-   │           │
│  │ search       │  │ standing_    │  │ ment_agent   │           │
│  │ (RAG tool)   │  │ agent (UUA)  │  │ (NLI)        │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ Vector search│  │ Infer buyer  │  │ Score align- │           │
│  │ in Milvus    │  │ preferences  │  │ ment with    │           │
│  │              │  │ from context │  │ user intent  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│            │                │                │                   │
│            └────────────────┼────────────────┘                   │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  context_summary_agent (CSA)                               │ │
│  │  - Synthesizes UUA output + NLI scores + candidates        │ │
│  │  - Creates focused context for final ranking               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  item_ranker_agent (IRA)                                   │ │
│  │  - Produces final ranked recommendations                   │ │
│  │  - Includes reasoning for each suggestion                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────┴─────────────────────────────────┐ │
│  │       Output Contract Guard (deterministic)                │ │
│  │  - Validates and normalizes recommendation payload         │ │
│  │  - Enforces max recommendations and required fields        │ │
│  │  - Includes pipeline_trace for observability               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns {recommendations, user_intent, pipeline_trace}
┌─────────────────────────────────────────────────────────────────┐
│           src/merchant/services/recommendation.py               │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Validate & Filter Recommendations                     │
│  - Validate products exist and are in-stock                     │
│  - Exclude items already in cart                                │
│  - Fallback to popularity-based if agent unavailable            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Checkout Session Response                       │
│      (cross_sell_recommendations array in session JSON)          │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Steps

| Step | Component | Type | Purpose |
|------|-----------|------|---------|
| 1 | `rag_retriever` | Custom (`register.py`) | Adapts input into retriever query, normalizes candidates |
| 2a | `user_understanding_agent` | chat_completion | Infers buyer preferences from cart/context |
| 2b | `nli_agent` | chat_completion | Scores semantic alignment with user intent |
| — | `parallel_analysis` | Custom (`register.py`) | Runs UUA + NLI in parallel via `asyncio.gather` |
| 3 | `context_summary_agent` | chat_completion | Synthesizes UUA + NLI signals into focused context |
| 4 | `item_ranker_agent` | chat_completion | Produces final ranked recommendations |
| 5 | `output_contract_guard` | Custom (`register.py`) | Validates and normalizes output schema |

Underlying retrieval:

| Component | Type | Purpose |
|-----------|------|---------|
| `product_search` | nat_retriever | Vector search for candidate products in Milvus |

### Running

**Requires:** Milvus running and seeded (see [Shared Infrastructure](#shared-infrastructure-milvus--phoenix)).

```bash
# Start as REST endpoint (single command runs entire ARAG pipeline)
nat serve --config_file configs/recommendation.yml --port 8004

# Test with curl
curl -X POST http://localhost:8004/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input_message": "{\"cart_items\": [{\"product_id\": \"prod_1\", \"name\": \"Classic Tee\", \"category\": \"tops\", \"price\": 2500}], \"session_context\": {}}"
  }'
```

### Config Variants

| Config | Workflow | Latency (H100) | Trade-off |
|--------|----------|-----------------|-----------|
| `recommendation.yml` | `sequential_executor` with parallel fan-out | ~4.8 s | Multi-agent pipeline with dedicated LLM agents per step; higher quality outputs |
| `recommendation-ultrafast.yml` | `tool_calling_agent` | <3 s | Single LLM call with ARAG methodology embedded in prompt; faster, less modular |

`recommendation.yml` is the default. Use `recommendation-ultrafast.yml` when latency is the primary concern and slightly lower output quality is acceptable.

**Example Output:**
```json
{
  "recommendations": [
    {
      "product_id": "prod_5",
      "product_name": "Classic Denim Jeans",
      "rank": 1,
      "reasoning": "Perfect casual pairing with the Classic Tee for a complete outfit"
    },
    {
      "product_id": "prod_12",
      "product_name": "Canvas Belt",
      "rank": 2,
      "reasoning": "Essential accessory to complete the casual look"
    }
  ],
  "user_intent": "Shopping for casual basics, looking for complementary items",
  "pipeline_trace": {
    "candidates_found": 17,
    "after_nli_filter": 8,
    "final_ranked": 2
  }
}
```

### Architecture Benefits

Using NAT's multi-agent orchestration provides:

1. **Single Deployment** — one `nat serve` command runs the entire ARAG pipeline
2. **Shared Resources** — embedders, retrievers, and LLMs defined once, used by all agents
3. **Flexible LLM Assignment** — different models for different tasks (fast for scoring, reasoning for ranking)
4. **Built-in Tracing** — Phoenix integration for debugging the multi-agent workflow
5. **Tool Composition** — coordinator can call specialized agents as tools

### Observability with Phoenix

The Recommendation Agent includes built-in observability using [Arize Phoenix](https://docs.arize.com/phoenix/), providing distributed tracing and LLM call visualization for debugging the multi-agent pipeline.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARAG Agent Pipeline                           │
│  (Coordinator → UUA → NLI → CSA → IRA)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ OTLP traces (port 6006)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Phoenix (Docker Container)                    │
├─────────────────────────────────────────────────────────────────┤
│  - Trace visualization for multi-agent workflow                  │
│  - LLM call details (prompts, completions, tokens)              │
│  - Latency breakdown per agent                                   │
│  - Token usage and cost tracking                                 │
└─────────────────────────────────────────────────────────────────┘
```

Phoenix tracing is configured in `configs/recommendation.yml`:

```yaml
general:
  telemetry:
    tracing:
      phoenix:
        _type: phoenix
        project: "arag-recommendations"
        endpoint: ${PHOENIX_ENDPOINT:-http://localhost:6006/v1/traces}
```

To enable Phoenix tracing, install the Phoenix telemetry package:

```bash
pip install "nvidia-nat[phoenix]"
```

Open http://localhost:6006 to view traces, spans, latency breakdowns, and errors.

### Research Reference

> **ARAG: Agentic Retrieval Augmented Generation for Personalized Recommendation**
> Maragheh et al., SIGIR 2025
> https://arxiv.org/pdf/2506.21931
>
> Key insight: Integrating agentic reasoning into RAG enables better understanding of user intent
> and semantic alignment, leading to significantly improved recommendation quality.

---

## Search Agent

Lightweight RAG search agent that performs semantic product search against the Milvus `product_catalog` collection and returns top-k matches for a query.

**Workflow Type:** `tool_calling_agent` | **Port:** 8005

**Requires:** Milvus running and seeded (see [Shared Infrastructure](#shared-infrastructure-milvus--phoenix)).

```bash
# Start as REST endpoint
nat serve --config_file configs/search.yml --port 8005

# Test with direct input
nat run --config_file configs/search.yml --input '{
  "query": "lightweight summer tee",
  "limit": 3
}'
```

---

## Backend Integration

Each agent has a corresponding service module in `src/merchant/services/`:

| Agent | Service Module | Integration |
|-------|----------------|-------------|
| Promotion | `src/merchant/services/promotion.py` | Direct REST call from checkout flow |
| Post-Purchase | `src/merchant/services/post_purchase.py` | Direct REST call from order lifecycle |
| Recommendation | `src/merchant/services/recommendation_attribution.py` | Attribution tracking; agent called via Apps SDK MCP |
| Search | — | Agent called via Apps SDK MCP |
| All agents | `src/merchant/services/agent_outcomes.py` | Invocation outcome recording and aggregation |

These service modules provide:
- **Enums** for actions, statuses, and options
- **TypedDicts** for input/output formats (contract with agent)
- **Async Client** for calling the agent REST API
- **Service Functions** for the 3-layer logic
- **Fail-Open Behavior** with fallback defaults

### Example: Using Promotion Service

```python
from src.merchant.services.promotion import (
    compute_promotion_context,
    call_promotion_agent,
    apply_promotion_action,
)

# Layer 1: Compute context
context = compute_promotion_context(db, product)

# Layer 2: Call agent
decision = await call_promotion_agent(context)

# Layer 3: Apply action
discount = apply_promotion_action(product.base_price, decision["action"])
```

### Example: Using Post-Purchase Service

```python
from src.merchant.services.post_purchase import (
    build_message_request,
    generate_shipping_message,
    ShippingStatus,
    MessageTone,
    SupportedLanguage,
)

# Build request
request = build_message_request(
    order_id="order_xyz789",
    customer_name="John",
    product_name="Classic Tee",
    status=ShippingStatus.ORDER_SHIPPED,
    company_name="Acme T-Shirts",
    tone=MessageTone.FRIENDLY,
    language=SupportedLanguage.ENGLISH,
    tracking_url="https://track.example.com/abc123",
)

# Generate message
response = await generate_shipping_message(request)
```

## Adding New Agents

To add a new NAT agent:

1. **Create config file** at `configs/<agent-name>.yml`
   - Define LLM configuration
   - Write comprehensive system prompt
   - Specify input/output JSON formats

2. **Create service module** at `src/merchant/services/<agent_name>.py`
   - Define enums for actions/options
   - Create TypedDicts for input/output
   - Implement async client class
   - Add service functions with fail-open behavior

3. **Update documentation**
   - Add to this README
   - Update `AGENTS.md` and `CLAUDE.md`
   - Update `docs/features.md` if implementing a planned feature

4. **Add configuration settings** (optional)
   - Add `<agent>_agent_url` and `<agent>_agent_timeout` to `src/merchant/config.py`

## Project Structure

```
src/agents/
├── pyproject.toml           # Shared dependencies for all agents
├── README.md                # This file
├── register.py              # Custom NAT component registration (ARAG)
├── configs/
│   ├── promotion.yml        # Promotion strategy arbiter (port 8002)
│   ├── post-purchase.yml    # Multilingual shipping messages (port 8003)
│   ├── recommendation.yml   # ARAG multi-agent recommendations (port 8004)
│   ├── recommendation-ultrafast.yml  # ARAG single-prompt variant (optional, speed-optimized)
│   └── search.yml           # RAG product search agent (port 8005)
├── data/
│   └── eval/                # Evaluation datasets (JSON)
│       ├── search_eval.json
│       ├── recommendation_eval.json
│       ├── promotion_eval.json
│       └── post_purchase_eval.json
└── scripts/
    └── seed_milvus.py       # Milvus vector DB initialization
```

## Development

### Code Quality

```bash
ruff check .
ruff format .
pyright
```

### Testing Agent Configs

```bash
nat validate --config_file configs/promotion.yml
nat run --config_file configs/promotion.yml --input '...' --verbose
```

## Evaluation & Profiling

Each agent config includes an `eval` section for automated quality evaluation and performance profiling using NAT's built-in evaluation framework.

### Running Evaluations

```bash
cd src/agents
source .venv/bin/activate

nat eval --config_file configs/promotion.yml
nat eval --config_file configs/post-purchase.yml
nat eval --config_file configs/search.yml
nat eval --config_file configs/recommendation.yml
nat eval --config_file configs/recommendation-ultrafast.yml  # optional variant
```

### Private NIM Environment Variables

When using a private NIM endpoint, set these before running evals:

```bash
export NIM_LLM_BASE_URL=http://<your-nim-host>:8002/v1
export NIM_LLM_MODEL_NAME=nvidia/nemotron-3-nano
export NIM_EMBED_BASE_URL=http://<your-nim-host>:8005/v1
export NIM_EVAL_LLM_BASE_URL=http://<your-nim-host>:8002/v1
export NIM_EVAL_LLM_MODEL_NAME=nvidia/nemotron-3-nano
```

Without these, the configs fall back to the public `https://integrate.api.nvidia.com/v1` endpoint (requires `NVIDIA_API_KEY`).

### Eval Datasets

Test datasets live in `data/eval/` as JSON files with `id`, `question` (input), and `answer` (expected output) fields:

| Dataset | Samples | Agent |
|---------|---------|-------|
| `search_eval.json` | 10 | Search Agent |
| `recommendation_eval.json` | 10 | Recommendation (both variants) |
| `promotion_eval.json` | 10 | Promotion Agent |
| `post_purchase_eval.json` | 10 | Post-Purchase Agent |

### Evaluators by Agent

| Agent | Evaluator | Type | What It Measures |
|-------|-----------|------|------------------|
| **Search** | accuracy | ragas AnswerAccuracy | Are the right products returned? |
| | relevance | ragas ContextRelevance | Are search results relevant to the query? |
| | trajectory | trajectory | Is the tool-calling reasoning correct? |
| **Recommendation** | accuracy | ragas AnswerAccuracy | Are recommendations appropriate? |
| | trajectory | trajectory | Is the ARAG pipeline reasoning correct? |
| **Promotion** | accuracy | ragas AnswerAccuracy | Is the promotion decision correct? |
| | classification_quality | tunable_rag_evaluator | Coverage, correctness, and relevance of decisions |
| **Post-Purchase** | accuracy | ragas AnswerAccuracy | Is the message correct? |
| | generation_quality | tunable_rag_evaluator | Coverage, correctness, and relevance of generated messages |

### Profiler Configuration

All agents include profiler settings that generate performance metrics:

```yaml
profiler:
  token_uniqueness_forecast: true
  workflow_runtime_forecast: true
  compute_llm_metrics: true
  csv_exclude_io_text: true
  prompt_caching_prefixes:
    enable: true
    min_frequency: 0.1
  bottleneck_analysis:
    enable_nested_stack: true
  concurrency_spike_analysis:
    enable: true
    spike_threshold: 5
```

### Profiler Output Files

After each eval run, profiler output is written to `.tmp/eval/<agent>/`:

| File | Description |
|------|-------------|
| `workflow_output.json` | Per-sample execution results |
| `accuracy_output.json` | Evaluator scores per sample |
| `standardized_data_all.csv` | Per-request profiler metrics |
| `workflow_profiling_metrics.json` | Aggregated performance statistics |
| `workflow_profiling_report.txt` | Human-readable summary |
| `gantt_chart.png` | Timeline visualization of pipeline stages |
| `inference_optimization.json` | LLM optimization signals |
| `all_requests_profiler_traces.json` | Full trace events |

### Benchmark Results

Results from eval runs on the full 10-sample datasets:

| Agent | Evaluator | Score | Workflow p95 | LLM Latency p95 |
|-------|-----------|-------|-------------|-----------------|
| Promotion | accuracy | 0.90 | 0.93s | 0.90s |
| | classification_quality | 0.82 | | |
| Post-Purchase | accuracy | 1.00 | 1.12s | 1.12s |
| | generation_quality | 0.93 | | |
| Search | relevance | 1.00 | 3.00s | 1.97s |
| | accuracy | 0.70 | | |
| | trajectory | 0.40 | | |
| Recommendation | accuracy | 0.80 | 5.08s | 1.46s |
| | trajectory | 0.90 | | |
| Recommendation (Ultrafast) | accuracy | 0.70 | 2.74s | 2.12s |
| | trajectory | 0.85 | | |

### Adding Evals to a New Agent

When creating a new agent config, add an `eval` section at the bottom:

```yaml
llms:
  # ... your workflow LLMs ...
  nim_eval_llm:
    _type: nim
    base_url: ${NIM_EVAL_LLM_BASE_URL:-https://integrate.api.nvidia.com/v1}
    model_name: ${NIM_EVAL_LLM_MODEL_NAME:-nvidia/nemotron-3-nano-30b-a3b}
    temperature: 0.0
    max_tokens: 1024
    chat_template_kwargs:
      enable_thinking: false

eval:
  general:
    output_dir: ./.tmp/eval/<agent_name>
    verbose: true
    max_concurrency: 2
    dataset:
      _type: json
      file_path: data/eval/<agent>_eval.json
      id_key: "id"
      structure:
        question_key: question
        answer_key: answer
    profiler:
      token_uniqueness_forecast: true
      workflow_runtime_forecast: true
      compute_llm_metrics: true
      csv_exclude_io_text: true
  evaluators:
    accuracy:
      _type: ragas
      metric: AnswerAccuracy
      llm_name: nim_eval_llm
```

## Troubleshooting

### API Key Issues

```bash
echo $NVIDIA_API_KEY
```

### Model Not Available

Check available models at [NVIDIA NIM](https://build.nvidia.com/explore/discover) and update the model in the config file.

### Invalid JSON Output

If the agent returns non-JSON output, check:
1. Temperature is set low (0.1-0.3) for deterministic responses
2. Input is valid JSON
3. System prompt clearly specifies JSON-only output

### Connection Refused

Ensure the agent server is running:
```bash
curl http://localhost:8002/health
nat serve --config_file configs/promotion.yml --port 8002
```

### Phoenix Tracing Issues

| Issue | Solution |
|-------|----------|
| No traces appearing | Verify Phoenix is running: `curl http://localhost:6006/healthz` |
| Connection refused | Check `PHOENIX_ENDPOINT` env var matches your Phoenix URL |
| Traces missing spans | Ensure `nvidia-nat[phoenix]` is installed |

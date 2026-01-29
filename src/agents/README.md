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

### Key Principle

> **The LLM never computes prices, performs calculations, or accesses databases directly.**
> It selects strategies from pre-approved sets or generates content from structured context.
> All math, data access, and enforcement are deterministic.

## Available Agents

| Agent | Config | Port | Purpose |
|-------|--------|------|---------|
| Promotion Agent | `configs/promotion.yml` | 8002 | Strategy arbiter for dynamic pricing |
| Post-Purchase Agent | `configs/post-purchase.yml` | 8003 | Multilingual shipping message generator |
| Recommendation Agent (ARAG) | `configs/recommendation-ultrafast.yml` | 8004 | Multi-agent personalized recommendations |

### ARAG Recommendation Agent Architecture

The Recommendation Agent implements an **Agentic Retrieval Augmented Generation (ARAG)** framework based on [SIGIR 2025 research](https://arxiv.org/pdf/2506.21931). This multi-agent approach achieves **42% improvement in NDCG@5** over vanilla RAG.

**Key Design**: All 4 ARAG agents are orchestrated within a **single NAT workflow** using NAT's multi-agent pattern, where specialized agents are defined as `functions` and coordinated by a main `react_agent` workflow.

```
┌─────────────────────────────────────────────────────────────────┐
│            ARAG MULTI-AGENT ORCHESTRATION (Single YAML)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Recommendation Coordinator (react_agent workflow)       │   │
│  │  - Orchestrates all specialized agents                   │   │
│  │  - Uses product_search tool for RAG retrieval            │   │
│  │  - Delegates to specialist agents as needed              │   │
│  └─────────────────────┬───────────────────────────────────┘   │
│                        │                                        │
│           ┌────────────┼────────────┬───────────┐              │
│           │            │            │           │              │
│           ▼            ▼            ▼           ▼              │
│  ┌────────────┐ ┌────────────┐ ┌────────┐ ┌──────────┐        │
│  │ product_   │ │ user_      │ │ nli_   │ │ context_ │        │
│  │ search     │ │ understand │ │ agent  │ │ summary  │        │
│  │ (RAG tool) │ │ _agent     │ │        │ │ _agent   │        │
│  └────────────┘ └────────────┘ └────────┘ └──────────┘        │
│                                                                 │
│  All agents share: embedders, retrievers, LLM configs          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

See `docs/features.md` Feature 7 for detailed implementation plan.

## Installation

```bash
# Navigate to the agents directory
cd src/agents

# Create virtual environment with uv (recommended)
uv venv --python 3.12 .venv
source .venv/bin/activate

# Install with dev dependencies
uv pip install -e ".[dev]" --prerelease=allow

# Or with pip
pip install -e ".[dev]"
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM | Yes |

### Setting API Key

```bash
export NVIDIA_API_KEY=<your_nvidia_api_key>
```

## Running Agents

### Promotion Agent

The Promotion Agent selects optimal promotion actions based on pre-computed business signals.

```bash
# Start as REST endpoint (for ACP integration)
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

### Post-Purchase Agent

The Post-Purchase Agent generates multilingual shipping update messages based on brand persona and order context.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Order Lifecycle Event                        │
│         (order_confirmed → shipped → out_for_delivery → delivered)
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
│  - Queue for webhook delivery (Feature 11)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Webhook Delivery (Future)                    │
│               POST to WEBHOOK_URL with signed payload           │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Start as REST endpoint (for ACP integration)
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

## Agent Configuration Reference

### Promotion Agent (`configs/promotion.yml`)

**Workflow Type:** `chat_completion`

**Input Format:**

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | Product identifier |
| `product_name` | string | Human-readable product name |
| `base_price_cents` | int | Original price in cents (context only) |
| `stock_count` | int | Current inventory units |
| `min_margin` | float | Minimum profit margin (0.18 = 18%) |
| `lowest_competitor_price_cents` | int | Lowest competitor price in cents |
| `signals.inventory_pressure` | string | "high" or "low" |
| `signals.competition_position` | string | "above_market", "at_market", or "below_market" |
| `allowed_actions` | list[string] | Actions filtered by margin constraints |

**Available Actions:**

| Action | Description | Discount |
|--------|-------------|----------|
| `NO_PROMO` | No discount applied | 0% |
| `DISCOUNT_5_PCT` | 5% discount | 5% |
| `DISCOUNT_10_PCT` | 10% discount | 10% |
| `DISCOUNT_15_PCT` | 15% discount | 15% |
| `FREE_SHIPPING` | Free shipping benefit | 0% (price) |

### Post-Purchase Agent (`configs/post-purchase.yml`)

**Workflow Type:** `chat_completion`

**Input Format:**

| Field | Type | Description |
|-------|------|-------------|
| `brand_persona.company_name` | string | Retailer's name |
| `brand_persona.tone` | string | "friendly", "professional", "casual", "urgent" |
| `brand_persona.preferred_language` | string | "en", "es", "fr" |
| `order.order_id` | string | Order identifier |
| `order.customer_name` | string | Customer's first name |
| `order.product_name` | string | Name of purchased product |
| `order.tracking_url` | string | Package tracking URL (optional) |
| `order.estimated_delivery` | string | ISO date format (optional) |
| `status` | string | Shipping status |

**Supported Tones:**

| Tone | Description |
|------|-------------|
| `friendly` | Warm, enthusiastic, uses emojis sparingly |
| `professional` | Formal, courteous, no emojis |
| `casual` | Relaxed, informal, may use emojis |
| `urgent` | Direct, action-oriented, time-sensitive |

**Shipping Statuses:**

| Status | Description |
|--------|-------------|
| `order_confirmed` | Order received and confirmed |
| `order_shipped` | Package shipped, tracking available |
| `out_for_delivery` | Package arriving today |
| `delivered` | Package delivered |

### Recommendation Agent (`configs/recommendation-ultrafast.yml`)

**Workflow Type:** `react_agent` (multi-agent orchestration)

The Recommendation Agent uses an ARAG (Agentic RAG) architecture with 4 specialized sub-agents orchestrated by a coordinator workflow.

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
│  │       Recommendation Coordinator (react_agent workflow)    │ │
│  │  - Receives cart items + session context                   │ │
│  │  - Orchestrates specialized agents via tool calls          │ │
│  │  - Aggregates results into final response                  │ │
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
│  │       Recommendation Coordinator (aggregates results)      │ │
│  │  - Formats recommendations array with rankings             │ │
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

**Infrastructure (Docker Compose):**

The Recommendation Agent requires Milvus for vector search and Phoenix for observability. Both are defined in `docker-compose.yml` at the project root.

| Service | Port | Purpose |
|---------|------|---------|
| Milvus | 19530 | Vector similarity search for product embeddings |
| Phoenix | 6006 | LLM observability UI and trace collection |
| MinIO | 9001 | Object storage for Milvus (console optional) |

```bash
# Start infrastructure
docker compose up -d

# Stop infrastructure
docker compose down

# Stop and remove all data
docker compose down -v
```

| Health Check | Command |
|--------------|---------|
| Milvus | `curl -s http://localhost:9091/healthz` |
| Phoenix | `curl -s http://localhost:6006/healthz` |

| UI | URL |
|----|-----|
| Phoenix (traces, LLM calls) | http://localhost:6006 |
| MinIO Console (optional) | http://localhost:9001 |

**Prerequisites:**

1. **Start Infrastructure (Milvus + Phoenix):**
   ```bash
   # From project root
   docker compose up -d
   
   # Verify services are running
   curl -s http://localhost:9091/healthz  # Milvus - Should return "OK"
   curl -s http://localhost:6006/healthz  # Phoenix - Should return "OK"
   ```

2. **Seed Product Catalog with Embeddings:**
   ```bash
   cd src/agents
   source .venv/bin/activate
   
   # Install dependencies (includes pymilvus)
   uv pip install -e ".[dev]" --prerelease=allow
   
   # Seed the product catalog
   python scripts/seed_milvus.py
   ```

**Running the Agent:**

```bash
# Start as REST endpoint
nat serve --config_file configs/recommendation-ultrafast.yml --port 8004

# Test with curl
curl -X POST http://localhost:8004/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input_message": "{\"cart_items\": [{\"product_id\": \"prod_1\", \"name\": \"Classic Tee\", \"category\": \"tops\", \"price\": 2500}], \"session_context\": {}}"
  }'
```

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

**Sub-Agents:**

| Agent | Type | Purpose |
|-------|------|---------|
| `product_search` | RAG retriever | Vector search for candidate products |
| `user_understanding_agent` | chat_completion | Infers buyer preferences from cart/context |
| `nli_alignment_agent` | chat_completion | Scores semantic alignment with user intent |
| `context_summary_agent` | chat_completion | Synthesizes signals into focused context |
| `item_ranker_agent` | chat_completion | Produces final ranked recommendations |

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `NVIDIA_API_KEY` | NVIDIA NIM API key | Required |
| `MILVUS_URI` | Milvus vector database URI | `http://localhost:19530` |

## Backend Integration

Each agent has a corresponding service module in `src/merchant/services/`:

| Agent | Service Module |
|-------|----------------|
| Promotion | `src/merchant/services/promotion.py` |
| Post-Purchase | `src/merchant/services/post_purchase.py` |

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
└── configs/
    ├── promotion.yml        # Promotion strategy arbiter (port 8002)
    ├── post-purchase.yml    # Multilingual shipping messages (port 8003)
    ├── recommendation.yml   # ARAG multi-agent recommendations (full version)
    └── recommendation-ultrafast.yml  # ARAG recommendations optimized for speed (port 8004)
```

## Development

### Code Quality

```bash
# Linting
ruff check .

# Formatting
ruff format .

# Type checking
pyright
```

### Testing Agent Configs

```bash
# Validate config
nat validate --config_file configs/promotion.yml

# Run with verbose output
nat run --config_file configs/promotion.yml --input '...' --verbose
```

## Troubleshooting

### API Key Issues

Verify your API key is set:
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
# Check if server is running
curl http://localhost:8002/health

# Start server if not running
nat serve --config_file configs/promotion.yml --port 8002
```

## ARAG Recommendation Agent (Planned - Feature 7)

### Overview

The Recommendation Agent uses an **Agentic Retrieval Augmented Generation (ARAG)** architecture, a research-backed approach from [Walmart Global Tech (SIGIR 2025)](https://arxiv.org/pdf/2506.21931) that significantly outperforms traditional RAG for personalized recommendations.

### Why ARAG?

Traditional RAG retrieves documents based on embedding similarity alone. ARAG introduces **multi-agent reasoning** into the retrieval pipeline:

| Approach | NDCG@5 | Hit@5 | Improvement |
|----------|--------|-------|-------------|
| Recency-based | 0.309 | 0.395 | - |
| Vanilla RAG | 0.299 | 0.379 | - |
| **ARAG** | **0.439** | **0.535** | **+42%** |

### Agent Responsibilities

| Agent | Responsibility | Input | Output |
|-------|----------------|-------|--------|
| **User Understanding (UUA)** | Infer buyer preferences | Cart items, session context | Preference summary JSON |
| **NLI Agent** | Score semantic alignment | Candidate products, user intent | Alignment scores (0-1) |
| **Context Summary (CSA)** | Synthesize signals | UUA output, NLI scores | Focused context JSON |
| **Item Ranker (IRA)** | Final ranking | User summary, context | Ranked recommendations |

### Complete NAT Configuration (`configs/recommendation-ultrafast.yml`)

All ARAG agents are orchestrated in a **single YAML file** using NAT's multi-agent pattern.

### Running the ARAG Agent

```bash
# Start as REST endpoint (single command for all agents)
nat serve --config_file configs/recommendation-ultrafast.yml --port 8004

# Test with direct input
nat run --config_file configs/recommendation-ultrafast.yml --input '{
  "cart_items": [
    {"product_id": "prod_1", "name": "Classic Tee", "category": "tops", "price": 2500}
  ],
  "session_context": {
    "browse_history": ["casual wear", "summer clothes"],
    "price_range_viewed": [2000, 4000]
  }
}'
```

### Example Output

```json
{
  "recommendations": [
    {
      "product_id": "prod_5",
      "product_name": "Khaki Shorts",
      "rank": 1,
      "reasoning": "Perfect casual pairing with Classic Tee for a complete summer outfit"
    },
    {
      "product_id": "prod_8",
      "product_name": "Canvas Sneakers",
      "rank": 2,
      "reasoning": "Complements casual style, within user's price range"
    }
  ],
  "user_intent": "Shopping for casual summer basics, price-conscious",
  "pipeline_trace": {
    "candidates_found": 20,
    "after_nli_filter": 8,
    "final_ranked": 2
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM | Required |
| `MILVUS_URI` | Milvus vector database URI | `http://localhost:19530` |
| `PHOENIX_ENDPOINT` | Phoenix observability endpoint | `http://localhost:6006` |

### Architecture Benefits

Using NAT's multi-agent orchestration provides:

1. **Single Deployment**: One `nat serve` command runs the entire ARAG pipeline
2. **Shared Resources**: Embedders, retrievers, and LLMs defined once, used by all agents
3. **Flexible LLM Assignment**: Different models for different tasks (fast for scoring, reasoning for ranking)
4. **Built-in Tracing**: Phoenix integration for debugging the multi-agent workflow
5. **Tool Composition**: Coordinator can call specialized agents as tools

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

**Starting Phoenix:**

```bash
# Start Phoenix alongside Milvus (from project root)
docker compose up -d

# Verify Phoenix is running
curl -s http://localhost:6006/healthz  # Should return "OK"
```

**Accessing the Phoenix UI:**

Open http://localhost:6006 in your browser to view:
- **Traces**: End-to-end request traces showing all agent calls
- **Spans**: Individual LLM calls with prompts, completions, and token counts
- **Latency**: Time breakdown for each step in the pipeline
- **Errors**: Failed calls and error details

**Configuration:**

Phoenix tracing is configured in `configs/recommendation-ultrafast.yml`:

```yaml
general:
  telemetry:
    tracing:
      phoenix:
        _type: phoenix
        project_name: "arag-recommendations"
        endpoint: ${PHOENIX_ENDPOINT:-http://localhost:6006}
```

**Installation:**

To enable Phoenix tracing, install the Phoenix telemetry package:

```bash
pip install "nvidia-nat[phoenix]"
```

**Troubleshooting Phoenix:**

| Issue | Solution |
|-------|----------|
| No traces appearing | Verify Phoenix is running: `curl http://localhost:6006/healthz` |
| Connection refused | Check `PHOENIX_ENDPOINT` env var matches your Phoenix URL |
| Traces missing spans | Ensure `nvidia-nat[phoenix]` is installed |

### Service Integration

The recommendation service calls the ARAG agent as a single endpoint:

```python
# src/merchant/services/recommendation.py (planned)
async def get_recommendations(
    cart_items: list[dict], 
    session_context: dict | None = None
) -> list[Recommendation]:
    """
    Call ARAG Recommendation Agent for cross-sell suggestions.
    
    Layer 1 (Deterministic): Validate cart items exist in catalog
    Layer 2 (ARAG Agent): Multi-agent recommendation pipeline  
    Layer 3 (Deterministic): Validate recommendations are in-stock
    """
    # Layer 1: Validate inputs
    validated_items = validate_cart_items(cart_items)
    
    # Layer 2: Call ARAG agent (single REST call)
    response = await httpx.post(
        f"{settings.recommendation_agent_url}/generate",
        json={
            "input": json.dumps({
                "cart_items": validated_items,
                "session_context": session_context or {}
            })
        },
        timeout=15.0  # Higher timeout for multi-agent pipeline
    )
    
    result = response.json()
    
    # Layer 3: Validate and filter recommendations
    recommendations = validate_recommendations(
        result.get("recommendations", []),
        exclude_ids=[item["product_id"] for item in cart_items]
    )
    
    return recommendations
```

### Research Reference

> **ARAG: Agentic Retrieval Augmented Generation for Personalized Recommendation**
> Maragheh et al., SIGIR 2025
> https://arxiv.org/pdf/2506.21931
>
> Key insight: Integrating agentic reasoning into RAG enables better understanding of user intent
> and semantic alignment, leading to significantly improved recommendation quality.
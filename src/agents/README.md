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
| Recommendation Agent (ARAG) | `configs/recommendation.yml` | 8004 | Multi-agent personalized recommendations (planned) |

### ARAG Recommendation Agent Architecture (Planned - Feature 7)

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
    └── recommendation.yml   # ARAG multi-agent recommendations (port 8004, planned)
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

### Complete NAT Configuration (`configs/recommendation.yml`)

All ARAG agents are orchestrated in a **single YAML file** using NAT's multi-agent pattern:

```yaml
# configs/recommendation.yml
# ARAG Multi-Agent Recommendation System
# Based on: https://arxiv.org/pdf/2506.21931 (SIGIR 2025)

general:
  telemetry:
    logging:
      console:
        _type: console
        level: info
    # Optional: Enable tracing for debugging
    # tracing:
    #   phoenix:
    #     _type: phoenix
    #     endpoint: "http://localhost:6006/v1/traces"
    #     project: "acp_recommendations"

# =============================================================================
# EMBEDDERS - Semantic embeddings for product search
# =============================================================================
embedders:
  product_embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5
    truncate: "END"

# =============================================================================
# RETRIEVERS - Vector search for candidate products
# =============================================================================
retrievers:
  product_retriever:
    _type: milvus_retriever
    uri: ${MILVUS_URI:-http://localhost:19530}
    collection_name: "product_catalog"
    embedding_model: product_embedder
    top_k: 20
    content_field: "description"
    vector_field: "embedding"

# =============================================================================
# FUNCTIONS - RAG tools and specialized ARAG agents
# =============================================================================
functions:
  # -------------------------------------------------------------------------
  # RAG Tool: Product search using embeddings
  # -------------------------------------------------------------------------
  product_search:
    _type: nat_retriever
    retriever: product_retriever
    topic: "Product catalog search"
    description: |
      Search the product catalog for items similar to the query.
      Use this to find candidate products for cross-sell recommendations.
      Returns product metadata: id, name, description, category, price, stock.

  # -------------------------------------------------------------------------
  # User Understanding Agent (UUA) - Infers buyer preferences
  # -------------------------------------------------------------------------
  user_understanding_agent:
    _type: react_agent
    description: |
      Expert agent for understanding user preferences from shopping context.
      Analyzes cart items, session history, and buyer signals to infer:
      - Shopping intent and goals
      - Price sensitivity level
      - Style and category preferences
      - Complementary product needs
    verbose: true
    llm_name: nemotron_fast
    tool_names: []  # Pure reasoning, no tools needed
    system_prompt: |
      You are a User Understanding Agent for e-commerce personalization.
      
      Analyze the shopping context and infer the user's preferences:
      - What category of products are they interested in?
      - What price sensitivity do they exhibit? (low/medium/high)
      - What style or attributes seem important?
      - What complementary needs might they have for cross-sell?
      
      Output ONLY valid JSON:
      {
        "inferred_intent": "brief description of shopping goal",
        "price_sensitivity": "low|medium|high",
        "style_preferences": ["list", "of", "style", "attributes"],
        "complementary_categories": ["category1", "category2"]
      }

  # -------------------------------------------------------------------------
  # NLI Agent - Scores semantic alignment of candidates
  # -------------------------------------------------------------------------
  nli_alignment_agent:
    _type: react_agent
    description: |
      Expert agent for scoring semantic alignment between candidate products
      and the user's inferred intent. Uses Natural Language Inference to determine
      if each product SUPPORTS, is NEUTRAL to, or CONTRADICTS the user's needs.
    verbose: true
    llm_name: nemotron_fast
    tool_names: []  # Pure reasoning, no tools needed
    system_prompt: |
      You are a Natural Language Inference Agent for product relevance scoring.
      
      Given candidate products and user intent, score each product's alignment:
      - SUPPORTS: Product directly matches or complements the intent
      - NEUTRAL: Product is tangentially related
      - CONTRADICTS: Product doesn't fit the context (e.g., duplicate category)
      
      Output ONLY valid JSON array:
      [
        {
          "product_id": "string",
          "alignment": "supports|neutral|contradicts",
          "relevance_score": 0.0-1.0,
          "reasoning": "brief explanation"
        }
      ]

  # -------------------------------------------------------------------------
  # Context Summary Agent (CSA) - Synthesizes signals into focused context
  # -------------------------------------------------------------------------
  context_summary_agent:
    _type: react_agent
    description: |
      Expert agent for synthesizing user preferences and NLI alignment scores
      into a focused recommendation context. Filters and prioritizes candidates
      based on business constraints (in-stock, margin) and semantic fit.
    verbose: true
    llm_name: nemotron_fast
    tool_names: []  # Pure reasoning, no tools needed
    system_prompt: |
      You are a Context Summary Agent that synthesizes recommendation signals.
      
      Given:
      - User preference summary from User Understanding Agent
      - NLI alignment scores for candidate products
      - Business constraints (in-stock, meets margin requirements)
      
      Create a focused context summary highlighting:
      - Top 5 relevant candidates that pass all filters
      - Key matching attributes for each
      - Cross-sell rationale explaining why each fits
      
      Output ONLY valid JSON:
      {
        "summary": "brief context for ranker describing user needs",
        "top_candidates": [
          {
            "product_id": "string",
            "match_reasons": ["reason1", "reason2"],
            "cross_sell_fit": "brief explanation"
          }
        ]
      }

  # -------------------------------------------------------------------------
  # Item Ranker Agent (IRA) - Produces final ranked recommendations
  # -------------------------------------------------------------------------
  item_ranker_agent:
    _type: react_agent
    description: |
      Expert agent for producing the final ranked list of 2-3 cross-sell
      recommendations. Considers user preferences, context summary, and
      maximizes relevance while ensuring diversity.
    verbose: true
    llm_name: nemotron_reasoning
    tool_names: []  # Pure reasoning, no tools needed
    system_prompt: |
      You are an Item Ranker Agent for personalized recommendations.
      
      Given the user context and filtered candidates, produce a final ranking.
      Consider:
      1. User's demonstrated preferences from cart
      2. Semantic alignment with shopping intent
      3. Cross-sell potential (complementary, not duplicate)
      4. Value proposition for the customer
      5. Diversity (don't recommend 3 similar items)
      
      Output EXACTLY 2-3 recommendations in JSON:
      {
        "recommendations": [
          {
            "product_id": "string",
            "rank": 1,
            "reasoning": "why this recommendation makes sense for the user"
          }
        ]
      }

# =============================================================================
# LLM PROVIDERS - Different models for different tasks
# =============================================================================
llms:
  # Fast model for classification and scoring tasks (UUA, NLI, CSA)
  nemotron_fast:
    _type: nim
    model_name: nvidia/llama-3.1-nemotron-nano-8b-v1
    temperature: 0.1
    max_tokens: 1024
    top_p: 0.9

  # Reasoning model for final ranking (needs more nuanced decisions)
  nemotron_reasoning:
    _type: nim
    model_name: nvidia/llama-3.1-nemotron-70b-instruct
    temperature: 0.2
    max_tokens: 2048
    top_p: 0.85

  # Coordinator model (orchestrates the pipeline)
  coordinator_llm:
    _type: nim
    model_name: nvidia/llama-3.1-nemotron-70b-instruct
    temperature: 0.1
    max_tokens: 4096
    top_p: 0.9

# =============================================================================
# MAIN WORKFLOW - Recommendation Coordinator
# =============================================================================
workflow:
  _type: react_agent
  name: arag_recommendation_coordinator
  workflow_alias: "recommendation_agent"
  llm_name: coordinator_llm
  verbose: true
  tool_names:
    - product_search
    - user_understanding_agent
    - nli_alignment_agent
    - context_summary_agent
    - item_ranker_agent
  description: |
    ARAG Recommendation Coordinator - orchestrates multi-agent pipeline for
    personalized cross-sell recommendations based on cart items and session context.
  system_prompt: |
    You are the ARAG Recommendation Coordinator for an e-commerce platform.
    
    Your task: Given a user's cart items and optional session context, produce
    2-3 personalized cross-sell recommendations using your specialized agents.
    
    WORKFLOW (follow this order):
    
    1. RETRIEVE CANDIDATES: Use `product_search` to find products similar to
       or complementary to the cart items. Search for each cart item category.
    
    2. UNDERSTAND USER: Call `user_understanding_agent` with the cart items
       and session context to infer user preferences and intent.
    
    3. SCORE ALIGNMENT: Call `nli_alignment_agent` with the candidate products
       and the user preference summary to score semantic alignment.
    
    4. SYNTHESIZE CONTEXT: Call `context_summary_agent` with the user summary
       and NLI scores to create a focused recommendation context.
    
    5. RANK ITEMS: Call `item_ranker_agent` with the user summary and context
       summary to produce the final 2-3 ranked recommendations.
    
    OUTPUT FORMAT (always return this JSON):
    {
      "recommendations": [
        {
          "product_id": "string",
          "product_name": "string", 
          "rank": 1,
          "reasoning": "why this is recommended"
        }
      ],
      "user_intent": "summary of inferred user intent",
      "pipeline_trace": {
        "candidates_found": 20,
        "after_nli_filter": 8,
        "final_ranked": 3
      }
    }
    
    CONSTRAINTS:
    - Never recommend items already in the cart
    - Only recommend in-stock items
    - Respect margin requirements (pre-filtered by retriever)
    - Ensure diversity in recommendations
```

### Running the ARAG Agent

```bash
# Start as REST endpoint (single command for all agents)
nat serve --config_file configs/recommendation.yml --port 8004

# Test with direct input
nat run --config_file configs/recommendation.yml --input '{
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

### Architecture Benefits

Using NAT's multi-agent orchestration provides:

1. **Single Deployment**: One `nat serve` command runs the entire ARAG pipeline
2. **Shared Resources**: Embedders, retrievers, and LLMs defined once, used by all agents
3. **Flexible LLM Assignment**: Different models for different tasks (fast for scoring, reasoning for ranking)
4. **Built-in Tracing**: Phoenix integration for debugging the multi-agent workflow
5. **Tool Composition**: Coordinator can call specialized agents as tools

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

## License

Part of the Retail Agentic Commerce project.

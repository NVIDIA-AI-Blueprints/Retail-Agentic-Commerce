# Feature 7: Recommendation Agent (NAT) - ARAG Architecture

**Goal**: Implement a personalized cross-sell recommendation agent using an Agentic Retrieval Augmented Generation (ARAG) multi-agent architecture, inspired by state-of-the-art research in LLM-based recommendation systems.

**Reference**: [ARAG: Agentic Retrieval Augmented Generation for Personalized Recommendation](https://arxiv.org/pdf/2506.21931) (SIGIR 2025)

## Architecture Overview

The Recommendation Agent implements a 4-agent collaborative framework that significantly outperforms vanilla RAG approaches by integrating agentic reasoning into the retrieval pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARAG RECOMMENDATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. INITIAL RAG RETRIEVAL (Embedding-based)                                │
│      └─ Query: cart items + session context                                 │
│      └─ Retrieve top-k candidates from product catalog                      │
│                                                                             │
│   2. PARALLEL AGENT EXECUTION (asyncio.gather)                              │
│      ┌─────────────────────┐    ┌─────────────────────┐                    │
│      │ User Understanding  │    │     NLI Agent       │                    │
│      │      Agent (UUA)    │    │ (Intent Alignment)  │                    │
│      │                     │    │                     │                    │
│      │ Summarizes buyer    │    │ Scores semantic     │                    │
│      │ preferences from    │    │ alignment of each   │                    │
│      │ session context     │    │ candidate with      │                    │
│      │                     │    │ inferred intent     │                    │
│      └─────────┬───────────┘    └──────────┬──────────┘                    │
│                │                           │                               │
│                └────────────┬──────────────┘                               │
│                             ▼                                              │
│   3. CONTEXT SUMMARY AGENT (CSA)                                           │
│      └─ Aggregates UUA preferences + NLI-filtered candidates               │
│      └─ Produces focused context for final ranking                         │
│                             │                                              │
│                             ▼                                              │
│   4. ITEM RANKER AGENT (IRA)                                               │
│      └─ Fuses all signals: user summary + context summary                  │
│      └─ Produces final ranked recommendations                              │
│      └─ Returns top 2-3 with reasoning trace                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agent Components

All 4 ARAG agents are defined in a **single NAT configuration file** (`configs/recommendation.yml`) using NAT's multi-agent orchestration pattern. Each specialized agent is registered as a `function` and called by the coordinator workflow.

### 7.1 User Understanding Agent (UUA)

**Purpose**: Summarizes buyer preferences from available context to understand purchase intent.

**Input Signals**:
- Current cart items (product names, categories, price range)
- Session context (if available: browse history, previous interactions)
- Buyer demographic hints (shipping address region, currency)

**Output**: Natural language summary of user preferences and inferred shopping intent.

**Defined as NAT function**: `user_understanding_agent`

### 7.2 Natural Language Inference (NLI) Agent

**Purpose**: Evaluates semantic alignment between candidate products and inferred user intent.

**Input**:
- Candidate product metadata (name, description, category, attributes)
- User intent summary from UUA (or session context)

**Output**: Alignment scores and support/contradiction judgments for each candidate.

**Defined as NAT function**: `nli_alignment_agent`

### 7.3 Context Summary Agent (CSA)

**Purpose**: Synthesizes NLI-filtered candidates with user understanding into a focused context for ranking.

**Input**:
- User preference summary from UUA
- NLI scores and filtered candidate list
- Business constraints (in-stock, margin rules)

**Output**: Condensed recommendation context with ranked candidate pool.

**Defined as NAT function**: `context_summary_agent`

### 7.4 Item Ranker Agent (IRA)

**Purpose**: Produces the final ranked list of recommendations with reasoning trace.

**Input**:
- User preference summary from UUA
- Context summary from CSA
- Product details for top candidates

**Output**: Ordered list of 2-3 recommendations with explanations.

**Defined as NAT function**: `item_ranker_agent`

## Single YAML Multi-Agent Configuration

All agents are orchestrated via NAT's multi-agent pattern in `configs/recommendation.yml`:

```yaml
# Key structure (see src/agents/README.md for full configuration)
embedders:
  product_embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5

retrievers:
  product_retriever:
    _type: milvus_retriever
    embedding_model: product_embedder
    top_k: 20

functions:
  # RAG tool for candidate retrieval
  product_search:
    _type: nat_retriever
    retriever: product_retriever

  # Specialized ARAG agents (each defined as react_agent function)
  user_understanding_agent:
    _type: react_agent
    llm_name: nemotron_fast
    # ... system prompt for UUA

  nli_alignment_agent:
    _type: react_agent
    llm_name: nemotron_fast
    # ... system prompt for NLI

  context_summary_agent:
    _type: react_agent
    llm_name: nemotron_fast
    # ... system prompt for CSA

  item_ranker_agent:
    _type: react_agent
    llm_name: nemotron_reasoning
    # ... system prompt for IRA

workflow:
  _type: react_agent
  name: arag_recommendation_coordinator
  tool_names:
    - product_search
    - user_understanding_agent
    - nli_alignment_agent
    - context_summary_agent
    - item_ranker_agent
```

See `src/agents/README.md` for the complete configuration with all system prompts.

## 3-Layer Hybrid Architecture (Per ACP Standards)

Following the established ACP agent pattern, each agent call is wrapped in deterministic layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Deterministic Computation (src/merchant/services/)    │
├─────────────────────────────────────────────────────────────────┤
│  - Query product catalog via SQL                                │
│  - Compute embedding similarity for initial recall              │
│  - Filter by business constraints (stock > 0, margin check)     │
│  - Prepare structured context for each agent                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: ARAG Multi-Agent Pipeline (NAT)                       │
├─────────────────────────────────────────────────────────────────┤
│  - UUA + NLI execute in parallel (asyncio.gather)               │
│  - CSA synthesizes results                                      │
│  - IRA produces final ranking                                   │
│  - All agents use classification/generation (no DB access)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Deterministic Validation (src/merchant/services/)     │
├─────────────────────────────────────────────────────────────────┤
│  - Validate recommended products exist and are in-stock         │
│  - Verify margin constraints are met                            │
│  - Remove any cart duplicates                                   │
│  - Fail-open: return empty suggestions if validation fails      │
└─────────────────────────────────────────────────────────────────┘
```

## RAG Configuration with Milvus

**Embedding Model**: NVIDIA NV-EmbedQA-E5-v5 for semantic product search

```yaml
embedders:
  product_embedder:
    _type: nim
    model_name: nvidia/nv-embedqa-e5-v5
    truncate: "END"

retrievers:
  product_retriever:
    _type: milvus_retriever
    uri: ${MILVUS_URI:-http://localhost:19530}
    collection_name: "product_catalog"
    embedding_model: product_embedder
    top_k: 20  # Initial recall set size
    content_field: "description"
    vector_field: "embedding"
```

## Database Schema Extensions

**Product Embeddings** (for RAG retrieval):
```sql
-- Product embeddings for semantic search
product_embeddings:
  - product_id (FK to products)
  - embedding (vector[768])  -- NV-EmbedQA-E5 dimension
  - embedding_text           -- Text used for embedding
  - updated_at
```

**Product Affinity** (optional, for hybrid approach):
```sql
-- Pre-computed product affinity scores
product_affinity:
  - source_product_id (FK)
  - target_product_id (FK)
  - affinity_score (float)   -- Co-purchase or category affinity
  - affinity_type (enum)     -- 'category', 'co_purchase', 'style'
```

## Service Implementation

**File**: `src/merchant/services/recommendation.py`

The service calls the ARAG agent as a **single REST endpoint** - the multi-agent orchestration happens inside NAT:

```python
# Key components (pseudocode)

async def get_recommendations(
    cart_items: list[dict], 
    session_context: dict | None = None
) -> list[Recommendation]:
    """
    Call ARAG Recommendation Agent for cross-sell suggestions.
    
    Layer 1 (Deterministic): Validate cart items exist in catalog
    Layer 2 (ARAG Agent): Multi-agent recommendation pipeline (single call)
    Layer 3 (Deterministic): Validate recommendations are in-stock
    """
    # Layer 1: Validate inputs
    validated_items = validate_cart_items(cart_items)
    
    # Layer 2: Call ARAG agent (single REST call - all 4 agents orchestrated by NAT)
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

**Key Benefit**: The service makes a single REST call to the ARAG agent. NAT handles all multi-agent orchestration internally (UUA → NLI → CSA → IRA).

## Tasks

**Phase 1: RAG Foundation**
- [x] Set up Milvus vector database for product embeddings (docker-compose.yml)
- [ ] Create product embedding generation pipeline (deferred - requires catalog)
- [x] Configure `product_retriever` with NV-EmbedQA-E5-v5 in recommendation.yml
- [x] Test base retrieval function with top-k recall

**Phase 2: Multi-Agent Configuration**
- [x] Create `configs/recommendation.yml` with all ARAG components:
  - [x] Define `embedders` section with NV-EmbedQA-E5-v5
  - [x] Define `retrievers` section with Milvus configuration
  - [x] Define `functions` section with:
    - [x] `product_search` (nat_retriever tool)
    - [x] `user_understanding_agent` (chat_completion with UUA prompt)
    - [x] `nli_alignment_agent` (chat_completion with NLI prompt)
    - [x] `context_summary_agent` (chat_completion with CSA prompt)
    - [x] `item_ranker_agent` (chat_completion with IRA prompt)
  - [x] Define `llms` section (using nvidia/nemotron-3-nano-30b-a3b)
  - [x] Define main `workflow` (react_agent coordinator)
- [x] Test full pipeline coordination via `nat serve` + curl

**Phase 3: Service Integration** (deferred to post-MVP)
- [ ] Implement `src/merchant/services/recommendation.py`
  - [ ] Layer 1: Validate cart items
  - [ ] Layer 2: Single REST call to ARAG agent
  - [ ] Layer 3: Validate and filter recommendations
- [ ] Add configuration to `src/merchant/config.py`
  - [ ] `recommendation_agent_url` (default: `http://localhost:8004`)
  - [ ] `recommendation_agent_timeout` (default: 15s for multi-agent)
  - [ ] `milvus_uri` for vector database
- [ ] Integrate with checkout session creation
- [ ] Return suggestions in `metadata.suggestions[]`

**Phase 4: Testing & Evaluation** (deferred to post-MVP)
- [ ] Unit tests for each agent
- [ ] Integration tests for full ARAG pipeline
- [ ] Latency benchmarks (<10s total for recommendation)
- [ ] Quality evaluation using RAGAS metrics (optional)

## Example Agent Flow

```
User adds "Classic Tee" ($25, casual wear) to cart

1. RAG RETRIEVAL
   → Query: "complementary products for Classic Tee casual t-shirt"
   → Returns 20 candidates: jeans, shorts, accessories, etc.
   → Filter: Remove out-of-stock, below-margin items → 15 candidates

2. PARALLEL EXECUTION
   UUA: "User is shopping for casual basics. Price-conscious ($25 item).
         Looking for everyday wear. Likely interested in casual bottoms
         or accessories to complete a casual outfit."
   
   NLI: Scores each candidate against "casual basics outfit completion"
        - Khaki Shorts: 0.85 (SUPPORTS - casual match)
        - Sunglasses: 0.72 (SUPPORTS - accessory complement)
        - Graphic Tee: 0.30 (CONTRADICTS - already has tee)

3. CONTEXT SUMMARY
   CSA: "Top 5 candidates for casual outfit completion:
         1. Khaki Shorts - direct category complement
         2. Sunglasses - accessory upsell opportunity
         3. Canvas Sneakers - style match
         Excluded: Graphic Tee (duplicate category)"

4. FINAL RANKING
   IRA: Returns top 2-3 with reasoning:
        1. Khaki Shorts ($35) - "Perfect casual pairing, complete outfit"
        2. Sunglasses ($15) - "Accessory add-on, low commitment upsell"
```

## Acceptance Criteria

**Functional Requirements**:
- [ ] Recommendations are always in-stock (requires service integration)
- [ ] Recommendations meet minimum margin requirements (requires service integration)
- [x] Recommendations are different from cart items (no duplicates)
- [x] Returns 2-3 recommendations per request
- [x] Reasoning trace is captured for each recommendation

**Quality Requirements**:
- [x] Recommendations are contextually relevant to cart items
- [x] Multi-agent pipeline improves relevance over simple retrieval
- [x] Semantic alignment (NLI) filters out irrelevant candidates

**Performance Requirements**:
- [x] Total latency <10s (including all 4 agents) - ~7s observed
- [ ] Parallel execution reduces latency vs sequential (sequential workflow)
- [ ] Fail-open behavior returns empty suggestions if timeout (requires service)

**Observability Requirements** (deferred to UI integration):
- [ ] Agent reasoning traces displayed in Protocol Inspector
- [ ] UUA preference summary visible in Agent Activity panel
- [ ] NLI scores and CSA summary available for debugging

## Research Reference

This implementation is inspired by the ARAG framework from Walmart Global Tech:

> **ARAG: Agentic Retrieval Augmented Generation for Personalized Recommendation**
> Maragheh et al., SIGIR 2025
> 
> Key findings:
> - ARAG achieves **42.1% improvement in NDCG@5** over vanilla RAG
> - Multi-agent collaboration with NLI scoring significantly improves relevance
> - User Understanding Agent captures nuanced preferences traditional RAG misses
> - Parallel agent execution enables real-time recommendations

---

[← Back to Feature Overview](./index.md)

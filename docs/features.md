# Feature Breakdown: Agentic Commerce Blueprint

This document breaks down the project requirements into discrete, implementable features. Each feature is self-contained and can be tackled incrementally.

---

## Feature Overview

| # | Feature | Priority | Dependencies | Status |
|---|---------|----------|--------------|--------|
| 1 | Project Foundation & Setup | P0 | None | ✅ Complete |
| 2 | Database Schema & Seed Data | P0 | Feature 1 | ✅ Complete |
| 3 | ACP Core Endpoints (CRUD) | P0 | Feature 2 | ✅ Complete |
| 4 | API Security & Validation | P0 | Feature 3 | ✅ Complete |
| 5 | PSP - Delegated Payments | P1 | Feature 2 | ✅ Complete |
| 6 | Promotion Agent (NAT) + ACP Integration | P1 | Features 3, 4 | ✅ Complete |
| 7 | Recommendation Agent (NAT) | P1 | Features 3, 4 | ✅ Complete |
| 8 | Post-Purchase Agent (NAT) | P1 | Features 3, 4 | ✅ Complete (webhook deferred to F11) |
| 9 | Client Agent Simulator (Frontend) | P1 | Feature 3 | ✅ Complete |
| 10 | Multi-Panel Protocol Inspector UI | P2 | Feature 9 | ✅ Complete |
| 11 | Webhook Integration | P2 | Feature 8 | ✅ Complete |
| 12 | Agent Panel Checkout Flow Simulation | P1 | Feature 9 | ✅ Complete |
| 13 | Integration of UI and ACP Server | P1 | Features 3, 5, 9, 12 | ✅ Complete |
| 14 | Enhanced Checkout (Payment & Shipping) | P1 | Feature 13 | ✅ Complete |
| 15 | Multi-Language Post-Purchase Messages | P2 | Feature 8 | ✅ Complete |
| 16 | Apps SDK Integration (Merchant Iframe) | P1 | Features 7, 9, 13 | 🔲 Planned |

---

## Feature 1: Project Foundation & Setup

**Goal**: Scaffold the FastAPI backend with all required dependencies and configuration.

### Tasks

- [x] Initialize Python 3.12+ project with `pyproject.toml` or `requirements.txt`
- [x] Install core dependencies:
  - `fastapi`
  - `uvicorn`
  - `sqlmodel`
  - `nemo-agent-toolkit`
  - `pydantic`
- [x] Create FastAPI application entry point (`main.py`)
- [x] Configure environment variables:
  ```env
  # NIM Configuration
  NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
  NVIDIA_API_KEY=nvapi-xxx
  
  # Webhook Configuration
  WEBHOOK_URL=https://your-client.example.com/webhooks/acp
  WEBHOOK_SECRET=whsec_xxx
  
  # API Security
  API_KEY=your-api-key
  ```
- [x] Create basic health check endpoint (`GET /health`)
- [x] Set up project folder structure:
  ```
  src/
  └── merchant/
      ├── __init__.py
      ├── main.py
      ├── config.py
      ├── api/
      │   ├── __init__.py
      │   ├── dependencies.py
      │   └── routes/
      │       ├── __init__.py
      │       └── health.py
      ├── agents/
      │   └── __init__.py
      ├── db/
      │   ├── __init__.py
      │   ├── models.py
      │   └── database.py
      └── services/
          └── __init__.py
  ```

### Acceptance Criteria

- Server starts with `uvicorn src.merchant.main:app`
- Health endpoint returns 200 OK
- Environment variables are loaded correctly

---

## Feature 2: Database Schema & Seed Data

**Goal**: Create SQLite database with SQLModel ORM and pre-populate with demo data.

### Tasks

- [x] Define SQLModel models:
  - `Product`: `id`, `sku`, `name`, `base_price`, `stock_count`, `min_margin`, `image_url`
  - `CompetitorPrice`: `id`, `product_id` (FK), `retailer_name`, `price`, `updated_at`
  - `CheckoutSession`: Full ACP state including status, line_items, totals, etc.
- [x] Create database initialization script
- [x] Seed 4 products (t-shirts as per PRD):
  ```python
  # Example seed data
  products = [
      Product(id="prod_1", sku="TS-001", name="Classic Tee", base_price=2500, stock_count=100, min_margin=0.15, image_url="https://placehold.co/400x400/png?text=Classic+Tee"),
      Product(id="prod_2", sku="TS-002", name="V-Neck Tee", base_price=2800, stock_count=50, min_margin=0.12, image_url="https://placehold.co/400x400/png?text=V-Neck+Tee"),
      Product(id="prod_3", sku="TS-003", name="Graphic Tee", base_price=3200, stock_count=200, min_margin=0.18, image_url="https://placehold.co/400x400/png?text=Graphic+Tee"),
      Product(id="prod_4", sku="TS-004", name="Premium Tee", base_price=4500, stock_count=25, min_margin=0.20, image_url="https://placehold.co/400x400/png?text=Premium+Tee"),
  ]
  ```
- [x] Seed competitor prices for dynamic pricing logic
- [x] Create database utility functions (get_db session)

### Acceptance Criteria

- Database file is created on startup
- 4 products are seeded with images and pricing
- Competitor prices exist for promotion agent logic
- All tables can be queried via SQLModel

---

## Feature 3: ACP Core Endpoints (CRUD)

**Goal**: Implement the 5 ACP-compliant checkout session endpoints.

### Endpoints

#### 3.1 Create Checkout Session
- **Endpoint**: `POST /checkout_sessions`
- **Status**: `201 Created`
- **Input**: `items[]`, `buyer` (optional), `fulfillment_address` (optional)
- **Output**: Full checkout state with `status: not_ready_for_payment`

#### 3.2 Update Checkout Session
- **Endpoint**: `POST /checkout_sessions/{id}`
- **Status**: `200 OK`
- **Input**: Partial updates (items, buyer, address, fulfillment_option_id)
- **Output**: Full checkout state
- **Logic**: Transition to `ready_for_payment` when all required fields present

#### 3.3 Complete Checkout
- **Endpoint**: `POST /checkout_sessions/{id}/complete`
- **Status**: `200 OK`
- **Input**: `payment_data` with token and billing address
- **Output**: Full checkout state with `status: completed` and `order` object
- **Logic**: Validate payment token, create order

#### 3.4 Cancel Checkout
- **Endpoint**: `POST /checkout_sessions/{id}/cancel`
- **Status**: `200 OK` or `405 Method Not Allowed`
- **Output**: Full checkout state with `status: canceled`

#### 3.5 Get Checkout Session
- **Endpoint**: `GET /checkout_sessions/{id}`
- **Status**: `200 OK` or `404 Not Found`
- **Output**: Current checkout state

### Tasks

- [x] Create Pydantic schemas for all request/response models
- [x] Implement checkout session service layer
- [x] Implement all 5 endpoints
- [x] Handle session state transitions:
  ```
  not_ready_for_payment → ready_for_payment → in_progress → completed
                       ↘                   ↘              ↘
                         →      canceled      ←─────────────┘
                                    ↑
                    authentication_required (if 3DS) ─────────┘
  ```
- [x] Calculate line_items totals (base_amount, discount, tax, total)
- [x] Generate fulfillment_options based on address
- [x] Include required `messages[]` and `links[]` in responses

### Acceptance Criteria

- [x] All 5 endpoints return ACP-compliant JSON
- [x] State transitions work correctly
- [x] 404 for non-existent sessions
- [x] 405 for invalid state transitions

---

## Feature 4: API Security & Validation

**Goal**: Secure all ACP endpoints with authentication and strict validation.

### Tasks

- [x] Implement API key authentication middleware
  - Support `Authorization: Bearer <API_KEY>` header
  - Support `X-API-Key: <API_KEY>` header
- [x] Return proper error responses:
  - `401 Unauthorized` for missing API key
  - `403 Forbidden` for invalid API key
- [x] Implement request validation:
  - Strict Pydantic schema validation
  - Reject unexpected fields (`extra = "forbid"`)
- [x] Implement idempotency via `Idempotency-Key` header
- [x] Add request/response logging
- [x] Handle common ACP headers:
  - `Accept-Language`
  - `Request-Id`
  - `API-Version`

### Acceptance Criteria

- Requests without API key return 401
- Invalid API keys return 403
- Malformed requests return 400 with clear error messages
- Idempotent requests return cached responses

---

## Feature 5: PSP - Delegated Payments

**Goal**: Implement the Payment Service Provider for delegated vault tokens with proper ACP compliance, including 3D Secure authentication support.

**Key Principle**: Agents never see actual card data. They receive opaque vault tokens (`vt_...`) with explicit usage constraints. Payments stay on merchant rails via Stripe.

### Database Tables

```sql
vault_tokens:
  - id (vt_01J8Z3...)           -- Unique token ID
  - idempotency_key (unique)    -- For safe retries
  - payment_method (json)       -- PaymentMethodCard schema
  - allowance (json)            -- Constraints: max_amount, currency, expires_at, etc.
  - billing_address (json)      -- Optional billing address
  - risk_signals (json)         -- Array of risk assessments
  - status (active | consumed)  -- Token lifecycle state
  - created_at
  - metadata (json)             -- source, merchant_id, etc.

payment_intents:
  - id (pi_...)
  - vault_token_id (fk)
  - amount
  - currency
  - status (pending | requires_authentication | completed | failed)
  - authentication_metadata (json)  -- For 3DS flow
  - authentication_result (json)    -- 3DS outcome
  - created_at
  - completed_at

idempotency_store:
  - idempotency_key (pk)
  - request_hash
  - response_status
  - response_body
  - created_at
```

### Endpoints

#### 5.1 Delegate Payment

Creates a vault token with constrained allowance for agent-initiated payments.

- **Endpoint**: `POST /agentic_commerce/delegate_payment`
- **API Version**: `2026-01-16`
- **Status**: `201 Created`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
  - `API-Version: 2025-09-29`
  - `Idempotency-Key: {unique-key}` (required)

**Request Schema**:
```json
{
  "payment_method": {
    "type": "card",
    "card_number_type": "fpan",
    "virtual": false,
    "number": "4242424242424242",
    "exp_month": "12",
    "exp_year": "2027",
    "name": "John Doe",
    "cvc": "123",
    "display_card_funding_type": "credit",
    "display_brand": "visa",
    "display_last4": "4242"
  },
  "allowance": {
    "reason": "one_time",
    "max_amount": 5000,
    "currency": "usd",
    "checkout_session_id": "cs_abc123",
    "merchant_id": "merchant_xyz",
    "expires_at": "2025-12-01T12:00:00Z"
  },
  "risk_signals": [
    {
      "type": "card_testing",
      "score": 10,
      "action": "authorized"
    }
  ],
  "billing_address": {
    "name": "John Doe",
    "line_one": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94102"
  }
}
```

**Response Schema** (201 Created):
```json
{
  "id": "vt_01J8Z3WXYZ9ABC",
  "created": "2025-09-29T11:00:00Z",
  "metadata": {
    "source": "agent_checkout",
    "merchant_id": "merchant_xyz",
    "idempotency_key": "idem_abc123"
  }
}
```

**Idempotency Behavior**:
- Same key + same request → cached response (201)
- Same key + different request → 409 Conflict

#### 5.2 Create and Process Payment Intent

Called by merchant backend to process payment using the vault token.

- **Endpoint**: `POST /agentic_commerce/create_and_process_payment_intent`
- **Status**: `200 OK` | `202 Accepted` (if 3DS required)
- **Input**: Vault token `vt_xxx`, amount, currency
- **Output**: Payment intent `pi_xxx` with status

**Request Schema**:
```json
{
  "vault_token": "vt_01J8Z3WXYZ9ABC",
  "amount": 3200,
  "currency": "usd",
  "checkout_session_id": "cs_abc123"
}
```

**Response Schema** (Success):
```json
{
  "id": "pi_xyz789",
  "vault_token_id": "vt_01J8Z3WXYZ9ABC",
  "amount": 3200,
  "currency": "usd",
  "status": "completed",
  "created_at": "2025-09-29T11:05:00Z",
  "completed_at": "2025-09-29T11:05:02Z"
}
```

**Response Schema** (3DS Required):
```json
{
  "id": "pi_xyz789",
  "status": "requires_authentication",
  "authentication_metadata": {
    "redirect_url": "https://3ds.example.com/challenge/abc",
    "acquirer_details": { },
    "directory_server_info": { }
  }
}
```

**Processing Logic**:
1. Validate vault token is `active` and not expired
2. Validate amount ≤ `max_amount` and currency matches
3. Check if 3DS authentication is required (based on risk, card issuer)
4. If 3DS required: return `requires_authentication` with metadata
5. If no 3DS: create Stripe PaymentIntent, capture payment
6. Mark vault token as `consumed`
7. Return completed payment intent

### PaymentMethodCard Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"card"` |
| `card_number_type` | enum | Yes | `"fpan"` or `"network_token"` |
| `virtual` | boolean | Yes | Whether card is virtual/digital |
| `number` | string | Yes | Card number (FPAN, DPAN, or network token) |
| `exp_month` | string | Yes | Expiry month (`"01"`-`"12"`) |
| `exp_year` | string | Yes | Four-digit expiry year |
| `name` | string | No | Cardholder name |
| `cvc` | string | No | Card verification code (max 4 chars) |
| `cryptogram` | string | No | For tokenized cards |
| `eci_value` | string | No | Electronic Commerce Indicator (max 2 chars) |
| `checks_performed` | array | No | `["avs", "cvv", "ani", "auth0"]` |
| `iin` | string | No | Issuer Identification Number (max 6 chars) |
| `display_card_funding_type` | enum | Yes | `"credit"`, `"debit"`, or `"prepaid"` |
| `display_wallet_type` | string | No | e.g., `"apple_pay"` |
| `display_brand` | string | No | e.g., `"visa"`, `"amex"` |
| `display_last4` | string | Yes | Last 4 digits (pattern: `^[0-9]{4}$`) |
| `metadata` | object | No | Additional data (issuing bank, etc.) |

### Allowance Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Must be `"one_time"` |
| `max_amount` | integer | Yes | Max amount in minor units (e.g., $20 = 2000) |
| `currency` | string | Yes | ISO-4217 lowercase (e.g., `"usd"`) |
| `checkout_session_id` | string | Yes | Associated checkout session |
| `merchant_id` | string | Yes | Merchant identifier (max 256 chars) |
| `expires_at` | string | Yes | RFC 3339 timestamp |

### RiskSignal Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"card_testing"` |
| `score` | integer | No | Risk score (0-100) |
| `action` | enum | Yes | `"blocked"`, `"manual_review"`, or `"authorized"` |

### 3D Secure Authentication

When 3DS is required, the payment flow includes an authentication step.

**Authentication Flow**:
```
1. create_and_process_payment_intent returns status: "requires_authentication"
   └─ Includes authentication_metadata (redirect URL, acquirer details)

2. Agent/UI performs 3DS challenge:
   └─ Redirect user to 3DS URL or embed challenge iframe

3. After 3DS completion, call endpoint with authentication_result:
   └─ outcome, cryptogram, ECI, transaction_id, version
```

**AuthenticationResult Schema**:
```json
{
  "authentication_result": {
    "outcome": "authenticated",
    "outcome_details": {
      "three_ds_cryptogram": "AAIBBYNoEQAAAAAAg4PyBhdAEQs=",
      "electronic_commerce_indicator": "05",
      "transaction_id": "f38e6948-5388-41a6-bca4-b49723c19437",
      "version": "2.2.0"
    }
  }
}
```

**Authentication Outcomes**:

| Outcome | Description |
|---------|-------------|
| `authenticated` | Successfully authenticated |
| `denied` | Authentication denied by issuer |
| `canceled` | User canceled authentication |
| `processing_error` | Error during authentication |

**ECI Values**:

| Value | Meaning |
|-------|---------|
| `01` | 3DS1 authentication attempted (Mastercard) |
| `02` | 3DS1 successful authentication (Mastercard) |
| `05` | 3DS2 successful authentication (Visa) |
| `06` | 3DS2 attempted (Visa) |
| `07` | Non-authenticated (fallback) |

### Error Handling

| HTTP | Type | Code | Description |
|------|------|------|-------------|
| 400 | `invalid_request` | `invalid_card` | Invalid card field |
| 400 | `invalid_request` | `missing` | Required field missing |
| 409 | `invalid_request` | `idempotency_conflict` | Different params with same Idempotency-Key |
| 409 | `invalid_request` | `token_consumed` | Vault token already used |
| 410 | `invalid_request` | `token_expired` | Vault token has expired |
| 422 | `invalid_request` | `amount_exceeded` | Amount exceeds allowance max_amount |
| 422 | `invalid_request` | `currency_mismatch` | Currency doesn't match allowance |
| 429 | `rate_limit_exceeded` | `too_many_requests` | Rate limited |
| 500 | `processing_error` | `internal_server_error` | Server error |
| 503 | `service_unavailable` | `service_unavailable` | Service down |

### Tasks

- [x] Create SQLModel models for `VaultToken` and `PaymentIntent`
- [x] Implement `delegate_payment` endpoint with full schema validation
  - [x] Validate PaymentMethodCard schema (all required fields)
  - [x] Validate Allowance constraints
  - [x] Require at least one RiskSignal
  - [x] Store billing_address if provided
- [x] Implement idempotency handling
  - [x] Hash request body for comparison
  - [x] Return cached response for matching key + request
  - [x] Return 409 for matching key + different request
- [x] Implement `create_and_process_payment_intent` endpoint
  - [x] Validate vault token status and expiration
  - [x] Validate amount/currency against allowance
  - [ ] Integrate with Stripe for actual payment processing (simulated in MVP)
  - [ ] Handle 3DS authentication flow (deferred to Feature 13)
- [ ] Implement 3D Secure support (deferred to Feature 13)
  - [ ] Detect when 3DS is required (risk-based)
  - [ ] Return authentication_metadata
  - [ ] Accept and validate authentication_result
- [x] Add comprehensive error handling with proper codes
- [x] Create unit tests for all scenarios

### Acceptance Criteria

- [x] Vault tokens are created with proper allowances and constraints
- [x] PaymentMethodCard schema is fully validated (type, card_number_type, display fields)
- [x] At least one RiskSignal is required for delegate_payment
- [x] Idempotency works correctly:
  - Same key + same request → cached 201 response
  - Same key + different request → 409 Conflict
- [x] Payment intents validate against allowance constraints
- [x] Payment intents consume vault tokens (single-use)
- [x] Expired tokens are rejected with 410 Gone
- [x] Consumed tokens are rejected with 409 Conflict
- [ ] 3DS flow returns proper authentication_metadata when required (deferred to Feature 13)
- [ ] 3DS authentication_result is validated before completing payment (deferred to Feature 13)
- [x] All amounts are handled in minor units (cents)

---

## Feature 6: Promotion Agent (NAT)

**Goal**: Implement dynamic pricing agent using NVIDIA NeMo Agent Toolkit.

### Agent Behavior

The Promotion Agent reasons over competitor prices and inventory to calculate discounts while protecting margins.

**Logic**:
```
IF stock_count > threshold AND base_price > competitor_price:
    apply discount down to min_margin
```

### Tasks

- [x] Create NAT workflow for Promotion Agent
- [x] Implement query tools for agent:
  - Query `products` data (via mock data, DB integration pending)
  - Query `competitor_prices` data (via mock data, DB integration pending)
- [x] Define agent system prompt with pricing rules
- [x] Implement discount calculation logic
- [x] Ensure parameterized queries (mock data uses dict lookups)
- [x] Return discount in checkout session `line_items[].discount`
- [x] **ACP Integration** (3-Layer Hybrid Architecture):
  - [x] Layer 1: Deterministic computation in `services/promotion.py`
    - Compute inventory pressure signal (stock_count > 50 = HIGH)
    - Compute competition position signal (base_price vs competitor)
    - Filter allowed_actions by min_margin constraint
  - [x] Layer 2: REST API call to Promotion Agent (`agents/promotion.py`)
    - Async HTTP client with timeout
    - Fail-open behavior (NO_PROMO if agent unavailable)
  - [x] Layer 3: Deterministic execution
    - Apply ACTION_DISCOUNT_MAP to calculate discount cents
    - Validate against margin constraints
  - [x] Async integration in `create_checkout_session` and `update_checkout_session`
  - [x] Comprehensive test coverage (`tests/merchant/services/test_promotion.py`)

### Example Agent Flow

1. Agent receives product_id from checkout session
2. Agent calls `query_product_stock(product_id)` → returns stock_count
3. Agent calls `query_competitor_price(product_id)` → returns competitor prices
4. Agent reasons: "Stock is 200 units (high), competitor sells at $28, we sell at $32"
5. Agent calculates: "Can discount to $27.20 while maintaining 15% margin"
6. Agent returns discount amount

### Acceptance Criteria

- [x] Agent queries database via tool-calling
- [x] Discounts respect min_margin constraint
- [x] Reasoning trace is captured for UI display
- [x] Agent completes within latency target (<10s)
- [x] Fail-open behavior when agent unavailable
- [x] Line item includes promotion metadata (action, reason_codes, reasoning)

---

## Feature 7: Recommendation Agent (NAT) - ARAG Architecture

**Goal**: Implement a personalized cross-sell recommendation agent using an Agentic Retrieval Augmented Generation (ARAG) multi-agent architecture, inspired by state-of-the-art research in LLM-based recommendation systems.

**Reference**: [ARAG: Agentic Retrieval Augmented Generation for Personalized Recommendation](https://arxiv.org/pdf/2506.21931) (SIGIR 2025)

### Architecture Overview

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

### Agent Components

All 4 ARAG agents are defined in a **single NAT configuration file** (`configs/recommendation.yml`) using NAT's multi-agent orchestration pattern. Each specialized agent is registered as a `function` and called by the coordinator workflow.

#### 7.1 User Understanding Agent (UUA)

**Purpose**: Summarizes buyer preferences from available context to understand purchase intent.

**Input Signals**:
- Current cart items (product names, categories, price range)
- Session context (if available: browse history, previous interactions)
- Buyer demographic hints (shipping address region, currency)

**Output**: Natural language summary of user preferences and inferred shopping intent.

**Defined as NAT function**: `user_understanding_agent`

#### 7.2 Natural Language Inference (NLI) Agent

**Purpose**: Evaluates semantic alignment between candidate products and inferred user intent.

**Input**:
- Candidate product metadata (name, description, category, attributes)
- User intent summary from UUA (or session context)

**Output**: Alignment scores and support/contradiction judgments for each candidate.

**Defined as NAT function**: `nli_alignment_agent`

#### 7.3 Context Summary Agent (CSA)

**Purpose**: Synthesizes NLI-filtered candidates with user understanding into a focused context for ranking.

**Input**:
- User preference summary from UUA
- NLI scores and filtered candidate list
- Business constraints (in-stock, margin rules)

**Output**: Condensed recommendation context with ranked candidate pool.

**Defined as NAT function**: `context_summary_agent`

#### 7.4 Item Ranker Agent (IRA)

**Purpose**: Produces the final ranked list of recommendations with reasoning trace.

**Input**:
- User preference summary from UUA
- Context summary from CSA
- Product details for top candidates

**Output**: Ordered list of 2-3 recommendations with explanations.

**Defined as NAT function**: `item_ranker_agent`

### Single YAML Multi-Agent Configuration

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

### 3-Layer Hybrid Architecture (Per ACP Standards)

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

### RAG Configuration with Milvus

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

### Database Schema Extensions

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

### Service Implementation

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

### Tasks

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

### Example Agent Flow

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

### Acceptance Criteria

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

### Research Reference

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

## Feature 8: Post-Purchase Agent (NAT)

**Goal**: Implement lifecycle loyalty agent for multilingual shipping updates.

### Agent Behavior

Generates human-like shipping updates using the Brand Persona configuration.

### Brand Persona Configuration

```json
{
  "company_name": "Acme T-Shirts",
  "tone": "friendly",          // friendly | professional | casual | urgent
  "preferred_language": "en"   // en | es | fr
}
```

### Tasks

- [x] Create NAT workflow for Post-Purchase Agent
- [x] Implement Brand Persona loading from config
- [x] Generate shipping pulses in 3 languages (EN/ES/FR)
- [x] Define tone variations for messaging
- [ ] Integrate with global webhook delivery (Feature 11)
- [x] Create shipping status templates:
  - Order confirmed
  - Order shipped
  - Out for delivery
  - Delivered

### Example Output (Friendly, English)

```
Hey John! Great news - your Classic Tee is on its way! 🚚
Track your package: https://track.example.com/abc123
- The Acme T-Shirts Team
```

### Acceptance Criteria

- [x] Messages reflect Brand Persona tone
- [x] Messages are in correct language
- [x] All shipping statuses are supported
- [ ] Messages are delivered to global webhook (deferred to Feature 11)

---

## Feature 9: Client Agent Simulator (Frontend)

**Goal**: Build the demo client that simulates ACP client behavior.

### Technology Stack

- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- shadcn/ui components

### User Flows

#### Search Flow
1. User enters prompt (e.g., "find some t-shirts")
2. Simulator displays 4 product cards

#### Checkout Flow
1. User clicks a product card
2. Simulator calls `POST /checkout_sessions`
3. User completes checkout steps

### Tasks

- [ ] Initialize Next.js project
- [ ] Create search input component
- [ ] Create product card component (image, name, price)
- [ ] Display 4 products from API
- [ ] Implement "Buy" action that triggers ACP checkout
- [ ] Create checkout flow UI:
  - Shipping address form
  - Fulfillment option selection
  - Payment form (simulated)
  - Order confirmation

### Acceptance Criteria

- Search displays 4 product cards
- Clicking product initiates checkout
- Full checkout flow works end-to-end
- UI is responsive and modern

---

## Feature 10: Multi-Panel Protocol Inspector UI

**Goal**: Build the "Glass Box" dashboard for observability.

### Panel Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Left Panel    │  Middle Panel   │  Right Panel    │
│                 │                 │                 │
│  Agent/Client   │   Business/     │  Chain of       │
│  Simulation     │   Retailer      │  Thought        │
│                 │   View          │  (Optional)     │
│  - Search       │                 │                 │
│  - Products     │  - JSON payload │  - Agent        │
│  - Checkout     │  - Session state│    reasoning    │
│                 │  - Protocol     │  - Tool calls   │
│                 │    interactions │  - Decisions    │
└─────────────────┴─────────────────┴─────────────────┘
```

### Tasks

- [x] Create three-panel layout component
- [x] **Left Panel (Client Agent)**: Integrate client simulator (Feature 9)
  - Streaming text animation for product suggestions
  - Staggered product card entrance animations
- [x] **Middle Panel (Merchant Server)**: 
  - Display real-time ACP protocol events
  - Show session state transitions
  - Timeline view with status indicators
- [x] **Right Panel (Agent Activity)**:
  - Display Promotion Agent decisions
  - Show input signals (inventory pressure, competition position)
  - Display reason codes and reasoning text
  - Expandable details for each decision
- [x] Add panel synchronization via shared context providers
- [x] Performance optimizations (memoized context, refs for callbacks)

### Implementation Details

The three-panel UI consists of:

| Panel | Component | Purpose |
|-------|-----------|---------|
| Client Agent | `AgentPanel` | User interaction, product selection, checkout |
| Merchant Server | `BusinessPanel` | ACP protocol events, session state |
| Agent Activity | `AgentActivityPanel` | Promotion agent decisions, reasoning |

Key hooks and providers:
- `useACPLog` / `ACPLogProvider` - Tracks ACP protocol events
- `useAgentActivityLog` / `AgentActivityLogProvider` - Tracks agent decisions
- `useCheckoutFlow` - State machine with integrated logging

### Acceptance Criteria

- [x] Three panels display simultaneously
- [x] Panels update in real-time
- [x] Agent decisions show input signals and reasoning
- [x] UI is responsive on large monitors
- [x] No performance lag when interacting with modals

---

## Feature 11: Webhook Integration

**Goal**: Implement webhook delivery for post-purchase events between merchant and client agent.

### Architecture

In ACP, the **client agent exposes a webhook endpoint** that the **merchant calls** for order lifecycle updates:

```
Merchant Backend                    Client Agent (UI)
      │                                   │
      │  1. Order status changes          │
      │  2. Generate message via          │
      │     Post-Purchase Agent           │
      │                                   │
      │  POST /api/webhooks/acp           │
      │  {type: "shipping_update", ...}   │
      │ ─────────────────────────────────▶│
      │                                   │
      │       200 OK {received: true}     │
      │ ◀─────────────────────────────────│
      │                                   │
      │                            3. UI displays
      │                               notification
```

### Configuration

```env
# Merchant backend (env.example)
WEBHOOK_URL=http://localhost:3000/api/webhooks/acp
WEBHOOK_SECRET=whsec_demo_secret

# Client UI (src/ui/env.example)
WEBHOOK_SECRET=whsec_demo_secret
```

### Webhook Event Schema

Standard ACP events:
```json
{
  "type": "order_created|order_updated",
  "data": {
    "type": "order",
    "checkout_session_id": "checkout_abc123",
    "permalink_url": "https://shop.example.com/orders/123",
    "status": "created|confirmed|shipped|fulfilled|canceled",
    "refunds": []
  }
}
```

Extended shipping_update event (for Post-Purchase Agent messages):
```json
{
  "type": "shipping_update",
  "data": {
    "type": "shipping_update",
    "checkout_session_id": "cs_abc123",
    "order_id": "order_xyz789",
    "status": "order_shipped",
    "language": "en",
    "subject": "Your Classic Tee is on its way! 🚚",
    "message": "Hey John! Great news...",
    "tracking_url": "https://track.example.com/abc123"
  }
}
```

### Tasks

**Client-Side (UI):**
- [x] Create webhook API route (`src/ui/app/api/webhooks/acp/route.ts`)
- [x] Implement HMAC signature verification
- [x] Create webhook event types: `order_created`, `order_updated`, `shipping_update`
- [x] Create `useWebhookNotifications` hook for UI integration
- [x] Support polling for new notifications

**Agent Activity Panel Integration:**
- [x] Display post-purchase messages in Agent Activity panel
- [x] Show webhook POST events in Merchant Panel
- [x] Integrate with checkout flow state machine

**Post-Purchase Agent Proxy:**
- [x] Create Next.js API proxy route for NAT agent (`/api/agents/post-purchase`)
- [x] Handle CORS for browser-to-agent communication
- [x] Trigger post-purchase agent after checkout completion

### Acceptance Criteria

- [x] Client webhook endpoint validates HMAC signatures
- [x] Events include checkout_session_id for association
- [x] Post-purchase messages display in Agent Activity panel
- [x] Webhook POST events logged in Merchant Panel
- [x] LLM generates all messages (no hardcoding)

---

## Feature 12: Agent Panel Checkout Flow Simulation

**Goal**: Implement an animated, multi-state checkout flow simulation within the Agent Panel that demonstrates the complete purchase journey from product selection to order confirmation.

### State Machine

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Product Grid   │────▶│    Checkout     │────▶│    Payment      │────▶│  Confirmation   │
│    Selection    │     │   (Shipping)    │     │   Processing    │     │    Complete     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       │                                               │
        └───────────────────────┴───────────────────────────────────────────────┘
                                      (Start Over)
```

### UI States

#### State 1: Product Grid Selection
- Display product cards in a responsive grid layout
- Each card shows: product image, name, variant (color/size), price, merchant name
- User prompt/message displayed above product grid
- Clicking a product card transitions to checkout state

#### State 2: Checkout (Shipping & Cart Review)
- Animated transition from product grid to single checkout card
- Merchant header with logo/icon and name
- Selected product with:
  - Thumbnail image
  - Product name and variant
  - Price
  - Quantity selector (+/- controls)
- Shipping section:
  - Dropdown to select shipping option
  - Options include delivery timeframe and cost (e.g., "Standard 5-7 business days $5.00")
- Order summary:
  - Total due today (prominent)
  - Subtotal breakdown
  - Shipping cost
- Pay button with saved payment method indicator (e.g., card ending in 4242)

#### State 3: Shipping Options Expanded
- Dropdown expands to show available shipping options
- Each option displays: name, delivery timeframe, price
- Selected option indicated with checkmark
- Selecting an option updates the order total

#### State 4: Order Confirmation
- Animated transition to confirmation state
- Success header with green checkmark and "Purchase complete" text
- Order details card:
  - Product thumbnail and details
  - Quantity ordered
  - Estimated delivery date
  - Merchant name ("Sold by")
  - Amount paid
- Confirmation message below card with next steps

### Animation Requirements

All state transitions must include smooth animations:

- **Product to Checkout**: Product cards fade/scale out, checkout card slides/fades in
- **Shipping Dropdown**: Smooth expand/collapse animation
- **Checkout to Confirmation**: Checkout card morphs into confirmation card with success indicator animation
- **State Reset**: Fade transition back to product grid

Recommended animation properties:
- Duration: 300-400ms for major transitions
- Easing: ease-out or custom cubic-bezier for natural feel
- Use CSS transitions or Framer Motion for React

### Tasks

- [x] Create checkout flow state machine (React useState/useReducer)
- [x] Implement ProductGrid component with animated card selection
- [x] Implement CheckoutCard component with:
  - [x] Product summary section
  - [x] Quantity selector with +/- controls
  - [x] Shipping dropdown with animated expand/collapse
  - [x] Order total calculation
  - [x] Pay button with payment method display
- [x] Implement ConfirmationCard component with:
  - [x] Success header with animated checkmark
  - [x] Order summary details
  - [x] Estimated delivery display
  - [x] Confirmation message
- [x] Add transition animations between all states
- [x] Integrate with existing AgentPanel component
- [ ] Connect to ACP checkout session API for real data (uses mock data currently)

### Acceptance Criteria

- [x] Product grid displays available products with images and pricing
- [x] Clicking a product smoothly transitions to checkout view
- [x] Quantity can be adjusted with +/- controls
- [x] Shipping options dropdown expands/collapses with animation
- [x] Selecting shipping option updates total price
- [x] Pay button triggers transition to confirmation state
- [x] Confirmation shows order details with estimated delivery
- [x] All state transitions have smooth, polished animations
- [x] User can start a new checkout flow after confirmation

---

## Feature 13: Integration of UI and ACP Server

**Goal**: Connect the frontend checkout flow to the real ACP backend endpoints, enabling end-to-end transactions from product selection through payment completion, including 3D Secure authentication support.

**Key Principle**: The UI acts as the agent, collecting user input and orchestrating API calls. Actual card data is tokenized via the PSP's `delegate_payment` endpoint—the merchant backend only receives opaque vault tokens.

### Overview

This feature replaces the mock data flow in the Agent Panel with actual API calls to the merchant backend and PSP, creating a fully functional checkout experience that follows the ACP payment protocol.

### Checkout Session States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHECKOUT SESSION STATES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CREATE SESSION                                                            │
│        ↓                                                                    │
│   [not_ready_for_payment] ←── Missing required data (address, items)        │
│        │                                                                    │
│        ↓ UPDATE SESSION (add fulfillment, fix issues)                       │
│   [ready_for_payment]                                                       │
│        │                                                                    │
│        ├──→ COMPLETE (no 3DS) ──→ [in_progress] ──→ [completed] + order     │
│        │                                                                    │
│        └──→ COMPLETE (3DS needed) ──→ [authentication_required]             │
│                                              │                              │
│                                              ↓                              │
│                                        User completes 3DS                   │
│                                              │                              │
│                                              ↓                              │
│                                   COMPLETE with auth_result                 │
│                                              │                              │
│                                              ↓                              │
│                                        [completed] + order                  │
│                                                                             │
│   CANCEL SESSION (any non-final state) ──→ [canceled]                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Session Status Values:**

| Status | Description |
|--------|-------------|
| `not_ready_for_payment` | Initial state, missing required data (fulfillment address, valid items) |
| `ready_for_payment` | All requirements met, ready to accept payment |
| `authentication_required` | 3D Secure or other authentication is required |
| `in_progress` | Payment is being processed |
| `completed` | Successfully completed with order created |
| `canceled` | Session has been canceled |

### Integration Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Product Grid   │────▶│  Create Session │────▶│  Update Session │────▶│    Complete     │
│    (Display)    │     │   (Backend)     │     │   (Backend)     │     │   (PSP + ACP)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │                       │
        ▼                       ▼                       ▼                       ▼
   UI displays            POST /checkout_         POST /checkout_         1. UI calls PSP
   products from          sessions               sessions/{id}              delegate_payment
   mock data or           - Send items,          - Update quantity,      2. PSP returns vault
   product API              fulfillment_details    shipping option          token (vt_xxx)
                          - Send agent_          - Session transitions   3. UI calls POST
                            capabilities           to ready_for_payment     /checkout_sessions
                          - Receive session,                                /{id}/complete
                            payment_provider,                            4. IF 3DS required:
                            seller_capabilities                             handle auth flow
                                                                         5. Backend processes
                                                                            payment via Stripe
                                                                         6. Order created
```

### API Interactions

#### 13.1 Product Selection → Create Checkout Session

When user clicks a product card:

- **Endpoint**: `POST /checkout_sessions`
- **API Version**: `2026-01-16`
- **Request**:
  ```json
  {
    "items": [
      {
        "id": "prod_1",
        "quantity": 1
      }
    ],
    "fulfillment_details": {
      "name": "John Doe",
      "phone_number": "15551234567",
      "email": "john@example.com",
      "address": {
        "name": "John Doe",
        "line_one": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "US",
        "postal_code": "94102"
      }
    },
    "agent_capabilities": {
      "interventions": {
        "supported": ["3ds", "3ds_redirect", "3ds_challenge"],
        "max_redirects": 1,
        "redirect_context": "in_app",
        "display_context": "webview"
      }
    }
  }
  ```

- **Response**:
  ```json
  {
    "id": "cs_abc123",
    "status": "not_ready_for_payment",
    "currency": "usd",
    "payment_provider": {
      "provider": "stripe",
      "supported_payment_methods": [
        {
          "type": "card",
          "supported_card_networks": ["visa", "mastercard", "amex", "discover"]
        }
      ]
    },
    "seller_capabilities": {
      "payment_methods": [
        {
          "method": "card",
          "brands": ["visa", "mastercard", "amex"],
          "funding_types": ["credit", "debit"]
        }
      ],
      "interventions": {
        "required": [],
        "supported": ["3ds", "3ds_challenge", "3ds_frictionless"],
        "enforcement": "conditional"
      }
    },
    "totals": [
      { "type": "subtotal", "display_text": "Subtotal", "amount": 2500 },
      { "type": "tax", "display_text": "Tax", "amount": 200 },
      { "type": "fulfillment", "display_text": "Shipping", "amount": 0 },
      { "type": "total", "display_text": "Total", "amount": 2700 }
    ],
    "fulfillment_options": [
      {
        "type": "shipping",
        "id": "ship_standard",
        "title": "Standard Shipping",
        "subtitle": "5-7 business days",
        "carrier": "USPS",
        "earliest_delivery_time": "2026-01-28T00:00:00Z",
        "latest_delivery_time": "2026-01-30T23:59:59Z",
        "subtotal": 500,
        "tax": 0,
        "total": 500
      }
    ],
    "messages": [],
    "links": []
  }
  ```
- **UI Action**: 
  - Store session ID
  - Check `payment_provider.supported_payment_methods` to know which card networks are supported
  - Check `seller_capabilities` to understand 3DS requirements
  - Transition to checkout view

#### 13.2 Quantity/Shipping Updates → Update Checkout Session

When user changes quantity or selects shipping option:

- **Endpoint**: `POST /checkout_sessions/{id}`
- **Request** (quantity update):
  ```json
  {
    "items": [
      {
        "id": "prod_1",
        "quantity": 2
      }
    ]
  }
  ```
- **Request** (fulfillment selection using new `selected_fulfillment_options` array):
  ```json
  {
    "selected_fulfillment_options": [
      {
        "type": "shipping",
        "shipping": {
          "option_id": "ship_standard",
          "item_ids": ["prod_1"]
        }
      }
    ]
  }
  ```
- **Response**: Updated checkout session with recalculated totals
  - Status transitions to `ready_for_payment` when all required fields are present
- **UI Action**: 
  - Update displayed totals
  - Enable Pay button when `status: ready_for_payment`

#### 13.3 Payment Flow → PSP + Complete Checkout

When user clicks Pay button:

**Step 1: Get Vault Token from PSP**

- **Endpoint**: `POST /agentic_commerce/delegate_payment`
- **API Version**: `2026-01-16`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
  - `API-Version: 2025-09-29`
  - `Idempotency-Key: {unique-key}`
- **Request**:
  ```json
  {
    "payment_method": {
      "type": "card",
      "card_number_type": "fpan",
      "virtual": false,
      "number": "4242424242424242",
      "exp_month": "12",
      "exp_year": "2027",
      "name": "John Doe",
      "cvc": "123",
      "display_card_funding_type": "credit",
      "display_brand": "visa",
      "display_last4": "4242"
    },
    "allowance": {
      "reason": "one_time",
      "max_amount": 3200,
      "currency": "usd",
      "checkout_session_id": "cs_abc123",
      "merchant_id": "merchant_xyz",
      "expires_at": "2026-01-21T12:00:00Z"
    },
    "risk_signals": [
      {
        "type": "card_testing",
        "score": 10,
        "action": "authorized"
      }
    ],
    "billing_address": {
      "name": "John Doe",
      "line_one": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94102"
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": "vt_01J8Z3WXYZ9ABC",
    "created": "2026-01-21T11:00:00Z",
    "metadata": {
      "source": "agent_checkout",
      "merchant_id": "merchant_xyz"
    }
  }
  ```

**Step 2: Complete Checkout with Merchant**

- **Endpoint**: `POST /checkout_sessions/{id}/complete`
- **Request**:
  ```json
  {
    "payment_data": {
      "token": "vt_01J8Z3WXYZ9ABC",
      "provider": "stripe",
      "billing_address": {
        "name": "John Doe",
        "line_one": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "US",
        "postal_code": "94102"
      }
    }
  }
  ```

**Response (Success - No 3DS)**:
```json
{
  "id": "cs_abc123",
  "status": "completed",
  "order": {
    "id": "order_xyz789",
    "checkout_session_id": "cs_abc123",
    "permalink_url": "https://merchant.com/orders/xyz789"
  }
}
```

**Response (3DS Required)**:
```json
{
  "id": "cs_abc123",
  "status": "authentication_required",
  "authentication_metadata": {
    "redirect_url": "https://3ds.stripe.com/challenge/abc",
    "acquirer_details": { },
    "directory_server_info": { }
  },
  "messages": [
    {
      "type": "error",
      "code": "requires_3ds",
      "param": "$.authentication_result",
      "content_type": "plain",
      "content": "This checkout session requires issuer authentication"
    }
  ]
}
```

**Step 3: Handle 3DS Authentication (if required)**

If session status is `authentication_required`:

1. UI redirects user to `authentication_metadata.redirect_url` or embeds 3DS challenge iframe
2. User completes 3DS verification with their bank
3. 3DS provider returns authentication result
4. UI calls complete endpoint again with `authentication_result`:

```json
{
  "payment_data": {
    "token": "vt_01J8Z3WXYZ9ABC",
    "provider": "stripe"
  },
  "authentication_result": {
    "outcome": "authenticated",
    "outcome_details": {
      "three_ds_cryptogram": "AAIBBYNoEQAAAAAAg4PyBhdAEQs=",
      "electronic_commerce_indicator": "05",
      "transaction_id": "f38e6948-5388-41a6-bca4-b49723c19437",
      "version": "2.2.0"
    }
  }
}
```

### Tasks

- [x] Create API client service in UI (`lib/api-client.ts`)
  - [x] Configure base URL and authentication headers
  - [x] Add `API-Version` header support
  - [x] Implement `Idempotency-Key` generation for payment requests
  - [x] Implement error handling and retry logic
  - [x] Add request/response type definitions matching ACP schemas
- [x] Update `useCheckoutFlow` hook to call real APIs
  - [x] Send `agent_capabilities` in session creation
  - [x] Parse `payment_provider` and `seller_capabilities` from response
  - [x] Validate card network against `supported_card_networks` before payment
  - [x] Handle all session states including `authentication_required`
  - [x] Implement session updates on quantity/shipping changes
- [x] Implement PSP integration in UI
  - [x] Create payment form with proper PaymentMethodCard fields
  - [x] Call PSP `delegate_payment` endpoint with full schema
  - [x] Include at least one RiskSignal in request
  - [x] Handle vault token response
- [x] Implement 3D Secure flow
  - [x] Detect `authentication_required` status
  - [x] Redirect user to 3DS challenge URL or embed iframe
  - [x] Capture authentication_result after 3DS completion
  - [x] Call complete endpoint with authentication_result
  - [x] Handle all authentication outcomes (authenticated, denied, canceled, processing_error)
- [x] Update `CheckoutCard` component
  - [x] Pass vault token and provider to complete endpoint
  - [x] Display loading states during API calls
  - [x] Show 3DS challenge UI when required
  - [x] Handle and display API errors gracefully
- [x] Update `ConfirmationCard` component
  - [x] Display real order data from API response
  - [x] Show order ID and `permalink_url` for order tracking
- [x] Add environment configuration
  - [x] `NEXT_PUBLIC_API_URL` for merchant backend
  - [x] `NEXT_PUBLIC_PSP_URL` for PSP endpoints
  - [x] `NEXT_PUBLIC_API_VERSION` for version header
- [x] Implement error handling UI
  - [x] Network error states with retry
  - [x] Validation error display (`missing`, `invalid` codes)
  - [x] Payment failure handling (`payment_declined`)
  - [x] Out of stock handling (`out_of_stock`)
  - [x] 3DS failure handling (`requires_3ds`, `denied`, `canceled`)
- [x] Add loading states and optimistic updates
  - [x] Skeleton loaders during API calls
  - [x] Disable buttons during processing
  - [x] Show processing indicator during payment and 3DS

### State Management

```typescript
type SessionStatus = 
  | 'not_ready_for_payment' 
  | 'ready_for_payment' 
  | 'authentication_required' 
  | 'in_progress'
  | 'completed' 
  | 'canceled';

interface PaymentProvider {
  provider: 'stripe';
  supported_payment_methods: Array<{
    type: 'card';
    supported_card_networks: Array<'visa' | 'mastercard' | 'amex' | 'discover'>;
  }>;
}

interface SellerCapabilities {
  payment_methods: string[];
  interventions: {
    required: string[];
    supported: string[];
  };
}

interface CheckoutSession {
  id: string;
  status: SessionStatus;
  payment_provider: PaymentProvider;
  seller_capabilities: SellerCapabilities;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  };
  fulfillment_options: FulfillmentOption[];
  authentication_metadata?: AuthenticationMetadata;
  order?: Order;
  messages: Message[];
  links: Link[];
}

interface CheckoutState {
  sessionId: string | null;
  session: CheckoutSession | null;
  vaultToken: string | null;
  authenticationResult: AuthenticationResult | null;
  isLoading: boolean;
  is3DSPending: boolean;
  error: string | null;
}

type CheckoutAction =
  | { type: 'CREATE_SESSION_START' }
  | { type: 'CREATE_SESSION_SUCCESS'; payload: CheckoutSession }
  | { type: 'UPDATE_SESSION_START' }
  | { type: 'UPDATE_SESSION_SUCCESS'; payload: CheckoutSession }
  | { type: 'DELEGATE_PAYMENT_SUCCESS'; payload: string }
  | { type: 'COMPLETE_CHECKOUT_START' }
  | { type: 'COMPLETE_CHECKOUT_SUCCESS'; payload: CheckoutSession }
  | { type: 'AUTHENTICATION_REQUIRED'; payload: CheckoutSession }
  | { type: 'AUTHENTICATION_COMPLETE'; payload: AuthenticationResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };
```

### Error Handling

| HTTP | Code | Error Scenario | UI Behavior |
|------|------|---------------|-------------|
| 400 | `missing` | Required field missing | Highlight missing fields, show validation errors |
| 400 | `invalid` | Invalid format/value | Show specific field errors |
| 400 | `out_of_stock` | Item unavailable | Show out of stock message, offer alternatives |
| 401 | - | Unauthorized | Redirect to login or show auth error |
| 404 | - | Session not found | Redirect to product grid, show error toast |
| 405 | - | Invalid state transition | Show error message, refresh session state |
| 409 | `idempotency_conflict` | Duplicate request with different params | Generate new idempotency key, retry |
| 422 | `payment_declined` | Card authorization failed | Show decline message, allow retry |
| 422 | `requires_3ds` | 3D Secure required | Initiate 3DS flow |
| 500 | - | Server error | Show generic error, offer retry |
| 503 | - | Service unavailable | Show maintenance message, auto-retry |

### Acceptance Criteria

- [x] Clicking a product creates a real checkout session via API with `agent_capabilities`
- [x] UI correctly parses `payment_provider` and `seller_capabilities` from response
- [x] Card network is validated against `supported_card_networks` before payment
- [x] Quantity changes update the session and recalculate totals
- [x] Shipping option selection updates session with fulfillment details
- [x] Pay button is disabled until session reaches `ready_for_payment` status
- [x] Payment flow successfully obtains vault token from PSP with proper schema
- [x] At least one `risk_signal` is included in delegate_payment request
- [x] Complete endpoint processes payment and creates order
- [x] 3DS flow is handled when `authentication_required` status is returned
- [x] Authentication result is properly captured and sent to complete endpoint
- [x] All authentication outcomes are handled (success, denied, canceled, error)
- [x] Confirmation displays real order details including `permalink_url`
- [x] Loading states are shown during all API operations
- [x] All ACP error codes are handled with user-friendly messages
- [ ] Session state is preserved on page refresh (via session ID in URL or storage)
- [x] All amounts are displayed in proper format (minor units converted to dollars)

---

## Feature 14: Enhanced Checkout (Payment & Shipping Information)

**Goal**: Extend the checkout flow to collect and display real payment method details and shipping address information, providing a complete e-commerce experience.

### Current State

The current checkout flow uses hardcoded buyer information and simulated payment details. This feature adds:
- Real payment method input (card number, expiry, CVV)
- Shipping address collection
- Address validation
- Payment method display (masked card number)

### UI Components

#### Payment Information Form
```
┌─────────────────────────────────────────────────┐
│  Payment Method                                 │
├─────────────────────────────────────────────────┤
│  Card Number    [4242 4242 4242 4242]          │
│  Expiry         [12/28]    CVV [•••]           │
│  Cardholder     [John Doe                    ] │
├─────────────────────────────────────────────────┤
│  ☑ Save card for future purchases              │
└─────────────────────────────────────────────────┘
```

#### Shipping Address Form
```
┌─────────────────────────────────────────────────┐
│  Shipping Address                               │
├─────────────────────────────────────────────────┤
│  Full Name      [John Doe                    ] │
│  Address Line 1 [123 Main Street             ] │
│  Address Line 2 [Apt 4B                      ] │
│  City           [San Francisco]  State [CA]   │
│  ZIP Code       [94102]   Country [US ▼]      │
│  Phone          [+1 415-555-0123             ] │
├─────────────────────────────────────────────────┤
│  ☑ Use as billing address                      │
└─────────────────────────────────────────────────┘
```

### Tasks

**Payment Information:**
- [x] Create `PaymentForm` component with card input fields
- [x] Implement card number formatting (spaces every 4 digits)
- [x] Add card type detection (Visa, Mastercard, Amex)
- [x] Implement expiry date validation (MM/YY format)
- [x] Add CVV input with masking
- [x] Display card brand icon based on card number
- [x] Validate card against `supported_card_networks` from session

**Shipping Address:**
- [x] Create `ShippingAddressForm` component
- [ ] Implement address autocomplete (optional - Google Places API)
- [ ] Add country/state selection dropdowns
- [x] Validate required fields (name, address, city, state, zip, country)
- [ ] Support international address formats
- [ ] Add phone number input with country code

**Checkout Flow Integration:**
- [x] Update `useCheckoutFlow` to manage payment/shipping state
- [x] Store shipping address in checkout session via API
- [x] Pass payment details to PSP delegate_payment
- [x] Show summary of payment method (masked) in confirmation
- [x] Display shipping address in order confirmation

**Validation & Error Handling:**
- [x] Client-side validation for all fields
- [x] Display field-level error messages
- [x] Handle address validation errors from API
- [x] Support "billing same as shipping" toggle

### API Integration

Update checkout session with fulfillment address:
```json
POST /checkout_sessions/{id}
{
  "fulfillment_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_line_1": "123 Main Street",
    "address_line_2": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US",
    "phone": "+14155550123"
  }
}
```

### Acceptance Criteria

- [x] Payment form validates card number format and type
- [x] Card type icon displays based on card number prefix
- [x] Shipping address form collects all required fields
- [x] Address is stored in checkout session
- [x] Payment method (masked) displays in confirmation
- [x] Shipping address displays in order confirmation
- [x] Form validation prevents submission with invalid data
- [x] Error messages are clear and actionable

---

## Feature 15: Multi-Language Post-Purchase Messages

**Goal**: Enable the Post-Purchase Agent to generate messages in multiple languages based on customer preferences, with language selection in the UI.

### Supported Languages

| Code | Language | Agent Support | UI Support |
|------|----------|---------------|------------|
| `en` | English | ✅ Implemented | ✅ Implemented |
| `es` | Spanish | ✅ Implemented | ✅ Implemented |
| `fr` | French | ✅ Implemented | ✅ Implemented |

### Current State

The Post-Purchase Agent backend (`src/merchant/services/post_purchase.py`) already supports:
- Multi-language message generation via NAT agent
- Fallback templates in EN/ES/FR
- Language parameter in API requests

This feature adds UI support for language selection and display.

### UI Components

#### Language Selector
```
┌─────────────────────────────────────┐
│  🌐 Language Preference             │
│  ┌─────────────────────────────┐   │
│  │  English                  ▼ │   │
│  ├─────────────────────────────┤   │
│  │  🇺🇸 English                │   │
│  │  🇪🇸 Español                │   │
│  │  🇫🇷 Français               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Localized Message Display
```
┌─────────────────────────────────────────────────┐
│  🛍️ Post-Purchase Message                       │
│  ─────────────────────────────────────────────  │
│  Subject: ¡Tu pedido está en camino! 🚚        │
│                                                 │
│  ¡Hola Juan! Tenemos excelentes noticias...    │
│                                                 │
│  [Language: Español]                            │
└─────────────────────────────────────────────────┘
```

### Tasks

**Language Selection:**
- [x] Add language selector to checkout flow or user preferences
- [x] Store language preference in checkout session
- [x] Pass language to Post-Purchase Agent API
- [ ] Persist language preference in localStorage (deferred - enhancement)

**Agent Activity Panel:**
- [x] Display language indicator on post-purchase message cards
- [ ] Show language flag/icon alongside message (deferred - enhancement)
- [ ] Support RTL languages in future (Arabic, Hebrew) (deferred - enhancement)

**Message Generation:**
- [x] Update `triggerPostPurchaseAgent` to use selected language
- [x] Ensure NAT agent prompt handles all supported languages
- [x] Validate language code before API call
- [x] Fall back to English if language not supported

**Localization Infrastructure:**
- [ ] Create i18n utility for UI strings (deferred - enhancement)
- [ ] Translate UI labels (buttons, headers, error messages) (deferred - enhancement)
- [ ] Support browser language detection as default (deferred - enhancement)
- [ ] Add language switcher to navigation (deferred - enhancement)

### API Updates

Post-purchase message request with language:
```json
POST /api/agents/post-purchase
{
  "brand_persona": {
    "company_name": "ACME Store",
    "tone": "friendly",
    "preferred_language": "es"  // Language selection
  },
  "order": {
    "order_id": "order_123",
    "customer_name": "Juan",
    "product_name": "Camiseta Clásica",
    "tracking_url": null,
    "estimated_delivery": "2026-01-29T00:00:00Z"
  },
  "status": "order_confirmed"
}
```

### Acceptance Criteria

- [x] Language selector available in checkout flow
- [ ] Selected language persists across sessions (deferred - enhancement)
- [x] Post-purchase messages generate in selected language
- [x] Language indicator displays on message cards
- [x] Fallback to English if generation fails
- [ ] UI labels support localization framework (deferred - enhancement)
- [ ] Browser language detected as default preference (deferred - enhancement)

---

## Feature 16: Apps SDK Integration (Merchant Iframe)

**Goal**: Implement an alternative checkout experience using the Apps SDK pattern, where the merchant controls a fully-owned iframe embedded within the Client Agent panel. This demonstrates how merchants can maintain complete UI control while leveraging the ACP payment infrastructure.

**Reference**: [ChatGPT Apps SDK Developer Guide](../docs/specs/apps-sdk-spec.md)

### Architecture Overview

The Apps SDK approach differs from the Native ACP flow by giving the merchant full control over the shopping experience UI:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPS SDK INTEGRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT AGENT PANEL                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  [Native ACP] [Apps SDK]  ← Tab Switcher                            │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │                                                                     │  │
│   │   ┌───────────────────────────────────────────────────────────┐    │  │
│   │   │                  MERCHANT IFRAME                          │    │  │
│   │   │  (Merchant-owned HTML served from /merchant-app)          │    │  │
│   │   │                                                           │    │  │
│   │   │  ┌─────────────────────────────────────────────────────┐  │    │  │
│   │   │  │  👤 Welcome, John! | 🏆 1,250 Points               │  │    │  │
│   │   │  ├─────────────────────────────────────────────────────┤  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  RECOMMENDED FOR YOU (from ARAG Agent)              │  │    │  │
│   │   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │    │  │
│   │   │  │  │ Item 1  │  │ Item 2  │  │ Item 3  │             │  │    │  │
│   │   │  │  │  $25    │  │  $35    │  │  $28    │             │  │    │  │
│   │   │  │  │ [Add]   │  │ [Add]   │  │ [Add]   │             │  │    │  │
│   │   │  │  └─────────┘  └─────────┘  └─────────┘             │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  🛒 SHOPPING CART                                   │  │    │  │
│   │   │  │  ├─ Classic Tee x1 ............... $25.00          │  │    │  │
│   │   │  │  ├─ V-Neck Tee x1 ................ $28.00          │  │    │  │
│   │   │  │  └─ Subtotal: $53.00                               │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  [Checkout with ACP] → triggers callTool()          │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  └─────────────────────────────────────────────────────┘  │    │  │
│   │   │                                                           │    │  │
│   │   └───────────────────────────────────────────────────────────┘    │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   COMMUNICATION VIA window.openai BRIDGE (simulated)                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Iframe                    Parent (Client Agent)                    │  │
│   │    │                              │                                 │  │
│   │    │  callTool("checkout", {      │                                 │  │
│   │    │    cartItems: [...],         │                                 │  │
│   │    │    loyaltyPoints: 1250       │                                 │  │
│   │    │  })                          │                                 │  │
│   │    │ ─────────────────────────────▶                                 │  │
│   │    │                              │                                 │  │
│   │    │                    Triggers ACP payment flow                   │  │
│   │    │                    (same as Native approach)                   │  │
│   │    │                              │                                 │  │
│   │    │  {orderId: "order_xyz"}      │                                 │  │
│   │    │ ◀─────────────────────────────                                 │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Differences from Native ACP

| Aspect | Native ACP | Apps SDK |
|--------|-----------|----------|
| **UI Control** | Client Agent controls UI | Merchant controls UI via iframe |
| **Product Display** | Product grid with cards | Merchant-designed recommendation carousel |
| **Shopping Experience** | Single product checkout | Full shopping cart with multiple items |
| **Recommendations** | Displayed in Agent Activity | Integrated in merchant UI (from ARAG) |
| **Loyalty Integration** | Not displayed | Pre-authenticated user with points |
| **Checkout Trigger** | Click product → ACP flow | Add to cart → Checkout button → `callTool()` |
| **Payment Flow** | Same | Same (ACP + PSP) |

### Components

#### 16.1 Tab Switcher Component

A tab interface at the top of the Client Agent panel to switch between modes:

```tsx
// Component location: src/ui/components/agent/ModeTabSwitcher.tsx

interface ModeTabSwitcherProps {
  activeMode: 'native' | 'apps-sdk';
  onModeChange: (mode: 'native' | 'apps-sdk') => void;
}
```

**Design**:
- Two tabs: "Native ACP" and "Apps SDK"
- Visual indicator for active tab
- Smooth transition when switching modes
- Persists selection in component state

#### 16.2 Merchant Iframe App

A merchant-owned HTML application served from a dedicated route:

**Route**: `/merchant-app` (Next.js page or static HTML)

**Features**:
- **Loyalty Points Display**: Shows pre-authenticated user with points balance
- **Recommendations Carousel**: 3 items from ARAG Recommendation Agent
- **Shopping Cart**: Add/remove items, quantity adjustment
- **Checkout Button**: Triggers `window.openai.callTool()` for payment

**Simulated `window.openai` Bridge**:

The parent window injects a simulated `window.openai` object into the iframe:

```typescript
// Simulated Apps SDK bridge
interface SimulatedOpenAI {
  theme: 'light' | 'dark';
  locale: string;
  toolOutput: {
    recommendations: Product[];
    loyaltyPoints: number;
    user: { name: string; email: string };
  };
  
  callTool: (name: string, args: Record<string, unknown>) => Promise<{ result: string }>;
  setWidgetState: (state: unknown) => Promise<void>;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
}
```

#### 16.3 Iframe Container Component

Embeds the merchant iframe within the Client Agent panel:

```tsx
// Component location: src/ui/components/agent/MerchantIframeContainer.tsx

interface MerchantIframeContainerProps {
  onCheckout: (cartItems: CartItem[], loyaltyPoints: number) => void;
}
```

**Responsibilities**:
- Load merchant app in sandboxed iframe
- Inject simulated `window.openai` bridge
- Handle `callTool` messages from iframe via `postMessage`
- Pass checkout data to parent for ACP payment flow

#### 16.4 ARAG Recommendations Integration

The iframe fetches recommendations from the ARAG agent via API:

**API Route**: `GET /api/recommendations?context={cart_context}`

**Flow**:
1. Merchant iframe loads with pre-authenticated user context
2. Iframe calls recommendations API with user/session context
3. API proxies to ARAG Recommendation Agent (port 8004)
4. Returns top 3 personalized recommendations
5. Iframe displays in carousel format

#### 16.5 Pre-Authenticated User & Loyalty Points

For demonstration purposes, the user is pre-authenticated:

```typescript
// Mock authenticated user
const mockUser = {
  id: 'user_demo123',
  name: 'John Doe',
  email: 'john@example.com',
  loyaltyPoints: 1250,
  tier: 'Gold',
  memberSince: '2024-03-15'
};
```

**Loyalty Display**:
- Points balance in header
- Tier badge (Bronze/Silver/Gold/Platinum)
- Points redemption option during checkout (future enhancement)

### Merchant Iframe Implementation

#### HTML Structure

```html
<!-- Route: /merchant-app (served as iframe content) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Merchant Store</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="merchant-app"></div>
  <script type="module" src="/merchant-app.js"></script>
</body>
</html>
```

#### React Component Structure

```
src/ui/app/merchant-app/
├── page.tsx              # Next.js page (iframe content)
├── components/
│   ├── LoyaltyHeader.tsx       # User info + points display
│   ├── RecommendationCarousel.tsx  # 3-item ARAG recommendations
│   ├── ShoppingCart.tsx        # Cart with add/remove/quantity
│   └── CheckoutButton.tsx      # Triggers callTool()
├── hooks/
│   ├── useRecommendations.ts   # Fetches from ARAG agent
│   ├── useCart.ts              # Shopping cart state
│   └── useOpenAiBridge.ts      # Handles window.openai calls
└── types/
    └── index.ts                # Cart, Product, User types
```

### Communication Protocol

#### Parent → Iframe (Initialization)

```typescript
// Parent sends initial data to iframe
iframe.contentWindow.postMessage({
  type: 'INIT_MERCHANT_APP',
  payload: {
    theme: 'light',
    locale: 'en-US',
    user: mockUser,
    recommendations: await fetchRecommendations()
  }
}, '*');
```

#### Iframe → Parent (Tool Calls)

```typescript
// Iframe requests checkout via callTool pattern
window.parent.postMessage({
  type: 'CALL_TOOL',
  toolName: 'checkout',
  args: {
    cartItems: [
      { productId: 'prod_1', quantity: 1, price: 2500 },
      { productId: 'prod_2', quantity: 2, price: 2800 }
    ],
    subtotal: 8100,
    loyaltyPoints: 1250,
    applyPoints: false  // Future: redeem points
  }
}, '*');
```

#### Parent → Iframe (Tool Response)

```typescript
// Parent sends result back to iframe
iframe.contentWindow.postMessage({
  type: 'TOOL_RESULT',
  toolName: 'checkout',
  result: {
    success: true,
    orderId: 'order_xyz789',
    message: 'Order placed successfully!'
  }
}, '*');
```

### API Endpoints

#### 16.6 Recommendations API Proxy

Creates a Next.js API route to proxy ARAG agent requests:

**Route**: `GET /api/recommendations`

```typescript
// src/ui/app/api/recommendations/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartItems = JSON.parse(searchParams.get('cart_items') || '[]');
  
  // Call ARAG Recommendation Agent
  const response = await fetch(`${RECOMMENDATION_AGENT_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: JSON.stringify({
        cart_items: cartItems,
        session_context: { user_id: 'user_demo123' }
      })
    })
  });
  
  const result = await response.json();
  return Response.json({
    recommendations: result.recommendations.slice(0, 3)
  });
}
```

### Merchant Iframe UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  🏪 ACME Store                          👤 John | 🏆 1,250 pts  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✨ RECOMMENDED FOR YOU                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │          │
│  │              │  │              │  │              │          │
│  │ Classic Tee  │  │  V-Neck Tee  │  │ Graphic Tee  │          │
│  │    $25.00    │  │    $28.00    │  │    $32.00    │          │
│  │  ⭐ 4.8 (42) │  │  ⭐ 4.6 (28) │  │  ⭐ 4.9 (67) │          │
│  │  [Add to 🛒] │  │  [Add to 🛒] │  │  [Add to 🛒] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                          ◀ ─ ─ ▶                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  🛒 YOUR CART (2 items)                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ┌────┐  Classic Tee              $25.00   [−] 1 [+]  ✕     ││
│  │ │img │  Size: M, Color: Navy                               ││
│  │ └────┘                                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ┌────┐  V-Neck Tee               $28.00   [−] 1 [+]  ✕     ││
│  │ │img │  Size: L, Color: Black                              ││
│  │ └────┘                                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Subtotal:                                            $53.00   │
│  Shipping:                                             $5.00   │
│  ─────────────────────────────────────────────────────────────  │
│  Total:                                               $58.00   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              🔒 Checkout with ACP                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Protocol Inspector Integration

Apps SDK events are logged in the Merchant Panel alongside native ACP events:

| Event Type | Source | Description |
|------------|--------|-------------|
| `apps_sdk.iframe_loaded` | Client Agent | Merchant iframe initialized |
| `apps_sdk.recommendations_fetched` | ARAG Agent | 3 recommendations loaded |
| `apps_sdk.cart_updated` | Merchant Iframe | Item added/removed/quantity changed |
| `apps_sdk.checkout_initiated` | Merchant Iframe | callTool('checkout') called |
| `acp.session_created` | Merchant API | Standard ACP session created |
| `acp.payment_delegated` | PSP | Vault token obtained |
| `acp.checkout_completed` | Merchant API | Order created |

### Environment Configuration

```env
# Apps SDK Configuration (src/ui/.env.local)
NEXT_PUBLIC_MERCHANT_APP_URL=/merchant-app
NEXT_PUBLIC_RECOMMENDATION_AGENT_URL=http://localhost:8004

# MCP Server Configuration (for ChatGPT testing)
MCP_SERVER_PORT=2091
NGROK_ENABLED=false
```

### Deployment & Testing Architecture

The Apps SDK integration is architected to support **three testing modes**, following the [OpenAI Apps SDK deployment guidelines](https://developers.openai.com/apps-sdk/deploy):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TESTING & DEPLOYMENT MODES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 1: STANDALONE (Local Development)                                     │
│  ═══════════════════════════════════════                                    │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   Protocol      │     │  Merchant App   │     │   ACP Backend   │       │
│  │   Inspector     │────▶│  (iframe)       │────▶│   + ARAG Agent  │       │
│  │   (Next.js)     │     │  localhost:3000 │     │   localhost:8000│       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│         │                        │                                          │
│         ▼                        ▼                                          │
│  Simulated window.openai    postMessage bridge                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 2: CHATGPT INTEGRATION (ngrok Tunnel)                                 │
│  ════════════════════════════════════════════                               │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    ChatGPT      │     │   MCP Server    │     │  Merchant App   │       │
│  │    (Real)       │────▶│  (ngrok tunnel) │────▶│  + ACP Backend  │       │
│  │                 │     │  *.ngrok.app    │     │  localhost:*    │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│         │                        │                                          │
│         ▼                        ▼                                          │
│  Real window.openai        MCP Protocol                                     │
│  injected by ChatGPT       over HTTPS                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 3: PRODUCTION (Deployed)                                              │
│  ═════════════════════════════                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    ChatGPT      │     │   MCP Server    │     │  Merchant App   │       │
│  │    (Real)       │────▶│  (Vercel/etc)   │────▶│  (Production)   │       │
│  │                 │     │  HTTPS endpoint │     │                 │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mode 1: Standalone Testing (Simulated ChatGPT)

For local development without ChatGPT:

```bash
# Terminal 1: Start ACP Backend + ARAG Agent
uvicorn src.merchant.main:app --reload --port 8000
nat serve --config_file src/agents/configs/recommendation.yml --port 8004

# Terminal 2: Start Frontend (includes merchant app)
cd src/ui && pnpm run dev

# Access Protocol Inspector at http://localhost:3000
# Switch to "Apps SDK" tab to test merchant iframe
```

The standalone mode uses a **simulated `window.openai` bridge** that mimics the real ChatGPT Apps SDK:
- Parent window injects simulated bridge via `postMessage`
- Merchant iframe uses same code as production
- Full ACP payment flow works identically

#### Mode 2: ChatGPT Integration Testing (ngrok)

For testing directly in ChatGPT before production:

```bash
# Terminal 1: Start all backend services
uvicorn src.merchant.main:app --reload --port 8000
uvicorn src.payment.main:app --reload --port 8001
nat serve --config_file src/agents/configs/recommendation.yml --port 8004

# Terminal 2: Start MCP Server
cd src/apps-sdk && npm run dev  # Starts on port 2091

# Terminal 3: Start ngrok tunnel
ngrok http 2091
# Output: https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp

# Terminal 4: Start merchant app (widget bundle)
cd src/ui && pnpm run dev
```

**ChatGPT Configuration:**
1. Go to ChatGPT Settings → Connectors
2. Add Connector with ngrok URL: `https://<subdomain>.ngrok.app/mcp`
3. Test with prompts like: "Show me t-shirt recommendations"

#### Mode 3: Production Deployment

For production, deploy to a hosting platform with HTTPS:

| Platform | Use Case |
|----------|----------|
| **Vercel** | Quick deploy, preview environments, automatic HTTPS |
| **Alpic** | Ready-to-deploy Apps SDK starter with one-click deploy |
| **Fly.io / Render** | Managed containers with automatic TLS |
| **Cloud Run** | Scale-to-zero serverless containers |

### MCP Server Architecture

The merchant app is structured as a proper MCP server that works with ChatGPT:

```
src/apps-sdk/
├── server/
│   ├── main.py                    # FastMCP server entry point
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── recommendations.py     # get-recommendations tool
│   │   ├── cart.py                # add-to-cart, remove-from-cart tools
│   │   └── checkout.py            # checkout tool (triggers ACP)
│   └── requirements.txt
│
├── widgets/
│   ├── product-carousel.html      # Recommendation carousel widget
│   ├── shopping-cart.html         # Cart management widget
│   └── order-confirmation.html    # Post-checkout confirmation
│
├── src/
│   ├── components/
│   │   ├── ProductCarousel.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── LoyaltyHeader.tsx
│   ├── hooks/
│   │   ├── use-openai-global.ts   # window.openai subscription
│   │   ├── use-widget-state.ts    # Persistent state
│   │   └── use-call-tool.ts       # Tool calling wrapper
│   └── index.tsx
│
├── package.json
├── tsconfig.json
└── vite.config.ts                 # Builds widget bundles
```

#### MCP Tools Definition

```python
# src/apps-sdk/server/main.py

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="acme-store", stateless_http=True)

@mcp.tool()
async def get_recommendations(user_id: str, cart_items: list[str]) -> dict:
    """Get personalized product recommendations from ARAG agent."""
    # Calls ARAG Recommendation Agent
    recommendations = await fetch_arag_recommendations(user_id, cart_items)
    return {
        "recommendations": recommendations[:3],
        "_meta": {
            "openai/outputTemplate": "ui://widget/product-carousel.html",
            "openai/widgetAccessible": True,
        }
    }

@mcp.tool()
async def add_to_cart(product_id: str, quantity: int = 1) -> dict:
    """Add a product to the shopping cart."""
    cart = update_cart(product_id, quantity)
    return {
        "cart": cart,
        "_meta": {
            "openai/outputTemplate": "ui://widget/shopping-cart.html",
            "openai/widgetSessionId": cart["id"],
        }
    }

@mcp.tool()
async def checkout(cart_id: str) -> dict:
    """Process checkout using ACP payment flow."""
    # Creates ACP session, delegates payment, completes checkout
    order = await process_acp_checkout(cart_id)
    return {
        "order": order,
        "_meta": {
            "openai/outputTemplate": "ui://widget/order-confirmation.html",
            "openai/closeWidget": True,
        }
    }
```

### Tasks

**Phase 1: Tab Switcher & Container**
- [ ] Create `ModeTabSwitcher` component with Native/Apps SDK tabs
- [ ] Create `MerchantIframeContainer` component
- [ ] Update `AgentPanel` to conditionally render based on active mode
- [ ] Implement mode persistence in component state

**Phase 2: Merchant Iframe App (Standalone)**
- [ ] Create `/merchant-app` Next.js route for standalone testing
- [ ] Implement `LoyaltyHeader` component with pre-authenticated user
- [ ] Implement `RecommendationCarousel` component (3 items)
- [ ] Implement `ShoppingCart` component with add/remove/quantity
- [ ] Implement `CheckoutButton` component
- [ ] Create simulated `window.openai` bridge for standalone mode

**Phase 3: MCP Server (ChatGPT Integration)**
- [ ] Create `src/apps-sdk/server/` with FastMCP server
- [ ] Implement `get-recommendations` tool with ARAG integration
- [ ] Implement `add-to-cart` and `remove-from-cart` tools
- [ ] Implement `checkout` tool that triggers ACP flow
- [ ] Register widget HTML resources

**Phase 4: Widget Bundle**
- [ ] Set up Vite build for widget HTML bundles
- [ ] Create `product-carousel.html` widget
- [ ] Create `shopping-cart.html` widget
- [ ] Create `order-confirmation.html` widget
- [ ] Implement `useOpenAiGlobal` and `useWidgetState` hooks

**Phase 5: ARAG Integration**
- [ ] Create `/api/recommendations` proxy route (for standalone)
- [ ] Connect MCP `get-recommendations` tool to ARAG agent
- [ ] Implement `useRecommendations` hook for widgets
- [ ] Add loading and error states

**Phase 6: Payment Flow Integration**
- [ ] Connect MCP `checkout` tool to ACP payment flow
- [ ] Handle multi-item cart processing
- [ ] Display order confirmation in widget
- [ ] Log Apps SDK events in Protocol Inspector

**Phase 7: ngrok Testing**
- [ ] Document ngrok setup for ChatGPT testing
- [ ] Add environment variable for tunnel mode
- [ ] Test complete flow in real ChatGPT
- [ ] Capture screenshots/recordings for documentation

**Phase 8: Polish & Production Prep**
- [ ] Add smooth transitions between modes
- [ ] Ensure consistent styling with native mode
- [ ] Add deployment scripts for Vercel
- [ ] Create deployment documentation

### Acceptance Criteria

**Tab Switcher**:
- [ ] Tab switcher displays "Native ACP" and "Apps SDK" options
- [ ] Active tab is visually indicated
- [ ] Switching modes is smooth and instant
- [ ] Mode selection is preserved during session

**Merchant Iframe (Standalone Mode)**:
- [ ] Iframe loads merchant app from `/merchant-app` route
- [ ] Pre-authenticated user displays with name and loyalty points
- [ ] Recommendation carousel shows 3 items from ARAG agent
- [ ] Shopping cart supports add/remove items and quantity changes
- [ ] Simulated `window.openai` bridge works identically to real ChatGPT

**MCP Server (ChatGPT Integration)**:
- [ ] MCP server starts and responds to tool calls
- [ ] `get-recommendations` tool returns ARAG recommendations
- [ ] `add-to-cart` and `checkout` tools work correctly
- [ ] Widget resources are served with correct MIME types
- [ ] Server supports ngrok tunneling for ChatGPT testing

**ARAG Integration**:
- [ ] Recommendations are fetched from ARAG Recommendation Agent
- [ ] Recommendations are contextually relevant (based on session)
- [ ] Loading and error states are handled gracefully

**Communication Bridge**:
- [ ] `window.openai.callTool()` pattern works from iframe (standalone)
- [ ] `window.openai.callTool()` works from real ChatGPT (via ngrok)
- [ ] Parent receives and processes checkout requests
- [ ] Results are returned to iframe/widget after payment

**Payment Flow**:
- [ ] Multi-item cart is processed through ACP
- [ ] Same PSP delegate_payment → complete flow as native
- [ ] Order confirmation displays in iframe/widget

**Protocol Inspector**:
- [ ] Apps SDK events appear in Merchant Panel
- [ ] Event flow is traceable from iframe to order completion

**Deployment & Testing**:
- [ ] Standalone mode works without ChatGPT connection
- [ ] ngrok tunnel successfully exposes MCP server to ChatGPT
- [ ] Real ChatGPT can invoke tools and render widgets
- [ ] Widget bundle builds correctly for production
- [ ] Documentation covers all three testing modes

---

## Implementation Order

### Phase 1: Foundation (Features 1-4)
Build the core infrastructure and ACP-compliant API.

1. **Feature 1**: Project Foundation & Setup
2. **Feature 2**: Database Schema & Seed Data
3. **Feature 3**: ACP Core Endpoints
4. **Feature 4**: API Security & Validation

### Phase 2: Intelligence (Features 5-8)
Add payment processing and intelligent agents.

5. **Feature 5**: PSP - Delegated Payments
6. **Feature 6**: Promotion Agent
7. **Feature 7**: Recommendation Agent
8. **Feature 8**: Post-Purchase Agent

### Phase 3: Experience (Features 9-13)
Build the frontend, observability layer, and backend integration.

9. **Feature 9**: Client Agent Simulator
10. **Feature 10**: Multi-Panel Protocol Inspector
11. **Feature 11**: Webhook Integration
12. **Feature 12**: Agent Panel Checkout Flow Simulation
13. **Feature 13**: Integration of UI and ACP Server

### Phase 4: Polish (Features 14-15)
Enhance checkout experience and internationalization.

14. **Feature 14**: Enhanced Checkout (Payment & Shipping)
15. **Feature 15**: Multi-Language Post-Purchase Messages

### Phase 5: Apps SDK Integration (Feature 16)
Demonstrate alternative merchant-controlled checkout experience.

16. **Feature 16**: Apps SDK Integration (Merchant Iframe)
    - Tab switcher for Native ACP vs Apps SDK modes
    - Merchant-owned iframe with full UI control
    - ARAG-powered recommendations carousel (3 items)
    - Shopping cart with multi-item support
    - Loyalty points display for pre-authenticated user
    - Same ACP payment flow as native approach

---

## Non-Functional Requirements (Apply to All Features)

| NFR | Requirement | Target |
|-----|-------------|--------|
| NFR-LAT | Response latency | <10s for typical operations |
| NFR-LAN | Multilingual support | EN, ES, FR |
| NFR-NIM | Inference configuration | NVIDIA API or local Docker |
| NFR-SEC | Transport security | HTTPS-only (except local dev) |
| NFR-SQL | SQL injection prevention | Parameterized queries only |

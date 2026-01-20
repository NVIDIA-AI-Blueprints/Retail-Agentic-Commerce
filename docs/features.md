# Feature Breakdown: Agentic Commerce Blueprint

This document breaks down the project requirements into discrete, implementable features. Each feature is self-contained and can be tackled incrementally.

---

## Feature Overview

| # | Feature | Priority | Dependencies | Status |
|---|---------|----------|--------------|--------|
| 1 | Project Foundation & Setup | P0 | None | ✅ Complete |
| 2 | Database Schema & Seed Data | P0 | Feature 1 | |
| 3 | ACP Core Endpoints (CRUD) | P0 | Feature 2 | |
| 4 | API Security & Validation | P0 | Feature 3 | |
| 5 | PSP - Delegated Payments | P1 | Feature 2 | |
| 6 | Promotion Agent (NAT) | P1 | Features 3, 4 | |
| 7 | Recommendation Agent (NAT) | P1 | Features 3, 4 | |
| 8 | Post-Purchase Agent (NAT) | P1 | Features 3, 4 | |
| 9 | Client Agent Simulator (Frontend) | P1 | Feature 3 | |
| 10 | Multi-Panel Protocol Inspector UI | P2 | Feature 9 | |
| 11 | Webhook Integration | P2 | Feature 8 | |

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
  NIM_API_KEY=nvapi-xxx
  
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

- [ ] Define SQLModel models:
  - `Product`: `id`, `sku`, `name`, `base_price`, `stock_count`, `min_margin`, `image_url`
  - `CompetitorPrice`: `id`, `product_id` (FK), `retailer_name`, `price`, `updated_at`
  - `CheckoutSession`: Full ACP state including status, line_items, totals, etc.
- [ ] Create database initialization script
- [ ] Seed 4 products (t-shirts as per PRD):
  ```python
  # Example seed data
  products = [
      Product(id="prod_1", sku="TS-001", name="Classic Tee", base_price=2500, stock_count=100, min_margin=0.15),
      Product(id="prod_2", sku="TS-002", name="V-Neck Tee", base_price=2800, stock_count=50, min_margin=0.12),
      Product(id="prod_3", sku="TS-003", name="Graphic Tee", base_price=3200, stock_count=200, min_margin=0.18),
      Product(id="prod_4", sku="TS-004", name="Premium Tee", base_price=4500, stock_count=25, min_margin=0.20),
  ]
  ```
- [ ] Seed competitor prices for dynamic pricing logic
- [ ] Create database utility functions (get_db session)

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

- [ ] Create Pydantic schemas for all request/response models
- [ ] Implement checkout session service layer
- [ ] Implement all 5 endpoints
- [ ] Handle session state transitions:
  ```
  not_ready_for_payment → ready_for_payment → completed
                       ↘                   ↘
                         →    canceled    ←
  ```
- [ ] Calculate line_items totals (base_amount, discount, tax, total)
- [ ] Generate fulfillment_options based on address
- [ ] Include required `messages[]` and `links[]` in responses

### Acceptance Criteria

- All 5 endpoints return ACP-compliant JSON
- State transitions work correctly
- 404 for non-existent sessions
- 405 for invalid state transitions

---

## Feature 4: API Security & Validation

**Goal**: Secure all ACP endpoints with authentication and strict validation.

### Tasks

- [ ] Implement API key authentication middleware
  - Support `Authorization: Bearer <API_KEY>` header
  - Support `X-API-Key: <API_KEY>` header
- [ ] Return proper error responses:
  - `401 Unauthorized` for missing API key
  - `403 Forbidden` for invalid API key
- [ ] Implement request validation:
  - Strict Pydantic schema validation
  - Reject unexpected fields (`extra = "forbid"`)
- [ ] Implement idempotency via `Idempotency-Key` header
- [ ] Add request/response logging
- [ ] Handle common ACP headers:
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

**Goal**: Implement the demo Payment Service Provider for vault tokens and payment intents.

### Database Tables

```sql
vault_tokens:
  - id (vt_...)
  - idempotency_key (unique)
  - payment_method (json)
  - allowance (json: max_amount, currency, expires_at, merchant_id, checkout_session_id)
  - status (active | consumed)
  - created_at

payment_intents:
  - id (pi_...)
  - vault_token_id (fk)
  - amount
  - currency
  - status (pending | completed)
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
- **Endpoint**: `POST /agentic_commerce/delegate_payment`
- **Status**: `201 Created`
- **Input**: Card details (simulated), allowance parameters
- **Output**: Vault token `vt_xxx`
- **Idempotency**: Same key + same request → cached response; different request → 409

#### 5.2 Create and Process Payment Intent
- **Endpoint**: `POST /agentic_commerce/create_and_process_payment_intent`
- **Status**: `200 OK`
- **Input**: Vault token `vt_xxx`, amount, currency
- **Output**: Payment intent `pi_xxx` with `status: completed`
- **Logic**:
  - Validate token is `active` and not expired
  - Validate amount/currency within allowance
  - Create payment intent
  - Mark vault token as `consumed`

### Acceptance Criteria

- Vault tokens are created with proper allowances
- Idempotency works correctly (same key → same response)
- Payment intents consume vault tokens (single-use)
- Expired/consumed tokens are rejected

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

- [ ] Create NAT workflow for Promotion Agent
- [ ] Implement SQLite query tool for agent:
  - Query `products` table
  - Query `competitor_prices` table
- [ ] Define agent system prompt with pricing rules
- [ ] Implement discount calculation logic
- [ ] Ensure SQL queries are parameterized (injection prevention)
- [ ] Return discount in checkout session `line_items[].discount`

### Example Agent Flow

1. Agent receives product_id from checkout session
2. Agent calls `query_product_stock(product_id)` → returns stock_count
3. Agent calls `query_competitor_price(product_id)` → returns competitor prices
4. Agent reasons: "Stock is 200 units (high), competitor sells at $28, we sell at $32"
5. Agent calculates: "Can discount to $27.20 while maintaining 15% margin"
6. Agent returns discount amount

### Acceptance Criteria

- Agent queries database via tool-calling
- Discounts respect min_margin constraint
- Reasoning trace is captured for UI display
- Agent completes within latency target (<10s)

---

## Feature 7: Recommendation Agent (NAT)

**Goal**: Implement cross-sell recommendation agent using NAT.

### Agent Behavior

Suggests high-affinity, in-stock accessories by analyzing catalog and inventory.

### Tasks

- [ ] Create NAT workflow for Recommendation Agent
- [ ] Implement SQL-based product affinity logic:
  - Join products with inventory
  - Apply margin rules
  - Filter in-stock items only
- [ ] Define agent system prompt with recommendation rules
- [ ] Return suggestions in `metadata.suggestions[]`
- [ ] Ensure recommendations are different from cart items

### Example Agent Flow

1. Agent receives current cart items
2. Agent queries complementary products in-stock
3. Agent filters by margin rules
4. Agent returns top 2-3 recommendations

### Acceptance Criteria

- Recommendations are in-stock
- Recommendations meet margin requirements
- Recommendations are relevant to cart items
- Reasoning trace is captured

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

- [ ] Create NAT workflow for Post-Purchase Agent
- [ ] Implement Brand Persona loading from config
- [ ] Generate shipping pulses in 3 languages (EN/ES/FR)
- [ ] Define tone variations for messaging
- [ ] Integrate with global webhook delivery (Feature 11)
- [ ] Create shipping status templates:
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

- Messages reflect Brand Persona tone
- Messages are in correct language
- All shipping statuses are supported
- Messages are delivered to global webhook

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

- [ ] Create three-panel layout component
- [ ] **Left Panel**: Integrate client simulator (Feature 9)
- [ ] **Middle Panel**: 
  - Display real-time JSON payloads
  - Show session state transitions
  - Highlight active protocol interactions
- [ ] **Right Panel** (Optional):
  - Default: Structured/redacted explainability trace
  - Debug mode: Raw chain-of-thought output
  - Visual connection to JSON changes
- [ ] Add panel synchronization (highlight correlations)
- [ ] Add toggle for debug/demo mode

### Acceptance Criteria

- Three panels display simultaneously
- Panels update in real-time
- JSON is syntax-highlighted
- Agent reasoning is readable
- Panels are synchronized

---

## Feature 11: Webhook Integration

**Goal**: Implement global webhook delivery for post-purchase events.

### Configuration

```env
WEBHOOK_URL=https://your-client.example.com/webhooks/acp
WEBHOOK_SECRET=whsec_xxx
```

### Webhook Event Schema

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

### Tasks

- [ ] Create webhook service
- [ ] Implement HMAC signing for webhook payloads
- [ ] Create webhook event types:
  - `order_created`
  - `order_updated`
- [ ] Implement retry logic for failed deliveries
- [ ] Log webhook delivery status
- [ ] Integrate with Post-Purchase Agent (Feature 8)

### Acceptance Criteria

- Webhooks are signed with HMAC
- Events are delivered to global URL
- Failed deliveries are retried
- All order statuses trigger updates

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

### Phase 3: Experience (Features 9-11)
Build the frontend and observability layer.

9. **Feature 9**: Client Agent Simulator
10. **Feature 10**: Multi-Panel Protocol Inspector
11. **Feature 11**: Webhook Integration

---

## Non-Functional Requirements (Apply to All Features)

| NFR | Requirement | Target |
|-----|-------------|--------|
| NFR-LAT | Response latency | <10s for typical operations |
| NFR-LAN | Multilingual support | EN, ES, FR |
| NFR-NIM | Inference configuration | NVIDIA API or local Docker |
| NFR-SEC | Transport security | HTTPS-only (except local dev) |
| NFR-SQL | SQL injection prevention | Parameterized queries only |

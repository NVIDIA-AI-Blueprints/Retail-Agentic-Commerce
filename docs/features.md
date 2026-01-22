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
| 6 | Promotion Agent (NAT) | P1 | Features 3, 4 | ✅ Complete |
| 7 | Recommendation Agent (NAT) | P1 | Features 3, 4 | |
| 8 | Post-Purchase Agent (NAT) | P1 | Features 3, 4 | |
| 9 | Client Agent Simulator (Frontend) | P1 | Feature 3 | ✅ Complete |
| 10 | Multi-Panel Protocol Inspector UI | P2 | Feature 9 | |
| 11 | Webhook Integration | P2 | Feature 8 | |
| 12 | Agent Panel Checkout Flow Simulation | P1 | Feature 9 | ✅ Complete |
| 13 | Integration of UI and ACP Server | P1 | Features 3, 5, 9, 12 | ✅ Complete |

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
- [ ] Return discount in checkout session `line_items[].discount` (integration pending)

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

---

## Non-Functional Requirements (Apply to All Features)

| NFR | Requirement | Target |
|-----|-------------|--------|
| NFR-LAT | Response latency | <10s for typical operations |
| NFR-LAN | Multilingual support | EN, ES, FR |
| NFR-NIM | Inference configuration | NVIDIA API or local Docker |
| NFR-SEC | Transport security | HTTPS-only (except local dev) |
| NFR-SQL | SQL injection prevention | Parameterized queries only |

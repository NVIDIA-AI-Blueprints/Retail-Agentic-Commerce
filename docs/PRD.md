# Product Requirements Document (PRD): Agentic Commerce Blueprint

**Version**: 1.1

**Status**: Ready for Solutioning

**Author**: Antonio Martinez

## Executive Summary

This project provides a masterful Reference Architecture for both the **Agentic Commerce Protocol (ACP)** and the **Universal Commerce Protocol (UCP)**, designed to transition e-commerce from "passive search" to "active agentic negotiation". It enables merchants to maintain their status as the Merchant of Record while leveraging autonomous intelligence to optimize business outcomes in real-time.

### Dual Protocol Support

The platform implements **both protocols** to demonstrate production-grade commerce interoperability:

1. **ACP Implementation** - Project-specific checkout protocol for rapid prototyping
2. **UCP Implementation** - Industry-standard protocol co-developed by major commerce platforms

Both protocols share the same intelligent agent layer (NAT-powered Promotion, Recommendation, and Post-Purchase agents) and backend services, showcasing how merchants can support multiple protocols simultaneously without duplicating business logic.

**Protocol Toggle:** The Merchant Activity Panel provides a **tab switcher (ACP | UCP)** to toggle between protocols. The client agent flow remains unchanged - only the backend endpoints and protocol format change based on the toggle.

**UCP scope in this project:** UCP support includes **Discovery + Checkout (REST + A2A)**. The A2A transport uses JSON-RPC 2.0 for agent-to-agent communication. Cart/Order/Identity Linking capabilities and MCP/Embedded transports are out of scope for this reference implementation.

### The Technical Vision

The core of this blueprint is a Python **3.12+** (FastAPI) middleware that translates Agentic Commerce Protocol requests into structured business decisions powered by the NVIDIA NeMo Agent Toolkit (NAT)

### Strategic Intelligence Layers

The system orchestrates three specialized agents using the NVIDIA Nemotron-3-Nano-30B (v3) LLM:

1. Promotion Agent (Margin Protection): Reasons over Competitor Prices and Inventory Overstock (via SQL queries) to calculate dynamic discounts.
2. Recommendation Agent (Basket Optimization): Suggests in-stock accessories using SQL-based deterministic joins/rules over catalog + inventory, enforcing constraints (in-stock, margin rules).
3. Post-Purchase Agent (Lifecycle Loyalty): Sends multilingual, brand-aware shipping pulses to a **global webhook endpoint** using the configured **Brand Persona**.

### Client Agent Simulator (Demo Client)

For this project we will also build a **client agent simulator** that behaves like the ACP client:

* **Implementation**: Static simulator with 4 pre-populated products
* **Search Flow**: User enters prompt (e.g., "find some t-shirts") → displays 4 product cards with images
* **Checkout Flow**: User clicks a product → initiates ACP checkout via `POST /checkout_sessions`

## 1. Goals & Background Context

* **Primary Goal**: Create a reference architecture that enables retailers to maintain "Merchant of Record" control while leveraging autonomous agents to optimize margins and loyalty.
* **Protocol Fidelity**: 100% compliance with ACP specification. UCP alignment targets checkout + discovery only (v2026-01-11).
* **Observability**: Real-time "Glass Box" visualization of agent reasoning and JSON traces.

## 2. Functional Requirements (FR)

### 2.1 ACP Checkout Endpoints (Per Official Specification)

Implement the 5 required RESTful endpoints per the ACP specification (API Version: `2026-01-16`):

#### FR-ACP-01: Create Checkout Session
* **Endpoint**: `POST /checkout_sessions`
* **Purpose**: Initialize cart with buyer details and items
* **Request Schema**:
```json
{
  "items": [{ "id": "product_1", "quantity": 1 }],
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890"
  },
  "fulfillment_address": {
    "name": "John Doe",
    "line_one": "123 Main St",
    "line_two": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94105"
  }
}
```
* **Response**: Full checkout state with `status`, `line_items`, `totals`, `fulfillment_options`

#### FR-ACP-02: Update Checkout Session
* **Endpoint**: `POST /checkout_sessions/{id}`
* **Purpose**: Modify items, address, or fulfillment options
* **Status Transition**: `not_ready_for_payment` → `ready_for_payment` when all required fields present

#### FR-ACP-03: Complete Checkout
* **Endpoint**: `POST /checkout_sessions/{id}/complete`
* **Purpose**: Finalize transaction with payment token
* **Request Schema**:
```json
{
  "payment_data": {
    "token": "spt_xxx",
    "provider": "stripe",
    "billing_address": { ... }
  }
}
```
* **Status Transition**: `ready_for_payment` → `completed`

#### FR-ACP-04: Cancel Checkout
* **Endpoint**: `POST /checkout_sessions/{id}/cancel`
* **Status Transition**: Any → `canceled`

#### FR-ACP-05: Get Checkout Session
* **Endpoint**: `GET /checkout_sessions/{id}`
* **Purpose**: Retrieve current checkout state

#### ACP Response Schema (All Endpoints)
All successful responses return the full checkout state:
```json
{
  "id": "checkout_abc123",
  "status": "ready_for_payment",
  "currency": "usd",
  "buyer": { ... },
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
  "line_items": [{
    "id": "item_123",
    "item": { "id": "product_1", "quantity": 1 },
    "base_amount": 2500,
    "discount": 0,
    "subtotal": 2500,
    "tax": 200,
    "total": 2700
  }],
  "fulfillment_details": {
    "name": "John Doe",
    "phone_number": "15551234567",
    "email": "john@example.com",
    "address": { ... }
  },
  "fulfillment_options": [{
    "type": "shipping",
    "id": "shipping_standard",
    "title": "Standard Shipping",
    "subtitle": "5-7 business days",
    "carrier": "USPS",
    "earliest_delivery_time": "2026-01-28T00:00:00Z",
    "latest_delivery_time": "2026-01-30T23:59:59Z",
    "subtotal": 500,
    "tax": 0,
    "total": 500
  }],
  "selected_fulfillment_options": [{
    "type": "shipping",
    "shipping": {
      "option_id": "shipping_standard",
      "item_ids": ["item_123"]
    }
  }],
  "totals": [
    { "type": "subtotal", "display_text": "Subtotal", "amount": 2500 },
    { "type": "fulfillment", "display_text": "Shipping", "amount": 500 },
    { "type": "tax", "display_text": "Tax", "amount": 200 },
    { "type": "total", "display_text": "Total", "amount": 3200 }
  ],
  "messages": [],
  "links": []
}
```

**Session Status Values:**
| Status | Description |
|--------|-------------|
| `not_ready_for_payment` | Initial state, missing required data |
| `ready_for_payment` | All requirements met, ready for payment |
| `authentication_required` | 3D Secure or other authentication required |
| `in_progress` | Payment is being processed |
| `completed` | Successfully completed with order created |
| `canceled` | Session has been canceled |

### 2.2 Intelligent Merchant Agents (NVIDIA NeMo Agent Toolkit)

Each agent is implemented as a NAT workflow following the 3-layer hybrid architecture (deterministic → LLM → deterministic):

* **FR-PROM (Promotion Agent)**: Uses tool-calling to query `products` and `competitor_prices` in SQLite. Logic: If `stock > threshold` and `price > competitor_price`, apply discount to `min_margin`.
* **FR-RECO (Recommendation Agent)**: Implements an **ARAG (Agentic Retrieval Augmented Generation)** multi-agent architecture for personalized cross-sell recommendations. Based on [ARAG research](https://arxiv.org/pdf/2506.21931) (SIGIR 2025), the system uses 4 specialized agents:
  1. **User Understanding Agent (UUA)**: Summarizes buyer preferences from cart and session context
  2. **NLI Agent**: Scores semantic alignment between candidate products and inferred intent
  3. **Context Summary Agent (CSA)**: Synthesizes NLI-filtered candidates with user understanding
  4. **Item Ranker Agent (IRA)**: Produces final ranked recommendations with reasoning
  
  This approach achieves up to 42% improvement over vanilla RAG by integrating agentic reasoning into the retrieval pipeline.
* **FR-POST (Post-Purchase Agent)**: Triggers human-like shipping pulses **to the global webhook endpoint** using the configured **Brand Persona**.

### 2.3 Apps SDK Integration (Merchant-Controlled Iframe)

The platform supports an alternative checkout experience using the **Apps SDK pattern**, where merchants maintain complete UI control via an embedded iframe:

* **FR-SDK-01 (Mode Switcher)**: Client Agent panel provides a tab switcher to toggle between "Native ACP" and "Apps SDK" modes.
* **FR-SDK-02 (Merchant Iframe)**: In Apps SDK mode, the merchant owns and controls an iframe embedded in the Client Agent panel. The merchant provides the HTML/URL, and the client agent provides the iframe container.
* **FR-SDK-03 (ARAG Recommendations)**: The merchant iframe displays 3 personalized recommendations from the ARAG Recommendation Agent in a carousel format.
* **FR-SDK-04 (Shopping Cart)**: Unlike Native ACP (single product checkout), Apps SDK supports a full shopping cart where users can add multiple items before checkout.
* **FR-SDK-05 (Loyalty Points)**: The iframe displays loyalty points for a pre-authenticated user, demonstrating merchant loyalty program integration.
* **FR-SDK-06 (Payment Bridge)**: The iframe triggers checkout via the `window.openai.callTool()` pattern (simulated Apps SDK bridge), which initiates the same ACP payment flow as native mode.

#### Apps SDK Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      CLIENT AGENT PANEL                             │
│  ┌────────────────┬────────────────┐                               │
│  │  [Native ACP]  │  [Apps SDK]   │  ← Tab Switcher                │
│  └────────────────┴────────────────┘                               │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    MERCHANT IFRAME                              ││
│  │  ┌───────────────────────────────────────────────────────────┐ ││
│  │  │  👤 John Doe | 🏆 1,250 pts                               │ ││
│  │  │  ─────────────────────────────────────────────────────────│ ││
│  │  │  RECOMMENDATIONS (from ARAG)                              │ ││
│  │  │  [Item 1] [Item 2] [Item 3]  ← 3 items from ARAG agent   │ ││
│  │  │  ─────────────────────────────────────────────────────────│ ││
│  │  │  SHOPPING CART                                            │ ││
│  │  │  ├─ Classic Tee x1 ... $25                               │ ││
│  │  │  └─ Total: $25                                           │ ││
│  │  │  [Checkout] → callTool('checkout', {...})                │ ││
│  │  └───────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────┘│
│                             │                                       │
│                             ▼                                       │
│                    ACP Payment Flow                                 │
│              (same as Native approach)                              │
└────────────────────────────────────────────────────────────────────┘
```

#### Key Differences: Native ACP vs Apps SDK

| Aspect | Native ACP | Apps SDK |
|--------|-----------|----------|
| UI Control | Client Agent | Merchant (via iframe) |
| Product Display | Product grid | Recommendation carousel |
| Shopping | Single product | Multi-item cart |
| Recommendations | Agent Activity panel | Integrated in merchant UI |
| Loyalty | Not displayed | Pre-authenticated user with points |
| Payment | Same | Same (ACP + PSP) |

#### Apps SDK Deployment & Testing Requirements

Per [OpenAI Apps SDK guidelines](https://developers.openai.com/apps-sdk/deploy), the implementation supports three testing modes:

| Mode | Environment | Purpose |
|------|-------------|---------|
| **Standalone** | Local (localhost:3000) | Development with simulated `window.openai` bridge |
| **Client Agent Integration** | ngrok tunnel | Pre-production testing with a real client agent |
| **Production** | Vercel/Alpic/Cloud | Public deployment via client agent's app directory |

**Standalone Testing** (simulated):
- Protocol Inspector embeds merchant iframe locally
- Simulated `window.openai` bridge mimics client agent behavior
- Full ACP payment flow works without client agent connection

**Client Agent Integration Testing** (via ngrok):
```bash
ngrok http 2091
# Exposes MCP server at https://<subdomain>.ngrok.app/mcp
# Configure tunnel URL in the client agent's connector settings
```

**MCP Server Requirements**:
- Implements `get-recommendations`, `add-to-cart`, `checkout` tools
- Serves widget HTML resources with `openai/outputTemplate` metadata
- Connects to ARAG agent for personalized recommendations
- Triggers ACP payment flow on checkout

### 2.4 Brand Persona Configuration

The Post-Purchase Agent uses a **Brand Persona** for personalized messaging:

```json
{
  "company_name": "Acme T-Shirts",
  "tone": "friendly",
  "preferred_language": "en"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `company_name` | `string` | Yes | Brand name for personalized messaging |
| `tone` | `string` | Yes | Communication style: "friendly", "professional", "casual", "urgent" |
| `preferred_language` | `string` | Yes | ISO 639-1 code: "en", "es", "fr" |

### 2.5 Payments (PSP: delegated payments)

* **FR-PSP-01 (Delegate payment / vault token)**: client submits card details to PSP `POST /agentic_commerce/delegate_payment` and receives a **vault token** `vt_...` (201).
* **FR-PSP-02 (Idempotency)**: PSP supports `Idempotency-Key`:
  * same key + same request → returns cached response
  * same key + different request → **409** `idempotency_conflict`
* **FR-PSP-03 (Process payment intent)**: Merchant calls PSP `POST /agentic_commerce/create_and_process_payment_intent` with `vt_...`:
  * validates token is active + not expired + amount/currency within allowance
  * creates `pi_...` and marks it `completed`
  * marks the vault token as **consumed** (single-use)

## 3. Data Requirements (SQLite Schema)

The middleware maintains a relational state to simulate retailer complex reasoning:

* **`products`**: `id`, `sku`, `name`, `base_price`, `stock_count`, `min_margin`, `image_url`. **Pre-populated with 4 items.**
* **`competitor_prices`**: `id`, `product_id` (FK), `retailer_name`, `price`, `updated_at`.
* **`checkout_sessions`**: Persists ACP state and the Shared Payment Token (SPT) for post-purchase tracking.

## 4. UI/UX Requirements: Multi-Panel Protocol Inspector

A "Glass Box" dashboard built with Next.js to visualize the underlying protocol mechanics across three synchronized panels:

### Left Panel: Agent/Client Simulation
* Shows the simulated customer experience
* **Search Input**: User enters prompt (e.g., "find some t-shirts")
* **Product Grid**: Displays 4 product cards (image + price)
  * **Buy Action**: Clicking a product initiates `POST /checkout_sessions`
* Displays the conversation flow and checkout progress

### Middle Panel: Business/Retailer View
* **JSON Payloads**: Real-time display of ACP protocol requests and responses
* **Session State**: Current checkout session status and metadata
* **Highlights**: Visual indicators showing which part of the JSON corresponds to the current interaction

### Right Panel: Chain of Thought (Optional)
* **Agent Reasoning Trace**: Display real-time **agent reasoning from NeMo Agent Toolkit** when agents are triggered (tool calls, intermediate decisions, step labels)
* **Default mode**: show a **redacted/structured explainability trace** (steps, tool inputs/outputs, short rationale)
* **Demo/Debug mode**: optionally show **raw chain-of-thought-style output** if available from the model/runtime, clearly labeled as "demo/debug only"
* Visual connection between agent decisions and the resulting JSON in the middle panel

## 5. UCP Integration Requirements

### 5.1 UCP Core Endpoints (Per Official Specification)

Implement UCP-compliant endpoints alongside existing ACP endpoints (API Version: `2026-01-11`):

#### FR-UCP-01: UCP Discovery Endpoint
* **Endpoint**: `GET /.well-known/ucp`
* **Purpose**: Advertise business profile with supported capabilities, services, and payment handlers
* **Response Schema**:
```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.shopping": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/overview",
          "transport": "rest",
          "endpoint": "https://merchant.example.com/ucp/v1",
          "schema": "https://ucp.dev/services/shopping/rest.openapi.json"
        }
      ]
    },
    "capabilities": {
      "dev.ucp.shopping.checkout": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/checkout",
          "schema": "https://ucp.dev/schemas/shopping/checkout.json"
        }
      ],
      "dev.ucp.shopping.fulfillment": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/fulfillment",
          "schema": "https://ucp.dev/schemas/shopping/fulfillment.json",
          "extends": "dev.ucp.shopping.checkout"
        }
      ],
      "dev.ucp.shopping.discount": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/discount",
          "schema": "https://ucp.dev/schemas/shopping/discount.json",
          "extends": "dev.ucp.shopping.checkout"
        }
      ]
    },
    "payment_handlers": {
      "com.example.processor_tokenizer": [
        {
          "id": "processor_tokenizer",
          "version": "2026-01-11",
          "spec": "https://example.com/specs/payments/processor_tokenizer",
          "schema": "https://example.com/schemas/processor_tokenizer.json",
          "config": { ... }
        }
      ]
    }
  },
  "signing_keys": [...]
}
```

#### FR-UCP-02: Create Checkout Session (UCP)
* **Endpoint**: `POST /checkout-sessions` (hyphenated per UCP spec)
* **Purpose**: Initialize UCP checkout session with capability negotiation
* **Required Header**: `UCP-Agent: profile="https://platform.example/profile.json"` (RFC 8941 dictionary structured field)
* **Idempotency**: Mutating operations include `Idempotency-Key` for retry safety
* **Request Schema**:
```json
{
  "line_items": [
    {
      "item": { "id": "product_1", "title": "Blue T-Shirt", "price": 1999 },
      "quantity": 1
    }
  ],
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```
* **Response**: Full checkout state with `ucp` metadata, `status`, `line_items`, `totals`
* **Status Transition**: `incomplete` (initial state)

#### FR-UCP-03: Update Checkout Session (UCP)
* **Endpoint**: `PUT /checkout-sessions/{id}` (PUT, not POST)
* **Purpose**: Update checkout session with full replacement semantics
* **Status Transition**: `incomplete` → `ready_for_complete` when all required fields present

#### FR-UCP-04: Complete Checkout (UCP)
* **Endpoint**: `POST /checkout-sessions/{id}/complete`
* **Purpose**: Finalize transaction with payment instruments
* **Request Schema**:
```json
{
  "payment": {
    "instruments": [
      {
        "id": "pm_1234567890abc",
        "handler_id": "processor_tokenizer",
        "type": "card",
        "selected": true,
        "display": {
          "brand": "visa",
          "last_digits": "4242"
        },
        "billing_address": { ... },
        "credential": {
          "type": "PAYMENT_GATEWAY",
          "token": "tok_xxx"
        }
      }
    ]
  },
  "risk_signals": { ... }
}
```
* **Status Transition**: `ready_for_complete` → `completed`

#### FR-UCP-05: Cancel Checkout (UCP)
* **Endpoint**: `POST /checkout-sessions/{id}/cancel`
* **Status Transition**: Any → `canceled`

#### FR-UCP-06: Get Checkout Session (UCP)
* **Endpoint**: `GET /checkout-sessions/{id}`
* **Purpose**: Retrieve current checkout state

**UCP request headers (all endpoints):**
- `UCP-Agent: profile="..."` is required and uses RFC 8941 dictionary structured field syntax
- `Idempotency-Key` is required for mutating operations (`POST`, `PUT`, `complete`, `cancel`)
- `Authorization` is optional and depends on the business's policy

#### UCP Response Schema (All Endpoints)
All successful responses return the full checkout state with UCP metadata:
```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": {
      "dev.ucp.shopping.checkout": [{"version": "2026-01-11"}],
      "dev.ucp.shopping.fulfillment": [{"version": "2026-01-11"}]
    },
    "payment_handlers": {
      "com.example.processor_tokenizer": [
        {"id": "processor_tokenizer", "version": "2026-01-11"}
      ]
    }
  },
  "id": "checkout_abc123",
  "status": "ready_for_complete",
  "currency": "USD",
  "buyer": { ... },
  "line_items": [...],
  "totals": [
    { "type": "subtotal", "label": "Subtotal", "amount": 2500 },
    { "type": "fulfillment", "label": "Shipping", "amount": 500 },
    { "type": "tax", "label": "Tax", "amount": 200 },
    { "type": "total", "label": "Total", "amount": 3200 }
  ],
  "fulfillment": { ... },
  "payment": { ... },
  "messages": [],
  "links": [
    { "type": "terms_of_service", "url": "https://merchant.example.com/terms" }
  ],
  "continue_url": "https://merchant.example.com/checkout-sessions/abc123"
}
```

**Handoff rule:** `continue_url` is required when `status = requires_escalation` and should be omitted for terminal states (`completed`, `canceled`).

**Session Status Values (UCP):**
| Status | Description |
|--------|-------------|
| `incomplete` | Missing required data |
| `requires_escalation` | Buyer input or review required via `continue_url` |
| `ready_for_complete` | All requirements met, ready for payment |
| `complete_in_progress` | Payment is being processed |
| `completed` | Successfully completed with order created |
| `canceled` | Session has been canceled |

### 5.2 Capability Negotiation (UCP-Specific)

* **FR-NEG-01 (Profile Fetching)**: Business fetches platform profile from `UCP-Agent` header
* **FR-NEG-02 (Intersection Computation)**: Compute capability intersection between business and platform profiles
* **FR-NEG-03 (Extension Pruning)**: Remove orphaned extensions whose parents aren't in intersection
* **FR-NEG-04 (Response Metadata)**: Include negotiated capabilities in `ucp` field of every response

### 5.3 Shared Agent Services

Both ACP and UCP protocols share the same intelligent merchant agents:

* **Promotion Agent**: Same 3-layer hybrid reasoning for both protocols
* **Recommendation Agent**: Same ARAG multi-agent architecture for both protocols
* **Post-Purchase Agent**: Same multilingual messaging for both protocols

The agents are protocol-agnostic and invoked by the shared business logic layer.

### 5.4 UI/UX: Merchant Activity Panel Tabs

The Protocol Inspector's Merchant Activity Panel features a **tab switcher**:

* **ACP Tab**: Displays ACP protocol events (Stripe-style checkout sessions)
* **UCP Tab**: Displays UCP protocol events (capability negotiation, UCP checkout sessions)

Both tabs show:
- Real-time JSON payloads
- Session state
- Protocol-specific metadata (API version for ACP, capability intersection for UCP)

## 6. Non-Functional Requirements (NFR)

* **NFR-LAT**: Total internal processing should target <10s for typical operations to ensure responsive user experience.
* **NFR-LAN**: Multilingual support for English, Spanish, and French in the Post-Purchase agent.
* **NFR-NIM**: Inference engine must be **configurable** (NVIDIA hosted API or local Docker).
* **NFR-WEBHOOK**: Single **global webhook URL** for post-purchase event delivery.
* **NFR-SEC**:
  * **API Authentication**: All ACP endpoints must require an **API key** (e.g., `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`), with clear 401/403 responses.
  * **Transport Security**: HTTPS-only in any deployed environment; do not accept plaintext HTTP outside local dev.
  * **Request Validation**: Strict schema validation on ACP payloads; reject unexpected fields where possible.
  * **SQL Safety**: All SQLite tool-calling must be strictly parameter-driven to prevent SQL injection risks.

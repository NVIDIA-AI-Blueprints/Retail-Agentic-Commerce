# Product Requirements Document (PRD): Agentic Commerce Blueprint

**Version**: 1.1

**Status**: Ready for Solutioning

**Author**: Antonio Martinez

## Executive Summary

This project provides a masterful Reference Architecture for the Agentic Commerce Protocol (ACP), designed to transition e-commerce from "passive search" to "active agentic negotiation". It enables merchants to maintain their status as the Merchant of Record while leveraging autonomous intelligence to optimize business outcomes in real-time. 

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
* **Protocol Fidelity**: 100% compliance with ACP specification (OpenAI/Stripe standard).
* **Observability**: Real-time "Glass Box" visualization of agent reasoning and JSON traces.

## 2. Functional Requirements (FR)

### 2.1 ACP Checkout Endpoints (Per Official Specification)

Implement the 5 required RESTful endpoints per the OpenAI/Stripe ACP specification (API Version: `2026-01-16`):

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

Each agent is implemented as a NAT workflow:

* **FR-PROM (Promotion Agent)**: Uses tool-calling to query `products` and `competitor_prices` in SQLite. Logic: If `stock > threshold` and `price > competitor_price`, apply discount to `min_margin`.
* **FR-RECO (Recommendation Agent)**: Suggests high-affinity, in-stock items by appending them to `metadata.suggestions` using SQL-based deterministic joins/rules over catalog + inventory, enforcing constraints (in-stock, margin rules).
* **FR-POST (Post-Purchase Agent)**: Triggers human-like shipping pulses **to the global webhook endpoint** using the configured **Brand Persona**.

### 2.3 Brand Persona Configuration

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

### 2.4 Payments (PSP: delegated payments)

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

## 5. Non-Functional Requirements (NFR)

* **NFR-LAT**: Total internal processing should target <10s for typical operations to ensure responsive user experience.
* **NFR-LAN**: Multilingual support for English, Spanish, and French in the Post-Purchase agent.
* **NFR-NIM**: Inference engine must be **configurable** (NVIDIA hosted API or local Docker).
* **NFR-WEBHOOK**: Single **global webhook URL** for post-purchase event delivery.
* **NFR-SEC**:
  * **API Authentication**: All ACP endpoints must require an **API key** (e.g., `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`), with clear 401/403 responses.
  * **Transport Security**: HTTPS-only in any deployed environment; do not accept plaintext HTTP outside local dev.
  * **Request Validation**: Strict schema validation on ACP payloads; reject unexpected fields where possible.
  * **SQL Safety**: All SQLite tool-calling must be strictly parameter-driven to prevent SQL injection risks.

# Feature 17: UCP Protocol Integration

**Priority**: P1

**Status**: 🟡 In Progress (Phase 1 Complete)

**Dependencies**: Features 3, 4, 5, 6, 7, 8

---

## Overview

Implement the **Universal Commerce Protocol (UCP)** alongside the existing ACP implementation to demonstrate production-grade dual protocol support. UCP is an industry-standard protocol co-developed by major commerce platforms (Shopify, Etsy, Wayfair, Target, Walmart, etc.) for agentic commerce.

This feature adds UCP-compliant endpoints that share the same intelligent agent layer (NAT agents) and backend services with ACP, showcasing how merchants can support multiple protocols simultaneously without duplicating business logic.

> **Note:** UCP integration focuses on the **native merchant backend flow** only. The Apps SDK mode continues to use ACP exclusively.

---

## Phase Progress

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Discovery Endpoint (`GET /.well-known/ucp`) | ✅ Complete |
| **Phase 2** | Checkout Endpoints (REST) | 🔲 Planned |
| **Phase 3** | A2A Transport (JSON-RPC 2.0) | 🔲 Planned |
| **Phase 4** | Capability Negotiation | 🔲 Planned |
| **Phase 5** | Frontend Protocol Toggle | 🔲 Planned |

### Phase 1 Deliverables (Complete)

| File | Description |
|------|-------------|
| `src/merchant/api/routes/ucp/discovery.py` | Discovery endpoint (public, no auth) |
| `src/merchant/api/ucp_schemas.py` | Pydantic schemas for UCP profile |
| `src/merchant/services/ucp.py` | `build_business_profile()` helper |
| `src/merchant/config.py` | 9 new UCP configuration fields |
| `src/merchant/main.py` | Register UCP discovery router |
| `tests/merchant/api/test_ucp_discovery.py` | 11 unit tests |
| `AGENTS.md`, `README.md`, `env.example` | Documentation updates |

- Ruff linting and Pyright type checking passed

---

## User Experience

**The client agent flow remains identical.** The only change is a **protocol toggle** in the Merchant Activity Panel:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MERCHANT ACTIVITY PANEL                           │
│  ┌────────────────┬────────────────┐                                    │
│  │     [ACP]      │     [UCP]      │  ← Protocol Toggle                 │
│  └────────────────┴────────────────┘                                    │
│                                                                          │
│  When ACP selected:                    When UCP selected:                │
│  - POST /checkout_sessions             - POST /checkout-sessions         │
│  - ACP status values                   - UCP status values               │
│  - ACP response format                 - UCP response with A2A/ucp obj   │
│                                                                          │
│  ✓ Same client agent UI                ✓ Same client agent UI           │
│  ✓ Same NAT agents (Promo/Reco/Post)   ✓ Same NAT agents                │
│  ✓ Same PSP payment flow               ✓ Same PSP payment flow          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- **Client Agent flow is unchanged** - same product cards, checkout modal, shipping selection
- **Toggle switches backend protocol** - Merchant Panel tab determines which endpoints are called
- **Merchant Activity Panel visualization** - shows ACP or UCP protocol events based on active tab
- **Agents and payments are shared** - same NAT agents, same PSP vault tokens

---

## Goals

1. Implement UCP v2026-01-11 specification alongside existing ACP v2026-01-16
2. Add UCP discovery endpoint for profile negotiation
3. Create UCP-specific checkout endpoints with hyphenated paths
4. Add A2A transport support for agent-to-agent communication
5. Implement capability negotiation with platform profiles
6. Add UCP tab to Merchant Activity Panel for protocol event visualization
7. Ensure NAT agents serve both protocols through shared business logic layer
8. Support UCP payment handler specifications

---

## Scope

### In Scope
- **Protocol toggle** in Merchant Activity Panel (ACP ↔ UCP tabs)
- UCP discovery endpoint (`GET /.well-known/ucp`)
- UCP checkout session endpoints (hyphenated: `/checkout-sessions`)
- **A2A transport** for agent-to-agent communication (JSON-RPC 2.0)
- Capability negotiation algorithm (intersection, extension pruning)
- UCP-specific status values (`incomplete`, `requires_escalation`, `ready_for_complete`, `complete_in_progress`, `completed`, `canceled`)
- `continue_url` handoff rules for `requires_escalation`
- UCP response metadata (`ucp` object with negotiated capabilities)
- Platform profile fetching and validation
- Payment handler specifications in UCP format
- Merchant Activity Panel UCP tab with A2A protocol visualization
- Shared agent invocation for both protocols
- **Same client agent UI** - no changes to native checkout flow
- **Same NAT agents** - Promotion, Recommendation, Post-Purchase
- **Same PSP payment flow** - vault tokens, payment intents
- Unit tests for all UCP endpoints (pytest)
- Ruff linting and Pyright type checking compliance

### Out of Scope
- UCP Cart capability (future enhancement)
- UCP Order capability (future enhancement)
- UCP Identity Linking (OAuth) capability
- UCP Embedded transport (iframe-based)
- UCP MCP transport (Model Context Protocol for UCP - Apps SDK uses MCP separately)
- AP2 Mandates extension (cryptographic authorization)

---

## Technical Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              PROTOCOL ROUTER LAYER                          │
│                                                              │
│  ┌──────────────────────┐     ┌──────────────────────────┐ │
│  │   ACP Endpoints      │     │   UCP Endpoints          │ │
│  │                      │     │                          │ │
│  │  /checkout_sessions  │     │  /.well-known/ucp        │ │
│  │  (underscore)        │     │  /checkout-sessions      │ │
│  │                      │     │  (hyphen)                │ │
│  │  Header:             │     │  Header:                 │ │
│  │  API-Version         │     │  UCP-Agent: profile="..." │ │
│  └──────────┬───────────┘     └──────────┬───────────────┘ │
│             │                            │                  │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
              └────────────┬───────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│         SHARED BUSINESS LOGIC LAYER                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Checkout Service (Protocol-Agnostic)                │  │
│  │  - Session management                                │  │
│  │  - Cart operations                                   │  │
│  │  - Totals calculation                                │  │
│  │  - Validation                                        │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  NAT Agents (Protocol-Agnostic)                      │  │
│  │  - Promotion Agent (3-layer hybrid)                  │  │
│  │  - Recommendation Agent (ARAG)                       │  │
│  │  - Post-Purchase Agent (multilingual)                │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
└─────────────────┼───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              DATA LAYER (SQLite)                             │
│  - Products                                                  │
│  - Checkout Sessions (protocol field: "acp" | "ucp")        │
│  - Orders                                                    │
└──────────────────────────────────────────────────────────────┘
```

### UCP Endpoints

| Endpoint | Method | Purpose | Headers |
|----------|--------|---------|---------|
| `/.well-known/ucp` | GET | UCP profile discovery | None |
| `/checkout-sessions` | POST | Create UCP checkout | `UCP-Agent: profile="..."`, `Idempotency-Key` |
| `/checkout-sessions/{id}` | GET | Get UCP checkout | `UCP-Agent: profile="..."` |
| `/checkout-sessions/{id}` | PUT | Update UCP checkout | `UCP-Agent: profile="..."`, `Idempotency-Key` |
| `/checkout-sessions/{id}/complete` | POST | Complete UCP checkout | `UCP-Agent: profile="..."`, `Idempotency-Key` |
| `/checkout-sessions/{id}/cancel` | POST | Cancel UCP checkout | `UCP-Agent: profile="..."`, `Idempotency-Key` |

**Header note:** `UCP-Agent` uses RFC 8941 dictionary structured field format. `Idempotency-Key` is required for retry safety on mutating operations.

### Capability Negotiation Flow

```
Platform Request
  ↓
Extract UCP-Agent header: profile="https://platform.example/profile.json"
  ↓
Fetch Platform Profile (HTTP GET)
  ↓
Parse Platform Capabilities
  {
    "ucp": {
      "version": "2026-01-11",
      "capabilities": {
        "dev.ucp.shopping.checkout": [...],
        "dev.ucp.shopping.fulfillment": [...]
      }
    }
  }
  ↓
Load Business Profile (static or cached)
  {
    "ucp": {
      "version": "2026-01-11",
      "capabilities": {
        "dev.ucp.shopping.checkout": [...],
        "dev.ucp.shopping.fulfillment": [...],
        "dev.ucp.shopping.discount": [...]
      }
    }
  }
  ↓
Compute Capability Intersection
  - Include capabilities present in both profiles
  - Remove extensions whose parents aren't in intersection
  - Repeat until stable
  ↓
Result: Negotiated Capabilities
  {
    "dev.ucp.shopping.checkout": [{"version": "2026-01-11"}],
    "dev.ucp.shopping.fulfillment": [{"version": "2026-01-11"}]
  }
  ↓
Store in Session Context
  ↓
Include in Every Response (ucp.capabilities)
  - Only negotiated capabilities relevant to the operation (checkout + extensions)
```

### A2A Transport (Agent-to-Agent)

The A2A transport uses JSON-RPC 2.0 for structured agent communication. UCP operations map to A2A methods.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       A2A TRANSPORT FLOW                                 │
│                                                                          │
│   Client Agent                          Merchant Backend                 │
│        │                                       │                         │
│        │  JSON-RPC 2.0 Request                │                         │
│        │  ──────────────────────────────────▶ │                         │
│        │  {                                    │                         │
│        │    "jsonrpc": "2.0",                 │                         │
│        │    "id": "req_123",                  │                         │
│        │    "method": "a2a.ucp.checkout.create", │                      │
│        │    "params": { ... }                 │                         │
│        │  }                                    │                         │
│        │                                       │                         │
│        │  JSON-RPC 2.0 Response               │                         │
│        │  ◀────────────────────────────────── │                         │
│        │  {                                    │                         │
│        │    "jsonrpc": "2.0",                 │                         │
│        │    "id": "req_123",                  │                         │
│        │    "result": { "ucp": {...}, "status": "ready_for_complete" } │
│        │  }                                    │                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**A2A Method Mapping:**

| REST Endpoint | A2A Method |
|---------------|------------|
| `POST /checkout-sessions` | `a2a.ucp.checkout.create` |
| `GET /checkout-sessions/{id}` | `a2a.ucp.checkout.get` |
| `PUT /checkout-sessions/{id}` | `a2a.ucp.checkout.update` |
| `POST /checkout-sessions/{id}/complete` | `a2a.ucp.checkout.complete` |
| `POST /checkout-sessions/{id}/cancel` | `a2a.ucp.checkout.cancel` |

**A2A Payment Flow:**

```json
{
  "jsonrpc": "2.0",
  "id": "payment_456",
  "method": "a2a.ucp.checkout.complete",
  "params": {
    "id": "checkout_abc123",
    "payment": {
      "handler": "com.example.wallet",
      "token": "tok_xyz789"
    }
  }
}
```

### UCP Response Format

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
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "line_items": [
    {
      "id": "li_1",
      "item": {
        "id": "product_1",
        "title": "Blue T-Shirt",
        "price": 1999
      },
      "quantity": 1,
      "totals": [
        {"type": "subtotal", "label": "Line item subtotal", "amount": 1999}
      ]
    }
  ],
  "totals": [
    {"type": "subtotal", "label": "Subtotal", "amount": 1999},
    {"type": "fulfillment", "label": "Shipping", "amount": 500},
    {"type": "tax", "label": "Tax", "amount": 200},
    {"type": "total", "label": "Total", "amount": 2699}
  ],
  "fulfillment": {
    "methods": [
      {
        "id": "method_1",
        "type": "shipping",
        "line_item_ids": ["li_1"],
        "selected_destination_id": "dest_1",
        "destinations": [
          {
            "id": "dest_1",
            "first_name": "John",
            "last_name": "Doe",
            "street_address": "123 Main St",
            "address_locality": "San Francisco",
            "address_region": "CA",
            "postal_code": "94102",
            "address_country": "US"
          }
        ],
        "groups": [
          {
            "id": "group_1",
            "line_item_ids": ["li_1"],
            "selected_option_id": "standard",
            "options": [
              {
                "id": "standard",
                "title": "Standard Shipping",
                "totals": [{"type": "total", "amount": 500}]
              }
            ]
          }
        ]
      }
    ]
  },
  "payment": {
    "instruments": []
  },
  "messages": [],
  "links": [
    {
      "type": "terms_of_service",
      "url": "https://merchant.example.com/terms"
    }
  ],
  "continue_url": "https://merchant.example.com/checkout-sessions/abc123"
}
```

### Status Mapping

| UCP Status | ACP Equivalent | Description |
|------------|----------------|-------------|
| `incomplete` | `not_ready_for_payment` | Missing required data |
| `requires_escalation` | N/A (new concept) | Buyer input/review required; use `continue_url` |
| `ready_for_complete` | `ready_for_payment` | Ready to place order |
| `complete_in_progress` | `in_progress` | Processing completion |
| `completed` | `completed` | Order placed successfully |
| `canceled` | `canceled` | Session canceled |

---

## Implementation Tasks

### Backend Tasks

1. **Create UCP Router Module** (`src/merchant/api/routes/ucp/`)
   - [x] `discovery.py` - UCP profile endpoint ✅ Phase 1
   - [ ] `checkout.py` - UCP checkout endpoints (REST)
   - [ ] `a2a.py` - A2A transport endpoints (JSON-RPC 2.0)
   - [ ] `negotiation.py` - Capability negotiation logic

2. **Implement A2A Transport** (`src/merchant/api/routes/ucp/a2a.py`)
   - [ ] JSON-RPC 2.0 request parsing
   - [ ] Method routing (`a2a.ucp.checkout.create`, `.get`, `.update`, `.complete`, `.cancel`)
   - [ ] Response formatting (JSON-RPC 2.0)
   - [ ] Error handling with JSON-RPC error codes

3. **Implement UCP Discovery** ✅ Phase 1 Complete
   - [x] Static business profile configuration
   - [x] Capability declarations (checkout, fulfillment, discount)
   - [x] Payment handler specifications
   - [x] Signing keys for webhooks

4. **Implement Capability Negotiation**
   - [ ] Platform profile fetching (HTTP GET)
   - [ ] Profile caching strategy
   - [ ] Intersection algorithm
   - [ ] Extension pruning logic
   - [ ] Version validation

5. **Create UCP Checkout Endpoints (REST)**
   - [ ] POST `/checkout-sessions` (create)
   - [ ] GET `/checkout-sessions/{id}` (get)
   - [ ] PUT `/checkout-sessions/{id}` (update)
   - [ ] POST `/checkout-sessions/{id}/complete` (complete)
   - [ ] POST `/checkout-sessions/{id}/cancel` (cancel)

6. **Add Protocol Abstraction Layer**
   - [ ] Normalize UCP requests to internal format
   - [ ] Transform internal format to UCP responses
   - [ ] Inject negotiated capabilities in responses
   - [ ] Handle UCP-specific status values

7. **Update Database Schema**
   - [ ] Add `protocol` field to checkout_sessions table ("acp" | "ucp")
   - [ ] Add `negotiated_capabilities` JSONB field
   - [ ] Migration script for existing sessions

8. **Payment Handler Integration**
   - [ ] UCP payment handler specifications
   - [ ] Map PSP vault tokens to UCP credential format
   - [ ] Support multiple handler types

### Frontend Tasks

1. **Add Protocol Toggle to Merchant Activity Panel**
   - [ ] Tab switcher component (ACP | UCP)
   - [ ] Toggle determines which backend protocol is used
   - [ ] Protocol state shared with Client Agent via context/API

2. **UCP Event Log Display**
   - [ ] A2A JSON-RPC request/response visualization
   - [ ] Capability negotiation visualization
   - [ ] Payment handler display
   - [ ] UCP-specific status values

3. **Update Protocol Logger**
   - [ ] Detect UCP vs ACP protocol from response
   - [ ] Format UCP-specific metadata (`ucp` object)
   - [ ] Display negotiated capabilities
   - [ ] Show platform profile URL

4. **Client Agent Integration** (No UI changes - same native flow)
   - [ ] Read active protocol from Merchant Panel toggle
   - [ ] Send `UCP-Agent` header when UCP is active
   - [ ] Route requests to UCP or ACP endpoints based on toggle
   - [ ] Handle UCP-specific status values and messages

### Testing Tasks (Mandatory per `.cursor/skills/features/SKILL.md`)

1. **Unit Tests** (`tests/merchant/test_ucp_*.py`)
   - [x] `test_ucp_discovery.py` - Discovery endpoint tests ✅ Phase 1
   - [ ] `test_ucp_checkout.py` - UCP checkout CRUD tests
   - [ ] `test_ucp_a2a.py` - A2A transport tests (JSON-RPC 2.0)
   - [ ] `test_ucp_negotiation.py` - Capability negotiation tests
   - [ ] Happy path, edge cases, failure cases for each

2. **Linting & Type Checking** ✅ Phase 1 Complete
   - [x] `ruff check src/merchant/api/routes/ucp/`
   - [x] `ruff format src/merchant/api/routes/ucp/`
   - [x] `pyright src/merchant/api/routes/ucp/`

3. **Integration Tests**
   - [ ] End-to-end UCP checkout flow
   - [ ] A2A transport with NAT agents
   - [ ] Protocol toggle behavior

---

## Testing Strategy

### Unit Tests

1. **Capability Negotiation Tests**
   - [ ] Test intersection with matching capabilities
   - [ ] Test extension pruning (orphaned extensions)
   - [ ] Test version compatibility validation
   - [ ] Test platform profile fetching errors

2. **UCP Endpoint Tests**
   - [ ] Test create checkout with UCP headers
   - [ ] Test update checkout (PUT method)
   - [ ] Test complete checkout with payment handlers
   - [ ] Test cancel checkout

3. **Protocol Transformation Tests**
   - [ ] Test UCP → internal format normalization
   - [ ] Test internal → UCP format transformation
   - [ ] Test status value mapping
   - [ ] Test error message severity mapping

### Integration Tests

1. **End-to-End UCP Flow**
   - [ ] Create session with platform profile
   - [ ] Verify capability negotiation
   - [ ] Update session with fulfillment
   - [ ] Complete with payment instrument
   - [ ] Verify order created

2. **Agent Integration**
   - [ ] Verify Promotion Agent invoked for UCP sessions
   - [ ] Verify Recommendation Agent invoked for UCP sessions
   - [ ] Verify Post-Purchase Agent triggers for UCP orders

3. **Dual Protocol Support**
   - [ ] Create ACP and UCP sessions simultaneously
   - [ ] Verify agents serve both protocols
   - [ ] Verify separate protocol logs in UI

---

## Acceptance Criteria

### Business Requirements
- [x] UCP discovery endpoint returns valid business profile ✅ Phase 1
- [ ] Platform profile is fetched and validated on each request
- [ ] Capability negotiation correctly computes intersection
- [ ] Orphaned extensions are removed from negotiated capabilities
- [ ] NAT agents are invoked for UCP sessions (same as ACP)
- [x] Payment handler specifications are advertised in profile ✅ Phase 1
- [ ] UCP checkout flow completes successfully (create → update → complete)

### Technical Requirements
- [ ] UCP endpoints use hyphenated paths (`/checkout-sessions`)
- [ ] UCP responses include `ucp` metadata object
- [ ] UCP status values match specification
- [ ] UCP error messages include severity field
- [ ] `continue_url` provided for `requires_escalation` responses
- [ ] Platform profile is cached with appropriate TTL
- [ ] Version compatibility is validated
- [ ] UCP sessions are stored with `protocol: "ucp"` field

### UI Requirements
- [ ] Merchant Activity Panel has UCP tab
- [ ] UCP tab displays capability negotiation results
- [ ] UCP tab shows UCP-formatted JSON events
- [ ] Protocol logger distinguishes UCP from ACP events
- [ ] Agent Activity panel shows agent decisions for both protocols

---

## Dependencies

### Required Features
- **Feature 3**: ACP Core Endpoints (shared business logic)
- **Feature 4**: API Security (authentication, validation)
- **Feature 5**: PSP Payments (payment processing)
- **Feature 6**: Promotion Agent (shared agent)
- **Feature 7**: Recommendation Agent (shared agent)
- **Feature 8**: Post-Purchase Agent (shared agent)

### Required Documentation
- `docs/specs/ucp-spec.md` (UCP specification summary)
- Official UCP documentation at https://ucp.dev

---

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Platform profile fetch failures | High | Implement caching, retry logic, fallback |
| Capability negotiation bugs | High | Extensive unit tests, reference examples |
| Protocol confusion (ACP vs UCP) | Medium | Clear separation in router layer, protocol field in DB |
| Breaking changes in UCP spec | Medium | Version pinning, monitor spec changes |

---

## Success Metrics

- [x] UCP discovery endpoint returns 200 with valid profile ✅ Phase 1
- [ ] All UCP checkout endpoints return 2xx status codes
- [ ] Capability negotiation succeeds in 100% of valid cases
- [ ] NAT agents respond in <10s for UCP sessions (same as ACP)
- [ ] Zero protocol confusion errors in logs
- [ ] UCP tab correctly displays all protocol events
- [ ] Demo successfully shows dual protocol support (ACP + UCP)

---

## References

- **UCP Specification**: https://ucp.dev
- **UCP Spec Summary**: `docs/specs/ucp-spec.md`
- **ACP Spec**: `docs/specs/acp-spec.md`
- **Project PRD**: `docs/PRD.md`
- **Architecture**: `docs/architecture.md`
- **GitHub**: https://github.com/Universal-Commerce-Protocol/ucp

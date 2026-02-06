# Feature 17: UCP Protocol Integration

**Priority**: P1

**Status**: 🟡 In Progress (Phase 4 Complete)

**Dependencies**: Features 3, 4, 5, 6, 7, 8

---

## Overview

Implement the **Universal Commerce Protocol (UCP)** alongside the existing ACP implementation to demonstrate production-grade dual protocol support. UCP is an industry-standard protocol co-developed by major commerce platforms (Shopify, Etsy, Wayfair, Target, Walmart, etc.) for agentic commerce.

This feature adds UCP-compliant endpoints that share the same intelligent agent layer (NAT agents) and backend services with ACP, showcasing how merchants can support multiple protocols simultaneously without duplicating business logic.

> **Transport Decision:** UCP integration uses **A2A (Agent-to-Agent) transport only**. The UCP spec defines multiple transports (REST, A2A, MCP, Embedded); this implementation uses A2A exclusively as it is the natural fit for agent-to-agent communication. The REST transport was removed after Phase 4 to keep the implementation focused.

> **Note:** UCP integration focuses on the **native merchant backend flow** only. The Apps SDK mode continues to use ACP exclusively.

---

## Phase Progress

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Discovery Endpoint (`GET /.well-known/ucp`) | ✅ Complete |
| **Phase 2** | A2A Checkout + Checkout-Only Capability Negotiation | ✅ Complete |
| **Phase 3** | A2A Transport (JSON-RPC 2.0) | ✅ Complete |
| **Phase 4** | Full Capability Negotiation (extension pruning) + REST removal | ✅ Complete |
| **Phase 5** | Frontend Protocol Toggle | 🔲 Planned |
| **Phase 6** | Fulfillment Extension (`dev.ucp.shopping.fulfillment`) | 🔲 Planned |

### Phase 6: Fulfillment Extension (Deferred)

The `dev.ucp.shopping.fulfillment` extension requires modeling:
- **Destinations**: Shipping addresses with UCP schema (`street_address`, `address_locality`, etc.)
- **Fulfillment Groups**: Business-generated packages grouping line items
- **Fulfillment Options**: Selectable shipping options with pricing (`totals[]`)
- **Option Selection**: `selected_destination_id`, `selected_option_id` handling

This is deferred until Phase 6 to keep scope tight and avoid advertising unsupported capability surface.

### Phase 1 Deliverables (Complete)

| File | Description |
|------|-------------|
| `src/merchant/api/routes/ucp/discovery.py` | Discovery endpoint (public, no auth) |
| `src/merchant/api/ucp_schemas.py` | Pydantic schemas for UCP profile |
| `src/merchant/services/ucp.py` | `build_business_profile()` helper |
| `src/merchant/config.py` | UCP configuration fields |
| `src/merchant/main.py` | Register UCP discovery router |
| `tests/merchant/api/test_ucp_discovery.py` | 11 unit tests |
| `AGENTS.md`, `README.md`, `env.example` | Documentation updates |

- Ruff linting and Pyright type checking passed

### Phase 2-3 Deliverables (Complete)

| File | Description |
|------|-------------|
| `src/merchant/api/routes/ucp/a2a.py` | A2A JSON-RPC 2.0 endpoint (`POST /a2a`) |
| `src/merchant/api/routes/ucp/agent_card.py` | Agent Card discovery (`GET /.well-known/agent-card.json`) |
| `src/merchant/api/a2a_schemas.py` | Pydantic schemas for A2A messages and parts |
| `src/merchant/services/a2a.py` | A2A service layer: action routing, context management, idempotency, agent card builder |
| `src/merchant/api/ucp_schemas.py` | Extended with checkout request/response schemas |
| `src/merchant/services/ucp.py` | Capability negotiation, profile caching, transformations |
| `src/merchant/db/models.py` | Added `protocol` field to CheckoutSession |
| `src/merchant/main.py` | Registered A2A and Agent Card routers |
| `tests/merchant/api/test_ucp_a2a.py` | 21 unit tests covering all actions and error cases |

- JSON-RPC 2.0 `message/send` method with structured DataPart actions
- Required header validation (`UCP-Agent`, `X-A2A-Extensions`) with JSON-RPC error codes
- 7 checkout actions: `create_checkout`, `add_to_checkout`, `remove_from_checkout`, `update_checkout`, `get_checkout`, `complete_checkout`, `cancel_checkout`
- contextId-to-session mapping for multi-turn conversations
- messageId-based idempotency via existing `IdempotencyStore`
- Agent Card with map-keyed capabilities per `checkout-a2a.md`
- Real capability negotiation (checkout-only in Phase 2, full in Phase 4)
- In-memory profile caching (10 min TTL)
- Ruff linting and Pyright type checking passed

### Phase 4 Deliverables (Complete)

| File | Description |
|------|-------------|
| `src/merchant/api/ucp_schemas.py` | Multi-parent extends, UCPMessageSeverity + severity field, payment_handlers in UCPResponseMetadata |
| `src/merchant/services/ucp.py` | NegotiationFailureError, full intersection with per-cap version compat, iterative extension pruning, response filtering, severity mapping, payment_handlers param; A2A-only discovery (REST transport removed) |
| `src/merchant/config.py` | Added ucp_continue_url setting; removed ucp_service_path (was REST-only) |
| `src/merchant/services/a2a.py` | negotiate_a2a_capabilities returns tuple, NegotiationFailureError support, payment_handlers through dispatch chain |
| `src/merchant/api/routes/ucp/a2a.py` | NegotiationFailureError -> JSON-RPC result (not error), payment_handlers unpacking |
| `tests/merchant/api/test_ucp_negotiation.py` | 24 unit tests: intersection, pruning, multi-parent, transitive, filtering, version compat, failure paths, severity, payment_handlers |
| `tests/merchant/api/test_ucp_a2a.py` | Updated response shape assertions for payment_handlers, A2A-only discovery |
| `tests/merchant/api/test_ucp_discovery.py` | Updated for A2A-only transport |

- Spec-compliant three-step intersection algorithm (intersection, iterative pruning, response filtering)
- Negotiation failure responses return JSON-RPC result per spec (CAPABILITIES_INCOMPATIBLE, VERSION_UNSUPPORTED)
- Discovery failures remain as JSON-RPC errors
- Per-capability version compatibility checks
- Multi-parent extension support (str | list[str])
- Severity field populated on all error messages
- Payment handlers included in every checkout response
- **REST transport removed** -- UCP uses A2A transport exclusively
- Deleted: `src/merchant/api/routes/ucp/checkout.py`, `tests/merchant/api/test_ucp_checkout.py`
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
│  - POST /checkout_sessions             - POST /a2a (JSON-RPC 2.0)       │
│  - ACP status values                   - UCP status values               │
│  - ACP response format                 - UCP response via A2A DataPart   │
│                                                                          │
│  ✓ Same client agent UI                ✓ Same client agent UI           │
│  ✓ Same NAT agents (Promo/Reco/Post)   ✓ Same NAT agents                │
│  ✓ Same PSP payment flow               ✓ Same PSP payment flow          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- **Client Agent flow is unchanged** - same product cards, checkout modal, shipping selection
- **Toggle switches backend protocol** - Merchant Panel tab determines which endpoints are called
- **UCP uses A2A transport** - all checkout operations go through `POST /a2a` with JSON-RPC 2.0
- **Merchant Activity Panel visualization** - shows ACP or UCP protocol events based on active tab
- **Agents and payments are shared** - same NAT agents, same PSP vault tokens

---

## Goals

1. Implement UCP v2026-01-11 specification alongside existing ACP v2026-01-16
2. Add UCP discovery endpoint for profile negotiation
3. Implement A2A transport for agent-to-agent UCP communication (JSON-RPC 2.0)
4. Implement capability negotiation with platform profiles
5. Add UCP tab to Merchant Activity Panel for protocol event visualization
6. Ensure NAT agents serve both protocols through shared business logic layer
7. Support UCP payment handler specifications

---

## Scope

### In Scope
- **Protocol toggle** in Merchant Activity Panel (ACP ↔ UCP tabs)
- UCP discovery endpoint (`GET /.well-known/ucp`)
- **A2A transport** for agent-to-agent communication (JSON-RPC 2.0) -- sole UCP transport
- Agent Card discovery (`GET /.well-known/agent-card.json`)
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
- UCP REST transport (intentionally excluded -- A2A only)
- UCP Cart capability (future enhancement)
- UCP Order capability (future enhancement)
- UCP Identity Linking (OAuth) capability
- UCP Embedded transport (iframe-based)
- UCP MCP transport (Model Context Protocol for UCP - Apps SDK uses MCP separately)
- AP2 Mandates extension (cryptographic authorization)

### Deferred to Phase 6
- **Fulfillment Extension** (`dev.ucp.shopping.fulfillment`) - Requires modeling destinations, groups, and option selection per UCP spec. Will be negotiated and returned in responses once implemented.

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
│  │  (REST)              │     │  /.well-known/agent-card │ │
│  │                      │     │  /a2a (JSON-RPC 2.0)     │ │
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
| `/.well-known/agent-card.json` | GET | A2A Agent Card discovery | None |
| `/a2a` | POST | A2A JSON-RPC 2.0 (all checkout operations) | `UCP-Agent`, `X-A2A-Extensions` |

### A2A Checkout Actions

| Action | Description |
|--------|-------------|
| `create_checkout` | Create a new checkout session |
| `get_checkout` | Retrieve checkout state |
| `add_to_checkout` | Add items to existing checkout |
| `remove_from_checkout` | Remove items from checkout |
| `update_checkout` | Full replacement update |
| `complete_checkout` | Place the order (with payment DataPart) |
| `cancel_checkout` | Cancel session |

### Capability Negotiation Flow

```
Platform Request (A2A message/send)
  ↓
Extract UCP-Agent header: profile="https://platform.example/profile.json"
  ↓
Fetch Platform Profile (HTTP GET)
  ↓
Parse Platform Capabilities
  ↓
Load Business Profile (static or cached)
  ↓
Compute Capability Intersection
  - Include capabilities present in both profiles
  - Per-capability version check (platform <= business)
  - Remove extensions whose parents aren't in intersection
  - Repeat until stable
  ↓
Result: Negotiated Capabilities
  ↓
Include in Every A2A Response (ucp.capabilities + payment_handlers)
  - Only negotiated capabilities relevant to the operation (checkout + extensions)
```

### A2A Transport (Agent-to-Agent)

The A2A transport uses JSON-RPC 2.0 for structured agent communication. All UCP checkout operations go through `POST /a2a`.

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
│        │    "method": "message/send",         │                         │
│        │    "params": {                       │                         │
│        │      "message": {                    │                         │
│        │        "parts": [{                   │                         │
│        │          "data": { "action": "create_checkout", ... }          │
│        │        }]                            │                         │
│        │      }                               │                         │
│        │    }                                  │                         │
│        │  }                                    │                         │
│        │                                       │                         │
│        │  JSON-RPC 2.0 Response               │                         │
│        │  ◀────────────────────────────────── │                         │
│        │  {                                    │                         │
│        │    "jsonrpc": "2.0",                 │                         │
│        │    "id": "req_123",                  │                         │
│        │    "result": {                       │                         │
│        │      "parts": [{                     │                         │
│        │        "data": { "a2a.ucp.checkout": { ... } }                 │
│        │      }]                              │                         │
│        │    }                                  │                         │
│        │  }                                    │                         │
└─────────────────────────────────────────────────────────────────────────┘
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
   - [x] `a2a.py` - A2A transport endpoints (JSON-RPC 2.0) ✅ Phase 3
   - [x] `agent_card.py` - Agent Card discovery ✅ Phase 3
   - [x] Full capability negotiation in `ucp.py` ✅ Phase 4

2. **Implement A2A Transport** (`src/merchant/api/routes/ucp/a2a.py`) ✅ Phase 3
   - [x] JSON-RPC 2.0 request parsing
   - [x] Method routing (action-based via DataPart)
   - [x] Response formatting (JSON-RPC 2.0)
   - [x] Error handling with JSON-RPC error codes

3. **Implement UCP Discovery** ✅ Phase 1 Complete
   - [x] Static business profile configuration (A2A transport only)
   - [x] Capability declarations (checkout, fulfillment, discount)
   - [x] Payment handler specifications
   - [x] Signing keys for webhooks

4. **Implement Capability Negotiation** ✅ Phase 4
   - [x] Platform profile fetching (HTTP GET)
   - [x] Profile caching strategy
   - [x] Full intersection algorithm with per-capability version checks
   - [x] Iterative extension pruning logic
   - [x] Response capability filtering (checkout-relevant only)

5. **Add Protocol Abstraction Layer**
   - [x] Transform internal format to UCP responses
   - [x] Inject negotiated capabilities in responses
   - [x] Handle UCP-specific status values
   - [x] Include payment_handlers in every response

6. **Update Database Schema**
   - [x] Add `protocol` field to checkout_sessions table ("acp" | "ucp")

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
   - [ ] Route requests to `/a2a` endpoint when UCP is active
   - [ ] Handle UCP-specific status values and messages

### Testing Tasks (Mandatory per `.cursor/skills/features/SKILL.md`)

1. **Unit Tests** (`tests/merchant/test_ucp_*.py`)
   - [x] `test_ucp_discovery.py` - Discovery endpoint tests ✅ Phase 1
   - [x] `test_ucp_a2a.py` - A2A transport tests (JSON-RPC 2.0) ✅ Phase 3
   - [x] `test_ucp_negotiation.py` - Capability negotiation tests ✅ Phase 4
   - [x] Happy path, edge cases, failure cases ✅ Phase 4

2. **Linting & Type Checking** ✅
   - [x] `ruff check src/merchant/api/routes/ucp/`
   - [x] `ruff format src/merchant/api/routes/ucp/`
   - [x] `pyright src/merchant/api/routes/ucp/`

3. **Integration Tests**
   - [ ] End-to-end UCP checkout flow via A2A
   - [ ] A2A transport with NAT agents
   - [ ] Protocol toggle behavior

---

## Testing Strategy

### Unit Tests

1. **Capability Negotiation Tests** ✅ Phase 4
   - [x] Test intersection with matching capabilities
   - [x] Test extension pruning (orphaned extensions)
   - [x] Test multi-parent extensions
   - [x] Test transitive pruning chains
   - [x] Test per-capability version compatibility
   - [x] Test platform profile fetching errors

2. **A2A Endpoint Tests** ✅ Phase 3
   - [x] Test create checkout via A2A
   - [x] Test add/remove/update checkout
   - [x] Test complete checkout with payment DataPart
   - [x] Test cancel checkout

3. **Negotiation Failure Tests** ✅ Phase 4
   - [x] CAPABILITIES_INCOMPATIBLE returns JSON-RPC result (not error)
   - [x] VERSION_UNSUPPORTED returns JSON-RPC result (not error)
   - [x] Discovery failures return JSON-RPC errors

4. **Response Shape Tests** ✅ Phase 4
   - [x] Test error message severity mapping
   - [x] Test payment_handlers in response
   - [x] Test response capability filtering

### Integration Tests

1. **End-to-End UCP Flow**
   - [ ] Create session via A2A with platform profile
   - [ ] Verify capability negotiation
   - [ ] Complete with payment instrument
   - [ ] Verify order created

2. **Agent Integration**
   - [ ] Verify Promotion Agent invoked for UCP sessions
   - [ ] Verify Recommendation Agent invoked for UCP sessions
   - [ ] Verify Post-Purchase Agent triggers for UCP orders

---

## Acceptance Criteria

### Business Requirements
- [x] UCP discovery endpoint returns valid business profile (A2A transport) ✅ Phase 1
- [x] Platform profile is fetched and validated on each request ✅ Phase 4
- [x] Capability negotiation correctly computes intersection ✅ Phase 4
- [x] Orphaned extensions are removed from negotiated capabilities ✅ Phase 4
- [ ] NAT agents are invoked for UCP sessions (same as ACP)
- [x] Payment handler specifications are advertised in profile ✅ Phase 1
- [ ] UCP checkout flow completes successfully via A2A

### Technical Requirements
- [x] A2A endpoint handles all checkout operations via JSON-RPC 2.0
- [x] UCP responses include `ucp` metadata object with capabilities + payment_handlers
- [x] UCP status values match specification
- [x] UCP error messages include severity field
- [x] Platform profile is cached with appropriate TTL
- [x] Per-capability version compatibility is validated
- [x] UCP sessions are stored with `protocol: "ucp"` field

### UI Requirements
- [ ] Merchant Activity Panel has UCP tab
- [ ] UCP tab displays A2A JSON-RPC request/response events
- [ ] UCP tab shows capability negotiation results
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
- [x] Capability negotiation succeeds in 100% of valid cases ✅ Phase 4
- [ ] All A2A checkout actions return correct JSON-RPC responses
- [ ] NAT agents respond in <10s for UCP sessions (same as ACP)
- [ ] Zero protocol confusion errors in logs
- [ ] UCP tab correctly displays all protocol events
- [ ] Demo successfully shows dual protocol support (ACP + UCP via A2A)

---

## References

- **UCP Specification**: https://ucp.dev
- **UCP Spec Summary**: `docs/specs/ucp-spec.md`
- **ACP Spec**: `docs/specs/acp-spec.md`
- **Project PRD**: `docs/PRD.md`
- **Architecture**: `docs/architecture.md`
- **GitHub**: https://github.com/Universal-Commerce-Protocol/ucp

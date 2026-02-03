# Feature Breakdown: Agentic Commerce Blueprint

This document breaks down the project requirements into discrete, implementable features. Each feature is self-contained and can be tackled incrementally.

---

## Feature Overview

| # | Feature | Priority | Dependencies | Status |
|---|---------|----------|--------------|--------|
| 1 | [Project Foundation & Setup](./feature-01-project-foundation.md) | P0 | None | ✅ Complete |
| 2 | [Database Schema & Seed Data](./feature-02-database-schema.md) | P0 | Feature 1 | ✅ Complete |
| 3 | [ACP Core Endpoints (CRUD)](./feature-03-acp-endpoints.md) | P0 | Feature 2 | ✅ Complete |
| 4 | [API Security & Validation](./feature-04-api-security.md) | P0 | Feature 3 | ✅ Complete |
| 5 | [PSP - Delegated Payments](./feature-05-psp-payments.md) | P1 | Feature 2 | ✅ Complete |
| 6 | [Promotion Agent (NAT)](./feature-06-promotion-agent.md) | P1 | Features 3, 4 | ✅ Complete |
| 7 | [Recommendation Agent (NAT)](./feature-07-recommendation-agent.md) | P1 | Features 3, 4 | ✅ Complete |
| 8 | [Post-Purchase Agent (NAT)](./feature-08-post-purchase-agent.md) | P1 | Features 3, 4 | ✅ Complete (webhook deferred to F11) |
| 9 | [Client Agent Simulator (Frontend)](./feature-09-client-simulator.md) | P1 | Feature 3 | ✅ Complete |
| 10 | [Multi-Panel Protocol Inspector UI](./feature-10-protocol-inspector.md) | P2 | Feature 9 | ✅ Complete |
| 11 | [Webhook Integration](./feature-11-webhook-integration.md) | P2 | Feature 8 | ✅ Complete |
| 12 | [Agent Panel Checkout Flow Simulation](./feature-12-checkout-simulation.md) | P1 | Feature 9 | ✅ Complete |
| 13 | [Integration of UI and ACP Server](./feature-13-ui-acp-integration.md) | P1 | Features 3, 5, 9, 12 | ✅ Complete |
| 14 | [Enhanced Checkout (Payment & Shipping)](./feature-14-enhanced-checkout.md) | P1 | Feature 13 | ✅ Complete |
| 15 | [Multi-Language Post-Purchase Messages](./feature-15-multi-language.md) | P2 | Feature 8 | ✅ Complete |
| 16 | [Apps SDK Integration (Merchant Iframe)](./feature-16-apps-sdk.md) | P1 | Features 7, 9, 13 | 🔲 Planned |
| 17 | [UCP Protocol Integration](./feature-17-ucp-integration.md) | P1 | Features 3, 4, 5, 6, 7, 8 | 🔲 Planned |

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

### Phase 6: UCP Protocol Integration (Feature 17)
Add industry-standard UCP alongside existing ACP implementation.

17. **Feature 17**: UCP Protocol Integration
    - **Protocol toggle** in Merchant Activity Panel (ACP ↔ UCP tabs)
    - UCP discovery endpoint (`GET /.well-known/ucp`)
    - UCP checkout endpoints with hyphenated paths (REST)
    - **A2A transport** (JSON-RPC 2.0 for agent-to-agent communication)
    - Capability negotiation with platform profiles
    - UCP-specific status values and error handling
    - Merchant Activity Panel tab for UCP/A2A protocol events
    - Shared NAT agents serving both ACP and UCP
    - Payment handler specifications for UCP
    - **Same client agent flow** - UI unchanged, only backend protocol switches
    - Scope: Discovery + Checkout (REST + A2A); other capabilities/transports out of scope

---

## Non-Functional Requirements (Apply to All Features)

| NFR | Requirement | Target |
|-----|-------------|--------|
| NFR-LAT | Response latency | <10s for typical operations |
| NFR-LAN | Multilingual support | EN, ES, FR |
| NFR-NIM | Inference configuration | NVIDIA API or local Docker |
| NFR-SEC | Transport security | HTTPS-only (except local dev) |
| NFR-SQL | SQL injection prevention | Parameterized queries only |

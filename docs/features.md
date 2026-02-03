# Feature Breakdown

This document has been reorganized into individual feature files for better maintainability.

**Please see the new feature documentation at: [docs/features/](./features/index.md)**

## Protocol Support

This project implements **dual protocol support** to demonstrate production-grade commerce interoperability:

- **ACP (Agentic Commerce Protocol)** - Features 1-16: Project-specific checkout protocol (v2026-01-16)
- **UCP (Universal Commerce Protocol)** - Feature 17: Industry-standard protocol (v2026-01-11)

Both protocols share the same intelligent agent layer (NAT-powered Promotion, Recommendation, and Post-Purchase agents) and backend services, showcasing how merchants can support multiple protocols simultaneously without duplicating business logic.

**Protocol Toggle:** The Merchant Activity Panel provides a tab switcher (ACP | UCP). The client agent flow remains unchanged - only the backend protocol changes based on the toggle.

**UCP scope in this project:** Discovery + Checkout (REST + A2A). The A2A transport uses JSON-RPC 2.0 for agent-to-agent communication. Cart/Order/Identity Linking and MCP/Embedded transports are out of scope for Feature 17.

## Quick Links

| # | Feature | Status |
|---|---------|--------|
| 1 | [Project Foundation & Setup](./features/feature-01-project-foundation.md) | ✅ Complete |
| 2 | [Database Schema & Seed Data](./features/feature-02-database-schema.md) | ✅ Complete |
| 3 | [ACP Core Endpoints (CRUD)](./features/feature-03-acp-endpoints.md) | ✅ Complete |
| 4 | [API Security & Validation](./features/feature-04-api-security.md) | ✅ Complete |
| 5 | [PSP - Delegated Payments](./features/feature-05-psp-payments.md) | ✅ Complete |
| 6 | [Promotion Agent (NAT)](./features/feature-06-promotion-agent.md) | ✅ Complete |
| 7 | [Recommendation Agent (NAT)](./features/feature-07-recommendation-agent.md) | ✅ Complete |
| 8 | [Post-Purchase Agent (NAT)](./features/feature-08-post-purchase-agent.md) | ✅ Complete |
| 9 | [Client Agent Simulator (Frontend)](./features/feature-09-client-simulator.md) | ✅ Complete |
| 10 | [Multi-Panel Protocol Inspector UI](./features/feature-10-protocol-inspector.md) | ✅ Complete |
| 11 | [Webhook Integration](./features/feature-11-webhook-integration.md) | ✅ Complete |
| 12 | [Agent Panel Checkout Flow Simulation](./features/feature-12-checkout-simulation.md) | ✅ Complete |
| 13 | [Integration of UI and ACP Server](./features/feature-13-ui-acp-integration.md) | ✅ Complete |
| 14 | [Enhanced Checkout (Payment & Shipping)](./features/feature-14-enhanced-checkout.md) | ✅ Complete |
| 15 | [Multi-Language Post-Purchase Messages](./features/feature-15-multi-language.md) | ✅ Complete |
| 16 | [Apps SDK Integration (Merchant Iframe)](./features/feature-16-apps-sdk.md) | 🔲 Planned |
| 17 | [UCP Protocol Integration](./features/feature-17-ucp-integration.md) | 🔲 Planned |

For the full overview including implementation phases and non-functional requirements, see the [Feature Overview](./features/index.md).

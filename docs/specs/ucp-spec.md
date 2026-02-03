# Universal Commerce Protocol (UCP) - Specification Summary

**Protocol Version**: `2026-01-11`

**Status**: Production-Ready Open Standard

**Official Documentation**: https://ucp.dev

---

## Executive Summary

The **Universal Commerce Protocol (UCP)** is an open-source standard enabling secure, standardized interoperability between commerce platforms, merchants (businesses), and payment providers. UCP is specifically designed to facilitate **agentic commerce** - enabling AI agents to act autonomously on behalf of users to discover businesses, manage carts, and complete purchases.

### Key Distinction: UCP vs ACP

| Aspect | UCP (Universal Commerce Protocol) | ACP (Agentic Commerce Protocol) |
|--------|-----------------------------------|----------------------------------|
| **Scope** | Industry-wide open standard | Project-specific implementation |
| **Governance** | Co-developed by industry leaders (Shopify, Etsy, Wayfair, Target, Walmart, etc.) | This project's reference implementation |
| **Lifecycle Coverage** | Complete commerce lifecycle (discovery, checkout, order, returns) | Checkout-focused |
| **Capability Model** | Modular capabilities with extensions | Fixed endpoint set |
| **Transport Options** | REST (primary), MCP/A2A/Embedded (optional) | REST only |
| **Version Format** | Date-based (YYYY-MM-DD) with negotiation | Fixed version header |
| **Payment Architecture** | Payment handlers + credential providers | PSP delegation pattern (vault tokens) |
| **Discovery** | `/.well-known/ucp` profile negotiation | Static configuration |

---

## Core Concepts

### 1. Capabilities

A **Capability** is a standalone core feature that a business supports. Capabilities are the fundamental "verbs" of UCP.

| Capability | ID | Description |
|------------|-----|-------------|
| **Checkout** | `dev.ucp.shopping.checkout` | Creation and management of checkout sessions |
| **Cart** | `dev.ucp.shopping.cart` | Pre-purchase basket management |
| **Order** | `dev.ucp.shopping.order` | Post-checkout order lifecycle management |
| **Identity Linking** | `dev.ucp.common.identity_linking` | OAuth 2.0 identity linking between platforms and businesses |

### 2. Extensions

An **Extension** is an optional module that augments a capability. Extensions declare their parent via the `extends` field.

| Extension | Extends | Description |
|-----------|---------|-------------|
| `dev.ucp.shopping.fulfillment` | checkout | Delivery/fulfillment options |
| `dev.ucp.shopping.discount` | checkout, cart | Discount codes and promotions |
| `dev.ucp.shopping.ap2_mandate` | checkout | Cryptographic authorization for autonomous agents |
| `dev.ucp.shopping.buyer_consent` | checkout | Explicit buyer consent tracking (GDPR) |

### 3. Services

A **Service** defines the API surface for a vertical. Services include operations, events, and transport bindings.

**Shopping Service** (`dev.ucp.shopping`):
- Transports: REST, MCP, A2A, Embedded
- Operations: Checkout, Cart, Order management

### 4. Namespace Convention

All capability and service names use reverse-domain format:

```
{reverse-domain}.{service}.{capability}
```

**Examples:**
- `dev.ucp.shopping.checkout` - Official UCP checkout capability
- `com.example.payments.installments` - Vendor-specific installments capability

**Governance:**

| Namespace | Authority |
|-----------|-----------|
| `dev.ucp.*` | UCP governing body |
| `com.{vendor}.*` | Vendor organization |

---

## Discovery and Negotiation

### Business Profile Discovery

Every UCP-compliant business exposes a discovery endpoint:

```
GET /.well-known/ucp
```

#### Example Business Profile

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
          "endpoint": "https://business.example.com/ucp/v1",
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
      ]
    },
    "payment_handlers": {
      "com.example.wallet": [
        {
          "id": "wallet_merchant_123",
          "version": "2026-01-11",
          "spec": "https://example.com/wallet/ucp/2026-01-11/",
          "schema": "https://example.com/wallet/ucp/2026-01-11/schemas/config.json",
          "config": {
            "merchant_id": "01234567890123456789",
            "allowed_payment_methods": [...]
          }
        }
      ]
    }
  },
  "signing_keys": [
    {
      "kid": "business_2025",
      "kty": "EC",
      "crv": "P-256",
      "x": "...",
      "y": "...",
      "alg": "ES256"
    }
  ]
}
```

### Platform Profile Advertisement

Platforms MUST include their profile URI in every request.

**HTTP (REST):**
```http
POST /checkout-sessions HTTP/1.1
UCP-Agent: profile="https://platform.example/profile.json"
Content-Type: application/json
```

**MCP (JSON-RPC):**
```json
{
  "jsonrpc": "2.0",
  "method": "create_checkout",
  "params": {
    "meta": {
      "ucp-agent": {
        "profile": "https://platform.example/profile.json"
      }
    },
    "checkout": { ... }
  }
}
```

### Capability Negotiation Algorithm

1. **Compute intersection:** Include capabilities present in both profiles
2. **Prune orphaned extensions:** Remove extensions whose parents aren't in intersection
3. **Repeat pruning:** Continue until no more capabilities are removed

---

## Checkout Capability

**Capability Name:** `dev.ucp.shopping.checkout`

### Checkout Status Lifecycle

```
┌────────────┐    ┌─────────────────────┐
│ incomplete │<-->│ requires_escalation │
└─────┬──────┘    └──────────┬──────────┘
      │                      │
      v                      │
┌──────────────────┐         │
│ready_for_complete│         │
└────────┬─────────┘         │
         │                   │
         v                   │
┌────────────────────┐       │
│complete_in_progress│       │
└─────────┬──────────┘       │
          │                  │
          v                  v
    ┌─────────────┐    ┌─────────────┐
    │  completed  │    │  canceled   │
    └─────────────┘    └─────────────┘
```

### Status Values

| Status | Description | Platform Action |
|--------|-------------|-----------------|
| `incomplete` | Missing required info | Check `messages`, update checkout |
| `requires_escalation` | Buyer input needed | Hand off via `continue_url` |
| `ready_for_complete` | Ready to place order | Call Complete Checkout |
| `complete_in_progress` | Processing completion | Wait for response |
| `completed` | Order placed | Display confirmation |
| `canceled` | Session invalid | Start new checkout |

### Error Handling

The `messages` array contains errors with a `severity` field:

| Severity | Meaning | Platform Action |
|----------|---------|-----------------|
| `recoverable` | Platform can fix via API | Update checkout to resolve |
| `requires_buyer_input` | Business needs input not available via API | Hand off via `continue_url` |
| `requires_buyer_review` | Buyer must review and authorize | Hand off via `continue_url` |

**Handoff rule:** When `status = requires_escalation`, responses **must** include `continue_url`. For terminal states (`completed`, `canceled`), `continue_url` should be omitted.

---

## Operations

### REST Endpoints

Base URL: Obtained from `/.well-known/ucp` → `services["dev.ucp.shopping"].endpoint`

#### Checkout Operations

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| Create Checkout | `POST` | `/checkout-sessions` | Create new checkout session |
| Get Checkout | `GET` | `/checkout-sessions/{id}` | Retrieve checkout state |
| Update Checkout | `PUT` | `/checkout-sessions/{id}` | Update checkout (full replacement) |
| Complete Checkout | `POST` | `/checkout-sessions/{id}/complete` | Place the order |
| Cancel Checkout | `POST` | `/checkout-sessions/{id}/cancel` | Cancel session |

#### Cart Operations

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| Create Cart | `POST` | `/carts` | Create new cart |
| Get Cart | `GET` | `/carts/{id}` | Retrieve cart state |
| Update Cart | `PUT` | `/carts/{id}` | Update cart |
| Cancel Cart | `POST` | `/carts/{id}/cancel` | Cancel cart |

### Required Headers

| Header | Required | Description |
|--------|----------|-------------|
| `UCP-Agent` | Yes | Platform profile URI (RFC 8941 dictionary structured field) |
| `Idempotency-Key` | Yes (mutating) | UUID for idempotency; server must honor if provided |
| `Authorization` | Optional | OAuth or API key per business policy |
| `Content-Type` | Yes (with body) | `application/json` |

**Note:** `Request-Signature` is used for **business → platform** webhooks (order events) and is not a required header for checkout requests. See the Order capability in the official spec for webhook signing details.

---

## Payment Architecture

### Trust Model

UCP uses a "Trust-by-Design" model that separates **payment credential providers**
(wallets/tokenizers) from **payment service providers** (processors):

1. **Business ↔ PSP:** The business holds API keys and processes payments.
2. **Platform ↔ Credential Provider:** The platform executes the handler to acquire a token.
3. **Platform ↔ Business:** The platform submits the token to complete checkout.

### Payment Flow

1. **Negotiation:** Business advertises payment handlers in profile
2. **Acquisition:** Platform executes handler logic with the credential provider to get a token
3. **Completion:** Platform submits token to business for payment capture

### Payment Handler Example

**Business advertises a digital wallet handler:**

```json
{
  "ucp": {
    "payment_handlers": {
      "com.example.wallet": [{
        "id": "wallet_merchant_123",
        "version": "2026-01-11",
        "spec": "https://example.com/wallet/ucp/2026-01-11/",
        "schema": "https://example.com/wallet/ucp/2026-01-11/schemas/config.json",
        "config": {
          "api_version": 2,
          "merchant_info": {
            "merchant_id": "01234567890123456789",
            "merchant_name": "Example Store"
          },
          "allowed_payment_methods": [{
            "type": "CARD",
            "parameters": {
              "allowed_auth_methods": ["PAN_ONLY"],
              "allowed_card_networks": ["VISA", "MASTERCARD"]
            },
            "tokenization_specification": {
              "type": "PAYMENT_GATEWAY",
              "parameters": {
                "gateway": "example",
                "gatewayMerchantId": "exampleGatewayMerchantId"
              }
            }
          }]
        }
      }]
    }
  }
}
```

**Platform submits payment on complete:**

```json
{
  "payment": {
    "instruments": [{
      "id": "pm_1234567890abc",
      "handler_id": "gpay_merchant_123",
      "type": "card",
      "selected": true,
      "display": {
        "brand": "visa",
        "last_digits": "4242"
      },
      "billing_address": { ... },
      "credential": {
        "type": "PAYMENT_GATEWAY",
        "token": "{\"signature\":\"...\",\"protocolVersion\":\"ECv2\"...}"
      }
    }]
  }
}
```

---

## Transport Protocols

### REST (Primary)

- HTTP/1.1+ with JSON payloads
- Standard HTTP verbs (GET, POST, PUT)
- Standard status codes (200, 201, 400, 401, 404, 422, 424, 500)

### MCP (Model Context Protocol)

- JSON-RPC 2.0 over stdio or HTTP
- Direct tool mapping for LLMs
- Methods: `create_checkout`, `get_checkout`, etc.

### A2A (Agent-to-Agent)

- JSON-RPC 2.0 over HTTP for structured agent communication
- Uses Agent Card for discovery
- UCP operations map to A2A methods

**A2A Method Mapping:**

| UCP Operation | A2A Method |
|---------------|------------|
| Create Checkout | `a2a.ucp.checkout.create` |
| Get Checkout | `a2a.ucp.checkout.get` |
| Update Checkout | `a2a.ucp.checkout.update` |
| Complete Checkout | `a2a.ucp.checkout.complete` |
| Cancel Checkout | `a2a.ucp.checkout.cancel` |

**A2A Request Example:**

```json
{
  "jsonrpc": "2.0",
  "id": "req_123",
  "method": "a2a.ucp.checkout.create",
  "params": {
    "line_items": [
      {"id": "prod_1", "quantity": 2, "price": 2500}
    ],
    "buyer": {
      "email": "user@example.com"
    }
  }
}
```

**A2A Response Example:**

```json
{
  "jsonrpc": "2.0",
  "id": "req_123",
  "result": {
    "ucp": {
      "version": "2026-01-11",
      "capabilities": {
        "dev.ucp.shopping.checkout": [{"version": "2026-01-11"}]
      }
    },
    "id": "checkout_abc123",
    "status": "ready_for_complete",
    "line_items": [...],
    "totals": [...]
  }
}
```

### Embedded

- JavaScript/iframe embedding
- JSON-RPC for UI communication
- Triggered via `continue_url`

---

## Data Models

### Checkout Object

```typescript
interface Checkout {
  // Required fields
  ucp: UCPResponse;           // Protocol metadata
  id: string;                 // Checkout session ID
  line_items: LineItem[];     // Items being purchased
  status: CheckoutStatus;     // Current status
  currency: string;           // ISO 4217 currency code
  totals: Total[];            // Price breakdown
  links: Link[];              // Legal links (TOS, Privacy)

  // Optional fields
  buyer?: Buyer;              // Buyer information
  context?: Context;          // Contextual hints
  payment?: Payment;          // Payment instruments
  messages?: Message[];       // Errors/warnings/info
  expires_at?: string;        // Session expiry (RFC 3339)
  continue_url?: string;      // Handoff URL
  order?: OrderConfirmation;  // Created order details
}

type CheckoutStatus =
  | "incomplete"
  | "requires_escalation"
  | "ready_for_complete"
  | "complete_in_progress"
  | "completed"
  | "canceled";
```

### Line Item Schema

```typescript
interface LineItem {
  id: string;                 // Line item ID
  item: Item;                 // Product details
  quantity: number;           // Quantity (minimum: 1)
  totals: Total[];            // Line item totals
  parent_id?: string;         // Parent for nested items
}

interface Item {
  id: string;                 // Product ID
  title: string;              // Product title
  description?: string;       // Product description
  image_url?: string;         // Product image
  url?: string;               // Product page URL
  price: number;              // Unit price (minor units)
  sku?: string;               // SKU
}
```

### Total Schema

```typescript
interface Total {
  type: TotalType;
  label: string;
  amount: number;             // Minor units (cents)
}

// Representative list. See the official schema for the full enum.
type TotalType =
  | "subtotal"
  | "fulfillment"
  | "discount"
  | "items_discount"
  | "tax"
  | "total";
```

**Note:** All prices are in **cents** (e.g., 1999 = $19.99)

---

## Versioning

### Version Format

UCP uses date-based versioning in the format `YYYY-MM-DD`.

### Version Compatibility

- Versions follow `YYYY-MM-DD` format
- Platform version must be **equal to or older** than business version
- Newer platforms cannot negotiate with older businesses

### Negotiation Rules

1. Platform declares version via profile referenced in request
2. Business validates:
   - If platform version ≤ business version: Business processes the request
   - If platform version > business version: Business returns `version_unsupported` error
3. Business includes the version used for processing in every response

---

## Security Considerations

### For AI Agents (Platforms)

1. **Always use HTTPS** for all API calls
2. **Validate handler configurations** before executing
3. **Clear credentials from memory** after submission
4. **Never store raw payment data**
5. **Handle `continue_url` securely** - verify it's from business
6. **Implement timeout handling** for credential acquisition
7. **Use AP2 extension** for autonomous purchases requiring proof

### For Businesses

1. **Validate `handler_id`** matches advertised handlers
2. **Use separate credentials** for TEST vs PRODUCTION
3. **Implement idempotency** for payment processing
4. **Log events without logging credentials**
5. **Verify request signatures** where applicable (e.g., order webhooks)
6. **Support AP2** for high-value or autonomous transactions

---

## Key Constants

```python
# State keys for session management
ADK_USER_CHECKOUT_ID = "user:checkout_id"           # Current checkout session
ADK_PAYMENT_STATE = "__payment_data__"              # Payment instrument data
ADK_UCP_METADATA_STATE = "__ucp_metadata__"         # Negotiated capabilities

# Protocol identifiers
A2A_UCP_EXTENSION_URL = "https://ucp.dev/specification/reference?v=2026-01-11"
UCP_AGENT_HEADER = "UCP-Agent"

# Response data keys (A2A DataPart attributes)
UCP_CHECKOUT_KEY = "a2a.ucp.checkout"
UCP_PAYMENT_DATA_KEY = "a2a.ucp.checkout.payment"
UCP_RISK_SIGNALS_KEY = "a2a.ucp.checkout.risk_signals"

# Capability extension names
UCP_FULFILLMENT_EXTENSION = "dev.ucp.shopping.fulfillment"
UCP_BUYER_CONSENT_EXTENSION = "dev.ucp.shopping.buyer_consent"
UCP_DISCOUNT_EXTENSION = "dev.ucp.shopping.discount"
```

---

## Integration with This Project

### Dual Protocol Support

This project implements **both ACP and UCP** to demonstrate:

1. **ACP Implementation** - Project-specific checkout protocol (existing)
2. **UCP Implementation** - Industry-standard protocol (new)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MERCHANT BACKEND                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Protocol Router Layer                        │ │
│  │  ┌──────────────────┐     ┌──────────────────┐       │ │
│  │  │  ACP Endpoints   │     │  UCP Endpoints   │       │ │
│  │  │  /checkout_sessions    │  /.well-known/ucp        │ │
│  │  │  (Stripe-style)  │     │  /checkout-sessions      │ │
│  │  └────────┬─────────┘     └────────┬─────────┘       │ │
│  │           │                         │                 │ │
│  └───────────┼─────────────────────────┼─────────────────┘ │
│              │                         │                   │
│              └──────────┬──────────────┘                   │
│                         ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         SHARED BUSINESS LOGIC LAYER                    │ │
│  │  - NAT Promotion Agent (3-layer hybrid)               │ │
│  │  - NAT Recommendation Agent (ARAG)                    │ │
│  │  - NAT Post-Purchase Agent (multilingual)            │ │
│  │  - Checkout Service (protocol-agnostic)              │ │
│  │  - Payment Service (PSP delegation)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                  │
│                         ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         DATA LAYER (SQLite)                            │ │
│  │  - Products, Checkout Sessions, Orders                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### UI Panel Structure

```
┌─────────────────────────────────────────────────────────────┐
│              MERCHANT ACTIVITY PANEL                         │
│  ┌────────────┬────────────┐                               │
│  │  [ACP]     │  [UCP]     │  ← Tab Switcher                │
│  └────────────┴────────────┘                               │
│                                                              │
│  ACP Tab:                                                    │
│  - Displays ACP protocol events                             │
│  - Shows Stripe-style checkout sessions                     │
│  - Status: not_ready_for_payment → ready_for_payment        │
│                                                              │
│  UCP Tab:                                                    │
│  - Displays UCP profile negotiation                         │
│  - Shows capability intersection                            │
│  - Status: incomplete → ready_for_complete                  │
│  - Payment handler advertisements                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Shared Components

Both protocols share:
- **NAT Agents:** Promotion, Recommendation, Post-Purchase agents serve both protocols
- **Database:** Same SQLite schema for products, sessions, orders
- **PSP Service:** Delegated payment handling for both protocols
- **Webhook Integration:** Post-purchase events triggered from both flows

### Key Differences in Implementation

| Aspect | ACP Implementation | UCP Implementation |
|--------|-------------------|-------------------|
| **Discovery** | Static configuration | `/.well-known/ucp` profile |
| **Versioning** | Header: `API-Version: 2026-01-16` | Date-based in profile + negotiation |
| **Sessions** | `POST /checkout_sessions` | `POST /checkout-sessions` (hyphenated) |
| **Status Values** | `not_ready_for_payment`, `ready_for_payment` | `incomplete`, `ready_for_complete` |
| **Payment** | PSP vault tokens (`vt_...`) | Payment handler specifications |
| **Fulfillment** | `fulfillment_details` object | `fulfillment` extension |
| **Headers** | `Authorization: Bearer` | `UCP-Agent: profile="..."` |

---

## References

- **UCP Specification**: https://ucp.dev
- **Checkout Spec**: https://ucp.dev/specification/checkout
- **Schema Definitions**: https://ucp.dev/schemas/
- **GitHub Repository**: https://github.com/Universal-Commerce-Protocol/ucp
- **ACP Specification**: `docs/specs/acp-spec.md`

---

*This document is based on UCP version 2026-01-11. For the latest specification, refer to the official documentation at https://ucp.dev.*

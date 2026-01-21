# Agentic Checkout Protocol - API Specification

**Call Direction**: OpenAI → Merchant (REST) | Merchant → OpenAI (Webhooks)

**API Version**: `2026-01-16`

## Overview

This document defines the REST endpoints and webhook events for the Agentic Checkout Protocol. Merchants implement these endpoints to enable end-to-end checkout flows inside ChatGPT.

ACP Checkout Sessions provide a stateful model for managing the checkout experience where:
- **Merchants remain the system of record** for orders, payments, taxes, and compliance
- **Agents orchestrate checkout** through a standardized REST API
- **Sessions return authoritative cart state** on every response
- **All payments flow through merchant rails** via their existing PSP

### Checkout Flow

1. **Create Session** - `POST /checkout_sessions`
2. **Update Session** - `POST /checkout_sessions/{id}`
3. **Complete Checkout** - `POST /checkout_sessions/{id}/complete`
4. **Cancel Checkout** - `POST /checkout_sessions/{id}/cancel`
5. **Get Session** - `GET /checkout_sessions/{id}`

### Session States

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

| Status | Description |
|--------|-------------|
| `not_ready_for_payment` | Initial state, missing required data (fulfillment address, valid items) |
| `ready_for_payment` | All requirements met, ready to accept payment |
| `authentication_required` | 3D Secure or other authentication is required |
| `in_progress` | Payment is being processed |
| `completed` | Successfully completed with order created |
| `canceled` | Session has been canceled |

---

## Common Request/Response Headers

### Required Request Headers

| Header          | Description                                      | Example                                         |
|:----------------|:-------------------------------------------------|:------------------------------------------------|
| Authorization   | API Key for authentication                       | `Bearer api_key_123`                            |
| API-Version     | API version                                      | `2026-01-16`                                    |
| Content-Type    | Request content type (for requests with body)    | `application/json`                              |

### Recommended Request Headers

| Header          | Description                                      | Example                                         |
|:----------------|:-------------------------------------------------|:------------------------------------------------|
| Accept-Language | Preferred locale for messages/errors             | `en-US`                                         |
| User-Agent      | Client identification                            | `ChatGPT/2.0`                                   |
| Idempotency-Key | Ensures request idempotency                      | `idem_abc123`                                   |
| Request-Id      | Unique request identifier for tracing            | `req_xyz789`                                    |
| Signature       | Request signature (base64url)                    | `ZXltZX...`                                     |
| Timestamp       | Request timestamp (RFC 3339)                     | `2025-09-29T10:30:00Z`                          |

### Response Headers

| Header          | Description                       | Example               |
|:----------------|:----------------------------------|:----------------------|
| Idempotency-Key | Echo of request idempotency key   | `idem_abc123`         |
| Request-Id      | Echo of request correlation ID    | `req_xyz789`          |

---

## REST Endpoints

### 1. Create Checkout Session

**Endpoint**: `POST /checkout_sessions`  
**Response Status**: `201 Created`

#### Input Schema

```json
{
  "items": [                          // Required - non-empty list
    {
      "id": "string",                 // Required - product ID
      "quantity": 1                   // Required - positive integer > 0
    }
  ],
  "buyer": {                          // Optional
    "first_name": "string",           // Required - max 256 chars
    "last_name": "string",            // Required - max 256 chars
    "email": "string",                // Required - max 256 chars (email format)
    "phone_number": "string"          // Optional - E.164 format
  },
  "fulfillment_details": {            // Optional - nested structure (preferred)
    "name": "string",                 // Optional - recipient name
    "phone_number": "string",         // Optional - E.164 format
    "email": "string",                // Optional - email format
    "address": {                      // Required for shipping
      "name": "string",               // Optional - max 256 chars
      "line_one": "string",           // Optional - max 60 chars
      "line_two": "string",           // Optional - max 60 chars
      "city": "string",               // Optional - max 60 chars
      "state": "string",              // Optional - ISO-3166-2 for shipping
      "country": "string",            // Optional - ISO 3166-1 alpha-2
      "postal_code": "string"         // Optional - max 20 chars
    }
  },
  "agent_capabilities": {             // Optional - declares agent's supported features
    "interventions": {
      "supported": [                  // Supported intervention types
        "3ds", "3ds_redirect", "3ds_challenge", "3ds_frictionless",
        "biometric", "otp", "email_verification", "sms_verification", "address_verification"
      ],
      "max_redirects": 1,             // Max redirects agent can handle (default: 0)
      "redirect_context": "in_app",   // "in_app", "external_browser", or "none"
      "max_interaction_depth": 2,     // Maximum nesting level (default: 1)
      "display_context": "webview"    // "native", "webview", "modal", or "redirect"
    },
    "features": {
      "async_completion": true,       // Optional - async completion support
      "session_persistence": true     // Optional - session persistence support
    }
  },
  "affiliate_attribution": {          // Optional - affiliate tracking
    "provider": "impact.com",         // Attribution provider
    "token": "atp_01J8Z3WXYZ9ABC",    // Attribution token
    "publisher_id": "pub_123",        // Publisher identifier
    "touchpoint": "first"             // "first" or "last" touch attribution
  }
}
```

#### Output Schema

```json
{
  "id": "string",                     // Required - checkout session ID
  "status": "not_ready_for_payment|ready_for_payment|authentication_required|in_progress|completed|canceled",  // Required
  "currency": "usd",                  // Required - ISO 4217 lowercase
  "buyer": { },                       // Optional - Buyer object
  "payment_provider": {               // Required
    "provider": "stripe",             // Required - enum (stripe)
    "supported_payment_methods": [    // Required - list of payment method objects
      {
        "type": "card",               // Required - payment method type
        "supported_card_networks": ["visa", "mastercard", "amex", "discover"]  // Required for cards
      }
    ]
  },
  "seller_capabilities": {            // Required - merchant's supported features
    "payment_methods": [              // Required - supported payment methods (detailed)
      {
        "method": "card",
        "brands": ["visa", "mastercard", "amex"],
        "funding_types": ["credit", "debit"]
      },
      "card.network_token",
      "wallet.apple_pay",
      "wallet.google_pay",
      "bnpl.klarna"
    ],
    "interventions": {
      "required": [],                 // Interventions REQUIRED for this session
      "supported": ["3ds", "3ds_challenge", "3ds_frictionless"],  // Interventions seller supports
      "enforcement": "conditional"    // "always", "conditional", or "optional"
    },
    "features": {
      "partial_auth": true,           // Optional
      "saved_payment_methods": true,  // Optional
      "network_tokenization": true    // Optional
    }
  },
  "line_items": [                     // Required
    {
      "id": "string",                 // Required - line item ID
      "item": {
        "id": "string",
        "quantity": 1
      },
      "name": "string",               // Optional - display name
      "description": "string",        // Optional - product description
      "images": ["uri"],              // Optional - product images
      "unit_amount": 300,             // Optional - per-unit price
      "base_amount": 300,             // Required - integer >= 0 (minor units)
      "discount": 0,                  // Required - integer >= 0
      "subtotal": 300,                // Required - equals base_amount - discount
      "tax": 30,                      // Required - integer >= 0
      "total": 330,                   // Required - equals subtotal + tax
      "disclosures": [],              // Optional - product disclaimers
      "custom_attributes": [],        // Optional - extended properties
      "marketplace_seller_details": {} // Optional - seller info
    }
  ],
  "fulfillment_details": {            // Optional - nested structure
    "name": "string",
    "phone_number": "string",
    "email": "string",
    "address": { }
  },
  "fulfillment_options": [            // Required
    {
      "type": "shipping",
      "id": "string",
      "title": "string",
      "subtitle": "string",
      "carrier": "string",            // shipping only
      "earliest_delivery_time": "RFC3339",  // shipping only
      "latest_delivery_time": "RFC3339",    // shipping only
      "subtotal": 100,
      "tax": 0,
      "total": 100
    }
  ],
  "selected_fulfillment_options": [   // Optional - supports multiple selections
    {
      "type": "shipping",
      "shipping": {
        "option_id": "fulfillment_option_123",
        "item_ids": ["item_456", "item_789"]
      }
    },
    {
      "type": "digital",
      "digital": {
        "option_id": "fulfillment_option_456",
        "item_ids": ["item_012"]
      }
    }
  ],
  "totals": [                         // Required
    {
      "type": "items_base_amount|items_discount|subtotal|discount|fulfillment|tax|fee|total",
      "display_text": "string",
      "amount": 0,                    // integer >= 0 (minor units)
      "description": "string"         // Optional (for fees)
    }
  ],
  "messages": [                       // Required
    {
      "type": "info|error",
      "code": "string",               // error only: missing|invalid|out_of_stock|payment_declined|requires_sign_in|requires_3ds
      "param": "$.path",              // JSONPath RFC 9535
      "content_type": "plain|markdown",
      "content": "string"
    }
  ],
  "links": [                          // Required
    {
      "type": "terms_of_use|privacy_policy|return_policy",
      "url": "string"
    }
  ],
  "authentication_metadata": { }      // Present when status is authentication_required
}
```

---

### 2. Update Checkout Session

**Endpoint**: `POST /checkout_sessions/{id}`  
**Response Status**: `200 OK`

#### Input Schema

```json
{
  "buyer": {                          // Optional - Buyer object
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  "items": [                          // Optional - updated items list
    {
      "id": "string",
      "quantity": 1
    }
  ],
  "fulfillment_details": {            // Optional - nested structure
    "address": {
      "name": "string",
      "line_one": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "postal_code": "string"
    }
  },
  "selected_fulfillment_options": [   // Optional - supports multiple selections
    {
      "type": "shipping",
      "shipping": {
        "option_id": "fulfillment_option_123",
        "item_ids": ["item_456"]
      }
    }
  ]
}
```

#### Output Schema

Same as **Create Checkout Session** output (full checkout state with updated values).

---

### 3. Complete Checkout

**Endpoint**: `POST /checkout_sessions/{id}/complete`  
**Response Status**: `200 OK`

Finalizes the checkout with payment data. MUST create an order on success.

#### Input Schema (Standard)

```json
{
  "buyer": {                          // Optional
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string"
  },
  "payment_data": {                   // Required
    "token": "string",                // Required - vault token (vt_...)
    "provider": "stripe",             // Required - enum (stripe)
    "billing_address": {              // Optional - Address object
      "name": "string",
      "line_one": "string",
      "line_two": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "postal_code": "string"
    }
  },
  "affiliate_attribution": {          // Optional - affiliate tracking
    "provider": "impact.com",
    "token": "atp_01J8Z3WXYZ9ABC",
    "touchpoint": "last"
  }
}
```

#### Input Schema (With 3DS Authentication)

```json
{
  "buyer": { },
  "payment_data": {
    "token": "vt_01J8Z3WXYZ9ABC",
    "provider": "stripe"
  },
  "authentication_result": {          // Required if status was authentication_required
    "outcome": "authenticated",       // "authenticated", "denied", "canceled", "processing_error"
    "outcome_details": {              // Required for authenticated outcome
      "three_ds_cryptogram": "AAIBBYNoEQAAAAAAg4PyBhdAEQs=",  // Base64 encoded cryptogram
      "electronic_commerce_indicator": "05",  // ECI value (01, 02, 05, 06, 07)
      "transaction_id": "f38e6948-5388-41a6-bca4-b49723c19437",  // 3DS transaction ID
      "version": "2.2.0"              // 3DS version
    }
  }
}
```

#### Output Schema

Same as **Create Checkout Session** output, plus:

```json
{
  "...": "...",
  "status": "completed|authentication_required|in_progress",
  "authentication_metadata": {        // Present when status is authentication_required
    "channel": {
      "type": "browser",
      "browser": {
        "accept_header": "text/html,application/xhtml+xml",
        "ip_address": "203.0.113.42",
        "javascript_enabled": true,
        "language": "en-US",
        "user_agent": "Mozilla/5.0...",
        "color_depth": 24,
        "screen_height": 1440,
        "screen_width": 900,
        "timezone_offset": -480
      }
    },
    "acquirer_details": {
      "acquirer_bin": "123456",
      "acquirer_country": "US",
      "acquirer_merchant_id": "merchant_789",
      "merchant_name": "Test Merchant"
    },
    "directory_server": "visa",
    "flow_preference": {
      "type": "challenge",
      "challenge": { "type": "preferred" }
    }
  },
  "order": {                          // Present when status is completed
    "id": "string",                   // Required - order ID
    "checkout_session_id": "string",  // Required
    "permalink_url": "string"         // Required - customer-accessible URL
  }
}
```

---

### 4. Cancel Checkout Session

**Endpoint**: `POST /checkout_sessions/{id}/cancel`  
**Response Status**: `200 OK` | `405 Method Not Allowed` (if already completed/canceled)

Cancels a session if not already completed or canceled.

#### Input Schema

```json
{
  "intent_trace": {                   // Optional - cancellation analytics
    "reason_code": "shipping_cost",   // Reason for cancellation
    "trace_summary": "User not willing to pay $10 for shipping.",
    "metadata": {                     // Optional - additional context
      "target_shipping_cost": 0,
      "competitor_reference": "amazon_prime"
    }
  }
}
```

**Common Reason Codes:**
- `shipping_cost` - Shipping too expensive
- `timing_deferred` - User plans to purchase later
- `found_elsewhere` - Found product elsewhere
- `price_too_high` - Total price too high
- `changed_mind` - User changed mind

#### Output Schema

Same as **Create Checkout Session** output (status will be `canceled`).

---

### 5. Get Checkout Session

**Endpoint**: `GET /checkout_sessions/{id}`  
**Response Status**: `200 OK` | `404 Not Found`

#### Input Schema

None (no body)

#### Output Schema

Same as **Create Checkout Session** output.

---

## Capability Negotiation

### Agent Capabilities

Agents declare supported features when creating a session:

```json
{
  "agent_capabilities": {
    "interventions": {
      "supported": [
        "3ds", "3ds_redirect", "3ds_challenge", "3ds_frictionless",
        "biometric", "otp", "email_verification", "sms_verification", "address_verification"
      ],
      "max_redirects": 1,
      "redirect_context": "in_app",
      "max_interaction_depth": 2,
      "display_context": "webview"
    },
    "features": {
      "async_completion": true,
      "session_persistence": true
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `interventions.supported` | array | Intervention types the agent can handle |
| `max_redirects` | integer | Maximum redirects in a flow (default: 0) |
| `redirect_context` | enum | `in_app`, `external_browser`, or `none` |
| `max_interaction_depth` | integer | Maximum nesting level (default: 1) |
| `display_context` | enum | `native`, `webview`, `modal`, or `redirect` |

### Seller Capabilities

Merchants advertise their capabilities in the response:

```json
{
  "seller_capabilities": {
    "payment_methods": [
      {
        "method": "card",
        "brands": ["visa", "mastercard", "amex"],
        "funding_types": ["credit", "debit"]
      },
      "card.network_token",
      "wallet.apple_pay",
      "wallet.google_pay",
      "bnpl.klarna"
    ],
    "interventions": {
      "required": ["3ds"],
      "supported": ["3ds", "3ds_challenge", "3ds_frictionless"],
      "enforcement": "conditional"
    },
    "features": {
      "partial_auth": true,
      "saved_payment_methods": true,
      "network_tokenization": true
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `payment_methods` | array | Supported payment method identifiers |
| `interventions.required` | array | Interventions REQUIRED for this session |
| `interventions.supported` | array | Interventions seller can handle |
| `interventions.enforcement` | enum | `always`, `conditional`, or `optional` |

### Supported Interventions

| Intervention | Description |
|--------------|-------------|
| `3ds` | Generic 3D Secure (version-agnostic) |
| `3ds2` | EMVCo 3DS 2.x protocol |
| `3ds_redirect` | Full-page redirect for 3DS |
| `3ds_challenge` | In-context 3DS challenge frame |
| `3ds_frictionless` | 3DS without user interaction |
| `biometric` | Biometric authentication |
| `otp` | One-Time Password |
| `email_verification` | Email verification |
| `sms_verification` | SMS verification |
| `address_verification` | Address confirmation |

---

## Error Handling

### Error Response Format

**Status**: `4xx` or `5xx`

```json
{
  "type": "invalid_request",          // Required - error type
  "code": "requires_3ds",             // Required - specific error code
  "message": "This checkout session requires issuer authentication.",  // Required - human-readable
  "param": "$.authentication_result"  // Optional - JSONPath to offending field
}
```

### Error Types

| Type | Description |
|------|-------------|
| `invalid_request` | Client error (bad params, validation) |
| `request_not_idempotent` | Same idempotency key, different params |
| `processing_error` | Server-side processing failure |
| `service_unavailable` | Service temporarily down |

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `missing` | 4XX | Required field missing |
| `invalid` | 4XX | Invalid format/value |
| `out_of_stock` | 4XX | Item unavailable |
| `payment_declined` | 4XX | Card authorization failed |
| `requires_sign_in` | 4XX | Customer must authenticate |
| `requires_3ds` | 4XX | 3D Secure required |
| `idempotency_conflict` | 409 | Different params with same key |

### Session-Level Messages

Sessions include a `messages[]` array with validation feedback:

**Info Message:**
```json
{
  "type": "info",
  "content_type": "plain",
  "content": "Free shipping on orders over $50"
}
```

**Error Message:**
```json
{
  "type": "error",
  "code": "out_of_stock",
  "content_type": "plain",
  "content": "Item 'Blue Widget' is no longer available",
  "param": "$.line_items[0]"
}
```

---

## Object Definitions

### Item

| Field    | Type    | Required | Description              | Validation                |
|:---------|:--------|:---------|:-------------------------|:--------------------------|
| id       | string  | Yes      | Product ID               | -                         |
| quantity | integer | Yes      | Quantity to purchase     | Positive integer > 0      |

### Address

| Field        | Type   | Required | Description                    | Validation                |
|:-------------|:-------|:---------|:-------------------------------|:--------------------------|
| name         | string | No       | Recipient name                 | Max 256 chars             |
| line_one     | string | No       | Address line 1                 | Max 60 chars              |
| line_two     | string | No       | Address line 2                 | Max 60 chars              |
| city         | string | No       | City/district/suburb           | Max 60 chars              |
| state        | string | No       | State/province/region          | ISO-3166-2 for shipping   |
| country      | string | No       | Country code                   | ISO-3166-1 alpha-2        |
| postal_code  | string | No       | Postal/ZIP code                | Max 20 chars              |

### FulfillmentDetails

| Field        | Type    | Required | Description                    |
|:-------------|:--------|:---------|:-------------------------------|
| name         | string  | No       | Recipient name                 |
| phone_number | string  | No       | Phone number (E.164 format)    |
| email        | string  | No       | Email address                  |
| address      | Address | No       | Shipping address               |

### SelectedFulfillmentOption

Supports multiple selections for mixed carts (physical + digital items).

| Field    | Type   | Required | Description                    |
|:---------|:-------|:---------|:-------------------------------|
| type     | enum   | Yes      | `shipping` or `digital`        |
| shipping | object | Cond.    | Required when type is shipping |
| digital  | object | Cond.    | Required when type is digital  |

**shipping/digital object:**
| Field     | Type     | Required | Description              |
|:----------|:---------|:---------|:-------------------------|
| option_id | string   | Yes      | Fulfillment option ID    |
| item_ids  | string[] | Yes      | Items for this option    |

### Buyer

| Field        | Type   | Required | Description        | Validation         |
|:-------------|:-------|:---------|:-------------------|:-------------------|
| first_name   | string | Yes      | First name         | Max 256 chars      |
| last_name    | string | Yes      | Last name          | Max 256 chars      |
| email        | string | Yes      | Email address      | Email format       |
| phone_number | string | No       | Phone number       | E.164 format       |

### PaymentProvider

| Field                     | Type         | Required | Description                | Values              |
|:--------------------------|:-------------|:---------|:---------------------------|:--------------------|
| provider                  | string enum  | Yes      | Payment processor          | `stripe`            |
| supported_payment_methods | PaymentMethod[] | Yes   | Accepted payment methods   | Array of PaymentMethod objects |

### PaymentMethod

| Field                    | Type         | Required | Description                | Values                                    |
|:-------------------------|:-------------|:---------|:---------------------------|:------------------------------------------|
| type                     | string enum  | Yes      | Payment method type        | `card`                                    |
| supported_card_networks  | string[] enum| Yes (for card) | Supported card networks | `visa`, `mastercard`, `amex`, `discover` |

### SellerCapabilities

| Field            | Type         | Required | Description                | Values              |
|:-----------------|:-------------|:---------|:---------------------------|:--------------------|
| payment_methods  | array        | Yes      | Supported payment methods  | See below           |
| interventions    | object       | Yes      | Intervention capabilities  | See below           |
| features         | object       | No       | Optional features          | See below           |

#### SellerCapabilities.payment_methods (detailed format)

Can be strings or objects:
- String format: `"card"`, `"card.network_token"`, `"wallet.apple_pay"`, `"bnpl.klarna"`
- Object format with detailed info:

| Field        | Type     | Required | Description                |
|:-------------|:---------|:---------|:---------------------------|
| method       | string   | Yes      | Payment method type        |
| brands       | string[] | No       | Supported card brands      |
| funding_types| string[] | No       | `credit`, `debit`, `prepaid` |

#### SellerCapabilities.interventions

| Field       | Type         | Required | Description                          |
|:------------|:-------------|:---------|:-------------------------------------|
| required    | string[]     | Yes      | Interventions REQUIRED for session   |
| supported   | string[]     | Yes      | Interventions merchant supports      |
| enforcement | string enum  | No       | `always`, `conditional`, or `optional` |

#### SellerCapabilities.features

| Field               | Type    | Required | Description                     |
|:--------------------|:--------|:---------|:--------------------------------|
| partial_auth        | boolean | No       | Partial authorization support   |
| saved_payment_methods| boolean | No      | Saved payment methods support   |
| network_tokenization| boolean | No       | Network tokenization support    |

### AgentCapabilities

| Field         | Type   | Required | Description                |
|:--------------|:-------|:---------|:---------------------------|
| interventions | object | No       | Intervention capabilities  |
| features      | object | No       | Optional features          |

#### AgentCapabilities.interventions

| Field                  | Type         | Required | Description                          |
|:-----------------------|:-------------|:---------|:-------------------------------------|
| supported              | string[]     | No       | Supported intervention types         |
| max_redirects          | integer      | No       | Maximum redirects agent can handle (default: 0) |
| redirect_context       | string enum  | No       | `in_app`, `external_browser`, `none` |
| max_interaction_depth  | integer      | No       | Maximum nesting level (default: 1)   |
| display_context        | string enum  | No       | `native`, `webview`, `modal`, `redirect` |

#### AgentCapabilities.features

| Field               | Type    | Required | Description                     |
|:--------------------|:--------|:---------|:--------------------------------|
| async_completion    | boolean | No       | Async completion support        |
| session_persistence | boolean | No       | Session persistence support     |

### PaymentData

| Field           | Type        | Required | Description                | Values              |
|:----------------|:------------|:---------|:---------------------------|:--------------------|
| token           | string      | Yes      | Vault token (`vt_...`)     | -                   |
| provider        | string enum | Yes      | Payment processor          | `stripe`            |
| billing_address | Address     | No       | Billing address            | -                   |

### AuthenticationResult

| Field           | Type        | Required | Description                |
|:----------------|:------------|:---------|:---------------------------|
| outcome         | string enum | Yes      | Authentication outcome (`authenticated`, `denied`, `canceled`, `processing_error`) |
| outcome_details | object      | Conditional | Required when outcome is `authenticated` |

#### AuthenticationResult.outcome_details

| Field                        | Type   | Required | Description                |
|:-----------------------------|:-------|:---------|:---------------------------|
| three_ds_cryptogram          | string | Yes      | Base64-encoded cryptogram  |
| electronic_commerce_indicator| string | Yes      | ECI value (`01`, `02`, `05`, `06`, `07`) |
| transaction_id               | string | Yes      | 3DS transaction identifier |
| version                      | string | Yes      | 3DS version (e.g., `2.2.0`) |

### AuthenticationMetadata

| Field            | Type   | Required | Description                |
|:-----------------|:-------|:---------|:---------------------------|
| channel          | object | No       | Channel information        |
| acquirer_details | object | No       | Acquirer information       |
| directory_server | string | No       | Directory server (e.g., `visa`) |
| flow_preference  | object | No       | Flow preference settings   |

#### AuthenticationMetadata.channel

| Field   | Type   | Required | Description                |
|:--------|:-------|:---------|:---------------------------|
| type    | string | Yes      | `browser` or `app`         |
| browser | object | No       | Browser details (when type is browser) |

#### AuthenticationMetadata.channel.browser

| Field               | Type    | Required | Description                |
|:--------------------|:--------|:---------|:---------------------------|
| accept_header       | string  | No       | Accept header value        |
| ip_address          | string  | No       | Client IP address          |
| javascript_enabled  | boolean | No       | JavaScript support         |
| language            | string  | No       | Browser language           |
| user_agent          | string  | No       | User agent string          |
| color_depth         | integer | No       | Screen color depth         |
| screen_height       | integer | No       | Screen height in pixels    |
| screen_width        | integer | No       | Screen width in pixels     |
| timezone_offset     | integer | No       | Timezone offset in minutes |

#### AuthenticationMetadata.acquirer_details

| Field               | Type   | Required | Description                |
|:--------------------|:-------|:---------|:---------------------------|
| acquirer_bin        | string | No       | Acquirer BIN               |
| acquirer_country    | string | No       | Acquirer country code      |
| acquirer_merchant_id| string | No       | Acquirer merchant ID       |
| merchant_name       | string | No       | Merchant display name      |

### LineItem

| Field                       | Type     | Required | Description                              | Validation                            |
|:----------------------------|:---------|:---------|:-----------------------------------------|:--------------------------------------|
| id                          | string   | Yes      | Unique line item ID                      | -                                     |
| item                        | Item     | Yes      | Item reference                           | -                                     |
| name                        | string   | No       | Display name                             | -                                     |
| description                 | string   | No       | Product description                      | -                                     |
| images                      | uri[]    | No       | Product images                           | -                                     |
| unit_amount                 | integer  | No       | Per-unit price                           | >= 0                                  |
| base_amount                 | integer  | Yes      | Base price before adjustments            | >= 0                                  |
| discount                    | integer  | Yes      | Discount amount                          | >= 0                                  |
| subtotal                    | integer  | Yes      | Amount after adjustments                 | = base_amount - discount, >= 0        |
| tax                         | integer  | Yes      | Tax amount                               | >= 0                                  |
| total                       | integer  | Yes      | Final amount                             | = subtotal + tax, >= 0                |
| disclosures                 | array    | No       | Product disclaimers                      | -                                     |
| custom_attributes           | array    | No       | Extended properties                      | -                                     |
| marketplace_seller_details  | object   | No       | Seller info (for marketplaces)           | -                                     |

### Total

| Field        | Type        | Required | Description           | Values                                                                              |
|:-------------|:------------|:---------|:----------------------|:------------------------------------------------------------------------------------|
| type         | string enum | Yes      | Total category        | `items_base_amount`, `items_discount`, `subtotal`, `discount`, `fulfillment`, `tax`, `fee`, `total` |
| display_text | string      | Yes      | Customer-facing label | -                                                                                   |
| amount       | integer     | Yes      | Amount in minor units | >= 0                                                                                |
| description  | string      | No       | Optional description (for fees) | -                                                                         |

### FulfillmentOption (shipping)

| Field                  | Type    | Required | Description               | Validation               |
|:-----------------------|:--------|:---------|:--------------------------|:-------------------------|
| type                   | string  | Yes      | Fulfillment type          | `shipping`               |
| id                     | string  | Yes      | Unique option ID          | Unique across options    |
| title                  | string  | Yes      | Display title             | -                        |
| subtitle               | string  | Yes      | Delivery estimate         | -                        |
| carrier                | string  | No       | Carrier name (e.g., USPS) | -                        |
| earliest_delivery_time | string  | No       | Earliest delivery         | RFC 3339 format          |
| latest_delivery_time   | string  | No       | Latest delivery           | RFC 3339 format          |
| subtotal               | integer | Yes      | Shipping cost             | >= 0                     |
| tax                    | integer | Yes      | Shipping tax              | >= 0                     |
| total                  | integer | Yes      | Total shipping cost       | = subtotal + tax         |

### FulfillmentOption (digital)

| Field    | Type    | Required | Description           | Validation            |
|:---------|:--------|:---------|:----------------------|:----------------------|
| type     | string  | Yes      | Fulfillment type      | `digital`             |
| id       | string  | Yes      | Unique option ID      | Unique across options |
| title    | string  | Yes      | Display title         | -                     |
| subtitle | string  | No       | Delivery description  | -                     |
| subtotal | integer | Yes      | Cost                  | >= 0                  |
| tax      | integer | Yes      | Tax                   | >= 0                  |
| total    | integer | Yes      | Total cost            | = subtotal + tax      |

### Message (info)

| Field        | Type        | Required | Description                    | Values              |
|:-------------|:------------|:---------|:-------------------------------|:--------------------|
| type         | string      | Yes      | Message type                   | `info`              |
| param        | string      | Yes      | JSONPath to related component  | RFC 9535 JSONPath   |
| content_type | string enum | Yes      | Content format                 | `plain`, `markdown` |
| content      | string      | Yes      | Message content                | -                   |

### Message (error)

| Field        | Type        | Required | Description                    | Values                                                                   |
|:-------------|:------------|:---------|:-------------------------------|:-------------------------------------------------------------------------|
| type         | string      | Yes      | Message type                   | `error`                                                                  |
| code         | string enum | Yes      | Error code                     | `missing`, `invalid`, `out_of_stock`, `payment_declined`, `requires_sign_in`, `requires_3ds` |
| param        | string      | No       | JSONPath to related component  | RFC 9535 JSONPath                                                        |
| content_type | string enum | Yes      | Content format                 | `plain`, `markdown`                                                      |
| content      | string      | Yes      | Message content                | -                                                                        |

### Link

| Field | Type        | Required | Description    | Values                                                |
|:------|:------------|:---------|:---------------|:------------------------------------------------------|
| type  | string enum | Yes      | Link category  | `terms_of_use`, `privacy_policy`, `return_policy`     |
| url   | string      | Yes      | Link URL       | -                                                     |

### Order

| Field               | Type   | Required | Description                          |
|:--------------------|:-------|:---------|:-------------------------------------|
| id                  | string | Yes      | Unique order ID                      |
| checkout_session_id | string | Yes      | Associated checkout session          |
| permalink_url       | string | Yes      | Customer-accessible order detail URL |

### IntentTrace (Cancellation Analytics)

| Field         | Type   | Required | Description                          |
|:--------------|:-------|:---------|:-------------------------------------|
| reason_code   | string | Yes      | Reason for cancellation              |
| trace_summary | string | No       | Human-readable summary               |
| metadata      | object | No       | Additional context data              |

**Common Reason Codes:**
- `shipping_cost` - Shipping too expensive
- `timing_deferred` - User plans to purchase later
- `found_elsewhere` - Found product elsewhere
- `price_too_high` - Total price too high
- `changed_mind` - User changed mind

### AffiliateAttribution

| Field        | Type   | Required | Description                          |
|:-------------|:-------|:---------|:-------------------------------------|
| provider     | string | Yes      | Attribution provider (e.g., `impact.com`) |
| token        | string | Yes      | Attribution token                    |
| publisher_id | string | No       | Publisher identifier                 |
| touchpoint   | enum   | No       | `first` or `last` touch attribution  |

---

## Webhooks (Merchant → OpenAI)

Merchants send webhook events to OpenAI for order lifecycle updates. Events are signed with HMAC using a key provided by OpenAI.

### Webhook Event Schema

```json
{
  "type": "order_created|order_updated",  // Required
  "data": {                               // Required - EventData
    "type": "order",                      // Required
    "checkout_session_id": "string",      // Required
    "permalink_url": "string",            // Required
    "status": "created|manual_review|confirmed|canceled|shipped|fulfilled",  // Required
    "refunds": [                          // Required
      {
        "type": "store_credit|original_payment",  // Required
        "amount": 0                        // Required - integer >= 0
      }
    ]
  }
}
```

### Webhook Event Types

| Type           | Description                      |
|:---------------|:---------------------------------|
| order_created  | Order was created from checkout  |
| order_updated  | Order status or details changed  |

### Order Status Values

| Status        | Description                        |
|:--------------|:-----------------------------------|
| created       | Order created, pending processing  |
| manual_review | Order requires manual review       |
| confirmed     | Order confirmed and processing     |
| canceled      | Order was canceled                 |
| shipped       | Order has shipped                  |
| fulfilled     | Order fully delivered              |

### Refund Types

| Type             | Description                      |
|:-----------------|:---------------------------------|
| store_credit     | Refund issued as store credit    |
| original_payment | Refund to original payment method |

---

## Quick Reference

```
┌────────────────────────────────────────────────────────────────────────────┐
│ CHECKOUT SESSION ENDPOINTS                                                 │
│ POST   /checkout_sessions                      Create session (201)        │
│ GET    /checkout_sessions/{id}                 Get session (200)           │
│ POST   /checkout_sessions/{id}                 Update session (200)        │
│ POST   /checkout_sessions/{id}/complete        Complete checkout (200)     │
│ POST   /checkout_sessions/{id}/cancel          Cancel session (200)        │
├────────────────────────────────────────────────────────────────────────────┤
│ REQUIRED HEADERS                                                           │
│ Authorization: Bearer {token}                                              │
│ API-Version: 2026-01-16                                                    │
│ Content-Type: application/json                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ SESSION STATES                                                             │
│ not_ready_for_payment → ready_for_payment → completed                      │
│                              ↓                                             │
│                    authentication_required (if 3DS)                        │
│                              ↓                                             │
│                         completed                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ FULFILLMENT TYPES: shipping, digital                                       │
│ PAYMENT PROVIDER: stripe                                                   │
│ CARD NETWORKS: visa, mastercard, amex, discover                            │
│ AMOUNTS: Always in minor units (cents)                                     │
│ CURRENCY: ISO-4217 lowercase (usd, eur, etc.)                              │
└────────────────────────────────────────────────────────────────────────────┘
```

### Checkout Endpoints

| Endpoint                            | Method | Input Required    | Status Code     |
|:------------------------------------|:-------|:------------------|:----------------|
| `/checkout_sessions`                | POST   | items (required)  | 201             |
| `/checkout_sessions/{id}`           | POST   | any updates       | 200             |
| `/checkout_sessions/{id}`           | GET    | none              | 200 / 404       |
| `/checkout_sessions/{id}/complete`  | POST   | payment_data      | 200             |
| `/checkout_sessions/{id}/cancel`    | POST   | none (optional intent_trace) | 200 / 405 |

### Delegate Payment Endpoint (PSP)

| Endpoint                                | Method | Input Required                      | Status Code |
|:----------------------------------------|:-------|:------------------------------------|:------------|
| `/agentic_commerce/delegate_payment`    | POST   | payment_method, allowance, risk_signals | 201     |

### Session Status Values

| Status                    | Description                                    |
|:--------------------------|:-----------------------------------------------|
| `not_ready_for_payment`   | Initial state, missing required data           |
| `ready_for_payment`       | All requirements met, ready for payment        |
| `authentication_required` | 3D Secure or other authentication required     |
| `in_progress`             | Payment is being processed                     |
| `completed`               | Payment processed, order created               |
| `canceled`                | Session was canceled                           |

### Supported Card Networks

`visa`, `mastercard`, `amex`, `discover`

### Amount Handling

All monetary values are in **minor units** (cents, not dollars):
- $20.00 = 2000
- $99.99 = 9999

Currency is ISO-4217 lowercase (e.g., `"usd"`, `"eur"`)

---

## Implementation Checklists

### For Agents

- [ ] Handle all session states (`not_ready_for_payment`, `ready_for_payment`, `authentication_required`, `in_progress`, `completed`, `canceled`)
- [ ] Send `agent_capabilities` declaring supported interventions
- [ ] Check `seller_capabilities` for merchant requirements
- [ ] Validate card network is supported before collecting payment
- [ ] Implement 3DS flow when `authentication_required`
- [ ] Include `authentication_result` when completing 3DS sessions
- [ ] Support `selected_fulfillment_options` array (multiple selections)
- [ ] Use unique `Idempotency-Key` for create and complete requests
- [ ] Handle all error codes and session messages gracefully
- [ ] Process `fulfillment_options` and present choices to user

### For Merchants

- [ ] Implement all five endpoints (create, retrieve, update, complete, cancel)
- [ ] Return authoritative cart state on every response
- [ ] Return accurate `payment_provider` with supported card networks
- [ ] Return `seller_capabilities` with payment methods and interventions
- [ ] Compute and return accurate totals, tax, and fulfillment costs
- [ ] Set session status to `authentication_required` when 3DS needed
- [ ] Include `authentication_metadata` for agent 3DS flows
- [ ] Validate `authentication_result` before completing transaction
- [ ] Create order on successful completion
- [ ] Send `order_create` webhook to agent platform
- [ ] Use `fulfillment_details` nested structure (not flat address)
- [ ] Support `selected_fulfillment_options[]` array
- [ ] Implement idempotency semantics and conflict detection

### Security Requirements

- [ ] Use HTTPS/TLS 1.2+ for all requests
- [ ] Validate `Authorization: Bearer {token}` header
- [ ] Verify `API-Version` header matches supported version
- [ ] Use `Idempotency-Key` for safe retries
- [ ] Validate `Signature` and `Timestamp` headers (recommended)
- [ ] Never expose raw card data in logs or responses
- [ ] Emit flat error objects with `type/code/message/param`

# Agentic Checkout Protocol - API Specification

**Call Direction**: OpenAI → Merchant (REST) | Merchant → OpenAI (Webhooks)

## Overview

This document defines the REST endpoints and webhook events for the Agentic Checkout Protocol. Merchants implement these endpoints to enable end-to-end checkout flows inside ChatGPT.

### Checkout Flow

1. **Create Session** - `POST /checkout_sessions`
2. **Update Session** - `POST /checkout_sessions/{id}`
3. **Complete Checkout** - `POST /checkout_sessions/{id}/complete`
4. **Cancel Checkout** - `POST /checkout_sessions/{id}/cancel`
5. **Get Session** - `GET /checkout_sessions/{id}`

### Session States

```
not_ready_for_payment → ready_for_payment → completed
                     ↘                   ↘
                       →    canceled    ←
```

---

## Common Request/Response Headers

### Request Headers (All Endpoints)

| Header          | Description                                      | Example                                         |
|:----------------|:-------------------------------------------------|:------------------------------------------------|
| Authorization   | API Key for authentication                       | `Bearer api_key_123`                            |
| Accept-Language | Preferred locale for messages/errors             | `en-US`                                         |
| User-Agent      | Client information                               | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | Ensures request idempotency                      | `idempotency_key_123`                           |
| Request-Id      | Unique request identifier for tracing            | `request_id_123`                                |
| Content-Type    | Request content type                             | `application/json`                              |
| Signature       | Base64 encoded signature of request body         | `eyJtZX...`                                     |
| Timestamp       | RFC 3339 formatted timestamp                     | `2025-09-25T10:30:00Z`                          |
| API-Version     | API version                                      | `2025-09-12`                                    |

### Response Headers

| Header          | Description                       | Example               |
|:----------------|:----------------------------------|:----------------------|
| Idempotency-Key | Echoed from request               | `idempotency_key_123` |
| Request-Id      | Echoed from request               | `request_id_123`      |

---

## REST Endpoints

### 1. Create Checkout Session

**Endpoint**: `POST /checkout_sessions`  
**Response Status**: `201 Created`

#### Input Schema

```json
{
  "buyer": {                          // Optional
    "first_name": "string",           // Required - max 256 chars
    "email": "string",                // Required - max 256 chars
    "phone_number": "string"          // Optional - E.164 format
  },
  "items": [                          // Required - non-empty list
    {
      "id": "string",                 // Required - product ID
      "quantity": 1                   // Required - positive integer > 0
    }
  ],
  "fulfillment_address": {            // Optional
    "name": "string",                 // Required - max 256 chars
    "line_one": "string",             // Required - max 60 chars
    "line_two": "string",             // Optional - max 60 chars
    "city": "string",                 // Required - max 60 chars
    "state": "string",                // Required - ISO 3166-1
    "country": "string",              // Required - ISO 3166-1
    "postal_code": "string",          // Required - max 20 chars
    "phone_number": "string"          // Optional - E.164 format
  }
}
```

#### Output Schema

```json
{
  "id": "string",                     // Required - checkout session ID
  "buyer": { },                       // Optional - Buyer object
  "payment_provider": {               // Required
    "provider": "stripe|adyen",       // Required - enum
    "supported_payment_methods": ["card"]  // Required - list of enums
  },
  "status": "not_ready_for_payment|ready_for_payment|completed|canceled",  // Required
  "currency": "usd",                  // Required - ISO 4217 lowercase
  "line_items": [                     // Required
    {
      "id": "string",                 // Required - line item ID
      "item": {
        "id": "string",
        "quantity": 1
      },
      "base_amount": 300,             // Required - integer >= 0
      "discount": 0,                  // Required - integer >= 0
      "subtotal": 300,                // Required - equals base_amount - discount
      "tax": 30,                      // Required - integer >= 0
      "total": 330                    // Required - equals subtotal + tax
    }
  ],
  "fulfillment_address": { },         // Optional - Address object
  "fulfillment_options": [            // Required
    {
      "type": "shipping|digital",
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
  "fulfillment_option_id": "string",  // Optional - selected option
  "totals": [                         // Required
    {
      "type": "items_base_amount|items_discount|subtotal|discount|fulfillment|tax|fee|total",
      "display_text": "string",
      "amount": 0                     // integer >= 0
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
      "type": "terms_of_use|privacy_policy|seller_shop_policies",
      "url": "string"
    }
  ]
}
```

---

### 2. Update Checkout Session

**Endpoint**: `POST /checkout_sessions/{id}`  
**Response Status**: `200 OK`

#### Input Schema

```json
{
  "buyer": { },                       // Optional - Buyer object
  "items": [                          // Optional - updated items list
    {
      "id": "string",
      "quantity": 1
    }
  ],
  "fulfillment_address": { },         // Optional - Address object
  "fulfillment_option_id": "string"   // Optional - selected fulfillment option
}
```

#### Output Schema

Same as **Create Checkout Session** output (full checkout state).

---

### 3. Complete Checkout

**Endpoint**: `POST /checkout_sessions/{id}/complete`  
**Response Status**: `200 OK`

#### Input Schema

```json
{
  "buyer": {                          // Optional
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string"
  },
  "payment_data": {                   // Required
    "token": "string",                // Required - payment token (e.g., spt_123)
    "provider": "stripe|adyen",       // Required - enum
    "billing_address": {              // Optional - Address object
      "name": "string",
      "line_one": "string",
      "line_two": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "postal_code": "string",
      "phone_number": "string"
    }
  }
}
```

#### Output Schema

Same as **Create Checkout Session** output, plus:

```json
{
  "...": "...",
  "order": {                          // Optional - created on success
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

#### Input Schema

None (empty body)

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

## Error Response

**Status**: `4xx` or `5xx`

```json
{
  "type": "invalid_request",          // Required - enum
  "code": "request_not_idempotent",   // Required - enum
  "message": "string",                // Required - human-readable
  "param": "$.field"                  // Optional - JSONPath to offending field
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
| name         | string | Yes      | Recipient name                 | Max 256 chars             |
| line_one     | string | Yes      | Address line 1                 | Max 60 chars              |
| line_two     | string | No       | Address line 2                 | Max 60 chars              |
| city         | string | Yes      | City/district/suburb           | Max 60 chars              |
| state        | string | Yes      | State/province/region          | ISO 3166-1                |
| country      | string | Yes      | Country code                   | ISO 3166-1                |
| postal_code  | string | Yes      | Postal/ZIP code                | Max 20 chars              |
| phone_number | string | No       | Phone number                   | E.164 format              |

### Buyer

| Field        | Type   | Required | Description        | Validation         |
|:-------------|:-------|:---------|:-------------------|:-------------------|
| first_name   | string | Yes      | First name         | Max 256 chars      |
| email        | string | Yes      | Email address      | Max 256 chars      |
| phone_number | string | No       | Phone number       | E.164 format       |

### PaymentProvider

| Field                     | Type         | Required | Description                | Values              |
|:--------------------------|:-------------|:---------|:---------------------------|:--------------------|
| provider                  | string enum  | Yes      | Payment processor          | `stripe`, `adyen`   |
| supported_payment_methods | string[] enum| Yes      | Accepted payment methods   | `card`              |

### PaymentData

| Field           | Type        | Required | Description                | Values              |
|:----------------|:------------|:---------|:---------------------------|:--------------------|
| token           | string      | Yes      | Payment method token       | -                   |
| provider        | string enum | Yes      | Payment processor          | `stripe`, `adyen`   |
| billing_address | Address     | No       | Billing address            | -                   |

### LineItem

| Field       | Type    | Required | Description                              | Validation                            |
|:------------|:--------|:---------|:-----------------------------------------|:--------------------------------------|
| id          | string  | Yes      | Unique line item ID                      | -                                     |
| item        | Item    | Yes      | Item reference                           | -                                     |
| base_amount | integer | Yes      | Base price before adjustments            | >= 0                                  |
| discount    | integer | Yes      | Discount amount                          | >= 0                                  |
| subtotal    | integer | Yes      | Amount after adjustments                 | = base_amount - discount, >= 0        |
| tax         | integer | Yes      | Tax amount                               | >= 0                                  |
| total       | integer | Yes      | Final amount                             | = subtotal + tax, >= 0                |

### Total

| Field        | Type        | Required | Description           | Values                                                                              |
|:-------------|:------------|:---------|:----------------------|:------------------------------------------------------------------------------------|
| type         | string enum | Yes      | Total category        | `items_base_amount`, `items_discount`, `subtotal`, `discount`, `fulfillment`, `tax`, `fee`, `total` |
| display_text | string      | Yes      | Customer-facing label | -                                                                                   |
| amount       | integer     | Yes      | Amount in minor units | >= 0                                                                                |

### FulfillmentOption (shipping)

| Field                  | Type    | Required | Description               | Validation               |
|:-----------------------|:--------|:---------|:--------------------------|:-------------------------|
| type                   | string  | Yes      | Fulfillment type          | `shipping`               |
| id                     | string  | Yes      | Unique option ID          | Unique across options    |
| title                  | string  | Yes      | Display title             | -                        |
| subtitle               | string  | Yes      | Delivery estimate         | -                        |
| carrier_info           | string  | Yes      | Carrier name              | -                        |
| earliest_delivery_time | string  | Yes      | Earliest delivery         | RFC 3339 format          |
| latest_delivery_time   | string  | Yes      | Latest delivery           | RFC 3339 format          |
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
| type  | string enum | Yes      | Link category  | `terms_of_use`, `privacy_policy`, `seller_shop_policies` |
| url   | string      | Yes      | Link URL       | -                                                     |

### Order

| Field               | Type   | Required | Description                          |
|:--------------------|:-------|:---------|:-------------------------------------|
| id                  | string | Yes      | Unique order ID                      |
| checkout_session_id | string | Yes      | Associated checkout session          |
| permalink_url       | string | Yes      | Customer-accessible order detail URL |

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

| Endpoint                            | Method | Input Required    | Status Code     |
|:------------------------------------|:-------|:------------------|:----------------|
| `/checkout_sessions`                | POST   | items (required)  | 201             |
| `/checkout_sessions/{id}`           | POST   | any updates       | 200             |
| `/checkout_sessions/{id}`           | GET    | none              | 200 / 404       |
| `/checkout_sessions/{id}/complete`  | POST   | payment_data      | 200             |
| `/checkout_sessions/{id}/cancel`    | POST   | none              | 200 / 405       |

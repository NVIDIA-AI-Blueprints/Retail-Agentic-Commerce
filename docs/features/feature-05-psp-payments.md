# Feature 5: PSP - Delegated Payments

**Goal**: Implement the Payment Service Provider for delegated vault tokens with proper ACP compliance, including 3D Secure authentication support.

**Key Principle**: Agents never see actual card data. They receive opaque vault tokens (`vt_...`) with explicit usage constraints. Payments stay on merchant rails via Stripe.

## Database Tables

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

## Endpoints

### 5.1 Delegate Payment

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

### 5.2 Create and Process Payment Intent

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

## PaymentMethodCard Schema

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

## Allowance Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Must be `"one_time"` |
| `max_amount` | integer | Yes | Max amount in minor units (e.g., $20 = 2000) |
| `currency` | string | Yes | ISO-4217 lowercase (e.g., `"usd"`) |
| `checkout_session_id` | string | Yes | Associated checkout session |
| `merchant_id` | string | Yes | Merchant identifier (max 256 chars) |
| `expires_at` | string | Yes | RFC 3339 timestamp |

## RiskSignal Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"card_testing"` |
| `score` | integer | No | Risk score (0-100) |
| `action` | enum | Yes | `"blocked"`, `"manual_review"`, or `"authorized"` |

## 3D Secure Authentication

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

## Error Handling

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

## Tasks

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

## Acceptance Criteria

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

[← Back to Feature Overview](./index.md)

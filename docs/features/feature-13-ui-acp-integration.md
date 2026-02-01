# Feature 13: Integration of UI and ACP Server

**Goal**: Connect the frontend checkout flow to the real ACP backend endpoints, enabling end-to-end transactions from product selection through payment completion, including 3D Secure authentication support.

**Key Principle**: The UI acts as the agent, collecting user input and orchestrating API calls. Actual card data is tokenized via the PSP's `delegate_payment` endpoint—the merchant backend only receives opaque vault tokens.

## Overview

This feature replaces the mock data flow in the Agent Panel with actual API calls to the merchant backend and PSP, creating a fully functional checkout experience that follows the ACP payment protocol.

## Checkout Session States

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

**Session Status Values:**

| Status | Description |
|--------|-------------|
| `not_ready_for_payment` | Initial state, missing required data (fulfillment address, valid items) |
| `ready_for_payment` | All requirements met, ready to accept payment |
| `authentication_required` | 3D Secure or other authentication is required |
| `in_progress` | Payment is being processed |
| `completed` | Successfully completed with order created |
| `canceled` | Session has been canceled |

## Integration Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Product Grid   │────▶│  Create Session │────▶│  Update Session │────▶│    Complete     │
│    (Display)    │     │   (Backend)     │     │   (Backend)     │     │   (PSP + ACP)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │                       │
        ▼                       ▼                       ▼                       ▼
   UI displays            POST /checkout_         POST /checkout_         1. UI calls PSP
   products from          sessions               sessions/{id}              delegate_payment
   mock data or           - Send items,          - Update quantity,      2. PSP returns vault
   product API              fulfillment_details    shipping option          token (vt_xxx)
                          - Send agent_          - Session transitions   3. UI calls POST
                            capabilities           to ready_for_payment     /checkout_sessions
                          - Receive session,                                /{id}/complete
                            payment_provider,                            4. IF 3DS required:
                            seller_capabilities                             handle auth flow
                                                                         5. Backend processes
                                                                            payment via Stripe
                                                                         6. Order created
```

## API Interactions

### 13.1 Product Selection → Create Checkout Session

When user clicks a product card:

- **Endpoint**: `POST /checkout_sessions`
- **API Version**: `2026-01-16`
- **Request**:
  ```json
  {
    "items": [
      {
        "id": "prod_1",
        "quantity": 1
      }
    ],
    "fulfillment_details": {
      "name": "John Doe",
      "phone_number": "15551234567",
      "email": "john@example.com",
      "address": {
        "name": "John Doe",
        "line_one": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "US",
        "postal_code": "94102"
      }
    },
    "agent_capabilities": {
      "interventions": {
        "supported": ["3ds", "3ds_redirect", "3ds_challenge"],
        "max_redirects": 1,
        "redirect_context": "in_app",
        "display_context": "webview"
      }
    }
  }
  ```

- **Response**:
  ```json
  {
    "id": "cs_abc123",
    "status": "not_ready_for_payment",
    "currency": "usd",
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
    "totals": [
      { "type": "subtotal", "display_text": "Subtotal", "amount": 2500 },
      { "type": "tax", "display_text": "Tax", "amount": 200 },
      { "type": "fulfillment", "display_text": "Shipping", "amount": 0 },
      { "type": "total", "display_text": "Total", "amount": 2700 }
    ],
    "fulfillment_options": [
      {
        "type": "shipping",
        "id": "ship_standard",
        "title": "Standard Shipping",
        "subtitle": "5-7 business days",
        "carrier": "USPS",
        "earliest_delivery_time": "2026-01-28T00:00:00Z",
        "latest_delivery_time": "2026-01-30T23:59:59Z",
        "subtotal": 500,
        "tax": 0,
        "total": 500
      }
    ],
    "messages": [],
    "links": []
  }
  ```
- **UI Action**: 
  - Store session ID
  - Check `payment_provider.supported_payment_methods` to know which card networks are supported
  - Check `seller_capabilities` to understand 3DS requirements
  - Transition to checkout view

### 13.2 Quantity/Shipping Updates → Update Checkout Session

When user changes quantity or selects shipping option:

- **Endpoint**: `POST /checkout_sessions/{id}`
- **Request** (quantity update):
  ```json
  {
    "items": [
      {
        "id": "prod_1",
        "quantity": 2
      }
    ]
  }
  ```
- **Request** (fulfillment selection using new `selected_fulfillment_options` array):
  ```json
  {
    "selected_fulfillment_options": [
      {
        "type": "shipping",
        "shipping": {
          "option_id": "ship_standard",
          "item_ids": ["prod_1"]
        }
      }
    ]
  }
  ```
- **Response**: Updated checkout session with recalculated totals
  - Status transitions to `ready_for_payment` when all required fields are present
- **UI Action**: 
  - Update displayed totals
  - Enable Pay button when `status: ready_for_payment`

### 13.3 Payment Flow → PSP + Complete Checkout

When user clicks Pay button:

**Step 1: Get Vault Token from PSP**

- **Endpoint**: `POST /agentic_commerce/delegate_payment`
- **API Version**: `2026-01-16`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
  - `API-Version: 2025-09-29`
  - `Idempotency-Key: {unique-key}`
- **Request**:
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
      "max_amount": 3200,
      "currency": "usd",
      "checkout_session_id": "cs_abc123",
      "merchant_id": "merchant_xyz",
      "expires_at": "2026-01-21T12:00:00Z"
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
- **Response**:
  ```json
  {
    "id": "vt_01J8Z3WXYZ9ABC",
    "created": "2026-01-21T11:00:00Z",
    "metadata": {
      "source": "agent_checkout",
      "merchant_id": "merchant_xyz"
    }
  }
  ```

**Step 2: Complete Checkout with Merchant**

- **Endpoint**: `POST /checkout_sessions/{id}/complete`
- **Request**:
  ```json
  {
    "payment_data": {
      "token": "vt_01J8Z3WXYZ9ABC",
      "provider": "stripe",
      "billing_address": {
        "name": "John Doe",
        "line_one": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "US",
        "postal_code": "94102"
      }
    }
  }
  ```

**Response (Success - No 3DS)**:
```json
{
  "id": "cs_abc123",
  "status": "completed",
  "order": {
    "id": "order_xyz789",
    "checkout_session_id": "cs_abc123",
    "permalink_url": "https://merchant.com/orders/xyz789"
  }
}
```

**Response (3DS Required)**:
```json
{
  "id": "cs_abc123",
  "status": "authentication_required",
  "authentication_metadata": {
    "redirect_url": "https://3ds.stripe.com/challenge/abc",
    "acquirer_details": { },
    "directory_server_info": { }
  },
  "messages": [
    {
      "type": "error",
      "code": "requires_3ds",
      "param": "$.authentication_result",
      "content_type": "plain",
      "content": "This checkout session requires issuer authentication"
    }
  ]
}
```

**Step 3: Handle 3DS Authentication (if required)**

If session status is `authentication_required`:

1. UI redirects user to `authentication_metadata.redirect_url` or embeds 3DS challenge iframe
2. User completes 3DS verification with their bank
3. 3DS provider returns authentication result
4. UI calls complete endpoint again with `authentication_result`:

```json
{
  "payment_data": {
    "token": "vt_01J8Z3WXYZ9ABC",
    "provider": "stripe"
  },
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

## Tasks

- [x] Create API client service in UI (`lib/api-client.ts`)
  - [x] Configure base URL and authentication headers
  - [x] Add `API-Version` header support
  - [x] Implement `Idempotency-Key` generation for payment requests
  - [x] Implement error handling and retry logic
  - [x] Add request/response type definitions matching ACP schemas
- [x] Update `useCheckoutFlow` hook to call real APIs
  - [x] Send `agent_capabilities` in session creation
  - [x] Parse `payment_provider` and `seller_capabilities` from response
  - [x] Validate card network against `supported_card_networks` before payment
  - [x] Handle all session states including `authentication_required`
  - [x] Implement session updates on quantity/shipping changes
- [x] Implement PSP integration in UI
  - [x] Create payment form with proper PaymentMethodCard fields
  - [x] Call PSP `delegate_payment` endpoint with full schema
  - [x] Include at least one RiskSignal in request
  - [x] Handle vault token response
- [x] Implement 3D Secure flow
  - [x] Detect `authentication_required` status
  - [x] Redirect user to 3DS challenge URL or embed iframe
  - [x] Capture authentication_result after 3DS completion
  - [x] Call complete endpoint with authentication_result
  - [x] Handle all authentication outcomes (authenticated, denied, canceled, processing_error)
- [x] Update `CheckoutCard` component
  - [x] Pass vault token and provider to complete endpoint
  - [x] Display loading states during API calls
  - [x] Show 3DS challenge UI when required
  - [x] Handle and display API errors gracefully
- [x] Update `ConfirmationCard` component
  - [x] Display real order data from API response
  - [x] Show order ID and `permalink_url` for order tracking
- [x] Add environment configuration
  - [x] Server-side `MERCHANT_API_URL` and `PSP_API_URL` for proxy routes
  - [x] Server-side `MERCHANT_API_KEY` and `PSP_API_KEY` (never exposed to browser)
  - [x] `NEXT_PUBLIC_API_VERSION` for version header
- [x] Implement error handling UI
  - [x] Network error states with retry
  - [x] Validation error display (`missing`, `invalid` codes)
  - [x] Payment failure handling (`payment_declined`)
  - [x] Out of stock handling (`out_of_stock`)
  - [x] 3DS failure handling (`requires_3ds`, `denied`, `canceled`)
- [x] Add loading states and optimistic updates
  - [x] Skeleton loaders during API calls
  - [x] Disable buttons during processing
  - [x] Show processing indicator during payment and 3DS

## State Management

```typescript
type SessionStatus = 
  | 'not_ready_for_payment' 
  | 'ready_for_payment' 
  | 'authentication_required' 
  | 'in_progress'
  | 'completed' 
  | 'canceled';

interface PaymentProvider {
  provider: 'stripe';
  supported_payment_methods: Array<{
    type: 'card';
    supported_card_networks: Array<'visa' | 'mastercard' | 'amex' | 'discover'>;
  }>;
}

interface SellerCapabilities {
  payment_methods: string[];
  interventions: {
    required: string[];
    supported: string[];
  };
}

interface CheckoutSession {
  id: string;
  status: SessionStatus;
  payment_provider: PaymentProvider;
  seller_capabilities: SellerCapabilities;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  };
  fulfillment_options: FulfillmentOption[];
  authentication_metadata?: AuthenticationMetadata;
  order?: Order;
  messages: Message[];
  links: Link[];
}

interface CheckoutState {
  sessionId: string | null;
  session: CheckoutSession | null;
  vaultToken: string | null;
  authenticationResult: AuthenticationResult | null;
  isLoading: boolean;
  is3DSPending: boolean;
  error: string | null;
}

type CheckoutAction =
  | { type: 'CREATE_SESSION_START' }
  | { type: 'CREATE_SESSION_SUCCESS'; payload: CheckoutSession }
  | { type: 'UPDATE_SESSION_START' }
  | { type: 'UPDATE_SESSION_SUCCESS'; payload: CheckoutSession }
  | { type: 'DELEGATE_PAYMENT_SUCCESS'; payload: string }
  | { type: 'COMPLETE_CHECKOUT_START' }
  | { type: 'COMPLETE_CHECKOUT_SUCCESS'; payload: CheckoutSession }
  | { type: 'AUTHENTICATION_REQUIRED'; payload: CheckoutSession }
  | { type: 'AUTHENTICATION_COMPLETE'; payload: AuthenticationResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };
```

## Error Handling

| HTTP | Code | Error Scenario | UI Behavior |
|------|------|---------------|-------------|
| 400 | `missing` | Required field missing | Highlight missing fields, show validation errors |
| 400 | `invalid` | Invalid format/value | Show specific field errors |
| 400 | `out_of_stock` | Item unavailable | Show out of stock message, offer alternatives |
| 401 | - | Unauthorized | Redirect to login or show auth error |
| 404 | - | Session not found | Redirect to product grid, show error toast |
| 405 | - | Invalid state transition | Show error message, refresh session state |
| 409 | `idempotency_conflict` | Duplicate request with different params | Generate new idempotency key, retry |
| 422 | `payment_declined` | Card authorization failed | Show decline message, allow retry |
| 422 | `requires_3ds` | 3D Secure required | Initiate 3DS flow |
| 500 | - | Server error | Show generic error, offer retry |
| 503 | - | Service unavailable | Show maintenance message, auto-retry |

## Acceptance Criteria

- [x] Clicking a product creates a real checkout session via API with `agent_capabilities`
- [x] UI correctly parses `payment_provider` and `seller_capabilities` from response
- [x] Card network is validated against `supported_card_networks` before payment
- [x] Quantity changes update the session and recalculate totals
- [x] Shipping option selection updates session with fulfillment details
- [x] Pay button is disabled until session reaches `ready_for_payment` status
- [x] Payment flow successfully obtains vault token from PSP with proper schema
- [x] At least one `risk_signal` is included in delegate_payment request
- [x] Complete endpoint processes payment and creates order
- [x] 3DS flow is handled when `authentication_required` status is returned
- [x] Authentication result is properly captured and sent to complete endpoint
- [x] All authentication outcomes are handled (success, denied, canceled, error)
- [x] Confirmation displays real order details including `permalink_url`
- [x] Loading states are shown during all API operations
- [x] All ACP error codes are handled with user-friendly messages
- [ ] Session state is preserved on page refresh (via session ID in URL or storage)
- [x] All amounts are displayed in proper format (minor units converted to dollars)

---

[← Back to Feature Overview](./index.md)

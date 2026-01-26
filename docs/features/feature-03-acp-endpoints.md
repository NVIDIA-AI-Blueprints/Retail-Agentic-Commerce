# Feature 3: ACP Core Endpoints (CRUD)

**Goal**: Implement the 5 ACP-compliant checkout session endpoints.

## Endpoints

### 3.1 Create Checkout Session
- **Endpoint**: `POST /checkout_sessions`
- **Status**: `201 Created`
- **Input**: `items[]`, `buyer` (optional), `fulfillment_address` (optional)
- **Output**: Full checkout state with `status: not_ready_for_payment`

### 3.2 Update Checkout Session
- **Endpoint**: `POST /checkout_sessions/{id}`
- **Status**: `200 OK`
- **Input**: Partial updates (items, buyer, address, fulfillment_option_id)
- **Output**: Full checkout state
- **Logic**: Transition to `ready_for_payment` when all required fields present

### 3.3 Complete Checkout
- **Endpoint**: `POST /checkout_sessions/{id}/complete`
- **Status**: `200 OK`
- **Input**: `payment_data` with token and billing address
- **Output**: Full checkout state with `status: completed` and `order` object
- **Logic**: Validate payment token, create order

### 3.4 Cancel Checkout
- **Endpoint**: `POST /checkout_sessions/{id}/cancel`
- **Status**: `200 OK` or `405 Method Not Allowed`
- **Output**: Full checkout state with `status: canceled`

### 3.5 Get Checkout Session
- **Endpoint**: `GET /checkout_sessions/{id}`
- **Status**: `200 OK` or `404 Not Found`
- **Output**: Current checkout state

## Tasks

- [x] Create Pydantic schemas for all request/response models
- [x] Implement checkout session service layer
- [x] Implement all 5 endpoints
- [x] Handle session state transitions:
  ```
  not_ready_for_payment → ready_for_payment → in_progress → completed
                       ↘                   ↘              ↘
                         →      canceled      ←─────────────┘
                                    ↑
                    authentication_required (if 3DS) ─────────┘
  ```
- [x] Calculate line_items totals (base_amount, discount, tax, total)
- [x] Generate fulfillment_options based on address
- [x] Include required `messages[]` and `links[]` in responses

## Acceptance Criteria

- [x] All 5 endpoints return ACP-compliant JSON
- [x] State transitions work correctly
- [x] 404 for non-existent sessions
- [x] 405 for invalid state transitions

---

[← Back to Feature Overview](./index.md)

# Feature 4: API Security & Validation

**Goal**: Secure all ACP endpoints with authentication and strict validation.

## Tasks

- [x] Implement API key authentication middleware
  - Support `Authorization: Bearer <API_KEY>` header
  - Support `X-API-Key: <API_KEY>` header
- [x] Return proper error responses:
  - `401 Unauthorized` for missing API key
  - `403 Forbidden` for invalid API key
- [x] Implement request validation:
  - Strict Pydantic schema validation
  - Reject unexpected fields (`extra = "forbid"`)
- [x] Implement idempotency via `Idempotency-Key` header
- [x] Add request/response logging
- [x] Handle common ACP headers:
  - `Accept-Language`
  - `Request-Id`
  - `API-Version`

## Acceptance Criteria

- Requests without API key return 401
- Invalid API keys return 403
- Malformed requests return 400 with clear error messages
- Idempotent requests return cached responses

---

[← Back to Feature Overview](./index.md)

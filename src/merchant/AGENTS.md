---
description: Scoped fast-start guide for coding agents working in src/merchant.
alwaysApply: false
---

# AGENTS.md

This file is the local guide for `src/merchant/`. Read the root `AGENTS.md` first, then use this for backend protocol work.

## Scope

`src/merchant/` is the core commerce backend:
- ACP checkout REST implementation
- UCP discovery + A2A checkout transport
- Shared checkout domain logic and persistence
- Agent integrations (promotion, post-purchase, metrics/attribution)

## Required Reading (Before Editing)

1. `docs/specs/acp-spec.md`
2. `docs/specs/ucp-spec.md`
3. `docs/features/feature-17-ucp-integration.md`
4. `docs/architecture.md`

If post-purchase/webhook behavior changes:
- `docs/features/feature-11-webhook-integration.md`

## Architecture Contracts (Do Not Break)

1. Keep protocol adapters thin:
   - ACP routes in `protocols/acp/`
   - UCP transport/discovery in `protocols/ucp/`
   - Shared business logic in `domain/checkout/` and `services/`
2. No ACP↔UCP cross-imports inside protocol packages (guarded by architecture test).
3. UCP checkout transport is A2A (`POST /a2a`) with discovery at `/.well-known/ucp`.
4. Preserve protocol status vocabularies:
   - ACP: `not_ready_for_payment`, `ready_for_payment`, `authentication_required`, `in_progress`, `completed`, `canceled`
   - UCP: `incomplete`, `requires_escalation`, `ready_for_complete`, `complete_in_progress`, `completed`, `canceled`
5. API auth/idempotency headers and middleware behavior must stay consistent with spec.

## Quick Map

- App wiring: `src/merchant/main.py`
- Shared API routes: `src/merchant/api/routes/`
- ACP checkout routes/schemas: `src/merchant/protocols/acp/api/routes/`, `src/merchant/protocols/acp/api/schemas/`
- UCP discovery/schemas/services: `src/merchant/protocols/ucp/api/`, `src/merchant/protocols/ucp/services/`
- Shared checkout service: `src/merchant/domain/checkout/service.py`
- DB models: `src/merchant/db/models.py`
- Agent service integrations: `src/merchant/services/`

## Runtime Commands

```bash
# Merchant API
uvicorn src.merchant.main:app --reload --port 8000

# Health
curl http://localhost:8000/health
```

## Verification (Minimum)

Static + tests:

```bash
uv run ruff check src/merchant tests/merchant
uv run ruff format --check src/merchant tests/merchant
uv run pyright src/merchant
uv run pytest tests/merchant -v
```

Targeted protocol tests when relevant:

```bash
uv run pytest tests/merchant/api/test_checkout.py -q
uv run pytest tests/merchant/api/test_ucp_discovery.py tests/merchant/api/test_ucp_a2a.py tests/merchant/api/test_ucp_negotiation.py -q
uv run pytest tests/merchant/architecture/test_protocol_import_boundaries.py -q
```

Runtime evidence for endpoint changes:

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8000/<endpoint> \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '<payload>'
```

## Change Checklist

- Update schemas, route handlers, and transformation logic together.
- Keep docs in sync when contracts or transport behavior change.
- If protocol behavior changes, include both happy-path and failure-path verification evidence.

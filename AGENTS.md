---
description: Fast-start guide for coding agents working in Retail-Agentic-Commerce.
alwaysApply: false
---

# AGENTS.md

This document is the fast-start guide for GPT Codex and other coding agents.

Deep context and diagnostic examples live in `docs/agent-playbook.md`.

## Session Workflow (Mandatory)

Use this sequence for every task:
1. Read this file once.
2. Identify task type and read required specs/docs before coding.
3. Read mandatory skill files in `.cursor/skills/`.
4. Implement minimal, spec-aligned changes.
5. Run required verification and report evidence.

## Documentation-First Development (CRITICAL)

**ALWAYS read and follow documentation BEFORE implementing features, modifying code, or reviewing behavior.**

This project implements ACP/UCP flows with strict architecture contracts. Do not infer behavior from existing code alone.

### Mandatory Documentation Review

| Task Type | Required Reading |
|-----------|------------------|
| ACP endpoints, checkout, delegation, webhooks | `docs/specs/acp-spec.md` |
| UCP flows, discovery, A2A transport | `docs/specs/ucp-spec.md` |
| Apps SDK MCP tools and widget behavior | `docs/specs/apps-sdk-spec.md` |
| NAT agent config/orchestration | `docs/NEMO_AGENT_TOOLKIT_DOCUMENTATION.md` |
| Agent integration details | `src/agents/README.md` |
| System architecture and data flow | `docs/architecture.md` |
| Feature-specific behavior | `docs/features/index.md` and `docs/features/feature-XX-*.md` |
| Docker deployment, common operations | `deploy/docker-deployment.md` |
| Local development, `install.sh`/`stop.sh` | `deploy/local-development.md` |

### Specification Source of Truth

#### ACP Specification (`docs/specs/acp-spec.md`)
Use when working on checkout sessions, payment delegation, and webhook contracts.

Validate:
- Data types: `CheckoutSession`, `PaymentDelegation`, `LineItem`, `ShippingOption`
- Endpoints: `/checkout_sessions`, `/agentic_commerce/delegate_payment`, webhook routes
- Security: API key auth + signature requirements
- Flow ownership: who calls what, and in what order

#### UCP Specification (`docs/specs/ucp-spec.md`)
Use when working on discovery, capability negotiation, UCP status lifecycle, or A2A JSON-RPC.

Validate:
- Statuses: `incomplete`, `requires_escalation`, `ready_for_complete`, `complete_in_progress`, `completed`, `canceled`
- Headers: `UCP-Agent`, `API-Version`, `Idempotency-Key`
- A2A methods: `a2a.ucp.checkout.create|get|update|complete|cancel`
- Discovery contract: `/.well-known/ucp`

Note: Merchant Activity ACP/UCP tabs switch backend protocol behavior. Apps SDK mode remains ACP-only.

#### Apps SDK Specification (`docs/specs/apps-sdk-spec.md`)
Use when working on MCP tool schemas, widget lifecycle, cart/checkout tools, and recommendation/search behavior.

Validate:
- Tool input/output schema contracts
- Widget state and event handling
- Merchant API integration boundaries
- NAT integration behavior

#### NeMo Agent Toolkit Documentation (`docs/NEMO_AGENT_TOOLKIT_DOCUMENTATION.md`)
Use when working on NAT YAML configs, multi-agent orchestration, tool registration, and `nat run`/`nat serve` workflows.

### Documentation-First Checklist

Before coding:
- [ ] Read the relevant spec sections.
- [ ] Identify who should call the endpoint/function.
- [ ] Trace end-to-end data flow.
- [ ] Compare current code to documented architecture.
- [ ] Ask user if spec and code conflict.

### Architecture Verification Order

When debugging:
1. What does documentation say should happen?
2. Does implementation match docs?
3. If not, is documentation outdated or code wrong?
4. Only then investigate environment/configuration issues.

## Security & Privacy Guardrails (Mandatory)

When creating or editing docs (including `AGENTS.md` files):
- Never include absolute local filesystem paths (for example: `/Users/<name>/...`, `/home/<name>/...`, `C:\Users\<name>\...`).
- Never include usernames, home directories, machine-specific temp paths, or other host-identifying data.
- Prefer repo-relative paths only (for example: `src/merchant/main.py`).
- Treat any detected local path exposure as a blocking issue and fix before finishing.

Before finalizing documentation changes, run this check and ensure it returns no matches:

```bash
rg -n -e '/Users/[A-Za-z0-9._-]+/' -e '/home/[A-Za-z0-9._-]+/' -e '\\\\Users\\\\[A-Za-z0-9._-]+\\\\' AGENTS.md src docs
```

## Cursor Skills (Mandatory)

Before changing code, read:
- `.cursor/skills/features/SKILL.md` for Python backend standards
- `.cursor/skills/ui/SKILL.md` for frontend standards
- `.cursor/skills/pre-commit-analysis/SKILL.md` for pre-commit validation

### Setup Skill

Trigger: **"setup"** or **"install"** — launches the full Docker deployment with public NIM endpoints. See `.cursor/skills/setup/SKILL.md`.

## Project Overview

Agentic Commerce Protocol (ACP) reference implementation:
- Backend: Python 3.12+, FastAPI, SQLModel
- Frontend: Next.js 15+, React 19, Tailwind, Kaizen UI

Core docs:
- `docs/features.md` for feature status and acceptance criteria
- `docs/architecture.md` for system design

## Scoped AGENTS (Subfolders)

When working in these components, read the local scoped guide after this root file:
- `src/merchant/AGENTS.md`
- `src/apps_sdk/AGENTS.md`
- `src/agents/AGENTS.md`

## Quick Map (Where to Look First)

Backend:
- API routes (shared): `src/merchant/api/routes/`
- Protocol routes: `src/merchant/protocols/acp/api/routes/`, `src/merchant/protocols/ucp/api/routes/`
- Business logic (shared): `src/merchant/domain/checkout/`, `src/merchant/services/`
- Models: `src/merchant/db/models.py`
- ACP schemas: `src/merchant/protocols/acp/api/schemas/checkout.py`
- UCP discovery: `src/merchant/protocols/ucp/api/routes/discovery.py`
- UCP schemas: `src/merchant/protocols/ucp/api/schemas/`
- UCP services: `src/merchant/protocols/ucp/services/`

Frontend:
- Main layout: `src/ui/app/page.tsx`
- Panels: `src/ui/components/agent/`, `src/ui/components/business/`, `src/ui/components/agent-activity/`
- Checkout flow state machine: `src/ui/hooks/useCheckoutFlow.ts`
- Protocol logs: `src/ui/hooks/useACPLog.tsx`, `src/ui/hooks/useAgentActivityLog.tsx`
- API client: `src/ui/lib/api-client.ts`

Agent configs:
- `src/agents/configs/promotion.yml`
- `src/agents/configs/post-purchase.yml`
- `src/agents/configs/recommendation-ultrafast.yml`
- `src/agents/configs/search.yml`

## Runtime Commands (Canonical)

### Backend services
```bash
# Merchant API (port 8000)
uvicorn src.merchant.main:app --reload

# PSP (port 8001)
uvicorn src.payment.main:app --reload --port 8001

# Apps SDK MCP server (port 2091)
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### Frontend
```bash
# UI (port 3000)
cd src/ui
pnpm install
pnpm run dev
```

### Apps SDK widget
```bash
cd src/apps_sdk/web
pnpm install
pnpm dev  # port 3001
```

### NAT agents
```bash
cd src/agents
uv pip install -e ".[dev]"

# Promotion agent (port 8002)
nat serve --config_file configs/promotion.yml --port 8002

# Post-purchase agent (port 8003)
nat serve --config_file configs/post-purchase.yml --port 8003

# Recommendation agent (port 8004)
nat serve --config_file configs/recommendation-ultrafast.yml --port 8004

# Search agent (port 8005)
nat serve --config_file configs/search.yml --port 8005
```

### Health checks
```bash
# Core services
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:2091/health

# NAT agents (when running locally)
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
```

For full Docker deployment, NAT agents are internal-only by default. Check from the merchant container:

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml exec merchant \
  python -c "import urllib.request as u; print('promotion', u.urlopen('http://promotion-agent:8002/health', timeout=5).status); print('post-purchase', u.urlopen('http://post-purchase-agent:8003/health', timeout=5).status); print('recommendation', u.urlopen('http://recommendation-agent:8004/health', timeout=5).status); print('search', u.urlopen('http://search-agent:8005/health', timeout=5).status)"
```

If an agent health check fails, inspect logs before changing code:

```bash
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs --tail 200 promotion-agent
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs --tail 200 post-purchase-agent
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs --tail 200 recommendation-agent
docker compose -f docker-compose.infra.yml -f docker-compose.yml logs --tail 200 search-agent
```

## Quality Gates (Canonical)

Frontend (`src/ui/`):
```bash
pnpm test:run
pnpm lint
pnpm format:check
pnpm typecheck
```

Backend:
```bash
ruff check src/ tests/
ruff format --check src/ tests/
pyright src/
pytest tests/ -v
```

If changes affect runtime behavior, run relevant integration checks in addition to static checks.

## UI-Backend Integration Notes

Checkout flow:
1. Product selection -> `createCheckoutSession()` -> `POST /checkout_sessions`
2. Shipping selection -> `updateCheckoutSession()` -> `POST /checkout_sessions/{id}`
3. Payment delegation -> `delegatePayment()` -> `POST /agentic_commerce/delegate_payment`
4. Completion -> `completeCheckout()` -> `POST /checkout_sessions/{id}/complete`

Three-panel layout:
- Client Agent Panel: product selection + checkout modal
- Merchant Server Panel: protocol events + session state
- Agent Activity Panel: promotion reasoning and signals

Frontend env (`src/ui/.env.local`):
```env
# Server-side only
MERCHANT_API_URL=http://localhost:8000
MERCHANT_API_KEY=test-api-key
PSP_API_URL=http://localhost:8001
PSP_API_KEY=psp-api-key-12345

# Client-side safe
NEXT_PUBLIC_API_VERSION=2026-01-16
```

## Code Change Verification (CRITICAL)

**Do not claim behavior works without runtime evidence.**

For deeper verification anti-patterns and troubleshooting examples, see `docs/agent-playbook.md`.

### When runtime verification is required
- API/HTTP behavior changed
- Async state flow changed
- Backend-to-frontend data usage changed
- New integration path was added

### Minimum evidence to report
- Commands executed
- HTTP status codes or test outcomes
- Relevant server log evidence (terminal output or container logs)
- Error behavior verification when applicable

### Endpoint test template
```bash
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:PORT/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Verification checklist
- [ ] Real calls executed (not mocked path)
- [ ] Response data is actually consumed by downstream code/UI
- [ ] Loading/pending behavior is correct
- [ ] Error path is handled correctly
- [ ] No stale/fallback data masking failures

## Code Standards

Python:
- Type hints for public and non-trivial APIs
- Ruff lint/format compliance
- Add/update tests with behavior changes

Frontend:
- Strict TypeScript
- ESLint + Prettier compliance
- Use Kaizen UI and Tailwind conventions
- Validate UI changes in browser tools when available

## PR Instructions

Title format:
```text
[component] Brief description of change
```

Examples:
- `[backend] Add API key authentication middleware`
- `[frontend] Create product card component`
- `[docs] Update feature breakdown for Phase 2`

PR description should include:
- Summary (1-3 bullets)
- Test plan
- Related issue/feature (if any)

## Maintenance Rules For This File

- Keep this file concise and non-duplicative.
- Keep one canonical commands section (`Runtime Commands` + `Quality Gates`).
- If runtime commands or architecture change, update this file in the same PR.
- If behavior and docs conflict, resolve with the user before adding workaround guidance.

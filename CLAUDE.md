# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**Agentic Commerce Protocol (ACP)** reference implementation: a retailer-operated checkout system enabling agentic negotiation while maintaining merchant control.

| Component | Stack | Port |
|-----------|-------|------|
| Merchant API | Python 3.12+ / FastAPI / SQLModel | 8000 |
| PSP Service | Python 3.12+ / FastAPI / SQLModel | 8001 |
| Promotion Agent | NVIDIA NeMo Agent Toolkit (NAT) | 8002 |
| Frontend | Next.js 15+ / React 19 / Kaizen UI | 3000 |

**Key Architecture**: Async Parallel Orchestrator where NAT agents perform real-time business logic via tool-calling SQL queries.

## Critical Rules (Read First)

### NEVER Do

1. **Allow agents direct database access** - Always use tool-calling pattern with parameterized queries
2. **Skip idempotency checks** on POST/PUT endpoints - All state-changing endpoints MUST respect `Idempotency-Key` header
3. **Omit ACP response fields** - Every response needs `messages[]` and `links[]` arrays
4. **Violate state transitions** - Always validate current status before transitions
5. **Reuse vault tokens** - PSP vault tokens are single-use; always check status before processing
6. **Skip tests** - Every feature requires comprehensive test coverage
7. **Leave type errors** - Pyright runs in strict mode; all hints must resolve cleanly
8. **Add TODOs without issue references**
9. **Commit without running quality checks**

### ACP Checkout State Machine

```
not_ready_for_payment → ready_for_payment → completed
                     ↘                   ↘
                       →    canceled    ←
```

Transitions enforced in `src/merchant/services/checkout.py`.

## Quick Reference Commands

### Backend (Python)

```bash
# Start servers
uvicorn src.merchant.main:app --reload              # Merchant API @ :8000
uvicorn src.payment.main:app --reload --port 8001   # PSP @ :8001

# Quality checks (run before every commit)
ruff check src/ tests/ --fix && ruff format src/ tests/
pyright src/
pytest tests/ -v

# Testing
pytest tests/ -v                                    # All tests
pytest tests/merchant/ -v                           # Merchant only
pytest tests/payment/ -v                            # PSP only
pytest tests/ -v -k "test_create_checkout"          # Pattern match
pytest tests/ --cov=src                             # With coverage
```

### Frontend (Next.js)

```bash
cd src/ui
pnpm install                    # Install dependencies
pnpm run dev                    # Dev server @ :3000

# Quality checks
pnpm lint && pnpm format        # Lint + format
pnpm typecheck                  # TypeScript check
pnpm test:run                   # Run tests once (CI mode)
pnpm test:coverage              # With coverage
```

### Dependencies

```bash
uv sync --extra dev             # Python (recommended)
pip install -e ".[dev]"         # Alternative
```

## Module Organization

```
src/merchant/                   # Merchant API (port 8000)
├── main.py                     # FastAPI entry + lifespan
├── config.py                   # pydantic-settings config
├── api/
│   ├── routes/                 # Endpoints (health, checkout)
│   ├── schemas.py              # Pydantic request/response models
│   └── dependencies.py         # FastAPI DI
├── db/
│   ├── models.py               # SQLModel: Product, CheckoutSession, CompetitorPrice
│   └── database.py             # Init + seeding
├── services/
│   ├── checkout.py             # Session management (async, calls promotion)
│   ├── promotion.py            # 3-layer promotion logic
│   └── idempotency.py          # Idempotency handling
└── middleware/                 # Logging, headers

src/payment/                    # PSP Service (port 8001)
├── api/routes/payments.py      # delegate_payment, create_and_process_payment_intent
├── db/models.py                # VaultToken, PaymentIntent, IdempotencyRecord
└── services/
    ├── vault_token.py          # create_vault_token
    └── payment_intent.py       # create_and_process_payment_intent

src/ui/                         # Next.js Frontend (port 3000)
├── app/                        # App router pages
├── components/agent/           # Agent panel components
└── hooks/
    ├── useACPLog.tsx           # ACP protocol event tracking
    ├── useAgentActivityLog.tsx # Agent decision tracking
    └── useCheckoutFlow.ts      # Checkout state machine
```

## Key Patterns

### 1. Promotion Agent (3-Layer Hybrid)

```
Layer 1 (Deterministic): Query data → compute signals → filter allowed_actions
Layer 2 (LLM): Select action from allowed_actions (classification only)
Layer 3 (Deterministic): Apply discount → validate margin → fail closed if invalid
```

Files: `src/merchant/services/promotion.py`, `src/agents/promotion-agent/`

Fail-open: If agent unavailable, checkout proceeds with NO_PROMO.

### 2. Middleware Chain Order (Critical)

```python
# main.py - applied in this order:
1. CORSMiddleware
2. ACPHeadersMiddleware (Request-Id, Idempotency-Key)
3. RequestLoggingMiddleware
```

### 3. PSP Vault Token Flow

1. Agent calls `delegate_payment` → PSP creates vault token with constraints
2. Agent receives opaque token (never sees card data)
3. Agent calls `create_and_process_payment_intent` with vault token
4. PSP validates: active, not expired, amount/currency within allowance
5. Payment processed, token marked `consumed` (single-use)

### 4. Three-Panel Protocol Inspector UI

```
┌─────────────────┬─────────────────┬─────────────────┐
│  Client Agent   │ Merchant Server │ Agent Activity  │
│  (Blue badge)   │ (Yellow badge)  │ (Green badge)   │
├─────────────────┼─────────────────┼─────────────────┤
│  Chat UI        │ ACP events      │ Promotion       │
│  Products       │ Session state   │ decisions       │
│  Checkout       │ Protocol log    │ Input signals   │
└─────────────────┴─────────────────┴─────────────────┘
```

Hooks: `useACPLog`, `useAgentActivityLog`, `useCheckoutFlow`

Performance: Context memoized with `useMemo`, loggers use `useRef`.

## API Endpoints

### Merchant API (port 8000)

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/checkout_sessions` | POST | 201 | Create session, triggers agents |
| `/checkout_sessions/{id}` | GET | 200 | Retrieve state |
| `/checkout_sessions/{id}` | POST | 200 | Update session |
| `/checkout_sessions/{id}/complete` | POST | 200 | Process payment |
| `/checkout_sessions/{id}/cancel` | POST | 200 | Cancel session |

### PSP API (port 8001)

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/agentic_commerce/delegate_payment` | POST | 201 | Create vault token |
| `/agentic_commerce/create_and_process_payment_intent` | POST | 200 | Process payment |

**Auth**: `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`

## Database Models

**Product**: `id`, `sku`, `name`, `base_price` (cents), `stock_count`, `min_margin`, `image_url`

**CompetitorPrice**: `product_id` (FK), `retailer_name`, `price` (cents), `updated_at`

**CheckoutSession**: `id`, `status` (enum), `line_items_json`, `buyer_json`, `fulfillment_address_json`

**VaultToken**: `id`, `idempotency_key`, `payment_method_json`, `allowance_json`, `status` (active/consumed)

**PaymentIntent**: `id`, `vault_token_id` (FK), `amount`, `currency`, `status` (pending/completed)

## Code Standards

### Python Backend

**Workflow (non-negotiable):**
1. Implement feature
2. Add tests (happy path + edge cases + failures)
3. `ruff check src/ tests/ --fix && ruff format src/ tests/`
4. `pyright src/`
5. `pytest tests/ -v`

**Standards:**
- Python 3.12+ syntax, type hints required for public APIs
- 4-space indent, 88-char lines (Ruff enforced)
- No unused imports, no dead code, no commented-out code
- Mock external services in tests

### Frontend

- TypeScript strict mode
- Kaizen UI components (use MCP server for component specs)
- React 19 patterns with hooks
- Vitest for testing

### Testing Requirements

Every feature needs tests covering:
- **Happy path**: Expected success
- **Edge cases**: Boundaries, empty inputs, max values
- **Failure cases**: Invalid inputs, state violations, not found

Test files: `test_*.py` in `tests/` mirroring `src/` structure.

## Environment Variables

```env
# Required - see env.example
API_KEY=your-api-key                              # Merchant API
PSP_API_KEY=psp-api-key-12345                     # PSP API
NIM_ENDPOINT=https://integrate.api.nvidia.com/v1  # NAT agents
NIM_API_KEY=nvapi-xxx
PROMOTION_AGENT_URL=http://localhost:8002
DATABASE_URL=sqlite:///./agentic_commerce.db
```

## Feature Status

**Completed:**
- Features 1-6: Foundation, DB, ACP endpoints, auth, PSP, Promotion Agent
- Features 9-10, 12: UI, Protocol Inspector, Agent Panel

**Planned:**
- Feature 7: Recommendation Agent
- Feature 8: Post-Purchase Agent
- Feature 11: Webhook integration

## References

| Doc | Purpose |
|-----|---------|
| `docs/PRD.md` | Product requirements |
| `docs/architecture.md` | Fullstack patterns |
| `docs/acp-spec.md` | Protocol spec |
| `docs/features.md` | Implementation roadmap |
| `.cursor/skills/features/SKILL.md` | Backend standards |
| `.cursor/skills/ui/SKILL.md` | Frontend standards |

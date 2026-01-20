# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a reference implementation of the **Agentic Commerce Protocol (ACP)**: a retailer-operated checkout system that enables agentic negotiation while maintaining merchant control. The backend is built with Python 3.12+ FastAPI and SQLModel ORM, with a planned Next.js frontend.

**Key Architecture**: Async Parallel Orchestrator pattern where NVIDIA NeMo Agent Toolkit (NAT) agents perform real-time business logic (promotions, recommendations, post-purchase) using tool-calling SQL queries.

## Development Commands

### Server Operations
```bash
# Start development server
uvicorn src.merchant.main:app --reload

# Server runs at http://localhost:8000
# API docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc

# Health check
curl http://localhost:8000/health
```

### Dependency Management
```bash
# Using uv (recommended)
uv sync                    # Install core dependencies
uv sync --extra dev        # Include dev dependencies

# Using pip
pip install -e .           # Core dependencies
pip install -e ".[dev]"    # Include dev dependencies
```

### Testing
```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/merchant/api/test_checkout.py -v

# Run tests matching pattern
pytest tests/ -v -k "test_create_checkout"

# Run with coverage
pytest tests/ --cov=src
```

### Code Quality (Mandatory Before Commit)
```bash
# Linting
ruff check src/ tests/              # Check for issues
ruff check src/ tests/ --fix        # Auto-fix issues

# Formatting
ruff format --check src/ tests/     # Check formatting
ruff format src/ tests/             # Apply formatting

# Type checking
pyright src/                        # Run type checker
```

## Architecture & Structure

### Module Organization
```
src/merchant/
├── main.py              # FastAPI app entry point with lifespan management
├── config.py            # Environment configuration (pydantic-settings)
├── api/
│   ├── routes/         # API endpoints (health, checkout)
│   ├── schemas.py      # Pydantic request/response models
│   └── dependencies.py # FastAPI dependency injection
├── agents/             # NAT agent implementations (Promotion, Recommendation, Post-Purchase)
├── db/
│   ├── models.py       # SQLModel ORM models (Product, CheckoutSession, CompetitorPrice)
│   └── database.py     # Database initialization and seeding
├── services/           # Business logic layer
│   ├── checkout.py     # Checkout session management
│   └── idempotency.py  # Idempotency key handling
└── middleware/         # Request/response middleware (logging, headers)
```

### Key Architectural Patterns

**1. ACP Checkout State Machine**
```
not_ready_for_payment → ready_for_payment → completed
                     ↘                   ↘
                       →    canceled    ←
```
Transitions enforced in `services/checkout.py`.

**2. Async Parallel Orchestration**
Promotion and Recommendation agents execute simultaneously via `asyncio.gather` during session creation to minimize latency.

**3. Tool-Calling SQL Bridge**
NAT agents NEVER access the database directly. They invoke Python tools that execute parameterized SQL queries (injection prevention).

**4. Middleware Chain Order** (Critical for proper operation)
```python
# Applied in this order (main.py):
1. CORSMiddleware - CORS handling
2. ACPHeadersMiddleware - Request-Id, Idempotency-Key processing
3. RequestLoggingMiddleware - Request/response logging
```

**5. Idempotency Enforcement**
All state-changing endpoints MUST respect `Idempotency-Key` header. Implementation in `services/idempotency.py`.

### Database Models (SQLModel)

**Product** - Catalog items with pricing and inventory
- `id` (PK), `sku`, `name`, `base_price` (cents), `stock_count`, `min_margin`, `image_url`

**CompetitorPrice** - For dynamic pricing agent logic
- `product_id` (FK), `retailer_name`, `price` (cents), `updated_at`

**CheckoutSession** - Full ACP state stored as JSON fields
- `id` (PK), `status` (enum), `line_items_json`, `buyer_json`, `fulfillment_address_json`, etc.
- JSON serialization allows flexible schema evolution while maintaining SQL query capabilities

### ACP Endpoints Implementation

All endpoints in `api/routes/checkout.py`:

| Endpoint | Method | Status Code | Purpose |
|----------|--------|-------------|---------|
| `/checkout_sessions` | POST | 201 | Create session, triggers agent orchestration |
| `/checkout_sessions/{id}` | GET | 200 | Retrieve current state |
| `/checkout_sessions/{id}` | POST | 200 | Update session, may trigger state transitions |
| `/checkout_sessions/{id}/complete` | POST | 200 | Process payment, create order |
| `/checkout_sessions/{id}/cancel` | POST | 200 | Cancel session (if allowed) |

**Critical**: All responses MUST include `messages[]` and `links[]` arrays per ACP spec.

## Code Standards

### Python Backend (Strictly Enforced)

**Mandatory tooling** (defined in `.cursor/skills/features/SKILL.md`):
1. **Ruff** for linting AND formatting (single source of truth)
2. **Pyright** for type checking (strict mode enabled)
3. **pytest** for testing (async-aware configuration in pyproject.toml)

**Workflow order** (non-negotiable):
1. Implement feature
2. Add/update unit tests (happy path + edge cases + failures)
3. Verify Ruff compliance: `ruff check src/ tests/ && ruff format src/ tests/`
4. Verify Pyright passes: `pyright src/`
5. Verify tests pass: `pytest tests/ -v`

**Standards**:
- Python 3.12+ syntax
- Type hints required for public APIs and non-trivial logic
- 4-space indentation, 88-char line length (Ruff enforced)
- No unused imports, no dead code, no commented-out code
- NO TODOs without issue references
- Use explicit, readable code over clever abstractions
- Mock external services in tests (no external dependencies)

### Testing Requirements

Every feature MUST have tests covering:
- **Happy path**: Expected success scenarios
- **Edge cases**: Boundary conditions, empty inputs, maximum values
- **Failure cases**: Invalid inputs, state transition violations, not found errors

Test file naming: `test_*.py` in `tests/` directory mirroring `src/` structure.

Use pytest fixtures over setup/teardown. Parametrize where appropriate.

### API Security (Feature 4)

All ACP endpoints protected by API key authentication:
- Header: `Authorization: Bearer <API_KEY>` OR `X-API-Key: <API_KEY>`
- 401 for missing key
- 403 for invalid key

Additional security:
- Strict Pydantic validation with `extra = "forbid"`
- Idempotency via `Idempotency-Key` header
- Request/response logging for audit trails

## Feature Status

**Completed (Phase 1)**:
- ✅ Feature 1: Project foundation with FastAPI/SQLModel
- ✅ Feature 2: Database schema with 4-product seed data
- ✅ Feature 3: Five ACP core endpoints with state machine
- ✅ Feature 4: API key auth + idempotency + validation

**Planned (Phase 2)**:
- Feature 5: PSP delegated payments (vault tokens + payment intents)
- Feature 6: Promotion Agent (NAT-based dynamic pricing)
- Feature 7: Recommendation Agent (NAT-based cross-sell)
- Feature 8: Post-Purchase Agent (NAT-based multilingual updates)

**Planned (Phase 3)**:
- Feature 9: Next.js client simulator
- Feature 10: Multi-panel Protocol Inspector UI
- Feature 11: Webhook integration for post-purchase events

See `docs/features.md` for complete breakdown.

## Environment Configuration

Required variables in `.env` (see `env.example`):
```env
# API Security
API_KEY=your-api-key

# NIM Configuration (for NAT agents)
NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
NIM_API_KEY=nvapi-xxx

# Webhook (Feature 11)
WEBHOOK_URL=https://your-client.example.com/webhooks/acp
WEBHOOK_SECRET=whsec_xxx

# Database
DATABASE_URL=sqlite:///./agentic_commerce.db

# Deployment
DEBUG=true
```

## NAT Agent Development (Future Features 6-8)

When implementing agents:

1. **Tool Definition**: Create Python tools in `agents/` that execute parameterized SQL queries
2. **System Prompts**: Define agent behavior with business rules (e.g., "protect min_margin")
3. **Orchestration**: Use `asyncio.gather` for parallel execution where applicable
4. **Observability**: Capture reasoning traces for Protocol Inspector UI
5. **Latency Target**: <10s for typical operations (NFR-LAT)

**Critical**: NEVER allow agents direct database access. Always use tool-calling pattern.

## CI Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR:
1. **Lint & Format**: `ruff check` + `ruff format --check`
2. **Type Check**: `pyright src/`
3. **Unit Tests**: `pytest tests/ -v`

All jobs must pass before merge.

## References

- **PRD**: `docs/PRD.md`
- **Architecture**: `docs/architecture.md` (Fullstack patterns, orchestration details)
- **ACP Spec**: `docs/acp-spec.md` (Protocol requirements, request/response schemas)
- **Features**: `docs/features.md` (Implementation roadmap with acceptance criteria)
- **Skills**: `.cursor/skills/features/SKILL.md` (Backend standards), `.cursor/skills/ui/SKILL.md` (Frontend standards)

## Common Pitfalls

1. **State Transition Violations**: Always validate current status before transitions (enforce state machine)
2. **Missing ACP Fields**: Every response needs `messages[]` and `links[]` arrays
3. **Idempotency Bypass**: Never skip idempotency checks on POST/PUT endpoints
4. **Direct DB Access in Agents**: Always use tool-calling pattern with parameterized queries
5. **Skipping Tests**: Every feature requires comprehensive test coverage before completion
6. **Type Errors**: Pyright runs in strict mode - all type hints must resolve cleanly

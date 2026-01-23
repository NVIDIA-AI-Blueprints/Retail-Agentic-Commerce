# AGENTS.md

This document is the fast-start guide for GPT Codex and other coding agents.

## How to Use This Doc

Read this top to bottom once per session. Prefer:
1. Skills (mandatory workflows and standards)
2. Quick Map (where to look first)
3. Commands (how to run and verify)

## Project Overview

Agentic Commerce Protocol (ACP) reference implementation:
- **Backend**: Python 3.12+ FastAPI with SQLModel
- **Frontend**: Next.js 15+ with React 19, Tailwind CSS, Kaizen UI

Core docs:
- `docs/features.md` for feature status and acceptance criteria
- `docs/architecture.md` for system design

## Cursor Skills (Mandatory)

Before changing code, read the skill files in `.cursor/skills/`:
- **`.cursor/skills/features/SKILL.md`** - Python backend standards (Ruff, Pyright, pytest)
- **`.cursor/skills/ui/SKILL.md`** - Frontend standards (React, Next.js, browser validation)

## Quick Map (Where to Look First)

Backend:
- API routes: `src/merchant/api/routes/`
- Business logic: `src/merchant/services/`
- Models: `src/merchant/db/models.py`

Frontend:
- Main UI layout: `src/ui/app/page.tsx`
- Panels: `src/ui/components/agent/`, `src/ui/components/business/`, `src/ui/components/agent-activity/`
- Checkout state machine: `src/ui/hooks/useCheckoutFlow.ts`
- Protocol loggers: `src/ui/hooks/useACPLog.tsx`, `src/ui/hooks/useAgentActivityLog.tsx`

## Runtime Commands

### Backend
```bash
# Merchant API
uvicorn src.merchant.main:app --reload

# PSP
uvicorn src.payment.main:app --reload --port 8001
```

### Frontend
```bash
cd src/ui
pnpm install
pnpm run dev
```

## UI-Backend Integration

Key files:
- `src/ui/lib/api-client.ts` - API client
- `src/ui/hooks/useCheckoutFlow.ts` - Checkout flow state machine
- `src/ui/hooks/useACPLog.tsx` - ACP protocol event logging
- `src/ui/hooks/useAgentActivityLog.tsx` - Agent decision tracking
- `src/ui/types/index.ts` - ACP and agent types

Checkout flow:
1. Select product → `createCheckoutSession()` → POST /checkout_sessions
2. Select shipping → `updateCheckoutSession()` → POST /checkout_sessions/{id}
3. Delegate payment → `delegatePayment()` → POST /agentic_commerce/delegate_payment
4. Complete checkout → `completeCheckout()` → POST /checkout_sessions/{id}/complete

Three-panel layout (Feature 10):
- **Client Agent Panel**: product selection + checkout modal
- **Merchant Server Panel**: ACP protocol events and session state
- **Agent Activity Panel**: promotion agent decisions, input signals, reasoning

Environment (`src/ui/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PSP_URL=http://localhost:8001
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_PSP_API_KEY=psp-api-key-12345
```

## Quality Gates

Frontend:
```bash
cd src/ui
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

## Code Standards

Python:
- Type hints required for public APIs
- Ruff enforces formatting and linting
- Add tests for each change

Frontend:
- Strict TypeScript
- ESLint + Prettier compliance
- Use Kaizen UI and Tailwind
- Validate UI changes with browser MCP tools when available

## PR Instructions

Title format:
```
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

## Project Structure

```
src/
├── agents/             # NAT Agents (NVIDIA NeMo Agent Toolkit)
│   ├── pyproject.toml  # Shared dependencies for all agents
│   ├── README.md       # Agent documentation
│   └── configs/        # Agent workflow configurations
│       ├── promotion.yml      # Promotion strategy arbiter (port 8002)
│       └── post-purchase.yml  # Multilingual shipping messages (port 8003)
│
├── merchant/           # Merchant API (FastAPI backend, port 8000)
│   ├── main.py         # Application entry point
│   ├── config.py       # Environment configuration
│   ├── api/            # API routes and schemas
│   ├── db/             # Database models and utilities
│   └── services/       # Business logic layer
│       ├── promotion.py       # Promotion agent integration (3-layer)
│       └── post_purchase.py   # Post-purchase agent integration
│
├── payment/            # PSP Service (FastAPI backend, port 8001)
│   ├── main.py         # PSP application entry point
│   ├── config.py       # PSP environment configuration (PSP_API_KEY)
│   ├── api/            # PSP API routes (delegate_payment, payment_intent)
│   ├── db/             # PSP models (VaultToken, PaymentIntent, IdempotencyRecord)
│   └── services/       # PSP business logic (vault tokens, idempotency)
│
└── ui/                 # Next.js frontend (port 3000)
    ├── app/            # Next.js App Router pages
    ├── components/     # React components
    │   ├── agent/      # Client Agent panel
    │   ├── agent-activity/ # Agent Activity panel
    │   ├── business/   # Merchant Server panel
    │   └── layout/     # Layout components (Navbar, etc.)
    ├── hooks/          # Custom React hooks (useCheckoutFlow, useACPLog, useAgentActivityLog)
    ├── types/          # TypeScript type definitions (ACP types, agent types)
    └── data/           # Mock data for development

tests/
├── merchant/           # Merchant API test files
└── payment/            # PSP service test files

docs/                   # Project documentation
.cursor/skills/         # AI assistant skill definitions
```

## Helper Commands

Merchant API:
- Start server: `uvicorn src.merchant.main:app --reload`
- Run tests: `pytest tests/merchant/ -v`
- Health: `curl http://localhost:8000/health`

PSP Service:
- Start server: `uvicorn src.payment.main:app --reload --port 8001`
- Run tests: `pytest tests/payment/ -v`
- Health: `curl http://localhost:8001/health`

NAT Agents (from `src/agents/`):
- Install: `uv pip install -e ".[dev]" --prerelease=allow`
- Start Promotion Agent: `nat serve --config_file configs/promotion.yml --port 8002`
- Start Post-Purchase Agent: `nat serve --config_file configs/post-purchase.yml --port 8003`
- Test Promotion: `nat run --config_file configs/promotion.yml --input '{...}'`
- Test Post-Purchase: `nat run --config_file configs/post-purchase.yml --input '{...}'`

Frontend (from `src/ui/`):
- Start UI: `pnpm run dev`
- Run tests: `pnpm test:run`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Type check: `pnpm typecheck`

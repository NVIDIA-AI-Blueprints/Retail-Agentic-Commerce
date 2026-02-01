---
description: 
alwaysApply: false
---

---
description: 
alwaysApply: false
---

# AGENTS.md

This document is the fast-start guide for GPT Codex and other coding agents.

## How to Use This Doc

Read this top to bottom once per session. Prefer:
1. Skills (mandatory workflows and standards)
2. Quick Map (where to look first)
3. Commands (how to run and verify)

## Documentation-First Development (CRITICAL)

**ALWAYS read and follow documentation BEFORE implementing features, making modifications, or reviewing code.**

This project implements the Agentic Commerce Protocol (ACP). The architecture and data flows are defined in specifications that MUST be followed. Do not make assumptions about how components should interact.

### Mandatory Documentation Review

Before ANY work, read the relevant documentation:

| Task Type | Required Reading |
|-----------|------------------|
| ACP endpoints/flows | `docs/specs/acp-spec.md` |
| Feature implementation | `docs/features/feature-XX-*.md` |
| System architecture | `docs/architecture.md` |
| Agent integration | `src/agents/README.md` |
| Apps SDK | `docs/specs/apps-sdk-spec.md` |

### The Documentation-First Checklist

Before writing or modifying code:

- [ ] **Read the specification** - What does the documentation say this component should do?
- [ ] **Identify the caller** - WHO should call this endpoint/function? (UI? Merchant? PSP?)
- [ ] **Trace the data flow** - WHERE does data originate and WHERE does it go?
- [ ] **Check existing implementation** - Does the current code match the specification?
- [ ] **Ask if uncertain** - If the spec is unclear, ASK the user before proceeding

### Never Make Assumptions

**WRONG approach:**
- "The UI is calling this endpoint, so it must be correct"
- "This error is a deployment issue, let me add a workaround"
- "The code exists, so it must be wired up correctly"

**CORRECT approach:**
- "Let me check the ACP spec to see WHO should call this endpoint"
- "Let me verify this implementation matches the documented architecture"
- "The service exists but is it actually called? Let me trace the flow"

### Ask Clarifying Questions

When documentation is ambiguous or you're uncertain, ASK before implementing:

1. "The spec says X, but the code does Y. Which is correct?"
2. "I see this service exists but isn't called. Should I integrate it?"
3. "The architecture shows Merchant → Client flow, but the code has Client → Client. Is this intentional?"

### Real Example: Webhook Architecture Mistake

This project had a bug where the UI was calling its own webhook endpoint instead of the merchant calling it:

**What the ACP spec says (docs/specs/acp-spec.md, line 948):**
> "Merchants send webhook events to OpenAI for order lifecycle updates"

**What Feature 11 docs show (docs/features/feature-11-webhook-integration.md):**
```
Merchant Backend                    Client Agent (UI)
      │                                   │
      │  POST /api/webhooks/acp           │
      │ ─────────────────────────────────▶│
```

**What the code was doing (WRONG):**
```
UI calls /api/agents/post-purchase → UI calls /api/webhooks/acp (itself)
```

**The mistake:** Instead of reading the documentation to understand the correct architecture, the error was treated as a "deployment configuration issue" and workarounds were attempted (skipping signature verification). The documentation clearly showed the correct flow, but it wasn't consulted.

**The lesson:** When something doesn't work, FIRST check if the implementation matches the documented architecture. Don't assume the code is correct and try to "fix" symptoms.

### Architecture Verification Questions

When debugging issues, ask these questions IN ORDER:

1. **What does the documentation say should happen?**
2. **Does the current implementation match the documentation?**
3. **If not, is the documentation wrong or the code wrong?**
4. **Only after confirming architecture is correct:** Is this a configuration/deployment issue?

### Key Principle

**The documentation is the source of truth.** If the code doesn't match the documentation:
- The code is likely wrong (fix the code)
- OR the documentation needs updating (discuss with user first)
- NEVER assume the code is right and work around it

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

# Apps SDK MCP Server
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### Frontend
```bash
cd src/ui
pnpm install
pnpm run dev
```

### Apps SDK Widget (for development)
```bash
cd src/apps_sdk/web
pnpm install
pnpm dev  # Runs on port 3001
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
# Server-side only (used by proxy routes, NOT exposed to browser)
MERCHANT_API_URL=http://localhost:8000
MERCHANT_API_KEY=test-api-key
PSP_API_URL=http://localhost:8001
PSP_API_KEY=psp-api-key-12345

# Client-side (safe to expose)
NEXT_PUBLIC_API_VERSION=2026-01-16
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
│       ├── promotion.yml        # Promotion strategy arbiter (port 8002)
│       ├── post-purchase.yml    # Multilingual shipping messages (port 8003)
│       ├── recommendation.yml   # ARAG multi-agent recommendations (full version)
│       └── recommendation-ultrafast.yml  # ARAG recommendations optimized for speed (port 8004)
│
├── apps_sdk/           # Apps SDK MCP Server (port 2091)
│   ├── main.py         # FastAPI + MCP server entry point
│   ├── config.py       # Environment configuration
│   ├── tools/          # MCP tool implementations
│   │   ├── recommendations.py  # get-recommendations tool
│   │   ├── cart.py             # add-to-cart, get-cart tools
│   │   └── checkout.py         # checkout tool (ACP integration)
│   ├── web/            # React + Vite widget source
│   │   └── src/        # Widget components and hooks
│   └── dist/           # Built widget HTML bundles
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

Apps SDK MCP Server:
- Start server: `uvicorn src.apps_sdk.main:app --reload --port 2091`
- Health: `curl http://localhost:2091/health`
- Widget URL: `http://localhost:2091/widget/merchant-app.html`

Apps SDK Widget (from `src/apps_sdk/web/`):
- Install: `pnpm install`
- Dev server: `pnpm dev` (port 3001)
- Build: `pnpm build` (outputs to `../dist/`)

NAT Agents (from `src/agents/`):
- Install: `uv pip install -e ".[dev]" --prerelease=allow`
- Start Promotion Agent: `nat serve --config_file configs/promotion.yml --port 8002`
- Start Post-Purchase Agent: `nat serve --config_file configs/post-purchase.yml --port 8003`
- Start Recommendation Agent (ARAG): `nat serve --config_file configs/recommendation-ultrafast.yml --port 8004`
- Test Promotion: `nat run --config_file configs/promotion.yml --input '{...}'`
- Test Post-Purchase: `nat run --config_file configs/post-purchase.yml --input '{...}'`

Note: Recommendation Agent uses ARAG (Agentic RAG) with 4 specialized agents
(UUA, NLI, CSA, Ranker) orchestrated in a single YAML via NAT's multi-agent pattern.
See `src/agents/README.md` for full configuration.

Frontend (from `src/ui/`):
- Start UI: `pnpm run dev`
- Run tests: `pnpm test:run`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Type check: `pnpm typecheck`

## Code Change Verification (CRITICAL)

**NEVER claim code works without actually testing it.**

When making code changes, especially to API endpoints or integrations, you MUST verify with real tests.

### Verification Process

1. **Test endpoints with curl** (include HTTP status code):
   ```bash
   curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:PORT/endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

2. **Check server logs** for errors:
   - Read terminal files in the terminals folder
   - Look for ERROR, Exception, NameError, ImportError
   - Verify downstream calls are made (e.g., Merchant API calls)

3. **Rebuild if frontend changes**:
   ```bash
   cd src/apps_sdk/web && pnpm build
   ```

4. **Report verification results** to user:
   - Actual commands run
   - HTTP status codes received
   - Server log evidence
   - Any errors found and fixed

### Example Verification

```bash
# Test ACP session creation
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:2091/acp/sessions \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id": "prod_1", "quantity": 2}]}'
# Expected: HTTP_CODE:200 with session ID

# Check server log shows Merchant API call:
# HTTP Request: POST http://localhost:8000/checkout_sessions "HTTP/1.1 200 OK"
```

### Red Flags

- **500 Error**: Missing imports, undefined variables
- **400 Error**: Request format mismatch
- **Connection Refused**: Service not running
- **No log output**: Code path not executed

**DO NOT** just read code and say "this should work" - always test and show evidence.

## Critical Verification Diligence (MUST READ)

**Passing static checks (TypeScript, linting, tests, code review) does NOT mean code works correctly.**

Many bugs are invisible to static analysis. You MUST verify actual runtime behavior through real testing, not just reading code and assuming it works.

### Verification Blind Spots

These pass all static checks but contain bugs:

| Blind Spot | What You See | Reality |
|------------|--------------|---------|
| **Mock/Hardcoded Data** | Code calls a function that "returns data" | Function returns hardcoded values, not real API calls |
| **Fire-and-Forget Async** | `fetchData()` is called | Call is made but result is never awaited or used |
| **Stale State Display** | UI updates when state changes | UI shows OLD data while waiting for NEW data |
| **Unused Results** | Backend call is made | Response is ignored; UI uses local calculation instead |
| **Dead Code Paths** | Function exists and looks correct | Function is never actually called in the flow |
| **Wrong Data Source** | Display shows correct-looking values | Values come from local state, not backend response |

### Questions to Ask Before Claiming "It Works"

1. **Is this REAL or MOCK?**
   - Trace the data from UI back to source
   - Is there an actual HTTP call? Check network tab or server logs
   - Are there hardcoded values, default fallbacks, or mock returns?

2. **Is this USED or IGNORED?**
   - If backend returns data, is that data actually used in the UI?
   - Or does the UI calculate/derive values locally and ignore the response?

3. **What happens DURING async operations?**
   - What does user see while waiting for response?
   - Is stale data shown without indication?
   - Can mismatched data appear (e.g., new quantity but old total)?

4. **What happens on FAILURE?**
   - If the backend call fails, does the UI handle it?
   - Are optimistic updates rolled back?

5. **Is the CODE PATH actually executed?**
   - Just because code exists doesn't mean it runs
   - Add console.log or check server logs to confirm execution

### Verification Methods (In Order of Reliability)

1. **Server Logs** - Most reliable. Shows actual HTTP calls made.
   ```bash
   # Check terminal for: "POST /endpoint HTTP/1.1 200 OK"
   ```

2. **Network Tab** - Shows real requests from browser/client.

3. **Console Logs** - Add logging at key points to trace execution.

4. **Manual User Testing** - Actually use the UI as a user would.

5. **curl/HTTP Tests** - Verify endpoints respond correctly.

6. **Code Reading** - LEAST reliable alone. Must be combined with above.

### Common Deceptive Patterns

**Pattern 1: Looks like API call, is actually local**
```tsx
// DECEPTIVE: Looks like it uses backend data
const total = calculateTotal(items);  // Actually local calculation!

// CORRECT: Actually uses backend response
const total = backendResponse.totals.find(t => t.type === 'total').amount;
```

**Pattern 2: Backend called but result ignored**
```tsx
// DECEPTIVE: Makes call but ignores result
await updateBackend(newItems);
setDisplayTotal(localCalculation(newItems));  // BUG: should use response!

// CORRECT: Uses backend result
const response = await updateBackend(newItems);
setDisplayTotal(response.total);
```

**Pattern 3: Async without proper waiting**
```tsx
// DECEPTIVE: Looks correct but has timing bug
setItems(newItems);           // UI updates immediately
notifyBackend(newItems);      // Async fires (no await)
// BUG: UI shows new items but old totals until backend responds!

// CORRECT: Track pending state
setItems(newItems);
setIsPending(true);
await notifyBackend(newItems);
setIsPending(false);
```

**Pattern 4: Default/fallback hides missing data**
```tsx
// DECEPTIVE: Fallback masks the bug
const price = response.price ?? calculateLocally(item);  // Fallback used!

// CORRECT: Fail explicitly if data missing
const price = response.price;
if (price === undefined) throw new Error("Backend did not return price");
```

### Verification Checklist

Before saying code is correct, verify these with EVIDENCE:

- [ ] **Server logs show HTTP calls** were actually made
- [ ] **Response data is used** in the UI (not local calculations)
- [ ] **No hardcoded/mock data** in the actual code path
- [ ] **Loading states shown** during async operations
- [ ] **Error handling works** when backend fails
- [ ] **User sees correct data** through manual testing

### When Static Analysis is INSUFFICIENT

You MUST do runtime verification when:
- Code involves HTTP/API calls
- Multiple components share or sync state
- Async operations affect UI display
- Data flows from backend to frontend
- User actions trigger calculations that should happen server-side

For these cases, **reading code is not enough** - you must observe actual behavior through logs, network inspection, or manual testing.

### Key Principle

**Never claim code works based solely on:**
- "The function exists and looks correct"
- "TypeScript/linting passes"
- "The logic seems right"

**Always verify with evidence:**
- Server logs showing actual calls
- Network tab showing request/response
- Manual testing showing correct behavior
- Console logs confirming code path execution

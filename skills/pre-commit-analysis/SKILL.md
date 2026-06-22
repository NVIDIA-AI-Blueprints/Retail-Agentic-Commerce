---
name: pre-commit-analysis
description: Pre-commit implementation analysis for Retail-Agentic-Commerce. Use before commits, after significant changes, or when validating Apps SDK tools, mock data, MCP communication, widget isolation, or implementation quality.
---

# Pre-Commit Analysis

Use this skill before committing significant changes or when the user asks for implementation-quality validation.

If multi-agent tools are available, run the analysis areas in parallel. If not, perform the same checks directly with local commands.

## Analysis Areas

1. MCP tools: verify tool implementations use real APIs or shared data sources.
2. Apps SDK web isolation: verify widget code communicates through postMessage and MCP boundaries.
3. Mock data completeness: verify mock data exists and stays synchronized with the shared catalog.
4. Communication flow: verify message types and handlers match across parent UI and widget code.

## MCP Tools Verification

Files to inspect:

- `src/apps_sdk/tools/*.py`
- `src/apps_sdk/main.py`

Red flags:

- Hardcoded product lists instead of shared catalog data.
- Hardcoded responses where API calls or shared services are expected.
- Mock data drifting from `src/data/product_catalog.py`.
- Missing error handling for API failures.

Commands:

```bash
rg "MOCK_PRODUCTS|mock_products" src/apps_sdk/
rg "from src.data.product_catalog import" src/apps_sdk/
rg "httpx|requests|fetch" src/apps_sdk/tools/
```

Expected patterns:

```python
from src.data.product_catalog import PRODUCTS
```

```python
async with httpx.AsyncClient() as client:
    response = await client.get(f"{merchant_url}/products/{id}")
```

## Apps SDK Web Isolation

Files to inspect:

- `src/apps_sdk/web/src/**/*.tsx`
- `src/apps_sdk/web/src/**/*.ts`
- `src/apps_sdk/web/package.json`

Red flags:

- Imports from parent UI directories.
- Direct calls to localhost backend ports from widget code.
- Shared state with the parent app.
- Direct `window.parent` usage except for postMessage.

Commands:

```bash
rg "from ['\"]\\.\\./\\.\\./\\.\\." src/apps_sdk/web/src/
rg "localhost:8000|localhost:8001" src/apps_sdk/web/src/
rg "postMessage|window\\.parent" src/apps_sdk/web/src/
```

Expected pattern:

```typescript
window.parent.postMessage({ type: "GET_RECOMMENDATIONS" }, "*");
const result = await window.openai.callTool("add-to-cart", args);
```

## Mock Data Completeness

Files to inspect:

- `src/data/product_catalog.py`
- `src/ui/data/mock-data.ts`
- `src/apps_sdk/tools/recommendations.py`

Red flags:

- Product count mismatch.
- Missing development or test mock data.
- Hardcoded data instead of catalog imports.
- Missing fallbacks when agent services are unavailable.

Commands:

```bash
rg '"id": "prod_' src/data/product_catalog.py | wc -l
rg "CATALOG_PRODUCTS|from src.data.product_catalog" src/apps_sdk/
```

## Communication Flow

Files to inspect:

- `src/ui/components/agent/MerchantIframeContainer.tsx`
- `src/ui/hooks/useMCPClient.ts`
- `src/apps_sdk/web/src/App.tsx`
- `src/apps_sdk/web/src/main.tsx`

Message types to verify:

| Direction | Message Type | Purpose |
|-----------|--------------|---------|
| Widget to Parent | `GET_RECOMMENDATIONS` | Request product recommendations |
| Parent to Widget | `RECOMMENDATIONS_RESULT` | Return recommendation data |
| Widget to Parent | `CHECKOUT_COMPLETE` | Notify checkout success |
| Widget to Parent | `CALL_TOOL` | MCP tool invocation through the bridge |

Commands:

```bash
rg "message\\.type.*==|case.*:" src/ui/components/agent/MerchantIframeContainer.tsx
rg "postMessage.*type:" src/apps_sdk/web/src/
```

## Validation Checklist

Track these before committing:

```text
Pre-Commit Analysis:
- [ ] MCP tools use shared catalog data where applicable.
- [ ] MCP tools make real API calls where needed.
- [ ] Apps SDK web has no forbidden parent imports.
- [ ] Widget uses postMessage for parent communication.
- [ ] Widget makes no direct backend API calls.
- [ ] Mock data is synced with product catalog expectations.
- [ ] Agent fallbacks exist when services are unavailable.
- [ ] Message types match between sender and receiver.
- [ ] Relevant tests pass.
- [ ] Relevant linter and type checks pass.
```

## Post-Analysis Commands

Run relevant checks for the changed areas:

```bash
uv run pytest tests/apps_sdk/ -v
uv run ruff check src/apps_sdk/
uv run pyright src/apps_sdk/
cd src/apps_sdk/web && pnpm build
```

Broaden to the full quality gates from `skills/features/SKILL.md` and `skills/ui/SKILL.md` when shared backend or frontend behavior changed.

## Report Format

```markdown
## Pre-Commit Analysis Report

### MCP Tools
- Status: PASS/FAIL
- Issues: [list any issues]

### Apps SDK Isolation
- Status: PASS/FAIL
- Issues: [list any issues]

### Mock Data
- Status: PASS/FAIL
- Product count: X/17
- Issues: [list any issues]

### Communication Flow
- Status: PASS/FAIL
- Issues: [list any issues]

### Recommendations
1. [High priority fixes]
2. [Medium priority improvements]
3. [Low priority enhancements]
```

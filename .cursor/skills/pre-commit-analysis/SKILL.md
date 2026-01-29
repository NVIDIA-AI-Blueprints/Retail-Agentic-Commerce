---
name: pre-commit-analysis
description: Comprehensive code analysis before committing changes. Verifies mock data exists, MCP communication is real (not hardcoded), tool calls are correct, and Apps SDK web isolation. Use before git commits, for big changes, or when the user asks to validate implementation quality.
---

# Pre-Commit Analysis

Validates code quality and implementation correctness before committing to GitHub. Uses parallel subagents for comprehensive analysis.

## When to Use

- Before committing significant changes
- After implementing new features
- When adding MCP tools or widget functionality
- When modifying Apps SDK communication patterns

## Quick Start

Launch 4 parallel subagents to analyze different areas:

```
1. MCP Tools Analysis - Verify tools are real, not hardcoded
2. Apps SDK Web Isolation - Check iframe/postMessage patterns
3. Mock Data Completeness - Verify mock data exists
4. Communication Flow - Validate MCP protocol compliance
```

## Analysis 1: MCP Tools Verification

**Goal**: Ensure all MCP tools make real API calls or use shared data sources.

**Files to check**:
- `src/apps_sdk/tools/*.py` - All tool implementations
- `src/apps_sdk/main.py` - Tool registration and handlers

**Red flags**:
- Hardcoded product lists (should import from `src/data/product_catalog.py`)
- Hardcoded responses without API calls
- Mock data not synced with shared catalog
- Missing error handling for API failures

**Verification commands**:
```bash
# Check for hardcoded mock products
rg "MOCK_PRODUCTS|mock_products" src/apps_sdk/

# Verify shared catalog import
rg "from src.data.product_catalog import" src/apps_sdk/

# Check tool implementations for HTTP calls
rg "httpx|requests|fetch" src/apps_sdk/tools/
```

**Expected pattern**:
```python
# Good: Import from shared catalog
from src.data.product_catalog import PRODUCTS

# Good: Make real API calls
async with httpx.AsyncClient() as client:
    response = await client.get(f"{merchant_url}/products/{id}")
```

## Analysis 2: Apps SDK Web Isolation

**Goal**: Widget must be isolated, communicating only via postMessage and MCP.

**Files to check**:
- `src/apps_sdk/web/src/**/*.tsx` - All widget components
- `src/apps_sdk/web/src/**/*.ts` - Hooks and utilities
- `src/apps_sdk/web/package.json` - Dependencies

**Red flags**:
- Imports from `../../../ui/` or parent directories
- Direct API calls (`fetch`, `axios`) to localhost ports
- Shared state with parent application
- Direct `window.parent` property access (except postMessage)

**Verification commands**:
```bash
# Check for external imports
rg "from ['\"]\.\./\.\./\.\." src/apps_sdk/web/src/

# Check for direct API calls
rg "localhost:8000|localhost:8001" src/apps_sdk/web/src/

# Verify postMessage usage
rg "postMessage|window\.parent" src/apps_sdk/web/src/
```

**Expected pattern**:
```typescript
// Good: Uses postMessage for parent communication
window.parent.postMessage({ type: "GET_RECOMMENDATIONS", ... }, "*");

// Good: Uses window.openai bridge (which uses postMessage internally)
const result = await window.openai.callTool("add-to-cart", args);
```

## Analysis 3: Mock Data Completeness

**Goal**: Mock data exists and matches the real data source.

**Files to check**:
- `src/data/product_catalog.py` - Source of truth (17 products)
- `src/ui/data/mock-data.ts` - Frontend mocks
- `src/apps_sdk/tools/recommendations.py` - Apps SDK product data

**Red flags**:
- Product count mismatch between sources
- Missing mock data for development/testing
- Hardcoded data instead of importing from catalog
- Agent fallbacks missing when agents unavailable

**Verification**:
```bash
# Count products in catalog
rg '"id": "prod_' src/data/product_catalog.py | wc -l

# Check Apps SDK uses catalog
rg "CATALOG_PRODUCTS|from src.data.product_catalog" src/apps_sdk/
```

**Data sync checklist**:
- [ ] `CATALOG_PRODUCTS` transforms from `src/data/product_catalog.py`
- [ ] Frontend mock data covers test scenarios
- [ ] Agent services have fallback behavior

## Analysis 4: Communication Flow

**Goal**: Verify MCP protocol compliance and message passing.

**Files to check**:
- `src/ui/components/agent/MerchantIframeContainer.tsx` - Parent-side handler
- `src/ui/hooks/useMCPClient.ts` - MCP client implementation
- `src/apps_sdk/web/src/App.tsx` - Widget message handlers
- `src/apps_sdk/web/src/main.tsx` - Bridge setup

**Message types to verify**:

| Direction | Message Type | Purpose |
|-----------|--------------|---------|
| Widget → Parent | `GET_RECOMMENDATIONS` | Request product recommendations |
| Parent → Widget | `RECOMMENDATIONS_RESULT` | Return recommendation data |
| Widget → Parent | `CHECKOUT_COMPLETE` | Notify checkout success |
| Widget → Parent | `CALL_TOOL` | MCP tool invocation (via bridge) |

**Red flags**:
- Missing message handlers
- Hardcoded responses instead of MCP calls
- Missing origin validation in postMessage
- Inconsistent message format between sender/receiver

**Verification**:
```bash
# Check message type handlers in parent
rg "message\.type.*==|case.*:" src/ui/components/agent/MerchantIframeContainer.tsx

# Check message sending in widget
rg "postMessage.*type:" src/apps_sdk/web/src/
```

## Subagent Launch Template

Use this prompt pattern to launch parallel analysis:

```
Launch 4 subagents with subagent_type="explore":

1. "Analyze MCP tools in src/apps_sdk/tools/ - verify real API calls, no hardcoded data"
2. "Check Apps SDK web isolation in src/apps_sdk/web/ - no external imports, postMessage only"
3. "Verify mock data completeness - compare src/data/product_catalog.py with other mock sources"
4. "Analyze iframe communication in src/ui/components/agent/ and src/apps_sdk/web/src/"
```

## Validation Checklist

Copy and track progress:

```
Pre-Commit Analysis:
- [ ] MCP tools use shared catalog (not hardcoded mock)
- [ ] MCP tools make real API calls where needed
- [ ] Apps SDK web has no external imports
- [ ] Widget uses postMessage for all parent communication
- [ ] Widget makes no direct API calls
- [ ] Mock data synced with product catalog (17 products)
- [ ] Agent fallbacks exist when services unavailable
- [ ] Message types match between sender and receiver
- [ ] All tests pass
- [ ] Linter checks pass
```

## Post-Analysis Commands

After analysis, run these to verify:

```bash
# Run Apps SDK tests
uv run pytest tests/apps_sdk/ -v

# Lint Apps SDK code
uv run ruff check src/apps_sdk/

# Type check
uv run pyright src/apps_sdk/

# Build widget (verifies no import errors)
cd src/apps_sdk/web && pnpm build
```

## Common Issues and Fixes

### Issue: Hardcoded mock products
**Fix**: Import from shared catalog
```python
from src.data.product_catalog import PRODUCTS

CATALOG_PRODUCTS = [
    {"id": p["id"], "name": p["name"], "basePrice": p["price_cents"], ...}
    for p in PRODUCTS
]
```

### Issue: Widget makes direct API calls
**Fix**: Use MCP tools via bridge
```typescript
// Bad: Direct API call
const response = await fetch("http://localhost:8000/products");

// Good: Use MCP tool
const result = await window.openai.callTool("search-products", { query });
```

### Issue: Missing checkout notification
**Fix**: Send postMessage after checkout
```typescript
if (result.success && result.orderId) {
  window.parent.postMessage({
    type: "CHECKOUT_COMPLETE",
    orderId: result.orderId
  }, targetOrigin);
}
```

### Issue: Missing origin validation
**Fix**: Validate message origin
```typescript
const handleMessage = (event: MessageEvent) => {
  // Validate origin
  if (event.origin !== expectedOrigin) return;
  // Process message
};
```

## Summary Report Template

After analysis, provide findings in this format:

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

# Feature 17: Apps SDK Widget Autonomy

## Overview

Refactor the Apps SDK widget to be fully autonomous after the initial `search-products` call. Currently, the widget relies on the parent UI to proxy MCP tool calls (e.g., recommendations). This violates the Apps SDK design principle where the widget should call tools directly via `window.openai.callTool()`.

## Problem Statement

### Current Architecture (Incorrect)

```
┌─────────────┐    postMessage     ┌─────────────┐    MCP call    ┌─────────────┐
│   Widget    │ ──────────────────▶│  Parent UI  │ ──────────────▶│ MCP Server  │
│  (iframe)   │ ◀────────────────── │             │ ◀────────────── │             │
└─────────────┘   RECOMMENDATIONS   └─────────────┘    response    └─────────────┘
                     _RESULT
```

**Issues:**
1. Widget sends `GET_RECOMMENDATIONS` via `postMessage` to parent
2. Parent calls MCP server on behalf of widget
3. Parent sends result back via `postMessage`
4. Widget is not autonomous - depends on parent for tool calls

### Target Architecture (Correct)

```
┌─────────────┐                     ┌─────────────┐
│  Parent UI  │ ── search-products ▶│ MCP Server  │
└─────────────┘                     └─────────────┘
       │                                   ▲
       │ loads widget                      │
       ▼                                   │
┌─────────────┐   window.openai.callTool   │
│   Widget    │ ───────────────────────────┘
│  (iframe)   │   (get-recommendations,
└─────────────┘    checkout, add-to-cart, etc.)
```

**Benefits:**
1. Parent only calls `search-products` to discover and load widget
2. Widget calls all tools directly via `window.openai.callTool()`
3. Widget is fully autonomous after loading
4. Matches the real ChatGPT Apps SDK behavior

## Current Implementation Analysis

| Component | File | Current Behavior | Issue |
|-----------|------|------------------|-------|
| Recommendations | `src/apps_sdk/web/src/App.tsx:352-364` | `window.parent.postMessage({ type: "GET_RECOMMENDATIONS" })` | Should use `window.openai.callTool()` |
| Recommendations | `src/apps_sdk/web/src/App.tsx:444-455` | Same postMessage pattern for checkout recs | Should use `window.openai.callTool()` |
| Checkout | `src/apps_sdk/web/src/App.tsx:517` | Direct `fetch()` to REST endpoint | Should use `window.openai.callTool("checkout")` |
| Parent handling | `src/ui/components/agent/MerchantIframeContainer.tsx:270-412` | Handles `GET_RECOMMENDATIONS` and calls MCP | Should be removed |
| Simulated bridge | `src/apps_sdk/web/src/main.tsx:36-40` | `callTool` uses `postMessage` fallback | Should make HTTP requests |

## Refactoring Plan

### Phase 1: Widget Changes (EASY - 1-2 hours)

#### 1.1 Replace Recommendation postMessage with callTool

**File:** `src/apps_sdk/web/src/App.tsx`

**Before (lines 352-364):**
```tsx
// Request recommendations from parent via postMessage
const message = {
  type: "GET_RECOMMENDATIONS",
  source: "product_detail",
  productId: product.id,
  productName: product.name,
  cartItems: cartItems.map((item) => ({...})),
};
window.parent.postMessage(message, "*");
```

**After:**
```tsx
// Call MCP tool directly via window.openai bridge
const result = await window.openai.callTool("get-recommendations", {
  productId: product.id,
  productName: product.name,
  cartItems: cartItems.map((item) => ({...})),
});
// Handle result directly
setProductRecommendations(parseRecommendations(result));
setIsLoadingRecommendations(false);
```

**Changes needed:**
- [ ] Import or use `useCallTool` hook for `get-recommendations`
- [ ] Replace postMessage call with `callTool` at line 352-364
- [ ] Replace postMessage call with `callTool` at line 444-455
- [ ] Remove `RECOMMENDATIONS_RESULT` message listener (lines 374-422)
- [ ] Add result parsing logic inline or as helper function

#### 1.2 Replace Checkout fetch with callTool

**File:** `src/apps_sdk/web/src/App.tsx`

**Before (line 517):**
```tsx
const response = await fetch(`${apiBaseUrl}/cart/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cart_id: cartId, customer_name: customerName }),
});
```

**After:**
```tsx
const result = await window.openai.callTool("checkout", {
  cartId: cartId,
  customerName: customerName,
});
```

**Changes needed:**
- [ ] Replace `fetch()` with `window.openai.callTool("checkout", ...)`
- [ ] Update result handling to match tool response format

### Phase 2: Parent UI Cleanup (EASY - 1 hour)

**File:** `src/ui/components/agent/MerchantIframeContainer.tsx`

**Remove:**
- [ ] `handleRecommendationRequest()` function (lines 270-412) - ~140 lines
- [ ] `GET_RECOMMENDATIONS` case in `handleMessage()` (lines 425-442)
- [ ] Related imports and dependencies

**Keep:**
- Initial `search-products` call for widget discovery (`initializeMCPWidget`)
- Widget URL resolution and iframe loading
- Skeleton loader and MCP status indicators
- Search request handling (refreshes widget via postMessage globals update)

### Phase 3: Simulated Bridge Enhancement (MEDIUM - 2-4 hours)

**File:** `src/apps_sdk/web/src/main.tsx`

The simulated `window.openai` bridge for development mode currently falls back to `postMessage` for `callTool`. This needs to make real HTTP requests to the MCP server.

**Before (lines 36-40):**
```tsx
callTool: async (name: string, args: Record<string, unknown>) => {
  console.log("[SimulatedBridge] callTool:", name, args);
  // Currently falls back to postMessage
  window.parent.postMessage({ type: "CALL_TOOL", toolName: name, args }, "*");
  // ... wait for response
},
```

**After:**
```tsx
callTool: async (name: string, args: Record<string, unknown>) => {
  console.log("[SimulatedBridge] callTool:", name, args);
  
  // Make real HTTP request to MCP server
  const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name, arguments: args },
      id: Date.now(),
    }),
  });
  
  const data = await response.json();
  return { result: JSON.stringify(data.result?.structuredContent || data.result) };
},
```

**Changes needed:**
- [ ] Implement HTTP-based `callTool` in simulated bridge
- [ ] Handle MCP JSON-RPC protocol properly
- [ ] Add error handling for network failures
- [ ] Configure MCP server URL (env variable or constant)

### Phase 4: Observability (MEDIUM - 2-3 hours)

**Problem:** Currently, the Protocol Inspector sees recommendation events because the parent intercepts them. Without interception, we lose visibility.

**Options:**

#### Option A: SSE Subscription (Recommended)
Add SSE endpoint to MCP server that emits all tool call events. Protocol Inspector subscribes to this stream.

**Changes:**
- [ ] Add `/events` SSE endpoint to `src/apps_sdk/main.py`
- [ ] Emit events for each tool call (start, complete, error)
- [ ] Update Protocol Inspector to subscribe to MCP events
- [ ] Correlate events by session/widget ID

#### Option B: Logging-Only postMessage
Widget emits events via `postMessage` purely for logging (parent doesn't act on them, just logs).

**Changes:**
- [ ] Widget emits `TOOL_CALL_START` and `TOOL_CALL_COMPLETE` messages
- [ ] Parent logs these to Protocol Inspector
- [ ] No data/control flow through parent

#### Option C: Accept Reduced Visibility
In Apps SDK mode, the Protocol Inspector shows less detail since the widget is autonomous.

**Changes:**
- [ ] Update Protocol Inspector UI to explain Apps SDK mode limitations
- [ ] Only show initial `search-products` call and final checkout events

## Testing Plan

### Unit Tests

- [ ] Widget: Test `useCallTool` hook integration for recommendations
- [ ] Widget: Test checkout flow with mocked `window.openai.callTool`
- [ ] Widget: Test error handling when `callTool` fails

### Integration Tests

- [ ] Full flow: search → product detail → recommendations → cart → checkout
- [ ] Verify no `postMessage` communication for tool calls
- [ ] Verify Protocol Inspector shows events (depending on observability option)

### Manual Testing

- [ ] Dev mode: Widget loads and calls tools directly
- [ ] Docker mode: Same behavior through nginx proxy
- [ ] Error scenarios: MCP server unavailable, tool call failures

## Acceptance Criteria

1. **Widget Autonomy:** After `search-products` loads the widget, all subsequent tool calls (`get-recommendations`, `checkout`, etc.) are made directly by the widget via `window.openai.callTool()`.

2. **No Parent Proxy:** Parent UI (`MerchantIframeContainer`) does NOT handle `GET_RECOMMENDATIONS` or any other tool call requests from the widget.

3. **Dev Mode Works:** The simulated bridge in `main.tsx` makes real HTTP requests to the MCP server, enabling full testing without ChatGPT.

4. **Observability:** Tool call events are visible in the Protocol Inspector through one of the chosen mechanisms.

5. **Backward Compatible:** Native ACP mode (non-Apps SDK) continues to work unchanged.

## Effort Estimate

| Phase | Effort | Time Estimate |
|-------|--------|---------------|
| Phase 1: Widget Changes | Easy | 1-2 hours |
| Phase 2: Parent Cleanup | Easy | 1 hour |
| Phase 3: Simulated Bridge | Medium | 2-4 hours |
| Phase 4: Observability | Medium | 2-3 hours |
| Testing | Medium | 2-3 hours |
| **Total** | **Medium** | **8-13 hours** |

## Dependencies

- No external dependencies
- No database changes
- No API contract changes (MCP tools already exist)

## Risks

1. **Dev Experience:** If simulated bridge doesn't work well, local development becomes harder
2. **Observability Gap:** Losing Protocol Inspector visibility may confuse demo users
3. **CORS Issues:** Widget making direct HTTP requests may hit CORS restrictions

## Related Files

```
src/
├── apps_sdk/
│   ├── web/
│   │   └── src/
│   │       ├── App.tsx                    # Widget main component (modify)
│   │       ├── main.tsx                   # Simulated bridge (modify)
│   │       └── hooks/
│   │           └── use-call-tool.ts       # Already implemented (use)
│   └── main.py                            # MCP server (optionally add SSE)
│
└── ui/
    └── components/
        └── agent/
            └── MerchantIframeContainer.tsx  # Parent UI (cleanup)
```

## References

- [Apps SDK Spec](../specs/apps-sdk-spec.md) - Official specification
- [Architecture](../architecture.md) - System design
- [README Diagram](../../README.md#architecture) - Updated architecture diagram

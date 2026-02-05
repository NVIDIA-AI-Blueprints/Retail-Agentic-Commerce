# Agent Playbook (Deep Context)

This document supplements `AGENTS.md` with rationale, diagnostics, and failure patterns.

## Purpose And Scope

Use this document when:
- Requirements are ambiguous.
- Runtime behavior is suspicious despite passing static checks.
- You need architecture-level troubleshooting guidance.
- You need concrete anti-pattern examples.

Do not duplicate canonical run commands or quality gates here. Keep those in `AGENTS.md`.

## Authority And Precedence

When guidance conflicts, use this precedence:
1. Protocol specifications in `docs/specs/`
2. `AGENTS.md` execution contract
3. This playbook

Code is never the source of truth by itself for protocol ownership or flow contracts.

## Quick Triage Flow

Use this sequence before implementing a fix:
1. Identify the task domain (ACP, UCP, Apps SDK, NAT, UI integration).
2. Read the relevant spec sections.
3. Confirm caller ownership for each endpoint/hop.
4. Reproduce with runtime evidence (logs/network/status codes).
5. Confirm downstream usage of response data (not local recompute).
6. Validate pending and failure states.
7. Fix root-cause architecture mismatch before environment tuning.

## Source Anchors (Validated)

These are the most common places where architecture assumptions fail:

- ACP checkout and delegation endpoints are defined in `docs/specs/acp-spec.md`.
- ACP webhook ownership is specified as merchant-originated events in `docs/specs/acp-spec.md`.
- Feature webhook flow (merchant calls client webhook endpoint) is documented in `docs/features/feature-11-webhook-integration.md`.
- UCP required headers and A2A checkout methods are defined in `docs/specs/ucp-spec.md`.
- UCP protocol toggle expectations are described in `docs/features/feature-17-ucp-integration.md`.
- Apps SDK search tool behavior is defined in `docs/specs/apps-sdk-spec.md`.

If implementation behavior differs from these sources, treat it as an architecture discrepancy first.

## Documentation-First Mindset

Common wrong assumptions:
- "The UI currently calls this endpoint, so that is the intended contract."
- "This is deployment/config; a workaround is faster than re-checking specs."
- "The service exists, so it is wired into the real flow."

Correct posture:
- "I need to verify endpoint ownership in the relevant spec."
- "I need to trace the data flow end-to-end."
- "I need runtime evidence that this path executed as expected."

## Clarifying Questions Pattern

Ask early when docs and implementation diverge:
1. "Spec says X but implementation does Y. Which source should we treat as canonical for this change?"
2. "This service exists but has no active call path. Should integration be part of this task?"
3. "Docs indicate Merchant -> Client webhook flow, but code shows Client -> Client. Is that intentional?"

## Case Study: Webhook Ownership Error

Anti-pattern:
- UI called its own webhook path rather than receiving merchant-originated webhook events.

Why it causes defects:
- Violates trust boundary assumptions.
- Invalidates signature verification semantics.
- Hides architecture bugs as configuration noise.

Correct diagnostic sequence:
1. Read ACP webhook ownership requirements in spec.
2. Confirm sender/receiver in feature docs.
3. Verify request origin in runtime logs.
4. Fix flow ownership first, then evaluate deployment/config concerns.

## Runtime Verification Diligence

Static checks are necessary but insufficient for integration correctness.

### Blind Spots Static Analysis Misses

- Mock/hardcoded data path masquerading as real integration.
- Backend call executes but response is ignored in UI/state.
- Async state transitions show stale values during pending operations.
- Dead code path exists but is never invoked.
- Fallback values hide broken backend contracts.

### Questions Before Claiming "Works"

1. Is the data source real (network-backed) or fallback/local?
2. Is backend response consumed directly where expected?
3. What does the user see while pending?
4. What happens on failure, retry, timeout, and rollback?
5. What runtime evidence proves this path executed?

### Verification Methods (Most To Least Reliable)

1. Server logs (actual request paths/status codes)
2. Browser network inspection
3. Focused instrumentation/logging
4. Manual user-flow tests
5. Direct `curl`/API checks
6. Code reading alone (never sufficient)

## Common Deceptive Patterns

### Pattern 1: Local Calculation Disguised As Backend-Driven State

```tsx
// Deceptive
const total = calculateTotal(items);

// Better
const total = backendResponse.totals.find((t) => t.type === "total")?.amount;
```

### Pattern 2: Backend Call Result Ignored

```tsx
// Deceptive
await updateBackend(newItems);
setDisplayTotal(localCalculation(newItems));

// Better
const response = await updateBackend(newItems);
setDisplayTotal(response.total);
```

### Pattern 3: Fire-And-Forget Async State Mismatch

```tsx
// Deceptive
setItems(newItems);
notifyBackend(newItems);

// Better
setItems(newItems);
setIsPending(true);
await notifyBackend(newItems);
setIsPending(false);
```

### Pattern 4: Fallback Masks Contract Breakage

```tsx
// Deceptive
const price = response.price ?? calculateLocally(item);

// Better
if (response.price === undefined) {
  throw new Error("Backend did not return price");
}
const price = response.price;
```

## Completion Evidence Template

For behavior-changing work, report:
- Commands run
- Key status codes or test outcomes
- Log evidence proving path execution
- Failure-mode coverage
- Assumptions and residual risk

Example skeleton:

```text
Commands:
- <command 1>
- <command 2>

Results:
- HTTP 200 on create, HTTP 200 on update
- Verified merchant->client webhook request observed in logs

Failure coverage:
- Invalid signature returns expected error
- Timeout path surfaces user-visible retry state
```

## Maintenance

When new recurring failure patterns appear:
- Add diagnostic guidance here.
- Keep `AGENTS.md` concise and procedural.

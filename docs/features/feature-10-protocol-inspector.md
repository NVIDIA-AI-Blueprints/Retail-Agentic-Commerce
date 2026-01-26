# Feature 10: Multi-Panel Protocol Inspector UI

**Goal**: Build the "Glass Box" dashboard for observability.

## Panel Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Left Panel    │  Middle Panel   │  Right Panel    │
│                 │                 │                 │
│  Agent/Client   │   Business/     │  Chain of       │
│  Simulation     │   Retailer      │  Thought        │
│                 │   View          │  (Optional)     │
│  - Search       │                 │                 │
│  - Products     │  - JSON payload │  - Agent        │
│  - Checkout     │  - Session state│    reasoning    │
│                 │  - Protocol     │  - Tool calls   │
│                 │    interactions │  - Decisions    │
└─────────────────┴─────────────────┴─────────────────┘
```

## Tasks

- [x] Create three-panel layout component
- [x] **Left Panel (Client Agent)**: Integrate client simulator (Feature 9)
  - Streaming text animation for product suggestions
  - Staggered product card entrance animations
- [x] **Middle Panel (Merchant Server)**: 
  - Display real-time ACP protocol events
  - Show session state transitions
  - Timeline view with status indicators
- [x] **Right Panel (Agent Activity)**:
  - Display Promotion Agent decisions
  - Show input signals (inventory pressure, competition position)
  - Display reason codes and reasoning text
  - Expandable details for each decision
- [x] Add panel synchronization via shared context providers
- [x] Performance optimizations (memoized context, refs for callbacks)

## Implementation Details

The three-panel UI consists of:

| Panel | Component | Purpose |
|-------|-----------|---------|
| Client Agent | `AgentPanel` | User interaction, product selection, checkout |
| Merchant Server | `BusinessPanel` | ACP protocol events, session state |
| Agent Activity | `AgentActivityPanel` | Promotion agent decisions, reasoning |

Key hooks and providers:
- `useACPLog` / `ACPLogProvider` - Tracks ACP protocol events
- `useAgentActivityLog` / `AgentActivityLogProvider` - Tracks agent decisions
- `useCheckoutFlow` - State machine with integrated logging

## Acceptance Criteria

- [x] Three panels display simultaneously
- [x] Panels update in real-time
- [x] Agent decisions show input signals and reasoning
- [x] UI is responsive on large monitors
- [x] No performance lag when interacting with modals

---

[← Back to Feature Overview](./index.md)

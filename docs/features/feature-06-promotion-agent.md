# Feature 6: Promotion Agent (NAT)

**Goal**: Implement dynamic pricing agent using NVIDIA NeMo Agent Toolkit.

## Agent Behavior

The Promotion Agent reasons over competitor prices and inventory to calculate discounts while protecting margins.

**Logic**:
```
IF stock_count > threshold AND base_price > competitor_price:
    apply discount down to min_margin
```

## Tasks

- [x] Create NAT workflow for Promotion Agent
- [x] Implement query tools for agent:
  - Query `products` data (via mock data, DB integration pending)
  - Query `competitor_prices` data (via mock data, DB integration pending)
- [x] Define agent system prompt with pricing rules
- [x] Implement discount calculation logic
- [x] Ensure parameterized queries (mock data uses dict lookups)
- [x] Return discount in checkout session `line_items[].discount`
- [x] **ACP Integration** (3-Layer Hybrid Architecture):
  - [x] Layer 1: Deterministic computation in `services/promotion.py`
    - Compute inventory pressure signal (stock_count > 50 = HIGH)
    - Compute competition position signal (base_price vs competitor)
    - Filter allowed_actions by min_margin constraint
  - [x] Layer 2: REST API call to Promotion Agent (`agents/promotion.py`)
    - Async HTTP client with timeout
    - Fail-open behavior (NO_PROMO if agent unavailable)
  - [x] Layer 3: Deterministic execution
    - Apply ACTION_DISCOUNT_MAP to calculate discount cents
    - Validate against margin constraints
  - [x] Async integration in `create_checkout_session` and `update_checkout_session`
  - [x] Comprehensive test coverage (`tests/merchant/services/test_promotion.py`)

## Example Agent Flow

1. Agent receives product_id from checkout session
2. Agent calls `query_product_stock(product_id)` → returns stock_count
3. Agent calls `query_competitor_price(product_id)` → returns competitor prices
4. Agent reasons: "Stock is 200 units (high), competitor sells at $28, we sell at $32"
5. Agent calculates: "Can discount to $27.20 while maintaining 15% margin"
6. Agent returns discount amount

## Acceptance Criteria

- [x] Agent queries database via tool-calling
- [x] Discounts respect min_margin constraint
- [x] Reasoning trace is captured for UI display
- [x] Agent completes within latency target (<10s)
- [x] Fail-open behavior when agent unavailable
- [x] Line item includes promotion metadata (action, reason_codes, reasoning)

---

[← Back to Feature Overview](./index.md)

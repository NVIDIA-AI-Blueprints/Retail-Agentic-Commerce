# Promotion Agent

A strategy arbiter built with NVIDIA NeMo Agent Toolkit (NAT) that selects optimal promotion actions based on pre-computed business signals while protecting minimum profit margins.

## Architecture Overview

The Promotion Agent is the **LLM arbitration layer** in a hybrid deterministic + LLM architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Deterministic Computation                             │
│  - Query product data (stock_count, base_price, min_margin)     │
│  - Query competitor prices                                      │
│  - Compute signals (inventory_pressure, competition_position)   │
│  - Filter allowed_actions by margin constraints                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API call with context
┌─────────────────────────────────────────────────────────────────┐
│                Promotion Agent (nat serve)                      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: LLM Arbitration (THIS COMPONENT)                      │
│  - Receive pre-computed context                                 │
│  - Analyze business signals                                     │
│  - Select action from allowed_actions (classification only)     │
│  - Return decision with reason codes                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns action + reason_codes
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Deterministic Execution                               │
│  - Apply selected action using ACTION_DISCOUNT_MAP              │
│  - Calculate final price in cents                               │
│  - Re-validate against constraints                              │
│  - Fail closed if invalid                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle

> **The LLM never computes prices or numbers.**
> It selects a strategy from a pre-approved set.
> All math and enforcement are deterministic.

## Installation

```bash
# Navigate to the agent directory
cd src/agents/promotion-agent

# Create virtual environment with uv (recommended)
uv venv --python 3.12 .venv
source .venv/bin/activate

# Install with dev dependencies
uv pip install -e ".[dev]" --prerelease=allow

# Or with pip
pip install -e ".[dev]"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM | Required |

### Setting API Key

```bash
export NVIDIA_API_KEY=<your_nvidia_api_key>
```

## Usage

### Serving as REST Endpoint

The agent is designed to be served as a REST API that the ACP endpoint calls:

```bash
# Start the agent server
nat serve --config_file configs/config.yml --port 8002

# The agent will be available at http://localhost:8002
```

### Testing with Direct Input

For testing, provide a JSON context payload directly:

```bash
# Test with high inventory scenario
nat run --config_file configs/config.yml --input '{
  "product_id": "prod_3",
  "product_name": "Graphic Tee",
  "base_price_cents": 3200,
  "stock_count": 200,
  "min_margin": 0.18,
  "lowest_competitor_price_cents": 2800,
  "signals": {
    "inventory_pressure": "high",
    "competition_position": "above_market"
  },
  "allowed_actions": ["NO_PROMO", "DISCOUNT_5_PCT", "DISCOUNT_10_PCT", "DISCOUNT_15_PCT"]
}'

# Test with low inventory scenario
nat run --config_file configs/config.yml --input '{
  "product_id": "prod_4",
  "product_name": "Premium Tee",
  "base_price_cents": 4500,
  "stock_count": 25,
  "min_margin": 0.20,
  "lowest_competitor_price_cents": 4200,
  "signals": {
    "inventory_pressure": "low",
    "competition_position": "above_market"
  },
  "allowed_actions": ["NO_PROMO", "DISCOUNT_5_PCT", "DISCOUNT_10_PCT", "DISCOUNT_15_PCT"]
}'
```

### Example Output

```json
{
  "product_id": "prod_3",
  "action": "DISCOUNT_10_PCT",
  "reason_codes": ["HIGH_INVENTORY", "ABOVE_MARKET", "MARGIN_PROTECTED"],
  "reasoning": "High inventory and above-market pricing justify a 10% discount while maintaining margin constraints."
}
```

## Input Format

The agent receives a JSON payload with pre-computed context from the ACP endpoint:

```json
{
  "product_id": "prod_3",
  "product_name": "Graphic Tee",
  "base_price_cents": 3200,
  "stock_count": 200,
  "min_margin": 0.18,
  "lowest_competitor_price_cents": 2800,
  "signals": {
    "inventory_pressure": "high",
    "competition_position": "above_market"
  },
  "allowed_actions": ["NO_PROMO", "DISCOUNT_5_PCT", "DISCOUNT_10_PCT", "DISCOUNT_15_PCT"]
}
```

### Input Fields

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | Product identifier |
| `product_name` | string | Human-readable product name |
| `base_price_cents` | int | Original price in cents (context only) |
| `stock_count` | int | Current inventory units |
| `min_margin` | float | Minimum profit margin (0.18 = 18%) |
| `lowest_competitor_price_cents` | int | Lowest competitor price in cents |
| `signals.inventory_pressure` | string | "high" or "low" |
| `signals.competition_position` | string | "above_market", "at_market", or "below_market" |
| `allowed_actions` | list[string] | Actions filtered by margin constraints |

## Output Format

The agent returns a JSON decision:

```json
{
  "product_id": "prod_3",
  "action": "DISCOUNT_10_PCT",
  "reason_codes": ["HIGH_INVENTORY", "ABOVE_MARKET"],
  "reasoning": "High inventory pressure with competitive gap suggests moderate discount to move stock."
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | Echoed from input |
| `action` | string | Selected action from allowed_actions |
| `reason_codes` | list[string] | Business reasons for the decision |
| `reasoning` | string | Brief explanation |

## Available Actions

| Action | Description | Discount |
|--------|-------------|----------|
| `NO_PROMO` | No discount applied | 0% |
| `DISCOUNT_5_PCT` | 5% discount | 5% |
| `DISCOUNT_10_PCT` | 10% discount | 10% |
| `DISCOUNT_15_PCT` | 15% discount | 15% |
| `FREE_SHIPPING` | Free shipping benefit | 0% (price) |

## Signal Definitions

### Inventory Pressure

| Value | Condition | Interpretation |
|-------|-----------|----------------|
| `high` | stock_count > 50 | Urgency to move inventory |
| `low` | stock_count <= 50 | No urgency |

### Competition Position

| Value | Condition | Interpretation |
|-------|-----------|----------------|
| `above_market` | base_price > lowest_competitor | Priced higher than competition |
| `at_market` | base_price == lowest_competitor | Priced at market level |
| `below_market` | base_price < lowest_competitor | Already competitive |

## Decision Guidelines

| Signals | Recommended Action |
|---------|-------------------|
| HIGH inventory + ABOVE_MARKET | Favor discount to move inventory |
| HIGH inventory + AT_MARKET | Consider modest discount |
| HIGH inventory + BELOW_MARKET | NO_PROMO (already competitive) |
| LOW inventory | Favor NO_PROMO (no urgency) |
| Uncertain/conflicting | NO_PROMO (protect margins) |

## Reason Codes

| Code | Description |
|------|-------------|
| `HIGH_INVENTORY` | High stock pressure justifies discount |
| `LOW_INVENTORY` | Low stock, no urgency |
| `ABOVE_MARKET` | Priced above competitors |
| `AT_MARKET` | Priced at market level |
| `BELOW_MARKET` | Already competitive pricing |
| `MARGIN_PROTECTED` | Action respects margin constraints |
| `NO_URGENCY` | No business pressure to discount |

## Project Structure

```
promotion-agent/
├── pyproject.toml           # Package configuration
├── configs/
│   └── config.yml           # NAT workflow configuration (chat_completion)
└── README.md                # This file
```

## Type Definitions

Type definitions and constants are maintained in the ACP server at `src/merchant/services/promotion.py`:

- `PromotionAction` - Enum of allowed actions
- `ACTION_DISCOUNT_MAP` - Maps actions to discount percentages
- `InventoryPressure` - Signal enum for stock levels
- `CompetitionPosition` - Signal enum for price comparison
- `ReasonCode` - Standard reason codes
- `PromotionContextInput` - TypedDict for input format
- `PromotionDecisionOutput` - TypedDict for output format
- `STOCK_THRESHOLD` - Threshold for inventory pressure (50 units)

The ACP endpoint uses these for:
- Computing signals (`InventoryPressure`, `CompetitionPosition`)
- Filtering `allowed_actions` by `min_margin` using `ACTION_DISCOUNT_MAP`
- Applying the selected action deterministically (Layer 3)

The agent itself only needs the system prompt to understand the classification task.

## Development

### Code Quality

```bash
# Linting
ruff check .

# Formatting
ruff format .

# Type checking
pyright
```

### Adding New Actions

1. Add to `PromotionAction` enum in `src/merchant/services/promotion.py`
2. Add discount mapping to `ACTION_DISCOUNT_MAP` in `src/merchant/services/promotion.py`
3. Update system prompt in `configs/config.yml`
4. Add tests in `tests/merchant/services/test_promotion.py`

## Troubleshooting

### API Key Issues

Verify your API key is set:
```bash
echo $NVIDIA_API_KEY
```

### Model Not Available

Check available models at [NVIDIA NIM](https://build.nvidia.com/explore/discover) and update the model in `config.yml`.

### Invalid JSON Output

If the agent returns non-JSON output, check:
1. Temperature is set low (0.1) for deterministic responses
2. Input is valid JSON
3. `allowed_actions` list is not empty

## License

Part of the Retail Agentic Commerce project.

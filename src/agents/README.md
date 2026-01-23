# ACP Agents

NAT-powered agents for the Agentic Commerce Protocol (ACP) reference implementation. These agents provide intelligent decision-making capabilities for e-commerce operations using NVIDIA NeMo Agent Toolkit.

## Architecture Overview

All ACP agents follow a **3-layer hybrid architecture** that combines deterministic computation with LLM arbitration:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Deterministic Computation                             │
│  - Query data from database                                     │
│  - Compute signals and context                                  │
│  - Filter allowed options by business constraints               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API call with context
┌─────────────────────────────────────────────────────────────────┐
│                    NAT Agent (nat serve)                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: LLM Arbitration                                       │
│  - Receive pre-computed context                                 │
│  - Analyze business signals                                     │
│  - Select action or generate content (classification/generation)│
│  - Return decision with reasoning                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns decision/content
┌─────────────────────────────────────────────────────────────────┐
│                    ACP Endpoint (src/merchant)                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Deterministic Execution                               │
│  - Apply selected action                                        │
│  - Validate against constraints                                 │
│  - Fail closed if invalid                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle

> **The LLM never computes prices, performs calculations, or accesses databases directly.**
> It selects strategies from pre-approved sets or generates content from structured context.
> All math, data access, and enforcement are deterministic.

## Available Agents

| Agent | Config | Port | Purpose |
|-------|--------|------|---------|
| Promotion Agent | `configs/promotion.yml` | 8002 | Strategy arbiter for dynamic pricing |
| Post-Purchase Agent | `configs/post-purchase.yml` | 8003 | Multilingual shipping message generator |

## Installation

```bash
# Navigate to the agents directory
cd src/agents

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

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | API key for NVIDIA NIM | Yes |

### Setting API Key

```bash
export NVIDIA_API_KEY=<your_nvidia_api_key>
```

## Running Agents

### Promotion Agent

The Promotion Agent selects optimal promotion actions based on pre-computed business signals.

```bash
# Start as REST endpoint (for ACP integration)
nat serve --config_file configs/promotion.yml --port 8002

# Test with direct input
nat run --config_file configs/promotion.yml --input '{
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
```

**Example Output:**
```json
{
  "product_id": "prod_3",
  "action": "DISCOUNT_10_PCT",
  "reason_codes": ["HIGH_INVENTORY", "ABOVE_MARKET", "MARGIN_PROTECTED"],
  "reasoning": "High inventory and above-market pricing justify a 10% discount."
}
```

### Post-Purchase Agent

The Post-Purchase Agent generates multilingual shipping update messages based on brand persona and order context.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Order Lifecycle Event                        │
│         (order_confirmed → shipped → out_for_delivery → delivered)
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/merchant/services/post_purchase.py             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Build Message Request                                 │
│  - Load Brand Persona (company_name, tone, language)            │
│  - Gather Order Context (customer_name, product, tracking_url)  │
│  - Determine shipping status                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /generate with JSON context
┌─────────────────────────────────────────────────────────────────┐
│            Post-Purchase Agent (nat serve :8003)                │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: LLM Message Generation                                │
│  - Apply tone: friendly | professional | casual | urgent        │
│  - Generate in language: EN | ES | FR                           │
│  - Create subject line and message body                         │
│  - Sign with company name                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Returns {subject, message, language}
┌─────────────────────────────────────────────────────────────────┐
│              src/merchant/services/post_purchase.py             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Validate & Deliver                                    │
│  - Validate response format                                     │
│  - Fallback to templates if agent unavailable                   │
│  - Queue for webhook delivery (Feature 11)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Webhook Delivery (Future)                    │
│               POST to WEBHOOK_URL with signed payload           │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Start as REST endpoint (for ACP integration)
nat serve --config_file configs/post-purchase.yml --port 8003

# Test with direct input
nat run --config_file configs/post-purchase.yml --input '{
  "brand_persona": {
    "company_name": "Acme T-Shirts",
    "tone": "friendly",
    "preferred_language": "en"
  },
  "order": {
    "order_id": "order_xyz789",
    "customer_name": "John",
    "product_name": "Classic Tee",
    "tracking_url": "https://track.example.com/abc123",
    "estimated_delivery": "2026-01-28"
  },
  "status": "order_shipped"
}'
```

**Example Output:**
```json
{
  "order_id": "order_xyz789",
  "status": "order_shipped",
  "language": "en",
  "subject": "Your Classic Tee is on its way! 🚚",
  "message": "Hey John! Great news - your Classic Tee is on its way! 🚚\n\nTrack your package: https://track.example.com/abc123\n\nExpected delivery: January 28, 2026\n\n- The Acme T-Shirts Team"
}
```

## Agent Configuration Reference

### Promotion Agent (`configs/promotion.yml`)

**Workflow Type:** `chat_completion`

**Input Format:**

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

**Available Actions:**

| Action | Description | Discount |
|--------|-------------|----------|
| `NO_PROMO` | No discount applied | 0% |
| `DISCOUNT_5_PCT` | 5% discount | 5% |
| `DISCOUNT_10_PCT` | 10% discount | 10% |
| `DISCOUNT_15_PCT` | 15% discount | 15% |
| `FREE_SHIPPING` | Free shipping benefit | 0% (price) |

### Post-Purchase Agent (`configs/post-purchase.yml`)

**Workflow Type:** `chat_completion`

**Input Format:**

| Field | Type | Description |
|-------|------|-------------|
| `brand_persona.company_name` | string | Retailer's name |
| `brand_persona.tone` | string | "friendly", "professional", "casual", "urgent" |
| `brand_persona.preferred_language` | string | "en", "es", "fr" |
| `order.order_id` | string | Order identifier |
| `order.customer_name` | string | Customer's first name |
| `order.product_name` | string | Name of purchased product |
| `order.tracking_url` | string | Package tracking URL (optional) |
| `order.estimated_delivery` | string | ISO date format (optional) |
| `status` | string | Shipping status |

**Supported Tones:**

| Tone | Description |
|------|-------------|
| `friendly` | Warm, enthusiastic, uses emojis sparingly |
| `professional` | Formal, courteous, no emojis |
| `casual` | Relaxed, informal, may use emojis |
| `urgent` | Direct, action-oriented, time-sensitive |

**Shipping Statuses:**

| Status | Description |
|--------|-------------|
| `order_confirmed` | Order received and confirmed |
| `order_shipped` | Package shipped, tracking available |
| `out_for_delivery` | Package arriving today |
| `delivered` | Package delivered |

## Backend Integration

Each agent has a corresponding service module in `src/merchant/services/`:

| Agent | Service Module |
|-------|----------------|
| Promotion | `src/merchant/services/promotion.py` |
| Post-Purchase | `src/merchant/services/post_purchase.py` |

These service modules provide:
- **Enums** for actions, statuses, and options
- **TypedDicts** for input/output formats (contract with agent)
- **Async Client** for calling the agent REST API
- **Service Functions** for the 3-layer logic
- **Fail-Open Behavior** with fallback defaults

### Example: Using Promotion Service

```python
from src.merchant.services.promotion import (
    compute_promotion_context,
    call_promotion_agent,
    apply_promotion_action,
)

# Layer 1: Compute context
context = compute_promotion_context(db, product)

# Layer 2: Call agent
decision = await call_promotion_agent(context)

# Layer 3: Apply action
discount = apply_promotion_action(product.base_price, decision["action"])
```

### Example: Using Post-Purchase Service

```python
from src.merchant.services.post_purchase import (
    build_message_request,
    generate_shipping_message,
    ShippingStatus,
    MessageTone,
    SupportedLanguage,
)

# Build request
request = build_message_request(
    order_id="order_xyz789",
    customer_name="John",
    product_name="Classic Tee",
    status=ShippingStatus.ORDER_SHIPPED,
    company_name="Acme T-Shirts",
    tone=MessageTone.FRIENDLY,
    language=SupportedLanguage.ENGLISH,
    tracking_url="https://track.example.com/abc123",
)

# Generate message
response = await generate_shipping_message(request)
```

## Adding New Agents

To add a new NAT agent:

1. **Create config file** at `configs/<agent-name>.yml`
   - Define LLM configuration
   - Write comprehensive system prompt
   - Specify input/output JSON formats

2. **Create service module** at `src/merchant/services/<agent_name>.py`
   - Define enums for actions/options
   - Create TypedDicts for input/output
   - Implement async client class
   - Add service functions with fail-open behavior

3. **Update documentation**
   - Add to this README
   - Update `AGENTS.md` and `CLAUDE.md`
   - Update `docs/features.md` if implementing a planned feature

4. **Add configuration settings** (optional)
   - Add `<agent>_agent_url` and `<agent>_agent_timeout` to `src/merchant/config.py`

## Project Structure

```
src/agents/
├── pyproject.toml           # Shared dependencies for all agents
├── README.md                # This file
└── configs/
    ├── promotion.yml        # Promotion strategy arbiter
    └── post-purchase.yml    # Multilingual shipping messages
```

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

### Testing Agent Configs

```bash
# Validate config
nat validate --config_file configs/promotion.yml

# Run with verbose output
nat run --config_file configs/promotion.yml --input '...' --verbose
```

## Troubleshooting

### API Key Issues

Verify your API key is set:
```bash
echo $NVIDIA_API_KEY
```

### Model Not Available

Check available models at [NVIDIA NIM](https://build.nvidia.com/explore/discover) and update the model in the config file.

### Invalid JSON Output

If the agent returns non-JSON output, check:
1. Temperature is set low (0.1-0.3) for deterministic responses
2. Input is valid JSON
3. System prompt clearly specifies JSON-only output

### Connection Refused

Ensure the agent server is running:
```bash
# Check if server is running
curl http://localhost:8002/health

# Start server if not running
nat serve --config_file configs/promotion.yml --port 8002
```

## License

Part of the Retail Agentic Commerce project.

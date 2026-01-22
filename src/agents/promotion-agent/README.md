# Promotion Agent

A standalone agent built with NVIDIA NeMo Agent Toolkit (NAT) that calculates dynamic discounts based on inventory levels and competitor pricing while protecting minimum profit margins.

## Overview

The Promotion Agent implements the following pricing logic:

1. **Discount Eligibility**: Only apply discounts when:
   - Stock count > 50 units (high inventory)
   - Base price > lowest competitor price (priced above competition)

2. **Margin Protection**: Discounts never exceed the minimum margin constraint
   - Formula: `min_price = base_price * (1 - min_margin)`

3. **Competitive Pricing**: Target price undercuts lowest competitor by $1.00
   - Formula: `target_price = lowest_competitor_price - 100 cents`

4. **Final Price**: Maximum of target price and minimum price
   - Formula: `final_price = MAX(target_price, min_price)`

## Installation

```bash
# Navigate to the agent directory
cd src/agents/promotion-agent

# Create virtual environment with uv (recommended)
uv venv --python 3.12 .venv
source .venv/bin/activate

# Install with dev dependencies
uv pip install -e ".[dev]"

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

### Running the Agent

```bash
# Calculate discount for a specific product
nat run --config_file configs/config.yml --input "Calculate discount for product prod_3"

# With verbose output
nat run --config_file configs/config.yml --input "Calculate discount for prod_1" --verbose

# Query multiple products
nat run --config_file configs/config.yml --input "What discount should we offer for the Graphic Tee?"
```

### Example Queries

```bash
# By product ID
nat run --config_file configs/config.yml --input "Calculate discount for prod_3"

# By product name (agent will figure it out)
nat run --config_file configs/config.yml --input "Should we discount the Premium Tee?"

# Analysis request
nat run --config_file configs/config.yml --input "Analyze pricing for prod_1 considering competitor prices"
```

### Expected Output

The agent returns a JSON response with:

```json
{
  "product_id": "prod_3",
  "product_name": "Graphic Tee",
  "base_price_cents": 3200,
  "recommended_price_cents": 2700,
  "discount_cents": 500,
  "discount_percentage": 15.6,
  "reasoning": "High stock (200 units) and priced above competition ($32 vs $28). Applying discount to $27 to undercut lowest competitor while respecting 18% min margin.",
  "conditions_met": {
    "high_stock": true,
    "priced_above_competition": true
  }
}
```

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=data --cov=register -v

# Run specific test class
pytest tests/test_tools.py::TestDiscountCalculationLogic -v
```

## Project Structure

```
promotion-agent/
├── pyproject.toml           # Package config with NAT plugin entry point
├── register.py              # Custom NAT tool functions
├── configs/
│   └── config.yml           # Workflow configuration
├── data/
│   ├── __init__.py
│   └── mock_data.py         # Mock product and competitor data
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   └── test_tools.py        # Unit tests
└── README.md                # This file
```

## Custom Tools

### query_product_stock

Queries product information from the inventory:
- Product name
- Base price (in cents)
- Stock count
- Minimum margin constraint

### query_competitor_price

Queries competitor pricing for a product:
- List of competitors and their prices
- Lowest competitor price

## Mock Data

The agent uses mock data that mirrors the merchant database schema:

### Products

| ID | Name | Base Price | Stock | Min Margin |
|----|------|------------|-------|------------|
| prod_1 | Classic Tee | $25.00 | 100 | 15% |
| prod_2 | V-Neck Tee | $28.00 | 50 | 12% |
| prod_3 | Graphic Tee | $32.00 | 200 | 18% |
| prod_4 | Premium Tee | $45.00 | 25 | 20% |

### Competitor Prices

| Product | CompetitorA | CompetitorB | CompetitorC |
|---------|-------------|-------------|-------------|
| prod_1 | $22.00 | $24.00 | - |
| prod_2 | $26.00 | - | - |
| prod_3 | $28.00 | - | $30.00 |
| prod_4 | - | $42.00 | - |

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

### Adding New Tools

1. Create input schema (Pydantic BaseModel)
2. Create config class (inherits FunctionBaseConfig)
3. Implement function with @register_function decorator
4. Add to config.yml functions section
5. Add to workflow tool_names list

See `register.py` for examples.

## Troubleshooting

### "Function not found" Error

Ensure the package is installed in editable mode:
```bash
pip install -e .
```

### API Key Issues

Verify your API key is set:
```bash
echo $NVIDIA_API_KEY
```

### Model Not Available

Check available models at [NVIDIA NIM](https://build.nvidia.com/explore/discover) and update `NIM_MODEL_NAME`.

## License

Part of the Retail Agentic Commerce project.

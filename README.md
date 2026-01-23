# NVIDIA AI Blueprint: Retail Agentic Commerce

<div align="center">

![NVIDIA Logo](https://avatars.githubusercontent.com/u/178940881?s=200&v=4)

</div>

A **reference implementation** of the **Agentic Commerce Protocol (ACP)**: a retailer-operated checkout system that enables agentic negotiation while maintaining merchant control.

> **Third-Party Software Notice**
> This project may download and install additional third-party open source software projects.
> Please review the license terms of these open source projects before use.

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+ (for UI)
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Installation

```bash
git clone https://github.com/NVIDIA/Retail-Agentic-Commerce.git
cd Retail-Agentic-Commerce
cp env.example .env
uv sync
```

### Environment Variables

Copy `env.example` to `.env`. Most variables have sensible defaults and work out of the box:

```env
# Required - get your key from https://build.nvidia.com/settings/api-keys
NVIDIA_API_KEY=nvapi-xxx   # For agents to call Nemotron Nano v3

# Optional - these have working defaults
API_KEY=your-api-key                        # Merchant API auth
PSP_API_KEY=psp-api-key-12345               # PSP service auth
PROMOTION_AGENT_URL=http://localhost:8002
POST_PURCHASE_AGENT_URL=http://localhost:8003
```

> **Note**: `NVIDIA_API_KEY` is the only variable you must set. It enables the NAT agents (Promotion and Post-Purchase) to communicate with the nemontron-nano-v3 public endpoint.

### Run the Services

```bash
# Merchant API (port 8000)
uvicorn src.merchant.main:app --reload

# PSP Service (port 8001)
uvicorn src.payment.main:app --reload --port 8001

# NAT Agents (from src/agents/)
cd src/agents
uv pip install -e ".[dev]" --prerelease=allow
nat serve --config_file configs/promotion.yml --port 8002      # Promotion Agent
nat serve --config_file configs/post-purchase.yml --port 8003  # Post-Purchase Agent

# Frontend UI (port 3000)
cd src/ui
cp env.example .env.local  # Configure API endpoints
pnpm install && pnpm run dev
```

### Verify

```bash
curl http://localhost:8000/health  # Merchant API
curl http://localhost:8001/health  # PSP Service
# Visit http://localhost:3000 for the UI
```

## UI Integration

The frontend connects to both the Merchant API and PSP Service for end-to-end checkout:

1. **Product Selection** - User selects a product from the grid
2. **Session Creation** - UI calls `POST /checkout_sessions` to create a checkout session
3. **Shipping Selection** - UI calls `POST /checkout_sessions/{id}` to update shipping
4. **Payment Delegation** - UI calls PSP `POST /agentic_commerce/delegate_payment` to get a vault token
5. **Checkout Completion** - UI calls `POST /checkout_sessions/{id}/complete` with the vault token

### Environment Variables (UI)

The UI has its own environment file at `src/ui/.env.local`. Copy from `src/ui/env.example` - the defaults work out of the box for local development.

## API Documentation

- **Merchant API**: http://localhost:8000/docs
- **PSP Service**: http://localhost:8001/docs

## Documentation

| Document | Description |
|----------|-------------|
| `docs/PRD.md` | Product requirements |
| `docs/architecture.md` | System architecture |
| `docs/acp-spec.md` | ACP protocol specification |
| `docs/features.md` | Feature breakdown and status |
| `src/agents/README.md` | NAT Agents documentation |
| `CLAUDE.md` | Development guide for AI assistants |
| `AGENTS.md` | Quick reference for contributors |

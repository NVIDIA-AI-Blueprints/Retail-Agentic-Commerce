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

### Run the Services

```bash
# Merchant API (port 8000)
uvicorn src.merchant.main:app --reload

# PSP Service (port 8001)
uvicorn src.payment.main:app --reload --port 8001

# Frontend UI (port 3000)
cd src/ui
cp env.example .env.local  # Configure API endpoints
pnpm install && pnpm run dev
```

### Verify

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
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

Copy `src/ui/env.example` to `src/ui/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PSP_URL=http://localhost:8001
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_PSP_API_KEY=psp-api-key-12345
NEXT_PUBLIC_API_VERSION=2026-01-16
```

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
| `CLAUDE.md` | Development guide for AI assistants |
| `AGENTS.md` | Quick reference for contributors |

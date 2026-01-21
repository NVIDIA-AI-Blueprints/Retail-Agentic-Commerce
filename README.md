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
cd src/ui && pnpm install && pnpm run dev
```

### Verify

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
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

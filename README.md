# NVIDIA AI Blueprint: Retail Agentic Commerce

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

A reference implementation of the **Agentic Commerce Protocol (ACP)**: a retailer-operated checkout system that enables agentic negotiation while maintaining merchant control.

<div align="center">

![NVIDIA Logo](https://avatars.githubusercontent.com/u/178940881?s=200&v=4)

</div>

## What is ACP?

ACP lets AI agents negotiate with merchants on behalf of users. The merchant stays in control while agents can:

- Request promotions and discounts
- Get personalized recommendations
- Complete checkout with delegated payments
- Receive multilingual post-purchase updates

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) package manager
- Docker (optional, for Recommendation Agent)

### 1. Clone and Configure

```bash
git clone https://github.com/NVIDIA/Retail-Agentic-Commerce.git
cd Retail-Agentic-Commerce
cp env.example .env
```

Edit `.env` and add your NVIDIA API key ([get one here](https://build.nvidia.com/settings/api-keys)):

```env
NVIDIA_API_KEY=nvapi-xxx
```

### 2. Backend Services (Merchant, PSP, Apps SDK)

Create and activate a virtual environment, then start the services in separate terminals:

```bash
# Setup (run once)
uv venv
source .venv/bin/activate
uv sync
```

```bash
# Terminal 1: Merchant API (port 8000)
source .venv/bin/activate
uvicorn src.merchant.main:app --reload
```

```bash
# Terminal 2: PSP Service (port 8001)
source .venv/bin/activate
uvicorn src.payment.main:app --reload --port 8001
```

```bash
# Terminal 3: Apps SDK MCP Server (port 2091)
source .venv/bin/activate
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### 3. NAT Agents (Separate Environment)

The agents use their own virtual environment:

```bash
# Setup (run once)
cd src/agents
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]" --prerelease=allow
```

```bash
# Terminal 4: Promotion Agent (port 8002)
cd src/agents
source .venv/bin/activate
nat serve --config_file configs/promotion.yml --port 8002
```

```bash
# Terminal 5: Post-Purchase Agent (port 8003)
cd src/agents
source .venv/bin/activate
nat serve --config_file configs/post-purchase.yml --port 8003
```

```bash
# Terminal 6: Recommendation Agent (port 8004) - requires Docker
cd src/agents
source .venv/bin/activate
nat serve --config_file configs/recommendation-ultrafast.yml --port 8004
```

> **Note**: The Recommendation Agent requires Milvus. See [Optional: Milvus Setup](#optional-milvus-setup) below.

### 4. Frontend

```bash
# Terminal 7: Demo UI (port 3000)
cd src/ui
pnpm install
pnpm dev
```

```bash
# Terminal 8: Apps SDK Widget (port 3001) - for development
cd src/apps_sdk/web
pnpm install
pnpm dev
```

### 5. Verify

```bash
curl http://localhost:8000/health  # Merchant API
curl http://localhost:8001/health  # PSP Service
curl http://localhost:2091/health  # Apps SDK
```

Visit **http://localhost:3000** to see the demo UI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Agent                             │
│                    (ChatGPT, Claude, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Apps SDK MCP Server                         │
│                        (Port 2091)                              │
│   ┌─────────────┬─────────────────┬────────────────────────┐    │
│   │ get-recs    │ add-to-cart     │ checkout               │    │
│   └─────────────┴─────────────────┴────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Merchant API                               │
│                        (Port 8000)                              │
│   ┌─────────────┬─────────────────┬────────────────────────┐    │
│   │ Products    │ Checkout        │ Orders                 │    │
│   │ Sessions    │ Promotions      │ Recommendations        │    │
│   └─────────────┴─────────────────┴────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌────────────┐       ┌────────────┐       ┌────────────┐
   │ Promotion  │       │ Post-      │       │ Recommend  │
   │ Agent      │       │ Purchase   │       │ Agent      │
   │ (8002)     │       │ (8003)     │       │ (8004)     │
   └────────────┘       └────────────┘       └────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Merchant API | 8000 | ACP checkout, products, orders |
| PSP Service | 8001 | Payment delegation, vault tokens |
| Apps SDK | 2091 | MCP server for AI agents |
| Promotion Agent | 8002 | Discount strategy (NAT) |
| Post-Purchase Agent | 8003 | Multilingual messages (NAT) |
| Recommendation Agent | 8004 | Personalized recs (requires Docker) |

## API Docs

Interactive docs available when services are running:

- **Merchant API**: http://localhost:8000/docs
- **PSP Service**: http://localhost:8001/docs
- **Apps SDK**: http://localhost:2091/docs

## Project Structure

```
src/
├── merchant/          # Merchant API (FastAPI)
├── payment/           # PSP Service (FastAPI)
├── apps_sdk/          # MCP Server + Widget
├── agents/            # NAT Agent configs
└── ui/                # Demo UI (Next.js)

docs/
├── architecture.md    # System design
├── features.md        # Feature status
└── specs/             # Protocol specs
```

## Optional: Milvus Setup

The Recommendation Agent requires Milvus for vector search. Start it before running the agent:

```bash
# Start Milvus (from project root)
docker compose up -d

# Verify Milvus is running
curl -s http://localhost:9091/healthz

# Seed the product catalog (from agents env)
cd src/agents
source .venv/bin/activate
uv run python scripts/seed_milvus.py
```

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our code standards
4. **Run tests** to ensure nothing is broken
5. **Submit a Pull Request**

### Code Standards

```bash
# Backend (Python)
ruff check src/ tests/
ruff format src/ tests/
pyright src/
pytest tests/ -v

# Frontend (TypeScript)
cd src/ui
pnpm lint
pnpm typecheck
pnpm test:run
```

See [AGENTS.md](AGENTS.md) for detailed development guidelines.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and data flow |
| [Features](docs/features.md) | Feature breakdown and status |
| [ACP Spec](docs/specs/acp-spec.md) | Protocol specification |
| [Apps SDK](src/apps_sdk/README.md) | MCP server documentation |
| [NAT Agents](src/agents/README.md) | Agent configuration guide |

## Getting Help

- **Issues**: [Open an issue](https://github.com/NVIDIA/Retail-Agentic-Commerce/issues) for bugs or feature requests
- **Security**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities

## License

This project is licensed under Apache 2.0 - see [LICENSE](LICENSE) for details.

> **Third-Party Software Notice**: This project may download and install additional third-party open source software projects. Review the license terms of these projects before use.

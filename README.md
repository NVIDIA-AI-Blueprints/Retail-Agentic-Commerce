# NVIDIA AI Blueprint: Retail Agentic Commerce

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

<div align="center">

![NVIDIA Logo](https://avatars.githubusercontent.com/u/178940881?s=200&v=4)

</div>

A reference implementation of the Agentic Commerce Protocol (ACP) and Universal Commerce Protocol (UCP), built for merchant-controlled checkout, payments, and agent orchestration.

## Architecture

![Shopping Assistant Diagram](docs/agentic-commerce-diagram.jpeg)

## What You Get

- Merchant API (ACP + UCP discovery/A2A)
- PSP service for delegated payment flows
- Apps SDK MCP server + widget
- NAT agents for promotion, recommendations, search, and post-purchase messaging
- Demo UI with protocol and agent activity panels

## Architecture (Default Deployment)

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        CA[🤖 Client Agent]
        subgraph Webhooks["UI Webhook Receivers"]
            WH_ACP["/api/webhooks/acp"]
            WH_UCP["/api/webhooks/ucp"]
            BRIDGE["Webhook → Agent Activity Bridge"]
        end
    end

    subgraph Integration["Integration Options"]
        direction LR
        subgraph SDK["Apps SDK Layer"]
            MCP["📦 Apps SDK MCP Server<br/>(Port 2091)"]
            subgraph tools["Entry Point"]
                T1["search-products<br/>(returns widget)"]
            end
            WIDGET["🛒 Autonomous Widget<br/>(cart, checkout, recs)"]
        end

        subgraph Native["Native Protocol Layer"]
            ACP["🔗 ACP REST Transport"]
            UCP["🔗 UCP A2A Transport"]
            subgraph endpoints["Protocol Endpoints"]
                E1["ACP: /checkout_sessions/*"]
                E2["UCP: /.well-known/ucp"]
                E3["UCP: /.well-known/agent-card.json"]
                E4["UCP: /a2a (message/send)"]
            end
        end
    end

    subgraph Backend["Backend Services"]
        MERCHANT["🏪 Merchant API<br/>(Port 8000)"]
        PSP["💳 PSP Service<br/>(Port 8001)"]
        
        subgraph merchant_features["Merchant Features"]
            M1[Products & Sessions]
            M2[Checkout & Promotions]
            M3[Orders & Recommendations]
        end
        
        subgraph psp_features["PSP Features"]
            P1[Payment Delegation]
            P2[Vault Tokens]
            P3[Idempotency]
        end
    end

    subgraph Agents["NAT Agents"]
        PROMO["🎯 Promotion Agent<br/>(Port 8002)"]
        POST["📨 Post-Purchase Agent<br/>(Port 8003)"]
        RECS["🔍 Recommendation Agent<br/>(Port 8004)"]
        SEARCH["🔎 Search Agent<br/>(Port 8005)"]
    end

    subgraph NIMs["NVIDIA NIMs"]
        LLM["🧠 Nemotron Nano LLM<br/>(Port 8010)"]
        EMBED["📐 NV-EmbedQA-E5<br/>(Port 8011)"]
    end

    subgraph Data["Data Stores"]
        SQLITE[("🗄️ SQLite<br/>Application DB")]
        MILVUS[("🧠 Milvus<br/>Vector DB")]
    end

    CA -->|MCP| MCP
    CA -->|REST| ACP
    CA -->|A2A JSON-RPC| UCP
    MCP -.->|loads| WIDGET
    WIDGET -->|MCP tools| MCP
    MCP --> MERCHANT
    ACP --> E1
    UCP --> E2
    UCP --> E3
    UCP --> E4
    E1 --> MERCHANT
    E4 --> MERCHANT
    MERCHANT --> PSP
    MERCHANT --> PROMO
    MERCHANT --> POST
    MERCHANT --> RECS
    MERCHANT --> SEARCH
    MERCHANT --> SQLITE
    MERCHANT -->|ACP post-purchase webhook| WH_ACP
    MERCHANT -->|UCP order webhook| WH_UCP
    WH_ACP --> BRIDGE
    WH_UCP --> BRIDGE
    BRIDGE --> CA
    PROMO --> LLM
    POST --> LLM
    RECS --> LLM
    RECS --> EMBED
    SEARCH --> LLM
    SEARCH --> EMBED
    EMBED --> MILVUS
    RECS --> MILVUS
    SEARCH --> MILVUS
```

## Quick Start (Cursor, Codex, Claude Code)

This is the recommended path. It does not require local NIM containers.

### Prerequisites

- Python 3.12+
- [uv](https://astral.sh/uv) package manager
- [Node.js 18+](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/)
- Docker 24+ and Docker Compose v2
- NVIDIA API key ([create one](https://build.nvidia.com/settings/api-keys))

### 1. Clone and Configure

```bash
git clone https://github.com/NVIDIA/Retail-Agentic-Commerce.git
cd Retail-Agentic-Commerce
cp env.example .env
```

Update `.env`:

```env
NVIDIA_API_KEY=nvapi-xxx
```

On Cursor, Codex or Claude Code simply run: `/setup`

## Manual Deployment Options

| Mode | Description | Guide |
|------|-------------|-------|
| **Docker** (recommended) | Full stack in containers via Docker Compose | [Docker Deployment](deploy/docker-deployment.md) |
| **Local Development** | Services on host, automated via `install.sh` | [Local Development](deploy/local-development.md) |

Quick local start:

```bash
./install.sh   # install deps + start all 8 services
./stop.sh      # stop everything
```
## Hardware Requirements (Local NIM Deployment)

Local NIM deployment requires NVIDIA GPUs to host the inference models. The following table summarizes the models and their GPU requirements:

| Model | Purpose | Minimum GPU | Recommended GPU |
|-------|---------|-------------|-----------------|
| [Nemotron-Nano-30B-A3B](https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b) | LLM — prompt planning, recommendations, search, promotions | 1× A100 (80 GB) | 1× H100 (80 GB) |
| [NV-EmbedQA-E5-v5](https://build.nvidia.com/nvidia/nv-embedqa-e5-v5) | Embedding — semantic search and product retrieval | 1× A100 (80 GB) | 1× H100 (80 GB) |

**Total:** 2× A100 (80 GB) minimum, 2× H100 (80 GB) recommended for best performance.

> **Note:** These requirements apply only to self-hosted local NIM deployment. The default deployment uses public NVIDIA API endpoints and does not require any GPU hardware.

## Optional: Local NIM Deployment (GPU)

Only needed for self-hosted local inference. The default deployment already works with public endpoints.

For step-by-step instructions (prerequisites, GPU setup, NIM containers, validation), see the **[Local NIM Deployment Notebook](deploy/1_Deploy_Agentic_Commerce.ipynb)**.

## Project Structure

```text
src/
├── merchant/      # Merchant API (FastAPI)
├── payment/       # PSP service (FastAPI)
├── apps_sdk/      # MCP server + widget
├── agents/        # NAT agents and configs
└── ui/            # Next.js demo UI

deploy/
├── docker-deployment.md
├── local-development.md
└── 1_Deploy_Agentic_Commerce.ipynb

docs/
├── architecture.md
├── features/
└── specs/
```

## Documentation

- [Docker Deployment](deploy/docker-deployment.md)
- [Local Development](deploy/local-development.md)
- [Architecture](docs/architecture.md)
- [Feature Breakdown](docs/features/index.md)
- [ACP Spec](docs/specs/acp-spec.md)
- [UCP Spec](docs/specs/ucp-spec.md)
- [Apps SDK Spec](docs/specs/apps-sdk-spec.md)
- [Agent Integration](src/agents/README.md)

## License

GOVERNING TERMS: The Blueprint scripts are governed by Apache License, Version 2.0, and enables use of separate open source and proprietary software governed by their respective licenses: [Nemotron-Nano-V3](https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/nemotron-3-nano?version=1.7.0), (ii) MIT license for [NV-EmbedQA-E5-v5](https://build.nvidia.com/nvidia/nv-embedqa-e5-v5).

This project will download and install additional third-party open source software projects. Review the license terms of these open source projects before use, found in [License-3rd-party.txt](/LICENSE-3rd-party.txt).

Use of the product catalog data in the retail agentic commerce is governed by the terms of the [NVIDIA Data License for Retail Agentic Commerce](/LICENSE-assets.txt) (2026).
### 🏗️  Fullstack Architecture Document

**Version:** 1.2

**Status:** LLM Specifications Added

**Model Focus:** Agentic Reasoning & Tool-Calling

---

## 1. Updated Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| --- | --- | --- | --- | --- |
| **Primary LLM** | **NVIDIA Nemotron-3-Nano-30B** | **v3 (Dec 2025)** | Agent Core Logic | Sparse MoE design for high inference throughput. |
| **Language** | Python | **3.12+** | Backend logic & NAT | Native NAT and NeMo runtime support. |
| **Agentic Framework** | NeMo Agent Toolkit | 1.3.1+ | Multi-agent workflows | Built-in support for tool-calling, RAG, and reasoning trace. |
| **Inference Engine** | **NVIDIA NIM / TensorRT-LLM** | 25.11+ | Optimized Execution | Configurable: local Docker or public NVIDIA API endpoint. |
| **Embedding Model** | **NVIDIA NV-EmbedQA-E5-v5** | latest | RAG for Recommendations | Semantic product search for ARAG retrieval pipeline. |
| **Vector Database** | **Milvus** | 2.3+ | Product Embeddings | Stores product catalog embeddings for RAG-based recommendation retrieval. |
| **Client Agent Simulator** | Static Simulator | n/a | Client simulator | Simulates product search ("find t-shirts") → displays 4 products → user clicks to start ACP checkout. |
| **Client UI Framework** | React | 18+ | Multi-panel Inspector UI | Component model for three-panel Protocol Inspector (Agent/Business/CoT views). |
| **Client App Framework** | Next.js | 14+ | Client UI | App Router for the simulator UI + Multi-Panel Protocol Inspector. |
| **Component Library** | shadcn/ui | latest | Client UI | Modern accessible primitives to build a polished demo UI fast. |
| **Payments (PSP)** | PSP service + SQLite | demo | Delegated payments | Vault token minting (`vt_...`), idempotency, payment intents (`pi_...`) that consume tokens. |

---

### Apps SDK Integration Components

The Apps SDK mode provides an alternative merchant-controlled checkout experience:

| Component | Technology | Purpose |
| --- | --- | --- |
| **Tab Switcher** | React Component | Toggle between Native ACP and Apps SDK modes |
| **Merchant Iframe** | HTML/React in iframe | Merchant-owned UI for product display and cart |
| **Simulated window.openai** | postMessage Bridge | Communication between iframe and parent for tool calls |
| **Recommendations API** | Next.js API Route | Proxy to ARAG agent for 3 personalized recommendations |
| **Shopping Cart** | React State + localStorage | Multi-item cart (unlike single-product native mode) |
| **Loyalty Display** | React Component | Pre-authenticated user with points balance |

### Apps SDK MCP Server Stack

For ChatGPT integration testing and production deployment:

| Component | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **MCP Server** | FastMCP (Python) | 1.0+ | Tool registration and handling for ChatGPT |
| **Widget Bundle** | Vite + React | latest | Builds HTML widget files for ChatGPT rendering |
| **Tunnel** | ngrok | latest | Exposes local MCP server to ChatGPT for testing |
| **Hosting** | Vercel / Alpic | n/a | Production deployment with HTTPS and CDN |

### Testing Modes

The Apps SDK is architected for three testing environments per [OpenAI guidelines](https://developers.openai.com/apps-sdk/deploy):

| Mode | ChatGPT | MCP Server | Purpose |
| --- | --- | --- | --- |
| **Standalone** | Simulated | N/A (postMessage) | Local development without ChatGPT |
| **Integration** | Real | ngrok tunnel | Pre-production testing in ChatGPT |
| **Production** | Real | Vercel/Alpic | Public deployment |

```bash
# Standalone (simulated ChatGPT)
cd src/ui && pnpm run dev
# Access http://localhost:3000, switch to Apps SDK tab

# Integration (real ChatGPT via ngrok)
cd src/apps-sdk && npm run dev  # MCP server on :2091
ngrok http 2091                  # Tunnel to ChatGPT
# Configure ngrok URL in ChatGPT Settings → Connectors
```

#### Apps SDK Communication Flow

```
┌─────────────────────┐                    ┌─────────────────────┐
│   Parent Window     │                    │   Merchant Iframe   │
│   (Client Agent)    │                    │   (/merchant-app)   │
├─────────────────────┤                    ├─────────────────────┤
│                     │  INIT_MERCHANT_APP │                     │
│                     │ ──────────────────▶│ Receives user data  │
│                     │   (user, theme)    │ & recommendations   │
│                     │                    │                     │
│                     │                    │ User adds to cart   │
│                     │                    │ User clicks checkout│
│                     │                    │                     │
│                     │     CALL_TOOL      │                     │
│  Receives checkout  │◀────────────────── │ callTool('checkout')│
│  request            │   (cart, points)   │                     │
│                     │                    │                     │
│  Triggers ACP flow: │                    │                     │
│  - Create session   │                    │                     │
│  - Delegate payment │                    │                     │
│  - Complete checkout│                    │                     │
│                     │                    │                     │
│                     │    TOOL_RESULT     │                     │
│                     │ ──────────────────▶│ Shows confirmation  │
│                     │   (orderId)        │                     │
└─────────────────────┘                    └─────────────────────┘
```

---

### ARAG Recommendation Components

The Recommendation Agent uses an **Agentic Retrieval Augmented Generation (ARAG)** architecture with the following components:

| Component | Technology | Purpose |
| --- | --- | --- |
| **Embedder** | NV-EmbedQA-E5-v5 | Generates product embeddings for semantic search |
| **Vector Store** | Milvus | Stores and retrieves product embeddings |
| **User Understanding Agent** | Nemotron via NAT | Infers buyer preferences from session context |
| **NLI Agent** | Nemotron via NAT | Scores semantic alignment between products and intent |
| **Context Summary Agent** | Nemotron via NAT | Synthesizes filtered candidates into focused context |
| **Item Ranker Agent** | Nemotron via NAT | Produces final ranked recommendations |

This multi-agent approach achieves **42% improvement in NDCG@5** over vanilla RAG according to [ARAG research (SIGIR 2025)](https://arxiv.org/pdf/2506.21931).

---

### NIM Deployment Configuration

The inference engine is **configurable** via environment variables:

```env
# Option 1: NVIDIA hosted API
NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
NVIDIA_API_KEY=nvapi-xxx

# Option 2: Local Docker container
NIM_ENDPOINT=http://localhost:8000/v1
NVIDIA_API_KEY=local
```

---

### PSP DB schema (demo)

- **Tables**
  - **`vault_tokens`**: `id (vt_...)`, `created`, `payment_method (json)`, `allowance (json: max_amount, currency, expires_at, merchant_id, reason=one_time, checkout_session_id)`, `risk_signals (json)`, `metadata (json)`, `idempotency_key (unique)`, `request_id`, `status (active|consumed)`
  - **`idempotency_store`**: `idempotency_key (pk)`, `request_hash`, `response_status`, `response_body`, `created_at`
  - **`payment_intents`**: `id (pi_...)`, `vault_token_id (fk)`, `status (pending→completed)`, `amount`, `currency`, `merchant_id?`, `metadata?`, `created`, `completed_at?`

- **Lifecycle**
  - `vault_tokens.status`: **active** → **consumed** after a successful `payment_intents` creation/processing.

## 2. Strategic LLM Implementation Details

The **Nemotron-3-Nano** model provides three key capabilities that directly support our ACP requirements:

* **Reasoning Trace (Thinking Mode):** The model natively generates a "reasoning trace" before concluding. We will pipe this trace directly to the **"Protocol Inspector" UI** to show exactly *how* the Promotion Agent decided to beat a competitor's price.
* **Agentic Tool Use:** This model is fine-tuned for **multi-step tool use**. It will excel at our **SQLiteQueryTool**, translating natural language intents into the precise SQL joins we defined earlier.
* **Multilingual Native Support:** It supports English, Spanish, and French natively. This allows the **Post-Purchase Agent** to generate shipping updates in the user's preferred language without needing a separate translation layer.

Additionally, the **Client Agent Simulator** uses static, pre-defined flows with a hardcoded catalog of 4 products to simulate user-like behavior:
1. User enters a search prompt (e.g., "find some t-shirts")
2. Simulator displays 4 product cards with images and prices
3. User clicks on a product to initiate the ACP checkout flow

---

## 3. High-Level Project Diagram (Updated)

---

## 4. Latency Guardrail (LLM Optimization)

To ensure fast response times (target <10s for typical operations):

* **Parallel Execution:** We will leverage `asyncio` to prompt the Nemotron instances simultaneously for the Promotion and Recommendation tasks.
* **Quantization (FP8):** We will use the **FP8 quantized version** of the model to achieve up to **3.3× higher throughput** compared to dense models, ensuring rapid responses.

---

## 5. Global Webhook Configuration

Post-purchase events (shipping updates, order status changes) are delivered to a **single global webhook URL** configured at the application level:

```env
WEBHOOK_URL=https://your-client.example.com/webhooks/acp
WEBHOOK_SECRET=whsec_xxx
```

The Post-Purchase Agent publishes events to this endpoint using the configured **Brand Persona**.

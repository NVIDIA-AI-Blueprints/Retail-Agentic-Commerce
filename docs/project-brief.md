# Project Brief: Agentic Commerce Blueprint

## 1. Executive Summary

* **Product Concept**: A headless commerce middleware and reference architecture that enables merchants to integrate with the **Agentic Commerce Protocol (ACP)** and **Universal Commerce Protocol (UCP)** while layering in "Merchant Intelligence" via the **NVIDIA NeMo Agent Toolkit (NAT)**.
* **Primary Problem**: Standard e-commerce backends are passive and cannot effectively "negotiate" or "reason" during a conversational checkout with AI agents.
* **Proposed Solution**: A Python **3.12+**-based (FastAPI) middleware that acts as a relational, intelligent bridge between agentic clients and existing merchant data.
* **Key Value Proposition**: Demonstrates a "Glass Box" approach to agentic commerce, where business logic (discounts, recommendations, loyalty) is optimized by autonomous agents in real-time.
* **Protocol Support**: Dual-protocol architecture supporting both ACP and UCP:
  * **ACP**: OpenAI's Agentic Commerce Protocol for delegated payments
  * **UCP**: Industry-standard Universal Commerce Protocol with capability negotiation
* **Demo Client (Client Agent Simulator)**: A static simulator with pre-populated products that can:
  * Accept search prompts (e.g., "find some t-shirts") and display product cards via RAG-powered Search Agent
  * Allow users to click a product to initiate ACP/UCP checkout
  * Uses a **PSP** component for delegated payments (vault token `vt_...` → payment intent `pi_...`).

## 2. UI Vision

The demo features a **multi-panel Protocol Inspector** that provides real-time visibility into the agentic commerce flow:

* **Left Panel (Client Agent Simulation)**: Shows the simulated customer experience with search input, product cards, and checkout flow
* **Middle Panel (Merchant Server View)**: Displays merchant-side activity including JSON payloads, session state, and **ACP/UCP protocol tabs** to toggle between protocols
* **Right Panel (Agent Activity)**: Shows real-time agent reasoning traces from NeMo Agent Toolkit when agents are triggered (promotion decisions, recommendations, etc.)

This "glass box" approach makes the invisible mechanics of agentic commerce visible and educational.

### Apps SDK Mode

The Client Agent panel includes a **tab switcher** to toggle between two checkout experiences:

| Mode | Description |
|------|-------------|
| **Native** | Client agent controls UI, single product checkout, ACP/UCP protocol toggle |
| **Apps SDK** | Merchant controls UI via iframe, multi-item cart, ARAG recommendations |

The Apps SDK mode demonstrates how merchants can maintain complete UI control while leveraging the same ACP payment infrastructure. Key features:

* **Merchant-Owned Iframe**: HTML widget served from Apps SDK MCP server, fully controlled by merchant
* **RAG Product Search**: Natural language product search powered by Search Agent
* **ARAG Recommendations**: 3 personalized cross-sell items in carousel format
* **Shopping Cart**: Add multiple items before checkout (vs single product in native)
* **Loyalty Points**: Pre-authenticated user with points balance display
* **Same Payment Flow**: Uses identical ACP + PSP payment infrastructure

## 3. Problem Statement

* **Current State**: Merchants struggle to maintain their role as the "Merchant of Record" when transactions occur within third-party AI interfaces.
* **Impact**: Loss of dynamic pricing control, missed cross-sell opportunities, and a disconnected post-purchase experience.
* **Urgency**: As "Agentic Discovery" becomes the primary search mode, retailers need a blueprint to move from "searchable" to "transaction-ready" without sacrificing profit margins.

## 4. Proposed Solution & Intelligent Agents

The solution implements ACP checkout endpoints, UCP checkout endpoints with capability negotiation, and orchestrates four specialized NAT agents:

| Agent | Port | Core Task | Intelligence Architecture |
| --- | --- | --- | --- |
| **Promotion Agent** | 8002 | Dynamic Discounting | 3-layer hybrid: queries `products` vs `competitor_prices` to beat market rates while protecting `min_margin`. |
| **Post-Purchase Agent** | 8003 | Lifecycle Loyalty | Sends multilingual (EN/ES/FR) shipping pulses to a **global webhook** using the **Brand Persona**. |
| **Recommendation Agent** | 8004 | Personalized Cross-sell | **ARAG multi-agent architecture**: 4 specialized agents (User Understanding, NLI, Context Summary, Item Ranker) with RAG retrieval for up to 42% improvement over vanilla RAG. Based on [SIGIR 2025 research](https://arxiv.org/pdf/2506.21931). |
| **Search Agent** | 8005 | Product Discovery | **RAG architecture**: Semantic product search with Milvus vector store for natural language queries (e.g., "find me a warm jacket"). |

### ARAG Recommendation Architecture

The Recommendation Agent implements an **Agentic Retrieval Augmented Generation (ARAG)** framework with 4 specialized LLM agents:

1. **User Understanding Agent (UUA)**: Infers buyer preferences from cart items and session context
2. **NLI Agent**: Scores semantic alignment between candidate products and user intent
3. **Context Summary Agent (CSA)**: Synthesizes filtered candidates into focused recommendation context
4. **Item Ranker Agent (IRA)**: Produces final ranked cross-sell suggestions with reasoning

This approach moves beyond simple embedding-based retrieval to incorporate agentic reasoning, achieving significantly higher recommendation quality while maintaining the deterministic constraints (in-stock, margin policy) required by ACP.

### Brand Persona Configuration

The Post-Purchase Agent uses a configurable Brand Persona:

| Field | Description | Example |
| --- | --- | --- |
| `company_name` | Brand name for messaging | "Acme T-Shirts" |
| `tone` | Communication style | "friendly", "professional", "casual" |
| `preferred_language` | ISO 639-1 code | "en", "es", "fr" |

## 5. Target Users

* **Primary (Developers/Architects)**: Technical teams seeking a reference implementation of ACP/UCP with advanced AI-native logic.
* **Secondary (E-commerce Stakeholders)**: Business owners evaluating how AI agents can protect margins and build loyalty autonomously.

## 6. MVP Scope

* **Core Features (Must Have)**:
* **Dual Protocol Support**:
  * Full ACP-compliant REST API (`/checkout_sessions` Create/Update/Complete/Cancel/Get)
  * UCP REST endpoints (`/checkout-sessions` with capability negotiation, `/.well-known/ucp` discovery)
* Four NAT agent workflows wrapped in FastAPI (Promotion, Post-Purchase, Recommendation, Search).
* **Multi-Panel Protocol Inspector UI**: A "Glass Box" dashboard in Next.js with three views:
  * **Client Agent Panel**: Shows the simulated customer experience with search and product cards
  * **Merchant Server Panel**: Shows merchant-side JSON payloads with **ACP/UCP protocol tabs**
  * **Agent Activity Panel**: Shows real-time NeMo agent reasoning traces
* **SQLite Database**: Relational storage for products, competitors, and order persistence.
* **Client Agent Simulator**: 
  * Search flow: User enters prompt → Search Agent returns relevant products
  * Checkout flow: User clicks product → initiates checkout via selected protocol
* **PSP (Delegated payments)**:
  * `POST /agentic_commerce/delegate_payment` → `vt_...` (idempotent via `Idempotency-Key`)
  * `POST /agentic_commerce/create_and_process_payment_intent` → `pi_...`, token becomes `consumed`
* **Global Webhook**: Single endpoint for post-purchase event delivery
* **Apps SDK Integration (Merchant Iframe)**:
  * Tab switcher to toggle between "Native" and "Apps SDK" modes
  * Merchant-owned iframe embedded in Client Agent panel
  * RAG product search via Search Agent for natural language queries
  * 3 personalized recommendations from ARAG agent in carousel format
  * Shopping cart supporting multiple items (vs single product in native)
  * Pre-authenticated user with loyalty points display
  * Payment via `window.openai.callTool()` pattern → same ACP flow
  * **Three Testing Modes** per [OpenAI Apps SDK guidelines](https://developers.openai.com/apps-sdk/deploy):
    * Standalone: Local development with simulated `window.openai` bridge
    * ChatGPT Integration: Real ChatGPT testing via ngrok tunnel
    * Production: Deployed MCP server accessible from ChatGPT Apps Directory
  * MCP server with `search-products`, `get-recommendations`, `add-to-cart`, `checkout` tools
  * Widget bundles served via `openai/outputTemplate` metadata

* **Out of Scope**:
* Live production payment processing (Simulated Shared Payment Tokens only).
* Real-time external competitor scraping (uses mock `competitor_prices` table).
* PCI-grade vaulting (demo PSP stores payment method payloads for simulation only).

## 7. Technical Considerations

* **Stack**: Python **3.12+**, FastAPI, Uvicorn, SQLite, Next.js 15+, React 19, Tailwind CSS, Kaizen UI.
* **Service Ports**:
  * Merchant API: 8000 (ACP/UCP checkout, products, orders)
  * PSP Service: 8001 (payment delegation, vault tokens)
  * Promotion Agent: 8002
  * Post-Purchase Agent: 8003
  * Recommendation Agent: 8004 (ARAG)
  * Search Agent: 8005 (RAG)
  * Apps SDK MCP Server: 2091
  * UI: 3000
* **Latency Management**: Target <10s for typical operations to ensure responsive user experience.
* **Relational Logic**: Agents leverage tool-calling to execute SQL queries for business reasoning.
* **Vector Store**: Milvus for semantic product search embeddings (Search Agent).
* **NIM Deployment**: Configurable via environment variable (NVIDIA hosted API or local Docker container).
* **Security**: 
  * ACP endpoints require **API key authentication** (`X-API-Key` header)
  * UCP endpoints use **`UCP-Agent` header** for capability negotiation
* **PSP data model (demo)**: `vault_tokens` (vt_), `payment_intents` (pi_), `idempotency_store` to support request replay protection.
* **Webhook**: Single global webhook URL configured at application level for post-purchase events.
# Project Brief: Agentic Commerce Blueprint

## 1. Executive Summary

* **Product Concept**: A headless commerce middleware and reference architecture that enables merchants to integrate with the **Agentic Commerce Protocol (ACP)** while layering in "Merchant Intelligence" via the **NVIDIA NeMo Agent Toolkit (NAT)**.
* **Primary Problem**: Standard e-commerce backends are passive and cannot effectively "negotiate" or "reason" during a conversational checkout with AI agents.
* **Proposed Solution**: A Python **3.12+**-based (FastAPI) middleware that acts as a relational, intelligent bridge between agentic clients and existing merchant data.
* **Key Value Proposition**: Demonstrates a "Glass Box" approach to agentic commerce, where business logic (discounts, recommendations, loyalty) is optimized by autonomous agents in real-time.
* **Demo Client (Client Agent Simulator)**: A static simulator with 4 pre-populated products that can:
  * Accept search prompts (e.g., "find some t-shirts") and display product cards
  * Allow users to click a product to initiate ACP checkout
  * Uses a **PSP** component for delegated payments (vault token `vt_...` → payment intent `pi_...`).

## 2. UI Vision

The demo will feature a **multi-panel Protocol Inspector** that provides real-time visibility into the agentic commerce flow:

* **Left Panel (Agent/Client Simulation)**: Shows the simulated customer experience with search input, 4 product cards, and checkout flow
* **Middle Panel (Business/Retailer View)**: Displays what's happening on the merchant's side including JSON payloads, session state, and ACP protocol interactions
* **Right Panel (Chain of Thought - Optional)**: Shows real-time agent reasoning traces from NeMo Agent Toolkit when agents are triggered

This "glass box" approach makes the invisible mechanics of agentic commerce visible and educational.

### Apps SDK Mode

The Client Agent panel includes a **tab switcher** to toggle between two checkout experiences:

| Mode | Description |
|------|-------------|
| **Native ACP** | Client agent controls UI, single product checkout, standard flow |
| **Apps SDK** | Merchant controls UI via iframe, multi-item cart, ARAG recommendations |

The Apps SDK mode demonstrates how merchants can maintain complete UI control while leveraging the same ACP payment infrastructure. Key features:

* **Merchant-Owned Iframe**: HTML served from `/merchant-app`, fully controlled by merchant
* **ARAG Recommendations**: 3 personalized cross-sell items in carousel format
* **Shopping Cart**: Add multiple items before checkout (vs single product in native)
* **Loyalty Points**: Pre-authenticated user with points balance display
* **Same Payment Flow**: Uses identical ACP + PSP payment infrastructure

## 3. Problem Statement

* **Current State**: Merchants struggle to maintain their role as the "Merchant of Record" when transactions occur within third-party AI interfaces.
* **Impact**: Loss of dynamic pricing control, missed cross-sell opportunities, and a disconnected post-purchase experience.
* **Urgency**: As "Agentic Discovery" becomes the primary search mode, retailers need a blueprint to move from "searchable" to "transaction-ready" without sacrificing profit margins.

## 4. Proposed Solution & Intelligent Agents

The solution implements the 5 standard ACP endpoints and orchestrates three specialized NAT agents:

| Agent | Core Task | Intelligence Architecture |
| --- | --- | --- |
| **Promotion Agent** | Dynamic Discounting | 3-layer hybrid: queries `products` vs `competitor_prices` to beat market rates while protecting `min_margin`. |
| **Recommendation Agent** | Personalized Cross-sell | **ARAG multi-agent architecture**: 4 specialized agents (User Understanding, NLI, Context Summary, Item Ranker) with RAG retrieval for up to 42% improvement over vanilla RAG. Based on [SIGIR 2025 research](https://arxiv.org/pdf/2506.21931). |
| **Post-Purchase Agent** | Lifecycle Loyalty | Sends multilingual (EN/ES/FR) shipping pulses to a **global webhook** using the **Brand Persona**. |

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

* **Primary (Developers/Architects)**: Technical teams seeking a reference implementation of ACP with advanced AI-native logic.
* **Secondary (E-commerce Stakeholders)**: Business owners evaluating how AI agents can protect margins and build loyalty autonomously.

## 6. MVP Scope

* **Core Features (Must Have)**:
* Full ACP-compliant REST API (`/checkout_sessions` Create/Update/Complete/Cancel/Get).
* Three NAT workflows wrapped in FastAPI.
* **Multi-Panel Protocol Inspector UI**: A "Glass Box" dashboard in Next.js with three views:
  * **Agent/Client Panel**: Shows the simulated customer experience with search and product cards
  * **Business/Retailer Panel**: Shows merchant-side JSON payloads and ACP protocol state
  * **Chain of Thought Panel (Optional)**: Shows real-time NeMo agent reasoning traces
* **SQLite Database**: Relational storage for 4 pre-populated products, competitors, and order persistence.
* **Client Agent Simulator**: 
  * Search flow: User enters prompt → displays 4 product cards
  * Checkout flow: User clicks product → initiates `POST /checkout_sessions`
* **PSP (Delegated payments)**:
  * `POST /agentic_commerce/delegate_payment` → `vt_...` (idempotent via `Idempotency-Key`)
  * `POST /agentic_commerce/create_and_process_payment_intent` → `pi_...`, token becomes `consumed`
* **Global Webhook**: Single endpoint for post-purchase event delivery
* **Apps SDK Integration (Merchant Iframe)**:
  * Tab switcher to toggle between "Native ACP" and "Apps SDK" modes
  * Merchant-owned iframe embedded in Client Agent panel
  * 3 personalized recommendations from ARAG agent in carousel format
  * Shopping cart supporting multiple items (vs single product in native)
  * Pre-authenticated user with loyalty points display
  * Payment via `window.openai.callTool()` pattern → same ACP flow
  * **Three Testing Modes** per [OpenAI Apps SDK guidelines](https://developers.openai.com/apps-sdk/deploy):
    * Standalone: Local development with simulated `window.openai` bridge
    * ChatGPT Integration: Real ChatGPT testing via ngrok tunnel
    * Production: Deployed MCP server accessible from ChatGPT Apps Directory
  * MCP server with `get-recommendations`, `add-to-cart`, `checkout` tools
  * Widget bundles served via `openai/outputTemplate` metadata

* **Out of Scope**:
* Live production payment processing (Simulated Shared Payment Tokens only).
* Real-time external competitor scraping (uses mock `competitor_prices` table).
* PCI-grade vaulting (demo PSP stores payment method payloads for simulation only).

## 7. Technical Considerations

* **Stack**: Python **3.12+**, FastAPI, Uvicorn, SQLite, Next.js, Tailwind CSS, shadcn/ui.
* **Latency Management**: Target <10s for typical operations to ensure responsive user experience.
* **Relational Logic**: Agents will leverage tool-calling to execute SQL queries for business reasoning.
* **NIM Deployment**: Configurable via environment variable (NVIDIA hosted API or local Docker container).
* **Security**: ACP endpoints require **API key authentication** (e.g., `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`). Use strict request validation and parameterized SQL tools.
* **PSP data model (demo)**: `vault_tokens` (vt_), `payment_intents` (pi_), `idempotency_store` to support request replay protection.
* **Webhook**: Single global webhook URL configured at application level for post-purchase events.
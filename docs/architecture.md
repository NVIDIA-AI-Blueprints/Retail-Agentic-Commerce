### Fullstack Architecture: Section 1

**Section:** Introduction & High-Level Architecture

#### **Drafting Rationale:**

* **The Bridge**: This architecture must serve as a high-fidelity translator between the client's asynchronous intent and the merchant's synchronous relational data.
* **The Intelligence**: We are moving beyond simple API routes to an **Orchestrated Agentic Layer** where FastAPI acts as the host for NAT workflows.
* **The Relational Core**: Using **SQLModel** (SQLite) provides the structured environment NeMo agents need for precise business reasoning (e.g., margin calculation).

---

### Draft Content: High-Level Overview

**1. Technical Summary**
The **Intelligent ACP Middleware** is a Python **3.12+**-based reference architecture designed to host autonomous merchant agents. It exposes five RESTful endpoints compliant with the **Agentic Commerce Protocol v2025-09-29** and utilizes the **NVIDIA NeMo Agent Toolkit** to perform real-time business logic optimization. The system uses an "Async Parallel Orchestration" pattern to ensure fast, responsive agent reasoning.

**Simulator (demo client)**
We will also build a **client agent simulator** that plays the "client" role:

* **Implementation**: Static simulator with pre-defined user flows and 4 pre-populated products
* **Search Flow**: User enters a prompt (e.g., "find some t-shirts") → Simulator displays 4 product cards
* **Checkout Flow**: User clicks a product → Simulator initiates `POST /checkout_sessions` to start the ACP checkout

**2. High-Level Project Diagram**

```mermaid
graph TD
    subgraph "Consumer Interface"
        A[Client Agent Simulator]
        J[Product Cards UI]
    end

    subgraph "Intelligent Middleware (FastAPI)"
        B[ACP Gateway Router]
        C[Parallel Agent Orchestrator]
        D[NAT Promotion Agent]
        E[NAT Recommendation Agent]
        F[NAT Post-Purchase Agent]
    end

    subgraph "Relational Data (SQLite)"
        G[(Product Catalog - 4 items)]
        H[(Competitor Data)]
        I[(Order History)]
    end

    subgraph "Demo Interface (Next.js - Multi-Panel UI)"
        K1[Left: Agent/Client Simulation]
        K2[Middle: Business/Retailer View]
        K3[Right: Chain of Thought - Optional]
    end

    subgraph "Payments"
        P[PSP (delegated payments)]
    end

    subgraph "Webhooks"
        W[Global Webhook Endpoint]
    end

    A -->|UI resources| J
    A <-->|ACP REST/JSON| B
    B <--> C
    C --> D & E
    D & E & F <-->|SQL Queries| G & H & I
    A -.->|Simulation View| K1
    B & C -.->|JSON/Protocol State| K2
    D & E & F -.->|Agent Reasoning| K3
    B -->|complete checkout (token)| P
    A -->|delegate payment (vt_...)| P
    F -->|Post-purchase events| W

```

**3. Key Architectural Patterns**

* **Async Parallel Orchestrator**: The Promotion and Recommendation agents are triggered simultaneously via `asyncio.gather` during session creation.
* **Tool-Calling SQL Bridge**: NAT agents do not access the DB directly; they use specific **Python Tools** that execute sanitized SQL queries to prevent injection.
* **Multi-Panel Glass-Box Observability**: The Protocol Inspector uses a three-panel synchronized view:
  * **Left Panel**: Agent/Client simulation showing the customer experience
  * **Middle Panel**: Business/Retailer view with JSON payloads and protocol state
  * **Right Panel (Optional)**: Chain of thought showing agent reasoning traces from NeMo Agent Toolkit
  * **Default**: publish a **structured/redacted explainability trace** (safe-to-display steps + tool inputs/outputs).
  * **Demo/Debug**: optionally publish **raw chain-of-thought-style output** if available, explicitly labeled and only enabled for demos.
* **Simulator Flow**:
  1. User enters search query (e.g., "find some t-shirts")
  2. Simulator displays 4 product cards with images and prices
  3. User clicks a product to start checkout via ACP protocol
* **Static Product Catalog**: 4 pre-populated products stored in SQLite.
* **Delegated payments (PSP)**:
  * Client calls `POST /agentic_commerce/delegate_payment` → `vt_...` (idempotent by `Idempotency-Key`)
  * Merchant calls `POST /agentic_commerce/create_and_process_payment_intent` → `pi_...`, token becomes `consumed`
* **Global Webhook Delivery**: Post-purchase shipping pulses are delivered to a **single global webhook URL** configured at the application level. The Post-Purchase Agent uses the **Brand Persona** to generate multilingual updates.
* **Configurable NIM Endpoint**: Supports both NVIDIA hosted API and local Docker deployment via environment variable.
* **API Key Auth**: All ACP endpoints require an API key (e.g., `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`). Unauthorized requests return 401/403.

---

**4. Brand Persona Configuration**

The Post-Purchase Agent uses a **Brand Persona** to generate human-like shipping updates:

```json
{
  "company_name": "Acme T-Shirts",
  "tone": "friendly",
  "preferred_language": "en"
}
```

| Field | Type | Description | Example Values |
| --- | --- | --- | --- |
| `company_name` | `string` | Brand name for personalized messaging | "Acme T-Shirts" |
| `tone` | `string` | Communication style | "friendly", "professional", "casual", "urgent" |
| `preferred_language` | `string` | ISO 639-1 language code | "en", "es", "fr" |

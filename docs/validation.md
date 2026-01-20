### PO Master Validation

**Project Type:** Greenfield Reference Architecture (Intelligent Middleware) **Key Artifacts Reviewed:** `prd.md`, `architecture.md` 

#### 1. Project Setup & Initialization

* **[ ] 1.1 Project Scaffolding:** Epic 1 includes explicit steps for **FastAPI/Uvicorn** initialization and creation of the **SQLite** relational DB file(s).

* **[ ] 1.2 Development Environment:** Local setup specifies **Python 3.12+** and the required **NVIDIA NIM** / **NAT** environment variables for the **Nemotron-3-Nano** LLM.

* **[ ] 1.3 Core Dependencies:** Critical packages like `fastapi`, `uvicorn`, `sqlmodel`, and `nemo-agent-toolkit` are installed in the first story.

* **[ ] 1.4 Simulator Dependencies:** The client agent simulator story includes its runtime deps and configuration for:
  * Static simulator implementation with pre-defined user flows
  * 4 pre-populated products stored in SQLite

#### 2. Infrastructure, Data & Security

* **[ ] 2.1 Core DB Setup:** SQLite schema includes `products` (4 items), `competitor_prices`, and `checkout_sessions` before agent business logic is implemented.

* **[ ] 2.2 ACP API Configuration:** The 5 standard ACP REST endpoints are stubbed early to validate the protocol handshake with the client agent simulator:
  * `POST /checkout_sessions`
  * `POST /checkout_sessions/{id}`
  * `POST /checkout_sessions/{id}/complete`
  * `POST /checkout_sessions/{id}/cancel`
  * `GET /checkout_sessions/{id}`

* **[ ] 2.3 API Security:** All ACP endpoints require **API key authentication** (e.g., `Authorization: Bearer <API_KEY>` or `X-API-Key: <API_KEY>`), with clear 401/403 handling.

* **[ ] 2.4 Request Validation:** ACP endpoints enforce strict schema validation; reject unexpected fields where possible.

* **[ ] 2.5 SQL Safety:** All SQLite access used by tools/agents is parameterized to mitigate injection risk.

* **[ ] 2.6 Testing Infrastructure:** A mock for the **Shared Payment Token (SPT)** exists early to allow end-to-end checkout testing without a real PSP/processor.

* **[ ] 2.7 NIM Configuration:** Inference engine configurable via environment variable (NVIDIA hosted API or local Docker).

#### 3. Client Agent Simulator (Demo Client)

* **[ ] 3.1 Simulator Role Fidelity:** The simulator behaves like an ACP client: search for products, select item, initiate checkout, update session, and complete/cancel flows.

* **[ ] 3.2 Simulator Implementation:** The simulator is implemented as a static simulator with:
  * Search flow: User enters prompt (e.g., "find some t-shirts")
  * Product display: Shows 4 product cards with images and prices
  * Checkout initiation: User clicks a product to start `POST /checkout_sessions`

* **[ ] 3.3 Product Cards:** The simulator renders product cards in the UI including:
  * Product image + price (from 4 pre-populated products)
  * Click action that triggers the ACP checkout flow

* **[ ] 3.4 Multi-Panel Protocol Inspector:** The UI includes three synchronized panels:
  * **Left Panel**: Shows the agent/client simulation view (search, product cards, checkout)
  * **Middle Panel**: Shows business/retailer view with JSON payloads and ACP protocol state
  * **Right Panel (Optional)**: Shows chain of thought from NeMo Agent Toolkit with agent reasoning traces

* **[ ] 3.5 Performance Target:** Internal processing targets <10s for typical operations to ensure responsive user experience.

#### 4. PSP (Delegated Payments) Component

* **[ ] 4.1 Endpoint: Delegate Payment:** PSP implements `POST /agentic_commerce/delegate_payment` returning a **vault token** `vt_...` (201).

* **[ ] 4.2 Idempotency-Key Rules:** PSP enforces `Idempotency-Key` semantics:
  * same key + same request returns cached response
  * same key + different request returns **409** `idempotency_conflict`

* **[ ] 4.3 PSP Storage Model (Demo):** PSP persists (at minimum) the demo tables:
  * `vault_tokens` (status: `active|consumed`, stores allowance + metadata)
  * `payment_intents` (`pi_...`, status `pending -> completed`, references `vault_tokens`)
  * `idempotency_store` (stores request hash + cached response)

* **[ ] 4.4 Endpoint: Create & Process Payment Intent:** PSP implements `POST /agentic_commerce/create_and_process_payment_intent`:
  * validates token is active + not expired
  * validates amount/currency are within allowance
  * creates `pi_...` and marks it `completed`
  * marks the vault token as **consumed** (single-use)

#### 5. User/Agent Responsibility & Observability

* **[ ] 5.1 Developer Agent Actions:** The implementation of NAT reasoning workflows (including parallel orchestration) is assigned to the developer agent.

* **[ ] 5.2 Observability / Demo Trace Mode:** The Multi-Panel Protocol Inspector displays:
  * **Left Panel**: Agent/client simulation (search, products, checkout)
  * **Middle Panel**: Business/retailer JSON and protocol state
  * **Right Panel (Optional)**: Chain of thought with **default structured/redacted explainability trace**, with an optional **demo/debug mode** that can show raw chain-of-thought-style output if available and explicitly enabled.

* **[ ] 5.3 User Actions:** The user provides the initial **Brand Persona** configuration for the Post-Purchase Agent:
  * `company_name`: Brand name for personalized messaging
  * `tone`: Communication style (friendly, professional, casual, urgent)
  * `preferred_language`: ISO 639-1 code (en, es, fr)

* **[ ] 5.4 Global Webhook:** Post-Purchase agent sends updates to a **single global webhook URL** configured at the application level (not per-session).

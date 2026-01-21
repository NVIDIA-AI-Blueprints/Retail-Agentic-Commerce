# NVIDIA AI Blueprint: Retail Agentic Commerce

<div align="center">

![NVIDIA Logo](https://avatars.githubusercontent.com/u/178940881?s=200&v=4)

</div>

This repository is a **reference architecture** for the **Agentic Commerce Protocol (ACP)**: a retailer-operated system that keeps the merchant as **Merchant of Record**, while enabling **agentic negotiation** and “glass box” visibility into decisions and protocol traces.

> ⚠️ **Third-Party Software Notice**  
> This project may download and install additional third-party open source software projects.  
> Please review the license terms of these open source projects before use.

### What this blueprint includes (planned)
- **ACP middleware**: Implements the required ACP checkout session endpoints and persists session state.
- **Intelligent merchant agents**:
  - Promotion agent (margin protection via competitor price + inventory signals)
  - Recommendation agent (basket optimization with deterministic, in-stock rules)
  - Post-purchase agent (multilingual shipping “pulses” to a single global webhook)
- **Demo data layer**: A small catalog (4 products) + competitor prices + checkout session storage.
- **Protocol Inspector UI**: A multi-panel “glass box” dashboard showing ACP JSON requests/responses plus a structured reasoning trace.
- **Delegated payments simulator**: A minimal PSP flow for vault tokens + idempotency + payment intent processing.

---

## Getting Started

### Prerequisites

- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NVIDIA/Retail-Agentic-Commerce.git
   cd Retail-Agentic-Commerce
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**

   Using uv (recommended):
   ```bash
   uv sync
   ```

   Or using pip:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -e .
   ```

4. **Install dev dependencies** (optional, for testing/linting)
   ```bash
   uv sync --extra dev
   # or
   pip install -e ".[dev]"
   ```

### Running the Server

Start the FastAPI server with uvicorn:

```bash
uvicorn src.merchant.main:app --reload
```

The server will start at `http://localhost:8000`.

### Verify Installation

Check the health endpoint:
```bash
curl http://localhost:8000/health
```

You should receive:
```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### ACP Checkout Endpoints

The following ACP-compliant checkout session endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/checkout_sessions` | POST | Create a new checkout session |
| `/checkout_sessions/{id}` | GET | Get checkout session by ID |
| `/checkout_sessions/{id}` | POST | Update checkout session |
| `/checkout_sessions/{id}/complete` | POST | Complete checkout with payment |
| `/checkout_sessions/{id}/cancel` | POST | Cancel checkout session |

Example: Create a checkout session
```bash
curl -X POST http://localhost:8000/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id": "prod_1", "quantity": 1}]}'
```

### Running Tests

```bash
pytest
```

---

## Frontend UI

The project includes a Next.js frontend for the Protocol Inspector UI and Agent Simulator.

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Running the UI

```bash
# Navigate to the UI directory
cd src/ui

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The UI will be available at `http://localhost:3000`.

### UI Development Commands

```bash
cd src/ui

# Run tests
pnpm test              # Run tests in watch mode
pnpm test --run        # Run tests once

# Linting and formatting
pnpm lint              # Run ESLint
pnpm format            # Format with Prettier
pnpm format:check      # Check formatting

# Type checking
pnpm typecheck         # Run TypeScript type checker

# Build for production
pnpm build
```

### UI Features

- **Agent Panel**: Simulates a client agent with product grid selection and checkout flow
- **Merchant Panel**: Displays ACP protocol interactions and session state
- **Checkout Flow**: Complete purchase journey from product selection to order confirmation

---

## Docs
- **Product requirements**: `docs/PRD.md`
- **Architecture**: `docs/architecture.md`
- **Agentic Commerce Protocol notes/spec**: `docs/acp-spec.md`
- **Feature breakdown**: `docs/features.md`
- **Validation plan**: `docs/validation.md`

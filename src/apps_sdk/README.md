# Apps SDK MCP Server

This module implements an **MCP (Model Context Protocol) server** for the Agentic Commerce Protocol, enabling Apps SDK integration. It provides a merchant shopping experience with product recommendations, cart management, and ACP-powered checkout.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Agent   │◄───►│   MCP Server    │◄───►│     Widget      │
│      (UI)       │     │   (FastAPI)     │     │    (iframe)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. User prompt       │                       │
        │  2. Call tool         │                       │
        │ ─────────────────────►│                       │
        │                       │  3. Execute logic     │
        │                       │  4. Return JSON +     │
        │                       │     outputTemplate    │
        │ ◄─────────────────────│                       │
        │                       │                       │
        │  5. Load widget HTML  │                       │
        │ ─────────────────────────────────────────────►│
        │                       │                       │
        │  6. Widget reads data via window.openai       │
        │ ◄─────────────────────────────────────────────│
```

## Directory Structure

```
src/apps_sdk/
├── __init__.py           # Package metadata
├── config.py             # Settings (pydantic-settings)
├── main.py               # FastAPI + MCP server entry point
├── tools/                # MCP tool implementations
│   ├── __init__.py
│   ├── recommendations.py  # get-recommendations tool
│   ├── cart.py             # add-to-cart, remove-from-cart, get-cart tools
│   └── checkout.py         # checkout tool (ACP integration)
├── dist/                 # Built widget HTML (after pnpm build)
│   └── index.html
├── web/                  # React + Vite widget source
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx           # Main widget component
│       ├── main.tsx          # Entry point with window.openai bridge
│       ├── index.css         # Tailwind styles
│       ├── components/       # UI components
│       │   ├── LoyaltyHeader.tsx
│       │   ├── RecommendationCarousel.tsx
│       │   ├── ShoppingCart.tsx
│       │   └── CheckoutButton.tsx
│       ├── hooks/            # React hooks for window.openai
│       │   ├── use-openai-global.ts
│       │   ├── use-widget-state.ts
│       │   └── use-call-tool.ts
│       └── types/
│           └── index.ts      # TypeScript types
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Python 3.12+ (for MCP server)
- Node.js 18+ with pnpm (for widget development)
- Dependencies installed via `uv sync` from project root

### 1. Start the MCP Server

```bash
# From project root
uvicorn src.apps_sdk.main:app --reload --port 2091
```

### 2. Build the Widget

```bash
cd src/apps_sdk/web
pnpm install
pnpm build    # Outputs to ../dist/index.html
```

### 3. Verify

```bash
# Health check
curl http://localhost:2091/health

# Widget endpoint
curl http://localhost:2091/widget/merchant-app.html | head -5
```

## Development

### Widget Development Server

For faster iteration on the widget UI, use the Vite dev server:

```bash
cd src/apps_sdk/web
pnpm dev    # Runs on http://localhost:3001
```

The Protocol Inspector UI (`src/ui`) will automatically fall back to the Vite dev server if the MCP server widget is not available.

### Rebuilding the Widget

After making changes to the widget source, rebuild:

```bash
cd src/apps_sdk/web
pnpm build
```

The MCP server serves the built widget from `dist/index.html`.

## MCP Tools

The server exposes these tools for client agents:

| Tool | Description |
|------|-------------|
| `get-recommendations` | Get personalized product recommendations |
| `add-to-cart` | Add a product to the shopping cart |
| `remove-from-cart` | Remove a product from the cart |
| `update-cart-quantity` | Update item quantity in cart |
| `get-cart` | Get current cart contents |
| `checkout` | Process checkout via ACP payment flow |

### Tool Example: get-recommendations

```json
{
  "name": "get-recommendations",
  "arguments": {
    "userId": "user_demo123"
  }
}
```

Response includes product data and widget metadata:

```json
{
  "recommendations": [...],
  "user": {...},
  "_meta": {
    "openai/outputTemplate": "ui://widget/merchant-app.html",
    "openai/widgetAccessible": true
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/widget/merchant-app.html` | GET | Serve the merchant widget HTML |
| `/widget/{asset}` | GET | Serve widget assets |
| `/mcp` | POST | MCP protocol endpoint |

## Configuration

Settings are managed via environment variables or `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_SERVER_PORT` | `2091` | Server port |
| `MERCHANT_API_URL` | `http://localhost:8000` | Merchant API URL |
| `PSP_API_URL` | `http://localhost:8001` | PSP service URL |
| `ARAG_AGENT_URL` | `http://localhost:8004` | Recommendation agent URL |
| `API_KEY` | `your-api-key` | Merchant API key |
| `PSP_API_KEY` | `psp-api-key-12345` | PSP API key |

## Widget: window.openai Bridge

The widget communicates with the client agent via the `window.openai` API:

```typescript
// Read tool output data
const data = window.openai.toolOutput;

// Call another tool
const result = await window.openai.callTool("add-to-cart", {
  productId: "prod_001",
  quantity: 1
});

// Send a message to the chat
window.openai.sendMessage("Added item to cart!");

// Persist widget state across renders
window.openai.setWidgetState({ cart: items });
const state = window.openai.getWidgetState();
```

### Custom Hooks

The widget provides React hooks for easier integration:

```typescript
import { useOpenAiGlobal, useWidgetState, useCallTool } from '@/hooks';

// Subscribe to window.openai properties
const toolOutput = useOpenAiGlobal('toolOutput');
const theme = useOpenAiGlobal('theme');

// Persistent widget state
const [cart, setCart] = useWidgetState<CartItem[]>('cart', []);

// Call tools with loading/error handling
const { callTool, isLoading, error } = useCallTool();
await callTool('checkout', { cartId: 'cart_123' });
```

## Integration with Protocol Inspector

The Protocol Inspector UI (`src/ui`) includes an "Apps SDK" tab that loads this widget in an iframe. When running in this mode:

1. The UI injects a simulated `window.openai` bridge via postMessage
2. Tool calls from the widget are forwarded to the MCP server
3. Responses are routed back to the widget

This enables testing the full Apps SDK experience in standalone mode.

## Related Documentation

- [Apps SDK Spec](../../docs/specs/apps-sdk-spec.md) - Complete Apps SDK reference
- [Feature 16](../../docs/features/feature-16-apps-sdk.md) - Implementation details
- [Architecture](../../docs/architecture.md) - System architecture

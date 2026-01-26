# Feature 16: Apps SDK Integration (Merchant Iframe)

**Goal**: Implement an alternative checkout experience using the Apps SDK pattern, where the merchant controls a fully-owned iframe embedded within the Client Agent panel. This demonstrates how merchants can maintain complete UI control while leveraging the ACP payment infrastructure.

**Reference**: [ChatGPT Apps SDK Developer Guide](../specs/apps-sdk-spec.md)

## Architecture Overview

The Apps SDK approach differs from the Native ACP flow by giving the merchant full control over the shopping experience UI:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPS SDK INTEGRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT AGENT PANEL                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  [Native ACP] [Apps SDK]  ← Tab Switcher                            │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │                                                                     │  │
│   │   ┌───────────────────────────────────────────────────────────┐    │  │
│   │   │                  MERCHANT IFRAME                          │    │  │
│   │   │  (Merchant-owned HTML served from /merchant-app)          │    │  │
│   │   │                                                           │    │  │
│   │   │  ┌─────────────────────────────────────────────────────┐  │    │  │
│   │   │  │  👤 Welcome, John! | 🏆 1,250 Points               │  │    │  │
│   │   │  ├─────────────────────────────────────────────────────┤  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  RECOMMENDED FOR YOU (from ARAG Agent)              │  │    │  │
│   │   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │    │  │
│   │   │  │  │ Item 1  │  │ Item 2  │  │ Item 3  │             │  │    │  │
│   │   │  │  │  $25    │  │  $35    │  │  $28    │             │  │    │  │
│   │   │  │  │ [Add]   │  │ [Add]   │  │ [Add]   │             │  │    │  │
│   │   │  │  └─────────┘  └─────────┘  └─────────┘             │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  🛒 SHOPPING CART                                   │  │    │  │
│   │   │  │  ├─ Classic Tee x1 ............... $25.00          │  │    │  │
│   │   │  │  ├─ V-Neck Tee x1 ................ $28.00          │  │    │  │
│   │   │  │  └─ Subtotal: $53.00                               │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  │  [Checkout with ACP] → triggers callTool()          │  │    │  │
│   │   │  │                                                     │  │    │  │
│   │   │  └─────────────────────────────────────────────────────┘  │    │  │
│   │   │                                                           │    │  │
│   │   └───────────────────────────────────────────────────────────┘    │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   COMMUNICATION VIA window.openai BRIDGE (simulated)                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Iframe                    Parent (Client Agent)                    │  │
│   │    │                              │                                 │  │
│   │    │  callTool("checkout", {      │                                 │  │
│   │    │    cartItems: [...],         │                                 │  │
│   │    │    loyaltyPoints: 1250       │                                 │  │
│   │    │  })                          │                                 │  │
│   │    │ ─────────────────────────────▶                                 │  │
│   │    │                              │                                 │  │
│   │    │                    Triggers ACP payment flow                   │  │
│   │    │                    (same as Native approach)                   │  │
│   │    │                              │                                 │  │
│   │    │  {orderId: "order_xyz"}      │                                 │  │
│   │    │ ◀─────────────────────────────                                 │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Differences from Native ACP

| Aspect | Native ACP | Apps SDK |
|--------|-----------|----------|
| **UI Control** | Client Agent controls UI | Merchant controls UI via iframe |
| **Product Display** | Product grid with cards | Merchant-designed recommendation carousel |
| **Shopping Experience** | Single product checkout | Full shopping cart with multiple items |
| **Recommendations** | Displayed in Agent Activity | Integrated in merchant UI (from ARAG) |
| **Loyalty Integration** | Not displayed | Pre-authenticated user with points |
| **Checkout Trigger** | Click product → ACP flow | Add to cart → Checkout button → `callTool()` |
| **Payment Flow** | Same | Same (ACP + PSP) |

## Components

### 16.1 Tab Switcher Component

A tab interface at the top of the Client Agent panel to switch between modes:

```tsx
// Component location: src/ui/components/agent/ModeTabSwitcher.tsx

interface ModeTabSwitcherProps {
  activeMode: 'native' | 'apps-sdk';
  onModeChange: (mode: 'native' | 'apps-sdk') => void;
}
```

**Design**:
- Two tabs: "Native ACP" and "Apps SDK"
- Visual indicator for active tab
- Smooth transition when switching modes
- Persists selection in component state

### 16.2 Merchant Iframe App

A merchant-owned HTML application served from a dedicated route:

**Route**: `/merchant-app` (Next.js page or static HTML)

**Features**:
- **Loyalty Points Display**: Shows pre-authenticated user with points balance
- **Recommendations Carousel**: 3 items from ARAG Recommendation Agent
- **Shopping Cart**: Add/remove items, quantity adjustment
- **Checkout Button**: Triggers `window.openai.callTool()` for payment

**Simulated `window.openai` Bridge**:

The parent window injects a simulated `window.openai` object into the iframe:

```typescript
// Simulated Apps SDK bridge
interface SimulatedOpenAI {
  theme: 'light' | 'dark';
  locale: string;
  toolOutput: {
    recommendations: Product[];
    loyaltyPoints: number;
    user: { name: string; email: string };
  };
  
  callTool: (name: string, args: Record<string, unknown>) => Promise<{ result: string }>;
  setWidgetState: (state: unknown) => Promise<void>;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
}
```

### 16.3 Iframe Container Component

Embeds the merchant iframe within the Client Agent panel:

```tsx
// Component location: src/ui/components/agent/MerchantIframeContainer.tsx

interface MerchantIframeContainerProps {
  onCheckout: (cartItems: CartItem[], loyaltyPoints: number) => void;
}
```

**Responsibilities**:
- Load merchant app in sandboxed iframe
- Inject simulated `window.openai` bridge
- Handle `callTool` messages from iframe via `postMessage`
- Pass checkout data to parent for ACP payment flow

### 16.4 ARAG Recommendations Integration

The iframe fetches recommendations from the ARAG agent via API:

**API Route**: `GET /api/recommendations?context={cart_context}`

**Flow**:
1. Merchant iframe loads with pre-authenticated user context
2. Iframe calls recommendations API with user/session context
3. API proxies to ARAG Recommendation Agent (port 8004)
4. Returns top 3 personalized recommendations
5. Iframe displays in carousel format

### 16.5 Pre-Authenticated User & Loyalty Points

For demonstration purposes, the user is pre-authenticated:

```typescript
// Mock authenticated user
const mockUser = {
  id: 'user_demo123',
  name: 'John Doe',
  email: 'john@example.com',
  loyaltyPoints: 1250,
  tier: 'Gold',
  memberSince: '2024-03-15'
};
```

**Loyalty Display**:
- Points balance in header
- Tier badge (Bronze/Silver/Gold/Platinum)
- Points redemption option during checkout (future enhancement)

## Merchant Iframe Implementation

### HTML Structure

```html
<!-- Route: /merchant-app (served as iframe content) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Merchant Store</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="merchant-app"></div>
  <script type="module" src="/merchant-app.js"></script>
</body>
</html>
```

### React Component Structure

```
src/ui/app/merchant-app/
├── page.tsx              # Next.js page (iframe content)
├── components/
│   ├── LoyaltyHeader.tsx       # User info + points display
│   ├── RecommendationCarousel.tsx  # 3-item ARAG recommendations
│   ├── ShoppingCart.tsx        # Cart with add/remove/quantity
│   └── CheckoutButton.tsx      # Triggers callTool()
├── hooks/
│   ├── useRecommendations.ts   # Fetches from ARAG agent
│   ├── useCart.ts              # Shopping cart state
│   └── useOpenAiBridge.ts      # Handles window.openai calls
└── types/
    └── index.ts                # Cart, Product, User types
```

## Communication Protocol

### Parent → Iframe (Initialization)

```typescript
// Parent sends initial data to iframe
iframe.contentWindow.postMessage({
  type: 'INIT_MERCHANT_APP',
  payload: {
    theme: 'light',
    locale: 'en-US',
    user: mockUser,
    recommendations: await fetchRecommendations()
  }
}, '*');
```

### Iframe → Parent (Tool Calls)

```typescript
// Iframe requests checkout via callTool pattern
window.parent.postMessage({
  type: 'CALL_TOOL',
  toolName: 'checkout',
  args: {
    cartItems: [
      { productId: 'prod_1', quantity: 1, price: 2500 },
      { productId: 'prod_2', quantity: 2, price: 2800 }
    ],
    subtotal: 8100,
    loyaltyPoints: 1250,
    applyPoints: false  // Future: redeem points
  }
}, '*');
```

### Parent → Iframe (Tool Response)

```typescript
// Parent sends result back to iframe
iframe.contentWindow.postMessage({
  type: 'TOOL_RESULT',
  toolName: 'checkout',
  result: {
    success: true,
    orderId: 'order_xyz789',
    message: 'Order placed successfully!'
  }
}, '*');
```

## API Endpoints

### 16.6 Recommendations API Proxy

Creates a Next.js API route to proxy ARAG agent requests:

**Route**: `GET /api/recommendations`

```typescript
// src/ui/app/api/recommendations/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartItems = JSON.parse(searchParams.get('cart_items') || '[]');
  
  // Call ARAG Recommendation Agent
  const response = await fetch(`${RECOMMENDATION_AGENT_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: JSON.stringify({
        cart_items: cartItems,
        session_context: { user_id: 'user_demo123' }
      })
    })
  });
  
  const result = await response.json();
  return Response.json({
    recommendations: result.recommendations.slice(0, 3)
  });
}
```

## Merchant Iframe UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  🏪 ACME Store                          👤 John | 🏆 1,250 pts  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✨ RECOMMENDED FOR YOU                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │          │
│  │              │  │              │  │              │          │
│  │ Classic Tee  │  │  V-Neck Tee  │  │ Graphic Tee  │          │
│  │    $25.00    │  │    $28.00    │  │    $32.00    │          │
│  │  ⭐ 4.8 (42) │  │  ⭐ 4.6 (28) │  │  ⭐ 4.9 (67) │          │
│  │  [Add to 🛒] │  │  [Add to 🛒] │  │  [Add to 🛒] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                          ◀ ─ ─ ▶                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  🛒 YOUR CART (2 items)                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ┌────┐  Classic Tee              $25.00   [−] 1 [+]  ✕     ││
│  │ │img │  Size: M, Color: Navy                               ││
│  │ └────┘                                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ┌────┐  V-Neck Tee               $28.00   [−] 1 [+]  ✕     ││
│  │ │img │  Size: L, Color: Black                              ││
│  │ └────┘                                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Subtotal:                                            $53.00   │
│  Shipping:                                             $5.00   │
│  ─────────────────────────────────────────────────────────────  │
│  Total:                                               $58.00   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              🔒 Checkout with ACP                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Protocol Inspector Integration

Apps SDK events are logged in the Merchant Panel alongside native ACP events:

| Event Type | Source | Description |
|------------|--------|-------------|
| `apps_sdk.iframe_loaded` | Client Agent | Merchant iframe initialized |
| `apps_sdk.recommendations_fetched` | ARAG Agent | 3 recommendations loaded |
| `apps_sdk.cart_updated` | Merchant Iframe | Item added/removed/quantity changed |
| `apps_sdk.checkout_initiated` | Merchant Iframe | callTool('checkout') called |
| `acp.session_created` | Merchant API | Standard ACP session created |
| `acp.payment_delegated` | PSP | Vault token obtained |
| `acp.checkout_completed` | Merchant API | Order created |

## Environment Configuration

```env
# Apps SDK Configuration (src/ui/.env.local)
NEXT_PUBLIC_MERCHANT_APP_URL=/merchant-app
NEXT_PUBLIC_RECOMMENDATION_AGENT_URL=http://localhost:8004

# MCP Server Configuration (for ChatGPT testing)
MCP_SERVER_PORT=2091
NGROK_ENABLED=false
```

## Deployment & Testing Architecture

The Apps SDK integration is architected to support **three testing modes**, following the [OpenAI Apps SDK deployment guidelines](https://developers.openai.com/apps-sdk/deploy):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TESTING & DEPLOYMENT MODES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 1: STANDALONE (Local Development)                                     │
│  ═══════════════════════════════════════                                    │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   Protocol      │     │  Merchant App   │     │   ACP Backend   │       │
│  │   Inspector     │────▶│  (iframe)       │────▶│   + ARAG Agent  │       │
│  │   (Next.js)     │     │  localhost:3000 │     │   localhost:8000│       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│         │                        │                                          │
│         ▼                        ▼                                          │
│  Simulated window.openai    postMessage bridge                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 2: CHATGPT INTEGRATION (ngrok Tunnel)                                 │
│  ════════════════════════════════════════════                               │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    ChatGPT      │     │   MCP Server    │     │  Merchant App   │       │
│  │    (Real)       │────▶│  (ngrok tunnel) │────▶│  + ACP Backend  │       │
│  │                 │     │  *.ngrok.app    │     │  localhost:*    │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│         │                        │                                          │
│         ▼                        ▼                                          │
│  Real window.openai        MCP Protocol                                     │
│  injected by ChatGPT       over HTTPS                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 3: PRODUCTION (Deployed)                                              │
│  ═════════════════════════════                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    ChatGPT      │     │   MCP Server    │     │  Merchant App   │       │
│  │    (Real)       │────▶│  (Vercel/etc)   │────▶│  (Production)   │       │
│  │                 │     │  HTTPS endpoint │     │                 │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mode 1: Standalone Testing (Simulated ChatGPT)

For local development without ChatGPT:

```bash
# Terminal 1: Start ACP Backend + ARAG Agent
uvicorn src.merchant.main:app --reload --port 8000
nat serve --config_file src/agents/configs/recommendation.yml --port 8004

# Terminal 2: Start Frontend (includes merchant app)
cd src/ui && pnpm run dev

# Access Protocol Inspector at http://localhost:3000
# Switch to "Apps SDK" tab to test merchant iframe
```

The standalone mode uses a **simulated `window.openai` bridge** that mimics the real ChatGPT Apps SDK:
- Parent window injects simulated bridge via `postMessage`
- Merchant iframe uses same code as production
- Full ACP payment flow works identically

### Mode 2: ChatGPT Integration Testing (ngrok)

For testing directly in ChatGPT before production:

```bash
# Terminal 1: Start all backend services
uvicorn src.merchant.main:app --reload --port 8000
uvicorn src.payment.main:app --reload --port 8001
nat serve --config_file src/agents/configs/recommendation.yml --port 8004

# Terminal 2: Start MCP Server
cd src/apps-sdk && npm run dev  # Starts on port 2091

# Terminal 3: Start ngrok tunnel
ngrok http 2091
# Output: https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp

# Terminal 4: Start merchant app (widget bundle)
cd src/ui && pnpm run dev
```

**ChatGPT Configuration:**
1. Go to ChatGPT Settings → Connectors
2. Add Connector with ngrok URL: `https://<subdomain>.ngrok.app/mcp`
3. Test with prompts like: "Show me t-shirt recommendations"

### Mode 3: Production Deployment

For production, deploy to a hosting platform with HTTPS:

| Platform | Use Case |
|----------|----------|
| **Vercel** | Quick deploy, preview environments, automatic HTTPS |
| **Alpic** | Ready-to-deploy Apps SDK starter with one-click deploy |
| **Fly.io / Render** | Managed containers with automatic TLS |
| **Cloud Run** | Scale-to-zero serverless containers |

## MCP Server Architecture

The merchant app is structured as a proper MCP server that works with ChatGPT:

```
src/apps-sdk/
├── server/
│   ├── main.py                    # FastMCP server entry point
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── recommendations.py     # get-recommendations tool
│   │   ├── cart.py                # add-to-cart, remove-from-cart tools
│   │   └── checkout.py            # checkout tool (triggers ACP)
│   └── requirements.txt
│
├── widgets/
│   ├── product-carousel.html      # Recommendation carousel widget
│   ├── shopping-cart.html         # Cart management widget
│   └── order-confirmation.html    # Post-checkout confirmation
│
├── src/
│   ├── components/
│   │   ├── ProductCarousel.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── LoyaltyHeader.tsx
│   ├── hooks/
│   │   ├── use-openai-global.ts   # window.openai subscription
│   │   ├── use-widget-state.ts    # Persistent state
│   │   └── use-call-tool.ts       # Tool calling wrapper
│   └── index.tsx
│
├── package.json
├── tsconfig.json
└── vite.config.ts                 # Builds widget bundles
```

### MCP Tools Definition

```python
# src/apps-sdk/server/main.py

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="acme-store", stateless_http=True)

@mcp.tool()
async def get_recommendations(user_id: str, cart_items: list[str]) -> dict:
    """Get personalized product recommendations from ARAG agent."""
    # Calls ARAG Recommendation Agent
    recommendations = await fetch_arag_recommendations(user_id, cart_items)
    return {
        "recommendations": recommendations[:3],
        "_meta": {
            "openai/outputTemplate": "ui://widget/product-carousel.html",
            "openai/widgetAccessible": True,
        }
    }

@mcp.tool()
async def add_to_cart(product_id: str, quantity: int = 1) -> dict:
    """Add a product to the shopping cart."""
    cart = update_cart(product_id, quantity)
    return {
        "cart": cart,
        "_meta": {
            "openai/outputTemplate": "ui://widget/shopping-cart.html",
            "openai/widgetSessionId": cart["id"],
        }
    }

@mcp.tool()
async def checkout(cart_id: str) -> dict:
    """Process checkout using ACP payment flow."""
    # Creates ACP session, delegates payment, completes checkout
    order = await process_acp_checkout(cart_id)
    return {
        "order": order,
        "_meta": {
            "openai/outputTemplate": "ui://widget/order-confirmation.html",
            "openai/closeWidget": True,
        }
    }
```

## Tasks

**Phase 1: Tab Switcher & Container**
- [ ] Create `ModeTabSwitcher` component with Native/Apps SDK tabs
- [ ] Create `MerchantIframeContainer` component
- [ ] Update `AgentPanel` to conditionally render based on active mode
- [ ] Implement mode persistence in component state

**Phase 2: Merchant Iframe App (Standalone)**
- [ ] Create `/merchant-app` Next.js route for standalone testing
- [ ] Implement `LoyaltyHeader` component with pre-authenticated user
- [ ] Implement `RecommendationCarousel` component (3 items)
- [ ] Implement `ShoppingCart` component with add/remove/quantity
- [ ] Implement `CheckoutButton` component
- [ ] Create simulated `window.openai` bridge for standalone mode

**Phase 3: MCP Server (ChatGPT Integration)**
- [ ] Create `src/apps-sdk/server/` with FastMCP server
- [ ] Implement `get-recommendations` tool with ARAG integration
- [ ] Implement `add-to-cart` and `remove-from-cart` tools
- [ ] Implement `checkout` tool that triggers ACP flow
- [ ] Register widget HTML resources

**Phase 4: Widget Bundle**
- [ ] Set up Vite build for widget HTML bundles
- [ ] Create `product-carousel.html` widget
- [ ] Create `shopping-cart.html` widget
- [ ] Create `order-confirmation.html` widget
- [ ] Implement `useOpenAiGlobal` and `useWidgetState` hooks

**Phase 5: ARAG Integration**
- [ ] Create `/api/recommendations` proxy route (for standalone)
- [ ] Connect MCP `get-recommendations` tool to ARAG agent
- [ ] Implement `useRecommendations` hook for widgets
- [ ] Add loading and error states

**Phase 6: Payment Flow Integration**
- [ ] Connect MCP `checkout` tool to ACP payment flow
- [ ] Handle multi-item cart processing
- [ ] Display order confirmation in widget
- [ ] Log Apps SDK events in Protocol Inspector

**Phase 7: ngrok Testing**
- [ ] Document ngrok setup for ChatGPT testing
- [ ] Add environment variable for tunnel mode
- [ ] Test complete flow in real ChatGPT
- [ ] Capture screenshots/recordings for documentation

**Phase 8: Polish & Production Prep**
- [ ] Add smooth transitions between modes
- [ ] Ensure consistent styling with native mode
- [ ] Add deployment scripts for Vercel
- [ ] Create deployment documentation

## Acceptance Criteria

**Tab Switcher**:
- [ ] Tab switcher displays "Native ACP" and "Apps SDK" options
- [ ] Active tab is visually indicated
- [ ] Switching modes is smooth and instant
- [ ] Mode selection is preserved during session

**Merchant Iframe (Standalone Mode)**:
- [ ] Iframe loads merchant app from `/merchant-app` route
- [ ] Pre-authenticated user displays with name and loyalty points
- [ ] Recommendation carousel shows 3 items from ARAG agent
- [ ] Shopping cart supports add/remove items and quantity changes
- [ ] Simulated `window.openai` bridge works identically to real ChatGPT

**MCP Server (ChatGPT Integration)**:
- [ ] MCP server starts and responds to tool calls
- [ ] `get-recommendations` tool returns ARAG recommendations
- [ ] `add-to-cart` and `checkout` tools work correctly
- [ ] Widget resources are served with correct MIME types
- [ ] Server supports ngrok tunneling for ChatGPT testing

**ARAG Integration**:
- [ ] Recommendations are fetched from ARAG Recommendation Agent
- [ ] Recommendations are contextually relevant (based on session)
- [ ] Loading and error states are handled gracefully

**Communication Bridge**:
- [ ] `window.openai.callTool()` pattern works from iframe (standalone)
- [ ] `window.openai.callTool()` works from real ChatGPT (via ngrok)
- [ ] Parent receives and processes checkout requests
- [ ] Results are returned to iframe/widget after payment

**Payment Flow**:
- [ ] Multi-item cart is processed through ACP
- [ ] Same PSP delegate_payment → complete flow as native
- [ ] Order confirmation displays in iframe/widget

**Protocol Inspector**:
- [ ] Apps SDK events appear in Merchant Panel
- [ ] Event flow is traceable from iframe to order completion

**Deployment & Testing**:
- [ ] Standalone mode works without ChatGPT connection
- [ ] ngrok tunnel successfully exposes MCP server to ChatGPT
- [ ] Real ChatGPT can invoke tools and render widgets
- [ ] Widget bundle builds correctly for production
- [ ] Documentation covers all three testing modes

---

[← Back to Feature Overview](./index.md)

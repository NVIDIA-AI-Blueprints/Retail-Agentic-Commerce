# Ultimate ChatGPT Apps SDK Developer Guide

> **For AI Coding Assistants**: This guide provides comprehensive reference material for building ChatGPT applications using OpenAI's Apps SDK with MCP servers and HTML/React widgets.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [MCP Server Implementation](#mcp-server-implementation)
4. [Window.openai API Reference](#windowopenai-api-reference)
5. [React Hooks for Widgets](#react-hooks-for-widgets)
6. [UI Components & Widgets](#ui-components--widgets)
7. [Product Carousel Implementation](#product-carousel-implementation)
8. [Shopping Cart & Checkout](#shopping-cart--checkout)
9. [State Management](#state-management)
10. [MCP Metadata Reference](#mcp-metadata-reference)
11. [Styling Guidelines](#styling-guidelines)
12. [UX Principles](#ux-principles)
13. [Deployment](#deployment)
14. [Official Resources](#official-resources)

---

## Architecture Overview

ChatGPT Apps are custom extensions that run within ChatGPT's interface. An app consists of:

1. **MCP Server (Backend)** - Defines tools and returns structured data with UI references
2. **Widget (Frontend)** - HTML/React component rendered in an isolated iframe sandbox

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     ChatGPT     │◄───►│   MCP Server    │◄───►│     Widget      │
│     Client      │     │    (Backend)    │     │    (iframe)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. User prompt       │                       │
        │  2. Model calls tool  │                       │
        │ ─────────────────────►│                       │
        │                       │  3. Execute logic     │
        │                       │  4. Return JSON +     │
        │                       │     outputTemplate    │
        │ ◄─────────────────────│                       │
        │                       │                       │
        │  5. Load widget HTML  │                       │
        │ ─────────────────────────────────────────────►│
        │                       │                       │
        │  6. Widget reads toolOutput via window.openai │
        │ ◄─────────────────────────────────────────────│
```

### Key Architecture Features

| Feature | Description |
|---------|-------------|
| **Isolated iframe sandbox** | Triple-layered iframe sandbox ensures security isolation from ChatGPT UI |
| **Tools via MCP** | Server advertises tools with JSON schemas; ChatGPT model invokes them |
| **UI resources (widgets)** | Tool responses reference HTML widgets via `openai/outputTemplate` metadata |
| **window.openai bridge** | JavaScript API injected into iframe for widget-ChatGPT communication |

---

## Core Concepts

### How It Works

1. User sends a prompt to ChatGPT
2. ChatGPT model determines your app's tool is relevant
3. Model sends `call_tool` request to your MCP server
4. Server executes logic and returns JSON data + widget reference
5. ChatGPT loads the widget HTML in an iframe
6. Widget reads data from `window.openai.toolOutput` and renders UI
7. User interacts with widget; widget can call more tools or send messages

### MCP Server Responsibilities

1. **Listing tools** - Declare available tools with descriptions and JSON input/output schemas
2. **Handling tool calls** - Execute logic when ChatGPT calls a tool, return structured JSON
3. **Returning UI components** - Include metadata pointing to widget HTML for rendering

---

## MCP Server Implementation

### Python Server with FastMCP

```python
"""Complete MCP server example using Python FastMCP."""

from __future__ import annotations
import os
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

import mcp.types as types
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

# =============================================================================
# SERVER INITIALIZATION
# =============================================================================

mcp = FastMCP(
    name="my-chatgpt-app",
    stateless_http=True,
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=False
    ),
)

# =============================================================================
# INPUT SCHEMAS (Pydantic Models)
# =============================================================================

class ProductSearchInput(BaseModel):
    """Schema for product search tool."""
    query: str = Field(..., description="Search query for products")
    category: str | None = Field(None, description="Optional category filter")
    limit: int = Field(default=10, ge=1, le=50, description="Max results")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class AddToCartInput(BaseModel):
    """Schema for add to cart tool."""
    product_id: str = Field(..., alias="productId", description="Product ID")
    quantity: int = Field(default=1, ge=1, description="Quantity to add")
    cart_id: str | None = Field(None, alias="cartId", description="Existing cart ID")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class CheckoutInput(BaseModel):
    """Schema for checkout tool."""
    cart_id: str = Field(..., alias="cartId", description="Cart ID to checkout")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

# =============================================================================
# WIDGET METADATA HELPERS
# =============================================================================

def _carousel_meta() -> Dict[str, Any]:
    """Metadata for product carousel widget."""
    return {
        "openai/outputTemplate": "ui://widget/product-carousel.html",
        "openai/toolInvocation/invoking": "Searching products...",
        "openai/toolInvocation/invoked": "Products found",
        "openai/widgetAccessible": True,
    }


def _cart_meta(cart_id: str) -> Dict[str, Any]:
    """Metadata for shopping cart widget."""
    return {
        "openai/outputTemplate": "ui://widget/shopping-cart.html",
        "openai/toolInvocation/invoking": "Updating cart...",
        "openai/toolInvocation/invoked": "Cart updated",
        "openai/widgetAccessible": True,
        "openai/widgetSessionId": cart_id,  # Critical for state sync across turns
    }


def _checkout_complete_meta() -> Dict[str, Any]:
    """Metadata for completed checkout (closes widget)."""
    return {
        "openai/outputTemplate": "ui://widget/order-confirmation.html",
        "openai/toolInvocation/invoking": "Processing order...",
        "openai/toolInvocation/invoked": "Order placed!",
        "openai/widgetAccessible": True,
        "openai/closeWidget": True,  # Auto-close widget after displaying
    }

# =============================================================================
# TOOL REGISTRATION
# =============================================================================

@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    """Register all available tools."""
    return [
        types.Tool(
            name="search-products",
            title="Search Products",
            description="Search for products by query and optional category",
            inputSchema=ProductSearchInput.model_json_schema(by_alias=True),
            _meta=_carousel_meta(),
            annotations={
                "destructiveHint": False,
                "openWorldHint": False,
                "readOnlyHint": True,
            },
        ),
        types.Tool(
            name="add-to-cart",
            title="Add to Cart",
            description="Add a product to the shopping cart",
            inputSchema=AddToCartInput.model_json_schema(by_alias=True),
            _meta=_cart_meta(""),
            annotations={
                "destructiveHint": False,
                "openWorldHint": False,
                "readOnlyHint": False,
            },
        ),
        types.Tool(
            name="checkout",
            title="Checkout",
            description="Complete the checkout process for a cart",
            inputSchema=CheckoutInput.model_json_schema(by_alias=True),
            _meta=_checkout_complete_meta(),
            annotations={
                "destructiveHint": True,
                "openWorldHint": True,
                "readOnlyHint": False,
            },
        ),
    ]

# =============================================================================
# RESOURCE REGISTRATION (Widget HTML)
# =============================================================================

@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    """Register widget HTML resources."""
    return [
        types.Resource(
            name="Product Carousel",
            title="Product Carousel Widget",
            uri="ui://widget/product-carousel.html",
            description="Displays products in a scrollable carousel",
            mimeType="text/html+skybridge",
            _meta=_carousel_meta(),
        ),
        types.Resource(
            name="Shopping Cart",
            title="Shopping Cart Widget",
            uri="ui://widget/shopping-cart.html",
            description="Shopping cart with item management",
            mimeType="text/html+skybridge",
            _meta=_cart_meta(""),
        ),
        types.Resource(
            name="Order Confirmation",
            title="Order Confirmation Widget",
            uri="ui://widget/order-confirmation.html",
            description="Order confirmation display",
            mimeType="text/html+skybridge",
        ),
    ]

# =============================================================================
# TOOL HANDLERS
# =============================================================================

# In-memory storage (use database in production)
carts: Dict[str, List[Dict[str, Any]]] = {}
products_db: List[Dict[str, Any]] = [
    {"id": "1", "name": "Wireless Headphones", "price": 79.99, "rating": 4.5, "image": "https://example.com/headphones.jpg"},
    {"id": "2", "name": "Smart Watch", "price": 199.99, "rating": 4.7, "image": "https://example.com/watch.jpg"},
    {"id": "3", "name": "Bluetooth Speaker", "price": 49.99, "rating": 4.3, "image": "https://example.com/speaker.jpg"},
]


def _get_or_create_cart(cart_id: str | None) -> str:
    """Get existing cart or create new one."""
    if cart_id and cart_id in carts:
        return cart_id
    new_id = cart_id or uuid4().hex
    carts.setdefault(new_id, [])
    return new_id


async def _handle_call_tool(req: types.CallToolRequest) -> types.ServerResult:
    """Route and handle all tool calls."""
    tool_name = req.params.name
    args = req.params.arguments or {}

    if tool_name == "search-products":
        payload = ProductSearchInput.model_validate(args)
        # Filter products (simplified)
        results = products_db[:payload.limit]

        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Found {len(results)} products matching '{payload.query}'",
                    )
                ],
                structuredContent={"products": results, "query": payload.query},
                _meta=_carousel_meta(),
            )
        )

    elif tool_name == "add-to-cart":
        payload = AddToCartInput.model_validate(args)
        cart_id = _get_or_create_cart(payload.cart_id)

        # Find product and add to cart
        product = next((p for p in products_db if p["id"] == payload.product_id), None)
        if product:
            cart_item = {**product, "quantity": payload.quantity}
            carts[cart_id].append(cart_item)

        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Added {payload.quantity} item(s) to cart",
                    )
                ],
                structuredContent={
                    "cartId": cart_id,
                    "items": carts[cart_id],
                    "itemCount": len(carts[cart_id]),
                },
                _meta=_cart_meta(cart_id),
            )
        )

    elif tool_name == "checkout":
        payload = CheckoutInput.model_validate(args)
        cart_items = carts.get(payload.cart_id, [])
        total = sum(item["price"] * item.get("quantity", 1) for item in cart_items)

        # Clear cart after checkout
        order_id = uuid4().hex[:8].upper()
        carts[payload.cart_id] = []

        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Order {order_id} placed successfully! Total: ${total:.2f}",
                    )
                ],
                structuredContent={
                    "orderId": order_id,
                    "total": total,
                    "itemCount": len(cart_items),
                    "status": "confirmed",
                },
                _meta=_checkout_complete_meta(),
            )
        )

    # Unknown tool
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text=f"Unknown tool: {tool_name}")],
            isError=True,
        )
    )


# Register the handler
mcp._mcp_server.request_handlers[types.CallToolRequest] = _handle_call_tool

# =============================================================================
# HTTP APP SETUP
# =============================================================================

app = mcp.streamable_http_app()

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### Requirements (requirements.txt)

```
mcp>=1.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
starlette>=0.27.0
```

---

## Window.openai API Reference

The `window.openai` object is injected into widget iframes and provides the bridge between your UI and ChatGPT.

### TypeScript Type Definitions

```typescript
type DisplayMode = "pip" | "inline" | "fullscreen";

interface OpenAiGlobals {
  // ═══════════════════════════════════════════════════════════════════════════
  // READ-ONLY PROPERTIES
  // ═══════════════════════════════════════════════════════════════════════════

  /** Current theme: "light" or "dark" */
  theme: "light" | "dark";

  /** User's locale (e.g., "en-US") */
  locale: string;

  /** Maximum height available for the widget */
  maxHeight: number;

  /** Current display mode */
  displayMode: DisplayMode;

  /** Input arguments passed to the tool */
  toolInput: Record<string, unknown>;

  /** Structured output returned by the tool (your data!) */
  toolOutput: Record<string, unknown> | null;

  /** Persisted widget state from previous renders */
  widgetState: Record<string, unknown> | null;

  // ═══════════════════════════════════════════════════════════════════════════
  // METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Persist state across widget re-renders and conversation turns.
   * This state is also visible to the model.
   */
  setWidgetState: (state: unknown) => Promise<void>;

  /**
   * Call another tool on your MCP server.
   * Tool must be marked as callable by component on server side.
   */
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<{ result: string }>;

  /**
   * Inject a follow-up message into the conversation.
   * Useful for asking questions or requesting confirmation.
   */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

  /**
   * Open an external URL in a new tab/window.
   * Configure allowed domains via openai/widgetCSP.redirect_domains metadata.
   */
  openExternal: (payload: { href: string }) => void;

  /**
   * Request a different display mode for the widget.
   * Returns the actual mode granted (may differ from requested).
   */
  requestDisplayMode: (args: {
    mode: DisplayMode
  }) => Promise<{ mode: DisplayMode }>;

  /**
   * Open a modal with another widget template.
   * Useful for checkout flows, detail views, etc.
   */
  requestModal: (args: {
    title?: string;
    template?: string;  // e.g., "ui://widget/checkout.html"
    params?: unknown;
  }) => Promise<unknown>;

  /**
   * Request to close the widget.
   * Use after completing a flow (e.g., successful checkout).
   */
  requestClose: () => Promise<void>;
}

declare global {
  interface Window {
    openai: OpenAiGlobals;
  }
}
```

### Usage Examples

```typescript
// Read tool output data
const products = window.openai.toolOutput?.products ?? [];

// Check current theme
if (window.openai.theme === "dark") {
  document.body.classList.add("dark-mode");
}

// Persist state for later
await window.openai.setWidgetState({
  selectedProductId: "123",
  cartItems: [{ id: "123", quantity: 2 }]
});

// Call another tool
const result = await window.openai.callTool("add-to-cart", {
  productId: "123",
  quantity: 1
});

// Send a follow-up message
await window.openai.sendFollowUpMessage({
  prompt: "I've selected the blue variant. Can you confirm the price?"
});

// Request fullscreen mode
const { mode } = await window.openai.requestDisplayMode({ mode: "fullscreen" });

// Open checkout modal
await window.openai.requestModal({
  title: "Checkout",
  template: "ui://widget/checkout.html",
  params: { cartId: "abc123" }
});

// Open external link (for payment processing, etc.)
window.openai.openExternal({ href: "https://checkout.example.com/pay" });

// Close widget after completion
await window.openai.requestClose();
```

---

## React Hooks for Widgets

### useOpenAiGlobal Hook

Subscribes to `window.openai` properties reactively:

```typescript
// hooks/use-openai-global.ts
import { useSyncExternalStore } from "react";

const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

type OpenAiGlobalKey =
  | "theme"
  | "locale"
  | "maxHeight"
  | "displayMode"
  | "toolInput"
  | "toolOutput"
  | "widgetState";

/**
 * React hook to subscribe to window.openai properties.
 * Automatically re-renders when the property changes.
 */
export function useOpenAiGlobal<K extends OpenAiGlobalKey>(
  key: K
): Window["openai"][K] | null {
  return useSyncExternalStore(
    // Subscribe function
    (onChange) => {
      if (typeof window === "undefined") return () => {};

      const handleSetGlobal = (event: CustomEvent<{ globals: Partial<Window["openai"]> }>) => {
        if (event.detail.globals[key] !== undefined) {
          onChange();
        }
      };

      window.addEventListener(
        SET_GLOBALS_EVENT_TYPE,
        handleSetGlobal as EventListener
      );

      return () => {
        window.removeEventListener(
          SET_GLOBALS_EVENT_TYPE,
          handleSetGlobal as EventListener
        );
      };
    },
    // Get snapshot (client)
    () => window.openai?.[key] ?? null,
    // Get server snapshot (SSR)
    () => null
  );
}

// Convenience hooks for common properties
export const useTheme = () => useOpenAiGlobal("theme");
export const useLocale = () => useOpenAiGlobal("locale");
export const useToolInput = () => useOpenAiGlobal("toolInput");
export const useToolOutput = () => useOpenAiGlobal("toolOutput");
export const useDisplayMode = () => useOpenAiGlobal("displayMode");
```

### useWidgetState Hook

Manages persistent widget state:

```typescript
// hooks/use-widget-state.ts
import { useCallback, useEffect, useState, type SetStateAction } from "react";
import { useOpenAiGlobal } from "./use-openai-global";

/**
 * React hook for managing widget state that persists across re-renders
 * and is shared with the ChatGPT model.
 *
 * @param defaultState - Initial state if no persisted state exists
 * @returns [state, setState] tuple similar to useState
 */
export function useWidgetState<T extends Record<string, unknown>>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void] {
  // Get persisted state from window.openai
  const widgetStateFromWindow = useOpenAiGlobal("widgetState") as T | null;

  // Local state initialized from window or default
  const [widgetState, _setWidgetState] = useState<T>(() => {
    if (widgetStateFromWindow) {
      return widgetStateFromWindow;
    }
    return typeof defaultState === "function" ? defaultState() : defaultState;
  });

  // Sync when window state changes (e.g., on re-render from new tool call)
  useEffect(() => {
    if (widgetStateFromWindow) {
      _setWidgetState(widgetStateFromWindow);
    }
  }, [widgetStateFromWindow]);

  // Setter that also persists to window.openai
  const setWidgetState = useCallback((state: SetStateAction<T>) => {
    _setWidgetState((prev) => {
      const newState = typeof state === "function" ? state(prev) : state;

      // Persist to window.openai (async, fire-and-forget)
      window.openai?.setWidgetState?.(newState).catch(console.error);

      return newState;
    });
  }, []);

  return [widgetState, setWidgetState] as const;
}
```

### useCallTool Hook

Simplified tool calling with loading state:

```typescript
// hooks/use-call-tool.ts
import { useCallback, useState } from "react";

interface UseCallToolResult<T> {
  call: (args: Record<string, unknown>) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for calling MCP tools with loading and error states.
 */
export function useCallTool<T = unknown>(toolName: string): UseCallToolResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(async (args: Record<string, unknown>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.openai.callTool(toolName, args);
      return JSON.parse(response.result) as T;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Tool call failed: ${toolName}`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toolName]);

  return { call, loading, error };
}
```

---

## UI Components & Widgets

### Basic Widget HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Widget</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Respect system theme */
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./component.js"></script>
</body>
</html>
```

### React Widget Entry Point

```tsx
// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Wait for window.openai to be available
function waitForOpenAI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.openai) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (window.openai) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document, { childList: true, subtree: true });

    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 5000);
  });
}

async function mount() {
  await waitForOpenAI();

  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

mount();
```

---

## Product Carousel Implementation

### Complete Carousel Component

```tsx
// components/ProductCarousel.tsx
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Star, ShoppingCart } from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  rating?: number;
  image: string;
  description?: string;
}

interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product);
  }, [product, onAddToCart]);

  return (
    <div className="min-w-[220px] max-w-[220px] w-[65vw] sm:w-[220px] self-stretch flex flex-col">
      {/* Product Image */}
      <div className="w-full">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square rounded-2xl object-cover ring ring-black/5 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col flex-1">
        <h3 className="text-base font-medium truncate line-clamp-1">
          {product.name}
        </h3>

        <div className="text-xs mt-1 text-black/60 dark:text-white/60 flex items-center gap-1">
          {product.rating && (
            <>
              <Star className="h-3 w-3 fill-current text-yellow-500" aria-hidden="true" />
              <span>{product.rating.toFixed(1)}</span>
            </>
          )}
          <span className="font-semibold">${product.price.toFixed(2)}</span>
        </div>

        {product.description && (
          <p className="text-sm mt-2 text-black/80 dark:text-white/80 line-clamp-2 flex-auto">
            {product.description}
          </p>
        )}

        {/* Add to Cart Button */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAROUSEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Update navigation button states
  useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No products found
      </div>
    );
  }

  return (
    <div className="antialiased relative w-full py-5 bg-white dark:bg-gray-900">
      {/* Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Left Edge Gradient */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 z-[5] transition-opacity duration-200 ${
          canPrev ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full w-full bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, white 20%, white 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Right Edge Gradient */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 z-[5] transition-opacity duration-200 ${
          canNext ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full w-full bg-gradient-to-l from-white dark:from-gray-900 to-transparent"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, white 20%, white 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Previous Button */}
      {canPrev && (
        <button
          aria-label="Previous products"
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}

      {/* Next Button */}
      {canNext && (
        <button
          aria-label="Next products"
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
```

### Carousel Widget App

```tsx
// App.tsx - Carousel Widget Entry
import React, { useCallback } from "react";
import { ProductCarousel } from "./components/ProductCarousel";
import { useToolOutput, useTheme } from "./hooks/use-openai-global";
import { useCallTool } from "./hooks/use-call-tool";

export function App() {
  const theme = useTheme();
  const toolOutput = useToolOutput();
  const addToCartTool = useCallTool("add-to-cart");

  // Extract products from tool output
  const products = (toolOutput?.products as Product[]) ?? [];

  // Handle add to cart
  const handleAddToCart = useCallback(async (product: Product) => {
    const result = await addToCartTool.call({
      productId: product.id,
      quantity: 1,
    });

    if (result) {
      // Optionally send a follow-up message
      await window.openai.sendFollowUpMessage({
        prompt: `Added ${product.name} to cart!`,
      });
    }
  }, [addToCartTool]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <ProductCarousel
        products={products}
        onAddToCart={handleAddToCart}
      />

      {addToCartTool.loading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Adding to cart...
        </div>
      )}
    </div>
  );
}
```

### Carousel Design Guidelines

| Guideline | Recommendation |
|-----------|----------------|
| **Item count** | 3-8 items for easy scanning |
| **Text lines** | Maximum 3 lines per card |
| **Actions** | Single primary CTA per card |
| **Images** | Consistent aspect ratios (1:1 recommended) |
| **Card width** | 200-250px for optimal visibility |
| **Scrolling** | Show navigation arrows only when scrollable |

---

## Shopping Cart & Checkout

### Cart State Types

```typescript
// types/cart.ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}

export interface CartWidgetState {
  view: "cart" | "checkout" | "confirmation";
  cartItems: CartItem[];
  selectedItemId: string | null;
}

// Fee constants
export const FEES = {
  SERVICE: 3.00,
  DELIVERY: 2.99,
  TAX_RATE: 0.0875, // 8.75%
} as const;
```

### Shopping Cart Component

```tsx
// components/ShoppingCart.tsx
import React, { useCallback, useMemo } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useWidgetState } from "../hooks/use-widget-state";
import { CartItem, CartWidgetState, FEES } from "../types/cart";

export function ShoppingCart() {
  const [state, setState] = useWidgetState<CartWidgetState>({
    view: "cart",
    cartItems: [],
    selectedItemId: null,
  });

  // Calculate totals
  const { subtotal, tax, total, itemCount } = useMemo(() => {
    const subtotal = state.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * FEES.TAX_RATE;
    const total = subtotal + tax + FEES.SERVICE + FEES.DELIVERY;
    const itemCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  }, [state.cartItems]);

  // Adjust item quantity
  const adjustQuantity = useCallback((itemId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      cartItems: prev.cartItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  }, [setState]);

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      cartItems: prev.cartItems.filter((item) => item.id !== itemId),
    }));
  }, [setState]);

  // Proceed to checkout
  const handleCheckout = useCallback(async () => {
    setState((prev) => ({ ...prev, view: "checkout" }));

    // Or open a modal for checkout
    await window.openai.requestModal({
      title: "Checkout",
      template: "ui://widget/checkout.html",
      params: {
        cartItems: state.cartItems,
        subtotal,
        total,
      },
    });
  }, [setState, state.cartItems, subtotal, total]);

  // Continue to external payment
  const handleExternalPayment = useCallback(() => {
    // Opens in new tab, configured via openai/widgetCSP.redirect_domains
    window.openai.openExternal({
      href: `https://checkout.example.com/pay?amount=${total.toFixed(2)}`,
    });
  }, [total]);

  if (state.cartItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Cart Items */}
      <div className="space-y-3">
        {state.cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{item.name}</h4>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => adjustQuantity(item.id, -1)}
                  className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  onClick={() => adjustQuantity(item.id, 1)}
                  className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service fee</span>
          <span>${FEES.SERVICE.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery</span>
          <span>${FEES.DELIVERY.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
```

### Checkout Flow with External Payment

```tsx
// components/CheckoutPanel.tsx
import React, { useCallback } from "react";
import { CreditCard, MapPin, Truck } from "lucide-react";

interface CheckoutPanelProps {
  subtotal: number;
  total: number;
  onContinueToPayment: () => void;
}

export function CheckoutPanel({ subtotal, total, onContinueToPayment }: CheckoutPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Delivery Address */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="font-medium">John Doe</p>
          <p className="text-sm text-gray-600">1234 Main St, San Francisco, CA 94102</p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Truck className="h-4 w-4" />
          Shipping Method
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left">
            <p className="font-medium">Standard</p>
            <p className="text-xs text-gray-500">3-5 business days</p>
            <p className="text-sm font-semibold text-green-600 mt-1">Free</p>
          </button>
          <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-left hover:border-gray-300">
            <p className="font-medium">Express</p>
            <p className="text-xs text-gray-500">1-2 business days</p>
            <p className="text-sm font-semibold mt-1">$9.99</p>
          </button>
        </div>
      </section>

      {/* Payment */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4" />
          Payment
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
          <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded" />
          <div>
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-500">Expires 12/25</p>
          </div>
        </div>
      </section>

      {/* Order Summary */}
      <section className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </section>

      {/* Place Order Button */}
      <button
        onClick={onContinueToPayment}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
      >
        Place Order - ${total.toFixed(2)}
      </button>
    </div>
  );
}
```

### Processing Checkout via Tool Call

```typescript
// Checkout handler in widget
const handlePlaceOrder = useCallback(async () => {
  setProcessing(true);

  try {
    // Call the checkout tool
    const result = await window.openai.callTool("checkout", {
      cartId: cartId,
    });

    // Tool response will include openai/closeWidget: true
    // Widget will auto-close and show confirmation

    // Optionally send follow-up
    await window.openai.sendFollowUpMessage({
      prompt: "My order has been placed! Can you confirm the details?",
    });

  } catch (error) {
    console.error("Checkout failed:", error);
    // Handle error...
  } finally {
    setProcessing(false);
  }
}, [cartId]);
```

---

## State Management

### Three Categories of State

| Type | Scope | Persistence | Storage | Examples |
|------|-------|-------------|---------|----------|
| **Business Data** | MCP Server | Long-term | Database | Orders, user profiles, inventory |
| **Widget State** | Widget instance | Session | `window.openai.widgetState` | Selected items, expanded panels, form inputs |
| **Session State** | Conversation | Across turns | `widgetSessionId` | Cart contents, booking progress |

### Widget State Best Practices

```typescript
// ✅ DO: Initialize with sensible defaults
const [state, setState] = useWidgetState<CartState>({
  items: [],
  selectedId: null,
  view: "browse",
});

// ✅ DO: Update atomically
const addItem = useCallback((item: Item) => {
  setState((prev) => ({
    ...prev,
    items: [...prev.items, item],
  }));
}, [setState]);

// ✅ DO: Use widgetSessionId for cart correlation
// In MCP server response:
_meta = {
  "openai/outputTemplate": "ui://widget/cart.html",
  "openai/widgetSessionId": cart_id,  // Links state across turns
}

// ❌ DON'T: Store sensitive data in widget state
// Widget state is visible to the model

// ❌ DON'T: Expect widget state to persist across conversations
// It only persists within a single conversation
```

### Session Correlation Pattern

```python
# MCP Server: Correlate state across conversation turns

async def handle_add_to_cart(req: types.CallToolRequest) -> types.ServerResult:
    payload = AddToCartInput.model_validate(req.params.arguments or {})

    # Get or create cart (persisted on server)
    cart_id = payload.cart_id or uuid4().hex
    cart = get_or_create_cart(cart_id)

    # Add item
    cart.add_item(payload.product_id, payload.quantity)

    return types.ServerResult(
        types.CallToolResult(
            content=[...],
            structuredContent={
                "cartId": cart_id,
                "items": cart.items,
            },
            _meta={
                "openai/outputTemplate": "ui://widget/cart.html",
                "openai/widgetSessionId": cart_id,  # CRITICAL: correlates state
            },
        )
    )
```

---

## MCP Metadata Reference

### Complete Metadata Fields

| Field | Type | Purpose |
|-------|------|---------|
| `openai/outputTemplate` | `string` | URI pointing to widget HTML (e.g., `"ui://widget/carousel.html"`) |
| `openai/toolInvocation/invoking` | `string` | Loading message shown during tool execution |
| `openai/toolInvocation/invoked` | `string` | Message shown when tool completes |
| `openai/widgetAccessible` | `boolean` | Whether widget is accessible to screen readers |
| `openai/widgetSessionId` | `string` | Session ID for state correlation across turns |
| `openai/closeWidget` | `boolean` | Auto-close widget after response is displayed |
| `openai/widgetCSP.redirect_domains` | `string[]` | Whitelisted domains for `openExternal()` |

### Usage Examples

```python
# Standard widget metadata
def _widget_meta() -> Dict[str, Any]:
    return {
        "openai/outputTemplate": "ui://widget/my-widget.html",
        "openai/toolInvocation/invoking": "Loading...",
        "openai/toolInvocation/invoked": "Ready",
        "openai/widgetAccessible": True,
    }

# Cart with session correlation
def _cart_meta(cart_id: str) -> Dict[str, Any]:
    return {
        "openai/outputTemplate": "ui://widget/cart.html",
        "openai/widgetSessionId": cart_id,
        "openai/widgetAccessible": True,
    }

# Checkout completion (auto-close)
def _checkout_complete_meta() -> Dict[str, Any]:
    return {
        "openai/outputTemplate": "ui://widget/confirmation.html",
        "openai/closeWidget": True,  # Widget closes after display
        "openai/widgetAccessible": True,
    }

# External payment with whitelisted domain
def _payment_meta() -> Dict[str, Any]:
    return {
        "openai/outputTemplate": "ui://widget/payment.html",
        "openai/widgetCSP.redirect_domains": [
            "https://checkout.stripe.com",
            "https://pay.example.com",
        ],
    }
```

---

## Styling Guidelines

### Design System Setup

```bash
# Install the official Apps SDK UI library
npm install @openai/apps-sdk-ui
```

### Essential Imports

```tsx
// UI Components
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { Card } from "@openai/apps-sdk-ui/components/Card";

// Icons (use Lucide for consistency)
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  MapPin,
  CreditCard,
} from "lucide-react";

// Carousel
import useEmblaCarousel from "embla-carousel-react";
```

### Color Guidelines

| Do | Don't |
|----|-------|
| Use system colors for text, icons, spatial elements | Override text/backgrounds with brand colors |
| Limit brand accents to logos, icons, primary buttons | Use custom gradients |
| Follow theme from `window.openai.theme` | Ignore theme changes |
| Use CSS variables for theming | Hardcode color values |

### CSS Variables for Theming

```css
/* Base styles that adapt to ChatGPT theme */
:root {
  color-scheme: light dark;
}

body {
  /* Inherit system font stack */
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;

  /* Use CSS variables for colors */
  background-color: var(--background, #ffffff);
  color: var(--foreground, #000000);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --foreground: #ffffff;
  }
}

/* Or use theme from window.openai */
.dark {
  --background: #1a1a1a;
  --foreground: #ffffff;
}
```

### Spacing & Layout

```css
/* Use consistent spacing scale */
.card {
  padding: 16px;
  border-radius: 12px; /* var(--radius-lg) */
  gap: 12px;
}

/* Respect safe area insets on mobile */
.container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Maximum content width */
.content {
  max-width: 480px;
  margin: 0 auto;
}
```

### Display Modes

| Mode | Use Case | Guidelines |
|------|----------|------------|
| **Inline** | Single actions, small data, carousels | Max 2 primary actions, no deep navigation |
| **Fullscreen** | Rich multi-step workflows, maps, galleries | Maintain chat sheet for context |
| **Picture-in-Picture** | Persistent floating activities | Auto-close when sessions end |

```typescript
// Request fullscreen for complex views
await window.openai.requestDisplayMode({ mode: "fullscreen" });

// Return to inline after completion
await window.openai.requestDisplayMode({ mode: "inline" });
```

### Accessibility Requirements

- **WCAG AA contrast** - Maintain minimum contrast ratios
- **Text resizing** - Support up to 200% text scaling without layout breakage
- **Alt text** - Include descriptive alt text for all images
- **Semantic HTML** - Use proper heading hierarchy, button elements, etc.
- **Keyboard navigation** - Ensure all interactive elements are keyboard accessible
- **Screen reader support** - Set `openai/widgetAccessible: true` in metadata

---

## UX Principles

### Strong Use Cases for ChatGPT Apps

- Booking rides, flights, hotels
- Ordering food and delivery
- Checking availability and schedules
- Tracking deliveries and orders
- Product search and comparison
- Quick transactions and payments

### Weak Use Cases (Avoid)

- Long-form website content
- Complex multi-step wizards with deep navigation
- Advertising or promotional content
- Features duplicating ChatGPT's built-in functions
- Data entry forms better suited for traditional web

### Five Design Principles

1. **Extract, Don't Port**
   - Focus on core user jobs
   - Expose only essential inputs/outputs
   - Don't replicate your entire website

2. **Design for Conversational Entry**
   - Support open-ended prompts ("Show me headphones under $100")
   - Support direct commands ("Add the Sony headphones to cart")
   - Let the model interpret user intent

3. **Design for ChatGPT Environment**
   - Use UI strategically for clarification and results
   - Keep inline widgets compact
   - Expand to fullscreen only when necessary

4. **Optimize for Conversation, Not Navigation**
   - Keep responses concise
   - Suggest natural follow-ups
   - Avoid deep navigation hierarchies

5. **Embrace the Ecosystem**
   - Accept rich natural language input
   - Personalize from conversation context
   - Let the model do the heavy lifting

### Pre-Publication Checklist

- [ ] Primary capability leverages ChatGPT's conversational strengths
- [ ] Provides knowledge/actions unavailable in base ChatGPT
- [ ] Tools are atomic and model-friendly (clear inputs/outputs)
- [ ] Custom UI is truly necessary (not just text responses)
- [ ] Users can complete tasks without leaving ChatGPT
- [ ] Response time supports conversational rhythm (<3s ideal)
- [ ] Tested on both web and mobile viewports
- [ ] Accessibility requirements met (contrast, keyboard, screen readers)

---

## Deployment

### Recommended Project Structure

```
my-chatgpt-app/
├── server/                    # MCP Server (Python)
│   ├── main.py               # Server entry point
│   ├── tools/                # Tool handlers
│   │   ├── __init__.py
│   │   ├── products.py
│   │   └── cart.py
│   ├── models/               # Pydantic models
│   │   └── schemas.py
│   └── requirements.txt
│
├── web/                       # Widget Frontend (React)
│   ├── src/
│   │   ├── index.tsx         # Entry point
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ProductCarousel.tsx
│   │   │   ├── ShoppingCart.tsx
│   │   │   └── Checkout.tsx
│   │   ├── hooks/
│   │   │   ├── use-openai-global.ts
│   │   │   ├── use-widget-state.ts
│   │   │   └── use-call-tool.ts
│   │   └── types/
│   │       └── index.ts
│   ├── dist/                  # Build output
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── assets/                    # Compiled widget HTML bundles
│   ├── product-carousel.html
│   ├── shopping-cart.html
│   └── checkout.html
│
└── README.md
```

### Building Widgets

```bash
# Install dependencies
cd web
pnpm install

# Development (with hot reload)
pnpm run dev

# Production build
pnpm run build

# Output goes to dist/ or assets/
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Single bundle for each widget
    rollupOptions: {
      input: {
        "product-carousel": "src/widgets/product-carousel.tsx",
        "shopping-cart": "src/widgets/shopping-cart.tsx",
        "checkout": "src/widgets/checkout.tsx",
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    // Inline assets for single-file widgets
    assetsInlineLimit: 100000,
  },
});
```

### Environment Variables

```bash
# .env
# Server URL for production
BASE_URL=https://your-domain.com

# Security settings
MCP_ALLOWED_HOSTS=your-domain.com
MCP_ALLOWED_ORIGINS=https://chat.openai.com

# Development
DEBUG=true
```

### Local Development with ngrok

```bash
# Terminal 1: Start MCP server
cd server
python -m uvicorn main:app --port 8000 --reload

# Terminal 2: Start widget dev server
cd web
pnpm run dev  # Usually http://localhost:5173

# Terminal 3: Tunnel server with ngrok
ngrok http 8000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Configure in ChatGPT developer settings
```

### ChatGPT Integration Steps

1. Enable **Developer Mode** in ChatGPT settings
2. Navigate to **Settings > Connectors**
3. Click **Add Connector**
4. Enter your MCP server URL (ngrok URL for development)
5. Save and test with sample prompts

### Production Deployment

```bash
# Docker example
FROM python:3.11-slim

WORKDIR /app

COPY server/requirements.txt .
RUN pip install -r requirements.txt

COPY server/ .
COPY assets/ ./assets/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Official Resources

### Documentation

| Resource | URL |
|----------|-----|
| **Apps SDK Documentation** | https://developers.openai.com/apps-sdk |
| **Build your ChatGPT UI** | https://developers.openai.com/apps-sdk/build/chatgpt-ui |
| **MCP Server Concepts** | https://developers.openai.com/apps-sdk/concepts/mcp-server |
| **UI Guidelines** | https://developers.openai.com/apps-sdk/concepts/ui-guidelines |
| **Apps SDK Reference** | https://developers.openai.com/apps-sdk/reference |

### Code & Design

| Resource | URL |
|----------|-----|
| **GitHub Examples** | https://github.com/openai/openai-apps-sdk-examples |
| **Apps SDK UI Library** | https://openai.github.io/apps-sdk-ui |
| **Figma Components** | https://www.figma.com/community/file/1560064615791108827 |
| **MCP Specification** | https://modelcontextprotocol.io |

### Key Example Apps

- **Pizzaz** - E-commerce with carousel, cart, checkout flow
- **Kitchen Sink** - Demonstrates all UI patterns and APIs
- **Maps** - Fullscreen display mode example

---

## Quick Reference Card

### window.openai Methods

```typescript
// Get data
window.openai.toolOutput     // Tool response data
window.openai.toolInput      // Original tool arguments
window.openai.widgetState    // Persisted state
window.openai.theme          // "light" | "dark"
window.openai.locale         // e.g., "en-US"
window.openai.displayMode    // "inline" | "fullscreen" | "pip"

// Actions
await window.openai.setWidgetState(state)
await window.openai.callTool(name, args)
await window.openai.sendFollowUpMessage({ prompt })
await window.openai.requestDisplayMode({ mode })
await window.openai.requestModal({ title, template, params })
await window.openai.requestClose()
window.openai.openExternal({ href })
```

### Essential Metadata

```python
_meta = {
    "openai/outputTemplate": "ui://widget/name.html",
    "openai/toolInvocation/invoking": "Loading...",
    "openai/toolInvocation/invoked": "Done",
    "openai/widgetAccessible": True,
    "openai/widgetSessionId": session_id,    # State correlation
    "openai/closeWidget": True,               # Auto-close
    "openai/widgetCSP.redirect_domains": [],  # External links
}
```

### React Hooks

```typescript
import { useOpenAiGlobal } from "./hooks/use-openai-global";
import { useWidgetState } from "./hooks/use-widget-state";
import { useCallTool } from "./hooks/use-call-tool";

const theme = useOpenAiGlobal("theme");
const toolOutput = useOpenAiGlobal("toolOutput");
const [state, setState] = useWidgetState(defaultState);
const { call, loading, error } = useCallTool("tool-name");
```

---

*This guide combines official OpenAI documentation, the Apps SDK examples repository, and community best practices. For the latest updates, always refer to the official documentation at https://developers.openai.com/apps-sdk*

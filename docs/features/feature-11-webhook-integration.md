# Feature 11: Webhook Integration

**Goal**: Implement webhook delivery for post-purchase events between merchant and client agent.

## Architecture

In ACP, the **client agent exposes a webhook endpoint** that the **merchant calls** for order lifecycle updates:

```
Merchant Backend                    Client Agent (UI)
      │                                   │
      │  1. Order status changes          │
      │  2. Generate message via          │
      │     Post-Purchase Agent           │
      │                                   │
      │  POST /api/webhooks/acp           │
      │  {type: "shipping_update", ...}   │
      │ ─────────────────────────────────▶│
      │                                   │
      │       200 OK {received: true}     │
      │ ◀─────────────────────────────────│
      │                                   │
      │                            3. UI displays
      │                               notification
```

## Configuration

```env
# Merchant backend (env.example)
WEBHOOK_URL=http://localhost:3000/api/webhooks/acp
WEBHOOK_SECRET=whsec_demo_secret

# Client UI (src/ui/env.example)
WEBHOOK_SECRET=whsec_demo_secret
```

## Webhook Event Schema

Standard ACP events:
```json
{
  "type": "order_created|order_updated",
  "data": {
    "type": "order",
    "checkout_session_id": "checkout_abc123",
    "permalink_url": "https://shop.example.com/orders/123",
    "status": "created|confirmed|shipped|fulfilled|canceled",
    "refunds": []
  }
}
```

Extended shipping_update event (for Post-Purchase Agent messages):
```json
{
  "type": "shipping_update",
  "data": {
    "type": "shipping_update",
    "checkout_session_id": "cs_abc123",
    "order_id": "order_xyz789",
    "status": "order_shipped",
    "language": "en",
    "subject": "Your Classic Tee is on its way! 🚚",
    "message": "Hey John! Great news...",
    "tracking_url": "https://track.example.com/abc123"
  }
}
```

## Tasks

**Client-Side (UI):**
- [x] Create webhook API route (`src/ui/app/api/webhooks/acp/route.ts`)
- [x] Implement HMAC signature verification
- [x] Create webhook event types: `order_created`, `order_updated`, `shipping_update`
- [x] Create `useWebhookNotifications` hook for UI integration
- [x] Support polling for new notifications

**Agent Activity Panel Integration:**
- [x] Display post-purchase messages in Agent Activity panel
- [x] Show webhook POST events in Merchant Panel
- [x] Integrate with checkout flow state machine

**Post-Purchase Agent Proxy:**
- [x] Create Next.js API proxy route for NAT agent (`/api/agents/post-purchase`)
- [x] Handle CORS for browser-to-agent communication
- [x] Trigger post-purchase agent after checkout completion

## Acceptance Criteria

- [x] Client webhook endpoint validates HMAC signatures
- [x] Events include checkout_session_id for association
- [x] Post-purchase messages display in Agent Activity panel
- [x] Webhook POST events logged in Merchant Panel
- [x] LLM generates all messages (no hardcoding)

---

[← Back to Feature Overview](./index.md)

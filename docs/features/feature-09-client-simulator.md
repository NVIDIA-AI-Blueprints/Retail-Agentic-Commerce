# Feature 9: Client Agent Simulator (Frontend)

**Goal**: Build the demo client that simulates ACP client behavior.

## Technology Stack

- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- shadcn/ui components

## User Flows

### Search Flow
1. User enters prompt (e.g., "find some t-shirts")
2. Simulator displays 4 product cards

### Checkout Flow
1. User clicks a product card
2. Simulator calls `POST /checkout_sessions`
3. User completes checkout steps

## Tasks

- [ ] Initialize Next.js project
- [ ] Create search input component
- [ ] Create product card component (image, name, price)
- [ ] Display 4 products from API
- [ ] Implement "Buy" action that triggers ACP checkout
- [ ] Create checkout flow UI:
  - Shipping address form
  - Fulfillment option selection
  - Payment form (simulated)
  - Order confirmation

## Acceptance Criteria

- Search displays 4 product cards
- Clicking product initiates checkout
- Full checkout flow works end-to-end
- UI is responsive and modern

---

[← Back to Feature Overview](./index.md)

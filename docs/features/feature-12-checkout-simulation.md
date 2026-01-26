# Feature 12: Agent Panel Checkout Flow Simulation

**Goal**: Implement an animated, multi-state checkout flow simulation within the Agent Panel that demonstrates the complete purchase journey from product selection to order confirmation.

## State Machine

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Product Grid   │────▶│    Checkout     │────▶│    Payment      │────▶│  Confirmation   │
│    Selection    │     │   (Shipping)    │     │   Processing    │     │    Complete     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       │                                               │
        └───────────────────────┴───────────────────────────────────────────────┘
                                      (Start Over)
```

## UI States

### State 1: Product Grid Selection
- Display product cards in a responsive grid layout
- Each card shows: product image, name, variant (color/size), price, merchant name
- User prompt/message displayed above product grid
- Clicking a product card transitions to checkout state

### State 2: Checkout (Shipping & Cart Review)
- Animated transition from product grid to single checkout card
- Merchant header with logo/icon and name
- Selected product with:
  - Thumbnail image
  - Product name and variant
  - Price
  - Quantity selector (+/- controls)
- Shipping section:
  - Dropdown to select shipping option
  - Options include delivery timeframe and cost (e.g., "Standard 5-7 business days $5.00")
- Order summary:
  - Total due today (prominent)
  - Subtotal breakdown
  - Shipping cost
- Pay button with saved payment method indicator (e.g., card ending in 4242)

### State 3: Shipping Options Expanded
- Dropdown expands to show available shipping options
- Each option displays: name, delivery timeframe, price
- Selected option indicated with checkmark
- Selecting an option updates the order total

### State 4: Order Confirmation
- Animated transition to confirmation state
- Success header with green checkmark and "Purchase complete" text
- Order details card:
  - Product thumbnail and details
  - Quantity ordered
  - Estimated delivery date
  - Merchant name ("Sold by")
  - Amount paid
- Confirmation message below card with next steps

## Animation Requirements

All state transitions must include smooth animations:

- **Product to Checkout**: Product cards fade/scale out, checkout card slides/fades in
- **Shipping Dropdown**: Smooth expand/collapse animation
- **Checkout to Confirmation**: Checkout card morphs into confirmation card with success indicator animation
- **State Reset**: Fade transition back to product grid

Recommended animation properties:
- Duration: 300-400ms for major transitions
- Easing: ease-out or custom cubic-bezier for natural feel
- Use CSS transitions or Framer Motion for React

## Tasks

- [x] Create checkout flow state machine (React useState/useReducer)
- [x] Implement ProductGrid component with animated card selection
- [x] Implement CheckoutCard component with:
  - [x] Product summary section
  - [x] Quantity selector with +/- controls
  - [x] Shipping dropdown with animated expand/collapse
  - [x] Order total calculation
  - [x] Pay button with payment method display
- [x] Implement ConfirmationCard component with:
  - [x] Success header with animated checkmark
  - [x] Order summary details
  - [x] Estimated delivery display
  - [x] Confirmation message
- [x] Add transition animations between all states
- [x] Integrate with existing AgentPanel component
- [ ] Connect to ACP checkout session API for real data (uses mock data currently)

## Acceptance Criteria

- [x] Product grid displays available products with images and pricing
- [x] Clicking a product smoothly transitions to checkout view
- [x] Quantity can be adjusted with +/- controls
- [x] Shipping options dropdown expands/collapses with animation
- [x] Selecting shipping option updates total price
- [x] Pay button triggers transition to confirmation state
- [x] Confirmation shows order details with estimated delivery
- [x] All state transitions have smooth, polished animations
- [x] User can start a new checkout flow after confirmation

---

[← Back to Feature Overview](./index.md)

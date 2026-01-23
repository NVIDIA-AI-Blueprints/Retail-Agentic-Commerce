---
name: validation
description: Validate ACP services and UI using Chrome MCP for browser testing, Kaizen UI MCP for NVIDIA styling, and curl for API endpoints. Use when starting development, testing changes, running health checks, or validating the checkout flow.
---

# ACP Validation

Validates all Agentic Commerce Protocol services and UI before development or after changes.

## Service Ports Reference

| Service | Port | Health Endpoint |
|---------|------|-----------------|
| UI (Next.js) | 3000 | http://localhost:3000 |
| Merchant API | 8000 | http://localhost:8000/health |
| Payment (PSP) | 8001 | http://localhost:8001/health |
| Promotion Agent | 8002 | http://localhost:8002/health |
| Post-Purchase Agent | 8003 | http://localhost:8003/health |

## Phase 1: Service Health Checks

Run these curl commands to verify all backend services are operational.

### Merchant API (port 8000)

```bash
curl -s http://localhost:8000/health | jq
```

Expected response:
```json
{"status": "healthy"}
```

### Payment Service (port 8001)

```bash
curl -s http://localhost:8001/health | jq
```

Expected response:
```json
{"status": "healthy"}
```

### Promotion Agent (port 8002)

```bash
curl -s http://localhost:8002/health | jq
```

Expected: 200 OK or agent-specific health response.

### Post-Purchase Agent (port 8003)

```bash
curl -s http://localhost:8003/health | jq
```

Expected: 200 OK or agent-specific health response.

### Quick Health Check (All Services)

```bash
echo "Merchant API (8000):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health
echo "\nPayment PSP (8001):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health
echo "\nPromotion Agent (8002):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/health
echo "\nPost-Purchase Agent (8003):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/health
echo "\nUI (3000):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

All should return `200`.

## Phase 2: API Endpoint Validation

### Create Checkout Session

```bash
curl -X POST http://localhost:8000/checkout_sessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -d '{
    "line_items": [{"product_id": "prod_001", "quantity": 1}],
    "buyer": {"id": "buyer_123", "email": "test@example.com"},
    "fulfillment_address": {
      "line1": "123 Test St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94102",
      "country": "US"
    }
  }' | jq
```

Expected: 201 with session ID and `status: "not_ready_for_payment"`.

### Get Checkout Session

```bash
curl -s http://localhost:8000/checkout_sessions/{session_id} \
  -H "X-API-Key: your-api-key" | jq
```

### Delegate Payment (PSP)

```bash
curl -X POST http://localhost:8001/agentic_commerce/delegate_payment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: psp-api-key-12345" \
  -H "Idempotency-Key: delegate-$(date +%s)" \
  -d '{
    "payment_method": {
      "type": "card",
      "card": {
        "number": "4242424242424242",
        "exp_month": 12,
        "exp_year": 2030,
        "cvc": "123"
      }
    },
    "allowance": {
      "amount": 10000,
      "currency": "USD"
    }
  }' | jq
```

Expected: 201 with `vault_token` and `status: "active"`.

## Phase 3: Browser UI Validation (Chrome MCP)

Use the Chrome MCP server (`cursor-browser-extension` or `cursor-ide-browser`) for UI validation.

### Validation Workflow

1. **List existing tabs** to check browser state:
   ```
   browser_tabs action: "list"
   ```

2. **Navigate to UI**:
   ```
   browser_navigate url: "http://localhost:3000"
   ```

3. **Lock browser** for interactions:
   ```
   browser_lock
   ```

4. **Take snapshot** to verify page loaded:
   ```
   browser_snapshot
   ```

5. **Check console** for JavaScript errors:
   ```
   browser_console_messages level: "error"
   ```

6. **Unlock browser** when done:
   ```
   browser_unlock
   ```

### UI Elements to Verify

After taking a snapshot, verify these elements exist:

- **Navbar**: Logo, navigation links
- **Three-Panel Layout**:
  - Client Agent Panel (left) - Blue badge
  - Merchant Server Panel (center) - Yellow badge  
  - Agent Activity Panel (right) - Green badge
- **Product Grid**: Product cards with images, names, prices
- **Checkout Button**: Visible and clickable

### Interaction Testing

Test the checkout flow:

```
1. browser_snapshot → Find product card
2. browser_click on "Add to Cart" or product
3. browser_snapshot → Verify checkout modal appears
4. browser_fill_form → Enter shipping details
5. browser_click on "Continue" or "Checkout"
6. browser_snapshot → Verify state progression
7. browser_console_messages → Check for errors
```

## Phase 4: Kaizen UI Style Validation

Use the Kaizen UI MCP server for NVIDIA design system compliance.

### Style Checklist

When validating UI components, verify:

- **Colors**: Using NVIDIA brand colors (green #76B900, black #1A1A1A)
- **Typography**: Proper font hierarchy and sizing
- **Spacing**: Consistent padding/margins per design tokens
- **Components**: Following Kaizen/Nebula component patterns
- **Accessibility**: Proper contrast ratios, focus states

### Component Reference

Query the Kaizen UI MCP for component specifications:
- Buttons: Primary, secondary, ghost variants
- Cards: Elevation, border radius, padding
- Forms: Input styling, validation states
- Layout: Grid system, responsive breakpoints

## Phase 5: E2E Checkout Flow

Complete end-to-end validation of the checkout process.

### Flow Steps

1. **Product Selection**
   - Navigate to http://localhost:3000
   - Verify products load from Merchant API
   - Click on a product to select

2. **Checkout Session Creation**
   - Verify session created via Merchant API (port 8000)
   - Check Agent Activity panel for promotion decision

3. **Shipping Selection**
   - Enter/select shipping address
   - Verify session updates to `ready_for_payment`

4. **Payment Delegation**
   - Verify PSP integration (port 8001)
   - Vault token created and returned

5. **Order Completion**
   - Complete checkout
   - Verify session status: `completed`
   - Check for post-purchase agent activity

### Validation Checklist

Copy and track progress:

```
E2E Checkout Validation:
- [ ] All services healthy (Phase 1)
- [ ] API endpoints responding (Phase 2)
- [ ] UI loads without errors (Phase 3)
- [ ] Three-panel layout renders
- [ ] Product grid displays products
- [ ] Checkout modal opens
- [ ] Shipping form submits
- [ ] Payment delegation works
- [ ] Order completes successfully
- [ ] No console errors
- [ ] Kaizen UI styles applied (Phase 4)
```

## Troubleshooting

### Service Not Running

If a health check fails:

```bash
# Check if port is in use
lsof -i :8000  # Merchant
lsof -i :8001  # PSP
lsof -i :8002  # Promotion Agent
lsof -i :8003  # Post-Purchase Agent
lsof -i :3000  # UI
```

### Start Services

```bash
# Terminal 1: Merchant API
uvicorn src.merchant.main:app --reload

# Terminal 2: Payment PSP
uvicorn src.payment.main:app --reload --port 8001

# Terminal 3: Promotion Agent (from src/agents/)
nat serve --config_file configs/promotion.yml --port 8002

# Terminal 4: Post-Purchase Agent (from src/agents/)
nat serve --config_file configs/post-purchase.yml --port 8003

# Terminal 5: UI (from src/ui/)
pnpm run dev
```

### Browser MCP Not Available

If Chrome MCP tools are unavailable:
1. Verify the MCP server is configured in Cursor settings
2. Check the browser extension is installed and connected
3. Manually test the UI in a browser window

### API Authentication Errors

Ensure environment variables are set:
```bash
export API_KEY=your-api-key
export PSP_API_KEY=psp-api-key-12345
```

Or check `src/ui/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PSP_URL=http://localhost:8001
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_PSP_API_KEY=psp-api-key-12345
```

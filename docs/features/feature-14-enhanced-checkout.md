# Feature 14: Enhanced Checkout (Payment & Shipping Information)

**Goal**: Extend the checkout flow to collect and display real payment method details and shipping address information, providing a complete e-commerce experience.

## Current State

The current checkout flow uses hardcoded buyer information and simulated payment details. This feature adds:
- Real payment method input (card number, expiry, CVV)
- Shipping address collection
- Address validation
- Payment method display (masked card number)

## UI Components

### Payment Information Form
```
┌─────────────────────────────────────────────────┐
│  Payment Method                                 │
├─────────────────────────────────────────────────┤
│  Card Number    [4242 4242 4242 4242]          │
│  Expiry         [12/28]    CVV [•••]           │
│  Cardholder     [John Doe                    ] │
├─────────────────────────────────────────────────┤
│  ☑ Save card for future purchases              │
└─────────────────────────────────────────────────┘
```

### Shipping Address Form
```
┌─────────────────────────────────────────────────┐
│  Shipping Address                               │
├─────────────────────────────────────────────────┤
│  Full Name      [John Doe                    ] │
│  Address Line 1 [123 Main Street             ] │
│  Address Line 2 [Apt 4B                      ] │
│  City           [San Francisco]  State [CA]   │
│  ZIP Code       [94102]   Country [US ▼]      │
│  Phone          [+1 415-555-0123             ] │
├─────────────────────────────────────────────────┤
│  ☑ Use as billing address                      │
└─────────────────────────────────────────────────┘
```

## Tasks

**Payment Information:**
- [x] Create `PaymentForm` component with card input fields
- [x] Implement card number formatting (spaces every 4 digits)
- [x] Add card type detection (Visa, Mastercard, Amex)
- [x] Implement expiry date validation (MM/YY format)
- [x] Add CVV input with masking
- [x] Display card brand icon based on card number
- [x] Validate card against `supported_card_networks` from session

**Shipping Address:**
- [x] Create `ShippingAddressForm` component
- [ ] Implement address autocomplete (optional - Google Places API)
- [ ] Add country/state selection dropdowns
- [x] Validate required fields (name, address, city, state, zip, country)
- [ ] Support international address formats
- [ ] Add phone number input with country code

**Checkout Flow Integration:**
- [x] Update `useCheckoutFlow` to manage payment/shipping state
- [x] Store shipping address in checkout session via API
- [x] Pass payment details to PSP delegate_payment
- [x] Show summary of payment method (masked) in confirmation
- [x] Display shipping address in order confirmation

**Validation & Error Handling:**
- [x] Client-side validation for all fields
- [x] Display field-level error messages
- [x] Handle address validation errors from API
- [x] Support "billing same as shipping" toggle

## API Integration

Update checkout session with fulfillment address:
```json
POST /checkout_sessions/{id}
{
  "fulfillment_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_line_1": "123 Main Street",
    "address_line_2": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US",
    "phone": "+14155550123"
  }
}
```

## Acceptance Criteria

- [x] Payment form validates card number format and type
- [x] Card type icon displays based on card number prefix
- [x] Shipping address form collects all required fields
- [x] Address is stored in checkout session
- [x] Payment method (masked) displays in confirmation
- [x] Shipping address displays in order confirmation
- [x] Form validation prevents submission with invalid data
- [x] Error messages are clear and actionable

---

[← Back to Feature Overview](./index.md)

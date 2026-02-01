# Feature 15: Multi-Language Post-Purchase Messages

**Goal**: Enable the Post-Purchase Agent to generate messages in multiple languages based on customer preferences, with language selection in the UI.

## Supported Languages

| Code | Language | Agent Support | UI Support |
|------|----------|---------------|------------|
| `en` | English | ✅ Implemented | ✅ Implemented |
| `es` | Spanish | ✅ Implemented | ✅ Implemented |
| `fr` | French | ✅ Implemented | ✅ Implemented |

## Current State

The Post-Purchase Agent backend (`src/merchant/services/post_purchase.py`) already supports:
- Multi-language message generation via NAT agent
- Fallback templates in EN/ES/FR
- Language parameter in API requests

This feature adds UI support for language selection and display.

## UI Components

### Language Selector
```
┌─────────────────────────────────────┐
│  🌐 Language Preference             │
│  ┌─────────────────────────────┐   │
│  │  English                  ▼ │   │
│  ├─────────────────────────────┤   │
│  │  🇺🇸 English                │   │
│  │  🇪🇸 Español                │   │
│  │  🇫🇷 Français               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Localized Message Display
```
┌─────────────────────────────────────────────────┐
│  🛍️ Post-Purchase Message                       │
│  ─────────────────────────────────────────────  │
│  Subject: ¡Tu pedido está en camino! 🚚        │
│                                                 │
│  ¡Hola Juan! Tenemos excelentes noticias...    │
│                                                 │
│  [Language: Español]                            │
└─────────────────────────────────────────────────┘
```

## Tasks

**Language Selection:**
- [x] Add language selector to checkout flow or user preferences
- [x] Store language preference in checkout session
- [x] Pass language to Post-Purchase Agent API
- [ ] Persist language preference in localStorage (deferred - enhancement)

**Agent Activity Panel:**
- [x] Display language indicator on post-purchase message cards

**Message Generation:**
- [x] Update `triggerPostPurchaseAgent` to use selected language
- [x] Ensure NAT agent prompt handles all supported languages
- [x] Validate language code before API call
- [x] Fall back to English if language not supported

**Localization Infrastructure:**
- [ ] Create i18n utility for UI strings (deferred - enhancement)
- [ ] Translate UI labels (buttons, headers, error messages) (deferred - enhancement)
- [ ] Support browser language detection as default (deferred - enhancement)
- [ ] Add language switcher to navigation (deferred - enhancement)

## API Updates

Post-purchase message request with language:
```json
POST /api/agents/post-purchase
{
  "brand_persona": {
    "company_name": "ACME Store",
    "tone": "friendly",
    "preferred_language": "es"  // Language selection
  },
  "order": {
    "order_id": "order_123",
    "customer_name": "Juan",
    "items": [
      { "name": "Camiseta Clásica", "quantity": 1 },
      { "name": "Sudadera Logo", "quantity": 2 }
    ],
    "tracking_url": null,
    "estimated_delivery": "2026-01-29T00:00:00Z"
  },
  "status": "order_confirmed"
}
```

## Acceptance Criteria

- [x] Language selector available in checkout flow
- [ ] Selected language persists across sessions (deferred - enhancement)
- [x] Post-purchase messages generate in selected language
- [x] Language indicator displays on message cards
- [x] Fallback to English if generation fails
- [ ] UI labels support localization framework (deferred - enhancement)
- [ ] Browser language detected as default preference (deferred - enhancement)

---

[← Back to Feature Overview](./index.md)

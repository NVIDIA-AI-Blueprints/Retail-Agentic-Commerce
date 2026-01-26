# Feature 8: Post-Purchase Agent (NAT)

**Goal**: Implement lifecycle loyalty agent for multilingual shipping updates.

## Agent Behavior

Generates human-like shipping updates using the Brand Persona configuration.

## Brand Persona Configuration

```json
{
  "company_name": "Acme T-Shirts",
  "tone": "friendly",          // friendly | professional | casual | urgent
  "preferred_language": "en"   // en | es | fr
}
```

## Tasks

- [x] Create NAT workflow for Post-Purchase Agent
- [x] Implement Brand Persona loading from config
- [x] Generate shipping pulses in 3 languages (EN/ES/FR)
- [x] Define tone variations for messaging
- [ ] Integrate with global webhook delivery (Feature 11)
- [x] Create shipping status templates:
  - Order confirmed
  - Order shipped
  - Out for delivery
  - Delivered

## Example Output (Friendly, English)

```
Hey John! Great news - your Classic Tee is on its way! 🚚
Track your package: https://track.example.com/abc123
- The Acme T-Shirts Team
```

## Acceptance Criteria

- [x] Messages reflect Brand Persona tone
- [x] Messages are in correct language
- [x] All shipping statuses are supported
- [ ] Messages are delivered to global webhook (deferred to Feature 11)

---

[← Back to Feature Overview](./index.md)

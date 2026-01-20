<h2><img align="center" src="https://github.com/user-attachments/assets/cbe0d62f-c856-4e0b-b3ee-6184b7c4d96f"> NVIDIA AI Blueprint: Retail Agentic Commerce</h2>

This repository is a **reference architecture** for the **Agentic Commerce Protocol (ACP)**: a retailer-operated system that keeps the merchant as **Merchant of Record**, while enabling **agentic negotiation** and “glass box” visibility into decisions and protocol traces.

> ⚠️ **Third-Party Software Notice**  
> This project may download and install additional third-party open source software projects.  
> Please review the license terms of these open source projects before use.

### What this blueprint includes (planned)
- **ACP middleware**: Implements the required ACP checkout session endpoints and persists session state.
- **Intelligent merchant agents**:
  - Promotion agent (margin protection via competitor price + inventory signals)
  - Recommendation agent (basket optimization with deterministic, in-stock rules)
  - Post-purchase agent (multilingual shipping “pulses” to a single global webhook)
- **Demo data layer**: A small catalog (4 products) + competitor prices + checkout session storage.
- **Protocol Inspector UI**: A multi-panel “glass box” dashboard showing ACP JSON requests/responses plus a structured reasoning trace.
- **Delegated payments simulator**: A minimal PSP flow for vault tokens + idempotency + payment intent processing.

### Docs
- **Product requirements**: `docs/PRD.md`
- **Architecture**: `docs/architecture.md`
- **Agentic Commerce Protocol notes/spec**: `docs/acp-spec.md`
- **Validation plan**: `docs/validation.md`

---
description: Scoped fast-start guide for coding agents working in src/agents.
alwaysApply: false
---

# AGENTS.md

This file is the local guide for `src/agents/`. Read the root `AGENTS.md` first, then use this for agent-specific work.

## Scope

`src/agents/` contains NAT workflows and custom function registration for:
- Promotion agent (`configs/promotion.yml`)
- Post-purchase agent (`configs/post-purchase.yml`)
- Recommendation agent (`configs/recommendation.yml`, `configs/recommendation-ultrafast.yml`)
- Search agent (`configs/search.yml`)

## Required Reading (Before Editing)

1. `src/agents/README.md`
2. `docs/NEMO_AGENT_TOOLKIT_DOCUMENTATION.md`
3. `docs/features/feature-06-promotion-agent.md`
4. `docs/features/feature-07-recommendation-agent.md`
5. `docs/features/feature-08-post-purchase-agent.md`

If changes impact merchant integration, also read:
- `docs/specs/acp-spec.md`
- `docs/specs/ucp-spec.md`

## Architecture Contracts (Do Not Break)

1. Preserve the 3-layer hybrid model:
   - Layer 1 deterministic context in merchant backend
   - Layer 2 LLM arbitration/generation in NAT
   - Layer 3 deterministic enforcement in merchant backend
2. Agent outputs are advisory/content-only. Final pricing, margin checks, and order authority remain deterministic in `src/merchant/`.
3. Promotion decisions must select from `allowed_actions`.
4. Recommendation custom components are limited to orchestration/contract guards in `src/agents/register.py`.

## Quick Map

- Configs: `src/agents/configs/*.yml`
- Custom NAT components: `src/agents/register.py`
- Eval datasets: `src/agents/data/eval/*.json`
- Milvus seed helper: `src/agents/scripts/seed_milvus.py`
- Agent contract test: `tests/agents/test_recommendation_workflow_contract.py`

## Runtime Commands

```bash
cd src/agents
uv pip install -e ".[dev]"

nat serve --config_file configs/promotion.yml --port 8002
nat serve --config_file configs/post-purchase.yml --port 8003
nat serve --config_file configs/recommendation-ultrafast.yml --port 8004
nat serve --config_file configs/search.yml --port 8005
```

## Verification (Minimum)

```bash
cd src/agents
nat validate --config_file configs/<changed-agent>.yml
nat run --config_file configs/<changed-agent>.yml --input '<sample-json>'

ruff check .
ruff format --check .
pyright
```

If recommendation orchestration changes, run:

```bash
uv run pytest tests/agents/test_recommendation_workflow_contract.py -q
```

## Change Checklist

- Update matching eval dataset when behavior contract changes.
- Keep prompts/config and integration docs aligned (`src/agents/README.md` and root `AGENTS.md` when needed).
- Report real command evidence; do not claim agent behavior without a `nat run`/test result.

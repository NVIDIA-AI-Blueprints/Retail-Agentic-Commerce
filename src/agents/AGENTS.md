---
description: Scoped guide for the commerce agents in src/agents.
alwaysApply: false
---

# AGENTS.md

Read the root `AGENTS.md` before working in this directory.

## Required Reading

1. [Agent integration guide](README.md)
2. [Promotion](../../docs/features/feature-06-promotion-agent.md), [recommendations](../../docs/features/feature-07-recommendation-agent.md), or [post-purchase](../../docs/features/feature-08-post-purchase-agent.md), as applicable.
3. The [ACP](../../docs/specs/acp-spec.md), [UCP](../../docs/specs/ucp-spec.md), or [Apps SDK](../../docs/specs/apps-sdk-spec.md) specification for any affected caller.

## Contracts

- Preserve `GET /health` and `POST /generate`, including JSON encoded as strings in `input_message` and `value`. The merchant and Apps SDK use these fields.
- The merchant computes promotion signals and constraints. The model selects from `allowed_actions`. The merchant checks margins and applies the action.
- Keep ARAG retrieval, parallel User Understanding and NLI, context synthesis, ranking, and the output guard in that order. Preserve branch failure handling and the labeled text passed to context synthesis.
- Preserve Milvus metadata and L2 distance semantics so the Apps SDK can enrich and filter results.
- Preserve the Phoenix project names and one root span per workflow invocation.

## Quick Map

- Application and workflow code: `commerce_agents/`
- Profiles, prompts, and model settings: `commerce_agents/configs/`
- Milvus seeder: `scripts/seed_milvus.py`
- Eval datasets: `data/eval/`
- HTTP comparison harness: `scripts/compare_agents.py`

Use the root runtime commands or the [agent integration guide](README.md) to start each profile. Run `tests/agents/` for contract and workflow checks. For orchestration changes, compare live requests with the same models and index. Check the trace for overlapping ARAG branches.

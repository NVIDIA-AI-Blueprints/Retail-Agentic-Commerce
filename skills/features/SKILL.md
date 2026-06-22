---
name: features
description: Python backend development standards for FastAPI, SQLModel, pytest, Ruff, and Pyright. Use when writing or modifying backend code in src/merchant, src/payment, src/apps_sdk, agents, tests, API routes, services, models, or protocol logic.
---

# Backend Feature Development

Use this skill for Python backend changes.

## Workflow

1. Read `AGENTS.md` before coding.
2. Read the required specs listed in `AGENTS.md` for the affected protocol or feature area.
3. Read scoped AGENTS files for touched subtrees, such as `src/merchant/AGENTS.md`, `src/apps_sdk/AGENTS.md`, or `src/agents/AGENTS.md`.
4. Implement minimal, spec-aligned changes.
5. Add or update tests for new behavior, edge cases, and failure paths.
6. Run the relevant quality gates and report exact evidence.

## Python Standards

- Use type hints for public APIs and non-trivial logic.
- Prefer explicit, readable code over clever abstractions.
- Avoid side effects at import time.
- Mock external services and I/O in tests.
- Do not add secrets, credentials, or sensitive data.
- Add comments only where they clarify non-obvious behavior.

## CI Parity

Run these commands from the repo root before committing backend-related changes:

```bash
uv run ruff check src/merchant/ src/payment/ src/apps_sdk/ tests/
uv run ruff format --check src/merchant/ src/payment/ src/apps_sdk/ tests/
uv run pyright src/merchant/ src/payment/ src/apps_sdk/
uv run pytest tests/ -v --tb=short
```

Rules:

- Do not commit if any required command fails.
- If changes touch both backend and UI, run the UI CI parity commands in `skills/ui/SKILL.md`.
- Targeted tests are fine while iterating, but full relevant checks are required before commit unless explicitly skipped with a reason.

## Testing Standards

- Name tests `test_*.py`.
- Assert behavior, not implementation details.
- Prefer fixtures over ad hoc setup/teardown logic.
- Use parametrized tests for related cases.
- Cover happy paths, edge cases, and failure paths when behavior changes.

## Review Expectations

- No commented-out code.
- No TODOs without an issue reference.
- No dead code.
- No ignored warnings or silenced type errors unless justified.
- Clear, descriptive function and variable names.

The work is incomplete if tests are missing for changed behavior, Ruff or type checks are unresolved, or code behavior conflicts with the required docs.

---
name: features
description: Backend development guidelines for python code
---

# Overview

## Feature Development (Mandatory)
- For every new feature, behavior, or refactor, ALWAYS create or update unit tests.
- Do not add unnecessary comments unless it's complex code.
- Do not add secrets, passwords and sensitive information.
- Tests must exist before the task is considered complete.
- Prefer pytest for all tests.
- Include:
  - Happy path
  - Edge cases
  - Failure cases

## Required Tooling (Non-Negotiable)
All Python code MUST comply with the following tools:

### Linting & Formatting
- Use Ruff for BOTH linting and formatting
- Code must be compliant with:
  - `ruff check`
  - `ruff format`
- No unused imports, unreachable code, or ignored warnings

### Type Checking
- Use ONE of the following (project-dependent):
  - Pyright (preferred for fast feedback)
  - Mypy (acceptable when explicitly configured)

- If type hints exist, they MUST type-check cleanly.
- Do not silence type errors unless explicitly justified in comments.

### Testing
- All unit tests MUST pass via pytest.
- Tests must be deterministic and not rely on external state.
- Mock external services and I/O.

## Workflow Order (Strict)
Cursor MUST follow this order when generating or modifying code:
1. Implement the feature
2. Add or update unit tests
3. Ensure Ruff linting and formatting compliance
4. Ensure Pyright or Mypy type checks pass
5. Only then consider the task complete

If any step fails or is missing, the work is incomplete.

## Python Coding Standards
- Follow PEP 8 where applicable (Ruff is the source of truth)
- Use 4-space indentation
- Prefer explicit, readable code over clever abstractions
- Avoid side effects at import time
- Use type hints for public APIs and non-trivial logic

## Testing Standards
- Test files must be named `test_*.py`
- Tests should assert behavior, not implementation details
- Prefer fixtures over setup/teardown logic
- Use parametrized tests where appropriate

## Code Review Expectations
- No commented-out code
- No TODOs without an issue reference
- No dead code
- Clear, descriptive function and variable names

## Update documentation
- Add clear and simple instructions on the README.md
- Update AGENTS.md and CLAUDE.md for agentic development.

If these standards are not met, the solution MUST be revised.

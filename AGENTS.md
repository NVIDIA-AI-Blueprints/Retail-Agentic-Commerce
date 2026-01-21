# AGENTS.md

This document helps AI coding assistants understand how the Agentic Commerce project works.

## Project Overview

This is an Agentic Commerce Protocol (ACP) reference implementation featuring:
- **Backend**: Python 3.12+ FastAPI server with SQLModel ORM
- **Frontend**: Next.js 15+ with React 19, Tailwind CSS, and Kaizen UI components

See `docs/features.md` for the complete feature breakdown and `docs/architecture.md` for system design.

## Cursor Skills

Before making changes, review the relevant skill files in `.cursor/skills/`:
- **`.cursor/skills/features/SKILL.md`** - Python backend development standards (Ruff, Pyright, pytest)
- **`.cursor/skills/ui/SKILL.md`** - Frontend development standards (React, Next.js, browser validation)

These skills define mandatory workflows, tooling requirements, and code standards.

## Dev Environment Setup

### Backend (Python)

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies (including dev tools)
pip install -e ".[dev]"

# Or with uv (faster)
uv pip install -e ".[dev]"
```

### Running the Server

```bash
# Start the FastAPI server
uvicorn src.merchant.main:app --reload

# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend (Next.js UI)

```bash
# Navigate to UI directory
cd src/ui

# Install dependencies
pnpm install

# Start development server
pnpm run dev  # runs at http://localhost:3000
```

### UI Testing & Quality

```bash
cd src/ui

# Run tests
pnpm test              # Run tests in watch mode
pnpm test:run          # Run tests once (CI mode)
pnpm test:coverage     # Run tests with coverage

# Linting and formatting
pnpm lint              # Run ESLint
pnpm format            # Format with Prettier
pnpm format:check      # Check formatting

# Type checking
pnpm typecheck         # Run TypeScript type checker
```

## Testing Instructions

### Find the CI Plan

Check `.github/workflows/ci.yml` for the complete CI pipeline. It runs:
1. Ruff linting and formatting
2. Pyright type checking
3. Pytest unit tests

### Running Tests Locally

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/merchant/api/test_checkout.py -v

# Run specific test by name pattern
pytest tests/ -v -k "test_create_checkout"

# Run with coverage (if configured)
pytest tests/ --cov=src
```

### Linting and Formatting

```bash
# Check linting
ruff check src/ tests/

# Auto-fix linting issues
ruff check src/ tests/ --fix

# Check formatting
ruff format --check src/ tests/

# Apply formatting
ruff format src/ tests/
```

### Type Checking

```bash
# Run Pyright type checker
pyright src/
```

### Pre-Commit Checklist

Before committing, ensure all checks pass:
```bash
ruff check src/ tests/
ruff format --check src/ tests/
pyright src/
pytest tests/ -v
```

## Code Standards

### Python Backend

- Follow PEP 8 (enforced by Ruff)
- Use type hints for all public APIs
- 4-space indentation, 88-character line length
- No unused imports or dead code
- Add/update tests for every change

### Frontend (React/Next.js)

- Use TypeScript with strict mode
- Follow ESLint and Prettier rules
- Use Kaizen UI components and Tailwind CSS
- Run tests with Vitest: `pnpm test`
- Validate UI changes with browser MCP tools when available

## PR Instructions

### Title Format

```
[component] Brief description of change
```

Examples:
- `[backend] Add API key authentication middleware`
- `[frontend] Create product card component`
- `[docs] Update feature breakdown for Phase 2`

### Before Creating a PR

1. Run linting: `ruff check src/ tests/`
2. Run formatting: `ruff format src/ tests/`
3. Run type checks: `pyright src/`
4. Run tests: `pytest tests/ -v`
5. Ensure all CI checks would pass

### PR Description

Include:
- Summary of changes (1-3 bullet points)
- Test plan or verification steps
- Related issue/feature number if applicable

## Project Structure

```
src/
├── merchant/           # FastAPI backend
│   ├── main.py         # Application entry point
│   ├── config.py       # Environment configuration
│   ├── api/            # API routes and schemas
│   ├── agents/         # NAT agent implementations
│   ├── db/             # Database models and utilities
│   └── services/       # Business logic layer
│
└── ui/                 # Next.js frontend
    ├── app/            # Next.js App Router pages
    ├── components/     # React components
    │   ├── agent/      # Agent panel components (ProductGrid, CheckoutCard, etc.)
    │   ├── business/   # Business panel components
    │   └── layout/     # Layout components (Navbar, etc.)
    ├── hooks/          # Custom React hooks (useCheckoutFlow)
    ├── types/          # TypeScript type definitions
    └── data/           # Mock data for development

tests/
└── merchant/           # Backend test files mirror src structure

docs/                   # Project documentation
.cursor/skills/         # AI assistant skill definitions
```

## Helpful Commands

### Backend

| Task | Command |
|------|---------|
| Start server | `uvicorn src.merchant.main:app --reload` |
| Run all tests | `pytest tests/ -v` |
| Lint check | `ruff check src/ tests/` |
| Format code | `ruff format src/ tests/` |
| Type check | `pyright src/` |
| Health check | `curl http://localhost:8000/health` |

### Frontend (run from `src/ui/`)

| Task | Command |
|------|---------|
| Start UI | `pnpm run dev` |
| Run tests | `pnpm test` |
| Run tests once | `pnpm test:run` |
| Lint check | `pnpm lint` |
| Format code | `pnpm format` |
| Type check | `pnpm typecheck` |

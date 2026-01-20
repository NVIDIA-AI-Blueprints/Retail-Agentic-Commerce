# AGENTS.md

This document helps AI coding assistants understand how the Agentic Commerce project works.

## Project Overview

This is an Agentic Commerce Protocol (ACP) reference implementation featuring:
- **Backend**: Python 3.12+ FastAPI server with SQLModel ORM
- **Frontend** (planned): Next.js 14+ with React, Tailwind CSS, and shadcn/ui

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

### Frontend (Next.js) - When Available

```bash
# Navigate to frontend directory (when created)
cd src/client

# Install dependencies
pnpm install  # or npm install

# Start development server
pnpm dev  # runs at http://localhost:3000
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
- Use shadcn/ui components and Tailwind CSS
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
└── merchant/           # FastAPI backend
    ├── main.py         # Application entry point
    ├── config.py       # Environment configuration
    ├── api/            # API routes and schemas
    ├── agents/         # NAT agent implementations
    ├── db/             # Database models and utilities
    └── services/       # Business logic layer

tests/
└── merchant/           # Test files mirror src structure

docs/                   # Project documentation
.cursor/skills/         # AI assistant skill definitions
```

## Helpful Commands

| Task | Command |
|------|---------|
| Start server | `uvicorn src.merchant.main:app --reload` |
| Run all tests | `pytest tests/ -v` |
| Lint check | `ruff check src/ tests/` |
| Format code | `ruff format src/ tests/` |
| Type check | `pyright src/` |
| Health check | `curl http://localhost:8000/health` |

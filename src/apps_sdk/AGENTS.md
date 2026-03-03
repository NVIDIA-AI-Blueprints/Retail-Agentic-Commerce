---
description: Scoped fast-start guide for coding agents working in src/apps_sdk.
alwaysApply: false
---

# AGENTS.md

This file is the local guide for `src/apps_sdk/`. Read the root `AGENTS.md` first, then use this for Apps SDK work.

## Scope

`src/apps_sdk/` owns:
- FastAPI + FastMCP server (`main.py`)
- MCP tool contracts (`schemas.py`, `tools/`)
- Widget serving endpoints (`widget_endpoints.py`)
- Widget UI (`web/`, React + Vite + `window.openai` bridge)
- Protocol Inspector event stream endpoints (`events.py`, `rest_endpoints.py`)

## Required Reading (Before Editing)

1. `docs/specs/apps-sdk-spec.md`
2. `src/apps_sdk/README.md`
3. `docs/features/feature-16-apps-sdk.md`
4. `docs/architecture.md` (Apps SDK integration sections)

If checkout behavior changes, also read:
- `docs/specs/acp-spec.md`

## Architecture Contracts (Do Not Break)

1. Widget entrypoint remains MCP-driven:
   - `search-products` exposes `openai/outputTemplate` for widget discovery.
2. Tool schema and handler parity is mandatory:
   - `schemas.py` models
   - tool registration in `list_mcp_tools()`
   - dispatch map + `_handle_call_tool()` logic in `main.py`
3. Widget state/interaction must flow via `window.openai` APIs (`callTool`, `toolOutput`, `setWidgetState`).
4. Product truth source is merchant/search services, not duplicated hardcoded catalogs in tools.
5. Keep Apps SDK mode ACP-only (UCP mode belongs to merchant native flow).

## Quick Map

- Server entrypoint: `src/apps_sdk/main.py`
- Tool schemas: `src/apps_sdk/schemas.py`
- MCP tools: `src/apps_sdk/tools/*.py`
- Widget routes/static files: `src/apps_sdk/widget_endpoints.py`
- Widget app: `src/apps_sdk/web/src/*`
- Apps SDK tests: `tests/apps_sdk/*`

## Runtime Commands

```bash
# MCP server
uvicorn src.apps_sdk.main:app --reload --port 2091

# Widget dev/build
cd src/apps_sdk/web
pnpm install
pnpm dev
pnpm build
```

## Verification (Minimum)

Backend:

```bash
uv run ruff check src/apps_sdk tests/apps_sdk
uv run ruff format --check src/apps_sdk tests/apps_sdk
uv run pyright src/apps_sdk
uv run pytest tests/apps_sdk -v
```

Widget:

```bash
cd src/apps_sdk/web
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

Runtime checks for behavior changes:

```bash
curl http://localhost:2091/health
curl http://localhost:2091/widget/merchant-app.html | head -5
```

## Change Checklist

- If adding/changing a tool, update schema, registration, handler, and tests together.
- Keep `_meta` fields aligned with widget lifecycle expectations.
- If widget interaction changes, verify both simulated bridge mode and MCP-served mode.
- Report status codes/test outputs for runtime claims.

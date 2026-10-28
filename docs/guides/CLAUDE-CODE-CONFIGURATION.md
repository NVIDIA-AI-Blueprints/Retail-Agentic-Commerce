# Claude Code Configuration Guide

How Claude Code is wired into this repository, and how to extend it.

Claude Code reads project instructions from `CLAUDE.md`. Everything else (rules, skills, runtime commands) is delegated to files that other coding agents (Codex, etc.) share, so there is one source of truth.

---

## 1. Instruction Chain

```text
CLAUDE.md                      entry point, loaded automatically
 └── AGENTS.md                 full agent guide (workflow, docs-first rules, gates)
      ├── docs/agent-playbook.md      deep context and diagnostic examples
      ├── src/merchant/AGENTS.md      scoped: backend protocol work
      ├── src/apps_sdk/AGENTS.md      scoped: MCP server and widget
      ├── src/agents/AGENTS.md        scoped: NAT agents
      └── skills/*/SKILL.md           canonical skills
```

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Points Claude Code at `AGENTS.md` and defines the `setup` / `install` trigger. Keep it short. |
| `AGENTS.md` | Session workflow, mandatory doc reading per task type, security guardrails, runtime commands, quality gates, verification rules, PR format. |
| Scoped `AGENTS.md` | Read after the root file when working inside that component. |

Rule: do not duplicate content between `CLAUDE.md` and `AGENTS.md`. Add shared guidance to `AGENTS.md` only.

---

## 2. Session Workflow

Defined in `AGENTS.md`. Summary:

1. Read `AGENTS.md` once.
2. Identify the task type and read the required specs (`docs/specs/acp-spec.md`, `docs/specs/ucp-spec.md`, `docs/specs/apps-sdk-spec.md`, `docs/NEMO_AGENT_TOOLKIT_DOCUMENTATION.md`, `docs/architecture.md`, `docs/features/`).
3. Read the matching skill in `skills/`.
4. Implement minimal, spec-aligned changes.
5. Run the quality gates and report evidence (commands, HTTP codes, logs).

If a spec and the code conflict, ask the user before adding workarounds.

---

## 3. Skills and Commands

### Canonical skills (`skills/`)

| Skill | Use for |
|-------|---------|
| `skills/features/SKILL.md` | Python backend standards |
| `skills/ui/SKILL.md` | Frontend standards |
| `skills/pre-commit-analysis/SKILL.md` | Pre-commit validation |
| `skills/setup/SKILL.md` | Full Docker deployment (trigger: "setup" or "install") |
| `skills/cve-remediation/SKILL.md` | Dependency vulnerability and advisory remediation |

`.agents/skills/` holds discovery shims for Codex. Edit the canonical file in `skills/`, not the shim.

### Slash commands (`.claude/commands/`)

| Command | File | Behaviour |
|---------|------|-----------|
| `/setup` | `.claude/commands/setup.md` | Asks which mode (Docker default, or local development), then runs the setup flow. |

To add a command, create `.claude/commands/<name>.md`. The filename becomes `/<name>`. Put the instructions in the file body.

---

## 4. Settings and Permissions

Claude Code merges settings from these locations (later and narrower scopes win):

| File | Scope | Commit? |
|------|-------|---------|
| `~/.claude/settings.json` | All your projects | No (personal) |
| `.claude/settings.json` | This repository, shared with the team | Yes |
| `.claude/settings.local.json` | This repository, only you | No |

This repository currently ships no `.claude/settings.json`. Add one only for settings the whole team should share.

Suggested allowlist for this project (read-only and quality-gate commands). Review before committing:

```json
{
  "permissions": {
    "allow": [
      "Bash(ruff check:*)",
      "Bash(ruff format --check:*)",
      "Bash(pyright:*)",
      "Bash(pytest:*)",
      "Bash(pnpm test:run)",
      "Bash(pnpm lint)",
      "Bash(pnpm format:check)",
      "Bash(pnpm typecheck)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./src/ui/.env.local)"
    ]
  }
}
```

Keep `deny` entries for secret files. `.env` holds `NVIDIA_API_KEY` and must never be read into a session or committed (it is in `.gitignore`).

---

## 5. Environment and Secrets

- Copy `env.example` to `.env`. Never overwrite an existing `.env`.
- `NVIDIA_API_KEY` is required for NAT agents on public endpoints.
- Frontend env lives in `src/ui/.env.local`: server-side keys (`MERCHANT_API_URL`, `MERCHANT_API_KEY`, `PSP_API_URL`, `PSP_API_KEY`) and the client-safe `NEXT_PUBLIC_API_VERSION`.
- Values in `env.example` and `AGENTS.md` are test placeholders. Do not paste real keys into docs, commits, or chat.

---

## 6. Documentation Guardrails

When Claude edits any doc or `AGENTS.md`:

- Use repo-relative paths only. No absolute local paths, usernames, or home directories.
- Before finishing, this must return no matches:

```bash
rg -n -e '/Users/[A-Za-z0-9._-]+/' -e '/home/[A-Za-z0-9._-]+/' -e '\\\\Users\\\\[A-Za-z0-9._-]+\\\\' AGENTS.md src docs
```

---

## 7. Quality Gates Claude Must Run

Backend:

```bash
ruff check src/ tests/
ruff format --check src/ tests/
pyright src/
pytest tests/ -v
```

Frontend (from `src/ui/`):

```bash
pnpm test:run
pnpm lint
pnpm format:check
pnpm typecheck
```

For runtime-affecting changes (HTTP behaviour, async flow, new integrations), also run real calls and report status codes and log evidence. Do not claim a change works from static checks alone. Details in `AGENTS.md` under "Code Change Verification".

---

## 8. Pull Requests

Title: `[component] Brief description`, for example `[docs] Add Claude Code configuration guide`.

Body: summary (1-3 bullets), test plan, related issue or feature.

---

## 9. Extending the Setup

| Goal | Do this |
|------|---------|
| New project-wide rule | Add to `AGENTS.md`, not `CLAUDE.md` |
| Component-specific rule | Add or edit that component's `AGENTS.md` |
| New workflow | New `skills/<name>/SKILL.md`, add a shim in `.agents/skills/<name>/`, list it in `AGENTS.md` |
| New slash command | New `.claude/commands/<name>.md` |
| New external tool (MCP server) | Add a `.mcp.json` at the repo root for project-shared servers; never commit credentials |
| Personal preference | `.claude/settings.local.json` or `~/.claude/CLAUDE.md` |

Maintenance: if runtime commands or architecture change, update `AGENTS.md` in the same PR, then re-check this guide.

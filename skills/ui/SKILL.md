---
name: ui
description: React and Next.js frontend development standards for Retail-Agentic-Commerce. Use when creating or modifying UI pages, components, hooks, styling, tests, or Apps SDK widget browser behavior in src/ui or related frontend surfaces.
---

# UI Development

Use this skill for frontend changes in `src/ui/` and related UI surfaces.

## Stack

- Next.js 15+ with the App Router.
- React 19+.
- TypeScript with strict typing.
- Tailwind CSS and the repo's Kaizen UI conventions.
- Vitest, React Testing Library, and browser validation when behavior changes.

## Workflow

1. Read `AGENTS.md` before coding.
2. Read scoped docs or AGENTS files when the changed path has one.
3. Implement the smallest spec-aligned change.
4. Add or update tests for new behavior, regressions, and edge cases.
5. Validate linting, formatting, type checking, tests, and browser behavior where relevant.

## CI Parity

Run these commands from `src/ui` before committing UI-related changes:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
```

If the change also touches backend code, run the backend CI parity commands in `skills/features/SKILL.md`.

## Browser Validation

Use browser automation tools when available for:

- New or changed user flows.
- UI regressions.
- Component interactions and state transitions.
- Console or network behavior that matters to the change.

Validation should prove the real UI path works. Prefer snapshots or screenshots, interaction evidence, and console checks over assumptions.

## React Standards

- Use functional components and hooks.
- Prefer Server Components where possible.
- Use `'use client'` only when interactivity or browser APIs require it.
- Follow Next.js file conventions such as `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx`.
- Use Next.js `Image` and `Link` where appropriate.
- Avoid unnecessary client-side JavaScript.

## TypeScript Standards

- Type public props, hooks, and non-trivial functions explicitly.
- Avoid `any`; justify unavoidable uses in a short comment.
- Prefer local types that match API schemas and existing project patterns.
- Do not leave unused imports, unreachable code, or production `console.log` calls.

## Styling Standards

- Use Tailwind utilities and existing design tokens.
- Follow mobile-first responsive design.
- Keep components accessible and keyboard usable.
- Use semantic HTML and ARIA only where it improves accessibility.
- Avoid inline styles unless a dynamic value cannot reasonably be expressed with the existing styling system.

## Testing Standards

- Name tests `*.test.tsx` or `*.spec.tsx`.
- Test user-visible behavior, not implementation details.
- Prefer `getByRole` and accessible queries over `getByTestId`.
- Keep tests deterministic and independent of external services.

## Completion Criteria

The work is incomplete if relevant tests or checks were skipped without an explicit reason, if the browser path was changed but not verified, or if the implementation does not match the repo docs and architecture.

---
name: ui
description: React/Next.js frontend development standards with TypeScript, Tailwind CSS, and Kaizen UI. Enforces ESLint, Prettier, and browser validation via MCP. Use when creating React components, modifying pages, styling with Tailwind, implementing hooks, or working in src/ui/. Validates changes in browser when MCP tools available.
---

# Overview

## Technology Stack (Mandatory)
All frontend code MUST use the following stack:
- **Next.js 14+** (App Router)
- **React 18+**
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **TypeScript** for type safety

## UI Development (Mandatory)
- For every new component, feature, or modification, ALWAYS create or update tests.
- Components must be responsive and accessible (WCAG 2.1 AA).
- Use semantic HTML elements.
- Follow React best practices (hooks, composition, etc.).

## Required Tooling (Non-Negotiable)
All frontend code MUST comply with the following tools:

### Linting & Formatting
- Use ESLint with Next.js configuration
- Use Prettier for code formatting
- Code must pass:
  - `npm run lint` (or `pnpm lint` / `yarn lint`)
  - Formatting checks
- No unused imports, unreachable code, or console.log statements in production code

### Type Checking
- Use TypeScript with strict mode enabled
- All components and functions MUST have proper type definitions
- No `any` types unless explicitly justified in comments
- Use interface/type definitions for props

### Testing
- Use Vitest or Jest for unit tests
- Use React Testing Library for component tests
- Use Playwright or Cypress for E2E tests (optional but recommended)
- Tests must be deterministic and not rely on external state

## Workflow Order (Strict)
Cursor MUST follow this order when generating or modifying frontend code:
1. Implement the component/feature
2. Add or update unit/component tests
3. Ensure ESLint compliance
4. Ensure TypeScript type checks pass
5. **Validate in browser using MCP tools** (see Browser Validation section)
6. Only then consider the task complete

If any step fails or is missing, the work is incomplete.

## Retail-Agentic-Commerce UI CI Parity (Mandatory)
Before committing UI-related changes in this repo, run the same checks used in CI from `src/ui`:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
```

Rules:
- Do not commit if any command above fails.
- Run from `src/ui` to match CI environment and scripts.
- If the change also touches backend code, run backend CI parity commands in `.cursor/skills/features/SKILL.md` before commit.

## Browser Validation (Mandatory When Available)
When browser MCP tools are available (cursor-browser-extension or cursor-ide-browser), you MUST use them to validate UI changes:

### When to Validate
- **New Features**: Launch the UI and verify the feature works as expected
- **Bug Fixes**: Reproduce the bug, apply the fix, and confirm resolution
- **UI Modifications**: Visually verify changes render correctly
- **Component Changes**: Test component interactions and states

### Validation Workflow
1. Start the development server if not already running
2. Use `browser_navigate` to open the relevant page
3. Use `browser_snapshot` to capture the page state (preferred over screenshots)
4. Use `browser_click`, `browser_type`, `browser_fill_form` to interact with UI elements
5. Verify expected behavior through snapshots or element inspection
6. Use `browser_console_messages` to check for JavaScript errors
7. Use `browser_network_requests` to verify API calls if needed

### Example Validation Flow
```
1. Navigate to http://localhost:3000
2. Take a snapshot to verify page loaded
3. Interact with UI elements (click buttons, fill forms)
4. Take another snapshot to verify state changes
5. Check console for errors
6. Report findings
```

## React/Next.js Coding Standards
- Use functional components with hooks
- Prefer Server Components where possible (Next.js App Router)
- Use `'use client'` directive only when necessary
- Follow the Next.js file conventions:
  - `page.tsx` for routes
  - `layout.tsx` for layouts
  - `loading.tsx` for loading states
  - `error.tsx` for error boundaries
- Use Next.js Image component for optimized images
- Use Next.js Link component for navigation

## Component Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx
│   ├── layout.tsx
│   └── (routes)/
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── features/           # Feature-specific components
├── lib/                    # Utilities and helpers
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles
```

## Styling Standards
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming (via shadcn/ui)
- Avoid inline styles; prefer Tailwind classes
- Use `cn()` utility for conditional classes

## shadcn/ui Usage
- Install components via CLI: `npx shadcn@latest add <component>`
- Customize components in `components/ui/`
- Follow shadcn/ui patterns for variants and sizing
- Use Radix UI primitives for accessibility

## Accessibility Requirements
- All interactive elements must be keyboard accessible
- Use proper ARIA attributes when needed
- Ensure sufficient color contrast
- Provide alt text for images
- Use semantic HTML elements

## Testing Standards
- Test files must be named `*.test.tsx` or `*.spec.tsx`
- Test user interactions, not implementation details
- Use `screen` queries from React Testing Library
- Prefer `getByRole` over `getByTestId`
- Test accessibility with jest-axe or similar

## Performance Considerations
- Use React.memo for expensive re-renders
- Implement proper loading states
- Use Suspense boundaries appropriately
- Optimize images and assets
- Avoid unnecessary client-side JavaScript

## Code Review Expectations
- No commented-out code
- No TODOs without an issue reference
- No console.log statements (use proper logging in production)
- Clear, descriptive component and variable names
- Props must be properly typed

## Update documentation
- Add clear and simple instructions on the README.md
- Update AGENTS.md and CLAUDE.md for agentic development.

If these standards are not met, the solution MUST be revised.

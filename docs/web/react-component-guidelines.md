# React Component Guidelines

> How components in **cohabit.web** should look and behave — the standard for building, improving, and reviewing UI components.

This document is the reference for **component improvement**. When you touch an existing component or build a new one, use it as the checklist. It covers structure, behaviour, performance, testability, and security, grounded in the project's actual stack:

- **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** + `tailwind-merge` via the `cn()` helper
- **shadcn/ui** conventions (`data-slot`, CVA variants, Radix primitives)
- **Radix UI** primitives (accessible, headless)
- **framer-motion** / **gsap** for animation
- **Vitest** + **@testing-library/react** + **jsdom** for tests

---

## 1. How a component should LOOK

### 1.1 File & naming conventions

- **One component per file**, named after the file. `button.tsx` exports `Button`.
- Use **named exports** for the component and any variant config it exposes (e.g. `export { Button, buttonVariants }`).
- **PascalCase** for component names and types; **camelCase** for props and helpers.
- Co-locate a component's test as `component.test.tsx` next to it (see §4).
- Keep presentational primitives in `src/components/ui/`, feature-specific components in `src/components/`.

### 1.2 Props contract

- **Type props explicitly** with `React.ComponentProps<"element">` as the base, then extend with your own. This preserves native attributes (ARIA, event handlers, `data-*`) for free:

  ```tsx
  function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
  }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }) { ... }
  ```

- **Spread `...props` last** so callers can override defaults.
- **Never mutate props.** Treat props as read-only.
- **Prefer composition over prop-drilling.** If a component needs many unrelated props, it is probably doing too much — split it.
- **Boolean props** should default to `false` and read naturally (`isLoading`, `disabled`). Avoid `showX={false}` patterns where a conditional render is clearer.

### 1.3 Styling with `cn()` and CVA

- **Always** merge classes through `cn()` so `tailwind-merge` resolves conflicts and callers can override:

  ```tsx
  className={cn(buttonVariants({ variant, size, className }))}
  ```

- Define **variants** with `class-variance-authority` (`cva`) for anything that has visual states (size, tone, intent). Keep `defaultVariants` explicit.
- Use **`data-slot`** attributes on every element a component renders. This is the shadcn convention that lets consumers target internals with `data-slot="..."` selectors and enables `has-data-[slot=...]` styling:

  ```tsx
  <div data-slot="card" data-size={size} className={...} />
  ```

- **Expose variant config** (e.g. `buttonVariants`) so callers can reuse the same styling for links or other elements.
- Keep styling **self-contained** — a component owns its look and does not depend on parent CSS.

### 1.4 Accessibility (how it should behave for everyone)

- **Use Radix primitives** for anything interactive that has a native pattern (dialog, select, tooltip, accordion, tabs). They ship keyboard nav, focus management, and ARIA wiring.
- **Semantic HTML first.** Use `<button>`, `<a>`, `<input>`, `<label>` rather than `<div onClick>`.
- **Focus visibility:** keep `focus-visible` rings (the kit already does this via `focus-visible:ring-*`). Never remove outlines without a replacement.
- **Labels:** every form control needs an accessible name — `<label>`, `aria-label`, or `aria-labelledby`.
- **Keyboard operability:** all interactive elements must be reachable and operable by keyboard (Tab, Enter, Space, arrows).
- **Respect `prefers-reduced-motion`** for animations (see §3.4).
- **Color contrast** must meet WCAG AA; never rely on color alone to convey state (pair with icon/text).

---

## 2. How a component should BEHAVE

### 2.1 State ownership

- **Prefer controlled components.** Let the parent own state and pass value + `onChange`. This makes components predictable and testable.
- **Default to local state** (`useState`) only for purely internal UI state (open/closed, hover, active tab).
- **Derive state instead of storing it.** If a value can be computed from props, compute it — don't mirror it in state (avoids sync bugs).
- **Never mutate props or state directly.** Use immutable updates.
- **Keep state minimal and colocated.** Lift state up only when multiple components need it.

### 2.2 Effects

- **`useEffect` is for synchronising with external systems** (subscriptions, DOM, timers, network), not for deriving state from props. Derive during render instead.
- **Always clean up** subscriptions, timers, and event listeners in the effect's return.
- **List every dependency** in the dependency array. Missing deps cause stale closures; extra deps cause re-runs.
- **Avoid effect chains** (effect that sets state that triggers another effect). Prefer deriving during render or handling in the event handler.
- **`useMemo` / `useCallback`** only when the cost of recomputation or identity churn is real (see §3.2). Don't wrap everything.

### 2.3 Events & handlers

- **Name handlers `on<Event>`** (`onClick`, `onChange`, `onSubmit`).
- **Forward native events** via props spread so consumers can attach their own handlers.
- **Guard against double-firing** for async submit actions (disable while pending).
- **Prevent default** where needed (form submit, link navigation) and stop propagation deliberately — never blindly.

### 2.4 Composition

- **Compose small components** rather than building monolithic ones. A component that renders a list should map over items and render a child `Item` component.
- **Use `asChild` / `Slot`** (Radix) to let consumers swap the rendered element while keeping behaviour.
- **Keep components dumb where possible** — presentational components receive data and call callbacks; they don't fetch or mutate directly.

---

## 3. Performance

### 3.1 Rendering

- **Default to re-rendering.** React is fast; don't prematurely optimise. Measure first.
- **Memoise only real hotspots** with `React.memo` — components that re-render often with stable props (e.g. list items, heavy charts).
- **Stabilise props for memoised children** with `useCallback`/`useMemo` so memo actually helps.
- **Avoid inline object/array/function props** on memoised children (they break memo identity every render).
- **Key lists correctly** with stable, unique keys — never the array index for reorderable lists.

### 3.2 Data & effects

- **Lazy-load heavy components** with `React.lazy` + `Suspense` (route-level or below-the-fold).
- **Debounce** expensive inputs (search, filters) rather than recomputing on every keystroke.
- **Avoid heavy work in render.** Move expensive computation to `useMemo` or off the main thread.
- **Virtualise long lists** (windowing) instead of rendering thousands of DOM nodes.

### 3.3 `useMemo` / `useCallback` discipline

- Use `useMemo` for **expensive computations** that run on every render.
- Use `useCallback` to **stabilise callbacks** passed to memoized children or effect deps.
- **Don't over-optimise.** Measure first. Premature memoisation adds overhead and hurts readability.

### 3.4 Animation & motion

- **Respect `prefers-reduced-motion`.** Disable or simplify decorative animation for users who opt out.
- **Prefer CSS transforms/opacity** over layout-affecting properties (width, height, top/left) for smooth 60fps animation.
- **Use `will-change` sparingly** and only on elements that actually animate.
- **Clean up** GSAP tweens and framer-motion animations on unmount to avoid leaks.
- **Avoid animating large lists** or re-running entrance animations on every re-render.

### 3.5 Bundle & runtime

- **Import only what you use** from icon/animation libraries (tree-shaking). The project already has several icon sets — prefer one and avoid duplicating.
- **Avoid large dependencies** in components; prefer small, focused primitives.
- **Keep components free of side effects at module scope** (no top-level network calls, no `console.log`).

---

## 4. Testability

### 4.1 What to test

- **Behaviour, not implementation.** Test what the user sees and does, not internal state or function calls.
- **User-facing queries:** use `getByRole`, `getByLabelText`, `getByText`, `getByPlaceholderText` — never test IDs or class names.
- **Cover the happy path, edge cases, and error states** of each component.
- **Test accessibility-critical behaviour** (keyboard nav, ARIA attributes) where relevant.

### 4.2 Writing tests

- Use **Vitest** + **@testing-library/react** + **@testing-library/user-event** (already configured with `setupTests.ts`).
- **`userEvent` over `fireEvent`** — it simulates real user interaction (typing, clicking, keyboard).
- **Co-locate** tests as `component.test.tsx` next to the component.
- **Keep tests deterministic** — no reliance on timers/network unless mocked; use `vi.useFakeTimers()` when needed.
- **Clean up** after each test (already handled in `setupTests.ts`).

### 4.3 Design for testability

- **Expose stable, semantic roles** (via Radix and native elements) so queries are reliable.
- **Keep logic in pure functions** where possible (e.g. `lib/` helpers) — they're trivially unit-testable without rendering.
- **Avoid deep prop drilling** that makes a component hard to render in isolation.
- **Provide accessible names** so `getByRole("button", { name: /save/i })` works.

---

## 5. Security

### 5.1 Rendering untrusted content

- **Never use `dangerouslySetInnerHTML`** with user-supplied or API data. If you must render rich text, sanitise it first (e.g. DOMPurify) and whitelist tags.
- **React escapes text by default** — render user data as `{value}`, never as HTML.
- **Sanitise URLs** before putting them in `href`/`src`. Block `javascript:` and `data:` schemes unless explicitly intended.

### 5.2 Inputs & data

- **Validate and sanitise all input** at the boundary (forms, query params, API responses).
- **Never render secrets** (tokens, keys) into the DOM or logs.
- **Avoid storing sensitive data in `localStorage`** — prefer memory or server-side sessions; be aware of XSS exposure.
- **Escape/encode** anything interpolated into attributes or URLs.

### 5.3 Dependencies & supply chain

- **Pin and audit dependencies** (`npm audit` / `bun audit`); keep Radix and other primitives updated.
- **Prefer well-maintained, widely-used primitives** over hand-rolled risky code.
- **Don't disable security warnings** in tooling without justification.

### 5.4 Auth & data exposure

- **Don't leak data** through component props or state that shouldn't be visible to the client.
- **Gate sensitive UI** behind proper auth checks at the data layer, not just hidden components (hidden ≠ secure).
- **Be careful with error messages** — don't expose stack traces or internal details to end users.

---

## 6. Definition of Done (component checklist)

Before a component is considered done, verify:

- [ ] **Look:** PascalCase, one component per file, `cn()` used, `data-slot` present, CVA variants for visual states, accessible (semantic + keyboard + focus + reduced-motion).
- [ ] **Behaviour:** props typed with `React.ComponentProps` base, props spread, state minimal and colocated, effects cleaned up with correct deps, no mutation.
- [ ] **Performance:** no obvious re-render hotspots, heavy work memoized or lazy-loaded, animations respect reduced-motion and clean up.
- [ ] **Testability:** behaviour tests exist (`component.test.tsx`), use role/label queries, cover happy + edge + error paths.
- [ ] **Security:** no `dangerouslySetInnerHTML` with untrusted data, URLs sanitised, no secrets in client, inputs validated.
- [ ] **Tooling:** `bun run typecheck`, `bun run lint`, and `bun test` all pass.

---

## 7. Anti-patterns to avoid

| Anti-pattern | Why it's bad | Do instead |
| --- | --- | --- |
| `div` with `onClick` for a button | Not keyboard-accessible, no semantics | Use `<button>` or Radix |
| `dangerouslySetInnerHTML` with API data | XSS risk | Render as text or sanitise |
| Array index as list key | Broken reordering/state | Use stable unique id |
| Effect that sets state from props | Extra renders, sync bugs | Derive during render |
| Inline object/function props on memoized child | Memo never works | `useCallback`/`useMemo` |
| Deep prop drilling | Hard to test/maintain | Compose children, context |
| `useMemo`/`useCallback` everywhere | Overhead, noise | Only where it matters |
| Removing focus-visible styles | Accessibility regression | Keep visible focus |
| Module-scope side effects | Breaks tests, unpredictable | Keep effects in lifecycle |

---

## 8. References

- [React docs — Thinking in React](https://react.dev/learn/thinking-in-react)
- [React docs — Rules of Hooks](https://react.dev/reference/rules-of-hooks)
- [React docs — `useEffect`](https://react.dev/reference/react/useEffect)
- [Radix UI primitives](https://www.radix-ui.com/primitives)
- [Testing Library — queries](https://testing-library.com/docs/queries/about)
- [MDN — Web security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
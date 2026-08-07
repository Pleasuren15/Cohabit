# Component Audit — `src/cohabit.web`

**Date:** 2026-08-05
**Scope:** 33 components across `components/`, `components/ui/`, `components/base-ui/`, `components/loading-ui/`.
**Reference:** [react-component-guidelines.md](./react-component-guidelines.md)

This audit flags components that deviate from the guidelines. Priority tiers reflect severity (security, accessibility, correctness, then style/consistency).

---

## 🔴 HIGH — needs rework

### 1. `ui/file-upload.tsx` — SECURITY (critical)
- **API keys embedded in client code.** `S3Provider` and `CloudinaryProvider` take an `apiKey` and send it in headers/form-data from the browser. This exposes secrets to anyone inspecting the bundle. Uploads must go through a server-side proxy or signed URLs.
- `console.error` in the catch leaks internals.
- Dropzone is a `<div onClick>` — **not keyboard accessible** (no `role`/`tabIndex`/`onKeyDown`).
- `Math.random()` for ids, deprecated `.substr`, `React.FC`, no `cn()`, semicolons/single-quotes (inconsistent with repo style).
- **Duplicated:** `file-upload-2.tsx` is a second, cleaner upload component. Consolidate to one.

### 2. `ui/edit-profile.tsx` — accessibility + consistency
- Labels are **not associated** with inputs — `<label>` elements have no `htmlFor`/`id`, and inputs use `title="fullName"` etc. (a tooltip, not an accessible name). Screen readers cannot map them.
- `React.FC`, `framer-motion` (rest of repo uses `motion/react`), hardcoded hex colors (`bg-[#F5F5F7]`, `#1C1C1E`) instead of design tokens, no `cn()`, no `focus-visible` rings, arbitrary `z-100`/`z-101`.
- Custom modal — no focus trap, no `aria-modal`, no Escape handling.

### 3. `ui/glass-dock.tsx` — structure & leaks
- **Module-scope side effect:** dynamic `import("gsap/MorphSVGPlugin")` + `console.warn` run at import time — violates the "no module-scope side effects" rule and can break tests/SSR.
- **702 lines of duplicated GSAP keyframes** (`animateHome/Blog/Marker/Email/LinkedIn/X/Github` are near-identical) — extract a data-driven config.
- **GSAP tweens never killed** on unmount → memory leak.
- `onMouseEnter={() => {}}` dead prop; `window.location.href` navigation (full reload); `role="button"` divs with manual keyboard handling.

---

## 🟠 MEDIUM — should be relooked

### 4. `ui/detail-page.tsx` (750 lines)
- Monolithic — split into `Gallery`, `OwnerCard`, `AmenitiesRow`, `RelatedListings`.
- **Custom full-screen modal** — no focus trap / `aria-modal` / Escape (keyboard handled manually).
- `setTimeout` in `handleShare` not cleaned up → state update after unmount.
- `derivePhone`/`deriveEmail` fabricate contact data from `id`/`name` — fake data in a component.
- `key={i}` for gallery; `colorMap` and `formatPrice` recreated each render; hardcoded `bg-blue-500`/`bg-purple-500` instead of tokens.

### 5. `ui/expandable-profile-card.tsx`
- **Nested interactive elements:** the expandable header is `role="button"` *containing* real `<button>`s (View/Share/Heart) — an accessibility violation.
- `navigator.clipboard.writeText(...).then()` with **no `.catch`** → unhandled rejection; no `navigator.share` fallback.
- `setTimeout` not cleaned up.

### 6. `ui/user-profile.tsx` (796 lines)
- Monolithic — the new-listing wizard, verify dialog, and edit dialog should be extracted.
- Two custom modals — no focus trap / `aria-modal` / Escape.
- 12 separate `useState` fields for the listing form — collapse into one form-state object.
- `LISTING_GRADIENTS` recreated each render.

### 7. `ui/meeting-card.tsx`
- **Dead code:** `const [theme] = useState('light')` never changes; `isRecording`/`isAiEnabled` state unused; `recording`/`aiNotes` props declared but never destructured; "Going?" buttons have no handler.
- `Toggle` is a `<div onClick>` — not keyboard accessible, no `role="switch"`/`aria-checked`.
- `React.FC`, hardcoded hex colors, no `cn()`.

### 8. `ui/family-receive-component.tsx`
- Default `description="Are you sure you want to receive hell load of money?"` — unprofessional placeholder shipped as a default.
- Custom modal — no focus trap / `aria-modal` / Escape.
- `React.FC`, hardcoded `bg-[#00A6F4]`, no `cn()`.

### 9. `ui/file-upload-2.tsx`
- Dropzone `<div onClick>` not keyboard accessible; remove button has no `aria-label`/`type="button"`.
- `formatFileSize`/`getFileIcon` recreated each render (minor).

---

## 🟡 LOW — minor polish

- **`ui/view-on-map.tsx`** — `const [isDark] = useState(false)` dead state; uses template literal instead of `cn()`.
- **`ui/pin-item.tsx`** — hardcoded `INITIAL_PLACES` demo data inside component; pin button lacks `aria-pressed`; state won't sync if `items` prop changes.
- **`ui/theme-provider.tsx`** — `setTheme: () => {}` is a misleading no-op; unnecessary `useMemo`; module `useEffect` removes localStorage.
- **`base-ui/native-select.tsx`** — `${className || ""}` instead of `cn()`; no `data-slot`.
- **`loading-ui/twin-orbit.tsx`** — injects a `<style>` tag per instance (duplicate keyframes if used multiple times).
- **`ui/flip-text.tsx`** — `getCharIndex` recreated each render (minor).

---

## ✅ Compliant (no action)

`button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `accordion.tsx`, `popover.tsx`, `select.tsx`, `tooltip.tsx`, `ui/tabs.tsx`, `faq-06.tsx`, `popover-12.tsx`, `select-33.tsx`, `listing-filter.tsx`, `auth-03.tsx`, `MeshBackground.tsx` — these follow the shadcn/`cn()`/`data-slot`/Radix patterns correctly.

---

## ⚠️ Structural notes

- **Duplicate `tabs.tsx`** — `base-ui/tabs.tsx` and `ui/tabs.tsx` are identical. Keep one.
- **Two file-upload components** (`file-upload.tsx`, `file-upload-2.tsx`) — consolidate.
- **`base-ui/` vs `ui/`** split is inconsistent — several "base" primitives live in `ui/`.

---

## Priority order

1. `file-upload.tsx` — API-key exposure (security)
2. `edit-profile.tsx` — label accessibility
3. `glass-dock.tsx` — module side-effect + GSAP leak
4. `detail-page.tsx`, `expandable-profile-card.tsx`, `user-profile.tsx`, `meeting-card.tsx`, `family-receive-component.tsx`, `file-upload-2.tsx`
5. Minor polish items
6. Structural consolidation
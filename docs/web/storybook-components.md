Storybook-Driven Development — Web Component Inventory

Overview

This repository follows a storybook-driven workflow for the React frontend (src/cohabit.web). Before a component is added or significantly changed in cohabit.web, it must first be designed and documented as a Storybook story. Storybook is the source of truth for the component catalogue: every UI primitive and composite ships with a story, and cohabit.web consumes only components that already exist in the catalogue.

Why storybook-driven

- Components are designed, reviewed and tested in isolation before they reach the application.
- Storybook provides live documentation of props, variants and states for the whole team.
- The story suite doubles as a visual regression surface (component is not "done" until its story passes).
- Enforcing "story first" keeps cohabit.web thin: it wires up data and pages, never invents UI.

Workflow — Story first, then cohabit.web

1. Design the component in Storybook:
   - Create/update a story under the web storybook project.
   - Cover every variant, state and prop the component exposes.
   - Keep stories self-contained (mock data inline; no app coupling).
2. Review the story (interactions, a11y, responsive states, dark/light theme).
3. Only after the story is accepted, add or modify the component in src/cohabit.web/src/components.
4. Import and compose the component in the application pages.
5. Keep the story and the component in sync whenever the component API changes.

Rule: no new component lands in cohabit.web unless it has an approved story in the catalogue first.

Component inventory (target for the web storybook)

The catalogue below mirrors the components currently present in src/cohabit.web/src/components. These are the minimum stories required to be storybook-driven.

Primitives (base-ui)

- tabs — base tab list/panel behaviour used by composite components.
- native-select — lightweight native select used where full select is unnecessary.

Foundational UI (ui)

- button — core action control; cover primary, secondary, outline, ghost, destructive, sizes, disabled, loading.
- badge — small status/label pill; cover variants and dot/live states.
- card — base surface; cover default, interactive, with image/media.
- input — text input; cover label, placeholder, error, disabled, sizes.
- label — form label used with inputs.
- separator — visual divider; cover horizontal/vertical orientation.
- accordion — collapsible content sections; cover single/multiple open modes.
- popover — floating popover; cover trigger, positioning, dismiss.
- popover-12 — alternate popover implementation (legacy); cover trigger and placement.
- select — styled select dropdown; cover single, grouped options, disabled, error.
- select-33 — alternate styled select; cover same states as select.
- tooltip — simple tooltip; cover placement and delay.
- tooltip-2 — extended tooltip; cover placement, rich content.
- tabs (ui) — styled tabs; cover active/inactive, disabled, icon tabs.

Composite components (ui)

- auth-03 — authentication/sign-in screen composition.
- contract-document — styled rental contract document used for preview and PDF export; cover roommate, lease and empty states.
- contract-generator — wizard dialog that builds a roommate agreement or residential lease, previews it and exports a PDF; cover the type → details → preview flow.
- detail-page — listing/profile detail layout; cover loading, empty, populated states.
- edit-profile — profile editing form composition.
- expandable-profile-card — profile card with expand/collapse.
- family-receive-component — family/roommate receive flow component.
- faq-06 — FAQ accordion/list section.
- file-upload — file upload control; cover drop, select, progress, error.
- file-upload-2 — alternate file upload implementation.
- flip-text — text flip/flip-card animation.
- glass-dock — glassmorphic dock/nav bar.
- meeting-card — meeting/event card.
- minimal-carousel — image/media carousel; cover auto-play, navigation, empty.
- pin-item — pinned map/list item.
- user-profile — user profile display.
- view-on-map — map view trigger/link.

Loading UI (loading-ui)

- twin-orbit — loading indicator; cover sizes and colors.

Layout & integration (top-level)

- listing-filter — listing filter bar composition; cover default, applied filters, clear.
- MeshBackground — animated mesh/three background; story in a full-bleed canvas.
- theme-provider — theme provider wrapper; story demonstrates dark/light toggling around a sample component.

Notes

- Naming: story files live alongside their component (ComponentName.stories.tsx) in the web storybook project and are organised in the same folders as above.
- Each composite component should include a story per meaningful state: loading, empty, populated, error, disabled.
- Components marked legacy (popover-12, select-33, tooltip-2, file-upload-2) should be documented but flagged for consolidation; new work prefers their primary equivalents.

Workflow guardrails

- A pull request adding a component to cohabit.web must reference its Storybook story.
- Changing a component's public API requires updating its story in the same change.
- Removed components are removed from the catalogue and cohabit.web in the same change.

End of document

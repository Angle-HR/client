---
name: figma-first-build
description: Mandatory process for building or modifying any web page/section from a Figma design in this project. Use before and during every landing-page or marketing-page build, and whenever a task says "build this from Figma" or references a Figma URL for a page implementation. Enforces Figma as the source of truth (no guessed assets, spacing, or breakpoints), section-by-section implementation with desktop+mobile verification at each step, and a final audit checklist before declaring the task done.
---

# Figma-First Build

This skill exists to prevent a specific, recurring failure mode: implementing a page that looks *approximately* right, then discovering — only after the user points it out — that an asset was substituted, a breakpoint was treated as "just a scaled desktop," a section's position drifted from arbitrary margins, or a scroll interaction fired at the wrong point. Every rule below traces back to a mistake made and corrected in this project's `/open-hr` build.

## Core principle

**Figma is the source of truth.** Do not guess, approximate, substitute, or redesign elements when the required information can be obtained from Figma. If something is unclear or missing from Figma, identify the ambiguity explicitly rather than silently inventing a solution.

## 1. Inspect before implementing

Before writing or modifying code for a section:

- Inspect the exact Figma frame/node relevant to the task, using `get_design_context` (see the `figma-design-to-code` skill for the tool-call mechanics) — not `get_screenshot` alone.
- Identify both the desktop and mobile versions of that section.
- Check exact dimensions, spacing, padding, gaps, alignment, positioning, typography, borders, radius, shadows, and colors.
- Identify which elements are images, components, text, buttons, forms, or purely decorative.
- Inspect the actual image assets used in Figma and export them — never hand-author a substitute.
- Confirm whether the element has different desktop and mobile behavior, not just different sizing.
- Check whether elements are centered, left-aligned, right-aligned, absolutely positioned, or in normal layout flow.
- Do not infer dimensions from a screenshot when the real Figma properties are available via `get_design_context` or `get_variable_defs`.

Do not start implementation of a section until you understand its design.

## 2. Never substitute or invent assets

For every image:

- Confirm the exact asset used in Figma, separately for desktop and mobile.
- Verify the implementation actually references the intended asset (grep the rendered `src`, don't assume).
- Remove obsolete asset references when a section is replaced or updated — check for orphans after the change.
- Preserve the intended aspect ratio, dimensions, and positioning from Figma.
- Do not crop, stretch, or reposition an image unless Figma explicitly shows that behavior.

After implementation, load the page and confirm the rendered output is actually displaying the intended asset — not a placeholder, not the wrong breakpoint's asset.

## 3. Desktop and mobile are both intentional designs

Never assume mobile is a scaled-down desktop. For every section, explicitly compare layout, width, height, alignment, spacing, image position, typography, navigation, and form behavior between the two. If Figma provides separate mobile and desktop frames, implement both intentionally rather than deriving one from the other with a breakpoint prefix and hoping it holds up.

## 4. Match positioning, not just appearance

Visual similarity is not enough. Pay particular attention to vertical/horizontal positioning, content centering, image placement, section height, internal padding, gaps between elements, the relationship between text and images, alignment between columns, and button/form position.

Do not "fix" a layout by adding arbitrary margins until it looks approximately correct — use the underlying layout structure (flex/grid relationships, not magic-number nudges) that produces the same result as Figma. For sections like About/FAQ especially, compare directly against Figma and ensure content and images occupy the same visual positions, not just a similar-looking arrangement.

## 5. Preserve Figma image dimensions

Preserve the intended dimensions, aspect ratio, and container sizing from Figma. Match `object-fit` behavior where applicable, and the image's position inside its container. Do not resize an image just because another breakpoint is easier to implement, and implement desktop/mobile dimension differences explicitly when Figma specifies them.

## 6. Navigation and scroll interactions

Do not approximate a scroll trigger position. Identify the exact trigger location (a DOM element/sentinel to measure against, not an arbitrary hardcoded scroll-Y value), keep the element hidden before the trigger, reveal it at the correct point, match desktop and mobile designs, avoid layout shift, make the transition smooth, and verify scrolling both up and down. Prefer `IntersectionObserver` over scroll-event listeners for this. Keep the interaction logic (state, observer wiring) separate from the visual styling (CSS transition/transform) so each stays easy to maintain independently.

## 7. Reuse only what's designated — don't force the design system in

If a page intentionally does not use the shared design system, only reuse whatever the task explicitly designates (e.g. the `Button`/`FlowButton`/`IconButton` family and `Input`) — not other shared design-system components, just because they already exist. At the same time, build sensible local components for structures repeated *within the page itself* (e.g. a logo mark used in both the header and sticky nav, a CTA button used in three places) — but don't create abstractions for one-off elements.

## 8. Component architecture

Split the page into sensible section components (Navigation, Hero, Form, About, FAQ, Footer, etc.) rather than one giant page file. Avoid deeply nested unnecessary wrappers, duplicate markup, components that wrap a single trivial element without reason, excessive prop drilling, unnecessary state, and unnecessary libraries. Keep it simple — three similar lines beats a premature abstraction, but 2+ verbatim duplicated blocks should become a shared component.

## 9. Styling discipline

Check whether an existing local style/token can be reused before adding a new one. Avoid duplicated CSS, unnecessary `!important` (a `!important` that overrides a reused component's own baked-in classes across a breakpoint is legitimate — an unexplained one stacked on top of normal page CSS is not), excessive specificity, unexplained magic numbers, inconsistent breakpoints, and inconsistent spacing values. Remove obsolete styles after modifying a section. Do not create a new global design system for a page that's meant to stay local — named CSS custom properties scoped to the page's own class are fine for values repeated 3+ times; everything else can stay as explicit Tailwind values.

## 10. Accessibility — built in, not bolted on

Check each section for: semantic HTML, correct heading hierarchy (no skipped levels, no using `<p>` where a heading belongs), image `alt` text (empty `alt=""` for decorative images, descriptive for meaningful ones), keyboard navigation, visible `focus-visible` states on every interactive element (don't assume Tailwind Preflight/reset preserves the browser default — verify computed `outline` isn't empty), accessible buttons/forms with real labels, ARIA only where semantic HTML can't express the state (`aria-expanded`, `aria-live`, `aria-hidden` on decorative/duplicate landmarks), sufficient touch targets, and no interaction that depends exclusively on hover.

## 11. Performance

Check for unnecessary re-renders, expensive scroll handlers (prefer `IntersectionObserver`), unnecessary client-side JS (`'use client'` only where a file actually touches client-only APIs or wires event handlers into a Client Component), unoptimized images (`next/image` with explicit width/height, `priority` on above-the-fold/LCP images), layout shifts (reserve space for conditionally-shown content instead of pushing layout), excessive DOM complexity, and unnecessary dependencies.

## 12. Verification is mandatory, per section

After implementing a section, do not assume it's correct — visually compare the rendered page against Figma at the relevant viewport widths (desktop and mobile at minimum). Check layout (position, height, width, alignment, padding, gaps), typography (font, size, weight, line-height, letter-spacing, text width), images (correct asset, dimensions, aspect ratio, crop, position), components (button, form, nav, FAQ interactions), and responsive behavior (desktop, mobile, no unexpected overflow, no broken intermediate widths).

## 13. Don't declare success too early

A section is not done just because it renders, has no console errors, and "looks generally similar." It's done when it's been checked against the actual Figma design and any material difference has been fixed.

## 14. Build one section at a time

1. Inspect the Figma section (desktop + mobile).
2. Implement the section.
3. Verify desktop.
4. Verify mobile.
5. Compare against Figma.
6. Fix discrepancies.
7. Only then move to the next section.

Don't implement the whole page first and try to reconcile everything against Figma at the end.

## 15. Final audit before finishing any task

- [ ] Correct Figma frame/node was used as the source of truth for every section touched.
- [ ] Desktop matches Figma.
- [ ] Mobile matches Figma.
- [ ] Correct images/assets are actually rendering (verified in-browser, not assumed).
- [ ] Image dimensions and positioning match Figma; no stretch/crop.
- [ ] Section-by-section positioning (e.g. About, FAQ) matches Figma, not just "looks close."
- [ ] Navigation/scroll behavior matches the specified trigger, on both breakpoints.
- [ ] Only the designated shared components were reused — no other shared design-system components crept in.
- [ ] No duplicated markup left unextracted where it was genuinely repeated (2+ times).
- [ ] No dead code, orphaned assets, or unused imports remain.
- [ ] Responsive behavior checked at desktop, mobile, and at least one intermediate width — no overflow.
- [ ] Accessibility checked: headings, alt text, focus-visible, keyboard nav, ARIA where needed.
- [ ] Performance checked: no expensive scroll handlers, no missing `priority`/`next/image` sizing, no layout shift.
- [ ] The implementation has actually been visually compared against Figma, not just read as code.

## Final rule

Never guess when Figma can answer the question. If the design specifies an image, use that image. If it specifies a position, reproduce that position. If desktop and mobile differ, implement the difference. If the design is ambiguous, say so — don't silently invent a solution.

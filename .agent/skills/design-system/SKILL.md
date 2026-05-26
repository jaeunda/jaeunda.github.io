---
name: design-system
description: "Use when changing jaeunda.log visual design, Quartz layout, typography, colors, responsive behavior, home-page components, article styling, tag/list pages, or UI polish. Ensures every agent follows the repository's actual design system and produces consistent output from the same input."
user-invocable: true
---

# jaeunda.log Design System

Use this skill before any visual, layout, styling, or component-facing change in
this Quartz 4 blog.

## Source Of Truth

Actual code is the source of truth. Before editing a design-system surface, read
the relevant files first:

- `quartz.config.ts`: theme colors, fonts, site settings
- `quartz.layout.ts`: page component placement
- `quartz/styles/custom.scss`: project-specific CSS patterns
- `quartz/styles/variables.scss`: breakpoints and layout constants
- `quartz/components/Hero.tsx`: home hero
- `quartz/components/TagCloud.tsx`: home tag chips and tag data
- `quartz/components/RecentNotesWithPreview.tsx`: home recent-post cards
- `quartz/components/scripts/homeFilter.inline.ts`: home tag filtering
- `content/index.md`: home page content shell

For detailed current tokens and component specs, read
`references/design-system.md`.

## Non-Negotiable Principles

1. Preserve the quiet green-gray system. Use existing CSS variables before adding
   a new color.
2. Keep body reading dense but breathable: compact line height, larger paragraph
   spacing, and asymmetric heading margins.
3. Keep hierarchy subtle. Important text uses `var(--dark)` or
   `var(--tertiary)`; metadata uses `var(--gray)`.
4. Never use `var(--lightgray)` for metadata or body-adjacent text. It is for
   borders and faint surfaces.
5. Mobile text must never touch viewport edges. Preserve the `.center` padding
   floor of 20px on mobile.
6. Prefer small, restrained changes that match the existing Quartz structure.
   Do not introduce landing-page, marketing, card-heavy, or decorative styling.

## Deterministic Workflow

When handling a design request:

1. Identify the request domain: color, typography, article content, home page,
   list pages, sidebar, mobile layout, or interaction.
2. Read the relevant source files listed above, plus
   `references/design-system.md` for expected values.
3. If the reference and code disagree, follow the code and update the reference
   in the same change.
4. Reuse existing classes, variables, and component patterns. Add new selectors
   only near the related section in `custom.scss`.
5. For any token or pattern change, add a one-line entry to the Design Decisions
   Log in `references/design-system.md`.
6. Validate the behavior that changed. For CSS-only changes at minimum run
   `git diff --check`; for build-impacting changes also run the project check or
   build command available in `package.json`.

## Editing Rules

- Add colors in `quartz.config.ts` only when existing `light`, `lightgray`,
  `gray`, `darkgray`, `dark`, `secondary`, `tertiary`, `highlight`, or
  `textHighlight` cannot express the need.
- Keep article styling under the existing `article { ... }` block in
  `custom.scss` unless the behavior is page-specific.
- Keep home-page styles under the "Home Page Redesign" section.
- Keep mobile drawer and content padding styles under the "Mobile Drawer Layout
  + Content Padding" section.
- For home interactions, preserve data attributes:
  `data-home-tagcloud`, `data-tag`, `data-home-recent`, `data-tags`,
  `data-recent-count`, `data-active-filter`, and `data-recent-empty`.
- Preserve Cmd/Ctrl/Shift/middle-click default navigation on tag chips.

## Output Standard

When reporting a design-system change, include:

- Files changed
- The design-system decision made
- Validation run, or why it was not run


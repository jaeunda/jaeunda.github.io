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
- `quartz/components/SiteNav.tsx`: the site's one navigation bar
- `quartz/components/HomeStack.tsx`: the whole home page — featured, layers, index
- `quartz/components/PostRow.tsx`: the one post row, used by every listing
- `quartz/components/postMeta.ts`: layers, editorial rank, the date/length
  contract
- `quartz/styles/fonts.scss`: the type stack plus `--surface`, `--shadow`,
  `--shadow-lift`, `--lift-ease`
- `quartz/components/scripts/homeStack.inline.ts`: home layer filtering
- `content/index.md`: the home masthead copy

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
   Do not introduce landing-page or marketing styling.
7. **Elevation is rationed, and the ration is two.** The site has exactly two
   resting cards — the home page's featured post and the foot-of-post
   `ReadNext` — and they are deliberately the first and last things a reader
   sees. Everything between them is flat: rows, article body, code blocks,
   tables, callouts. Lift on hover is cheap and allowed on controls; a new
   _resting_ card is a design change that needs a reason and a log entry.
8. **Motion belongs to lists and controls, never to prose.** Entrances and
   reveals run on the home page and on lists; nothing in an article body ever
   moves. All of it sits behind `prefers-reduced-motion: no-preference`, and no
   animation may be the only thing that makes content visible.

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
6. If the change adds or reorders posts, judge `rank` for every post in the
   affected layer — see **Editorial Rank** in the reference. Appending is not
   ranking.
7. Validate the behavior that changed. For CSS-only changes at minimum run
   `git diff --check`; for build-impacting changes also run the project check or
   build command available in `package.json`.

## Editing Rules

- Add colors in `quartz.config.ts` only when existing `light`, `lightgray`,
  `gray`, `darkgray`, `dark`, `secondary`, `tertiary`, `highlight`, or
  `textHighlight` cannot express the need.
- Keep article styling under the existing `article { ... }` block in
  `custom.scss` unless the behavior is page-specific.
- Never hardcode a shadow. `--shadow` / `--shadow-lift` in `fonts.scss` are the
  only two, they are the portfolio's values verbatim, and anything that travels
  uses `--lift-ease`. Travel distances are fixed: cards -3px, tabs -2px, pills
  -1px, arrows +3px on X.
- `custom.scss` is sectioned by banner comments. Keep home-page styles under
  `── Home ──` / `── Featured post ──` / `── Layers ──`, the row under
  `── Shared post row ──`, navigation under `── Top bar ──` and
  `── Site shell ──`, and content padding under `── 콘텐츠 좌우 패딩 ──`.
  Add new selectors beside the related section, not at the end of the file.
- For home interactions, preserve `data-home-stack`, `data-hs-featured`,
  `data-layer` on both the layer tabs and the post rows, and `aria-pressed` as
  the open-tab marker. On Topics, preserve `data-topic-switcher`,
  `data-topic-strip`, `data-topic` on chips and panels, and `aria-current`.
- Preserve Cmd/Ctrl/Shift/middle-click default navigation on tag chips.
- A listing that needs a post row calls `PostRow`. Do not write the row markup
  again — it was written three times and two copies drifted.

## Output Standard

When reporting a design-system change, include:

- Files changed
- The design-system decision made
- Validation run, or why it was not run

# jaeunda.log Design System Reference

This reference mirrors the current repository state. If code and this file
disagree, code wins; update this file in the same patch.

## Quick Reference

| File                                             | Role                                           |
| ------------------------------------------------ | ---------------------------------------------- |
| `quartz.config.ts`                               | Color tokens, font families, site settings     |
| `quartz.layout.ts`                               | Component placement for content and list pages |
| `quartz/styles/custom.scss`                      | Project-specific visual system                 |
| `quartz/styles/variables.scss`                   | Breakpoints, grid constants, font weights      |
| `quartz/components/Hero.tsx`                     | Index-only home hero                           |
| `quartz/components/TagCloud.tsx`                 | Index-only top tag chips                       |
| `quartz/components/RecentNotesWithPreview.tsx`   | Index-only recent post cards                   |
| `quartz/components/scripts/homeFilter.inline.ts` | Tag-to-recent filtering                        |
| `content/index.md`                               | Empty home page content shell                  |

## Design Principles

1. Balance cohesion and breath: `article` line-height is 1.78 on desktop and
   paragraph spacing is 1.5em.
2. Use asymmetric heading spacing: heading top margins are much larger than
   bottom margins so headings attach to the content below.
3. Keep the palette in a low-chroma green-gray family. Prefer existing tokens.
4. Build hierarchy through lightness and chroma, not loud color.
5. Maintain mobile-first text padding. Mobile `.center` horizontal padding is
   at least 20px with safe-area inset protection.

## Color Tokens

Declared in `quartz.config.ts`.

### Light Mode

| Token           | Value                      | Use                                |
| --------------- | -------------------------- | ---------------------------------- |
| `light`         | `#f6f7f5`                  | Page background                    |
| `lightgray`     | `#dde0d3`                  | Borders and faint surfaces         |
| `gray`          | `#7a7d72`                  | Metadata and secondary text        |
| `darkgray`      | `#2b2e28`                  | Body text                          |
| `dark`          | `#1a1d17`                  | Headings and strong emphasis       |
| `secondary`     | `#9aa888`                  | UI accent and decorative underline |
| `tertiary`      | `#6b7a5a`                  | Body links, active states          |
| `highlight`     | `rgba(154, 168, 136, 0.2)` | Tints and table header backgrounds |
| `textHighlight` | `#cdd8be`                  | Markdown mark highlight            |

### Dark Mode

| Token           | Value                       | Use                          |
| --------------- | --------------------------- | ---------------------------- |
| `light`         | `#1c1e19`                   | Page background              |
| `lightgray`     | `#2a2d26`                   | Borders and faint surfaces   |
| `gray`          | `#7a7d72`                   | Metadata and secondary text  |
| `darkgray`      | `#c4c9c2`                   | Body text                    |
| `dark`          | `#f0f2ee`                   | Headings and strong emphasis |
| `secondary`     | `#b8c3a5`                   | UI accent                    |
| `tertiary`      | `#9aa888`                   | Body links and active states |
| `highlight`     | `rgba(154, 168, 136, 0.18)` | Tints                        |
| `textHighlight` | `#3a4a30`                   | Markdown mark highlight      |

### Color Rules

- Body text: `var(--darkgray)`
- Headings: `var(--dark)`
- Metadata: `var(--gray)`, never `var(--lightgray)`
- Links: `var(--tertiary)`
- Borders: `var(--lightgray)`
- Active selection: `var(--tertiary)` background with `var(--light)` text,
  except dark-mode `.top-tag.active`, which uses `var(--dark)` text.

## Typography

Declared in `quartz.config.ts`:

| Token                     | Font          | Use                                      |
| ------------------------- | ------------- | ---------------------------------------- |
| `header` / `--headerFont` | Fraunces      | Page title, hero, post-card titles       |
| `body` / `--bodyFont`     | Noto Sans KR  | Body, h4-h6, navigation body text        |
| `code` / `--codeFont`     | IBM Plex Mono | Code, tags, dates, counters, identifiers |

Current global body defaults in `custom.scss`: 1.0625rem, line-height 1.75,
font-weight 400, letter-spacing -0.01em.

### Article Scale

| Element          | Current Style                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.article-title` | Fraunces `clamp(28px, 3vw, 36px)`, 700, line-height 1.2                                                                                          |
| `article`        | 15px desktop / 16px mobile, line-height 1.78 desktop / 1.75 mobile, max-width 680px, `word-break: keep-all`, `overflow-wrap: anywhere`           |
| `p`              | margin-bottom 1.5em, `text-wrap: pretty`                                                                                                         |
| `h1`             | Fraunces 1.55em desktop / 1.5em mobile, 700, line-height 1.25                                                                                    |
| `h2`             | Fraunces 1.47em desktop / 1.25em mobile, 600, line-height 1.28, margin-top 3em desktop / 2.4em mobile, bottom border toned down with `color-mix` |
| `h3`             | Fraunces 1.2em desktop / 1.06em mobile, 600, line-height 1.35, margin-top 2.4em desktop / 2em mobile                                             |
| `h4`             | Body font 1em, 700, line-height 1.38, margin-top 1.8em, color `darkgray`                                                                         |
| `h5`             | Body font 0.93em, 700                                                                                                                            |
| `h6`             | IBM Plex Mono 0.87em, 600, uppercase, letter-spacing 0.08em                                                                                      |
| `li`             | line-height 1.78, margin-bottom 0.35em                                                                                                           |
| inline `code`    | 0.86em, IBM Plex Mono, tint background, 1px border, radius 4px                                                                                   |
| `pre code`       | 12.5px, line-height 1.62                                                                                                                         |
| `blockquote`     | 2.5px `lightgray` left border, no background, no italic                                                                                          |

Article h1-h3 use the display font but remain subordinate to `.article-title`.
Article `strong` uses 600 weight plus `dark`; article `em` uses a subtle
`highlight` background instead of italic for Korean readability.

## Layout

Breakpoints in `variables.scss`:

| Name       | Value                                |
| ---------- | ------------------------------------ |
| `$mobile`  | max-width 800px                      |
| `$tablet`  | min-width 800px and max-width 1200px |
| `$desktop` | min-width 1200px                     |

Content padding in `custom.scss`:

| Viewport               | `.center` horizontal padding                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| default / wide         | 48px                                                                             |
| max-width 1100px       | 32px                                                                             |
| mobile max-width 800px | `max(20px, env(safe-area-inset-left))` / `max(20px, env(safe-area-inset-right))` |

`$sidePanelWidth` is 320px. Desktop grid has left, center, and right columns;
tablet grid has left plus center; mobile stacks sections.

## Sidebar And TOC

Shared type roles:

- Display: Fraunces 600-700 for brand, page title, article h1-h3, section
  labels, and card titles.
- Body: Noto Sans KR 400-500 for paragraphs, previews, h4-h6 body-level text,
  and readable sidebar label bodies.
- Identifier / Meta: IBM Plex Mono 400-500 for tags, dates, read time, counts,
  breadcrumb, code, filename prefixes, and TOC number prefixes.

Explorer:

- Section label: Fraunces 18px, 600, `var(--dark)`.
- Items are split when they match `02-1-Title`: prefix uses IBM Plex Mono
  10.5px `var(--gray)`; body uses Noto Sans KR 13px `var(--darkgray)`.
- Hyphens in Explorer labels are rendered as spaces.
- Active: prefix and body both become `var(--tertiary)`, weight 500.

TOC:

- Sticky on desktop, `top: 24px`, max-height `calc(100vh - 48px)`.
- Numbered headings are split when they match `2.5.1. Title`: prefix uses IBM
  Plex Mono 10.5px, tabular nums, min-width 2.6em; body uses Noto Sans KR
  11.5px.
- Depth 3 body text is 11px `var(--gray)`.
- In-view: prefix and body both become `var(--tertiary)`, weight 500.

Breadcrumb:

- IBM Plex Mono 11.5px `var(--gray)`; links use `var(--tertiary)`.

## Home Page

Current `defaultContentPageLayout.beforeBody` renders on every content page, but
the custom home components return `null` unless `fileData.slug === "index"`:

1. `TagCloud({ limit: 8 })`
2. `RecentNotesWithPreview({ limit: 20, showTags: true, showReadTime: true })`
3. Breadcrumbs, ArticleTitle, ContentMeta, TagList for non-index pages

`Hero.tsx` exists but is not currently mounted in `quartz.layout.ts`. If adding
the hero, preserve its `fileData.slug === "index"` guard and place it before
`TagCloud`.

`content/index.md` is empty. Home content is component-driven.

### Section Header

- `.section-header`: flex, baseline aligned, `margin-bottom: 14px`.
- `.section-title`: Fraunces 16px, 600, `var(--dark)`.
- `.section-title-count`: IBM Plex Mono 11px, `var(--gray)`.
- `.section-action`: IBM Plex Mono 12px, `var(--gray)` with tertiary hover.

### Top Tags

- `.top-tags`: `margin-bottom: 44px`; mobile 40px.
- `.top-tag`: inline-flex, gap 6px, padding 5px 10px, 12px IBM Plex Mono,
  `var(--tertiary)` on `var(--highlight)`, 1px `lightgray` border, radius 5px.
- Mobile `.top-tag`: padding 7px 10px, overflow-wrap anywhere.
- Count: 10.5px, `var(--gray)`, `var(--light)` background, radius 3px.
- Active: `var(--tertiary)` background and border, `var(--light)` text; dark
  theme overrides active text to `var(--dark)`.

### Recent Post Cards

- `.recent-posts-section`: margin-bottom 32px; mobile 28px.
- `.post-card`: grid `78px 1fr`, gap 24px, padding 22px 0, bottom border,
  hover padding-left 8px.
- Tablet-ish rule at 801px-1100px: grid `64px 1fr`, gap 20px.
- Mobile: one-column grid, gap 10px, padding 26px 0, no hover slide.
- Date column: IBM Plex Mono 11px, `var(--gray)`, day 20px weight 500
  `var(--dark)`, month-year 10px uppercase letter-spacing 0.08em.
- Post title: Fraunces 19px, 600, line-height 1.3, `var(--dark)`, hover
  `var(--tertiary)`. Mobile title is 20px.
- Preview: 13.5px, line-height 1.65, `var(--gray)`, 2-line clamp.
- Tags: 11px IBM Plex Mono, transparent background, 1px `lightgray` border,
  radius 3px, `var(--gray)`.
- Read time: 11px IBM Plex Mono, `var(--gray)`, `margin-left: auto`; mobile
  full width.

### Tag Filter Interaction

`homeFilter.inline.ts` synchronizes a single selected tag across top chips,
visible post cards, recent count, active-filter chip, empty state, and the URL
`?tag=` param.

Preserve default navigation for modifier or middle clicks:
`metaKey`, `ctrlKey`, `shiftKey`, or `button === 1`.

## List Pages

`.page-listing`:

- Intro paragraph: 13px, `var(--gray)`, margin-bottom 28px.
- `li.section-li`: padding 14px 0, bottom border.
- `.section`: columns `fit-content(8em) 2fr 1.5fr`.
- `.meta`: 12px IBM Plex Mono, `var(--gray)`.
- `.desc h3`: 15px, weight 500, body font, line-height 1.35.
- Tag links: 12px IBM Plex Mono, highlight background, tertiary text,
  lightgray border, radius 4px, padding 2px 9px.

## Mobile Drawer And Padding

Existing mobile behavior:

- `.sidebar.right` hidden on mobile.
- Body `overflow-x: hidden`.
- `.readermode` hidden on mobile.
- Search collapses to icon-only.
- `.explorer-content` is fixed, top-left, `width: 100vw`.
- `.sidebar.left .darkmode` is fixed at top-right and slides with
  `html.mobile-no-scroll`.
- `html.mobile-no-scroll` translates non-left-sidebar body content by
  `translateX(100dvw)`.

Keep the `.center` mobile padding floor at 20px with safe-area inset protection
and `article { max-width: 100%; }`.

## Tables And Code

Tables:

- Full width, collapsed borders, `font-size: 0.92em`, margin-bottom 1.5em.
- `th`: highlight background, 600, padding 9px 14px, bottom border 2px.
- `td`: padding 8px 14px, bottom border 1px, tabular nums.
- Row hover: highlight background.

Code:

- Inline `p code`, `li code`, `td code`: IBM Plex Mono 0.86em,
  `rgba(154, 168, 136, 0.14)` background, 1px `lightgray` border, radius 4px,
  padding `0.1em 0.36em`, color `var(--darkgray)`, slight baseline lift,
  normal word breaking, and `overflow-wrap: anywhere`.
- Code blocks: border radius 8px, padding 16px 20px, border 1px lightgray.
- Mobile code blocks bleed to the `.center` padding edge with square side edges,
  14px/20px padding, and 12px code text.

## Validation Checklist

For visual changes, check as applicable:

- Light and dark body text remain high contrast.
- Metadata and links remain at least WCAG AA contrast.
- Mobile 375px has no horizontal scroll and keeps at least 20px side padding.
- Sidebar drawer, search, and darkmode controls do not overlap on mobile.
- Home tag chip filtering updates active chip, card visibility, count, empty
  state, and URL.
- Code blocks scroll horizontally instead of clipping.
- `git diff --check` passes.

## Design Decisions Log

### 2026-05-27

- Created shared `design-system` skill and reference from current code so all
  agents use `.agent/skills/design-system` as the design source of truth.
- Confirmed current code uses 14px article text, 1200px `$desktop`, and no
  mounted `Hero` despite the prior handoff mentioning different values.
- Mobile drawer z-index/backdrop from the prior handoff is not present in the
  current code; preserve current implementation unless explicitly changing it.
- Content side padding is 48 / 32 / 20px, with the 32px breakpoint at max-width
  1100px.
- Raised article reading size to 15px desktop and 16px mobile, tightened article
  letter-spacing to -0.005em, and widened article max-width to 680px to preserve
  Korean line length after the type size change.
- Made `.article-title` the page-level display h1 and kept `article h1`
  smaller, so markdown h1 headings cannot outrank the post title.
- Standardized article h1-h3 on Fraunces and sidebar section labels on Fraunces
  18px, while moving technical prefixes in Explorer and TOC to IBM Plex Mono.
- Added Explorer and TOC label splitting for numeric prefixes, with active and
  in-view states coloring both prefix and readable label body.
- Changed article emphasis for Korean readability: `strong` is 600 weight with
  darker text, and `em` is a subtle highlight instead of italic.

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

1. Balance cohesion and breath: long-form `article` line-height is 1.72 and
   paragraph spacing is 1.25em.
2. Use asymmetric heading spacing: heading top margins are much larger than
   bottom margins so headings attach to the content below.
3. Keep the palette in a low-chroma green-gray family. Prefer existing tokens.
4. Build hierarchy through lightness and chroma, not loud color.
5. Maintain mobile-first text padding. Mobile `.center` horizontal padding is
   at least 20px with safe-area inset protection.

## Color Tokens

Tokens are declared in `quartz.config.ts`. The isolated readability switch adds
only a separate code-and-quote reading surface; page background and body text
continue to use the base theme tokens shown below.

### Light Mode

| Token           | Value                    | Use                                |
| --------------- | ------------------------ | ---------------------------------- |
| `light`         | `#fafaf8`                | Page background                    |
| `lightgray`     | `#e3e4df`                | Borders and faint surfaces         |
| `gray`          | `#5f6259`                | Metadata and secondary text        |
| `darkgray`      | `#33362f`                | Body text                          |
| `dark`          | `#1a1d17`                | Headings and strong emphasis       |
| `secondary`     | `#4f5e3c`                | UI accent and decorative underline |
| `tertiary`      | `#4f5e3c`                | Body links, active states          |
| `highlight`     | `rgba(79, 94, 60, 0.12)` | Tints and table header backgrounds |
| `textHighlight` | `#dde3d4`                | Markdown mark highlight            |

The isolated reading pass adds `--reading-surface: #eceee5` for code and quote
surfaces without repurposing the lighter border token.

### Dark Mode

| Token           | Value                       | Use                          |
| --------------- | --------------------------- | ---------------------------- |
| `light`         | `#1a1c16`                   | Page background              |
| `lightgray`     | `#2e3229`                   | Borders and faint surfaces   |
| `gray`          | `#9b9f94`                   | Metadata and secondary text  |
| `darkgray`      | `#c7ccc3`                   | Body text                    |
| `dark`          | `#f0f2ee`                   | Headings and strong emphasis |
| `secondary`     | `#a9ba8e`                   | UI accent                    |
| `tertiary`      | `#a9ba8e`                   | Body links and active states |
| `highlight`     | `rgba(169, 186, 142, 0.16)` | Tints                        |
| `textHighlight` | `#2a3123`                   | Markdown mark highlight      |

The dark reading surface is `#292d24`.

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

| Element          | Current Style                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.article-title` | Fraunces `clamp(28px, 3vw, 36px)`, 700, line-height 1.2                                                                   |
| `article`        | 16px desktop/mobile, line-height 1.72, max-width 68ch, letter-spacing -0.01em, `word-break: keep-all`                     |
| `p`              | inherited 1.72 line-height, margin `0 0 1.25em`, `text-wrap: pretty`                                                      |
| `h1`             | Fraunces 1.55em desktop / 1.5em mobile, 700, line-height 1.25                                                             |
| `h2`             | Fraunces 1.47em desktop / 1.25em mobile, 600, line-height 1.28, margin-top 2.7em desktop / 2.4em mobile, no bottom border |
| `h3`             | Fraunces 1.2em desktop / 1.06em mobile, 600, line-height 1.35, margin-top 2.2em desktop / 2em mobile                      |
| `h4`             | Body font 1em, 700, line-height 1.38, margin-top 1.8em, color `darkgray`                                                  |
| `h5`             | Body font 0.93em, 700                                                                                                     |
| `h6`             | IBM Plex Mono 0.87em, 600, uppercase, letter-spacing 0.08em                                                               |
| `li`             | line-height 1.72, margin-bottom 0.35em                                                                                    |
| inline `code`    | 0.86em IBM Plex Mono, `reading-surface` background, no border                                                             |
| `pre code`       | 12.5px, line-height 1.62                                                                                                  |
| `blockquote`     | `reading-surface` background, no border, no italic                                                                        |

Article h1-h3 use the display font but remain subordinate to `.article-title`.
Article `strong` uses 600 weight plus `dark`; article `em` uses a subtle
`highlight` background instead of italic for Korean readability.

## Layout

Global UI scale:

- `$site-scale` is the single control and is `0.95` on both desktop and mobile,
  applied through root layout zoom so typography, spacing, icons, and components
  shrink together.
- `body` and viewport-fixed drawer/search surfaces use the inverse width/height
  compensation (`105.2631579%`) so the scaled UI still fills the physical
  viewport without a right-side gap.
- Desktop/tablet page maximum width and 320px sidebar grid tracks are also
  inversely compensated. Their physical geometry stays centered at the original
  positions while the content inside them remains visually scaled to 95%.

Breakpoints in `variables.scss`:

| Name       | Value                                |
| ---------- | ------------------------------------ |
| `$mobile`  | max-width 800px                      |
| `$tablet`  | min-width 800px and max-width 1200px |
| `$desktop` | min-width 1200px                     |

Content padding in `custom.scss`:

| Viewport               | `.center` horizontal padding                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| default / wide         | 48px                                                                                                             |
| max-width 1100px       | 32px                                                                                                             |
| mobile max-width 800px | `max(20px, env(safe-area-inset-left))` / `max(20px, env(safe-area-inset-right))`; center width 100%, min-width 0 |

`$sidePanelWidth` is 320px. Desktop grid has left, center, and right columns;
tablet grid has left plus center; mobile stacks sections.

- Mobile `#quartz-body` adds a symmetric 24px outer gutter before the existing
  center/sidebar safe-area padding, placing primary content about 42px from each
  physical viewport edge after 95% scaling.
- Desktop/tablet left sidebar padding is 40px on both sides, keeping PROFILE,
  Search, and Topics aligned farther from the page edge.

## Sidebar And TOC

Shared type roles:

- Display: Fraunces 600-700 for brand, page title, article h1-h3, section
  labels, and card titles.
- Body: Noto Sans KR 400-500 for paragraphs, previews, h4-h6 body-level text,
  and readable sidebar label bodies.
- Identifier / Meta: IBM Plex Mono 400-500 for tags, dates, read time, counts,
  breadcrumb, code, filename prefixes, and TOC number prefixes.

Sidebar topics:

- Desktop and tablet left sidebar replaces Explorer with
  `TagCloud({ limit: 8, showOnAllPages: true, variant: "sidebar" })`.
- Sidebar topics render the top eight topics as compact outlined tag boxes,
  ordered by descending post count with an alphabetical tie-breaker.
- Sidebar topic boxes wrap naturally without an internal scroll area. Each box
  shows the topic name and its post count.
- Topics include only tags prefixed with `topic/`, but display them without the
  prefix or hash, such as `database`.
- Sidebar topics are hidden on the all-tags Tag Index page because the main page
  already contains the full tag navigation.
- Sidebar and mobile topic clicks open the corresponding individual tag page.
- The all-tags action opens the complete leaf tag index, including non-topic
  tags while omitting grouping prefixes such as `topic` and `project`.

Explorer:

- Section label: Fraunces 18px, 600, `var(--dark)`.
- Items are split when they match `02-1-Title`: prefix uses IBM Plex Mono
  10.5px `var(--gray)`; body uses Noto Sans KR 13px `var(--darkgray)`.
- Hyphens in Explorer labels are rendered as spaces.
- Active: prefix and body both become `var(--tertiary)`, weight 500.

TOC:

- Sticky in the desktop right rail, `top: 4rem`, max-height
  `calc(100vh - 8rem)`, with internal vertical scrolling. Below the 1200px
  desktop breakpoint the existing `DesktopOnly` wrapper keeps it collapsed out
  of the layout.
- Every item uses 14px type, line-height 1.5, and 2px row gap. Only levels below
  the top heading level are indented; item text clamps at two lines.
- Only the current item uses `var(--secondary)`, weight 600, and a 2px active
  bar. Other entries remain `var(--gray)`.

Breadcrumb:

- IBM Plex Mono 11.5px `var(--gray)`; links use `var(--tertiary)`.

Search:

- The desktop/tablet sidebar trigger is a full-width `Search ⌘K` mono text row
  with only a lightgray bottom border. Mobile shows the same search row inside
  the slide-out drawer.
- Full-screen search uses an opaque `var(--light)` overlay so page content does
  not show through behind the modal.
- The search input placeholder and compact result list use IBM Plex Mono to
  match the `Search ⌘K` trigger. Result titles are 0.82rem/500 and one-line muted
  snippets are 0.74rem; no article preview pane is shown. Tag chips appear only
  for tag-search result context.
- Search highlights are suppressed for one-character terms to keep broad
  queries visually calm.
- Search results do not receive an automatic selected-row background; keyboard
  navigation applies focus only after the user moves through results.
- English search uses full-token matching so internal substrings such as `ss`
  in `cross` can be found.

Post metadata:

- `.content-meta`: IBM Plex Mono 0.82rem, line-height 1.35, muted
  `color-mix(in oklab, var(--gray) 82%, var(--light))`, margin-bottom 0.65rem.
- Content-page tags sit close to the date/read-time line: 0.78rem IBM Plex
  Mono, tertiary text on highlight background, radius 5px, margin-bottom 1.8rem.

## Home Page

Current `defaultContentPageLayout.beforeBody` renders on every content page, but
the custom home components return `null` unless `fileData.slug === "index"`:

1. `MobileOnly(TagCloud({ limit: 8, variant: "sidebar" }))`
2. `RecentNotesWithPreview({ limit: 20, showTags: true, showReadTime: true })`
3. Breadcrumbs, ArticleTitle, ContentMeta, TagList for non-index pages

Desktop and tablet layouts show Topics in the left sidebar where Explorer used
to be. Mobile keeps the index Topics above recent posts because the left sidebar
collapses into the top bar.

`Hero.tsx` exists but is not currently mounted in `quartz.layout.ts`. If adding
the hero, preserve its `fileData.slug === "index"` guard and place it before
`TagCloud`.

`content/index.md` contains only the short systems intro, set in 14px IBM Plex
Mono on desktop and tag-scale 12px on mobile. PROFILE owns the contact links.
Home listing content is otherwise component-driven.

Profile card:

- `.profile-name` is the dark identity anchor below a small mono PROFILE label.
- `.profile-interest` uses IBM Plex Mono for the two-line systems focus.
- Vertical spacing is staged rather than uniform: 4px from PROFILE to name, 4px
  from name to interest, and 30px from interest to the link group.
- `.profile-links` lists GitHub, e-mail, and LinkedIn as restrained mono rows.
  GitHub displays `github.com/jaeunda`; LinkedIn displays `Daeun Jang` without
  exposing its URL as text.
- The profile card has no bottom divider before Topics.

### Section Header

- `.section-header`: flex, baseline aligned, `margin-bottom: 14px`.
- `.section-title`: Fraunces 16px, 600, `var(--dark)`.
- `.section-title-count`: IBM Plex Mono 11px, `var(--gray)`.
- `.section-action`: IBM Plex Mono 12px, `var(--gray)` with tertiary hover.

### Top Tags

- `.top-tags`: `margin-bottom: 44px`; mobile 40px.
- `.top-tag`: inline-flex, gap 6px, padding 5px 10px, 12px IBM Plex Mono,
  `var(--tertiary)` on `var(--highlight)`, 1px `lightgray` border, radius 5px.
- Mobile home Topics use the same compact outlined sidebar chips as desktop:
  11.5px type and 5px 9px padding.
- Count: 10.5px, `var(--gray)`, `var(--light)` background, radius 3px.
- Active: `var(--tertiary)` background and border, `var(--light)` text; dark
  theme overrides active text to `var(--dark)`.
- Sidebar `.sidebar-topics .top-tag` is a compact mono outlined box with a
  transparent background, topic name, and post count.

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

### Pinned Post Cards

- Pinned title: Fraunces 15px desktop / 17px mobile; preview: 12.5px desktop /
  13px mobile.
- Desktop cards retain their individual outlined boxes, while the extra
  horizontal divider between card rows is omitted.
- The desktop two-column grid uses a compact 20px gap both horizontally and
  vertically.
- Mobile Pinned cards also omit per-card horizontal dividers.

### Tag Filter Interaction

Home Topics are navigation links to their individual tag pages. In-place tag
filtering remains scoped to the all-tags index.

## List Pages

`.page-listing`:

- Intro paragraph: 13px, `var(--gray)`, margin-bottom 28px.
- `li.section-li`: padding 14px 0, bottom border.
- `.section`: columns `fit-content(8em) 2fr 1.5fr`.
- `.meta`: 12px IBM Plex Mono, `var(--gray)`.
- `.desc h3`: 15px, weight 500, body font, line-height 1.35.
- Tag links: 12px IBM Plex Mono, highlight background, tertiary text,
  lightgray border, radius 4px, padding 2px 9px.

Archive index:

- The all-tags/archive page title is `Archive`, emphasizing that the page is
  primarily the Recent archive destination.
- The page title includes the concrete post count as a small
  `.article-title-count`.
- The archive result area renders all posts by default with the exact same
  `.post-card`, `.post-date-col`, `.post-title`, `.post-preview`,
  `.post-meta-row`, `.post-tag`, and `.post-readtime` structure used by home
  Recent.
- The all-tags page title includes a small bordered `←` back affordance linking
  to home.
- The all-tags page shows Topic and Project tabs before the compact
  `.tag-index-filter` chip list; when no chip is selected, the archive result
  area shows All Posts.
- Tag index chips are scoped by the active tab rather than repeating `topic` or
  `project` labels in the chip area; chip labels omit the prefix while retaining
  full tag links and filter values. Tags are ordered by descending post count,
  then alphabetically.
- Tag section headings are distinct from chip styling: prefix/count use small
  code/meta text, and the tag label uses the display font.
- Tag index chips filter the result area in place while preserving
  modifier-click navigation to individual tag pages. Selecting a chip hides All
  Posts and shows only that tag's post list; clearing the chip restores All
  Posts.
- The selected tag is mirrored in the URL as `?tag=...`; the selected default
  tab can be mirrored as `?group=project`.
- Tag index post lists reuse the same Recent post-card structure and styling
  without smaller overrides, including tags and read-time metadata.
- Individual tag pages use that same Archive/Recent post-card structure,
  including previews, tags, read time, and the bordered back affordance; their
  back action returns to Archive. The redundant `Posts` section heading is
  omitted.
- Individual tag titles mirror Archive tag headings: an 11px mono prefix, a
  1.15rem Fraunces label, and an 11px mono count instead of the large `Tag:` h1.

## Mobile Drawer And Padding

Existing mobile behavior:

- `.sidebar.right` hidden on mobile.
- Body `overflow-x: hidden`.
- Reader Mode is not mounted in either content or list layouts, so its control
  and client resources are absent on all viewports.
- The mobile Explorer hamburger opens a full-width slide-out drawer with a
  bordered back/close button at the top.
- Search and dark/light controls share one row 24px below the close button, with
  the theme control aligned at the right edge. The theme control hides while the
  full-screen search overlay is active so it cannot overlap the search field.
- The profile card follows the controls; the Explorer post tree is hidden in
  the mobile drawer.
- `.explorer-content` is fixed, top-left, `width: 100vw`.
- `html.mobile-no-scroll` translates non-left-sidebar body content by
  `translateX(100dvw)`.

Keep the `.center` mobile padding floor at 20px with safe-area inset protection
and `article { max-width: 100%; }`.

## Tables And Code

Tables:

- Article `.table-container` stays within the article width, removes Quartz's
  default table margin, and only scrolls when content truly cannot wrap.
- Full width, collapsed borders, `font-size: 0.92em`, margin-bottom 1.5em.
- `th`: highlight background, 600, padding 9px 14px, bottom border 2px.
- `td`: padding 8px 14px, bottom border 1px, tabular nums.
- Inline code in table cells may wrap so URL-like values fit inside the page
  before horizontal scrolling is needed.
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
- Added a muted profile interest keyword line using `var(--gray)` so identity
  metadata stays present without competing with the name and school line.
- Tuned post pages toward an Obsidian-like note rhythm: tighter 1.72 article
  line-height, no h2 divider, muted date/read-time metadata, and tags grouped
  closer to the metadata line.
- Simplified search into an opaque full-screen overlay with compact title and
  one-line snippet results, removing the default article preview pane.
- Suppressed one-character search highlights so broad queries do not flood the
  compact result list with accent marks.
- Removed automatic first-result focus styling and switched search indexing to
  full-token matching for clearer substring search behavior.
- Kept article tables inside the article width by removing default table
  container margins/min-widths and allowing inline table code to wrap before
  horizontal scrolling is needed.

### 2026-05-29

- Replaced the left sidebar Explorer placement with sidebar Topics, preserving
  home tag filtering on index while letting non-index sidebar topics navigate to
  tag pages.
- Limited Topics to `topic/` tags, stripped that prefix from chip labels, kept
  `all tags` as the full tag index, and made sidebar Topics scroll within the
  available sidebar height.
- Reduced sidebar Topics from a full-height flex filler to a natural-height list
  with a capped internal scroll area for better visual consistency.
- Removed grouping-only prefix entries such as `topic` and `project` from the
  all-tags index, leaving their concrete child tags visible.
- Added a top chip filter to the all-tags index so selecting a tag shows only
  that tag's post section while keeping direct tag-page links available.
- Grouped all-tags filter chips by tag prefix, removed the redundant total-tags
  line, and moved per-tag item counts into the section headings.
- Sorted tag index chips and sections by descending post count, with alphabetical
  fallback for ties.
- Increased Tag Index prefix labels to align with chip text scale and improve
  scanability.
- Combined the all-tags page title and count, added Topic/Project tabs for the
  default Tag Index state, and switched Tag Index sections to compact
  preview-only post lists without per-post tag chips.
- Removed repeated `topic` / `project` group labels from the Tag Index chip area
  because the active tabs already provide that grouping context.
- Render inactive Tag Index chip groups and sections with `hidden` by default so
  tab scoping works before client-side navigation scripts run.
- Restored Tag Index section labels to the display font while keeping post
  titles compact, display-font based, lower weight/color, and free of the
  default internal-link highlight background.
- Kept Tag Index chip groups tab-scoped even when a chip is selected, so
  selecting a Topic chip does not reveal Project chips.
- Disabled Quartz hover popovers site-wide because note previews made link
  hover behavior feel visually noisy.
- Added a small back arrow above the Tag Index title so users can return home
  after entering the full tag index.
- Restored sidebar Topics to hashtag-style topic chips and hid the sidebar
  Topics component on the Tag Index page to avoid duplicated tag navigation.
- Aligned Tag Index post rows with the Recent post layout language while keeping
  them more compact and metadata-light for index scanning.
- Increased Tag Index post title contrast and tightened row spacing after the
  first Recent-like pass felt too airy for an index page.
- Switched Tag Index post rows onto the same `.post-card`, `.post-date-col`,
  `.post-title`, and `.post-preview` structure as Recent, then scaled the Tag
  Index variant down.
- Softened the Tag Index post title color and weight so the list keeps the
  Recent structure without competing with tag section headings.
- Applied mono typography only to the profile interest line, preserving the name
  styling and preventing accidental wraps inside each profile-interest line.
- Tuned profile-card vertical rhythm: avatar-to-name, name-to-interest, and
  interest-to-social spacing are explicit instead of relying on one uniform gap.
- Increased the profile interest-to-social spacing so the icons read as actions
  rather than a continuation of the interest text.
- Expanded the profile interest-to-social spacing to 21px after the 14px version
  still felt too close to the intro line.
- Renamed the all-tags/archive destination from `Posts & Tags` to `Archive` and
  changed the title count from tag count to post count because the page is the
  archive target from Recent.
- Restored Topic/Project tag tabs as the archive filter control: All Posts shows
  when no chip is selected, and a selected tag replaces it with that tag's post
  list.

### 2026-08-08

- Removed duplicate GitHub/e-mail details from the home intro and made PROFILE
  the single contact surface, with explicit GitHub text and a LinkedIn row that
  hides the raw URL.
- Changed sidebar Topics into one full-width row per topic, kept count-first
  ordering, and restored direct tag-page navigation now that the home listing no
  longer provides the old Recent tag-filter target.
- Restored sidebar Topics as eight count-sorted outlined tag boxes without an
  internal scrollbar or filled background.
- Removed the school/department line and applied its 15px IBM Plex Mono style to
  the remaining home introduction.
- Set the revised home introduction to 14px so it sits between Pinned titles and
  previews, and removed the extra horizontal dividers between Pinned cards.
- Matched the supplied spacing reference by staging PROFILE group gaps at
  14/16/40px and tightening the desktop Pinned card grid to 20px in both axes.
- Restyled the sidebar Search trigger as an underlined `Search ⌘K` mono row,
  kept the mobile icon trigger, and removed the PROFILE-to-Topics divider.
- Removed Reader Mode from both page layouts so the book control and its client
  behavior are no longer shipped by the site.
- Restored the mobile Explorer drawer with search, theme toggle, profile, and
  navigation; reduced the mobile intro to 12px; removed hashes from Topics; and
  routed topic clicks to the equivalent Archive filter state.

### 2026-08-11

- Unified individual tag listings with the Archive post-card layout and
  restored direct tag-page navigation from Topics and post tag links.
- Matched mobile home Topics to the desktop outlined-chip treatment.
- Added an explicit mobile drawer close affordance, aligned the theme toggle to
  the right of Search, and removed the post tree below the drawer profile.
- Let the mobile center grid item shrink to the viewport so home topic chips and
  intro text wrap instead of being clipped at the right edge.
- Replaced the large individual `Tag:` title and redundant `Posts` heading with
  the smaller Archive tag-heading hierarchy.
- Matched the search input and result typography to the mono `Search ⌘K`
  trigger, increased drawer control spacing, and hid the drawer theme control
  while the full-screen search overlay is active.

### 2026-08-12

- Added a single 95% global UI scale for desktop and mobile, with inverse
  viewport compensation for the page, mobile drawer, and search overlay so
  fixed surfaces still cover the full screen.
- Preserved the pre-scale desktop/tablet page width and sidebar track geometry
  to remove the apparent left shift of the main content column.
- Increased the mobile outer gutter to 24px and the web left-sidebar padding to
  40px, aligning drawer controls to the same mobile edge token.
- Added an isolated, one-switch readability pass: 17px/68ch long-form rhythm,
  quieter link/code/quote treatments, and a single-active-item 14px desktop TOC.
- Restored the base light/dark page and body colors, and let the mobile home
  intro fill its content track so wide-mobile screens no longer leave a large
  right-side void.
- Reduced long-form body text from 17px to 16px and corrected Quartz's fixed
  paragraph line-height override, using 1.72 lines with 1.25em paragraph gaps
  for a more even Korean reading rhythm.

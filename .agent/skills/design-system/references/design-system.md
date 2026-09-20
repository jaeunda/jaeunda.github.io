# jaeunda.log Design System Reference

This reference mirrors the current repository state. If code and this file
disagree, code wins; update this file in the same patch.

## Quick Reference

| File                              | Role                                           |
| --------------------------------- | ---------------------------------------------- |
| `quartz.config.ts`                | Color tokens, font families, site settings     |
| `quartz.layout.ts`                | Component placement for content and list pages |
| `quartz/styles/custom.scss`       | Project-specific visual system                 |
| `quartz/styles/variables.scss`    | Breakpoints, grid constants, font weights      |
| `quartz/components/HomeStack.tsx` | The whole home page: featured, layers, index   |
| `quartz/components/PostRow.tsx`   | The one post row, used by every listing        |
| `quartz/components/postMeta.ts`   | Layers, date and length contract               |
| `quartz/components/SiteNav.tsx`   | The site's one navigation bar                  |
| `content/index.md`                | The home masthead copy                         |

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
| `light`         | `#fcfcfa`                | Page background                    |
| `lightgray`     | `#e4e5de`                | Borders and faint surfaces         |
| `gray`          | `#5c6057`                | Metadata and secondary text        |
| `darkgray`      | `#2f322c`                | Body text                          |
| `dark`          | `#14170f`                | Headings and strong emphasis       |
| `secondary`     | `#4f5e3c`                | UI accent and decorative underline |
| `tertiary`      | `#4f5e3c`                | Body links, active states          |
| `highlight`     | `rgba(79, 94, 60, 0.10)` | Tints and table header backgrounds |
| `textHighlight` | `#dde3d4`                | Markdown mark highlight            |

Two tokens live outside `quartz.config.ts`, which only carries the nine named
colours: `--surface` / `--surface-line` in `styles/fonts.scss` (`#ffffff` /
`#eceee6` light, `#1c1f16` / `#2f3427` dark) for lifted blocks, and
`--reading-surface` (`#f2f3ed` light, `#22261c` dark) for code and quote
surfaces. Grounds sit close to white so headings can carry near-black; every
text pair clears 6:1 on both the ground and the lifted surface.

### No Dark Mode

The site is light only, and the removal is complete — not merely unused.

- No toggle, and no `Darkmode` component: `Darkmode.tsx`,
  `scripts/darkmode.inline.ts` and `styles/darkmode.scss` are deleted and the
  export is gone from `components/index.ts`.
- No `prefers-color-scheme` block anywhere.
- `quartz/util/theme.ts` does **not** emit the upstream
  `:root[saved-theme="dark"]` palette block. `QuartzConfig` still requires the
  `darkMode` key, so `quartz.config.ts` mirrors `lightMode` into it and nothing
  reads it.
- `syntax.scss` carries only the light shiki rules, and
  `SyntaxHighlighting` is configured with `github-light` for **both** themes, so
  a second token set is not shipped on every span.
- `fonts.scss` declares `color-scheme: light`.

The emitted CSS contains zero occurrences of `prefers-color-scheme`,
`saved-theme` or `shiki-dark`. Do not reintroduce any of it.

### Color Rules

- Body text: `var(--darkgray)`
- Headings: `var(--dark)`
- Metadata: `var(--gray)`, never `var(--lightgray)`
- Links: `var(--tertiary)`
- Borders: `var(--lightgray)`
- Active selection: `var(--tertiary)` background with `var(--light)` text,
  except dark-mode `.top-tag.active`, which uses `var(--dark)` text.

## Typography

Every face is self-hosted from `quartz/static/fonts/` and declared once in
`quartz/styles/fonts.scss`. `quartz.config.ts` therefore sets
`fontOrigin: "local"`; the site makes no request to fonts.googleapis.com.

| Token                     | Font          | Use                                         |
| ------------------------- | ------------- | ------------------------------------------- |
| `header` / `--headerFont` | Pretendard    | Article headings, section labels            |
| `body` / `--bodyFont`     | Pretendard    | Body, h4-h6, navigation body text           |
| `code` / `--codeFont`     | IBM Plex Mono | Code, tags, dates, counters, identifiers    |
| `--displayFont`           | Space Grotesk | Latin-only display: post and article titles |
| `--wordmarkFont`          | Fraunces      | `.page-title` only — the identity mark      |

`--displayFont` is defined in `fonts.scss`, not `quartz.config.ts`, because
`joinStyles` in `quartz/util/theme.ts` appends its own `:root` block after every
stylesheet; `fonts.scss` uses `html:root` so its overrides outrank it.

Fraunces sets the wordmark and nothing else. It is the site's identity mark, and
it is subset to basic latin because it only ever sets "jaeunda.log". It was
briefly dropped when the type system moved to Pretendard; that was a mistake —
the mark is the identity and does not follow the body face.

Space Grotesk carries no Hangul, so apply it only where the text is always
Latin — post titles, article titles. Anything that can hold Korean stays on
Pretendard so a single line never mixes two faces. `--codeFont` and
`--wordmarkFont` fall back to Pretendard for the same reason.

The Pretendard file is a subset covering the characters in `content/` plus the
UI copy; see `scripts/fonts/README.md` before adding Korean that might use new
syllables.

### Article Scale

| Element          | Current Style                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.article-title` | Space Grotesk `clamp(30px, 3.4vw, 40px)`, 600, line-height 1.12, tracking -0.032em, `text-wrap: balance`                                                                          |
| `article`        | 17px desktop / 16.5px mobile, line-height 1.85, box max-width 900px with a 68ch measure on direct children, letter-spacing 0, `word-break: keep-all`, `overflow-wrap: break-word` |
| `p`              | inherited 1.85 line-height, margin `0 0 1.65em`, `text-wrap: pretty`                                                                                                              |
| `h1`             | Pretendard 1.62em desktop / 1.5em mobile, 650, line-height 1.25                                                                                                                   |
| `h2`             | Pretendard 1.4em desktop / 1.25em mobile, 650, line-height 1.28, margin-top 2.7em desktop / 2.4em mobile, no bottom border                                                        |
| `h3`             | Pretendard 1.2em desktop / 1.06em mobile, 600, line-height 1.35, margin-top 2.2em desktop / 2em mobile                                                                            |
| `h4`             | Body font 1em, 620, line-height 1.38, margin-top 1.8em, color `darkgray`                                                                                                          |
| `h5`             | Body font 0.93em, 620                                                                                                                                                             |
| `h6`             | IBM Plex Mono 0.87em, 600, uppercase, letter-spacing 0.08em                                                                                                                       |
| `li`             | inherits the body's 1.85, margin-bottom 0.45em, nested items at 1em                                                                                                               |
| inline `code`    | 0.9em IBM Plex Mono, `reading-surface` background, no border                                                                                                                      |
| `pre code`       | 13.5px, line-height 1.72, `tab-size: 4`                                                                                                                                           |
| `blockquote`     | `reading-surface` background, 2px `secondary` left edge, no italic                                                                                                                |
| `img`            | block, `margin: 1.6em auto`; `p > img + em` is the caption, 0.82em `--gray`, centred                                                                                              |

Article h1-h3 use the header font (Pretendard) at `letter-spacing: -0.02em`
with `text-wrap: balance`, and remain subordinate to `.article-title`.

**Heading weight is 650, not 700 — and never 700 again.** Pretendard is a
variable face, so 650 and 620 are real weights here. Hangul is a run of
full-width squares with none of the ascender/descender rhythm that breaks up a
Latin word, so the same numeric weight prints visibly more ink in Korean: on a
page whose body is 400, a 700 heading was the only thing the eye could settle
on. The global `h1`–`h6` rule is 650, and `h4`/`h5` — which are set at body size,
where 700 Hangul reads as a solid bar — are 620.

**Size carries the h1/h2 step, not weight.** They were 1.55em/700 against
1.47em/600: a 1.3px difference in size paid for with a whole weight step, so a
chapter was not bigger than the section beneath it, only blacker. They are
1.62em and 1.4em now, both at 650.

**Heading margins step down**: h1/h2 `2.7em 0 0.62em`, h3 `2em 0 0.55em`,
h4-h6 `1.7em 0 0.45em`. They are in the heading's own em, so a bigger heading
already gets a bigger gap; one shared `2.5em` put a chapter 62px from the text
above and a section inside it 51px, which is not a difference a reader can see.

**Why these numbers, for Korean set in Pretendard:**

- **Measure** — 68ch is ~632px at 17px, about 37 Hangul syllables to the line,
  the top of the 30–40 band Korean sets comfortably in. Only prose takes it;
  `table`, `pre`, `figure` and `blockquote` opt back out to the full 900px box.
- **Leading 1.85** — Hangul is a run of full-width squares with none of the
  ascender/descender rhythm that lets Latin breathe at 1.6, so it wants more.
- **Tracking 0** — Pretendard already spaces Hangul correctly. The -0.01em this
  file started with crowded it; the -0.003em that replaced it was 0.05px, a
  number that did nothing but look like a decision.
- **Paragraph gap 1.65em** — 28px against 31px of leading. At 1.4em it was 24px,
  under one line, and paragraphs ran together.
- **Lists inherit 1.85** — they ran at 1.72 while the prose around them ran at
  1.85, so a bulleted passage was visibly tighter than the paragraph it belonged
  to. Nested items are 1em: the indent already says what they are.

The article box is 900px wide but its direct children are capped at a 68ch
measure, so prose keeps its reading width while `table`, `pre`, `figure` and
`blockquote` opt back out to the full box. A four-column table squeezed into
68ch was wrapping one word per line.

The post header shares the index vocabulary: Latin display face for the title,
mono for the metadata line, and tags as outline chips rather than filled pills.
It carries **one borrowed mark** — a `26px × 2px` accent rule above the
breadcrumb, which is the gesture the portfolio opens a section with
(`.pf-sec-k`). That rule is the whole of a reading page's mood alignment: no
cards and no shadows in the body. It is drawn as a `linear-gradient` on a
full-basis flex item, because `breadcrumbs.scss` makes that container a wrapping
flex row and a `max-width` would cap the _used_ width, leaving the rule beside
`Home` instead of above the trail.

`ReadNext` closes every post with up to three related posts — same `layer` first
in editorial rank, then shared `topic/` tags. Before it, a finished post ended
in an empty `.page-footer` with nowhere to go. **It is the site's second
resting card**: `--surface`, `1px --lightgray`, `12px` radius, `--shadow`, and
**no lift**, because unlike the featured card it is not itself a link — the rows
inside it are, and they carry the tint they carry everywhere else. The home page
opens with a card and the post closes with one; that symmetry is the point.
Article `strong` uses 600 weight plus `dark`. Article `em` is **italic with
`dark` colour and no background**: the green box it used to carry filled any
post that emphasises a term every other paragraph, and it left `mark` — the one
element that is meant to look highlighted — indistinguishable from emphasis.

## Mood And Elevation

The blog and `content/portfolio-it.md` are the same author, and for a long time
only one of them moved. The gap was never type or colour — it was that the
portfolio has three planes (page / card / recess), a two-layer ambient shadow
and a 180ms lift, and the blog had one plane and colour-only hovers.

**The tokens live in `fonts.scss` and are the portfolio's values verbatim:**

| Token            | Value                                                           | Use                              |
| ---------------- | --------------------------------------------------------------- | -------------------------------- |
| `--surface`      | `#ffffff`                                                       | Card and chip ground             |
| `--surface-line` | `#eceee6`                                                       | Hairlines _inside_ a card, chips |
| `--lightgray`    | `#e4e5de`                                                       | Card borders, page dividers      |
| `--shadow`       | `0 1px 2px rgb(0 0 0 / 4%), 0 8px 24px -12px rgb(0 0 0 / 10%)`  | Resting card                     |
| `--shadow-lift`  | `0 1px 2px rgb(0 0 0 / 5%), 0 18px 40px -18px rgb(0 0 0 / 16%)` | Hover                            |
| `--lift-ease`    | `cubic-bezier(0.16, 0.84, 0.44, 1)`                             | Anything that travels            |

The fill is not what lifts a card: `--surface` on `--light` is a 0.6% delta.
**The shadow carries it.** Do not darken the page ground to compensate.

**One radius family, four steps**, so a reader can tell what kind of thing
something is by its corner alone:

| Radius  | What                                                   |
| ------- | ------------------------------------------------------ |
| `14px`  | The featured card                                      |
| `12px`  | `ReadNext`                                             |
| `10px`  | Controls you pick from a row — layer tabs, topic chips |
| `6px`   | Inline labels — tag chips, the post-row hover plate    |
| `999px` | The byline pills, and nothing else                     |

**Everything that is not the writing sits one step down.** `--dark` is the
writing and the controls that lead to it; `--gray` is everything that is there
for the one visitor in fifty who wants it. That is why the byline pills, the
footer links and a post's tag chips are all `--gray` on softened borders: at
`--darkgray` the three addresses under the masthead were the second-loudest
thing on the first screen. `--gray` is 6.26:1 on the page ground, so a step down
never costs legibility — it is a hierarchy decision, not a contrast one.

**The layer names are the exception that proves it.** They are the home page's
primary control and were set like captions — 15px/500 `--darkgray`, a step
_below_ the row descriptions underneath them. They take the display face at
15.5px/600 on `--dark` now, the same vocabulary as the post titles, because the
five of them are what the page is asking you to choose from.

**A resting edge is carried by light, not by a line.** Layer tabs and topic
chips take `1px` of `--surface-line` at **55%** plus a `0 1px 2px rgb(0 0 0/3%)`
contact shadow. At full strength the strip drew five hard rectangles across the
first screen and became the most ruled thing on a page whose whole vocabulary is
hairlines. The edge is allowed to be definite in exactly two states — hover and
open — because those are the two moments the reader is asking which box is
which.

**Two resting cards on the whole site**, and they bookend the reading:

- the home page's **featured post** — a link, so it lifts;
- **`ReadNext`** at the foot of every post — not a link, so it does not.

Everything between them is flat. Rows, article body, code blocks, tables and
callouts keep their recessed plates and their hairlines. A page that opens with
one card and closes with one card and is flat in between reads as designed; a
page of cards reads as a deck.

**The motion budget**, and it is the whole of it:

|                    | Value                                               |
| ------------------ | --------------------------------------------------- |
| Hover, colour only | 150ms `ease`                                        |
| Hover, travelling  | 150–180ms `ease-out`                                |
| Entrance           | 500ms `--lift-ease`, 10px, opacity 0→1, never scale |
| Block stagger      | 70ms                                                |
| Row stagger        | 24ms, **capped at 5 rows**                          |
| Travel             | cards −3px · tabs −2px · pills −1px · arrows +3px X |

Rules that hold everywhere:

- Every entrance and reveal is inside
  `@media (prefers-reduced-motion: no-preference)`; the `reduce` branch keeps
  colour and border changes and drops `transform`.
- **No animation may be the only thing making content visible.** An entrance is
  opted into by a class the script adds, never held at `opacity: 0` by a
  `backwards` fill on server-rendered markup.
- Every hover state has a `:focus-visible` or `:focus-within` twin. Cards,
  chips and tabs take `outline: 2px solid var(--tertiary)` at
  `outline-offset: 3px`.
- **A control that is switched on sits flat.** The open layer tab and the
  current topic chip take the accent tint and border with no shadow and no
  transform — the pressed thing must not be the thing floating highest.
- **Nothing in an article body moves, ever**, and there are no scroll-linked
  reveals on a reading page. On a 34,000px post that leaves body copy
  permanently mid-animation.

## Layout

Global UI scale:

- `$site-scale` is the single control and is **`1` since 2026-09-20**. It was
  `0.95`, applied through root layout zoom, which meant every size declared
  anywhere in the repository rendered 5% smaller than it reads in the source:
  the home index shipped its 15px title at 14.25px and its metadata at 9.5px,
  and no one reading `custom.scss` could see it. **Sizes in this document and in
  the stylesheets are now the sizes that reach the screen.** Do not reintroduce
  a global zoom; change the sizes.
- The inverse-compensation tokens (`--site-viewport-width`,
  `--site-viewport-height`, `$site-page-max-width`, `$site-side-panel-width`)
  still derive from `$site-scale` and resolve to `100vw` / `100dvh` / the plain
  values at scale 1. They stay so the scale remains one reversible control.

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

Shared type roles (families are declared in `quartz/styles/fonts.scss` and all
four faces are self-hosted — nothing loads from a CDN):

- `--displayFont` Space Grotesk: post titles, list-page titles, post-row titles,
  the featured title, the home masthead h1.
- `--wordmarkFont` Fraunces: the `jaeunda.log` wordmark, and nothing else.
- `--bodyFont` / `--headerFont` Pretendard: paragraphs, descriptions, layer tab
  labels. Pretendard carries Korean and Latin together, so a heading never mixes
  two faces mid-line.
- `--codeFont` IBM Plex Mono: dates, lengths, counts, tags, eyebrows, the
  breadcrumb, code and TOC number prefixes.

The left rail:

- On a reading page at `$desktop` the left rail is the **table of contents and
  nothing else**. Below `$desktop` it is empty and removed from the flow, and
  `CompactToc` carries the outline into the column instead.
- The home page and the list pages have **no rail at all** — `left: []`,
  `right: []`. Identity lives in the masthead and the footer, and navigation
  lives in `SiteNav` at the top of the column.
- There is no sidebar tag cloud, no Explorer and no profile card in a rail.
  `Hero`, `TagCloud`, `RecentNotesWithPreview` and `PinnedPosts` were the
  previous home page and have been deleted from the repo.

Explorer is **not mounted**. It remains in `quartz/components` as part of the
upstream Quartz surface, and `explorer.scss` still ships, but no layout places
it and `content/` is flat, so it has nothing to render. Do not style against it.

Outline (the table of contents):

- Sticky in the desktop **left** rail, `top: 4rem`, max-height
  `calc(100vh - 8rem)`, with internal vertical scrolling. Below the 1200px
  desktop breakpoint the `DesktopOnly` wrapper keeps it out of the layout and
  `CompactToc` carries the same list into the column.
- The header is a rail label, not a heading: mono, 11px, uppercase, `--gray`,
  over a hairline. `.toc-header h3` used to be in the 18px `.section-label`
  group, where it competed with the post title in the column beside it. Its i18n
  string is `Outline`, not `Table of Contents`.
- Every item uses 14px type, line-height 1.5, and 2px row gap. Only levels below
  the top heading level are indented; item text clamps at two lines.
- Only the current item uses `var(--secondary)`, weight 600, and a 2px active
  bar. Other entries remain `var(--gray)`.

Breadcrumb:

- IBM Plex Mono 11.5px `var(--gray)`; links use `var(--tertiary)`.
- Shown on **every** page except the home page: posts get the trail from the
  content trie, tag pages get it from their slug (see **List Pages**). It is the
  only upward-navigation device on the site.

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

- `.content-meta`: IBM Plex Mono 12.5px, line-height 1.4, `var(--gray)`,
  margin-bottom 0.7rem, tabular numerals. `custom.scss` overrides
  `contentMeta.scss`'s `color-mix(in oklab, var(--gray) 82%, var(--light))`,
  which diluted the only metadata line on a post to roughly 5:1.
- Both layouts pass `ContentMeta({ showComma: false })` and `custom.scss`
  supplies ` ·` instead. The comma separator printed `Apr 19, 2026, 10 min read`
  — a second comma inside a date — and the middot is what the home index and the
  archive already separate metadata with.
- Content-page tags sit close to the date/read-time line: 11.5px IBM Plex Mono,
  `darkgray` leaf on a transparent ground with a lightgray border, radius 3px,
  margin-bottom 2.2rem.

Footer:

- Links first, colophon second. The last thing every page said used to be
  `Created with Quartz v4.5.2`, above the links — the site signed off with its
  build tool.
- `footer.scss` dims the whole element to `opacity: 0.7`, which took `--gray`
  from 6.26:1 to roughly 4.4:1 and put the only sitewide links below the
  contrast floor. `custom.scss` restores `opacity: 1` and lets colour carry the
  hierarchy: links are `--darkgray`, the `.footer-colophon` line is 11.5px mono
  on `--gray`. `footer.scss` also pulls the list up by `-1rem` to tuck it under
  the colophon that used to come first; that is reset to `0`.

## Site Shell

A narrow left rail carrying the profile, a horizontal bar at the top of the
content column, and the content. The rail holds identity and nothing else, so it
never competes with the post list.

- `SiteNav` renders the bar: wordmark plus two destinations (`Posts`,
  `Topics`), with `Search` beside it in `sharedPageComponents.header`.
  **`Portfolio` is not one of them, and it is not anywhere else either.** See
  **Portfolio Coverage**.
- **There is one rail on the whole site and it is the outline.** `left` is
  `[DesktopOnly(TableOfContents())]` on reading pages and `[]` everywhere else;
  `right` is `[]` on every layout. The rail is 268px (`$site-rail-width`).
- It used to be the other way round: a 230px **right** rail held the table of
  contents — narrower than most of the headings it had to print — while the left
  rail held a profile card on every page. The reader got a bio at full width and
  the document's own structure in a gutter. **Reading pages carry no profile at
  all now.**
- Backlinks and `VisitorCount` were the rail's other tenants. They are
  end-matter, so they moved to `afterBody`, under `ReadNext`. `visitorCount.scss`
  also had `@media (max-width: 1200px) { display: none }` from its rail days,
  which would have hidden it on every phone.
- Below `$desktop` **both** sidebars are `display: none` and the below-desktop
  `grid-template-areas` names `grid-sidebar-left` and `grid-sidebar-right` as
  their own rows. A named `grid-area` with no slot in the template makes Grid
  open an implicit column: the empty rail was holding 286px — 29% of a 1000px
  viewport — blank from top to bottom, and the profile card inside it landed in
  the fourth row, ~2000px below the fold. Never leave a `grid-area` unplaced.
- At `$tablet` `.center` and `footer` are capped at 760px and centred. With the
  rails gone the column inherits the viewport, and a paragraph ran 855px at
  1000px wide — about 120 characters to the line. Phones keep full width.
- `.page` is 1320px, 1200px on reading pages at `$desktop` (268px outline +
  3rem + the column), 1240px on index and 820px on index and the tag listings
  at `$desktop`.
- **At `$desktop` the index is one centred column, `.page` 820px.** Both sidebar
  wrappers are `display: none` on index and the `grid-template-areas` names
  every row, so neither can open an implicit column. 820px less the 32px
  `#quartz-body` gutter is 788px, and `.center` drops its own 48px padding there
  — the page is already narrow, so more gutter would only shorten the measure.
  The nav, the masthead, the featured post, the chips and the index therefore
  all share one measure. The home column used to be a 264px rail plus ~950px
  spent on two columns of posts, which is what forced the index type down to
  15/12.5px.
- On index the empty `.sidebar.right` is hidden and the `.center` gutter is
  dropped at `$desktop`. `right: []` still renders the wrapper div, which
  auto-placed into an implicit grid column and stole ~64px of content width.
- `.page-header` lives **inside** `.center`, not directly under `#quartz-body`,
  so a child combinator silently fails to match it. Its top margin is set with a
  descendant selector.
- Three upstream rules have to be overridden in this section, all of them found
  by rendering rather than by reading: `Header.css` styles every `<header>` as a
  flex row, `search.scss` sets `width: 100%` on `.search`, and the mobile drawer
  rule parks `.search` at `left: -100vw`. At phone width the search button is
  reduced to its magnifier, which Quartz ships with `display: none`.
- Portfolio pages are untouched by all of this: `#quartz-body[data-unlisted]`
  resets `display`, hides `.page-header` and clears the page max-width.

### Profile Rail

`ProfileCard` carries the whole identity: name, role, the thesis the writing
serves, and the three social rows.

**It exists on the home page and nowhere else.** One copy, rendered into
`afterBody` before `HomeStack`, in the column at every width, directly under the
`content/index.md` tagline. Reading pages have an outline in their rail; the
footer's three links carry identity everywhere else.

It was previously on every page — the rail at desktop, the foot of the column
below it — so identity both changed address with the viewport and took the
widest rail on a reading page away from the document's own structure.

It is a **byline, not a bio**: `.profile-name` at 16px and `.profile-role` in
mono on one baseline row, the links wrapping onto the next, and no thesis — the
tagline directly above already says what the writing is for, in the author's own
words. A `--lightgray` hairline under it closes the masthead.

The three destinations are **pills carrying the whole address** — the
portfolio page's `.pf-caps` vocabulary, which is where this site already keeps
"a short row of equal things".

```
( github.com/jaeunda )  ( linkedin.com/in/jaeunda )  ( jaeunda@gmail.com )
```

- `padding: 7px 14px`, `min-height: 34px` (**44px at `$mobile`**), `999px`
  radius, `1px --surface-line`, `--surface` ground, mono 12.5px `--darkgray`.
  Hover takes `--tertiary`, a 45%-accent border and `translateY(-1px)`.
- **No shadow.** `.pf-caps` has none either, and a row of floating pills
  directly above the featured card would compete with the one thing on the
  page that is meant to be lifted.
- **The 999px radius is the point of difference.** The site's tag chips are
  3px; a tag is a filter and these are destinations, so they must not look
  alike.
- **The visible label is an address and the accessible name is the service**
  (`aria-label="GitHub"`), so a screen reader says "GitHub" instead of spelling
  a URL.
- **The role is tied to the name by a drawn rule**, the same 4×1px device
  `.hs-featured-layer` uses, set `display: inline-block` with
  `vertical-align: middle` — baseline plus half the x-height, which is the
  optical centre of the line it connects. An absolutely positioned bar has to
  guess that offset against a span whose box is taller than its text, and lands
  above the cap height, where it reads as a macron over the name. The role also
  rises to 12.5px on `--darkgray`: it is the second half of the byline, not a
  footnote to it. Before this it sat 12px away in a different face, a different
  size and a different colour, touching the name only by adjacency.
- At phone width they stack, and that is the intended shape:
  `linkedin.com/in/jaeunda` is 23 monospace characters and the pair only fits a
  326px column if the type drops to 11px — legibility traded for a wrap one
  font metric would undo. The row re-forms on anything wider.

**Three earlier versions of this row were wrong, each differently.** Keep all
three in mind before changing it again:

1. A label and a value per row (`github` / `github.com/jaeunda`) — six items,
   no way to tell which three were clickable.
2. One token per destination (`GitHub`, `Email`, `Daeun Jang`) — readable, but
   nothing a reader could type, and one row named a person where the others
   named places.
3. A two-column `10ch` mono table. Three rows do not earn a table: it opened a
   dead gutter across the column, `code` / `work` / `mail` was a private
   taxonomy the reader had to decode, and three stacked underlined URLs made a
   link-farm texture under the tagline — a block taller than the byline it is
   subordinate to, spending ~130px of the first screen and pushing the writing
   down. It also left ~20px tap targets, under the accessibility floor.

All of its styling is in `components/styles/profileCard.inline.scss`, which also
used to hide the whole card below 768px.

### Compact Table Of Contents

`CompactToc` is the chapter list for everything narrower than the desktop rail.
It is a native `<details>` — no script, closed by default — mounted in
`beforeBody` under the tag list and hidden at `$desktop`, where the right rail
already carries a TOC. Its count comes from `chapterCount()` in `postMeta.ts`,
not `toc.length`: the list carries sub-headings the chapter count deliberately
ignores, so `toc.length` reported 14 against the home index's 5 for the same
post. Summary is a 44px touch target, and it is labelled `Outline` — the same
word the desktop rail uses for the same list.

## Shared Post Row

**Rows do not lift.** `.post-row-link` takes `padding: 14px 12px` with a
matching `-12px` margin and a `6px` radius, so a 4%-accent hover tint reaches
past the text on both sides while the text stays on the column's own left edge;
the title recolours and a `→` fades in beside it. Twelve cards rising on a list
is noise, and the one card on the page is the pick above them.

One row design, rendered by **one function** — `quartz/components/PostRow.tsx`,
built on `quartz/components/postMeta.ts` — for the home index (`HomeStack`), the
archive and the topic panels (`TagContent`), and the suggestions at the foot of
a post (`ReadNext`). It was written out three times and two copies had drifted:
`ReadNext` rendered bordered cards with no date and no length. If a listing
needs a row, it calls `PostRow`; it does not write the markup again.

```
.post-rows > .post-row > .post-row-link
    .post-row-date          ISO date, mono, tabular
    .post-row-main
      .post-row-title       Latin display face
      .post-row-desc        the frontmatter description, clamped
      .post-row-meta        length, and nothing else
```

**The row does not print its layer.** On the home page the open Layers tab
already names it, so every row repeated it; printing it on some lists and not
others would have turned one row design into two.

Length is `N chapters · M min`, and past `LONG_READ_MINUTES` (40) the minute
figure becomes `파트별로 나눠 읽기`. Chapter count comes from `fileData.toc`: the
shallowest depth with more than one entry, so a lone banner heading (`CORS` has
one `# In Practice`) does not report the post as a single chapter.

The row is **one column everywhere**. On the home page at `$desktop` it used to
break into two 459px columns so that all twelve posts sat above the fold; that
is what forced the 15px title, the 12.5px description and the 10px metadata.
The fold is not worth a line of type nobody can read. Current sizes: 96px date
gutter, 20px gap, 14px vertical padding; date 12px mono, title 17px display,
description 14px/1.62 clamped to two lines, metadata 11.5px mono.

## Home Page

The home page is **three blocks and a masthead**, and the count is the design:

0. **Masthead** — `content/index.md`'s `h1` tagline and one line under it, then
   the `ProfileCard` byline, closed by a hairline. Not part of `HomeStack`.
1. **Featured** — one post, set as type. `quartz/components/HomeStack.tsx`.
2. **Layers** — the five layers, as a filter. One is always open.
3. **Index** — the open layer's posts, one column.

It was six blocks in six visual vocabularies on one screen: a Fraunces wordmark
bar, a large Korean opener, a mono uppercase `Pinned` label, two bordered cards
with mono ASCII art inside them, outlined counter chips, and a date-gutter list.
**Before adding a block here, remove one.**

### First-Screen Motion

See **Mood And Elevation** for the budget these numbers come from.

- **A wash behind the opening screen.** Two radial gradients of the accent at
  7% and 4% on `body[data-slug="index"]`, `no-repeat` at the top, sized
  `100% clamp(440px, 62vh, 760px)` — gone by the time the reader is in the
  index and never behind body copy at a contrast that matters. `Posts` and
  `Topics` take one weaker gradient; a post page takes none.
- **One entrance, three steps, once per document.** `home-rise` is 10px and
  500ms on `--lift-ease`: masthead and byline together, the featured card at
  70ms, the layer strip and the index at 140ms. It was five steps 70ms apart,
  so the index — the point of the page — waited 280ms to appear.
- **It is gated on `body.home-entering`, which `homeStack.inline.ts` adds on
  the first `nav` event and only the first.** Two bugs die with that class.
  The server-rendered page carries no class, so a browser that never runs the
  animation renders the page finished instead of holding it at `opacity: 0`
  behind a `backwards` fill. And Quartz keeps one document across SPA
  navigation, so without the once-per-document flag a reader coming back from
  a post watched the whole home page reassemble — the animation punished
  exactly the reader who was browsing. A `window.addCleanup` removes it on
  `prenav`; the module-scope flag outlives that.
- **Switching layers staggers the incoming rows.** `--hs-i` is written on the
  visible rows by the script and `is-swapping` is re-added after a forced
  reflow, which is what restarts a CSS animation. The stagger reads `--hs-i`
  rather than `nth-child` because `nth-child` counts the hidden rows of every
  other layer — the first row of the last layer would start 200ms late — and
  the script **caps it at 5 rows**, because an uncapped ladder ran the six-row
  Storage tab for 420ms, slower than the eye that asked for it.
- **One hover affordance per link surface**: `Read this first →` on the card,
  and a `→` that fades in on each post row. The row's title recolouring alone
  was too faint to notice from a date gutter 96px away that does not change.

### Home Masthead

The tagline lives in `content/index.md`, as the page body, and is the document's
only `h1`. That is deliberate on both counts:

- It is **copy, so it lives where the author edits copy.** An earlier pass wrote
  the opener as a Korean string inside `HomeStack.tsx` — an invented marketing
  line plus a sentence explaining how to use the filter. Do not put site voice
  in a component.
- `.center > article` is therefore **shown** on index, not hidden. The `<hr>`
  Quartz prints after it stays hidden; the byline's bottom border is the rule.

**What the masthead is allowed to claim** is whatever the author's own record
already says. It is checked against four sources, in this order: her career
workbench (`~/_workbench/_master` — the answers and project current-versions she
actually submits), `content/portfolio-it.md`, the GitHub trail, and the twelve
posts themselves. The current line —

> Systems are clearest at the point they fail.
> Linux and database internals, followed down to the mechanism — and lately to
> how the hardware executes it.

— is her portfolio's own sentence for this blog ("시스템이 실패하는 지점을
따라가며 정리합니다") plus the direction the record supports: OS, system
programming and compiler coursework, then the 2026.07–09 NPU and CUDA training
and the CXL appendix in the Virtual Memory post. It replaced
"Interested in the systems behind reliable software / …a growing focus on
runtime execution and hardware-aware performance", which opened on a hedge and
claimed a focus the writing did not yet show.

**Check the wrap by rendering before shipping a new one.** Two lines at 1280,
820 and 500; three at 375, with no orphan on the last line. The first draft of
this sub-line ended "how the hardware underneath executes it" and left
`executes it.` alone on a 120px line at 500px — one word shorter and it breaks
cleanly at every width. `text-wrap: pretty` is not a substitute for measuring.

`h1` is the Latin display face at `clamp(27px, 3.4vw, 36px)`/600 — the tagline
is always English. The sub-paragraph is the body face at 16px (15px mobile) on
`--gray`, and the article caps at 54ch. `rehype-autolink-headings` appends an
anchor to every heading, revealed on hover by `base.scss`; it is
`display: none` here, since the site's one statement should not link to itself.

### Layers

The five layers of the request path, as the home page's one filter.

- **No `All`.** It sat first and did exactly what `All posts →` beside the label
  does, so the page had two controls for "everything".
- **One layer is always open**, so a click selects rather than toggles and
  clicking the open tab leaves it open. `HomeStack` renders the opening state
  server-side — other layers' rows ship with `is-hidden` and the blurb is
  already the open layer's — so the page is correct with no script at all.
- **Ordered by the author, and by nothing else.** `LAYERS` in `postMeta.ts` is
  the display order — Kernel, Storage Engine, Transport, Orchestration,
  Application — and `layersInOrder()` only drops the empty ones. The first one
  opens. Two earlier orders both let something other than the author decide:
  the request path (Application → Transport) opened a blog about Linux and
  database internals on browsers, and `layersByWeight()` opened it on whichever
  layer had accumulated the most posts, so the front page changed subject every
  time a post was added. **Editing that array is an editorial decision**, not a
  refactor.
- **Each tab prints its number** — `01 Kernel` — because the order is a claim.
  Five equally-weighted boxes said the strip was a set; a numbered strip says it
  is a sequence, which is the thing the order is for.
- **Every tab prints its own `blurb`**, three or four English words under the
  label. It was one line under the strip that the script rewrote on each click,
  so four of the five layers never said what they covered. Nothing in the script
  writes text now.
- **Tab names take the display face**, 15.5px/600 on `--dark` — the post-title
  vocabulary, because this is the page's primary control and not a caption on a
  box. The layer ids are English by definition (`postMeta` `LAYERS`), so Space
  Grotesk is safe here; it carries no Hangul and must never sit where Korean
  can appear.
- **Tabs, not chips.** Chips are this site's tag vocabulary. Tab names were the
  body face at 15px/500 — navigation, not metadata — with a mono `01` before
  them, a mono count pushed to the tab's right edge by `margin-left: auto`, and
  a 12px `--gray` blurb.
- **Each tab is its own surface**: `--surface`, `1px --surface-line`, `10px`
  radius, hover lifting 2px onto `--shadow`. Borderless underline tabs were the
  last flat vocabulary on a screen that now opens with a card, and they read as
  unfinished.
- **The open tab is said three ways and sits flat**: an 8% accent ground, the
  accent border, the accent on the name and number, and the name at 600 — with
  `box-shadow: none` and `transform: none`, because a pressed control must not
  be the thing floating highest. It used to be an underline and a colour on a
  14px name, a 2px difference across a five-column grid.
- **The number and the count share a meta line above the name.** With
  `01 Storage Engine 6` on one line, a 132px column broke the label and left
  `Engine` stranded; the name now owns a line and the five numbers and five
  counts each align down the strip.
- **The heading is `Browse by layer`, not `Layers`.** A noun names the taxonomy
  without saying that the thing under it can be clicked.
- **No rule closes the block.** `.hs-layers` used to carry a `border-bottom`
  16px under tabs that already ended in their own border, so the strip appeared
  underlined twice and the second line belonged to nothing. The tabs are their
  own surfaces now; `.hs-index` takes an 18px top margin and no border.
- **`All 12 posts →`, with the count.** A visitor could not tell whether the
  site held twelve posts or the two under the open tab. `HomeStack` already
  knows the number, so it cannot go stale.
- **`grid-template-columns: repeat(auto-fit, minmax(156px, 1fr))`.** A sixth
  layer joins the grid without touching the stylesheet, and the same rule gives
  fewer columns at phone width instead of five squeezed ones. 44px tall, with
  the horizontal padding tightened at `$mobile`.

### Featured Post

One post — `FEATURED_LIMIT`, sourced from `pinned: true` ordered by `pinOrder`.

**It is a card, and it is one of the site's two** (see **Mood And Elevation**):
`--surface` ground, `1px --lightgray`, `14px` radius, `22px 24px 20px` padding
(`18px` at `$mobile`), resting on `--shadow`. `:hover` **and `:focus-within`**
take `translateY(-3px)`, `--shadow-lift`, and a border mixed 45% toward the
accent, over 180ms `ease-out`.

It used to be flat type closed by a `--lightgray` hairline — **the same
declaration `.post-row` carries** — so it was row zero set large, and the one
filled plane on the screen was the ASCII cover inside it, which out-weighted its
own parent. Nothing said the whole block was a single link.

**How it stays distinct from the rows below**: it is the only element on the
page with fill _and_ radius _and_ shadow, and the rows stay transparent, square
and un-lifted. They share a left edge, so the card's padding indents its title
24px past every row title; that offset is the tell that reads "one pick, then
the list".

Inside it: the eyebrow, the title at `clamp(22px, 2.7vw, 27px)` in the display
face, the `description`, the ASCII cover on the `--reading-surface` plate with
**no border of its own** — a framed plate inside a framed card is two boxes —
and a foot line over a `--surface-line` rule, which is what the lighter of the
two line tokens is for.

**The eyebrow says what the block is, then where the post files:**
`● FEATURED POST – KERNEL`. It printed the layer alone, so the one post the
author picked to open the site was labelled `KERNEL` — which is a taxonomy, and
says nothing about why that post is at the top of the page. `Featured post` is
`--tertiary` with a 5px accent dot; the layer follows it in `--gray`, separated
by a 4px rule drawn in `::before` rather than a `·` typed into the markup that
would then have to be hidden from the accessibility tree by hand. The dot and
the kicker are the one place olive is used as a marker, and this whole block is
an `<a>`, which is what olive is for.

**The foot line is the length and one affordance**: `Read this first →`, mono,
`--tertiary`, the arrow translating 3px on hover. The block was a link with a
title, a paragraph and a length in it and nothing that looked clickable.

It was two bordered cards side by side under a `Pinned` label — a module that
needed a border _and_ a label before it read as a pair, and whose 9px cover art
was decoration nobody could read.

**The featured post keeps its row in the index.** It used to be filtered out —
it is printed in full above, so its layer showed it twice on one screen — but
the tab said `Kernel 2` and the list under it had one post in it, so the layer
looked like it was missing something, which is exactly what the author reported.
A layer is the whole layer; being the pick is not a reason to be absent from it,
and the duplication is only ever visible while that one layer is open.

Frontmatter this component reads, all optional except `layer`:

| Key           | Role                                                       |
| ------------- | ---------------------------------------------------------- |
| `layer`       | Which layer the post joins; ids are in `postMeta` `LAYERS` |
| `rank`        | Editorial order inside that layer; see **Editorial Rank**  |
| `description` | The one-line hook under the title                          |
| `pinned`      | Marks a representative post for the top of the page        |
| `pinOrder`    | Order among pinned posts                                   |
| `cover`       | ASCII art for the pinned card, rendered in the code face   |

`LAYERS` is the author's order — Kernel, Storage Engine, Transport,
Orchestration, Application — and it is both the taxonomy and the display order.
See **Layers**.

Keep cover art **pure ASCII and three lines**: IBM Plex Mono ships a latin
subset, so box-drawing and arrow glyphs fall back to a proportional face and
destroy the alignment, and a taller cover pushes the index below the fold.

Filtering is the only interaction on the page, in
`scripts/homeStack.inline.ts`. Preserve `data-home-stack`, `data-layer` on both
the tabs and the rows, `aria-pressed` as the open-tab marker, the `is-hidden`
class, and — for the stagger — the `is-swapping` class on `.hs-index` and the
`--hs-i` custom property on the visible rows. `.inline.ts` files share one
global scope for type-checking, so its identifiers are `hs`-prefixed and the
import carries `// @ts-ignore`.

### Post Descriptions

`description` is the one-line hook under a title, and it is read on the home
card, every listing, `ReadNext` and the page's `<meta>`. It is prose the author
signs, so it follows the blog's plain `~다` voice, not the portfolio's `합니다`.

**One sentence, and usually a question.** The rhetorical question is the
author's device and she wants it kept; what she does not want is two beats. Each
description is a single sentence that asks the thing the post answers:

> 있는 행마다 락을 걸어도 아직 없는 행이 나타난다면, 무엇에 락을 걸어야 하는가.

The question has to carry the summary by itself, which is the whole discipline
here — a generic question (`동시성은 어떻게 제어하는가`) fits three posts and
says nothing. It works when it names the post's own paradox or its own numbers.

Rules:

- **One sentence.** No trailing noun phrase. They used to run
  `[question]. [bare noun phrase]`, and the second beat was where every one of
  them started to sound alike — `것 / 문제 / 방법 / 기준 / 해법 / 방식`.
- **Ask what that post actually answers.** Ground it in something only that post
  contains: the release point that decides serializability, the commit that is
  still only in memory, the parent node you check instead of every descendant.
- **A declarative is allowed where a question would be forced.** The RTOS post
  is a seminar write-up and says so; that provenance is worth more than a
  manufactured question.
- **Plain `~다` / `~는가`**, the blog's voice, not the portfolio's `합니다`.
- **35–55 characters.** `.post-row-desc` clamps at two lines, which is ~56
  characters at phone width, so a longer line is silently cut there.

### Editorial Rank

Every post carries `rank`, a number that orders it **inside its layer**. It is
the author's judgement about the writing, and it is deliberately not the date.

**The criteria, in order:**

1. **Depth of mechanism** — does the post follow the thing down to where it
   actually happens, or describe it from outside?
2. **Alignment with the site's direction** — Linux and database internals, and
   a growing focus on runtime execution and hardware-aware performance. The
   masthead in `content/index.md` is the statement this is measured against.
3. **Completeness** — does it close, with the failure cases and the trade-offs,
   or stop at the happy path?
4. **Date**, as the tie-break only. `byEditorialRank()` falls through to
   `byDateAndAlphabetical`, and an unranked post sorts to the end of its layer
   rather than to the top, where a missing number would otherwise put it.

**Judge the order again when a post is added.** A new post takes the rank it
earns, and the posts below it move down; appending it to the end of its layer is
not ranking it. Renumber in `content/*.md` frontmatter — it is one line per file.

Current ordering:

| Layer         | Order                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kernel        | Virtual Memory: Paging and Swap · RTOS: Deadlines and Predictability                                                                                                                  |
| Storage       | Database Locking and 2PL · Database Recovery: WAL and ARIES · Transaction Isolation in SQL · Phantom Phenomenon and Index Locking · Multiple-Granularity Locking · Database Deadlocks |
| Transport     | Linux Transport Layer Internals                                                                                                                                                       |
| Orchestration | Kubernetes Packet Flow                                                                                                                                                                |
| Application   | Saga Pattern in Microservices · CORS: Policy, Preflight, and Practice                                                                                                                 |

Storage reads as concurrency control first (2PL is the deepest piece on the
site after Virtual Memory), then durability, then the contract the engine
implements, then the two posts that extend locking, then the failure mode.

**Where rank applies:** the home index, and `ReadNext`'s same-layer
suggestions — both are a reading order. **Where it does not:** `Posts` and the
topic panels, which are an archive and stay newest-first, and `ReadNext`'s
topic matches, which cross layers, where one ranking cannot compare them.

### Chips

One chip treatment everywhere: `--surface` ground, 1px `lightgray` border, 3px
radius, mono, turning `tertiary` on hover and when active, and rising 1px on
hover. A chip that is `aria-current` sits flat, like the open layer tab.

**The profile byline's pills are not chips** and are the one intended
exception to the 3px radius: 999px, so a destination cannot be mistaken for a
filter. See **Profile Rail**.

**Chips are the tag vocabulary. The layer tabs are not chips** — see **Layers**.
A chip says "this is a tag"; a tab says "this is a section of the page".

An article's tag chips print `#database`: only one namespace is ever shown to a
reader, so printing `topic/` on every chip is a prefix that never varies.

**Chips are the tag vocabulary. The layer tabs are not chips** — see **Layers**.
A chip means "this is a tag"; a tab means "this is a section of the page".

An article's tag chips print `#database`: one namespace is ever shown, so
printing `topic/` on every chip is a prefix that never varies.

## List Pages

Two destinations in the nav, and they are different pages:

- **`Posts`** (`tags/index`) — every post, newest first, in the home page's row
  design and nothing else.
- **`Topics`** (`tags/topic`) — the same posts grouped by subject, as **one
  switcher**: a strip of subjects that scrolls sideways, a step button at each
  end, and one open panel of rows. See **Topic Switcher**.
- **`tags/topic/<name>`** — one subject.

They used to be 글 / 주제 and **both rendered a flat list of all twelve posts**,
so the second destination told a visitor nothing the first had not. `Posts` also
opened with a Topic/Project tab strip over a chip cloud over the list: three
navigation devices stacked on the one page whose whole job is "here is
everything, in order". `TagContent` no longer loads `tagIndexFilter.inline.ts`,
and that script is deleted.

### Tag Visibility

**Only `topic/` tags are ever shown to a reader.** `project/` records which body
of work a post came out of — useful to the author, noise to someone deciding
whether to read it — and it was the reason the archive needed a tab strip at
all. The `project/` pages are still emitted; nothing links to them.

`TagList` filters to `topic/` and prints `#database`; the topic index reads the
same prefix. Adding a third namespace means deciding, here, whether readers see
it.

### Topic Switcher

`Topics` is a chooser, not a scroll. A vertical stack of every group was correct
but ran nine sections deep; the switcher keeps the page on one screen.

```
Topics                                                            9
[←]  #database 6  #network 3  #linux-kernel 2  #operating-systems 2 …  [→]
     ──────────
2026-04-21   Transaction Isolation in SQL
             …
```

- **Nothing here is sized to the current number of subjects.** The strip is a
  `flex-wrap: wrap` row, so it works at nine subjects and at ninety. It used to
  be a horizontal scroller with a step button at each end, which sliced the last
  chip mid-word against a hard edge inside a column that was mostly empty below
  it, and spent a third of a 390px row on two arrows to show two of nine. Chips
  wrap the way tags wrap everywhere else on the site.
- **The chips are links** to `/tags/topic/<name>`, and
  `scripts/topicSwitcher.inline.ts` intercepts a _plain left click_ to switch
  the panel in place. With no script the first panel is open and every other
  subject is one navigation away; Cmd/Ctrl/Shift/middle-click still opens the
  subject's own page, which the chip rule in **Chips** requires.
- Because the chips wrap, Tab already walks them: there is no roving tabindex,
  no arrow-key handler and no step button. Panels are `hidden` plus an explicit
  `.topic-panel[hidden] { display: none }`, because `hidden` is only a
  presentation hint and the rows inside are flex.
- Preserve `data-topic-switcher`, `data-topic-strip`, `data-topic` on both chips
  and panels, and `aria-current="true"` as the open marker.

### Shell And Type

Posts and Topics use `defaultListPageLayout`, which is `left: []`, `right: []` —
the home page's shell, one centred 820px column at `$desktop`.
`body[data-slug^="tags"]` hides both empty sidebar wrappers and names every grid
row so neither can open an implicit column.

- **Every tag page uses one heading shape and one size step.** `.tag-page-title`
  is `clamp(22px, 2.7vw, 27px)`/600 — the same step as the featured post title,
  this system's section-level display — with `.tag-page-ns` as the eyebrow (only
  for namespaces a reader is not already inside), `.tag-page-label`, and
  `.article-title-count` closing the line. `Posts` and `Topics` used to take the
  post title's 40px, which made a piece of chrome the loudest type on the site,
  while a leaf tag sat at 16px/400 and looked as though it had failed to render.
- **Navigation up is the breadcrumb, everywhere.** `Breadcrumbs` builds the
  trail for tag pages from the slug (`Home ❯ Topics ❯ database`), because tag
  pages are emitted by `TagPage` and are absent from the trie it normally walks
  — it returned `null` on all of them. That is what the bordered `←` icon
  button was covering for: the only bordered icon button on the site, in a
  different idiom from the breadcrumb a post gets, and pointing a leaf topic at
  `Posts` rather than at `Topics`.

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

Tables here are schedules and state grids — two transactions against six steps,
page tables, lock matrices — so they are read cell by cell down a column, not
skimmed. They get rules, alignment and air rather than fills.

- `.table-container` stays within the article width, removes Quartz's default
  table margin, and only scrolls when content truly cannot wrap.
- Full width, collapsed borders, `font-size: 0.92em`, `line-height: 1.6`,
  tabular nums on the whole table, margin `1.25em 0 1.65em`.
- `th`: **transparent**, mono 0.76em uppercase `--gray` over a 1.5px `--darkgray`
  rule, `vertical-align: bottom`. It was a filled `--highlight` band, which made
  it the only tinted box in an article besides code — at a glance the two read
  as the same thing. The header is a label now, in the vocabulary the rest of
  the site uses for labels.
- `td`: padding 10px 14px, 1px `--lightgray` bottom rule, `vertical-align: top`.
  An empty cell is information in a schedule, so the column stays visible
  through it.
- **Vertical rules between columns only** — `th + th, td + td` — at 55% of
  `--lightgray`, half the weight of the row rules. Rows alone gave a schedule no
  column to read down; a rule on the outer edges as well, or at full weight,
  turns a six-column table into a cage. The table is a grid, not a boxed block.
- Row hover tints at 60% of `--highlight` — the reader's finger on a wide row.
- Inline code in cells may wrap so URL-like values fit before scrolling.

Code:

- Inline `p code`, `li code`, `td code`: IBM Plex Mono **0.9em** on
  `--reading-surface`, no border, radius 4px, padding `0.1em 0.36em`. 0.86em put
  it at 14.6px inside 17px Hangul — a visible drop every time a function name
  appeared mid-sentence.
- Blocks: `--reading-surface`, no border in the article, radius 6px, padding
  18px 20px, `tab-size: 4`. The C in these posts is kernel source written for
  8-wide tabs, which starts a third-level block past the middle of the line.
- **One inset for both block shapes.** A fence that declares a language becomes
  `<figure><pre data-language>`, and `base.scss` zeroes that `pre`'s padding and
  puts the real inset on the code grid's line rows — 4px at the left edge. A
  fence with no language is a bare `<pre>` and keeps the `pre`'s own padding.
  The same block was therefore inset differently depending on whether its fence
  said `c`. `custom.scss` sets 18/20 on both and zeroes `[data-line]`.
- Line numbers come from `base.scss`'s `[data-line]::before`. They are `--gray`,
  not the blue-gray from outside this palette that shipped with it.
- **Language badge**: `figure[data-rehype-pretty-code-figure]::before`, mono
  10px uppercase, top-right, with 30px of top padding on the `pre` to clear it.
  It is on the figure and not the `pre` because the `pre` scrolls horizontally
  and a badge inside it slides away with the code — which means one rule per
  language, since CSS cannot read an attribute off a descendant. `c`, `bash`,
  `sql`. `text` is deliberately absent: it is the absence of a language.
- Mobile blocks bleed to the `.center` padding edge with square side edges,
  14px/20px padding, 12.5px/1.7 code text — both shapes, or a ```c block and a
  ```block sit at different insets on a phone.

  ```

## Callouts

Obsidian callouts, styled in `quartz/styles/callouts.scss`. No post uses one
yet; upstream shipped Obsidian's palette — `#448aff` blue, `#00b0ff`, `#00bfa5`
teal, `#7a43b5` purple — so the first one written would have dropped a bright
blue box into a page whose whole palette is one olive and four greys.

**A callout is a `<blockquote class="callout">`.** Every blockquote rule in the
article was therefore overriding `callouts.scss` — including the `--secondary`
left edge, which erased the per-type accent entirely, and
`blockquote p { margin-bottom: 0 }`, which ran every paragraph of a
multi-paragraph callout together. Both rules carry `:not(.callout)`. **Any new
blockquote rule must carry it too.**

It takes the blockquote's shape, so an aside and a quotation read as the same
kind of interruption: `--reading-surface`, no border except a 2px accent left
edge, `border-radius: 0 4px 4px 0`, `margin: 0 0 1.65em`.

The title is the site's label vocabulary — mono 11.5px uppercase in the accent,
with the masked icon at **14px**, not the 18px upstream uses, which put it at
the size of a heading. The body is `--darkgray` body copy: the accent is the
edge and the label, never the prose.

Four accents carry all thirteen types, because a callout has four things it can
mean. Each clears 6:1 on the reading surface it sits on:

| Accent | Value             | Ratio | Types                                      |
| ------ | ----------------- | ----- | ------------------------------------------ |
| olive  | `var(--tertiary)` | 6.28  | note, abstract, info, todo, example, quote |
| green  | `#356044`         | 6.47  | tip, success                               |
| amber  | `#6f5420`         | 6.35  | question, warning                          |
| brick  | `#8c3f33`         | 6.55  | failure, danger, bug                       |

Upstream's `--border` and `--bg` per-type variables are gone; only `--color` and
`--callout-icon` are set per type. The fold machinery is untouched, plus one
rule so a collapsed callout does not hold itself open on an empty padded row.

## Validation Checklist

For visual changes, check as applicable:

- Light and dark body text remain high contrast.
- Metadata and links remain at least WCAG AA contrast.
- Mobile 375px has no horizontal scroll and keeps at least 20px side padding.
- Sidebar drawer, search, and darkmode controls do not overlap on mobile.
- Home layer tabs update `aria-pressed`, row visibility, the `--hs-i` stagger,
  and leave the open tab open when it is clicked again.
- The home page is correct with no script at all: the opening layer is rendered
  server-side, no entrance holds content at `opacity: 0`, and every animation
  sits behind `prefers-reduced-motion: no-preference`.
- **The entrance plays once per document.** Navigate home → a post → back and
  confirm `body.home-entering` is absent and the featured card is at
  `opacity: 1`.
- Tap targets: profile pills and layer tabs measure at least 44px at `$mobile`,
  and **nothing interactive is under 24px anywhere**. Small text links —
  `All 12 posts →`, the footer links, the breadcrumb trail — are opened with
  padding plus a matching negative margin, so the target grows and the layout
  does not move. Two exemptions, both legitimate: a link inside a running
  sentence (the `Quartz v4.5.2` colophon) and the heading anchors, which are
  `aria-hidden` with `tabindex="-1"`.
- Contrast and target size are measured, not eyeballed: walk every element,
  resolve its effective background up the tree, and compute the ratio. Note that
  a `color-mix()` background computes to `color(srgb 0.94 …)` in **0–1 floats**,
  not `rgb()` in 0–255 — an audit that assumes `rgb()` reports every tinted
  surface as near-black and produces four false failures on the layer strip.
- Every card, chip and tab has a visible `:focus-visible` ring at
  `outline-offset: 3px`, and the featured card lifts on `:focus-within` as well
  as on hover.
- Code blocks scroll horizontally instead of clipping.
- `git diff --check` passes.

## Unlisted Portfolio Pages

- Frontmatter `unlisted: true` keeps the page HTML directly accessible while
  excluding it from the shared Search/Explorer/Graph index, sitemap, RSS, tag
  pages, folder pages, recent posts, and other listings that consume `allFiles`.
- Unlisted pages emit `noindex, nofollow` and use a centered single-column shell
  without the blog sidebars, post metadata, related content, or footer.
- `portfolio-shell` uses the existing display, body, and code fonts plus current
  color tokens. Its desktop content width is 720px inside an 800px center column;
  mobile preserves the 20px safe-area padding floor.

### Portfolio Coverage

**Nothing on this site links to a portfolio page, and that is the design.**
`content/portfolio-it.md` is `unlisted: true` because it is a link the author
attaches to a job application — not a destination this blog sends readers to.
It was briefly a `SiteNav` item and then briefly a row in the home byline;
both were wrong for the same reason, which is that the page has an audience of
one and the blog does not.

A portfolio is also domain-specific, so a second field means a second
`content/portfolio-<id>.md`, not a section added to this one. Those are equally
unlinked. Do not add an entry point for them — not the nav, not the byline, not
the footer.

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

### 2026-09-18

- Added a reusable unlisted-page shell for direct-link portfolios: it preserves
  the quiet green-gray typography and theme while removing blog navigation and
  widening the page into a restrained single content column.

### 2026-09-19

- Replaced the Pinned card grid home page with the Stack index: posts are grouped
  by the layer of the request path they cover, all 12 fit one screen, and a
  single `start` post with an ASCII cover is the one entry point. The previous
  six equal-weight cards gave a first-time reader no basis to choose.
- Moved every face to self-hosted (`fontOrigin: "local"`, declared in
  `quartz/styles/fonts.scss`): Pretendard replaces Noto Sans KR for body and
  Fraunces for headings, Space Grotesk carries Latin-only post titles, and IBM
  Plex Mono is now served locally too. The blog and the portfolio share one type
  system, and no page requests fonts.googleapis.com.
- Dropped Fraunces: it has no Hangul, so Korean headings fell through to whatever
  the visitor's OS supplied and rendered differently on every machine.
- Retuned the long-form reading pass for Pretendard's larger x-height: 17px
  desktop / 16.5px mobile, line-height 1.82, letter-spacing -0.003em (-0.01em
  crowded Hangul at this size), paragraph gap 1.4em. Swapped
  `overflow-wrap: anywhere` for `break-word`, which was breaking ordinary English
  words mid-word.
- Deepened both grounds: light `#fafaf8` to `#f8f8f3`, dark `#1a1c16` to
  `#15170f`, with borders moved to match. The olive accent is unchanged. Every
  text pair still passes 4.5:1; the dark pairs all improved (gray 6.37 to 6.70).
- Gave all 12 posts a hand-written `description`, replacing auto-generated
  previews that were emitting ASCII diagrams and half sentences into both the
  home cards and every `og:description`.
- Reported length as `N chapters · M min`, and as chapters alone past 40 minutes,
  so a long post advertises its structure instead of its price.
- Pointed the footer at the site owner's GitHub, LinkedIn and RSS; it still
  carried the upstream Quartz repo and Discord.

### 2026-09-19 (second pass)

- Restored Fraunces on `.page-title`. Dropping it with the rest of the old type
  system lost the site's identity mark; the wordmark does not follow the body
  face. Self-hosted as a basic-latin subset.
- Moved both grounds close to white (`#fcfcfa` / `#14160e`) and added a lifted
  `--surface`. The previous grounds flattened everything onto one plane and the
  page read muddy; headings now carry near-black at 17.6:1.
- Gave the home page the full content width by dropping the empty right sidebar
  track on index, and filled the freed column with a rail: shortest posts, then
  the project axis.
- Raised the home display scale — entry title to `clamp(23px, 2.1vw, 33px)`,
  post titles to 16.5px — and put the entry post on a white surface with an
  olive rail, so the page has a clear focal point instead of five equal greys.
- Unified the post header with the index: Space Grotesk title, mono metadata,
  outline tag chips instead of filled pills.
- Decoupled the prose measure from the article box: prose stays at 68ch, while
  tables, code, figures and quotes use the full 900px. A four-column table was
  wrapping one word per line.
- Added `ReadNext` to the foot of every post.

### 2026-09-19 (third pass)

- Removed dark mode entirely: no `Darkmode` component, no toggle, no dark
  palette. `darkMode` in `quartz.config.ts` mirrors `lightMode`, `fonts.scss`
  declares `color-scheme: light`, and the dark override blocks are gone from
  `custom.scss`, `fonts.scss` and `readability-experiment.scss`.
- Replaced the left sidebar with a top bar (`SiteNav`). The rail held the page
  title, search, profile and topics, which is four competing things before the
  reader reaches a post; all six reference blogs put a short horizontal bar over
  a single column instead.
- Rebuilt the home page as identity → one entry post → posts grouped by layer.
  The previous three-column version answered neither "who is this" nor "what do
  I click": it showed a filter nav, an index and a link rail at equal weight.
- Put the author's thesis on the page, taken from their own GitHub bio
  ("deterministic cores for nondeterministic systems"). The blog is the study
  record behind that claim, and the layer grouping is what makes the claim
  legible at a glance.
- Grouped the twelve posts into five labelled layers instead of a flat
  reverse-chronological list, so the index reads as coverage of a stack rather
  than a pile of notes.
- Fixed three cascade collisions found while building: `Header.css` styles every
  `<header>` as a flex row (broke the Korean name), `search.scss` sets
  `width: 100%` on `.search` (squeezed the nav links), and the mobile drawer
  rule parked `.search` at `left: -100vw` (hid search on phones).
- `portfolio-it` is unchanged, and is insulated by its `data-unlisted` shell.

### 2026-09-20

- Moved the profile back to a 250px left rail and gave it the thesis, so
  identity is present on every page without sitting in the reading column.
- Replaced the single entry post with `Pinned`: two representative posts side by
  side, each with a three-line ASCII cover.
- Turned the layer grouping into a horizontal rail that filters the index in
  place, so the whole structure — pinned, layers, all twelve posts — fits one
  screen instead of scrolling through five stacked groups.
- Folded the archive link into the end of the rail and dropped the separate
  index header, which repeated the count the rail already shows.
- Removed the instructional copy. No sentence on the page explains how to read
  the page; labels are one or two words.
- Extracted `postMeta.ts` and gave the archive the home's row design, so a post
  reports the same date and the same `N chapters · M min` in both places. The
  archive had been showing raw `63 min read` while the home said
  `파트별로 나눠 읽기`.
- Unified every chip — archive tags, topic tabs, article tags — on one outline
  treatment; filled pills are gone.
- Sized the home to one screen and wrote the measurement into the reference so
  the budget is checkable: content ends at 904px at 1440×1000.
- Fixed two more upstream collisions: the empty `.sidebar.right` on index was
  auto-placing into an implicit grid column and stealing ~64px, and
  `.page-header` sits inside `.center`, so the child-combinator margin override
  never matched and base's 6rem opener stood.
- `portfolio-it` is unchanged.

### 2026-09-20

Ten-reviewer design QA (five readers, five designers) against the rendered site
at 390 / 820 / 1000 / 1199 / 1440px. Every item below was measured, not guessed.

- **Fixed the 800–1199px shell.** Both sidebars keep `grid-area` from
  `base.scss`, and the below-desktop template named neither, so Grid opened an
  implicit column: at 820px the content column was 427px (52% of the viewport)
  with 286px blank beside it, and the profile card was placed ~2000px below the
  fold. Both sidebars are now hidden below `$desktop` and both rows are named.
  Content is 722px centred at 820 / 1000 / 1199px.
- **Capped the tablet measure at 760px and centred it.** Removing the ghost
  column handed the column the whole viewport; 855px of Korean body text is
  about twice a comfortable line.
- **Gave every non-desktop width a table of contents** (`CompactToc`). A
  9-chapter, 24-minute post previously offered a phone reader nothing but the
  scrollbar, because the TOC is hidden with the right rail.
- **Put identity back on mobile and tablet** by mounting a second `ProfileCard`
  into the home page's `beforeBody`.
- **Dropped `-webkit-line-clamp: 1` on desktop home descriptions.** One line cut
  Korean mid-word (`…페이지 테이블, TLB,…`); the base two-line clamp is what the
  archive already used, so the two pages now agree.
- **Made the home index multi-column instead of a row-major grid.** The grid ran
  the sort across the pair, so scanning the left column alone read 06-23, 04-21,
  04-19 with every second post missing. `columns: 2` flows top-to-bottom, the
  order the list is sorted in.
- **`Archive →` gets its own gutter** in the layer rail; flush against the last
  chip it read as a seventh filter rather than a link off the page.
- **The search hint now says `Ctrl K` off Apple platforms.** The handler always
  accepted Ctrl; only the label was wrong.
- Contrast was re-measured and left alone: `--gray` 6.26:1, `--tertiary`
  6.82:1, `--darkgray` 12.67:1 on `--light`. No horizontal overflow at any of
  the five widths.

### 2026-09-20 (design QA panel)

A twenty-reviewer QA pass — ten general readers, ten design practitioners, each
briefed to criticise sharply and to ignore the existing structure.

**Round 1 — the scale.** Fourteen of the twenty notes traced back to one cause.

- **`$site-scale` goes from 0.95 to 1.** A global root zoom meant every size
  declared anywhere in the repository rendered 5% smaller than the source says:
  the home index title shipped at 14.25px, its description at 11.88px, its
  metadata at 9.5px, the layer chips at 9.5px and the pinned cover art at
  **8.55px**. Nobody reading `custom.scss` could see any of it. The article body
  was the only surface anyone had tuned, so the site read well _inside_ a post
  and was illegible everywhere around it. Do not reintroduce a global zoom;
  change the sizes.
- **Raised the UI scale on top of that**: index title 15→17px, description
  12.5→14px, metadata 10→11.5px, date 10.5→12px; layer chips 10→11.5px; nav
  links 13.5→15px; profile thesis 13→14px, links 11→12px; `ReadNext` title
  14.5→16.5px; compact TOC rows 13.5→15px; `pre code` 12.5→13.5px; post
  metadata 11.5→12.5px; tag chips 10.5→11.5px. Row padding 9→14px.
- **Dropped the one-screen home constraint and the two-column index.** The
  constraint was the reason the type had to be that small.
- **Layer rail: grid to wrapping flex chips.** The grid stretched every chip to
  the width of `Orchestration`, which is what forced 10px labels.
- **Fixed three contrast and consistency defects found on the way:**
  `footer.scss`'s `opacity: 0.7` put the only sitewide links near 4.4:1;
  `contentMeta.scss` diluted post metadata to about 5:1 with a `color-mix`;
  and `ContentMeta`'s comma separator printed `Apr 19, 2026, 10 min read`.
- **Article `em` loses its green background.** In posts that emphasise a term
  every other paragraph the page filled with swatches, and `mark` — the element
  that is supposed to look highlighted — stopped meaning anything.
- **Article tags keep their namespace but demote it** (`topic/` in `--gray`).
- **Footer links lead, colophon follows.** The site's last word was its build
  tool's version number.

**Round 2 — the block count.** Round 1 was rejected on review, correctly: it
fixed every size on the page and removed nothing, then added an opener. Measured
against the deployed `main`, the home page had gone from two blocks to six, in
six visual vocabularies. Bigger type on a crowded page is still a crowded page.

- **Home is now a masthead plus three blocks**, down from six. See **Home Page**.
- **Deleted the Korean opener copy written into `HomeStack.tsx`.** It was
  invented site voice plus a sentence explaining how to use the filter. The
  tagline from `main`'s `content/index.md` is restored as the page body and is
  the document's `h1` — copy belongs where the author edits copy.
- **Deleted the `Pinned` pair.** One featured post, set as type, no border, no
  label, with the ASCII cover as the page's single graphic. Its index row and
  the block swap on filter so nothing is printed twice and no count lies.
- **The profile has one address per page type.** Rail on reading pages, masthead
  byline on index, and the index has no rail at any width. It previously moved
  between the rail and the foot of the column depending on viewport.
- **Index shell is one centred 820px column**, so the nav, masthead, featured
  post, chips and list share a single measure.
- **The index list's top rule drops from `--dark` to `--lightgray`**, joining
  the one hairline system instead of reading as a table header.

**Dark mode: added in round 1, removed completely in round 2 at the author's
instruction** — not disabled, removed. `Darkmode.tsx`, its script and its
stylesheet are deleted, the `components/index.ts` export is gone, `theme.ts` no
longer emits the `:root[saved-theme="dark"]` palette, `syntax.scss` carries only
light rules, and `SyntaxHighlighting` uses `github-light` for both themes. The
emitted CSS has zero occurrences of `prefers-color-scheme`, `saved-theme` or
`shiki-dark`. See **No Dark Mode**.

Deferred: a cover for the ten posts that have none is content work, not design
work.

### 2026-09-20 (author feedback, three-reviewer pass)

Seven notes from the author, worked through by three reviewers. They resolved
into one structural decision and five consequences of it.

**The rail belongs to the document, not to the author.** Notes 1 and 2 —
"reduce or drop the profile on a post" and "the outline on the right is too
narrow" — are the same note. A post gave its 264px left rail to a bio and its
document structure to a 230px right rail narrower than most of the headings it
had to print. The outline moved to the left rail at 268px, the right rail is
gone from every layout, reading pages carry no profile at all, and Backlinks and
`VisitorCount` moved to `afterBody` as end-matter. Reading pages are 1200px.

- **The byline prints one token per destination.** `github` /
  `github.com/jaeunda` as a label-and-value pair became six items with no way to
  see which three were links once the card was laid out horizontally. `GitHub`,
  `Email`, `LinkedIn`, underlined.
- **Layers reads as one axis cut into parts.** A section label, each layer's
  `blurb` printed under the open tab, tabs rather than chips, no `All` — it
  duplicated `All posts →` beside it — and the order is by weight, so the page
  opens on Storage Engine (6) rather than Application (2). One layer is always
  open, rendered server-side.
- **`Posts` and `Topics` are different pages.** Both used to render a flat list
  of all twelve posts. `Posts` is everything newest-first; `Topics` groups by
  subject. The Topic/Project tab strip and chip cloud above the archive are
  gone, along with `tagIndexFilter.inline.ts`.
- **`project/` tags are no longer shown to readers.** They are the reason the
  archive needed that tab strip. Only `topic/` appears, as `#database`.
- **Chrome is English.** Nav (`Posts` / `Topics` / `Portfolio`), the rail label
  (`Outline`, in the i18n string and in `CompactToc`), `Read next`, and
  `long read` in place of `파트별로 나눠 읽기` in a metadata line that is
  otherwise `10 chapters · 16 min`. Korean stays for what the author writes.
- **A readability pass over the article.** Leading 1.82 → 1.85 and tracking
  -0.003em → 0 for Hangul in Pretendard; paragraph gap 1.4em → 1.65em, which was
  under one line; lists now inherit the body's leading instead of running 1.72
  inside 1.85 prose; heading margins step down by level; inline code 0.86em →
  0.9em; table headers lose their fill for a mono label over a rule; code blocks
  get one inset across both markup shapes, `tab-size: 4`, `--gray` line numbers
  and a language badge. See **Article Scale** and **Tables And Code**.

Two defects found while doing it, both from components that had moved: the
profile card's stylesheet still carried `@media (max-width: 768px) { display:
none }` from its rail days, which would have taken identity off the home page on
every phone; and `visitorCount.scss` carried `@media (max-width: 1200px) {
display: none }`, which would have hidden it everywhere but desktop.

### 2026-09-20 (author feedback, second round)

- **Topics became one switcher.** The vertical stack of nine groups was correct
  but was a scroll, not a chooser. A sideways-scrolling strip of subjects, a
  step button at each end, one open panel — and nothing in it is sized to the
  current number of subjects. See **Topic Switcher**.
- **Callouts were never designed.** They still carried Obsidian's blue/teal/
  purple palette, and because a callout is a `<blockquote>`, the article's own
  blockquote rules were overriding what little was there — the per-type accent
  was being replaced by `--secondary` on every one of them. Restyled onto four
  accents in this palette, in the blockquote's shape. See **Callouts**.
- **Tables got vertical rules**, between columns only and at 55% of
  `--lightgray`. Rows alone gave a schedule no column to read down; anything
  heavier, or rules on the outer edges, reads as a cage.
- **The Layers blurb moved inside the tab.** It was one line under the strip
  that the script rewrote on each click, so four of the five layers never said
  what they covered. Every tab prints its own now, in English, and the strip is
  an `auto-fit` grid so a sixth layer needs no stylesheet change.
- **The post row stopped printing its layer.** On the home page the open tab
  already names it, and printing it on some lists but not others would have made
  one row design into two.

### 2026-09-20 (structural refactor, design + QA pass)

Six defects found by rendering the site and measuring the DOM, not by reading
the stylesheet:

- **`##database`.** `TagList` printed a literal `#` and `base.scss` added
  another through `a.tag-link::before`. The glyph is presentation, so the CSS
  rule owns it and the component prints the bare leaf.
- **`Apr 19, 2026 ·10 min read`.** The separator carried a leading space and no
  trailing one, and the segments are adjacent elements with no whitespace
  between them. It is `" · "` with `white-space: pre`.
- **The nav never lit up on `Posts`.** `SiteNav` compared `here === slug`, and
  the archive is `tags/index` against a link of `tags/`. Slugs are normalised
  and the **longest** match wins, so `/tags/topic/database` marks Topics and not
  both Topics and Posts. `aria-current` is `page` for the destination itself and
  `true` for a page inside it.
- **The nav collided with the search icon at 390px**, by a measured 18px:
  `.site-nav-links` is `white-space: nowrap` and would not shrink, so it ran out
  of its own box. The links now take a full-width flex basis at `$mobile` and
  drop to a second line, which holds at any width rather than at one width and
  wider.
- **The footer never lined up with the text.** It is a _sibling_ of `.center` in
  the `#quartz-body` grid, so it never inherited the column's padding and ran
  48px wider on every reading page. The gutter is now a token — `--gutter-start`
  / `--gutter-end` on `.page` — that both read. Separately, at `$tablet` both
  carry `margin: auto`, and auto margins on a **grid item** size it to its
  content: the footer shrank to 380px and centred, closing the page with a rule
  across half the column at every width between 800 and 1200. It takes
  `width: 100%` now.
- **Every page ended in a stray rule.** `renderPage.tsx` emits an `<hr>` after
  the article and it was only hidden on the home page, so a post closed with two
  hairlines 57px apart and a list page with one floating 100px above the
  footer's own. `.center > hr` is hidden everywhere; the footer closes the page.

Structure, all of it verified against the rendered output first:

- **653 lines of dead CSS removed**, and `Hero`, `TagCloud`,
  `RecentNotesWithPreview`, `PinnedPosts` and `homeFilter.inline.ts` deleted.
  Every one of those selectors appeared in zero emitted pages.
- **`PostRow` is now one function.** The row markup was written out three times;
  `ReadNext`'s copy had drifted into bordered cards with no date and no length —
  the last post list a reader saw was the one that would not say how long
  anything was, in the only card idiom on a site whose contract rules out
  card-heavy styling.
- **`ContentMeta` prints the site's contract.** It used Quartz's US-format date
  and `10 min read` while every listing used `postMeta.ts`, so one post carried
  two dates and two ways of saying its length, and the chapter count reached a
  desktop reader nowhere. It is `isoDate` + `lengthLabel` now. Its `showComma`
  option is gone: the layout disabled it on every mount, its CSS branch was
  dead, and it spelled a non-standard `show-comma` attribute into the DOM.
- **Two mounted components rendered nothing** on list pages and have been
  removed from `defaultListPageLayout`: `ContentMeta` needs `fileData.text`,
  which a tag page has none of, and `Breadcrumbs` walked a trie that tag pages
  are absent from — which is what the bordered `←` was covering for.
- **One eyebrow.** `.hs-featured-layer`, `.hs-layers-label`, `.rn-label` and the
  backlinks heading had four specs for one role, and the two that share a screen
  did not match. Grouped into a single rule at mono 11.5/500/0.13em/`--gray`;
  olive stays reserved for links and active state.
- **`--highlight` is a hover tint again.** `.topic-chip[aria-current]` filled
  with it, and a post's own tag chip was rendering in exactly that costume, so a
  tag looked like a filter that was switched on. Open chips take the accent
  border and accent text. The post chip's rule had been written
  `.center > .content-tags`, a child combinator that never matched, so the whole
  block was dead and `TagList.css` was painting instead.
- **Tap targets.** Only `body` carries `box-sizing: border-box` and it does not
  inherit, so `.topic-chip`'s `min-height: 44px` was measuring the content box
  and producing 64px chips five rows deep. The mobile search control was a 16×24
  target under the 24×24 floor; padding opens it to 44×44 and a matching
  negative margin takes the space back out of the layout, so nothing moves.
- **Mobile tables** take the same full bleed the code blocks already have, with
  an 11ch floor on cells, so a state grid scrolls as one object instead of
  wrapping Korean to four syllables a line.

### 2026-09-20 (author feedback, eight-point pass)

Eight notes from the author, in their order. Everything here is a change to what
the page _says_, not to how much of it there is — the home page is still a
masthead and three blocks.

- **Heading weight, everywhere.** 700 on a page whose body is 400 was the only
  thing the eye could settle on, and Pretendard sets Hangul as full-width squares
  with no ascender rhythm to break up the ink, so the same number prints heavier
  in Korean than the Latin it was chosen for. The global `h1`–`h6` rule is 650,
  `h4`/`h5` are 620, and the h1/h2 step moved from weight to size (1.62em / 1.4em,
  both 650): they were 1.55em/700 against 1.47em/600, a 1.3px size difference
  paid for with a whole weight step, so a chapter was not bigger than the section
  under it, only blacker.
- **The Layers strip did not read as a control.** Three fixes, all legibility:
  the heading is `Browse by layer`, because `Layers` names a taxonomy without
  saying it can be clicked; the open tab now carries an 8% accent ground, the
  accent on its name and number and a 600 name, where it used to be marked by a
  2px underline and a colour across a five-column grid; and the names went to
  15px with 12px blurbs.
- **The stray rule under the strip is gone.** `.hs-layers` had a `border-bottom`
  sitting 16px below tabs that already end in their own 2px border, so the strip
  appeared underlined twice and the second line closed nothing. `.hs-index`
  takes a 14px top margin instead.
- **`Portfolio` left the nav for the byline.** One unlisted page about the author
  was a top-level destination beside the entire blog. `portfolios.ts` now holds
  the list, and the answer to "there will be one per domain" is in that file and
  in **Portfolio Coverage**: the key prints the domain (`portfolio/it`) as soon
  as there is a second, and a hub page takes over past two.
- **The byline links are a console table.** A lowercase `--gray` key in the code
  face and the whole address as the link: `code github.com/jaeunda`. One-token
  links (`GitHub`, `Email`, `Daeun Jang`) were readable but gave the reader
  nothing to type, and one of the three printed a person where the others
  printed places. The key column is `10ch` **and the row carries the mono face
  and size** — `ch` resolves against the element it is declared on, and left to
  inherit it measured the 17px body face and opened a 40px hole in every row.
- **The featured post says it is featured.** The eyebrow was the layer alone, so
  the post the author picked to open the site was labelled `KERNEL`: where it
  files, not why it is there. `● FEATURED POST – KERNEL`, plus a
  `Read this first →` foot line, because the block was a link with nothing in it
  that looked like one.
- **The featured post is back in its layer.** It had been filtered out of the
  index to avoid printing it twice on one screen, but the tab said `Kernel 2`
  over a list of one, so the layer looked broken. The duplication is only visible
  while that layer is open; a layer missing its best post is visible always.
- **Layer order and post order are now editorial.** `LAYERS` is Kernel, Storage
  Engine, Transport, Orchestration, Application, and `layersInOrder()` only drops
  the empty ones — `layersByWeight()` is deleted, because sorting the front page
  by post count let the accumulation of posts decide what the site is about.
  Inside a layer, `rank` frontmatter orders the posts and `byEditorialRank()`
  applies it on the home index and to `ReadNext`'s same-layer picks. The criteria
  and the current ordering are written down in **Editorial Rank**, along with the
  rule that matters: a new post takes the rank it earns and the posts below it
  move down.
- **The first screen moves.** The author's own portfolio page opens and this one
  did not. Two devices, no new blocks: an accent wash at 7% behind the opening
  screen only, and one 10px `home-rise` entrance stepped 70ms apart down the
  reading order, both behind `prefers-reduced-motion`. Switching layers staggers
  the incoming rows off `--hs-i`, which the script writes, rather than
  `nth-child`, which counts every hidden row of every other layer and would have
  started the last layer's first row 200ms late.

Verified by rendering: `npx quartz build`, then Chrome at 375 / 500 / 1280 with
`scrollWidth === clientWidth` and no element past the viewport at any of them,
and the layer tabs driven through three switches over CDP — `aria-pressed`, row
visibility, `--hs-i` numbering from 0, and the trailing-hairline rule all correct.

### 2026-09-20 (author feedback, design + UX consultation)

Four notes from the author — treat the featured post as a card with interactive
effect, fix a profile link row she called awkwardly laid out, match the blog's
mood to the portfolio, and remove the portfolio entry point entirely. A senior
web designer and a UX specialist reviewed the rendered pages against
`portfolio-it` before any of this was written; where they disagreed, the
resolution is recorded below.

- **The gap was never type or colour.** The portfolio has three planes, a
  two-layer ambient shadow and a 180ms lift; the blog had one plane and
  colour-only hovers. `--shadow`, `--shadow-lift` and `--lift-ease` are now in
  `fonts.scss` as the portfolio's values verbatim, and the whole budget —
  durations, easings, travel distances, what may move and what may not — is
  written down in **Mood And Elevation** so the next pass does not re-derive it.
- **Elevation is rationed to two resting cards**, the featured post and
  `ReadNext`, and they bookend the reading. The featured card lifts because it
  is a link; `ReadNext` does not because it is not. Everything between them
  stays flat, and **nothing in an article body moves or lifts** — both
  reviewers were explicit that a scroll-linked reveal on a 34,000px post leaves
  body copy permanently mid-animation.
- **The featured post was row zero set large.** Its closing hairline was the
  same declaration `.post-row` carries, and the only filled plane on the screen
  was the ASCII cover _inside_ it, out-weighting its own parent. It is a real
  card now, and the cover's own border came off — a framed plate inside a
  framed card is two boxes.
- **The profile is pills, and that is the fourth try.** The two-column `10ch`
  mono table shipped in the previous pass opened a dead gutter across the
  column, made the reader decode `code` / `work` / `mail`, cost ~130px of the
  first screen, and left ~20px tap targets. `.pf-caps` pills carry the full
  addresses on one line, clear 44px on a phone, and the 999px radius keeps a
  destination from reading as a 3px tag chip. All four versions and their
  faults are listed under **Profile Rail** — the row has now been wrong in
  four distinct ways and the list is the guard against a fifth.
- **The layer tabs became surfaces, and the open one sits down.** Borderless
  underline tabs were the last flat vocabulary on a screen that opens with a
  card. The pressed tab takes the accent tint and border with no shadow and no
  transform; a control that is switched on must not be the thing floating
  highest. The order number and the count moved to a meta line above the name,
  because `01 Storage Engine 6` broke the label on a 132px column.
- **Rows tint, they do not lift.** Twelve cards rising on a list is noise, so
  the row takes a 4% accent ground on a 6px radius with a `→` that fades in.
  The inset is paid for with a matching negative margin, so the tint reaches
  past the text while the text stays on the column's left edge.
- **The entrance now plays once per document, in three steps.** It replayed on
  every SPA navigation, so a reader returning from a post watched the home page
  reassemble — it punished exactly the reader who was browsing. It is gated on
  `body.home-entering`, which the script adds on the first `nav` only, and that
  same class fixes a worse latent bug: the rule no longer holds server-rendered
  markup at `opacity: 0` behind a `backwards` fill, so a browser that never
  runs the animation shows a finished page instead of a blank one. The ladder
  went from five steps to three, and the row stagger is capped at five rows.
- **Portfolio entry points are gone, by design, everywhere.** It left the nav
  last round and became a byline row; the author's plan was always that the page
  is a link attached to a job application and nothing else. `portfolios.ts` and
  the domain/hub machinery from the previous entry are deleted — that entry is
  superseded. See **Portfolio Coverage**.
- **`All 12 posts →`.** The home page never stated how much writing there is,
  and the count is free.

**Recommendations deliberately not taken**, all from the UX review, all because
they are the author's calls rather than the design system's — surfaced to her
instead:

- Replace the layer filter with layer _headings_ over one continuous 12-post
  index. The argument is real (a filter that hides 10 of 12 posts earns little
  on a 12-post blog, and the tabs are `<button>`s that do nothing without JS),
  but the author designed this filter one round ago and set its order herself.
- Drop `Topics` from the nav as a third view of the same twelve posts.
- Put the graduation date in the byline, print real minutes instead of
  `long read`, and say somewhere that the posts are in Korean.
- Rename `Read this first →`, which lands on the site's longest post.

Verified by rendering: `npm run check`, `npx quartz build`, then Chrome over CDP
at 375 / 500 / 820 / 1280 with `scrollWidth === clientWidth` on home, archive and
a post at every width; the layer strip driven through a switch (`aria-pressed`,
`--hs-i` numbering capped at 5, `box-shadow: none` on the pressed tab); tap
targets measured at 44px on a 375px phone; and the entrance checked across a
real SPA round trip — home → post → back — where `body.home-entering` is absent
on return and the featured card measures `opacity: 1`.

### 2026-09-20 (author feedback, copy and edge pass)

Five notes, three of them copy.

- **The masthead now says what the record says.** `Interested in the systems
behind reliable software` opened on a hedge, and its sub-line claimed a
  "growing focus on runtime execution and hardware-aware performance" that
  nothing in the twelve posts showed. Checked against `~/_workbench/_master`,
  the portfolio and the GitHub trail, the through-line is the sentence her own
  portfolio already uses for this blog — she follows systems to the point where
  they fail — and the hardware claim is real but belongs at the end, as a
  direction, where the NPU/CUDA training and the CXL appendix support it. The
  wrap was measured, not assumed: see **Home Masthead** for the widths and for
  the one word that had to come out.
- **Twelve descriptions, one template.** Seven of twelve opened with the same
  rhetorical question and nearly all closed on the same noun. Each is now built
  from something only that post contains, in a shape that differs from its
  neighbours. The rule is written down under **Post Descriptions** — the
  guard is against uniformity, which is what reads as generated, not against
  any one line.
- **The byline role stopped floating.** `Systems & Infrastructure` sat 12px
  from the name in a different face, size and colour, connected to it only by
  adjacency. It takes the drawn 4×1px rule the featured eyebrow uses, at
  `vertical-align: middle` so the rule lands on the optical centre; the first
  attempt positioned it absolutely and it came out above the cap height, as a
  macron over the name.
- **Resting edges softened.** The layer tabs drew five hard `--surface-line`
  rectangles across the first screen on a site whose vocabulary is hairlines.
  55% border plus a 3% contact shadow; full strength is reserved for hover and
  the open state, the two moments the reader is asking which box is which.
- **One radius family.** The topic strip and the layer strip are the same
  control — pick one of a row — and sat in two shapes on pages one click apart.
  Topic chips are now the layer tab's box exactly, and the inline tag chips
  moved 3px/4px → 6px so the whole set steps 6 → 10 → 12 → 14. The byline pills
  keep 999px, which is the one intended exception: a destination must not read
  as a filter.

Verified by rendering: `npm run check`, `npx quartz build`, masthead line-broken
at 375 / 500 / 820 / 1280 by walking `Range` rects character by character rather
than by eye, and the byline, topic strip and post tags clipped and inspected at
2× after each change.

### 2026-09-20 (author feedback, final pass)

- **Descriptions are one sentence, and the question came back.** The author
  liked the rhetorical question and wanted the second beat gone, which is the
  right call — the trailing noun phrase was where all twelve started to sound
  alike. Each is now a single question that only its own post answers, written
  after reading the post rather than its headings: the release point that
  decides serializability, the commit that is still only in memory, the parent
  node you check instead of every descendant. One is a declarative, because the
  RTOS post is a seminar write-up and saying so is worth more than a
  manufactured question. See **Post Descriptions**.
- **Everything that is not the writing dropped a step.** The byline pills, the
  footer links and a post's tag chips are `--gray` on softened borders; at
  `--darkgray` the three addresses under the masthead were the second-loudest
  thing on the first screen. `--gray` is 6.26:1 on the page ground, so this is a
  hierarchy decision and never a contrast one.
- **The layer names went up.** They were 15px/500 `--darkgray` — a step _below_
  the row descriptions beneath them, which made the page's primary control read
  as five captions on boxes. Display face, 15.5px/600, `--dark`, the same
  vocabulary as the post titles.
- **Three tap targets were under the 24px floor** and are not any more:
  `All 12 posts →` (21px), the footer links (17px) and the breadcrumb trail
  (20px), each opened with padding and a matching negative margin so nothing
  moved. `.pf-found-k`, a portfolio selector matching nothing in
  `portfolio-it.md`, was removed in the same sweep.

Final check, measured rather than eyeballed: contrast for every text node
against its resolved background on four pages at two widths — **no failures**;
a real Tab walk of the home page — every one of the twenty focusable elements
carries the 2px olive ring, in a sensible order; `scrollWidth === clientWidth`
at 375 / 500 / 820 / 1280; the entrance plays once across a home → post → back
round trip; the layer switch holds editorial order with the pressed tab flat;
and the masthead breaks two lines at every width with no orphan.

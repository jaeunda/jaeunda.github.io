# jaeunda.log Design System Reference

This reference mirrors the current repository state. If code and this file
disagree, code wins; update this file in the same patch.

## Quick Reference

| File                              | Role                                           |
| --------------------------------- | ---------------------------------------------- |
| `quartz.config.ts`                | Color tokens, font families, site settings     |
| `quartz.layout.ts`                | Component placement for content and list pages |
| `quartz/styles/editorial.scss`    | The blog's visual layer — included last, wins  |
| `quartz/styles/fonts.scss`        | `@font-face` declarations and the font stacks  |
| `quartz/styles/custom.scss`       | Project-specific visual system                 |
| `quartz/styles/variables.scss`    | Breakpoints, grid constants, font weights      |
| `quartz/components/HomeStack.tsx` | The whole home page: featured, layers, index   |
| `quartz/components/PostRow.tsx`   | The one post row, used by every listing        |
| `quartz/components/postMeta.ts`   | Layers, date and length contract               |
| `quartz/components/SiteNav.tsx`   | The site's one navigation bar                  |
| `content/index.md`                | The home masthead copy                         |

> **Current design:** `references/blueprint-2026-09.md`, implemented in
> `quartz/styles/editorial.scss`. Where a section below disagrees with the
> blueprint, the blueprint is current.

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
| `light`         | `#fbfbfa`                | Page background                    |
| `lightgray`     | `#e5e6e2`                | Borders and faint surfaces         |
| `gray`          | `#5c5f5a`                | Metadata and secondary text        |
| `darkgray`      | `#2b2d2a`                | Body text                          |
| `dark`          | `#191a18`                | Headings and strong emphasis       |
| `secondary`     | `#4f5e3c`                | UI accent and decorative underline |
| `tertiary`      | `#4f5e3c`                | Body links, active states          |
| `highlight`     | `rgba(79, 94, 60, 0.12)` | Tints and table header backgrounds |
| `textHighlight` | `#dde3d4`                | Markdown mark highlight            |

**Olive `#4f5e3c` is the point colour and the only colour on the page** —
links, active state, the wordmark, a layer number. Everything else is a
neutral, and the neutrals are set **for reading, not for mood**: a near-white
ground a shade off pure white, so a sixty-minute post does not glare, carrying
near-black text. The greys are hue-free on purpose; a grey that leans green
competes with the one thing that is allowed to be a colour.

Contrast on the ground: `dark` 16.9:1 · `darkgray` 13.4:1 · `gray` 6.3:1 ·
olive 6.8:1.

`styles/portfolio.scss` hard-codes its own literals (`--pf-page` / `--pf-ink` /
`--pf-accent` …) because those pages are light-only and cannot read a theme.
They share the accent and are deliberately **not** kept in lockstep on the
neutrals: the portfolio is a printed page, the blog is a reading surface.

`styles/editorial.scss` repeats the same nine under the names the blog's visual
layer uses, and adds the olive scale the accent is cut from:

| Editorial token            | Value                                                                                     | From                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| `--ground`                 | `#fbfbfa`                                                                                 | `light`                                   |
| `--card`                   | `#ffffff`                                                                                 | —                                         |
| `--plate`                  | `#f1f2ef`                                                                                 | the reading surface                       |
| `--line`                   | `#e5e6e2`                                                                                 | `lightgray`                               |
| `--line-strong`            | `#cbccc7`                                                                                 | —                                         |
| `--ink`                    | `#191a18`                                                                                 | `dark`                                    |
| `--body`                   | `#2b2d2a`                                                                                 | `darkgray`                                |
| `--mute`                   | `#5c5f5a`                                                                                 | `gray`                                    |
| `--faint`                  | `#676a64`                                                                                 | 5.3:1, carries 12px mono                  |
| `--olive-50 … --olive-900` | `#f2f4ec` `#dde3d4` `#c3ccb0` `#9fab85` `#7a8a60` `#4f5e3c` `#414e31` `#333e26` `#232b1a` | 600 is the accent, 100 is `textHighlight` |

Two more tokens live outside `quartz.config.ts`, which only carries the nine
named colours: `--surface` / `--surface-line` in `styles/fonts.scss` (`#ffffff`
/ `#e9eae6`) for lifted blocks, and `--reading-surface` (`#f1f2ef`, the same
value as `--plate`) for code and quote surfaces on the pages
`readability-experiment.scss` still draws.

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
  `SyntaxHighlighting` is configured with `vitesse-light` for **both** themes, so
  a second token set is not shipped on every span. Vitesse's greens and clay sit
  inside the olive palette; github-light's red and purple read as someone
  else's site.
- `fonts.scss` declares `color-scheme: light`.

The emitted CSS contains zero occurrences of `prefers-color-scheme`,
`saved-theme` or `shiki-dark`. Do not reintroduce any of it.

### Color Rules

- Body text: `var(--darkgray)`
- Headings: `var(--dark)`
- Metadata: `var(--gray)`, never `var(--lightgray)`
- Links: `var(--tertiary)`
- Borders: `var(--lightgray)`
- Active selection: `var(--tertiary)` background with `var(--light)` text.

## Typography

Every face is self-hosted from `quartz/static/fonts/` and declared once in
`quartz/styles/fonts.scss`. `quartz.config.ts` therefore sets
`fontOrigin: "local"`; the site makes no request to fonts.googleapis.com.

| Token                     | Font          | Use                                                      |
| ------------------------- | ------------- | -------------------------------------------------------- |
| `header` / `--headerFont` | Fraunces      | Article headings, section labels                         |
| `body` / `--bodyFont`     | Noto Sans KR  | Body, descriptions, h4-h6, readable UI                   |
| `code` / `--codeFont`     | IBM Plex Mono | Code, tags, dates, counters, identifiers                 |
| `--displayFont`           | Fraunces      | The display face; `--serif` in editorial.scss aliases it |
| `--wordmarkFont`          | Fraunces      | `.page-title` — the identity mark                        |

Two faces are declared for the **unlisted portfolio pages only** and never
appear on the blog: Pretendard (`--pf-sans`) and Space Grotesk (`--pf-latin`).
A browser fetches only the faces a page sets, so a blog page downloads Fraunces

- Noto Sans KR + Plex and a portfolio page downloads Pretendard + Space Grotesk
- Plex; neither pays for the other.

`--displayFont`, `--headerFont` and `--codeFont` are all redefined in
`fonts.scss` under `html:root`, because `joinStyles` in `quartz/util/theme.ts`
appends its own `:root` block after every stylesheet — and the stack it builds
from `quartz.config.ts` falls back to a **system sans**, which would drop a
Korean heading onto whatever face the OS supplies. The `html:root` copies put
Noto Sans KR back in second place.

**Fraunces has no Hangul, and that is not a reason to keep it off headings.**
It sets the wordmark, the home masthead, every post and list title, and the
article's own h2/h3; the Hangul inside those lines falls through to Noto Sans
KR and the latin words stay in the serif. That mixed line is the site's
signature and is how the headings were always drawn — it is not a fallback
failure. h4 and below stay on the reading face, where they sit closer to the
paragraph they open.

It is subset to full latin (not the eleven letters of "jaeunda.log", which is
all it carried while it was the wordmark alone). The Noto Sans KR file is a
subset covering the characters in `content/` plus the UI copy; see
`scripts/fonts/README.md` before adding Korean that might use new syllables.

### Article Scale

| Element          | Current Style                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.article-title` | Fraunces `clamp(32px, 1.4rem + 1.9vw, 44px)`, 700, line-height 1.16, tracking -0.015em, `text-wrap: balance` (editorial.scss; the custom.scss fallback is `clamp(30px, 3.4vw, 40px)` / 600) |
| `article`        | 17px desktop / 16.5px mobile, line-height 1.85, box max-width 900px with a 68ch measure on direct children, letter-spacing 0, `word-break: keep-all`, `overflow-wrap: break-word`           |
| `p`              | inherited 1.85 line-height, margin `0 0 1.65em`, `text-wrap: pretty`                                                                                                                        |
| `h1`             | `--headerFont` (Fraunces) 1.62em desktop / 1.5em mobile, 650, line-height 1.25                                                                                                              |
| `h2`             | `--headerFont` (Fraunces) 1.4em desktop / 1.25em mobile, 650, line-height 1.28, margin-top 2.7em desktop / 2.4em mobile, no bottom border                                                   |
| `h3`             | `--headerFont` (Fraunces) 1.2em desktop / 1.06em mobile, 600, line-height 1.35, margin-top 2.2em desktop / 2em mobile                                                                       |
| `h4`             | Body font 1em, 620, line-height 1.38, margin-top 1.8em, color `darkgray`                                                                                                                    |
| `h5`             | Body font 0.93em, 620                                                                                                                                                                       |
| `h6`             | IBM Plex Mono 0.87em, 600, uppercase, letter-spacing 0.08em                                                                                                                                 |
| `li`             | inherits the body's 1.85, margin-bottom 0.45em, nested items at 1em                                                                                                                         |
| inline `code`    | 0.9em IBM Plex Mono, `reading-surface` background, no border                                                                                                                                |
| `pre code`       | 13.5px, line-height 1.72, `tab-size: 4`                                                                                                                                                     |
| `blockquote`     | `reading-surface` background, 2px `secondary` left edge, no italic                                                                                                                          |
| `img`            | block, `margin: 1.6em auto`; `p > img + em` is the caption, 0.82em `--gray`, centred                                                                                                        |

On a blog post, `editorial.scss` draws the markdown headings: h2 is Fraunces
25px / 600 / 1.32 at `-0.008em`, h3 is Fraunces 20px / 600 / 1.42 at `-0.004em`,
and h4–h6 stay on the reading face. The table above is the custom.scss fallback
scale, which still draws the pages editorial.scss does not reach. Both remain
subordinate to `.article-title`.

**Tracking on the serif is roughly half what it was on the sans.** Every title
surface came down when the face changed — `-0.03em` → `-0.015em` on the post
title and the featured card, `-0.035em` → `-0.018em` on the list titles,
`-0.02em` → `-0.008em` on the rows. Fraunces is already tightly fitted, and the
negative tracking that made Pretendard's wide sidebearings read as one word
closed the serifs into each other.

**Heading weight in the fallback scale is 650, not 700 — and never 700 again.**
Noto Sans KR is a variable face, so 650 and 620 are real weights here. Hangul is a run of
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

**Why these numbers, for Korean set in the reading face:**

- **Measure** — 68ch is ~632px at 17px, about 37 Hangul syllables to the line,
  the top of the 30–40 band Korean sets comfortably in. Only prose takes it;
  `table`, `pre`, `figure` and `blockquote` opt back out to the full 900px box.
- **Leading 1.85** — Hangul is a run of full-width squares with none of the
  ascender/descender rhythm that lets Latin breathe at 1.6, so it wants more.
- **Tracking 0** — the reading face already spaces Hangul correctly. The -0.01em this
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

The post header shares the index vocabulary: the display serif for the title,
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

Shared type roles (families are declared in `quartz/styles/fonts.scss` and every
face is self-hosted — nothing loads from a CDN):

- `--displayFont` / `--headerFont` / `--wordmarkFont` / editorial's `--serif`
  Fraunces: the `jaeunda.log` wordmark, the home masthead h1, post titles,
  list-page titles, post-row titles, the featured title, the `Read next` label,
  and a post's own h2/h3.
- `--bodyFont` Noto Sans KR: paragraphs, descriptions, deks, h4-h6, and the
  readable UI controls — the layer tab labels are 14.5px / 500 on this face,
  because the rail is chrome, not writing.
- `--codeFont` IBM Plex Mono: dates, lengths, counts, tags, eyebrows, the nav
  destinations, the breadcrumb, code and TOC number prefixes.

Fraunces carries no Hangul, so a Korean heading sets its Hangul in Noto Sans KR
and its latin words in the serif. That is intended; see **Typography**.

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

### Top Bar

`SiteNav.tsx`, styled in `editorial.scss` under **Nav**.

**Three destinations, and they are the site's three views of one body of
writing** — not a menu with a "back" on it:

| Item     | Slug         | What it is                              |
| -------- | ------------ | --------------------------------------- |
| `home`   | `/`          | The author's selection, by layer        |
| `posts`  | `tags/`      | Everything, newest first — the timeline |
| `topics` | `tags/topic` | Everything, by subject                  |

`home` is listed even though the wordmark beside it already links there. **A
wordmark reads as identity, not as a destination**, so a reader who had walked
into `topics` had no marked way back and was left with the browser's back
button. Naming it makes the bar a complete set: wherever you are, you can see
the whole site and which part of it you are standing in. The wordmark is not
marked current on the index — `home` carries that, and one place gets one mark.

**Exactly one item is current, always.** `activeSlug` takes the **longest**
matching prefix, because `tags/topic` is also under `tags/` and matching every
prefix lit `posts` and `topics` at once. `normalize` collapses the two spellings
of each page — `tags/` / `tags/index`, and `/` / `index` — to one string; home
becomes the empty string, which is a prefix of nothing, so it lights only on
itself. `aria-current` is `page` on the destination itself and `true` on a page
inside it, such as a leaf topic under `topics`.

**One mark, and it is drawn once.** A 1px olive rule that grows from the left
edge of the word, on `a::after` with `transform: scaleX()`:

- rest — `scaleX(0)`
- hover — `scaleX(1)` in `--line-strong`: you could go here
- current — `scaleX(1)` in `--olive-600`: you are here

It is a bar rather than `text-decoration` because **a rule that arrives is worth
more than one that appears** — `text-decoration-color` can only fade, and the
wipe says which end the word starts at. It is the same gesture the home
chooser's open tab makes, so "here" is drawn one way on the whole site. Under
`prefers-reduced-motion: reduce` the transition is dropped and the bar is simply
drawn; it must never be the motion that makes it visible.

**Do not add a second mark.** `custom.scss` carried a `border-bottom` on the
same links for a long time after `editorial.scss` took the job, so `topics`
printed two olive lines four pixels apart — one under the word at the
`text-decoration` offset and one under the whole link box. That block is colour
only now.

### Footer

`Footer.tsx`. Three things and no more: **what the site is, how to reach the
person who writes it, and one line of credit.**

- **Two columns, aligned at the top.** The first line of each column starts at
  the same height, so the footer has a top edge the eye can find; the note hangs
  under the wordmark and the credit under both. It used to be a name, a role, a
  status line and two links aligned on their _bottoms_ — four heights on the
  left and three on the right, nothing in it lined up with anything else in it.
- **What went, and why.** The status line (`12 posts · last write …`) is a
  changelog. The role is a CV. The name is the same fact as `jaeunda.log`,
  `github.com/jaeunda` and the address, printed a fourth time. A reader at the
  foot of a page is either leaving or looking for a way to get in touch.
- **The destinations come from `components/socialLinks.ts` and nowhere else.**
  `quartz.layout.ts` used to pass the footer its own `links` map, so the site's
  addresses were written down twice and the two lists had already drifted.
- **A mark, then the address in full**, stacked in the second column. Three
  lowercase words — `github linkedin email` — were the right length and the
  wrong thing: they read as three more items of chrome on a page full of
  chrome, and nothing about them said _this is how you reach someone_. An
  address is a fact a reader can act on, and the mark is recognised before the
  text is read. The marks are inline SVG at 15px on `currentColor` (`MARKS` in
  `Footer.tsx`), `--line-strong` at rest and `--olive-600` on hover.
- **No underline, at rest or on hover.** The mark already says these are links,
  and three underlined addresses in a row is a fence. Hover inks the address.
- **The block is right-aligned; its rows share a left edge.** Right-aligning the
  rows themselves stepped the marks and the addresses into a ragged left
  edge — the same fault the old footer had, one column over.
- **The `note` is a list of subjects, not a sentence** — `Linux internals ·
Database concurrency · Network paths`, set in the mono on one line
  (`white-space: nowrap`), for the reader who arrived on a post and has never
  seen the home page. It was `Notes on Linux internals, database concurrency
and network paths.`, which spent its first two words saying what a note is
  and then wrapped.
- **`.footer-mark` is `var(--accent)`** — the same `#4f5e3c` as the nav
  wordmark, verified against the painted pixels. It is the one place on the
  page besides the links where the point colour appears.
- At `$mobile` everything stacks into one left-aligned column.
- `ProfileCard.tsx` still exists because `Explorer.tsx` imports it. It is not
  mounted in `quartz.layout.ts` and nothing renders it.

## Site Shell

A narrow left rail carrying the profile, a horizontal bar at the top of the
content column, and the content. The rail holds identity and nothing else, so it
never competes with the post list.

- `SiteNav` renders the bar: the wordmark plus **three** destinations — `home`,
  `posts`, `topics` — with `Search` beside it in `sharedPageComponents.header`.
  **`Portfolio` is not one of them, and it is not anywhere else either.** See
  **Portfolio Coverage**, and **Top Bar** below for the destinations and the
  current-page mark.
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

### Profile Rail — removed

There is no profile block on any page. `ProfileCard` is not mounted in
`quartz.layout.ts`; the file survives only because `Explorer.tsx` imports it.
Identity is the wordmark and the footer's three addresses — see **Footer**.

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

The home page is a **masthead and one chooser over one grid**:

0. **Masthead** — `content/index.md`'s `h1` tagline and one mono line under it.
   Not part of `HomeStack`. **There is no profile block here**: the author is
   in the footer, on every page, so the first screen belongs to the posts.
1. **Chooser** — one horizontal mono row: `pinned`, then each layer, with
   `all posts →` at the far end. `pinned` is open by default.
2. **Grid** — the open group's posts, three columns, every cell the same cell.

`pinned` is a tab beside the layers rather than a block above them because it is
the same kind of thing — a way of cutting the writing — and a reader picks one
cut at a time. It is also what a layer tab could never give: six posts chosen
across the stack, which is the author's answer to "where do I start".

**Before adding a block here, remove one.** There is no status line: `12 posts ·
last write 2026-06-23` used to open the page, which made a changelog the first
thing a reader saw. The footer prints both figures, where someone who wants them
is looking.

### Home Chooser

`quartz/components/HomeStack.tsx` → `.hs-filter` / `.hs-tab`, drawn by
`editorial.scss`.

- **One mono row, closed by a single `--line-strong` rule.** Each tab is the
  group's name and its count. **No numbers**: the tabs are already printed in
  the stack's order, left to right, so a `01` in front of each one spells out
  what the row's own arrangement says.
- **The open tab is inked and underlined in olive** — the same mark `SiteNav`
  gives the page you are on, so the site has one vocabulary for "here".
- **`all posts →` is not a tab.** Every tab narrows the grid in place; that link
  leaves the page. It sits at the far end of the row, and wraps above the tabs
  below 1100px.
- **The count is what the group holds, not what the grid shows.** A cut group
  prints `9+`: a bare `9` on a tab that opens six would be a wrong number.
- **The layer's blurb is the tab's `title`, not a line printed under the open
  one.** Printed, it moved the grid down by its own height on every switch.
- **`?layer=<id>` opens that tab on load** — the link a post's `PostKicker`
  points at, so a reader who followed `storage engine` lands on the rest of
  the layer they were reading. An unknown id keeps the server-rendered tab.
- `HomeStack` renders **every** panel and marks all but the first `hidden`, so
  the page is correct with no script at all.
- Below 1100px the row scrolls sideways to the viewport edge and the far edge is
  masked. **Its rule moves onto `.hs-tabs` as a background line there**:
  `overflow-x: auto` also clips vertically, so an open tab's mark hanging 1px
  below its own box was cut off and the row read as having no current tab.

### Home Grid

`.hs-grid` / `.hs-cell`, one per panel.

- **`GROUP_LIMIT` is 6.** It is the length of the pinned set the author keeps,
  and six cells is two full rows of the three-column grid — a group that ends
  level rather than on a short row.
- **A pinned post keeps its place in its layer as well.** A layer is the whole
  layer, and being the author's pick is not a reason to be missing from it.
- **Three columns at `$wide`, two below 1100px, one on a phone.** `gap` is
  `0 var(--col-gap)`: **no row gap**, because the next row's top rules are the
  separator. The page is ruled once per row and never twice.
- **Two columns was tried and rolled back.** The longest title the blog carries
  — `Phantom Phenomenon and Index Locking` — measures 381px in the display face
  at 19px, against 317px for a third of the frame and 508px for a half, so two
  columns is the only way to fit every title on one line. It costs more than it
  buys: cards wide enough to read as rows, and six of them in three rows
  instead of two. **Four of the twelve titles wrap here, and that is fine** —
  see the title rule below.
- **The first row of cells has no top border** — the chooser's own rule is that
  row's rule. It is removed with `:nth-child(-n + 3)` and handed back at each
  breakpoint (`:nth-child(3)` at two columns, `:nth-child(n + 2)` at one). Left
  flush, the two rules stack into a 2px line broken by 64px notches wherever the
  column gaps fall.
- **A cell is a hairline, one mono meta line, the title, the description.** No
  box, no tint, no shadow.
- **A card is read title → question → stamp, so it is written in that order.**
  The stamp used to sit above the title, which put two words of chrome in front
  of the one thing a reader is scanning for.
- **The stamp sits at the foot of the cell** (`margin-top: auto`), so a row's
  stamps land on one line. That works because every cell in a row is the same
  height by construction — the title reserves two lines and the description is
  clamped to two — and it needs **`box-sizing: border-box` on
  `.hs-cell-link`**. `a` is `content-box` here, so `height: 100%` sized the
  _content_ to the row and 40px of padding overflowed it: every stamp printed
  38px below its own row, under the next row's rule, reading as the metadata of
  the card beneath it.
- **The stamp is flush left and must not wrap.** A line that takes two rows in
  some cells and one in others breaks that alignment. In `pinned` it is
  `kernel · 63 min`; inside a layer the open tab has already said the layer, so
  it is `63 min` alone — six cells repeating `storage engine` under a tab
  reading `storage engine` is a column of noise down the grid.
- **No date on the grid.** The index is in editorial order, not date order, so a
  date here invites a reading the grid is not making. The archive prints every
  date. `chapters` went with it: in a third of the frame two facts fit, and the
  minutes are the number a reader is deciding on.
- **`.hs-cell-title` wraps, and nothing is reserved for the second line.**
  Those two go together: a wrapped title pushes only its own description down,
  so the gap between a title and the sentence under it is the same in every
  cell. It was the _reserve_ — `min-height: calc(2 * 1.28em)` — that put 25px
  of nothing under every one-line title, not the wrapping. `text-wrap: balance`
  keeps a two-line title from breaking after one word. `.hs-cell-desc` still
  clamps to two lines.
- **Hover is the rule turning olive and the title inking.** Nothing moves and
  nothing fills. On a page of identical cells, a hover that lifts or tints is
  the loudest thing on the screen.

### Home Cell Type

The one place on the site where a Latin serif title sits directly on top of
Korean prose, so the step between them has to be set deliberately.

| Part             | Style                                                  |
| ---------------- | ------------------------------------------------------ |
| `.hs-cell-meta`  | IBM Plex Mono 11.5px, `--faint`, tabular, never wraps  |
| `.hs-cell-title` | Fraunces 19px / 600 / 1.3, `--ink`, `-0.008em`, wraps  |
| `.hs-cell-desc`  | reading face 13px / 400 / 1.7, `--faint`, clamped to 2 |

**The description is one step under the title, in the colour the archive's rows
use.** Two earlier passes each over-corrected in one direction:

- 14px on `--mute` at 1.6 was too heavy. Hangul is a run of full-width squares,
  so the same grey prints visibly more ink than a line of Latin at the same
  size, and the grid read as twelve paragraphs rather than twelve titles with a
  note each.
- 13px on `--faint` at 1.7 was too light. Pushed that far down it read as a
  caption someone had pasted under a headline — too small against a 19px serif,
  too pale, and too loosely set for a two-line block to hold together.

13.5px on `--mute` at 1.62 is the settled value, and **keeping the two apart is
the title's job**: it is 19px, 600 and near-black, so the line under it does not
also have to whisper. Tracking stays at 0 — the reading face spaces Hangul
correctly.

**The archive's rows carry the same relationship** at 14.5px, a half-step larger
because a row is the full measure wide and a cell is a third of it. The two
lists used to set the same sentence at 15px with negative tracking in one and
13px on `--faint` in the other, so a post looked like a different kind of thing
depending on which page you met it on.

**Do not fix a heavy description by lightening the title.** It was tried —
18px/500 on `--body` — and it levelled the cell instead of stepping it.

### First-Screen Motion

See **Mood And Elevation** for the budget these numbers come from.

- **No wash.** `editorial.scss` sets one flat ground on every page, including
  the two radial gradients custom.scss still paints behind the home page.
- **One entrance, two steps, once per document.** `home-rise` is 10px and 500ms
  on `--lift-ease`: masthead and byline together, the chooser and the grid at
  90ms. It was five steps 70ms apart, so the grid — the point of the page —
  waited 280ms to appear.
- **It is gated on `body.home-entering`, which `homeStack.inline.ts` adds on
  the first `nav` event and only the first.** Two bugs die with that class.
  The server-rendered page carries no class, so a browser that never runs the
  animation renders the page finished instead of holding it at `opacity: 0`
  behind a `backwards` fill. And Quartz keeps one document across SPA
  navigation, so without the once-per-document flag a reader coming back from
  a post watched the whole home page reassemble — the animation punished
  exactly the reader who was browsing. A `window.addCleanup` removes it on
  `prenav`; the module-scope flag outlives that.
- **Switching tabs staggers the incoming cells.** `is-swapping` is re-added
  after a forced reflow, which is what restarts a CSS animation. The ladder is
  `nth-child` — safe, because every cell in an open panel is shown — and it is
  **capped at the fourth cell** (`nth-child(n + 4)` shares one delay), because
  an uncapped six-step ladder ran the Storage tab for 420ms, slower than the eye
  that asked for it.

### Home Masthead

The tagline lives in `content/index.md`, as the page body, and is the document's
only `h1`. That is deliberate on both counts:

- It is **copy, so it lives where the author edits copy.** An earlier pass wrote
  the opener as a Korean string inside `HomeStack.tsx` — an invented marketing
  line plus a sentence explaining how to use the filter. Do not put site voice
  in a component.
- `.center > article` is therefore **shown** on index, not hidden. The `<hr>`
  Quartz prints after it stays hidden.

**What the masthead is allowed to claim** is whatever the author's own record
already says. It is checked against four sources, in this order: her career
workbench (`~/_workbench/_master` — the answers and project current-versions she
actually submits), `content/portfolio-it.md`, the GitHub trail, and the twelve
posts themselves.

**Check the wrap by rendering before shipping a new one.** Two lines at 1280,
820 and 500; three at 375, with no orphan on the last line. An earlier sub-line
ended "how the hardware underneath executes it" and left `executes it.` alone on
a 120px line at 500px — one word shorter and it breaks cleanly at every width.
`text-wrap: pretty` is not a substitute for measuring.

`h1` is the display serif at `clamp(30px, 1.2rem + 1.6vw, 40px)` / **600** —
Fraunces has a real 600, and at 40px the step up to 700 is all ink and no more
authority on a line that is already the largest thing on the page. Its `em`
takes the **accent colour, not a weight step and not an italic**: this Fraunces
has a `wght` axis and no italic, and a synthesised slant on a serif at 40px
reads as a rendering fault.

**The sub-line is mono**, 13px on `--mute`, capped at 60ch (12.5px on a phone).
It is the blog reported rather than written — the subjects, as a list — so it
takes the same voice as the nav, the metadata and the footer's colophon, and it
stops competing with the serif statement above it for the same job. It was the
reading face at 17px, which read as a second, quieter statement. It is always
English, so nothing in it can fall out of the mono.

**The `em` takes its own line** (`display: block`). Left to wrap, the statement
set on one line at desktop and broke after "from" on a phone — a different
shape at every width, and at two of them the break fell inside the phrase the
colour is marking. Two lines with the accent on the second is the masthead's
shape, and `content/index.md` decides where it falls by where it puts the
`_…_`.

**The copy answers to the author's own record.** The current line is the blog's
side of her GitHub profile README — _"Deterministic cores for nondeterministic
systems. Concurrency and uncertainty are given."_ — turned from building to
reading:

> Mechanism before description, _evidence before assertion._
>
> The same order at every layer, from a page table to a distributed
> transaction.

**It states the author's position, not the blog's contents.** `Mechanism before
description, evidence before assertion.` is the order she works in; the site is
one place that order is applied. Every version that described the page instead
— `How systems work, and why.`, `The mechanism behind the behaviour, worked out
in full.` — was accurate and interchangeable with any other systems blog,
because a description of the contents is not a position.

**It names nothing outside the page.** No projects, no repositories, no
`GitHub`, and not the word `deterministic`. Two versions broke this and both
were wrong in the same way: naming `weavegate` and `WeaveTrail` in the sub-line
turned the top of a reading page into a portfolio index, and `Deterministic
answers from nondeterministic systems.` is her GitHub profile line verbatim,
which reads as a banner over a product.

**The thread that runs through her engineering work is present as the position
itself**, which is why nothing has to point at it. `evidence before assertion`
is the same stance her tools take, said in words that belong to the page. A
reader who later finds the repositories will recognise it. **That recognition
is the whole of the connection this page is allowed to make.**

**A noun phrase, not a sentence.** Two parallel phrases, `Mechanism before
description` and `evidence before assertion`, with the second taking the
accent. A masthead that forms a complete sentence starts arguing, and every
version of this line that did — `“It works” is not an explanation.`,
`Concurrency and failure are the normal case.` — was rejected for exactly that.
A noun phrase states and stops.

**`before`, not `over`.** `over` states a preference; `before` states an order
of work, which is what the sub-line then confirms (`The order I work in`). The
two halves have to agree about what kind of claim they are making.

**Three rules the copy on this page follows:**

1. A noun phrase in the headline.
2. One sentence under it, and only one.
3. **No em dashes anywhere in the masthead.** An em dash is an aside, and there
   is no room for an aside in three lines of copy. Use a full stop and start
   again, or cut the clause.

**Six versions were rejected first, and the faults are worth keeping** because
they are the five obvious ways to write this badly:

| Version                                                          | Fault                                                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Reading systems from the mechanism up.`                         | A gerund opening describes an activity instead of saying anything.                                                                                        |
| `Concurrency and failure are the normal case.`                   | A premise the reader can agree with while learning nothing; the second half lands nowhere.                                                                |
| `Operating systems, databases, networks, down to the mechanism.` | A list of fields reads as a table of contents.                                                                                                            |
| `“It works” is not an explanation. Finding the mechanism is.`    | Clever. A masthead that argues with the reader is doing something other than telling them where they are.                                                 |
| `How systems work, and why.`                                     | Plain, and generic — any systems blog could have written it. Clarity is not the only requirement; the line has to be **this** author's.                   |
| `Deterministic answers from nondeterministic systems.`           | The author's own framing, and right — but lifted from her GitHub profile it reads as a product banner rather than as the top of a page someone writes on. |

**The sub-line is one sentence that holds up the headline, and nothing more.**
It says the position is invariant (`the same order at every layer`) and gives
its range without listing fields: `a page table` and `a distributed
transaction` are the two ends of the stack the chooser row below divides into
five. `every layer` is that row's own word.

**No `I`, no `this blog`, no `each post`.** A version with `The order I work
in` was dropped for the first, and several earlier ones for the second and
third: a masthead that narrates the page or its author is doing something other
than stating a position. The line is written with no subject at all, which is
what makes it read as a standing fact rather than as an introduction.

It has also been a slogan, a portfolio index naming the author's repositories,
and a four-line paragraph with parenthetical examples, and was wrong every
time. **No project names, no repositories, no "on GitHub".** Width is 62ch,
which sets it on two lines.

**The sizes are measured, not chosen.** `max-width` is in the h1's own `em`, so
a number that fits at one size clips the headline inside its own first line at
another: at 44px, 22em is 968px against 685px for the longest line. **Re-measure
the first line and check the break at 1440, 1000 and 390 after editing this
copy** — on a phone the first clause takes two lines and the accent clause must
still land whole on its own.

**The index page grid places nothing explicitly**, and must not start: with the
byline in the footer there is no second column to place anything into. Naming
rows for the masthead and the chooser but not for the bar once left `header`
and Quartz's empty `.page-header > .popover-hint` to auto-placement, which
dropped them on top of the chooser and opened the page with no navigation above
it. **Name every row of a grid or none of them.** The hint is `display: none`
on the index, since `beforeBody` renders nothing there.

`rehype-autolink-headings` appends an anchor to every heading, revealed on hover
by `base.scss`; it is `display: none` here, since the site's one statement
should not link to itself.

### Post Header

Three lines, and nothing above the title:

```
Phantom Phenomenon and Index Locking        ← .article-title, Fraunces 32px/700
존재하는 행을 모두 잠가도 없던 행이…             ← .post-dek, 15.5px --mute
storage engine · 2026-04-20 · 4 chapters · 14 min   ← .content-meta, mono 12.5px
```

- **The layer is the first segment of the metadata line**, and the only one
  that is a link — back to its tab on the home page (`?layer=<id>`). It had a
  row of its own above the title (`PostKicker`, printing the layer _and_ the
  blurb it carries on the home chooser), with the date and length under the
  title and a `#topic` chip under that: **three rows of classification around
  one title, in three different shapes, before a word of the writing.** The
  layer is a fact about the post and belongs with the other facts, in the same
  mono voice and the same order the home cells print them.
- **`PostKicker` is deleted** and `TagList` is no longer mounted. The topic
  chip was a taxonomy the reader of a single post had not asked for, and
  `Topics` is a destination in the bar for anyone who has. `TagList.tsx`
  survives because `.design-sync` previews import it.
- **`.article-title` is `clamp(24px, …, 32px)`.** The measure is 680px and the
  longest title sets 652px at 32px — one line, which is what a headline should
  be. At 44px it ran 897px and broke mid-noun-phrase on half the posts.
- **`.post-dek` is 15.5px**, a step under the title rather than a subtitle
  beside it. At 18px against a 32px title it was competing.
- **The header closes with its own hairline**, declared on
  `#{$is-post} .page-header > .popover-hint` — 18px of padding, a 1px `--line`
  rule, 34px before the first `##`. It is declared rather than inherited
  because it used to come off the bottom margin of the topic-chip list, so
  unmounting that list took the header's closing edge with it. Below the rail
  breakpoint the compact outline is the header's last line and brings its own
  bottom rule, so the wrapper drops both there — `:has(> .compact-toc)` matches
  at **every** width (the element is in the DOM at desktop, only `display:
none`), which is why that override has to stay inside `@media #{$rail-down}`.

### Post Descriptions

`description` is the one-line hook under a title, and it is read on the home
card, every listing, `ReadNext` and the page's `<meta>`. It is prose the author
signs, so it follows the blog's plain `~다` voice, not the portfolio's `합니다`.

**A rhetorical question only where the post asks one.** Six of the twelve open
on a question of their own — Virtual Memory (`왜 주소 공간이 필요한가`), WAL and
ARIES (`커밋했는데 서버가 꺼지면?`), Kubernetes Packet Flow, Database Deadlocks,
Linux Transport Layer Internals and CORS — and those take the question form.
The other six are expositions and take a plain summary. Putting every one in the
interrogative made the grid read as a quiz and told a reader nothing about which
posts are arguments and which are reference.

**No commas, in either form.** A comma is a second clause and a second clause is
a second line; comma-free is what keeps these to one line in a third of the
frame. The longest is 43 characters.

**A summary covers the post, not its most quotable section.** Three failed that
on review and were rewritten:

- Database Deadlocks summarised only `Deadlock Resolution → Select a victim`,
  the last quarter of a post that also prevents and detects them.
- Transaction Isolation said the reader trades "정확성" for performance, which is
  an interpretation laid over a post that mostly states what each level permits.
- Virtual Memory asked how far the kernel `다녀오는가` — a metaphor doing work the
  post does plainly, and the post is about translation and swap, not a journey.

**Plain over clever.** These sit under a title in a 317px column and are read
while deciding what to open; a summary that has to be unpacked has already
failed. The other nine were checked against their own outlines and left alone.

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

**The subjects are ordered by the pinned set, not by post count.** Sorted by
count the strip opened on whichever subject had accumulated the most writing —
the same mistake the home page's layer order made before `LAYERS` fixed it. The
`topic/` tags carried by the six pinned posts come first, in `pinOrder`, and
everything else follows by count. Changing the order means changing which posts
are pinned, which is an editorial decision rather than an arithmetic one.

**A chip click must call `event.stopPropagation()`, not only
`preventDefault()`.** Quartz's SPA router listens for clicks on `window` in the
**bubble** phase, and `getOpts` in `spa.inline.ts` never looks at
`defaultPrevented` — so a handler on the chip runs first, cancels the default,
and the router is still reached and navigates to the subject's own page. The
panel switched in place for exactly as long as it took the router to answer.
This applies to **any** in-page interception of a link click on this site.

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

### Systems Portfolio

`content/portfolio-systems/` is the second portfolio, and the first with more
than one page. It is not written for one employer: no company, role or
application document is named anywhere in it.

- `index.md` (`/portfolio-systems/`) is the overview: hero with the three
  project cards, then Foundation (major projects and courses) directly below
  the fold, then stack and profile. Nothing on it goes deeper than a card.
- One detail page per project, in this order: `teampo`, `weavegate`, `ongi`.
  A fourth page, `foundation`, covers the Linux system programming, kernel
  and education work. The order puts service and AI↔backend integration
  first, verification second and device integration third. The cards, the
  top bar and the `.ps-pager` all follow it.
- Detail pages lead with the result's architecture, then 문제, then `.ps-why`
  design-judgment cards (condition → decision → effect, with the PR or source
  as evidence), then verification and open items. The overview surfaces only
  each project's four-stop architecture (`.ps-mini`) and two proof lines;
  everything else lives on the detail page, and nothing is dropped there.
- Titles lead with what the project is (`DB 동시성 오류 검증 자동화 도구`); the
  proper name (`weavegate`) sits in the smaller `.ps-name` line.
- Pages add the `portfolio-systems` cssclass next to `portfolio-shell` and
  reuse the `.pf-*` components. Tokens are overridden in
  `quartz/styles/portfolio-systems.scss`, scoped to `.portfolio-systems`:
  white page, navy accent `#1d3a6e` and ink `#111418`. Cards use the IT
  portfolio's soft edges: `--ps-card-line` borders, `--pf-shadow` and 10–12px
  radii. Black `--ps-rule` is kept for section rules only. Titles are set in
  Pretendard. `.ps-*` components exist only here.
- An unlisted folder has no folder page (FolderPage only sees listed files),
  so `contentPage.tsx` renders an unlisted `index.md` itself.

### 4DPLEX Portfolio

`portfolio-4dplex/` is the third portfolio and the first that is **not a Quartz
page**. It is a standalone Vite + React + TypeScript app with its own
`package.json`, built to `portfolio-4dplex/dist` and copied into
`public/portfolio-4dplex/` by `.github/workflows/deploy.yml` after the Quartz
build, so it is served at `/portfolio-4dplex/`. Its README holds the run, build
and deploy steps.

- It is written for one employer and role, which the systems portfolio
  deliberately is not. The home page (`/portfolio-4dplex/`) is the first screen
  that states the whole case, with the profile below it. Each project is its
  own page (`/ongi/`, `/weavegate/`, `/cuda/`, `/foundation/`), opened from the
  home cards or the top bar, and carries a way back and a previous/next pager.
  Within a page, detail is added on selection (`StepExplorer`, `Tabs`,
  `ControlPath`, native `<details>`); interaction only adds detail and nothing
  is hidden behind it.
- A project page reads in one order, and the page shows it: header (name,
  what it is, one message, facts) → a three-fact summary → a contents row of
  numbered links → numbered blocks → a closing block that ties the work to the
  role → the pager. Evidence comes before implementation detail (results sit
  above code), and second-layer material is folded into `<details>`.
- It shares none of the blog's or the other portfolios' CSS. Tokens live in
  `portfolio-4dplex/src/styles/global.css`: a deep plane (`--deep` `#0a1017`,
  `--signal` `#62d5e8`) for the overview and footer, a reading plane (`--paper`
  `#f4f5f3`, `--ink` `#10161d`, `--accent` `#0a6a82`) for every detail section,
  and `--fail` / `--pass` for verification results only.
- Type is the portfolio set: Pretendard for Korean and prose, Space Grotesk for
  latin display and numbers, IBM Plex Mono for English labels and code. Mono
  does not carry Korean labels. The font files are copies under
  `portfolio-4dplex/static/fonts/`; the Pretendard subset there is cut from
  `portfolio-4dplex/scripts/font-chars.txt`, and the build fails if the copy
  uses a character outside it.
- Like the other portfolios it is unlinked: nothing on the blog points to it.
- The root `tsconfig.json` and `.prettierignore` exclude the directory, because
  it has its own React JSX settings and build output.

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

### 2026-09-22 (reading pass: one tone, outline right, body spec)

- **Layer hues** collapsed to one tone (olive 700 on 50). The five colours had
  read as a rainbow.
- **Post outline** moved to the right, and the post now starts at the logo's
  edge.
- **Home layer stack** moved to the left of the index.
- **Sticky fix.** The sticky stack had overlapped the footer at 1280×720
  (a grid item is not clamped to its cell). The column now stretches to its
  row, and its head and tabs stick inside it.
- **Markdown body** was rewritten from a posting-layout specialist's review;
  see blueprint section 6. The spec:
  - 17px / 1.7 text, 1R paragraph gaps and the 1R rhythm unit.
  - A 680px measure shared by every block.
  - No gradients, highlighter or shadows.
  - Native list markers.
  - `fit-content` tables.
  - Bare `pre` fences as diagram plates.
- **Footer.** Removed RSS from the links. Removed a stray 24px `margin-bottom`
  on the footer band's `::before`, which had left a strip below it.
- **Copy.** The tagline is now "Understanding systems _from the mechanism
  up._". The sub-line and footer note were rewritten from the portfolio and
  the posts, with no em dashes. "write-ahead logs" became "recovery logs" so
  the line cannot break at a hyphen.
- **Topics chips** were tightened so the nine topics fit on one row at 1440px.

### 2026-09-22 (calm colour and a review pass)

- The author liked the third pass but asked for calmer colour: a less warm
  ground, and a modern, professional mood that suits the posts' subject
  matter.
  - Every token moved down in chroma. The ground went from `#f8f8f4` to
    `#f6f7f6`, and the accent from `#56692b` to `#4d5f3a`.
  - The layer hues were re-tuned to one lightness and low chroma.
  - `faint` darkened to `#6a726c`, which is 4.6:1.
  - The home glow was removed and the dots made fainter.
- **Featured card.** The forest-green block stood out too much against the
  page. It is now a white card with a sage wash, an olive ring and a solid
  olive button. The ASCII diagram is kept in a small dark terminal plate, as
  the one focal point.
- **Post titles.** They drop from `clamp(2.3rem…3.4rem)` to
  `clamp(1.75rem…2.6rem)`, so the longest title no longer wraps at desktop.
  The tagline caps at 3.6rem and list titles at 3rem.
- **Review fixes.**
  - The post footer band was offset; it now spans the frame.
  - The 404 page no longer inherits the post layout.
  - Added a focus-visible ring.
  - Hover lifts now respect reduced motion.
  - The featured card's footer runs on one row.
- Portfolio is re-verified pixel-identical to `HEAD`.

### 2026-09-22 (third pass: a used frame, colour, softer type)

- Two passes the same day were withdrawn:
  - **1180px wide editorial:** the width was left as air.
  - **760px reading axis:** it felt empty, the colour was unchanged, mono was
    everywhere, and the markdown body was still plain.
- The author asked to keep the atmosphere and make it modern and refined:
  moderately wide, real colour, no stiff faces, and a markdown body with
  character. See `references/blueprint-2026-09.md`.
- **Frame.** 1080px.
  - Home: a two-column hero (masthead | forest featured card), then the index
    beside a sticky vertical layer stack.
  - Posts: a 220px rail, a 64px gap, then the post, with prose at a 720px
    measure. Below 1200px the page narrows to 800px.
  - Rows are laid out by container query.
- **Colour.**
  - The olive scale replaces the single `#4f5e3c`. The accent is now `#56692b`,
    and `quartz.config.ts` follows it.
  - Five muted layer hues, set through `data-layer`.
  - One dark surface: the featured card.
  - A dot-grid home ground.
  - The Shiki theme is `vitesse-light`.
- **Type.** Mono is now used for code only; about 25 UI selectors moved to
  Pretendard with tabular figures. Fraunces extends to post titles, list
  titles, the featured title and `Read next`.
- **Markdown body.**
  - An h2 bar instead of a rule.
  - A highlighter on bold.
  - Sage inline code.
  - Code sheets with a language bar.
  - Tinted ASCII plates.
  - Tables with horizontal rules only.
  - A blockquote panel.
  - Olive list markers.
  - A three-dot hr.
- **Components.**
  - `PostKicker` replaces the post breadcrumb and links to `/?layer=<id>`.
  - `Footer` takes an optional `note`.
  - `PostRow` always sets `data-layer` and gained a side slot.
  - The tagline's second half is `_emphasis_` in `content/index.md`, set in
    olive.
- **Portfolio.** It stays on the old reading pass
  (`$readability-experiment-enabled: true`), and `$post` excludes unlisted
  pages. It was verified pixel-identical to `HEAD`.

### 2026-09-22 (fourth pass: console, ruled not raised)

The author asked to merge the monotone console feel of `1862d25` with the
third pass, so the site looks authored rather than generated, and noted a
personal liking for console type in English. A panel reviewed both versions
(three senior and three junior designers, a Linux/SRE engineer, a Hangul
typographer; two QA reviewers after the build). Their consensus:

- **Why.** The third pass used the stock vocabulary of generated sites: a
  two-tone serif hero, a white shadowed card with a `Featured post` pill and a
  filled `Read this first →` button, a dot grid, 999px pills everywhere, and
  eight radius values. `1862d25` read as a person because its English chrome
  was mono and its surfaces were flat. The third pass kept the better
  information architecture (layers, rows, outline, body rhythm).
- **Type splits by who is speaking.** Hangul and anything a reader reads stays
  Pretendard. Anything a program could have printed moves to IBM Plex Mono,
  a step smaller and with no negative tracking: dates, counts, lengths, tags,
  nav, labels, layer and outline numbers, the key/value ledger, the footer.
  The two never share a run of text. Fraunces signs the wordmark and the
  titles only. This reverses "mono for code only" from the third pass.
- **Ruled, not raised.** No resting shadows and no hover lifts; radius 0 for
  structure, 3px (`--r`) for code, inline code and topic chips. Emphasis is a
  rule: a 2px ink rule opens the pinned post and `Read next`, a 2px olive rule
  marks the open layer, the current outline chapter and the open layer on a
  phone. The dot grid is gone. Rule 7's two resting cards are now zero.
- **Home.** The masthead h1 is mono in one colour, with the thesis carried by
  weight (as `1862d25` did with bold). The profile is the old ledger again
  (`github  github.com/jaeunda`), with the key taken from the link's
  `aria-label`. The pinned post is a ruled spread with a mono label strip
  (`pinned … kernel`), a flat ASCII figure on a 1px olive rule, and a mono
  `read →` link. Layers are a flat `lsblk`-like list with right-aligned
  counts and are labelled `LAYERS`.
- **Post.** The kicker is a mono path segment (`01 kernel`), the meta and tags
  are bare mono, the outline hangs off one hairline with an olive rule on the
  current chapter, code labels are lowercase (`c`, `sql`, `sh`), tables are
  ruled like a reference table, and blockquotes are a rule and an indent.
- **Honest numbers.** `lengthLabel` always prints minutes (`63 min`); the
  `long read` substitution is gone. The footer's status line reports the posts
  themselves (`12 posts · last write 2026-06-23`) ahead of the build credit.
- **Rejected on purpose.** Man-page section heads, `$` prompts, blinking
  cursors, green-on-black and `[brackets]` around counts. The panel's external
  engineer called these costume, so the console voice comes from type and
  alignment only.
- **Deferred.** Mono spans for heading numbers (`1.1.`) need a rehype step, and
  depth-1 outline entries under the current chapter need a `toc.inline.ts`
  change.

### 2026-09-22 (clear pass: cool ground, deeper olive, one-screen home)

Author feedback on the console pass: a less warm, clearer ground; a deeper
olive accent; less on the first screen, ideally everything the home page means
to show visible without scrolling; the profile set kept but repositioned and
smaller, with the name in English; faint vertical rules in body tables.

- **Colour.** Neutrals lose their green tint: ground `#f8f9f9`, line
  `#e2e5e5`, ink `#111516`, body `#2d3333`, mute `#565e5e` (6.3:1), faint
  `#616969` (5.3:1; 5.0:1 on olive-50). The olive scale moves deeper and
  slightly more yellow, away from sage: accent olive-600 `#44552a` (7.7:1),
  700 `#364420`, 800 `#2a3518`. `quartz.config.ts` follows.
- **One screen.** At 1440×800 the masthead, the profile, the pinned post, the
  whole layer list and the first index row are visible without scrolling; at
  1280×720 all but the last layer row. How: the masthead dek is its first
  sentence only; only the open layer prints its blurb; the profile ledger is
  340px wide with 5px rows; the nav gap and the hero/index divider scale with
  the viewport height (`clamp(…vh…)`).
- **Profile.** `Daeun Jang` replaces `장다은`, so the byline is Latin like the
  rest of the chrome. It stays under the masthead, where the hero's flexible
  row gives it room beside the taller pinned post.
- **Tables.** Columns get a 1px `#edf0f0` vertical rule, a shade lighter than
  the row rules; the outer edges stay open and flush with the text.

### 2026-09-22 (balance pass: rail and index, two type families)

Author feedback on the clear pass: the intro held too much while the post list
looked empty for its width; balance the page, maximise the craft without
losing the developer feel, and treat type as central. A visual-design and a
typography consultant were asked, and reference sites (paco.me, brandur.org,
antfu.me) were reviewed.

- **Why.** The hero stacked five blocks in two columns with a dead 275px
  gutter, three display voices (mono h1, Pretendard dek, Fraunces pinned
  title) within 300px, and an index that showed two rows, one of them the
  pinned post already printed above. Chrome outweighed content.
- **Layout.** Home is rail 240 | gap 64 | main 776 from 1100px. The rail holds
  the profile (stacked: name, role, ledger) and the layer filter (sticky). The
  main column holds a mono status line (`12 posts · last write …`), the
  masthead, the pinned post as one wide feature (words left, ASCII figure
  right), then the index. Below 1100px it is one column ordered status →
  masthead → pinned → layers → index → profile. `.home-stack` is
  `display: contents` at every width.
- **Index.** `All` is a tab and the default, so every post shows; a layer tab
  narrows it and `?layer=` still works. Rows are grouped by layer in `LAYERS`
  order, then editorial rank. Rows go three-column from 680px of their own
  width (date 100 | title+desc | layer+length 150), print the layer, and clamp
  the description to one line on the home page. The `all N posts →` archive
  link is gone; `All` does its job.
- **Type.** Two families plus a signature. Pretendard for everything read and
  every title (700, tight tracking), IBM Plex Mono for the machine voice with
  500 added as the UI emphasis, and Fraunces for the wordmark alone. Plex Mono
  is now subset from the full IBM files with arrows (`→`) included. Fraunces
  titles over a pale ground with mono labels had become a common signature of
  generated sites, and they split titles between two faces. The 404 code is
  mono.

### 2026-09-22 (round 3 consults integrated)

The round 3 visual-design and typography consultations (home redesign) are
applied in full where they had not already landed with the balance pass.
Where they conflict with the review pass below, the consults win, except as
noted.

- **Masthead back to mono.** The review pass's two-tone Pretendard 700 hero
  broke the panel's unanimous "no two-tone hero" call and the typographer's
  spec. It is Plex Mono again: 26→34px, 400 then `em` 600, line 1.2,
  -0.02em, one colour (ink). Dek 17px / 1.65 / -0.005em.
- **Pinned row kept.** The pinned post keeps its index row, marked `pinned`
  (mono, olive) beside its length, so a layer is the whole layer and the
  count on its tab stays true. `data-pinned` and the hide logic are gone.
- **Filter toggles off.** Clicking the open layer again returns to `all`.
- **Role table.** Nav 13px. `LAYERS` / `OUTLINE` / backlinks labels 500.
  Post h1 32→44px / 700 / 1.18 / -0.03em. h3 19px / 650 / 1.45. Row title
  19px / 650 / 1.35, row description 15px. Dates and meta 12.5px, tags 12px,
  footer note 12px. Inline code 0.88em with 0.35em side padding; code blocks
  line-height 1.65. Ledger value 500 over a 400 key.
- **Weights.** 400 / 500 / 600 / 650 / 700. 650 returns for h3 and row
  titles, as the typographer specified. The variable face sets it exactly.
- **Not adopted, and why:**
  - Plex Mono wordmark: the Fraunces olive logo is an author constraint.
  - Dropping Space Grotesk: the portfolio pages still use it.
  - Body 16.5 / 1.8: the body was set at 17 / 1.7 by the posting-layout
    review after the author found 1.85 too airy. The home consult is not a
    reason to undo that.
  - Labels at 11.5px: mono stays ≥12px (clear pass).
  - Ledger at 13px: the longest address wraps in the 240px rail. It is
    12.5px, with the key at 12px in a 58px column.
  - The four-column row (date | title | layer | length): the review pass's
    layer group headings carry the layer, and title-first rows keep the
    editorial order from reading as shuffled dates.
  - `~/` in the status line: the typographer calls it tacky.

### 2026-09-22 (review pass: reading order, one right edge, weight ladder)

Author brief: a design and QA review of the whole blog — layout, type, colour,
UX — keeping the concept but simpler and more refined, with the eye led
through each page and particular care for type weight and the reading body.

- **Why.** Screenshots at 1440 and 390 showed: the masthead set in mono at 400
  and 600, which read as two phrases and competed with the pinned title; the
  pinned post printed twice in a row (feature, then the first index row); a
  date down the left edge of every index row, where the eye enters, in an
  order that is editorial and so read as shuffled dates; six layer names at
  600 in the rail competing with the titles; a post column of 796px with
  prose at 680, so the header rule and Read next ended 116px past the text;
  64px under the tags from Quartz's list margin; no line between a post's
  title and its first paragraph saying what the post is for.
- **Reading order, home.** Masthead → pinned → index. The masthead is
  Pretendard 700 at up to 2.4rem, lead-in in `--faint`, the `em` in ink — the
  one large type on the page. The index is grouped under layer headings
  (`01 kernel ……… Memory and scheduling`, `h2.hs-group-head`), so rows no
  longer print their layer. The pinned post's row carries `data-pinned` and
  is hidden while `all` is open; opening its layer brings it back. A group
  with nothing visible hides with it (`homeStack.inline.ts`).
- **Rows, title first.** On the home index and in Read next the title takes
  the left edge (shared with the pinned title) and date + length sit right
  from 560px of the list's width, under the words below that. The archive
  keeps its date column: it is a timeline.
- **Post, one right edge.** `--measure` is 680px and is the post column
  itself; the gap to the outline takes the remainder, and `--rail` is 240.
  Below 1200px the frame is the measure. The compact outline sits between
  its own hairline and the header rule.
- **Dek.** `PostDek` prints the post's own `description` frontmatter under the
  title (18px, 400, `--mute`; 16.5px on a phone) — never Quartz's
  auto-description.
- **Weight ladder.** 400 reading text · 500 UI emphasis (rail names, group
  names) · 600 strong, h3–h6, row titles, the open layer, the byline name ·
  700 page titles, the masthead, the pinned title, h2. The 650 steps are
  gone: Pretendard has no named instance there, and two nearly equal bolds
  blurred the ladder.
- **Body theory kept.** 17px / 1.7 on a 680px measure (~40 Hangul syllables,
  inside the 35–45 range), paragraph gap 1R so paragraphs separate more than
  lines, headings closer to what follows than to what precedes, `keep-all`
  with `line-break: strict` and `text-wrap: pretty`, off-black `#262c2c` on
  `#f8f9f9`, underlined links.

### 2026-09-21

- Added the systems portfolio as an overview plus four detail pages under
  `content/portfolio-systems/`. The overview stays short enough to take in at
  once and every card routes to a page that opens on the design reasoning, so
  depth costs a click instead of a long scroll. See **Systems Portfolio**.
- `contentPage.tsx` now emits an unlisted folder `index.md`, which previously
  had no emitter at all.
- Added the new copy's characters to the Pretendard subset.
- Softened cards to the IT portfolio's radius, border and shadow; black now
  marks section rules only.
- Reordered the projects to collaboration platform → verification tool →
  IoT service, so a reader meets application and backend work first and
  embedded integration second. Detail pages now open on architecture.

### 2026-09-23 (type and palette restored to the site's own)

Author's brief: go back to the design frame the blog had at `1862d25`, keep the
dark-mode removal, keep the posts/topics taxonomy that replaced the tag cloud,
and carry the improvements built since then over into it. Scope, after the
brief was narrowed: **type and colour only** — the shell (SiteNav, HomeStack,
the outline rail, the row vocabulary) is the current one and does not move.

**What changed**

- **Fraunces is the display face again, for the whole blog.** It had been cut
  back to the wordmark alone during the console pass, with Pretendard 700
  setting every title. It now sets the wordmark, the home masthead h1, post
  titles, list-page titles, post-row titles, the featured title, the
  `Read next` label and a post's own h2/h3. `quartz.config.ts` `header` is
  Fraunces; `--displayFont`, `--headerFont`, `--wordmarkFont` and editorial's
  `--serif` all resolve to it.
- **Noto Sans KR sets the prose again**, in place of Pretendard, which is now
  declared for the unlisted portfolio pages only. `quartz.config.ts` `body` is
  Noto Sans KR.
- **The palette went back to the warm green-grey family**: ground `#fafaf8`,
  line `#e3e4df`, mute `#5f6259`, body `#33362f`, ink `#1a1d17`, accent
  `#4f5e3c`. The olive scale is re-cut around that accent and `--olive-100` is
  the original `textHighlight` `#dde3d4`. `--plate` is `#eceee5`, the reading
  surface. The stray cool literals inside `editorial.scss` (`#262c2c`,
  `#f4f6f6`, `#b3b9b9`, `#eaeded`, `#edf0f0`) went with them.
- **Tracking came down roughly by half on every title surface**, because the
  numbers were fitted to a sans: `-0.03em` → `-0.015em` on the post title and
  the featured card, `-0.035em` → `-0.018em` on list titles, `-0.02em` →
  `-0.008em` on rows, `-0.02em` → `-0.008em` on h2.
- **The home masthead left the mono.** It is Fraunces `clamp(30px, 40px)` / 700,
  and its `em` is the accent rather than a weight step: this Fraunces has a
  `wght` axis and no italic, and a synthesised slant on a serif at 40px reads
  as a rendering fault.
- Fonts: `fraunces-wordmark.woff2` (basic latin, eleven letters' worth) is
  replaced by `fraunces-latin.woff2` (full latin, 36KB), and
  `noto-sans-kr-subset.woff2` (188KB) is cut from Google's variable file with
  the same charset the Pretendard subset uses. Both self-hosted;
  `fontOrigin` stays `local`.

**Why**

- The nine colours here were never only the blog's: `styles/portfolio.scss`
  hard-codes `#fafaf8` / `#1a1d17` / `#4f5e3c` / `#e3e4df` as `--pf-*`, because
  that page is light-only and cannot read a theme. Moving the blog to a cool
  grey set printed the two halves of one site in two different greens, and the
  portfolio is the half that could not follow.
- The console pass's argument for dropping Fraunces was that a title must not
  mix two faces mid-line. That is true of a sans and a sans. A serif display
  face beside a Korean text face is a pairing, not a fallback failure — it is
  what the site's headings looked like for its whole life before the pass, and
  it is what distinguishes a title from the paragraph under it at a glance,
  which weight alone was not doing.

**What deliberately did not change**

- No dark mode. The removal stays complete; see **No Dark Mode**.
- The tag cloud, the tag index and the `homeFilter` / `tagIndexFilter` scripts
  stay deleted. Navigation is `posts` and `topics`, and `topic/` frontmatter
  tags feed the topic switcher; `project/` tags stay invisible to readers.
- `SiteNav`, `HomeStack`, `PostRow`, `PostKicker`, `PostDek`, `ReadNext`,
  `CompactToc`, the editorial rank ordering and the `chapters · min` length
  label are all current work and were kept as they are.
- The unlisted portfolio pages are untouched: they keep Pretendard, Space
  Grotesk and their own literals, and they render identically before and after.
- `vitesse-light` stays the syntax theme for both keys.

### 2026-09-23 (the home page as one grid; a ground set for reading)

Two notes from the author, in one pass.

**1. "Make the main page that plain grid form — take it as a reference, not a
copy, and make it minimal and plain but simple and refined."** The reference is
the 2×n bordered card grid the home page carried at `1862d25`.

The home page is now a masthead and one grid, and nothing else. See **Home
Page**, **Home Grid** and **Home Filter** for the contract; the reasoning:

- **What was taken from the old grid:** that every cell is the same cell. That
  was its whole virtue — nothing on the page was arguing to be read first.
- **What was not:** the 1px bordered box on each card. Twelve boxes is twelve
  rectangles competing with the type inside them. A cell is opened by a single
  hairline now, rows have no vertical gap, and the next row's rules are the
  separator — the page is ruled once per row and never twice.
- **Three columns, not two.** Twelve posts make four clean rows; at two columns
  the same twelve are six rows of tall cells, which is a list wearing a grid's
  clothes.
- **The featured hero and the five headed groups are gone.** A hero two type
  sizes larger above an index broken into sections is three layouts on one
  screen: the page decided for the reader and then changed its mind twice on
  the way down. The pinned post is a cell like the others, marked `pinned` in
  its meta line.
- **The 240px rail is gone.** Two columns is a claim that the site has two
  subjects. It has one. The filter is a mono row above the grid; the byline is
  two lines under the masthead, with the ledger's keys dropped (they survive as
  the links' accessible names).
- **The date left the grid.** The index is in editorial order, not date order,
  so a date invites a reading the grid is not making — and two facts is what
  fits on one line in a third of the frame. `chapters` went with it. Both are
  still on the archive, where the list _is_ a timeline.
- Two alignment devices do the rest: the title reserves two lines and the
  description clamps to two, so every description in a row starts at the same
  height. Both are released at phone width, where there is one column.

Deleted with it: `.hs-featured*`, `.hs-layers*`, `.hs-layer*`, `.hs-group*` and
`.hs-index` — 517 lines from `custom.scss` and ~650 from `editorial.scss`.
`homeStack.inline.ts` now filters `.hs-cell` and knows nothing about groups.

**2. "I didn't mean change the background — keep the point colour and set the
background to maximise readability."** Fair: the 2026-09-23 type-and-palette
entry above moved the ground as part of a revert rather than as a decision.

Olive `#4f5e3c` stays as the one point colour. The neutrals are now chosen for
contrast and are hue-free: ground `#fbfbfa`, ink `#191a18` (16.9:1), body
`#2b2d2a` (13.4:1), mute `#5c5f5a` (6.3:1), line `#e5e6e2`, plate `#f1f2ef`.
The cream ground tinted every grey standing on it, which put the page's one
colour in competition with its greys; a near-white ground a shade off pure
white keeps the contrast without the glare of `#ffffff` under a sixty-minute
post. `--reading-surface` is `#f1f2ef` to match `--plate`, and the olive-tinted
ASCII plate (`--olive-50`) stays — it is what tells a diagram from a program.

The portfolio pages keep their own literals and are unchanged. They share the
accent and no longer share the neutrals, which is correct: that page is a
printed sheet, the blog is a reading surface.

### 2026-09-23 (the home index as sections; the cells de-emphasised)

Author's note: show `Pinned` and then each layer, with a way to all posts on the
right; six pinned, and no more than six per layer; and take some of the weight
out of the posts.

**Sections replaced the filter.** The home page had one grid of all twelve posts
under a row of layer tabs. The filter worked, but it asked the reader to operate
the page before it would say what was on it, and whatever they picked replaced
what they were looking at. Six headed grids show the same thing instead of
offering it: the whole shape of the writing is on the page at once and a reader
scrolls instead of clicking. See **Home Sections** for the contract.

- **`Pinned` is what the filter could never give.** Six posts chosen across the
  layers — the author's answer to "where do I start" — where a layer tab can
  only ever give one layer.
- **One flag, not two.** `featured: true` (six posts, with `pinOrder`) and
  `pinned: true` (two, added later) were the same idea spelled twice, and the
  home page read the one with two posts in it. `featured` is gone from every
  file; `pinned` + `pinOrder` is the pair.
- **`SECTION_LIMIT` is 6** — the length of the pinned set, and two full rows of
  the three-column grid, so a section ends level rather than on a short row.
- **`all posts →` is on the pinned header** (the top of the index) **and on any
  section that is cut**, where it replaces the layer's blurb: a cut section
  needs the exit more than it needs a description. Today nothing is cut, so it
  appears once.
- **`PostKicker` now links to `#layer-<id>`** instead of `?layer=<id>`. The
  section anchor is a better link than the filter state was — it needs no script
  and it lands the reader on the section rather than on a re-filtered page.
- `homeStack.inline.ts` lost the filter and is eleven lines: it adds
  `home-entering` once per document and nothing else. The `--hs-i` stagger and
  `is-swapping` went with the filter, and the entrance is one beat for the whole
  index rather than one per section.
- **The layer is not printed on a cell inside its own layer's section.** Six
  cells reading `02 storage engine` under a heading reading `02 storage engine`
  is a column of noise down the left of the grid. It stays in `Pinned`, which is
  the one section where the cell's layer is news.
- **The meta line moved flush left.** With the layer gone from most cells, a
  lone `24 min` pushed to the right edge was a number hanging in space over a
  title that starts at the left.
- **The first row of each grid has no top rule** — the section header's own rule
  is that row's rule. Left flush, the header's `--line-strong` and the cells'
  `--line` stacked into a 2px line broken by 64px notches at every column gap.

**Weight came out of the cells.** `.hs-cell-title` was Fraunces 19px/600 on
`--ink`; it is 18px/500 on `--body`. 600 in near-black is a display weight, and
eighteen of them on one screen read as eighteen headlines — the page was all
emphasis, which is the same as none. The description came down with it (14px →
13.5px). The titles are still the darkest and largest thing in the grid; they
no longer shout over the rules and the metadata holding them.

### 2026-09-23 (the chooser back, and the weight moved off the summaries)

Four notes from the author on the previous pass, which had turned the home page
into six stacked sections and lightened the cell titles.

**1. The groups go back to a horizontal chooser.** `pinned` and each layer are
tabs again, `pinned` open by default, with `all posts →` at the far end of the
row. The sections were a misreading: the six groups are six _cuts of the same
writing_, and a reader takes one at a time — stacking them printed the storage
layer's six posts twice on one page, once under `pinned` and once under its own
heading, and turned a chooser into a scroll. `pinned` earns a tab beside the
layers rather than a block above them because it is the same kind of thing.

`PostKicker` goes back to `?layer=<id>` from `#layer-<id>`, since the panels are
hidden and an anchor cannot reach one. See **Home Chooser**.

**2. The status line is gone.** `12 posts · last write 2026-06-23` was the first
thing on the page, which made a changelog the opening statement. The footer
prints both figures, where a reader who wants them is looking.

**3. The masthead came down a step and its sub-line moved to the mono.** `h1` is
Fraunces 600, not 700. The paragraph under it was the reading face at 17px,
which read as a second and quieter statement competing with the first; it is
mono 13px now — the blog reported rather than written, in the same voice as the
nav and the colophon. It is always English, so nothing in it falls out of the
face.

**4. The weight came off the summaries, not the titles.** The previous pass
lightened `.hs-cell-title` to 18px/500 on `--body`, which was the wrong half of
the cell: it levelled the cell instead of stepping it. The title is back to
19px/600 on `--ink`, and the description went from `--mute`/14px/1.6 to
`--faint`/13px/1.7.

That is the real fix, and the reason is a property of the type rather than a
preference: Hangul is a run of full-width squares, so the same grey prints
visibly more ink than a line of Latin at the same size. Two clamped lines of
Korean description at `--mute` carried nearly the weight of the Latin serif
title above them, and the grid read as twelve paragraphs rather than twelve
titles with a note each. See **Home Cell Type** for the table and the floor the
description is held to.

### 2026-09-24 (one mark in the bar, `home` in it, and a switcher that switches)

Four notes from the author, two of them bugs.

**1. A topic chip navigated instead of switching in place.** The switcher called
`event.preventDefault()` and stopped there, which does nothing here: Quartz's
SPA router listens for clicks on `window` in the bubble phase and `getOpts` in
`spa.inline.ts` never looks at `defaultPrevented`, so the chip's handler ran,
the panel swapped, and the router then navigated to the subject's own page over
the top of it. `event.stopPropagation()` is what keeps the page still. Cmd,
Ctrl, Shift, Alt and middle clicks still return before that line, so the link
still behaves like a link. See **Topic Switcher** — this applies to any in-page
interception of a link click on this site.

**2. `topics` was underlined twice.** `editorial.scss` drew the current
destination as a `text-decoration` underline and `custom.scss` was still drawing
it as a `border-bottom` on the same links, four pixels lower and the width of
the whole link box. The `custom.scss` block is colour only now.

The one mark that remains is **a 1px olive rule that grows from the left edge of
the word** — `a::after` with `transform: scaleX()`, `--line-strong` on hover and
`--olive-600` for the current page. A bar rather than `text-decoration` because
a rule that arrives is worth more than one that appears, and because it is the
same gesture the home chooser's open tab makes: "here" is now drawn one way on
the whole site. The wordmark gained a hover colour in the same pass — it is a
link and was styled like a printed mark.

**3. `home` is a destination in the bar.** The wordmark already linked there,
but a wordmark reads as identity, not as somewhere to go, so a reader who walked
into `topics` was left with the browser's back button — which the author
(rightly) did not want to be the answer.

The design answer is not a back button but **a complete set**: `home`, `posts`,
`topics` are the site's three views of one body of writing — the author's
selection by layer, the timeline, and the subjects — and exactly one of them is
always marked. Wherever you are, the bar shows the whole site and which part of
it you are standing in. `normalize` had to learn that `/` and `index` are the
same page, the way it already knew `tags/` and `tags/index` are; home collapses
to the empty string, which is a prefix of nothing, so it lights only on itself.
See **Top Bar**.

**4. `PostKicker` drops the layer number.** It printed `02 Storage Engine`; it
prints `Storage Engine`. The home page numbers its tabs because there the layers
are a set shown all at once and the number is their order in the stack. A post
is inside one of them: `02` answers a question the reader of a single post is
not asking, and it put two tokens of chrome in front of the one word that means
something. The number stays on the home chooser and in the pinned cells.

### 2026-09-24 (numbers off the home, a masthead with levels, cards read in order)

**1. The layer numbers are gone from the home page too.** The previous pass took
them off `PostKicker` only. The tabs are printed in the stack's order, left to
right, so `01` in front of each one spells out what the row's own arrangement
already says; on a cell it put two tokens of chrome in front of the one word
that means something. `LAYERS` is still the order — it just is not narrated.
`pinned` loses the `--` it carried to align with the numbers.

**2. The masthead has a boundary and levels.** It opened with a statement, a
mono line, a name, a role and three full URLs, all down the left edge in five
sizes with nothing between them: text in a pile.

At `$wide` it is two columns now — the statement across two thirds of the frame,
the byline in the third — and the index page grid is cut into the same three
tracks the post grid uses, so the byline's left edge and the grid's last column
are one line. The byline itself is three levels with a hairline between the two
halves: name, role in the mono, rule, destinations. And the destinations print
`github` / `linkedin` / `email` rather than the full address, which is now the
`title`: three addresses side by side are three strings of near-identical
characters with the distinguishing word buried in the middle of each. Below
1100px the byline lies down into two lines rather than stacking six deep.

It also buys ~90px of the first screen, which is what keeps the grid on it.

**3. A card is read title → question → stamp, so it is written that way.** The
stamp moved from above the title to the foot of the cell. It is safe there now
in a way it was not two passes ago: the title reserves two lines and the
description is clamped to two, so every cell in a row is the same height and
`margin-top: auto` lands a row's stamps on one line.

**Two layout bugs came out of this pass, and both are worth remembering:**

- **`box-sizing` on `.hs-cell-link`.** `a` is `content-box` here, so
  `height: 100%` sized the _content_ box to the row and the 40px of padding
  overflowed it. Every stamp printed 38px below its own row, under the next
  row's rule, where it read as the metadata of the card beneath it.
- **Partial explicit grid rows.** Naming `grid-row` for the masthead and the
  chooser but not for the bar left `header` — and Quartz's empty
  `.page-header > .popover-hint`, which still claims a row — to auto-placement.
  They landed in the first free slot, on top of the chooser, and the page
  opened with no navigation above the masthead. Place every row or none.

### 2026-09-24 (the profile goes to the foot, and a sweep of the whole site)

**1. The author moved from the top of the home page to the footer.** Author's
note: the writing should be the first thing, not her. See **Footer Byline** —
the block merged with the two bare links the footer was already carrying, so
the site's addresses are written down once (`socialLinks.ts`) instead of twice,
and the home page's index now starts ~180px higher.

With the byline gone the index needs no second column, so the `$wide` three
track override on the page grid went with it and the home is back to one column
placed by `order` alone. **That is the safe shape**: name every row of a grid or
none of them.

**2. A sweep of every page type, at desktop and on a real 390px viewport.**
What it found, and what was done:

- **The top bar collided on a phone.** With three destinations in it, the search
  trigger's label and `⌘K` printed straight over `topics`. The rule that hid
  them at phone width had existed and was deleted with a block of dead
  home-page CSS it happened to sit inside — a regression introduced two passes
  earlier and invisible at desktop width. Restored, and the nav's own padding
  tightened: the bar now measures 20→378 in a 390px viewport with no overlap.
- **`Read next` stood over a single row on four of twelve posts**, and over
  exactly one row on two of them — a heading that reads as something that
  failed to load. `ReadNext` now fills to three from the rest of the archive
  after layer and topic matches are exhausted. Relevance still decides the
  order; it no longer decides the length. Verified: every post returns three.
- **The 404 page spoke in Quartz's voice, not the site's.** Its sentence was
  the upstream default and `Return to Homepage` was a large underlined body
  link — the only link on the site drawn that way. The copy is the site's now
  and the link is `← home` in the mono, with the underline that colours in on
  hover that `all posts →` uses. It is deliberately **not** the nav's arriving
  rule: `base.scss` underlines every `a` and gives it a bottom border, and both
  outrank a rule written in `editorial.scss`, so a `::after` bar on top of them
  is two marks for one link — the exact thing that came out of the top bar.
- **The breadcrumb duplicated the nav on list pages.** `Home › Topics` sat
  directly above an `h1` reading `Topics`, and `home` is a destination in the
  bar now. It is mounted only on a leaf topic page, where `Home › Topics ›
database` is a real trail.
- Dead `.profile-card` CSS removed from `custom.scss`; the shared mono-voice
  selector list updated to the footer's class names.

**Not changed, and why:** the search overlay, the archive, the topic switcher
and the two unlisted portfolio pages were reviewed and left alone. The `404`
heading is the one large block of accent colour on the site, which is
deliberate — an error code is machine output.

### 2026-09-25 (the footer cut to three things, and the copy rewritten)

**1. `ReadNext` was mounted on every page.** It guards against the home page and
unlisted pages and nothing else, so `Posts`, `Topics` and every leaf topic ended
a list of posts with three more posts under a heading reading `Read next` — a
suggestion on a page that is nothing but suggestions. It is a
`ConditionalRender` on `isPost` in the layout, with the same check inside the
component as a brace.

**2. The footer is three things now.** See **Footer**: the wordmark and its note
on the left, `github · linkedin · email` on the right, a credit line under both,
and the two columns share a baseline. Gone: the post count, the last-write date,
the role, and the name. Author's call on the name, and the right one — it is the
same fact `jaeunda.log` and `github.com/jaeunda` already carry. Short labels
rather than full URLs, for the same reason they are short in the byline.

**3. The home grid got its air back.** The first row now hangs 30px below the
chooser's rule rather than 12px — that rule is `--line-strong` and it closes a
control, so it needs a beat under it before the reading starts; at the cells'
own padding the first row read as the chooser's last line. The cell's padding
went to `18px 0 34px` and its internal gap to 11px.

**4. The two post lists were set differently.** The same sentence was 15px with
negative tracking in the archive and 13px on `--faint` in the home grid, so a
post looked like a different kind of thing depending on where you met it. They
are one relationship now; see **Home Cell Type**.

**5. New copy, checked against the author's own record.**

- The masthead is the blog's side of her GitHub profile README (_"Deterministic
  cores for nondeterministic systems. Concurrency and uncertainty are given."_),
  turned from building to reading. The GitHub trail it has to be true to: xv6
  kernel extensions, ext2 and daemon work in C, a compiler, deterministic
  transaction replay against InnoDB, an NPU RAG agent.
- **Every post's `description` is one rhetorical question with no commas.**
  They had commas and one of them was not a question at all. Comma-free forces
  a single clause, which is what makes them short enough to set on two lines in
  a third of the frame — the longest is 43 characters.
- `scripts/fonts/README.md` says to re-subset after adding Korean copy. Checked:
  every syllable in the new descriptions and the new masthead is already in the
  Noto Sans KR subset, so no regeneration was needed. **Check, do not assume** —
  the charset covers `content/` as it was plus Hangul without a final consonant,
  and these rewrites happened to stay inside it.

### 2026-09-25 (one-line titles, a contact block, and a page that opens at the top)

**1. `description` is a question only where the post asks one.** Six of the
twelve open on a question of their own and take the interrogative; the other six
are expositions and take a plain summary. Putting all twelve in the question
form made the grid read as a quiz. No commas either way — see **Post
Descriptions**.

**2. Every title fits on one line, on the home and on the post.**

- The home grid went from three columns to **two**. A third of the frame is
  317px and the longest title needs 381px at 19px; half the frame is 508px.
  `white-space: nowrap` holds the guarantee, with `text-overflow: ellipsis` as
  the failure mode and a documented ~46-character budget.
- The post title went from `clamp(…, 44px)` to `clamp(…, 32px)`. At 44px the
  longest title ran 897px against a 680px measure and broke mid-noun-phrase on
  half the posts; at 32px it sets 652px. The dek came down with it, 18px →
  15.5px — against a 32px title, 18px was competing rather than supporting.

**3. The gap between a title and its description is gone with the wrapping it
came from.** `.hs-cell-title` no longer reserves a second line. That reserve
existed to keep descriptions aligned across a row of mixed one- and two-line
titles; with every title one line there is nothing to align and it was putting
25px of nothing under every title.

**4. The footer's three links are a contact block.** A mark and the address in
full, stacked, right-aligned as a block with the rows sharing a left edge, no
underline. Three lowercase words read as three more items of chrome; an address
is a fact a reader can act on. See **Footer**.

**5. A post used to ride up from wherever the list had been scrolled to.**
`spa.inline.ts` scrolled to the top _after_ `micromorph`, and `base.scss` sets
`scroll-behavior: smooth` on `html`: the incoming post rendered at the outgoing
list's offset and then animated up to its own title. The scroll now happens
before the morph and with `behavior: "instant"` — a page change is not a jump
within a page, and the animation only ever showed the reader where they had
been, which they already knew. An in-page `#hash` still scrolls after the morph
and still animates, because there it is telling the reader where they landed.

**6. Topics are ordered by the pinned set.** See **Topic Switcher**.

**Two process notes from this pass**, both cheap and both worth keeping:

- **Measure type in the browser before choosing a size.** The column/title
  arithmetic above came from a `Runtime.evaluate` probe that set every title in
  the real face at six sizes and reported the widest. Guessing at em-widths for
  a display serif would have been wrong in both directions.
- **A multi-edit script that asserts should write after every edit, or the
  first bad assertion throws away the good ones.** Three separate passes in this
  session lost their earlier replacements that way.

### 2026-09-26 (width rolled back, a contact block, a post header of three lines)

**1. The grid is three columns again.** Two was the only way to fit every title
on one line, and it cost more than it bought — cards wide enough to read as rows
and six of them in three rows. Four titles wrap at three columns and that is
fine now: the thing that made wrapping expensive was the reserved second line,
and that is gone. A wrapped title pushes only its own description down, so the
gap between a title and the sentence under it is the same in every cell. Page
height went 1165 → 1064.

**2. `.footer-mark` was already the point colour.** Checked against the painted
pixels: `rgb(79, 94, 60)`, identical to the nav wordmark. Nothing to change.

**3. The footer note is a list, not a sentence.** `Linux internals · Database
concurrency · Network paths`, mono, one line. It spent its first two words —
`Notes on` — saying what a note is, and then wrapped.

**4. New masthead.** Core word first, one supporting sentence. See **Home
Masthead**, including the non-breaking space that keeps `page fault` together.

**5. The post header is three lines.** The layer moved into the metadata line,
`PostKicker` is deleted and the `#topic` chip is unmounted. See **Post Header**.

**A verification note.** Chrome caches `index.css` across a rebuild, so a
headless screenshot taken right after `npx quartz build` can show the previous
stylesheet. Two "regressions" in this pass were the cache, not the code. Drive
the browser with `Network.setCacheDisabled` before believing a screenshot.

**Housekeeping in this file.** Three passes of "replace from `## Home Page` to
`### Home Masthead`" had each left the old tail behind, so the reference carried
`### Home Masthead` three times, `### First-Screen Motion` twice, and a
superseded `### Footer Byline` and `### Home Byline`. All byte-identical
duplicates removed, `### Footer` filed next to `### Top Bar` where it belongs,
and the dead `### Profile Rail` section replaced with a pointer. **When
replacing a span in this file, check the outline afterwards** — a stale
duplicate reads as current to the next agent.

### 2026-09-27 (a masthead with a direction, and three summaries corrected)

**The masthead names its subjects.** `Concurrency and failure are the normal
case.` was a premise a reader could agree with without learning what the blog
is about — abstract in the same way the version before it was, from the other
end. It is `Operating systems, databases, networks, down to the mechanism.`
now, with one sentence under it saying what that depth means in practice. See
**Home Masthead**, including why `max-width` had to move from 20em to 22em when
the size came down to 38px.

**Three of the twelve post summaries were rewritten; nine were left alone.**
Each was read against its own outline. The three that failed did so in ways
worth naming — a summary of the most quotable section rather than of the post,
an interpretation laid over an expository post, and a metaphor doing work the
post does plainly. See **Post Descriptions**.

The nine that stayed include two that are arguably partial and were kept
deliberately: `Linux Transport Layer Internals` describes the receive path when
the post also covers `send()`, and `CORS` leads on preflight when the post also
has a practice section. In both cases the line states the post's **thesis**,
which is a better summary than an inventory of its sections.

### 2026-09-28 (the masthead states a position, not a table of contents)

> Mechanism before description, _evidence before assertion._
>
> The same order at every layer, from a page table to a distributed
> transaction.

Nine versions. **See Home Masthead for the table of what failed.** The last
correction is the one that matters and it was not about wording: every earlier
version described _the page_ — what the posts are, what they do, where they
start and stop — and a description of the contents is interchangeable with any
other systems blog. **A masthead carries the author's position; the page is one
place that position is applied.**

Three rules the copy settled into, all of them earned:

1. **A noun phrase, not a sentence.** Every complete sentence tried here ended
   up arguing with the reader instead of telling them where they were.
2. **One sentence under it, with no subject.** No `I`, no `this blog`, no
   `each post`. The sub-line had been a slogan, a portfolio index naming the
   author's repositories, a four-line paragraph, and a first-person aside; a
   masthead that narrates the page or its author is not stating a position.
3. **No em dashes.** An em dash is an aside, and three lines of copy have no
   room for an aside.

`before`, not `over`: `over` is a preference, `before` is an order of work, and
the sub-line confirms it as one. The determinism thread that also runs through
her engineering work is not referred to, because the headline _is_ it. Nothing
on the page points outside the page.

### 2026-09-30 (a third portfolio, outside Quartz)

- Added `portfolio-4dplex/`, a standalone Vite + React + TypeScript site served
  at `/portfolio-4dplex/`. It needed selectable diagrams, tabs and a scroll-spy
  navigation, which a Quartz content page has no place for without adding
  inline scripts to the blog's own bundle; keeping it out of Quartz also gives
  it its own title, description and Open Graph tags instead of the unlisted
  shell's `noindex`.
- Every route is prerendered at build time and hydrated, so the first paint,
  a direct visit to a project URL and the no-JavaScript view carry the full
  content.
- The projects moved off the home page onto their own pages the same day: as
  one page it took so much scrolling that a reader did not reach the end.
- `deploy.yml` builds it after Quartz and copies it into `public/`. The blog,
  `portfolio-it` and `portfolio-systems` are unchanged. See **4DPLEX
  Portfolio**.
- A third-party read of the finished pages found the project headers
  overloaded (message, facts, role note and summary all competing on the first
  screen) and no way to see how long a page was or where its evidence sat. The
  role note moved to the end of each page, a contents row and block numbers
  were added, results moved above implementation detail on the weavegate and
  CUDA pages, and the Ongi design notes were folded.

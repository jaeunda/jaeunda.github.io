# design-sync notes — jaeunda.log

## What this repo is, and why the pipeline looks unusual

This is a **Quartz static-site generator fork**, not a component library. There
is no `dist/`, no Storybook, no `main`/`exports` in `package.json` — it ships as
a CLI (`bin: quartz`). Every component is a `QuartzComponentConstructor`
factory whose product takes the whole SSG build context as props (`ctx`, `cfg`,
`fileData`, `allFiles`, `tree`), and several return `null` unless the page slug
matches.

So the converter is fed a purpose-built mini-package assembled by
`.design-sync/build-*.mjs` from the repo's own source. Run order (this is
`cfg.buildCmd`):

1. `run-gen-tokens.mjs` — executes Quartz's own `joinStyles()`
   (`quartz/util/theme.ts`) against `quartz.config.ts` → `tokens.css`,
   `fonts.css`, `cfg.json`. Tokens can never drift from the site.
2. `build-fixtures.mjs` — reads `content/**/*.md` → real pages, tags, dates,
   TOCs for the preview fixtures.
3. `build-css.mjs` — dart-sass compiles `quartz/styles/custom.scss` (the single
   global root) + all 18 `quartz/components/styles/*.scss`, with the font
   `@import` and token blocks prepended.
4. `build-dist.mjs` — esbuild bundles `.design-sync/ds-entry/entry.tsx` into a
   mini-package (`index.mjs`, `index.d.ts`, `package.json`).

Then: `package-build.mjs --entry .design-sync/.cache/dist/index.mjs`.

## Gotchas that cost real debugging time

- **Preact → React.** Quartz is Preact; the design runtime is React. Fixed by
  `.design-sync/ds-entry/jsx-runtime.js`, which renames `class`→`className`,
  `for`→`htmlFor`, `datetime`, `autocomplete`, and converts `style` strings to
  objects, then delegates to `react/jsx-runtime`.
- **tsconfig wins over esbuild.** Root `tsconfig.json` sets
  `jsxImportSource: "preact"`, and esbuild honours the tsconfig per-file over
  the build option. `build-dist.mjs` overrides with `tsconfigRaw`; the previews
  need their own `.design-sync/previews/tsconfig.json` for the same reason —
  without it every card renders blank Preact vnodes.
- **`quartz/util/jsx.tsx` imports `preact/jsx-runtime` at runtime** (it drives
  hast→JSX for page bodies), so that specifier is aliased to the shim too.
- **Node-only leaks** into the browser bundle, each shimmed in `build-dist.mjs`:
  `crypto.randomUUID`; `plugins/emitters/ogImage` (Head imports one string
  constant from a module that pulls `node:fs`/sharp/satori); `util/trace`
  (pulls workerpool); `reading-time`'s CJS stream entry.
- **`cfg.tokensGlob` does nothing without `cfg.tokensPkg`** — `lib/css.mjs`
  `copyTokens()` returns early. Tokens are therefore inlined at the top of
  `ds-styles.css` so they reach designs via the `styles.css` import closure.
- **`.design-sync/.cache/dist/package.json` is load-bearing.**
  `package-build.mjs` walks up from `--entry` to the first named
  `package.json`; without it, discovery lands on the repo root and finds zero
  components. The sibling `node_modules` symlink is likewise what makes
  `@types/react` resolve.
- **The floor card overrides bound props.** It renders with synthesized
  `.d.ts` props (e.g. `allFiles: []`), which beat the bound defaults and make
  data-driven components return `null`. Authoring a preview is the fix — all 31
  are authored, so there are no floor cards.

## Known render warns (expected — do not re-chase)

- `[TOKENS_MISSING] --shiki-light, --shiki-light-bg, --shiki-dark,
  --shiki-dark-bg` — set inline per code block by the shiki syntax highlighter
  at runtime. Correctly absent from static CSS.
- `[RENDER_BLANK] MobileOnly`, `[RENDER_BLANK] VisitorCount` — both declare a
  `viewport` in `cfg.overrides`, and the `@dsCard` marker carries it, so the
  product renders them correctly. Only the render check's default-viewport
  screenshot reads blank. Verified in the solo review sheets.
  (`MobileOnly` is `.mobile-only`, hidden above 800px; `visitorCount.inline.scss`
  hides `.visitor-count` below 1200px.)
- `[RENDER_THIN] Comments` — genuinely has no static appearance; see below.

## Findings about the site itself (not sync problems)

- **`PinnedPosts` renders nothing on the live site.** It is the mounted home
  component (`quartz.layout.ts:12`) but only renders posts with
  `featured: true` in frontmatter, and no post in `content/` sets that. The
  preview fixture marks the four most recent featured so the card shows the
  real 2-column grid.
- **No note-to-note links exist**, so `Backlinks` renders nothing live
  (`hideWhenEmpty` defaults true). All `[[...]]` in `content/` are image
  embeds. The fixture points two real posts at the article for the card.
- **`content/` is flat** — no folders — so `FolderContent` has no real page.
  Its fixture nests the posts under a `notes` folder.
- **`Comments` is not mounted** in `quartz.layout.ts` and renders an empty
  `<div class="giscus">`; the thread is a runtime iframe. Graded `needs-work`
  and deferred — no preview can fix it.
- **`.agent/skills/design-system/references/design-system.md` is stale.** It
  lists `light: #f6f7f5`, `secondary: #9aa888`; `quartz.config.ts` actually
  ships `light: #fafaf8`, `secondary: #4f5e3c` (an accessibility contrast fix).
  Tokens are generated from the config, so the sync is correct — but that doc
  is shipped as `guidelines/` and should be refreshed.
- **`Footer` links still point at upstream Quartz** (jackyzha0's GitHub and
  Discord), not this site.

## Re-sync risks — what can silently go stale

- **`ds-entry/entry.tsx` is a hand-maintained enumeration.** A component added
  to `quartz/components/index.ts` will NOT appear until it is bound here. The
  `.d.ts` is generated from this file's `export const X = bind(` lines, so the
  two cannot drift from each other — but both can drift from the repo.
- **Component options are copied from `quartz.layout.ts`** (Footer links,
  TagCloud limit/variant, Flex pairing). If the layout changes, update the
  bindings or the cards will show stale configuration.
- **Fixture data is rebuilt from `content/`** each run, so new posts flow
  through automatically — but the hardcoded slugs in `entry.tsx`
  (`"Deadlocks"`, `"Lock-based-Protocol"`, `"Transaction-Isolation-in-SQL"`)
  will silently fall back if those notes are renamed or deleted.
- **`Hero` options are invented.** Hero is not mounted in `quartz.layout.ts`;
  the greeting/accent used in the card came from `content/index.md`'s copy.
- **Fonts load from the Google Fonts CDN** via `@import` in the shipped CSS
  (matching `theme.fontOrigin: "googleFonts"`). Nothing is vendored, so cards
  need network access for correct typography.
- **Chromium**: the render check ran against system
  `/usr/bin/google-chrome` via `DS_CHROMIUM_PATH`; playwright's own browser was
  never downloaded. Re-syncs need that env var or a playwright chromium.
- Preact/React shim covers only the attributes Quartz uses today. A component
  introducing new HTML-spelled attributes needs a `RENAME` entry.

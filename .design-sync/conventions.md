## Building with jaeunda.log

This is the component set behind **jaeunda.log**, a Korean-language engineering
blog built on Quartz. It is a *site* design system: page chrome, note listings
and article furniture — not a generic widget kit.

### No provider, no wrapper — just render

Every export is already bound to a realistic page context, so a component
renders correctly with **no props at all**:

```jsx
<Hero />
<PinnedPosts />
<TableOfContents />
```

Do **not** wrap these in a theme or context provider — there is none, and
adding one changes nothing. Load `styles.css` and render.

Override props only when you want different data. All props are optional:

```jsx
// Drive a listing with your own posts
<RecentNotesWithPreview allFiles={myPages} />
// Render article chrome for a different note
<ArticleTitle fileData={{ frontmatter: { title: "New Post" } }} />
```

`fileData` is the current page, `allFiles` is every page on the site, and
`displayClass` (`"mobile-only"` | `"desktop-only"`) restricts a component to one
breakpoint. Page data uses `slug`, `frontmatter.title`, `frontmatter.tags`,
`description`, `text`, `dates.published`, `toc`, and `links` — see any
`<Name>.d.ts`.

### Styling idiom: CSS custom properties, semantic classes

There are **no utility classes**. Colour and type come from CSS variables
defined on `:root`, and every component carries its own semantic class name.

| Token | Role |
|---|---|
| `--light` / `--dark` | page background / strongest text |
| `--darkgray` / `--gray` | body text / secondary and metadata text |
| `--lightgray` | borders and faint surfaces |
| `--secondary` / `--tertiary` | olive accent; links and active states |
| `--highlight` / `--textHighlight` | tinted surfaces / marked text |
| `--titleFont` / `--headerFont` | Fraunces — wordmark and headings |
| `--bodyFont` | Noto Sans KR — body copy, incl. Korean |
| `--codeFont` | IBM Plex Mono — code, tag chips, metadata labels |

Write your own layout glue the same way:

```jsx
<section style={{ background: "var(--light)", color: "var(--darkgray)",
                  fontFamily: "var(--bodyFont)", borderTop: "1px solid var(--lightgray)" }}>
  <h2 style={{ fontFamily: "var(--headerFont)", color: "var(--dark)" }}>Notes</h2>
  <RecentNotes />
</section>
```

**Dark mode is attribute-driven, not `prefers-color-scheme`.** The token block
is redefined under `:root[saved-theme="dark"]`. To render a dark design, set
`document.documentElement.setAttribute("saved-theme", "dark")` — a media query
will not switch this system.

### The class vocabulary

Real class names, if you need to target or echo them: `.hero`,
`.hero-greeting`, `.hero-sub`; `.section-header`, `.section-title`,
`.section-title-count`, `.section-action` (shared listing header);
`.post-card`, `.pin-card` (listing rows); `.top-tags-list`, `.top-tag`,
`.top-tag-label`, `.top-tag-count` (tag chips); `.toc`, `.backlinks`,
`.profile-card`, `.content-meta`, `.article-title`, `.page-title`,
`.explorer`, `.graph`; `.mobile-only` / `.desktop-only` breakpoint helpers.
Prefer composing the components over re-creating these.

### Where the truth lives

Read `_ds/<folder>/styles.css` before styling — it imports `_ds_bundle.css`,
which carries the token block, the brand `@font-face` import, and every
component's real compiled CSS. Per-component API and usage sit in
`components/<group>/<Name>/<Name>.d.ts` and `<Name>.prompt.md`.

### Two components with no static appearance

`Comments` renders an empty giscus mount (the thread is a runtime iframe) and
`Graph` and `Explorer` render only their headers — their bodies are drawn by
runtime scripts. Use them for structure, not for visual weight.

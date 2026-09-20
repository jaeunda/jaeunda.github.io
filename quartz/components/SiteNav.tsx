import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

// The site's one navigation surface, rendered at the top of every page.
//
// Every reference blog — leerob, kylegill, danspratling, github.blog,
// cloudflare, uber — puts a short horizontal bar at the top of the content
// column: mark on the left, a handful of destinations on the right. Before
// this, navigation was scattered down a left rail (title, search, profile,
// topics) and a first-time visitor could not tell what the site contained.
//
// Two destinations is the whole menu. Anything more belongs on the page it
// links to.

interface NavItem {
  label: string
  slug: string
}

// `tags/` and `tags/index` are the same page spelled two ways: the link needs
// the trailing slash to resolve, the page reports its slug without it. Compared
// raw, `Posts` was the one destination that never lit up when you were on it.
const normalize = (slug: string) => slug.replace(/\/index$/, "").replace(/\/$/, "")

// Which nav item is the reader inside? Exactly one, always — `tags/topic` is
// also under `tags/`, so matching every prefix lit Posts and Topics at once.
// The longest match wins, which is the most specific destination that contains
// the page.
function activeSlug(here: string): string | undefined {
  const a = normalize(here)
  return ITEMS.map((item) => normalize(item.slug))
    .filter((b) => a === b || a.startsWith(`${b}/`))
    .sort((x, y) => y.length - x.length)
    .at(0)
}

// English, to match the rest of the chrome — the layer names, the metadata and
// the wordmark are all Latin, so two Korean labels in the middle of them read
// as a different system.
//
// `Posts` is every post, newest first. `Topics` is the same posts grouped by
// subject. They used to be labelled 글 / 주제 and both rendered a flat list of
// all twelve posts, so the second destination told a visitor nothing new.
// `Portfolio` used to be the third item here. It is one unlisted page about
// the author, and the nav put it at the same level as the whole blog; it is a
// row in the home byline now, beside GitHub and email. See `portfolios.ts`.
const ITEMS: NavItem[] = [
  { label: "Posts", slug: "tags/" },
  { label: "Topics", slug: "tags/topic" },
]

export default (() => {
  const SiteNav: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const here = fileData.slug!
    const active = activeSlug(here)
    return (
      <nav class={`site-nav ${displayClass ?? ""}`} aria-label="Site">
        <a class="site-nav-mark" href={resolveRelative(here, "/" as FullSlug)}>
          {cfg.pageTitle}
        </a>
        <ul class="site-nav-links">
          {ITEMS.map(({ label, slug }) => (
            <li>
              <a
                href={resolveRelative(here, slug as FullSlug)}
                // `page` for the destination itself, `true` for a page inside
                // it — a leaf topic sits under Topics without being it.
                aria-current={
                  normalize(slug) === active
                    ? normalize(here) === active
                      ? "page"
                      : "true"
                    : undefined
                }
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return SiteNav
}) satisfies QuartzComponentConstructor

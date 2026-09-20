import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byEditorialRank, LAYER_LABEL, layerOf, layersInOrder, lengthLabel } from "./postMeta"
import { PostRow } from "./PostRow"
// @ts-ignore: .inline.ts files are loaded as text by the esbuild inline-script-loader
import script from "./scripts/homeStack.inline"

// The home page, index only. Three blocks and nothing else:
//
//   Featured — one post, set as type. Labelled as the pick, not as its layer.
//   Layers   — the layers of the request path, as a filter, in the author's
//              order. One is always active; there is no `All`, because that is
//              what the archive is.
//   Index    — the active layer's posts, in one column, in editorial order.
//
// It used to be six: a wordmark bar, an opener, a `Pinned` label, two bordered
// cards with ASCII art inside them, the chips and the list — six visual
// vocabularies stacked on one screen. The masthead above (content/index.md plus
// the profile byline) is the page's identity; this component is the writing.
//
// Frontmatter this component reads:
//   layer        — which layer the post belongs to (ids in postMeta LAYERS)
//   rank         — editorial order inside that layer; see postMeta
//   description  — the one-line hook shown under the title
//   pinned       — marks a representative post for the top of the page
//   pinOrder     — order among pinned posts
//   cover        — ASCII art for the pinned card, rendered in the code face

// One. Two cards side by side made a module that needed its own label and its
// own border to be read as a pair; one post needs neither and can be set large.
const FEATURED_LIMIT = 1

interface Options {
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: Options = {
  filter: (page) => page.slug !== "index" && page.frontmatter?.unlisted !== true,
}

function pinnedSort(a: QuartzPluginData, b: QuartzPluginData): number {
  const ao = typeof a.frontmatter?.pinOrder === "number" ? (a.frontmatter.pinOrder as number) : 99
  const bo = typeof b.frontmatter?.pinOrder === "number" ? (b.frontmatter.pinOrder as number) : 99
  return ao - bo
}

export default ((userOpts?: Partial<Options>) => {
  const HomeStack: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const opts = { ...defaultOptions, ...userOpts }
    // Editorial rank, not the publication date: the index is a reading order.
    const posts = allFiles.filter(opts.filter).sort(byEditorialRank(cfg))
    if (posts.length === 0) return null

    const here = fileData.slug!
    const featured = posts
      .filter((p) => p.frontmatter?.pinned === true)
      .sort(pinnedSort)
      .slice(0, FEATURED_LIMIT)

    const counts = new Map<string, number>()
    for (const post of posts) {
      const layer = layerOf(post)
      if (layer) counts.set(layer, (counts.get(layer) ?? 0) + 1)
    }
    // The author's order, and the first layer opens. It used to be sorted by
    // post count, so the page opened on whatever had the most posts.
    const layers = layersInOrder(counts)
    const openLayer = layers.at(0)?.id ?? ""

    // The featured post keeps its row. It was filtered out of the index because
    // it is printed in full above — but the tab said `Kernel 2` and listed one
    // post, so the layer looked like it was missing something. A layer is the
    // whole layer; being the pick is not a reason to be absent from it.
    const rows = posts

    return (
      <section class={`home-stack ${displayClass ?? ""}`} data-home-stack>
        {featured.map((page) => {
          const cover = page.frontmatter?.cover as string | undefined
          return (
            <a class="hs-featured" href={resolveRelative(here, page.slug!)} data-hs-featured>
              {/* The eyebrow used to print the layer alone, so the site's one
                  representative post was labelled `KERNEL` — a taxonomy, which
                  says nothing about why this post is at the top of the page.
                  It says what the block is first; the layer follows it. */}
              <span class="hs-featured-eyebrow">
                <span class="hs-featured-kicker">
                  <i class="hs-featured-dot" aria-hidden="true"></i>Featured post
                </span>
                <span class="hs-featured-layer">{LAYER_LABEL.get(layerOf(page) ?? "")}</span>
              </span>
              <span class="hs-featured-title">{page.frontmatter?.title}</span>
              {page.description && <span class="hs-featured-desc">{page.description}</span>}
              {cover && <pre class="hs-featured-cover">{cover.replace(/\n+$/, "")}</pre>}
              <span class="hs-featured-foot">
                <span class="hs-featured-meta">{lengthLabel(page)}</span>
                <span class="hs-featured-go">
                  Read this first<i class="hs-featured-arrow" aria-hidden="true"></i>
                </span>
              </span>
            </a>
          )
        })}

        {/* The five layers were a flat row of counter chips, which read as six
            arbitrary filters rather than as one axis cut into parts. The
            section says what the control does, each layer carries the blurb it
            was always given in postMeta, and one layer is always open — `All`
            used to sit first and do exactly what the archive link beside it
            does. The number on each tab is its place in the author's order,
            which is why the strip is not sorted by post count. */}
        <nav class="hs-layers" aria-labelledby="hs-layers-label">
          <div class="hs-layers-head">
            <p class="hs-layers-label" id="hs-layers-label">
              Browse by layer
            </p>
            {/* The count is the one credibility number the home page never
                printed — a visitor could not tell whether the site held twelve
                posts or the two under the open tab — and the component already
                knows it, so it cannot go stale. */}
            <a class="hs-layers-all" href={resolveRelative(here, "tags/" as FullSlug)}>
              All {posts.length} posts →
            </a>
          </div>
          <div class="hs-layers-tabs">
            {layers.map((layer, i) => (
              <button
                type="button"
                class="hs-layer"
                data-layer={layer.id}
                aria-pressed={layer.id === openLayer ? "true" : "false"}
              >
                {/* The order number and the count share a meta line above the
                    name, rather than sitting either side of it: on a 132px
                    column `02 Storage Engine 6` broke the label in half and
                    left `Engine` on its own line. The name now owns a line,
                    and the five numbers and five counts each align down the
                    strip. */}
                <span class="hs-layer-meta">
                  <span class="hs-layer-no">{String(i + 1).padStart(2, "0")}</span>
                  <span class="hs-layer-count">{counts.get(layer.id) ?? 0}</span>
                </span>
                <span class="hs-layer-name">{layer.label}</span>
                {/* The blurb belongs to the layer, so it is printed on every
                    tab rather than swapped into one line under them: five
                    proper nouns in a row said nothing about what they were. */}
                <span class="hs-layer-blurb">{layer.blurb}</span>
              </button>
            ))}
          </div>
        </nav>

        <div class="hs-index">
          <ul class="post-rows">
            {rows.map((page) => (
              <PostRow
                page={page}
                here={here}
                cfg={cfg}
                layer={layerOf(page) ?? ""}
                hidden={layerOf(page) !== openLayer}
              />
            ))}
          </ul>
        </div>
      </section>
    )
  }

  HomeStack.afterDOMLoaded = script

  return HomeStack
}) satisfies QuartzComponentConstructor

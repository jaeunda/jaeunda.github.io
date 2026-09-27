import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import {
  byEditorialRank,
  isListedPost,
  LAYER_LABEL,
  layerOf,
  layersInOrder,
  minutesOf,
} from "./postMeta"
// @ts-ignore: .inline.ts files are loaded as text by the esbuild inline-script-loader
import script from "./scripts/homeStack.inline"

// The home page, index only: one horizontal chooser over one grid.
//
//   pinned — the author's six, in `pinOrder`, and the default. A selection
//            across the stack, which is the answer to "where do I start".
//   layers — each layer, in the author's order, and inside a layer in
//            editorial rank.
//
// **No layer numbers anywhere on this page.** The tabs are already printed in
// the stack's order, left to right, so a `01` in front of each one spells out
// what the row's own arrangement says; on a cell it put two tokens of chrome
// in front of the one word that means something. `LAYERS` is still the order —
// it just is not narrated.
//
// Every group is rendered; the script shows one. `pinned` is a tab beside the
// layers rather than a block above them because it is the same kind of thing —
// a way of cutting the writing — and a reader picks one cut at a time.
//
// Frontmatter this component reads:
//   layer        — which layer the post belongs to (ids in postMeta LAYERS)
//   rank         — editorial order inside that layer; see postMeta
//   description  — the one-line question shown under the title
//   pinned       — in the pinned group
//   pinOrder     — order within it

interface Options {
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: Options = {
  filter: isListedPost,
}

// Six. It is the length of the pinned set the author keeps, and six cells is
// two full rows of the three-column grid — a group that ends level rather than
// on a short row. A layer past six is cut here, and its tab says so.
const GROUP_LIMIT = 6

const PINNED = "pinned"

interface Group {
  id: string
  name: string
  // Printed as the tab's `title`, not as a line under the open tab: printed,
  // it moved the grid down by its own height every time the tab changed.
  blurb?: string
  total: number
  pages: QuartzPluginData[]
  // Print each cell's layer? Only the pinned group needs it: it is the one cut
  // that crosses the stack. Inside a layer, the open tab has already said the
  // layer, and six cells repeating `02 storage engine` under a tab reading
  // `02 storage engine` is a column of noise down the left of the grid.
  showLayer?: boolean
}

function pinOrder(page: QuartzPluginData): number {
  const order = page.frontmatter?.pinOrder
  return typeof order === "number" ? order : 99
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
    const archive = resolveRelative(here, "tags/" as FullSlug)

    const counts = new Map<string, number>()
    for (const post of posts) {
      const layer = layerOf(post)
      if (layer) counts.set(layer, (counts.get(layer) ?? 0) + 1)
    }
    const layers = layersInOrder(counts)

    // A pinned post keeps its place in its layer as well. A layer is the whole
    // layer, and being the author's pick is not a reason to be missing from it.
    const pinned = posts.filter((p) => p.frontmatter?.pinned === true)
    pinned.sort((a, b) => pinOrder(a) - pinOrder(b))

    const groups: Group[] = [
      {
        id: PINNED,
        name: PINNED,
        showLayer: true,
        total: pinned.length,
        pages: pinned.slice(0, GROUP_LIMIT),
      },
      ...layers.map((layer) => {
        const all = posts.filter((p) => layerOf(p) === layer.id)
        return {
          id: layer.id,
          name: layer.label.toLowerCase(),
          blurb: layer.blurb,
          total: all.length,
          pages: all.slice(0, GROUP_LIMIT),
        }
      }),
    ].filter((group) => group.pages.length > 0)

    const open = groups.at(0)?.id

    return (
      <section class={`home-stack ${displayClass ?? ""}`} data-home-stack>
        {/* The chooser, and the way past it. `all posts →` is not a tab: every
            tab narrows the grid in place, and that link leaves the page. */}
        <nav class="hs-filter" aria-label="Posts by group">
          <div class="hs-tabs">
            {groups.map((group) => {
              const cut = group.pages.length < group.total
              return (
                <button
                  type="button"
                  class="hs-tab"
                  data-group={group.id}
                  aria-pressed={group.id === open ? "true" : "false"}
                  title={group.blurb}
                >
                  <span class="hs-tab-name">{group.name}</span>
                  {/* What the group holds, not what the grid will show. A `6`
                      on a tab that opens six of nine would be a wrong number;
                      the `+` says the grid is a top six. */}
                  <span class="hs-tab-count">
                    {group.total}
                    {cut && "+"}
                  </span>
                </button>
              )
            })}
          </div>
          <a class="hs-all" href={archive}>
            all posts <span aria-hidden="true">→</span>
          </a>
        </nav>

        {groups.map((group) => (
          <div class="hs-panel" data-group={group.id} hidden={group.id !== open}>
            <ul class="hs-grid">
              {group.pages.map((page) => {
                const layer = group.showLayer ? layerOf(page) : undefined
                return (
                  <li class="hs-cell">
                    <a
                      class="hs-cell-link"
                      href={resolveRelative(here, page.slug!)}
                      aria-label={page.frontmatter?.title as string}
                    >
                      {/* Title, the question it answers, then the stamp. A
                          card is read in that order, so it is written in that
                          order: the metadata used to sit above the title,
                          which put two words of chrome in front of the one
                          thing a reader is scanning for.

                          The stamp sits at the foot of the cell. Every cell in
                          a row is the same height — the title reserves two
                          lines and the description is clamped to two — so it
                          costs one `margin-top: auto` and a row's stamps land
                          on one line. It does not wrap: in `pinned` it is the
                          layer and the length, inside a layer the length
                          alone. */}
                      <span class="hs-cell-title">{page.frontmatter?.title}</span>
                      {page.description && <span class="hs-cell-desc">{page.description}</span>}
                      <span class="hs-cell-meta">
                        {layer && (
                          <span class="hs-cell-layer">
                            {(LAYER_LABEL.get(layer) ?? layer).toLowerCase()}
                          </span>
                        )}
                        <span class="hs-cell-stamp">{minutesOf(page)} min</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    )
  }

  HomeStack.afterDOMLoaded = script

  return HomeStack
}) satisfies QuartzComponentConstructor

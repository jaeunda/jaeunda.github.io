import { QuartzPluginData } from "../plugins/vfile"
import { GlobalConfiguration } from "../cfg"
import { getDate } from "./Date"
import { byDateAndAlphabetical, SortFn } from "./PageList"
import readingTime from "reading-time"

// Post metadata shared by the home index and the archive, so a post reports the
// same length and the same date format wherever it is listed.

export interface Layer {
  id: string
  label: string
  blurb: string
}

// The canonical list, in the author's order — which is the site's direction,
// not the request path and not the post count.
//
// Kernel first, then the storage engine: those are what this blog is written
// from, and the home page should open on them however many posts the other
// layers happen to hold. Transport, orchestration and application follow,
// travelling outward from the wire to the browser.
//
// Two earlier orders were wrong in the same way — they let something other than
// the author decide. The request path (application → transport) opened the page
// on browsers; `layersByWeight` opened it on whichever layer had accumulated the
// most posts, so the front page changed subject every time a post was added.
// This array is the display order. Editing it is an editorial decision.
//
// `blurb` is printed inside the tab, under the label, so it is three or four
// words — long enough to say what the layer covers, short enough that five tabs
// stay one grid. English, like the rest of the chrome.
export const LAYERS: Layer[] = [
  { id: "kernel", label: "Kernel", blurb: "Memory and scheduling" },
  { id: "storage", label: "Storage Engine", blurb: "Transactions and concurrency" },
  { id: "transport", label: "Transport", blurb: "Sockets to packets" },
  { id: "orchestration", label: "Orchestration", blurb: "Containers and cluster networking" },
  { id: "application", label: "Application", blurb: "Browsers and service edges" },
]

export const LAYER_LABEL = new Map(LAYERS.map((l) => [l.id, l.label]))
export const LAYER_BLURB = new Map(LAYERS.map((l) => [l.id, l.blurb]))

// The layers that hold at least one post, in `LAYERS` order. Nothing re-sorts
// them: the order above is the answer.
export function layersInOrder(counts: Map<string, number>): Layer[] {
  return LAYERS.filter((l) => (counts.get(l.id) ?? 0) > 0)
}

// Editorial rank *within* a layer, from the post's `rank` frontmatter: 1 is the
// post that should open the layer. It is a judgement about the writing — depth
// of mechanism first, then how close the post sits to what this site is about,
// then how complete it is — and it is deliberately not the publication date.
// A list sorted newest-first tells a first-time reader which post was typed
// most recently, which is not a reason to read it.
//
// Every post carries one; see `design-system.md` → **Editorial Rank** for the
// criteria and for the current ordering, which is judged again whenever a post
// is added rather than appended to.
const UNRANKED = 999

export function rankOf(page: QuartzPluginData): number {
  const rank = page.frontmatter?.rank
  return typeof rank === "number" ? rank : UNRANKED
}

// Rank first, and a post with no rank falls to the end of its layer rather than
// to the top, where a missing number would otherwise put it.
export function byEditorialRank(cfg: GlobalConfiguration): SortFn {
  const byDate = byDateAndAlphabetical(cfg)
  return (a, b) => {
    const diff = rankOf(a) - rankOf(b)
    return diff !== 0 ? diff : byDate(a, b)
  }
}

// Past this many minutes the figure stops reading as a plan and starts reading
// as a warning, so long posts say so instead of printing `63 min`. The whole
// metadata line is English — `10 chapters · long read` — so that one Korean
// phrase does not sit in the middle of it.
const LONG_READ_MINUTES = 40

export function layerOf(page: QuartzPluginData): string | undefined {
  return page.frontmatter?.layer as string | undefined
}

export function minutesOf(page: QuartzPluginData): number {
  return page.text ? Math.ceil(readingTime(page.text).minutes) : 0
}

export function chapterCount(page: QuartzPluginData): number {
  // `toc` depth is normalised so the shallowest heading in the file is 0, but a
  // post can carry a lone banner heading above its real chapters — "CORS" has a
  // single `# In Practice` that would otherwise report the post as 1 chapter.
  // Take the shallowest level that actually has siblings.
  const toc = page.toc ?? []
  if (toc.length === 0) return 0
  const perDepth = new Map<number, number>()
  for (const entry of toc) {
    perDepth.set(entry.depth, (perDepth.get(entry.depth) ?? 0) + 1)
  }
  for (const depth of [...perDepth.keys()].sort((a, b) => a - b)) {
    const count = perDepth.get(depth)!
    if (count > 1) return count
  }
  return toc.length
}

export function lengthLabel(page: QuartzPluginData): string {
  const chapters = chapterCount(page)
  const minutes = minutesOf(page)
  const parts: string[] = []
  if (chapters > 0) parts.push(`${chapters} chapters`)
  if (minutes > 0) parts.push(minutes > LONG_READ_MINUTES ? "long read" : `${minutes} min`)
  return parts.join(" · ")
}

export function isoDate(cfg: GlobalConfiguration, page: QuartzPluginData): string {
  const date = getDate(cfg, page)
  if (!date) return ""
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

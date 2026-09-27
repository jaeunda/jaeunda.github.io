import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { byDateAndAlphabetical } from "./PageList"
import { byEditorialRank } from "./postMeta"
import { QuartzPluginData } from "../plugins/vfile"
import { PostRow } from "./PostRow"

// Shown at the foot of every post.
//
// Before this, a finished post ended in an empty `.page-footer` and the reader
// had nowhere to go. Related posts are drawn from the same `layer` first — the
// same axis the home page is organised on — then from posts that share a
// `topic/` tag, so the suggestion is about the same part of the system rather
// than merely the same date.
//
// **And then it is filled to `LIMIT` from the rest of the archive.** Relevance
// decides the order, not the length: four of twelve posts matched fewer than
// three on layer and topic and two matched exactly one, so a heading that says
// `Read next` stood over a single row and read as something that had failed to
// load. A less related third suggestion is worth more to a reader who has just
// finished a post than an empty half-block.

const LIMIT = 3
const TOPIC_PREFIX = "topic/"

function topicsOf(page: QuartzPluginData): Set<string> {
  const tags = (page.frontmatter?.tags ?? []) as string[]
  return new Set(tags.filter((t) => t.startsWith(TOPIC_PREFIX)))
}

export default (() => {
  const ReadNext: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    // `quartz.layout.ts` mounts this on posts only; these two are the belt to
    // that brace, for anything that mounts it without the condition.
    if (fileData.slug === "index") return null
    if ((fileData.slug ?? "").startsWith("tags")) return null
    if (fileData.frontmatter?.unlisted === true) return null

    const here = fileData.slug!
    const candidates = allFiles
      .filter((p) => p.slug !== here && p.slug !== "index" && p.frontmatter?.unlisted !== true)
      .sort(byDateAndAlphabetical(cfg))

    const layer = fileData.frontmatter?.layer as string | undefined
    const topics = topicsOf(fileData)

    // Same layer, in the layer's own editorial order rather than by date, so
    // the suggestion is the best next post in this part of the system and not
    // the most recent one. Topic matches keep the date order: they cross
    // layers, where one ranking cannot compare them.
    const sameLayer = layer
      ? candidates.filter((p) => p.frontmatter?.layer === layer).sort(byEditorialRank(cfg))
      : []
    const sameTopic = candidates.filter(
      (p) => !sameLayer.includes(p) && [...topicsOf(p)].some((t) => topics.has(t)),
    )

    // Newest first for the filler: with no layer or topic in common, recency
    // is the only honest ordering left.
    const related = new Set([...sameLayer, ...sameTopic])
    const rest = candidates.filter((p) => !related.has(p))
    const picked: QuartzPluginData[] = [...sameLayer, ...sameTopic, ...rest].slice(0, LIMIT)
    if (picked.length === 0) return null

    return (
      <section class={`read-next ${displayClass ?? ""}`}>
        <p class="rn-label">Read next</p>
        {/* The same row the home index, the archive and the topic panels use.
            This was three bordered cards printing only a title and a
            description: the last post list a reader saw was the one that would
            not tell them how long anything was, and the only card block on a
            site whose design contract rules out card-heavy styling. */}
        <ul class="post-rows">
          {picked.map((page) => (
            <PostRow page={page} here={here} cfg={cfg} />
          ))}
        </ul>
      </section>
    )
  }

  return ReadNext
}) satisfies QuartzComponentConstructor

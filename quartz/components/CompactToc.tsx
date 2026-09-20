import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { chapterCount } from "./postMeta"

// The table of contents for everything narrower than the desktop rail.
//
// Below 1200px the right rail is gone, and with it the only way to see a post's
// shape or jump inside it — a 9-chapter, 24-minute post offered a phone reader
// nothing but the scrollbar. This is the same list the rail carries, rendered
// as a native `<details>` so it costs no script, starts closed, and takes one
// line until it is asked for.

export default (() => {
  const CompactToc: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const toc = fileData.toc
    if (!toc || toc.length === 0) return null

    // `depth` is already normalised to 0 for the shallowest heading, but a post
    // that opens with a lone banner heading can start deeper; re-base so the
    // indent always begins at the left edge.
    const base = Math.min(...toc.map((entry) => entry.depth))

    return (
      <details class={`compact-toc ${displayClass ?? ""}`}>
        <summary>
          <span class="ctoc-label">Outline</span>
          {/* The same count the home index and the archive print for this post.
              Using `toc.length` here reported 14 against their 5, because the
              list carries sub-headings the chapter count deliberately ignores. */}
          <span class="ctoc-count">{chapterCount(fileData)}</span>
        </summary>
        <ul class="ctoc-list">
          {toc.map((entry) => (
            <li key={entry.slug} class={`ctoc-depth-${Math.min(entry.depth - base, 2)}`}>
              <a href={`#${entry.slug}`}>{entry.text}</a>
            </li>
          ))}
        </ul>
      </details>
    )
  }

  return CompactToc
}) satisfies QuartzComponentConstructor

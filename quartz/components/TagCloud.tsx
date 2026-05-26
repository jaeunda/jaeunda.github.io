import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

interface Options {
  limit: number
}

const defaultOptions: Options = { limit: 8 }

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const TagCloud: QuartzComponent = ({ allFiles, fileData, displayClass }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const tagCounts = new Map<string, number>()
    for (const file of allFiles) {
      const tags = file.frontmatter?.tags ?? []
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    const topTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, options.limit)

    if (topTags.length === 0) return null

    return (
      <section class={`top-tags ${displayClass ?? ""}`}>
        <div class="section-header">
          <div class="section-title">
            Topics
            <span class="section-title-count">{topTags.length}</span>
          </div>
          <a
            href={resolveRelative(fileData.slug!, "tags/" as FullSlug)}
            class="section-action"
          >
            all tags →
          </a>
        </div>
        <div class="top-tags-list">
          {topTags.map(([tag, count], i) => (
            <a
              href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
              class={`top-tag ${i === 0 ? "featured" : ""}`}
            >
              #{tag}
              <span class="top-tag-count">{count}</span>
            </a>
          ))}
        </div>
      </section>
    )
  }

  return TagCloud
}) satisfies QuartzComponentConstructor

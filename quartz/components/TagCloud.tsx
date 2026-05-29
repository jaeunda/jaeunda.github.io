import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { concatenateResources } from "../util/resources"
// @ts-ignore
import homeFilterScript from "./scripts/homeFilter.inline"
// @ts-ignore
import tagIndexFilterScript from "./scripts/tagIndexFilter.inline"

interface Options {
  limit: number
  showOnAllPages: boolean
  variant: "home" | "sidebar"
}

const defaultOptions: Options = { limit: 8, showOnAllPages: false, variant: "home" }
const topicPrefix = "topic/"

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const TagCloud: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const isIndex = fileData.slug === "index"
    const isSidebar = options.variant === "sidebar"
    const isTagIndex = fileData.slug === "tags/index"
    if (!isIndex && !options.showOnAllPages) return null
    if (isSidebar && isTagIndex) return null

    const tagCounts = new Map<string, number>()
    for (const file of allFiles) {
      const tags = file.frontmatter?.tags ?? []
      for (const tag of tags) {
        if (!tag.startsWith(topicPrefix)) continue
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, options.limit)

    if (topTags.length === 0) return null

    return (
      <section
        class={`top-tags ${isSidebar ? "sidebar-topics" : ""} ${displayClass ?? ""}`}
        data-home-tagcloud={isIndex ? "" : undefined}
      >
        <div class="section-header">
          <div class="section-title">
            Topics
            <span class="section-title-count">{topTags.length}</span>
          </div>
          <a href={resolveRelative(fileData.slug!, "tags/" as FullSlug)} class="section-action">
            all tags →
          </a>
        </div>
        <div class="top-tags-list">
          {topTags.map(([tag, count]) => {
            const label = tag.slice(topicPrefix.length)

            return (
              <a
                href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                class="top-tag"
                data-tag={isIndex ? tag : undefined}
              >
                <span class="top-tag-label">#{label}</span>
                <span class="top-tag-count">{count}</span>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  TagCloud.afterDOMLoaded = concatenateResources(homeFilterScript, tagIndexFilterScript)
  return TagCloud
}) satisfies QuartzComponentConstructor

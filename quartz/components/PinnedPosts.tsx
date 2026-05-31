import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import readingTime from "reading-time"
import { i18n } from "../i18n"

interface Options {
  showTags: boolean
  showReadTime: boolean
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  showTags: true,
  showReadTime: true,
  filter: (page) => page.slug !== "index",
})

function pinnedSort(cfg: GlobalConfiguration) {
  const byDate = byDateAndAlphabetical(cfg)
  return (a: QuartzPluginData, b: QuartzPluginData): number => {
    const ao =
      typeof a.frontmatter?.pinOrder === "number"
        ? (a.frontmatter.pinOrder as number)
        : undefined
    const bo =
      typeof b.frontmatter?.pinOrder === "number"
        ? (b.frontmatter.pinOrder as number)
        : undefined
    if (ao !== undefined && bo !== undefined) return ao - bo
    if (ao !== undefined) return -1
    if (bo !== undefined) return 1
    return byDate(a, b)
  }
}

export default ((userOpts?: Partial<Options>) => {
  const PinnedPosts: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pins = allFiles
      .filter(opts.filter)
      .filter((p) => p.frontmatter?.featured === true)
      .sort(pinnedSort(cfg))

    if (pins.length === 0) return null

    // Group into pairs for row-level dividers
    const rows: QuartzPluginData[][] = []
    for (let i = 0; i < pins.length; i += 2) {
      rows.push(pins.slice(i, Math.min(i + 2, pins.length)))
    }

    return (
      <section class={`pinned-posts-section ${displayClass ?? ""}`}>
        <div class="section-header">
          <div class="section-title">
            Pinned
            <span class="section-title-count">{pins.length}</span>
          </div>
          <a href={resolveRelative(fileData.slug!, "tags/" as FullSlug)} class="section-action">
            all posts →
          </a>
        </div>

        <div class="pinned-grid">
          {rows.map((row) => (
            <div class="pin-row">
              {row.map((page) => {
                const title =
                  page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
                const date = getDate(cfg, page)
                const day = date ? String(date.getDate()).padStart(2, "0") : ""
                const monthYear = date
                  ? date
                      .toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      .toUpperCase()
                  : ""
                const preview = page.description ?? ""
                const tags: string[] = (page.frontmatter?.tags ?? []).filter((t: string) =>
                  t.startsWith("topic/"),
                )
                const readTime = page.text
                  ? i18n(cfg.locale).components.contentMeta.readingTime({
                      minutes: Math.ceil(readingTime(page.text).minutes),
                    })
                  : ""

                return (
                  <article class="pin-card" data-tags={page.frontmatter?.tags?.join(",") ?? ""}>
                    <a
                      href={resolveRelative(fileData.slug!, page.slug!)}
                      class="pin-card-link"
                      aria-label={title}
                    />
                    {/* Date col: hidden on desktop, shown in mobile list mode */}
                    <div class="pin-card-date">
                      <span class="day">{day}</span>
                      <span class="month-year">{monthYear}</span>
                    </div>
                    <div class="pin-card-body">
                      <div class="pin-card-title">{title}</div>
                      {preview && <p class="pin-card-preview">{preview}</p>}
                      <div class="pin-card-meta">
                        {opts.showTags &&
                          tags.slice(0, 2).map((tag) => (
                            <a
                              href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                              class="pin-card-tag"
                            >
                              #{tag.slice("topic/".length)}
                            </a>
                          ))}
                        {opts.showReadTime && readTime && (
                          <span class="pin-card-readtime">{readTime}</span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return PinnedPosts
}) satisfies QuartzComponentConstructor

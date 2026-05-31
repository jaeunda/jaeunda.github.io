import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import readingTime from "reading-time"
import { i18n } from "../i18n"

interface Options {
  limit: number
  showTags: boolean
  showReadTime: boolean
  mode: "recent" | "featured"
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 5,
  showTags: true,
  showReadTime: true,
  mode: "recent",
  filter: (page) => page.slug !== "index",
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const RecentNotesWithPreview: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const opts = { ...defaultOptions(cfg), ...userOpts }
    const sorted = allFiles.filter(opts.filter).sort(opts.sort)
    const featured = opts.mode === "featured" ? sorted.filter((p) => p.frontmatter?.featured === true) : []
    const pages = featured.length > 0 ? featured : sorted.slice(0, opts.limit)

    return (
      <section class={`recent-posts-section ${displayClass ?? ""}`} data-home-recent>
        <div class="section-header">
          <div class="section-title">
            {opts.mode === "featured" ? "Featured" : "Recent"}
            <span class="section-title-count" data-recent-count>
              {pages.length}
            </span>
          </div>
          <a href={resolveRelative(fileData.slug!, "tags/" as FullSlug)} class="section-action">
            {opts.mode === "featured" ? "all posts →" : "archive →"}
          </a>
        </div>

        <div class="active-filter" data-active-filter hidden>
          <span class="active-filter-label">Filter</span>
          <span class="active-filter-chip">
            <span class="active-filter-tag" data-active-filter-tag></span>
            <button class="active-filter-clear" data-active-filter-clear aria-label="필터 해제">
              ×
            </button>
          </span>
        </div>

        <div class="recent-posts" data-recent-list>
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const date = getDate(cfg, page)
            const day = date ? String(date.getDate()).padStart(2, "0") : ""
            const monthYear = date
              ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()
              : ""
            const preview = page.description ?? ""
            const tags: string[] = page.frontmatter?.tags ?? []
            const readTime = page.text
              ? i18n(cfg.locale).components.contentMeta.readingTime({
                  minutes: Math.ceil(readingTime(page.text).minutes),
                })
              : ""

            return (
              <article class="post-card" data-tags={tags.join(",")}>
                <a
                  href={resolveRelative(fileData.slug!, page.slug!)}
                  class="post-card-link"
                  aria-label={title}
                />
                <div class="post-date-col">
                  <span class="day">{day}</span>
                  <span class="month-year">{monthYear}</span>
                </div>
                <div class="post-content-col">
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="post-title">
                    {title}
                  </a>
                  {preview && <p class="post-preview">{preview}</p>}
                  <div class="post-meta-row">
                    {opts.showTags &&
                      tags.slice(0, 3).map((tag) => (
                        <a
                          href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                          class="post-tag"
                        >
                          #{tag}
                        </a>
                      ))}
                    {opts.showReadTime && readTime && <span class="post-readtime">{readTime}</span>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div class="recent-empty" data-recent-empty hidden>
          <p>해당 태그의 글이 없습니다.</p>
        </div>
      </section>
    )
  }

  return RecentNotesWithPreview
}) satisfies QuartzComponentConstructor

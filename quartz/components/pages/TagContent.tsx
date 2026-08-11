import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { byDateAndAlphabetical, SortFn } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { getDate } from "../Date"
import readingTime from "reading-time"
// @ts-ignore
import tagIndexFilterScript from "../scripts/tagIndexFilter.inline"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

function splitTag(tag: string) {
  const [prefix, ...rest] = tag.split("/")
  return rest.length === 0 ? { prefix: "other", label: tag } : { prefix, label: rest.join("/") }
}

function tagGroupLabel(prefix: string) {
  return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

function ArchivePostList({
  cfg,
  fileData,
  pages,
  sort,
}: QuartzComponentProps & { pages: QuartzPluginData[]; sort?: SortFn }) {
  const sorter = sort ?? byDateAndAlphabetical(cfg)
  const list = pages.filter((page) => page.slug !== "index").sort(sorter)

  return (
    <div class="recent-posts">
      {list.map((page) => {
        const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
        const preview = page.description ?? ""
        const tags: string[] = page.frontmatter?.tags ?? []
        const date = getDate(cfg, page)
        const day = date ? String(date.getDate()).padStart(2, "0") : ""
        const monthYear = date
          ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()
          : ""
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
                {tags.slice(0, 3).map((tag) => (
                  <a
                    href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    class="post-tag"
                  >
                    #{tag}
                  </a>
                ))}
                {readTime && <span class="post-readtime">{readTime}</span>}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const allPagesWithTag = (tag: string) =>
      allFiles.filter((file) =>
        (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
      )

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    if (tag === "/") {
      const allTags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))
      const tags = allTags.filter((tag) => !allTags.some((other) => other.startsWith(`${tag}/`)))
      const tagItemMap: Map<string, QuartzPluginData[]> = new Map()
      for (const tag of tags) {
        tagItemMap.set(tag, allPagesWithTag(tag))
      }
      const tagsByPostCount = tags.toSorted((a, b) => {
        const countDiff = tagItemMap.get(b)!.length - tagItemMap.get(a)!.length
        return countDiff === 0 ? a.localeCompare(b) : countDiff
      })
      const tagGroups = tagsByPostCount.reduce<Array<{ prefix: string; tags: string[] }>>(
        (groups, tag) => {
          const { prefix } = splitTag(tag)
          const existing = groups.find((group) => group.prefix === prefix)
          if (existing) existing.tags.push(tag)
          else groups.push({ prefix, tags: [tag] })
          return groups
        },
        [],
      )
      const primaryGroups = tagGroups.filter(
        ({ prefix }) => prefix === "topic" || prefix === "project",
      )
      const fallbackGroups = tagGroups.filter(
        ({ prefix }) => prefix !== "topic" && prefix !== "project",
      )
      const defaultPrefix = primaryGroups.some(({ prefix }) => prefix === "topic")
        ? "topic"
        : primaryGroups.at(0)?.prefix
      const archivePages = allFiles.filter((page) => page.slug !== "index")
      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <section class="tag-index-filter top-tags" data-tag-index-filter>
            {primaryGroups.length > 0 && (
              <div class="tag-index-tabs" role="tablist" aria-label="Tag groups">
                {primaryGroups.map(({ prefix }) => (
                  <button
                    type="button"
                    class={`tag-index-tab ${prefix === defaultPrefix ? "active" : ""}`}
                    data-tag-index-tab={prefix}
                    aria-selected={prefix === defaultPrefix ? "true" : "false"}
                  >
                    {tagGroupLabel(prefix)}
                  </button>
                ))}
              </div>
            )}
            <div class="tag-index-filter-groups">
              {[...primaryGroups, ...fallbackGroups].map(({ prefix, tags }) => (
                <div
                  class="tag-index-filter-group"
                  data-tag-index-chip-group={prefix}
                  hidden={prefix !== defaultPrefix}
                >
                  <div class="top-tags-list">
                    {tags.map((tag) => {
                      const pages = tagItemMap.get(tag)!
                      const { label } = splitTag(tag)
                      const tagListingPage = `/tags/${tag}` as FullSlug
                      const href = resolveRelative(fileData.slug!, tagListingPage)

                      return (
                        <a href={href} class="top-tag" data-tag-index-chip data-tag={tag}>
                          #{label}
                          <span class="top-tag-count">{pages.length}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section class="recent-posts-section archive-posts-section" data-tag-index-all-posts>
            <div class="section-header">
              <div class="section-title">
                All Posts
                <span class="section-title-count">{archivePages.length}</span>
              </div>
            </div>
            <ArchivePostList {...props} pages={archivePages} sort={options?.sort} />
          </section>
          <div class="tag-index-sections">
            {tagsByPostCount.map((tag) => {
              const pages = tagItemMap.get(tag)!

              const contentPage = allFiles.filter((file) => file.slug === `tags/${tag}`).at(0)

              const root = contentPage?.htmlAst
              const content =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)
              const { prefix, label } = splitTag(tag)

              return (
                <div data-tag-index-section data-tag={tag} data-tag-prefix={prefix} hidden>
                  <h2 class="tag-index-heading">
                    <a href={href}>
                      <span class="tag-index-heading-prefix">{prefix}</span>
                      <span class="tag-index-heading-label">{label}</span>
                    </a>
                    <span class="tag-index-heading-count">{pages.length}</span>
                  </h2>
                  {content && <p>{content}</p>}
                  <ArchivePostList {...props} pages={pages} sort={options?.sort} />
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <section class="archive-posts-section tag-posts-section">
            <ArchivePostList {...props} pages={pages} sort={options?.sort} />
          </section>
        </div>
      )
    }
  }

  TagContent.css = style
  TagContent.afterDOMLoaded = tagIndexFilterScript
  return TagContent
}) satisfies QuartzComponentConstructor

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
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

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
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
      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <section class="tag-index-filter top-tags" data-tag-index-filter>
            <div class="section-header">
              <div class="section-title">
                Tags
                <span class="section-title-count">{tags.length}</span>
              </div>
            </div>
            <div class="tag-index-filter-groups">
              {tagGroups.map(({ prefix, tags }) => (
                <div class="tag-index-filter-group">
                  <div class="tag-index-filter-prefix">{prefix}</div>
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
          <div class="tag-index-sections">
            {tagsByPostCount.map((tag) => {
              const pages = tagItemMap.get(tag)!
              const listProps = {
                ...props,
                allFiles: pages,
              }

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
                <div data-tag-index-section data-tag={tag}>
                  <h2 class="tag-index-heading">
                    <a href={href}>
                      <span class="tag-index-heading-prefix">{prefix}</span>
                      <span class="tag-index-heading-label">{label}</span>
                    </a>
                    <span class="tag-index-heading-count">{pages.length}</span>
                  </h2>
                  {content && <p>{content}</p>}
                  <div class="page-listing">
                    <PageList {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)
      const listProps = {
        ...props,
        allFiles: pages,
      }

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <p>{i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
            <div>
              <PageList {...listProps} sort={options?.sort} />
            </div>
          </div>
        </div>
      )
    }
  }

  TagContent.css = concatenateResources(style, PageList.css)
  TagContent.afterDOMLoaded = tagIndexFilterScript
  return TagContent
}) satisfies QuartzComponentConstructor

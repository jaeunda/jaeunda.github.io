import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, getAllSegmentPrefixes, simplifySlug } from "../util/path"

const ArticleTitle: QuartzComponent = ({
  fileData,
  displayClass,
  allFiles,
}: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (title) {
    // Three tag destinations, three headings. `tags/index` is Posts — every
    // post, newest first. `tags/topic` is Topics — the same posts grouped by
    // subject. `tags/topic/<name>` is one subject. `project/` pages are still
    // emitted but nothing links to them; they fall through to the generic form.
    const isTagIndex = fileData.slug === "tags/index"
    const isTopicIndex = fileData.slug === "tags/topic"
    const isTagPage = fileData.slug?.startsWith("tags/") ?? false
    const tag = isTagPage ? simplifySlug(fileData.slug!.slice("tags/".length) as FullSlug) : null
    const topicCount = isTopicIndex
      ? new Set(
          allFiles
            .flatMap((page) => (page.frontmatter?.tags ?? []) as string[])
            .filter((t) => t.startsWith("topic/")),
        ).size
      : null
    const itemCount = isTagIndex
      ? allFiles.filter((page) => page.slug !== "index").length
      : isTopicIndex
        ? topicCount
        : tag
          ? allFiles.filter((page) =>
              (page.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
            ).length
          : null
    const [tagPrefix, ...tagLabelParts] = tag?.split("/") ?? []
    const tagLabel = tagLabelParts.length > 0 ? tagLabelParts.join("/") : tagPrefix
    const isLeafTag = !isTagIndex && !isTopicIndex && tagLabelParts.length > 0

    // Every tag page gets the same heading shape and the same size step, so
    // `/tags/`, `/tags/topic` and `/tags/topic/database` read as three pages of
    // one kind. They used to be 40px, 40px and 16px — the leaf looked like its
    // title had failed to render. The namespace index also fell through to the
    // raw frontmatter title and printed "Tag: project".
    const heading = isTagIndex
      ? "Posts"
      : isTopicIndex
        ? "Topics"
        : isLeafTag
          ? tagLabel
          : (tagPrefix ?? title)

    const titleElement = isTagPage ? (
      <h1
        class={classNames(displayClass, "article-title", "tag-page-title")}
        // A leaf's visible label is the bare name — the `#` is drawn in CSS, so
        // it is not announced — and the full tag path is worth having there.
        // Everywhere else the frontmatter title is the wrong thing to announce:
        // it overrode the visible "Topics" with "Tag: topic".
        aria-label={isLeafTag ? title : undefined}
        data-leaf={isLeafTag ? "true" : undefined}
      >
        {/* `topic` is the only namespace a reader is ever shown, so naming it
            here says nothing — and a leaf label is already prefixed with `#`,
            which would have read "topic #database". */}
        {isLeafTag && tagPrefix !== "topic" && <span class="tag-page-ns">{tagPrefix}</span>}
        <span class="tag-page-label">{heading}</span>
        {itemCount !== null && <span class="article-title-count">{itemCount}</span>}
      </h1>
    ) : (
      <h1 class={classNames(displayClass, "article-title")}>{title}</h1>
    )

    return titleElement
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0.72rem;
}

/* The one count treatment on the site. It used to be 0.78rem beside a 40px
   word — 0.31x, so "12" read as a footnote marker floating in whitespace —
   while the leaf-topic pages used a second class at a second size. Every other
   count here (.hs-layer-count, .topic-chip-count) sits at roughly 0.8x its
   label, which is where this now lands against the list-title step. */
.article-title-count {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 12px;
  font-weight: 400;
  margin-left: 0.15rem;
  vertical-align: baseline;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor

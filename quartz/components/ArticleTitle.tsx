import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../util/path"

const ArticleTitle: QuartzComponent = ({
  fileData,
  displayClass,
  allFiles,
}: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (title) {
    const isTagIndex = fileData.slug === "tags/index"
    const isTagPage = fileData.slug?.startsWith("tags/") ?? false
    const tag = isTagPage ? simplifySlug(fileData.slug!.slice("tags/".length) as FullSlug) : null
    const itemCount = isTagIndex
      ? allFiles.filter((page) => page.slug !== "index").length
      : tag
        ? allFiles.filter((page) =>
            (page.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
          ).length
        : null
    const [tagPrefix, ...tagLabelParts] = tag?.split("/") ?? []
    const tagLabel = tagLabelParts.length > 0 ? tagLabelParts.join("/") : tagPrefix

    const titleElement =
      !isTagIndex && tag ? (
        <h1 class={classNames(displayClass, "article-title", "tag-page-title")} aria-label={title}>
          <span class="tag-index-heading-prefix">
            {tagLabelParts.length > 0 ? tagPrefix : "tag"}
          </span>
          <span class="tag-index-heading-label">{tagLabel}</span>
          {itemCount !== null && <span class="tag-index-heading-count">{itemCount}</span>}
        </h1>
      ) : (
        <h1 class={classNames(displayClass, "article-title")}>
          {title}
          {itemCount !== null && <span class="article-title-count">{itemCount}</span>}
        </h1>
      )

    if (isTagPage) {
      const backHref = isTagIndex
        ? resolveRelative(fileData.slug!, "index" as FullSlug)
        : resolveRelative(fileData.slug!, "tags/" as FullSlug)
      return (
        <>
          <a
            href={backHref}
            class="tag-index-back"
            aria-label={isTagIndex ? "Back to home" : "Back to archive"}
          >
            ←
          </a>
          {titleElement}
        </>
      )
    }

    return titleElement
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0.72rem;
}

.article-title-count {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.78rem;
  font-weight: 400;
  margin-left: 0.5rem;
  vertical-align: baseline;
}

.tag-index-back {
  align-items: center;
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  color: var(--gray);
  display: inline-flex;
  font-family: var(--codeFont);
  font-size: 1rem;
  height: 1.8rem;
  justify-content: center;
  margin: 1.7rem 0 -0.7rem;
  text-decoration: none;
  width: 1.8rem;
}

.tag-index-back:hover {
  border-color: var(--secondary);
  color: var(--tertiary);
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor

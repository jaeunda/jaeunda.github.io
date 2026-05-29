import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"

const ArticleTitle: QuartzComponent = ({
  fileData,
  displayClass,
  allFiles,
}: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (title) {
    const isTagIndex = fileData.slug === "tags/index"
    const itemCount = isTagIndex ? allFiles.filter((page) => page.slug !== "index").length : null

    const titleElement = (
      <h1 class={classNames(displayClass, "article-title")}>
        {title}
        {itemCount !== null && <span class="article-title-count">{itemCount}</span>}
      </h1>
    )

    if (isTagIndex) {
      return (
        <>
          <a
            href={resolveRelative(fileData.slug!, "index" as FullSlug)}
            class="tag-index-back"
            aria-label="Back to home"
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

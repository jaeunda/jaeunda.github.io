import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

// Only `topic/` tags are shown to readers, here and everywhere else. `project/`
// records which body of work a post came out of — useful to the author, noise
// to someone deciding whether to read it — and it was the reason the archive
// needed a Topic/Project tab strip at the top of the page.
const TOPIC_PREFIX = "topic/"

const TagList: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const tags = ((fileData.frontmatter?.tags ?? []) as string[]).filter((t) =>
    t.startsWith(TOPIC_PREFIX),
  )
  if (tags.length > 0) {
    return (
      <ul class={classNames(displayClass, "tags", "content-tags")}>
        {tags.map((tag) => {
          const linkDest = resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)
          // Now that only one namespace is ever shown, printing it on every
          // chip is a prefix that never varies. `#database`, as the topic index
          // and the archive print it.
          //
          // The `#` itself is drawn by `a.tag-link::before` in base.scss, which
          // every tag chip in Quartz already gets. Printing it here as well is
          // what rendered `##database` on every post.
          return (
            <li>
              <a href={linkDest} class="internal tag-link">
                {tag.slice(TOPIC_PREFIX.length)}
              </a>
            </li>
          )
        })}
      </ul>
    )
  } else {
    return null
  }
}

TagList.css = `
.tags {
  list-style: none;
  display: flex;
  padding-left: 0;
  gap: 0.4rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.content-tags {
  gap: 0.35rem;
  margin: 0 0 1.8rem;
}

.section-li > .section > .tags {
  justify-content: flex-end;
}
  
.tags > li {
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  overflow-wrap: normal;
}

a.internal.tag-link {
  border-radius: 8px;
  background-color: var(--highlight);
  padding: 0.2rem 0.4rem;
  margin: 0 0.1rem;
  font-size: 0.9rem;
}

.content-tags a.internal.tag-link {
  border-radius: 5px;
  padding: 0.18rem 0.48rem;
  font-family: var(--codeFont);
  font-size: 0.78rem;
  color: var(--tertiary);
}
`

export default (() => TagList) satisfies QuartzComponentConstructor

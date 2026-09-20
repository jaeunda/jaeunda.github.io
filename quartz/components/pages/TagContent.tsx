import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { byDateAndAlphabetical, SortFn } from "../PageList"
import { PostRow } from "../PostRow"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { ComponentChildren } from "preact"
// @ts-ignore: .inline.ts files are loaded as text by the esbuild inline-script-loader
import topicSwitcherScript from "../scripts/topicSwitcher.inline"

const TOPIC_TAG = "topic"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

function ArchivePostList({
  cfg,
  fileData,
  pages,
  sort,
}: QuartzComponentProps & { pages: QuartzPluginData[]; sort?: SortFn }) {
  const sorter = sort ?? byDateAndAlphabetical(cfg)
  const list = pages.filter((page) => page.slug !== "index").sort(sorter)

  // Same row vocabulary as the home index, from the same helpers, so a post
  // reports the same length and date wherever it is listed.
  return (
    <ul class="post-rows">
      {list.map((page) => (
        <PostRow page={page} here={fileData.slug!} cfg={cfg} />
      ))}
    </ul>
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
    const archivePages = allFiles.filter((page) => page.slug !== "index")

    // Posts — every post, newest first, in the home page's row design and
    // nothing else. It used to open with a Topic/Project tab strip above a
    // chip cloud above the list: three navigation devices stacked on the one
    // page whose whole job is "here is everything, in order".
    if (tag === "/") {
      return (
        <div class="popover-hint">
          {content && (
            <article class={classes}>
              <p>{content}</p>
            </article>
          )}
          <section class="archive-posts-section">
            <ArchivePostList {...props} pages={archivePages} sort={options?.sort} />
          </section>
        </div>
      )
    }

    // Topics — the same posts, grouped by subject, as **one** switcher rather
    // than a vertical stack of every group. `tags/topic` used to render a flat
    // list of every post that carried any `topic/` tag, which is the same
    // twelve rows Posts already showed; the stack that replaced it was correct
    // but ran nine sections deep, so the page was a scroll, not a chooser.
    //
    // A strip of subjects that scrolls sideways and one open panel keeps the
    // page on one screen at nine subjects and at ninety: nothing here is sized
    // to the current count.
    if (tag === TOPIC_TAG) {
      const topics = [
        ...new Set(
          allFiles
            .flatMap((page) => (page.frontmatter?.tags ?? []) as string[])
            .filter((t) => t.startsWith(`${TOPIC_TAG}/`)),
        ),
      ]
        .map((t) => ({ tag: t, label: t.slice(TOPIC_TAG.length + 1), pages: allPagesWithTag(t) }))
        .sort((a, b) => {
          const diff = b.pages.length - a.pages.length
          return diff === 0 ? a.label.localeCompare(b.label) : diff
        })

      const open = topics.at(0)?.tag

      return (
        <div class="popover-hint">
          {content && (
            <article class={classes}>
              <p>{content}</p>
            </article>
          )}
          <div class="topic-switcher" data-topic-switcher>
            <nav class="topic-bar" aria-label="Topics">
              {/* Links, not buttons: the script intercepts a plain left click
                  to switch in place, and everything else — no JavaScript, a
                  Cmd-click, a middle click — opens the subject's own page.
                  They wrap, so there are no step buttons and no scroller. */}
              <div class="topic-strip" data-topic-strip>
                {topics.map(({ tag: topicTag, label, pages }) => (
                  <a
                    id={`topic-${label}`}
                    class="topic-chip"
                    href={resolveRelative(fileData.slug!, `/tags/${topicTag}` as FullSlug)}
                    data-topic={topicTag}
                    aria-current={topicTag === open ? "true" : undefined}
                  >
                    <span class="topic-chip-name">#{label}</span>
                    <span class="topic-chip-count">{pages.length}</span>
                  </a>
                ))}
              </div>
            </nav>

            {topics.map(({ tag: topicTag, label, pages }) => (
              <section
                class="topic-panel"
                data-topic={topicTag}
                aria-labelledby={`topic-${label}`}
                hidden={topicTag !== open}
              >
                <ArchivePostList {...props} pages={pages} sort={options?.sort} />
              </section>
            ))}
          </div>
        </div>
      )
    }

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

  TagContent.css = style
  TagContent.afterDOMLoaded = topicSwitcherScript
  return TagContent
}) satisfies QuartzComponentConstructor

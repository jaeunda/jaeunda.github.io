import { JSX } from "preact"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { isoDate, lengthLabel } from "./postMeta"

// One row, used by every list of posts on the site: the home index
// (`HomeStack`), the archive and the topic panels (`TagContent`), and the
// suggestions at the foot of a post (`ReadNext`).
//
// This markup was written out three times. Two copies had already drifted —
// `ReadNext` rendered bordered cards with no date and no length, so the last
// list a reader saw was the one that would not say how long anything was, in
// the only visual language nothing else on the site used. A row is one thing,
// so it is one function.
//
// Not a `QuartzComponent`: it takes a page rather than the build context, and
// it is never mounted from `quartz.layout.ts`.

interface PostRowProps {
  page: QuartzPluginData
  // The page doing the linking, so the href can be resolved relative to it.
  here: FullSlug
  cfg: GlobalConfiguration
  // The home index hides rows that are not in the open layer.
  hidden?: boolean
  // `data-layer` is what `homeStack.inline.ts` filters on.
  layer?: string
}

export function PostRow({ page, here, cfg, hidden, layer }: PostRowProps): JSX.Element {
  const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title

  return (
    <li class={`post-row${hidden ? " is-hidden" : ""}`} data-layer={layer}>
      <a class="post-row-link" href={resolveRelative(here, page.slug!)} aria-label={title}>
        <span class="post-row-date">{isoDate(cfg, page)}</span>
        <span class="post-row-main">
          <span class="post-row-title">{title}</span>
          {page.description && <span class="post-row-desc">{page.description}</span>}
          {/* The row prints its length and nothing else. On the home page the
              open Layers tab already names the layer, so every row repeated it;
              printing it on some lists and not others would have made one row
              design into two. */}
          <span class="post-row-meta">{lengthLabel(page)}</span>
        </span>
      </a>
    </li>
  )
}

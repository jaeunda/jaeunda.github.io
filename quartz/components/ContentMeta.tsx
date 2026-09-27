import { getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"
import { isoDate, LAYER_LABEL, layerOf, lengthLabel } from "./postMeta"
import style from "./styles/contentMeta.scss"

// The metadata line under a post's title.
//
// It used to be Quartz's own: a US-format date from `Date` and a `10 min read`
// string from i18n. Every list on the site — the home index, the archive, the
// topic panels — prints `2026-04-19` and `5 chapters · 10 min` from
// `postMeta.ts`, whose header calls itself the contract "so a post reports the
// same length and the same date format wherever it is listed". The post page
// was the one surface that did not honour it, so the same post carried two
// dates and two ways of saying how long it is, and the chapter count reached a
// desktop reader nowhere at all — `CompactToc` is `display: none` above the
// desktop breakpoint.
//
// **The layer is the line's first segment.** It had a line of its own above the
// title — `PostKicker`, printing the layer and the blurb it carries on the home
// chooser — and under it the date and length, and under that a `#topic` chip:
// three rows of classification around one title, in three different shapes.
// The layer belongs with the other facts about the post, in the same mono
// voice and the same order the home cells print them.
export default (() => {
  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    if (!fileData.text) return null

    const date = getDate(cfg, fileData) ? isoDate(cfg, fileData) : ""
    const length = lengthLabel(fileData)
    const segments = [date, length].filter((segment) => segment !== "")

    // It still links back to the layer's tab on the home page, which is what
    // the kicker above the title was for.
    const layer = layerOf(fileData)
    const layerLabel = layer ? LAYER_LABEL.get(layer) : undefined
    const home = resolveRelative(fileData.slug!, "/" as FullSlug)

    if (segments.length === 0 && !layerLabel) return null

    // The segments are separated by a middot drawn in CSS — see `.content-meta`
    // in custom.scss.
    return (
      <p class={classNames(displayClass, "content-meta")}>
        {layerLabel && (
          <span>
            <a class="content-meta-layer" href={`${home}?layer=${layer}`}>
              {layerLabel.toLowerCase()}
            </a>
          </span>
        )}
        {segments.map((segment) => (
          <span>{segment}</span>
        ))}
      </p>
    )
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor

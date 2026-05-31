import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/visitorCount.inline.scss"
import script from "./scripts/visitorCount.inline"

interface VisitorCountOptions {
  workerUrl: string
}

const defaultOptions: VisitorCountOptions = {
  workerUrl: "",
}

export default ((opts?: Partial<VisitorCountOptions>) => {
  const options: VisitorCountOptions = { ...defaultOptions, ...opts }

  const eyeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const VisitorCount: QuartzComponent = (_props: QuartzComponentProps) => {
    if (!options.workerUrl) return null

    return (
      <div class="visitor-count" data-worker-url={options.workerUrl} aria-hidden="true">
        {eyeIcon}
        <span class="visitor-count-text">
          <span class="visitor-count-value">—</span>
          <span>visitors</span>
        </span>
      </div>
    )
  }

  VisitorCount.css = style
  VisitorCount.afterDOMLoaded = script

  return VisitorCount
}) satisfies QuartzComponentConstructor

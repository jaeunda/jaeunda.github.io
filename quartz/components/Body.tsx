// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { isUnlisted } from "../util/visibility"

const Body: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  return (
    <div id="quartz-body" data-unlisted={isUnlisted(fileData) ? "true" : undefined}>
      {children}
    </div>
  )
}

Body.afterDOMLoaded = clipboardScript
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor

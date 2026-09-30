import s from "./CodeBlock.module.css"

type Props = {
  /** What the block is and where it comes from, e.g. a file path. */
  caption: string
  code: string
  /** Link to the exact source the excerpt was copied from. */
  href?: string
  hrefLabel?: string
}

// Every block on this site is copied from a public repository or its
// documentation; `href` points at the source so it can be checked.
export function CodeBlock({ caption, code, href, hrefLabel = "원본 보기" }: Props) {
  return (
    <figure className={s.root}>
      <figcaption className={s.cap}>
        <span>{caption}</span>
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            {hrefLabel}
            <span aria-hidden="true"> ↗</span>
          </a>
        )}
      </figcaption>
      <pre className={s.pre} tabIndex={0}>
        <code>{code}</code>
      </pre>
    </figure>
  )
}

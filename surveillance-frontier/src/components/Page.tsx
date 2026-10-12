import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "../router"
import { ROUTES, routeIndex, type RouteId } from "../data/routes"
import { LINKS } from "../data/links"
import styles from "./Page.module.css"

/** An external link that opens in a new tab and says so to a screen reader. */
export function Ext({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className ?? "text"}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export type Tone = "pass" | "fail" | "hold" | "plan" | "accent"

/** A verdict: what a check or hypothesis returned. Colour is never the only cue. */
export function Verdict({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={styles.verdict} data-tone={tone}>
      {children}
    </span>
  )
}

/**
 * The first screen, stacked on one reading line: where this page sits, its
 * title, one sentence, then the one figure across the full width with no box,
 * its caption, and a single quiet line of facts and links.
 */
export function PageHeader({
  crumb,
  title,
  sentence,
  figure,
  caption,
  facts,
  links,
}: {
  crumb: string
  title: ReactNode
  sentence: ReactNode
  figure: ReactNode
  caption: ReactNode
  facts: string[]
  links: { label: string; href: string }[]
}) {
  return (
    <header className={styles.header}>
      <div className={styles.frame}>
        <p className={styles.crumb}>{crumb}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sentence}>{sentence}</p>
        <figure className={styles.heroFigure}>
          {figure}
          <figcaption className={styles.heroCaption}>{caption}</figcaption>
        </figure>
        <p className={styles.facts}>
          {facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
          {links.map((l) => (
            <Ext key={l.href} href={l.href} className={styles.factLink}>
              {l.label}
              <span aria-hidden="true"> ↗</span>
            </Ext>
          ))}
        </p>
      </div>
    </header>
  )
}

/**
 * A numbered part of a page, always in the same order: title, a short lede at
 * a reading measure, then the figures across the width. With `aside`, a
 * narrow figure takes eight columns and the notes sit in the margin beside it.
 */
export function Section({
  id,
  n,
  title,
  text,
  aside,
  children,
}: {
  id: string
  n?: number
  title: ReactNode
  /** The lede: two to four sentences above the figures. */
  text?: ReactNode
  /** Margin notes beside a narrow figure. */
  aside?: ReactNode
  children: ReactNode
  tone?: "surface"
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-h`}>
      <div className={styles.sectionInner}>
        <h2 id={`${id}-h`} className={styles.h2}>
          {n !== undefined && <span className={styles.num}>{String(n).padStart(2, "0")}</span>}
          <span>{title}</span>
        </h2>
        {text && <div className={`prose ${styles.lede}`}>{text}</div>}
        {aside ? (
          <div className={styles.withAside}>
            <div className={styles.asideMain}>{children}</div>
            <div className={`prose ${styles.asideNotes}`}>{aside}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

/** A quiet closing note at a reading measure. */
export function Note({ children }: { children: ReactNode }) {
  return <div className={`prose ${styles.note}`}>{children}</div>
}

/** Two figures side by side on a wide screen, each in its narrow drawing. */
export function Pair({ children }: { children: ReactNode }) {
  return <div className={styles.pair}>{children}</div>
}

/** Body copy at a reading measure. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={`prose ${styles.prose}`}>{children}</div>
}

export function Figure({
  title,
  caption,
  source,
  children,
}: {
  title: ReactNode
  caption?: ReactNode
  source?: ReactNode
  children: ReactNode
}) {
  return (
    <figure className={styles.figure}>
      <p className={styles.figTitle}>{title}</p>
      <div className={styles.figBody}>{children}</div>
      {(caption || source) && (
        <figcaption className={styles.caption}>
          {caption}
          {source && <span className={styles.source}>{source}</span>}
        </figcaption>
      )}
    </figure>
  )
}

/** A data table that scrolls sideways on its own, not the page, when it cannot fit. */
export function Table({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.tableWrap} role="region" aria-label={label} tabIndex={0}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}

/** Short takeaways, each a claim with the condition it holds under. */
export function Findings({ items }: { items: { title: ReactNode; body: ReactNode }[] }) {
  return (
    <ul className={styles.findings}>
      {items.map((item, i) => (
        <li key={i}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

export type TocItem = { id: string; label: string }

/**
 * The page's contents as a bar that stays under the site bar, marking the
 * section being read and keeping it in view when the bar scrolls sideways.
 */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const bar = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    // The current section is the last one whose top has passed a line a
    // third of the way down the viewport.
    const update = () => {
      const line = window.innerHeight / 3
      let current = sections[0]?.id
      for (const el of sections) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [items])

  useEffect(() => {
    const list = bar.current
    const link = list?.querySelector<HTMLElement>("[aria-current]")
    if (!list || !link) return
    const left = link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2
    list.scrollTo({ left, behavior: "smooth" })
  }, [active])

  return (
    <nav className={styles.toc} aria-label="On this page">
      <ol ref={bar} className={styles.tocInner}>
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={item.id === active ? "location" : undefined}>
              <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** A phase page: the contents bar, then the sections. */
export function WithToc({ items, children }: { items: TocItem[]; children: ReactNode }) {
  return (
    <>
      <Toc items={items} />
      {children}
    </>
  )
}

/** Previous and next page, in the reading order of ROUTES. */
export function Pager({ id }: { id: RouteId }) {
  const i = routeIndex(id)
  const prev = ROUTES[i - 1]
  const next = ROUTES[i + 1]
  return (
    <nav className={styles.pager} aria-label="Previous and next page">
      <div className={styles.pagerInner}>
        {prev ? (
          <Link to={prev.path} className={styles.pageLink}>
            <span className={styles.pageDir}>← Previous</span>
            <span className={styles.pageName}>{prev.label}</span>
            <span className={styles.pageTopic}>{prev.topic}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.path} className={styles.pageLink} data-next="">
            <span className={styles.pageDir}>Next →</span>
            <span className={styles.pageName}>{next.label}</span>
            <span className={styles.pageTopic}>{next.topic}</span>
          </Link>
        ) : (
          <a
            href={LINKS.phase2}
            className={styles.pageLink}
            data-next=""
            data-plan=""
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.pageDir}>Next · designed, not started ↗</span>
            <span className={styles.pageName}>Phase 2</span>
            <span className={styles.pageTopic}>
              A bit-identical GPU engine against the incremental CPU — protocol on GitHub
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </nav>
  )
}

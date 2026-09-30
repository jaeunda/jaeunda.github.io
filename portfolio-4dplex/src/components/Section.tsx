import type { ReactNode } from "react"
import { PROJECTS, routeById, type RouteId } from "../data/routes"
import { Link } from "../router"
import s from "./Section.module.css"

type Meta = { k: string; v: ReactNode }

type SectionProps = {
  id: string
  /** Set on a project page: adds the way back and the way on. */
  route?: RouteId
  /** Omitted for a section that is not one of the numbered projects. */
  index?: string

  /** The capability this section proves, in English. */
  label: string
  /** Project or subject name. */
  name: string
  /** What the subject is, in a phrase. */
  tagline: string

  /** The one sentence a reader should leave with. */
  message: string
  meta?: Meta[]
  /** The few facts to take in before anything else. */
  summary?: ReactNode
  /** The blocks of the page, in order: the reader's map of what follows. */
  contents?: { id: string; label: string }[]
  /** Closes the page: how the experience relates to the role. */
  fit?: ReactNode
  /** The few words the page should leave behind. */
  keywords?: string[]
  tone?: "paper" | "surface"
  children: ReactNode
}

export function Section({
  id,
  route,
  index,
  label,
  name,
  tagline,
  message,
  meta,
  summary,
  contents,
  fit,
  keywords,

  tone = "paper",
  children,
}: SectionProps) {
  return (
    <section id={id} className={s.section} data-tone={tone} aria-labelledby={`${id}-title`}>
      <div className={s.in}>
        {route && <Crumb route={route} />}
        <header className={s.head}>
          <p className={s.kicker}>
            {index && <span className={s.index}>{index}</span>}
            <span className={s.label}>{label}</span>
          </p>
          <div className={s.headMain}>
            <h2 className={s.name} id={`${id}-title`}>
              {name}
              <span>{tagline}</span>
            </h2>
            <p className={s.message}>{message}</p>
          </div>
          {meta && (
            <dl className={s.meta}>
              {meta.map((item) => (
                <div key={item.k}>
                  <dt>{item.k}</dt>
                  <dd>{item.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>
        {summary}
        {contents && <Contents items={contents} />}
        {children}
        {fit && (
          <aside className={s.close} aria-label="직무와의 접점">
            <p className={s.closeK}>직무와의 접점</p>
            <p className={s.closeT}>{fit}</p>
            {keywords && (
              <ul className={s.keywords} aria-label="핵심 키워드">
                {keywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            )}
          </aside>
        )}

        {route && <Pager route={route} />}
      </div>
    </section>
  )
}

// What is on the page and in what order, so a reader can see the whole route
// before starting and jump to the part they came for.
function Contents({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className={s.contents} aria-label="이 페이지의 구성">
      <p>이 페이지</p>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Crumb({ route }: { route: RouteId }) {
  const position = PROJECTS.findIndex((project) => project.id === route) + 1
  return (
    <p className={s.crumb}>
      <Link to="/">
        <span aria-hidden="true">← </span>Overview
      </Link>
      <span>
        Project {position} / {PROJECTS.length}
      </span>
    </p>
  )
}

// The way on from a project page: the neighbouring projects, and home.
function Pager({ route }: { route: RouteId }) {
  const index = PROJECTS.findIndex((project) => project.id === route)
  const prev = PROJECTS[index - 1]
  const next = PROJECTS[index + 1]
  const home = routeById("overview")

  return (
    <nav className={s.pager} aria-label="다른 프로젝트">
      <Link className={s.pagerLink} to={prev ? prev.path : home.path}>
        <span className={s.pagerK}>
          <i aria-hidden="true">← </i>
          {prev ? "이전 프로젝트" : "처음으로"}
        </span>
        <b>{prev ? prev.name : "Overview"}</b>
        <span className={s.pagerD}>{prev ? prev.nav : "첫 화면과 프로필"}</span>
      </Link>
      <Link className={s.pagerLink} to={next ? next.path : "/#profile"}>
        <span className={s.pagerK}>
          {next ? "다음 프로젝트" : "마지막으로"}
          <i aria-hidden="true"> →</i>
        </span>
        <b>{next ? next.name : "Profile"}</b>
        <span className={s.pagerD}>{next ? next.nav : "기술 스택과 학력"}</span>
      </Link>
    </nav>
  )
}

type BlockProps = {
  /** Anchor target for the page's table of contents. */
  id?: string
  /** Position among the page's blocks. */
  n?: number
  label: string
  title: string
  /** Tells the reader the block can be explored. */
  hint?: string
  lead?: ReactNode
  children: ReactNode
}

export function Block({ id, n, label, title, hint, lead, children }: BlockProps) {
  return (
    <div className={s.block} id={id}>
      <div className={s.blockHead}>
        <p className={s.blockK}>
          {n && <span>{String(n).padStart(2, "0")}</span>}
          {label}
        </p>
        <h3 className={s.blockT}>{title}</h3>
        {lead && <p className={s.blockLead}>{lead}</p>}
        {hint && (
          <p className={s.hint}>
            <i aria-hidden="true" />
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={s.ext} href={href} target="_blank" rel="noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  )
}

export function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className={s.note}>
      <b>{label}</b>
      <span>{children}</span>
    </p>
  )
}

import type { ReactNode } from "react"
import { Link } from "../router"
import { PROJECTS, routeById, type RouteId } from "../data/routes"
import styles from "./Page.module.css"

/** Marks a code-styled string that contains Hangul, which the mono face does not carry. */
export function ko(text: string): true | undefined {
  return /[\uAC00-\uD7A3]/.test(text) || undefined
}

/**
 * A heading written as phrases. " / " separates phrases and " | " separates the
 * parts of one phrase. Each phrase and each part wraps as a unit: a line breaks
 * between phrases first, and inside a phrase only when the phrase does not fit
 * (a narrow screen). Spaces sit outside the units so none is lost at a break.
 */
function phrased(title: ReactNode): ReactNode {
  if (typeof title !== "string" || !/ [/|] /.test(title)) return title
  const units = (
    text: string,
    className: string,
    split: string,
    inner?: (t: string) => ReactNode,
  ) =>
    text.split(split).flatMap((part, i) => [
      i > 0 ? " " : null,
      <span key={i} className={className}>
        {inner ? inner(part) : part}
      </span>,
    ])
  return units(title, styles.phrase, " / ", (phrase) =>
    phrase.includes(" | ") ? units(phrase, styles.part, " | ") : phrase,
  )
}

export type Tone = "pass" | "fail" | "hold" | "plan" | "plain"

type Fact = { label: string; value: ReactNode }
type Result = { value: string; label: ReactNode; scope: ReactNode; tone?: Tone }
type Ref = { label: string; href: string }

/** A link that leaves the site, announced as such. */
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
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <span className="sr-only"> (새 창)</span>
    </a>
  )
}

/** Where a piece of work stands. Planned work is dashed, never filled. */
export function Status({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={styles.status} data-tone={tone}>
      {children}
    </span>
  )
}

// The first screen of a project page: the problem as the title, how it was
// solved in two sentences, where it stands, and the results that carry it,
// each with the condition it was measured under.
export function ProjectHeader({
  id,
  title,
  lead,
  status,
  facts,
  results,
  refs,
}: {
  id: RouteId
  title: ReactNode
  lead: ReactNode
  status: { tone: Tone; label: string }[]
  facts: Fact[]
  results: Result[]
  refs: Ref[]
}) {
  const route = routeById(id)
  const index = PROJECTS.findIndex((project) => project.id === id)
  return (
    <header className={styles.header}>
      <div className={styles.frame}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.eyebrowName}>{route.name}</span>
          <span className={styles.eyebrowTopic}>{route.topic}</span>
        </p>
        <h1 className={styles.title}>{phrased(title)}</h1>
        <p className={styles.lead}>{lead}</p>
        <p className={styles.statusRow}>
          {status.map((item) => (
            <Status key={item.label} tone={item.tone}>
              {item.label}
            </Status>
          ))}
        </p>

        <ul className={styles.results}>
          {results.map((result) => (
            <li key={result.value} data-tone={result.tone ?? "plain"}>
              <span className={styles.resultValue}>{result.value}</span>
              <span className={styles.resultLabel}>{result.label}</span>
              <span className={styles.resultScope}>{result.scope}</span>
            </li>
          ))}
        </ul>

        <div className={styles.metaRow}>
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <ul className={styles.refs} aria-label="관련 링크">
            {refs.map((ref) => (
              <li key={ref.href}>
                <Ext href={ref.href}>{ref.label} ↗</Ext>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

/** One numbered part of a project page. `kicker` is the question it answers. */
export function Section({
  n,
  kicker,
  title,
  lead,
  children,
  tone = "paper",
}: {
  n: number
  kicker: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  tone?: "paper" | "surface"
}) {
  const id = `s${n}`
  return (
    <section className={styles.section} data-tone={tone} aria-labelledby={id}>
      <div className={styles.frame}>
        <p className={styles.kicker}>
          <span className={styles.kickerNum}>{String(n).padStart(2, "0")}</span>
          {kicker}
        </p>
        <h2 id={id} className={styles.sectionTitle}>
          {phrased(title)}
        </h2>
        {lead && <p className={styles.sectionLead}>{lead}</p>}
        {children && <div className={styles.sectionBody}>{children}</div>}
      </div>
    </section>
  )
}

/** A figure with a caption that says what to read from it. */
export function Figure({
  caption,
  children,
  label,
}: {
  caption: ReactNode
  children: ReactNode
  label?: string
}) {
  return (
    <figure className={styles.figure} aria-label={label}>
      <div className={styles.figureBody}>{children}</div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}

/** Two or three short design decisions, each with the reason behind it. */
export function Decisions({
  items,
}: {
  items: { title: string; body: ReactNode; evidence?: ReactNode }[]
}) {
  return (
    <ol className={styles.decisions}>
      {items.map((item, i) => (
        <li key={item.title}>
          <span className={styles.decisionNum}>{String.fromCharCode(65 + i)}</span>
          <h3 className={styles.decisionTitle}>{item.title}</h3>
          <p className={styles.decisionBody}>{item.body}</p>
          {item.evidence && <p className={styles.decisionEvidence}>{item.evidence}</p>}
        </li>
      ))}
    </ol>
  )
}

/** How the project is put to work: numbered steps, then where it applies. */
export function Apply({
  steps,
  target,
}: {
  steps: { title: string; body: ReactNode }[]
  target?: ReactNode
}) {
  return (
    <div className={styles.apply}>
      <ol className={styles.applySteps}>
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className={styles.applyNum}>{i + 1}</span>
            <h3 className={styles.applyTitle}>{step.title}</h3>
            <p className={styles.applyBody}>{step.body}</p>
          </li>
        ))}
      </ol>
      {target && (
        <p className={styles.applyTarget}>
          <b>적용 대상</b>
          {target}
        </p>
      )}
    </div>
  )
}

// Previous / all projects / next, with the next project's one-line preview so
// the reader knows what they are about to open. After the last project the
// reader is handed to the profile.
export function Pager({ id }: { id: RouteId }) {
  const index = PROJECTS.findIndex((project) => project.id === id)
  const prev = PROJECTS[index - 1]
  const next = PROJECTS[index + 1]
  return (
    <nav className={styles.pager} aria-label="프로젝트 이동">
      <div className={styles.pagerInner}>
        {prev ? (
          <Link to={prev.path} className={styles.pagerPrev}>
            <span className={styles.pagerDir}>← 이전 프로젝트</span>
            <span className={styles.pagerName}>
              {String(index).padStart(2, "0")} {prev.name}
            </span>
          </Link>
        ) : (
          <Link to="/#projects" className={styles.pagerPrev}>
            <span className={styles.pagerDir}>← 처음으로</span>
            <span className={styles.pagerName}>전체 프로젝트</span>
          </Link>
        )}

        {next ? (
          <Link to={next.path} className={styles.pagerNext}>
            <span className={styles.pagerDir}>다음 프로젝트 →</span>
            <span className={styles.pagerName}>
              {String(index + 2).padStart(2, "0")} {next.name}
            </span>
            <span className={styles.pagerTopic}>{next.topic}</span>
            <span className={styles.pagerPreview}>{next.preview}</span>
          </Link>
        ) : (
          <Link to="/#profile" className={styles.pagerNext}>
            <span className={styles.pagerDir}>다음 →</span>
            <span className={styles.pagerName}>Profile</span>
            <span className={styles.pagerTopic}>소개 · 추가 작업 · 기술 · 교육</span>
            <span className={styles.pagerPreview}>
              Java/Spring 백엔드와 RAG 에이전트 개발 경험, 기술 스택, 교육 이력을 정리했습니다.
            </span>
          </Link>
        )}

        <Link to="/#projects" className={styles.pagerAll}>
          전체 프로젝트 보기
        </Link>
      </div>
    </nav>
  )
}

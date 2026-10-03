import type { ReactNode } from "react"
import { Link } from "../router"
import { PROJECTS, routeById, type RouteId } from "../data/routes"
import styles from "./Page.module.css"

type Meta = { label: string; value: ReactNode }
type Metric = { value: string; label: string; tone?: "fail" | "pass" | "plain" }

// The top of every project page: capability, the problem-first title, the
// project identifier, one message, then period · role · stack · repository.
export function ProjectHeader({
  id,
  title,
  message,
  meta,
  repo,
  metrics,
}: {
  id: RouteId
  title: ReactNode
  message: ReactNode
  meta: Meta[]
  repo?: { href: string; label: string }
  metrics?: Metric[]
}) {
  const route = routeById(id)
  return (
    <header className={styles.header}>
      <div className={styles.frame}>
        <p className={styles.capability}>{route.capability}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.identifier}>{route.name}</p>
        <p className={styles.message}>{message}</p>
        <dl className={styles.meta}>
          {meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          {repo && (
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={repo.href} target="_blank" rel="noreferrer">
                  {repo.label}
                  <span className="sr-only"> (새 창)</span>
                </a>
              </dd>
            </div>
          )}
        </dl>
        {metrics && (
          <ul className={styles.metrics}>
            {metrics.map((metric) => (
              <li key={metric.label} data-tone={metric.tone ?? "plain"}>
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}

/** One numbered block of a project page. */
export function Block({
  n,
  kicker,
  title,
  lead,
  children,
  tone = "day",
}: {
  n: number
  kicker: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  tone?: "day" | "surface"
}) {
  const id = `s${n}`
  return (
    <section className={styles.block} data-tone={tone} aria-labelledby={id}>
      <div className={styles.frame}>
        <p className={styles.kicker}>
          <span className={styles.num}>{String(n).padStart(2, "0")}</span>
          {kicker}
        </p>
        <h2 id={id} className={styles.blockTitle}>
          {title}
        </h2>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </section>
  )
}

/** The sentence a block should leave behind. */
export function Takeaway({ children }: { children: ReactNode }) {
  return <p className={styles.takeaway}>{children}</p>
}

// Previous / Home / Next. The last project hands the reader to the profile.
export function Pager({ id }: { id: RouteId }) {
  const index = PROJECTS.findIndex((project) => project.id === id)
  const prev = PROJECTS[index - 1]
  const next = PROJECTS[index + 1]
  return (
    <nav className={styles.pager} aria-label="프로젝트 이동">
      <div className={styles.pagerInner}>
        {prev ? (
          <Link to={prev.path} className={styles.pagerLink}>
            <span className={styles.pagerDir}>← Previous</span>
            <span className={styles.pagerName}>{prev.name}</span>
          </Link>
        ) : (
          <Link to="/" className={styles.pagerLink}>
            <span className={styles.pagerDir}>← Overview</span>
            <span className={styles.pagerName}>전체 프로젝트</span>
          </Link>
        )}
        <Link to="/" className={styles.pagerHome}>
          Overview
        </Link>
        {next ? (
          <Link to={next.path} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerDir}>Next →</span>
            <span className={styles.pagerName}>{next.name}</span>
          </Link>
        ) : (
          <Link to="/#profile" className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerDir}>Next →</span>
            <span className={styles.pagerName}>Engineering Profile</span>
          </Link>
        )}
      </div>
    </nav>
  )
}

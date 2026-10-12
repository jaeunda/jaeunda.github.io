import type { ReactNode } from "react"
import { Ext, Verdict, type Tone } from "../components/Page"
import { Link } from "../router"
import styles from "./Boards.module.css"

// Visual summaries in HTML: they carry short text and must reflow on a phone.

export type Check = { label: ReactNode; result: string; kind: "pass" | "caught" }

/** Gate results: each check with a mark, broken variants shown as caught. */
export function CheckGrid({ items }: { items: Check[] }) {
  return (
    <ul className={styles.checks}>
      {items.map((c, i) => (
        <li key={i} data-kind={c.kind}>
          <span className={styles.mark} aria-hidden="true">
            {c.kind === "pass" ? "✓" : "⊘"}
          </span>
          <span className={styles.checkLabel}>{c.label}</span>
          <span className={styles.checkResult}>{c.result}</span>
        </li>
      ))}
    </ul>
  )
}

export type Score = {
  id: string
  claim: ReactNode
  /** What was predicted, when the hypothesis named a number. */
  predicted?: string
  measured: string
  verdict: string
  tone: Tone
}

/** Hypotheses as one ledger: statement, criterion → result, verdict. */
export function Scorecard({ items }: { items: Score[] }) {
  return (
    <div className={styles.ledgerWrap} role="region" aria-label="Hypotheses" tabIndex={0}>
      <table className={styles.ledger}>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Hypothesis</th>
            <th scope="col">Criterion → result</th>
            <th scope="col">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} data-tone={s.tone}>
              <th scope="row">{s.id}</th>
              <td>{s.claim}</td>
              <td className={styles.ledgerValue}>
                {s.predicted && (
                  <>
                    <span className={styles.scorePred}>{s.predicted}</span>
                    <span aria-hidden="true"> → </span>
                    <span className="sr-only"> criterion, result </span>
                  </>
                )}
                {s.measured}
              </td>
              <td>
                <Verdict tone={s.tone}>{s.verdict}</Verdict>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Cause and consequence, one row each; a muted row is the branch not taken. */
export function Flow({ rows }: { rows: { from: ReactNode; to: ReactNode; muted?: boolean }[] }) {
  return (
    <ol className={styles.flow}>
      {rows.map((r, i) => (
        <li key={i} data-muted={r.muted ? "" : undefined}>
          <span className={styles.flowFrom}>{r.from}</span>
          <span className={styles.flowArrow} aria-hidden="true">
            →
          </span>
          <span className={styles.flowTo}>{r.to}</span>
        </li>
      ))}
    </ol>
  )
}

/** Side-by-side lists, each with a tone. */
export function Columns({
  columns,
}: {
  columns: { title: string; tone: Tone; items: ReactNode[] }[]
}) {
  return (
    <div className={styles.columns}>
      {columns.map((c) => (
        <section key={c.title} data-tone={c.tone} aria-label={c.title}>
          <h3>{c.title}</h3>
          <ul>
            {c.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** The three phases as a quiet row of links, one question each. */
export function PhaseLinks({
  phases,
}: {
  phases: { tag: string; question: string; more: string; to?: string; href?: string }[]
}) {
  return (
    <ol className={styles.phases}>
      {phases.map((p) => {
        const inner = (
          <>
            <span className={styles.phaseTag}>{p.tag}</span>
            <span className={styles.phaseQ}>{p.question}</span>
            <span className={styles.phaseMore}>{p.more}</span>
          </>
        )
        return (
          <li key={p.tag} data-plan={p.to ? undefined : ""}>
            {p.to ? (
              <Link to={p.to}>{inner}</Link>
            ) : (
              <Ext href={p.href!} className="">
                {inner}
              </Ext>
            )}
          </li>
        )
      })}
    </ol>
  )
}

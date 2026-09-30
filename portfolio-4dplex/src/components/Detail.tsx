import type { ReactNode } from "react"
import s from "./Detail.module.css"

type Props = {
  lead: ReactNode
  points?: ReactNode[]
  /** Labelled facts: what goes in, what comes out, who owns it. */
  facts?: { k: string; v: ReactNode }[]
  children?: ReactNode
}

// The body of a selected step: one sentence, then the specifics.
export function Detail({ lead, points, facts, children }: Props) {
  return (
    <div className={s.box}>
      <div className={s.root} data-facts={facts ? true : undefined}>
        <div className={s.main}>
          <p className={s.lead}>{lead}</p>
          {points && (
            <ul className={s.points}>
              {points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
          {children}
        </div>
        {facts && (
          <dl className={s.facts}>
            {facts.map((fact) => (
              <div key={fact.k}>
                <dt>{fact.k}</dt>
                <dd>{fact.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}

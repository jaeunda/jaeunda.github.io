import { useState, type ReactNode } from "react"
import s from "./StepExplorer.module.css"

export type Step = {
  id: string
  /** Mono caption: the component or stage name, in English. */
  label: string
  /** What the step does, in Korean. */
  title: string
  sub?: string
  tags?: string[]
  /** Marks the steps the author built; the rest belong to the team. */
  mine?: boolean
  detail: ReactNode
}

type Props = {
  /** Accessible name of the whole diagram. */
  label: string
  steps: Step[]
  /**
   * `loop`: four steps out, three back (a request and its result).
   * `rail`: a vertical pipeline with the detail beside it.
   * `row`: a horizontal workflow with the detail beneath it.
   */
  layout: "loop" | "rail" | "row"
  initial?: string
  /** Shown in the free cell of the `loop` layout. */
  legend?: ReactNode
}

// Every step is visible from the start; selecting one only adds its detail.
// Wide screens show the detail in a panel next to the diagram, narrow ones
// show it directly under the selected step.
export function StepExplorer({ label, steps, layout, initial, legend }: Props) {
  const [active, setActive] = useState(initial ?? steps[0].id)
  const current = steps.find((step) => step.id === active) ?? steps[0]

  return (
    <div className={s.root} data-layout={layout}>
      <ol className={s.steps} aria-label={label}>
        {steps.map((step, index) => {
          const selected = step.id === active
          return (
            <li
              key={step.id}
              className={s.step}
              data-selected={selected}
              data-last={index === steps.length - 1}
            >
              <button
                type="button"
                className={s.node}
                aria-pressed={selected}
                onClick={() => setActive(step.id)}
              >
                <span className={s.nodeTop}>
                  <span className={s.num}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={s.label}>{step.label}</span>
                  {step.mine && <span className={s.mine}>담당</span>}
                </span>
                <span className={s.title}>{step.title}</span>
                {step.sub && <span className={s.sub}>{step.sub}</span>}
                {step.tags && (
                  <span className={s.tags}>
                    {step.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                )}
              </button>
              {selected && <div className={s.inline}>{step.detail}</div>}
            </li>
          )
        })}
        {legend && (
          <li className={s.legend} aria-hidden="true">
            {legend}
          </li>
        )}
      </ol>
      <div className={s.panel} aria-live="polite">
        <p className={s.panelK}>
          <span>{String(steps.indexOf(current) + 1).padStart(2, "0")}</span>
          {current.label}
        </p>
        <div className={s.panelB}>{current.detail}</div>
      </div>
    </div>
  )
}

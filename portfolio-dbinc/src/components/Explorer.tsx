import { useId, useState, type ReactNode } from "react"
import styles from "./Explorer.module.css"

export type Step = { key: string; label: string; title: string; body: ReactNode }

// A vertical flow whose steps can be selected. The flow itself is readable
// without selecting anything; selection only adds the step's explanation.
export function Explorer({ steps, label }: { steps: Step[]; label: string }) {
  const [active, setActive] = useState(0)
  const id = useId()
  const step = steps[active]
  return (
    <div className={styles.explorer}>
      <ol className={styles.rail} aria-label={label}>
        {steps.map((item, i) => (
          <li key={item.key}>
            <button
              type="button"
              className={styles.node}
              aria-pressed={i === active}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(i)}
            >
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div id={`${id}-panel`} className={styles.panel} aria-live="polite">
        <p className={styles.panelIndex}>
          STEP {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")} ·{" "}
          {step.label}
        </p>
        <h3 className={styles.panelTitle}>{step.title}</h3>
        <div className={styles.panelBody}>{step.body}</div>
        <div className={styles.panelNav}>
          <button
            type="button"
            onClick={() => setActive(active - 1)}
            disabled={active === 0}
            aria-label="이전 단계"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => setActive(active + 1)}
            disabled={active === steps.length - 1}
            aria-label="다음 단계"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import s from "./Tabs.module.css"

export type TabItem = {
  id: string
  label: string
  /** Short mono caption above the label, e.g. a number or a tool name. */
  kicker?: string
  content: ReactNode
}

type Props = {
  label: string
  items: TabItem[]
  /** `segmented` is the two-state comparison switch; `tabs` is the default. */
  variant?: "tabs" | "segmented"
  initial?: string
  onChange?: (id: string) => void
}

export function Tabs({ label, items, variant = "tabs", initial, onChange }: Props) {
  const base = useId()
  const [active, setActive] = useState(initial ?? items[0].id)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number, focus: boolean) => {
    const item = items[(index + items.length) % items.length]
    setActive(item.id)
    onChange?.(item.id)
    if (focus) refs.current[(index + items.length) % items.length]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") select(index + 1, true)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") select(index - 1, true)
    else if (event.key === "Home") select(0, true)
    else if (event.key === "End") select(items.length - 1, true)
    else return
    event.preventDefault()
  }

  return (
    <div className={s.root} data-variant={variant}>
      <div className={s.list} role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${item.id}`}
            className={s.tab}
            aria-selected={active === item.id}
            aria-controls={`${base}-panel-${item.id}`}
            tabIndex={active === item.id ? 0 : -1}
            onClick={() => select(index, false)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.kicker && <span className={s.kicker}>{item.kicker}</span>}
            <span className={s.label}>{item.label}</span>
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          className={s.panel}
          hidden={active !== item.id}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

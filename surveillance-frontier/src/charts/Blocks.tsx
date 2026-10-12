import type { ReactNode } from "react"
import { C, METHOD } from "./palette"
import styles from "./Blocks.module.css"

// Diagrams that are mostly text are drawn in HTML so they reflow on a phone
// instead of shrinking; only the small glyphs are SVG.

const glyph = { viewBox: "0 0 120 48", "aria-hidden": true as const, className: styles.glyph }
const BASE =
  "M2,30 L10,27 L18,31 L26,26 L34,29 L42,24 L50,28 L58,25 L66,29 L74,26 L82,30 L90,25 L98,28 L106,26 L118,29"

const STEPS: Step[] = [
  {
    title: "Fix one series",
    body: (
      <>
        A real BTCUSDT series <i>x</i>: a week of 1-s bars or a quarter of 1-min bars.
      </>
    ),
    art: (
      <svg {...glyph}>
        <path d={BASE} fill="none" stroke={C.ink2} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Inject a test event",
    body: (
      <>
        A rise-and-fall of length <i>L</i> and strength <i>q</i> at a start <i>s</i> drawn at
        random.
      </>
    ),
    art: (
      <svg {...glyph}>
        <path
          d="M2,30 L10,27 L18,31 L26,26 L34,29 L42,24 L48,18 L54,10 L60,6 L66,18 L72,27 L82,30 L90,25 L98,28 L106,26 L118,29"
          fill="none"
          stroke={C.ink2}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="42" y="40" width="30" height="5" rx="1.5" fill={C.accent} />
      </svg>
    ),
  },
  {
    title: "Re-run the policy",
    body: <>Scan, rank, select. A policy sets window lengths, threshold and merge gap.</>,
    art: (
      <svg {...glyph}>
        {Array.from({ length: 4 }).flatMap((_, r) =>
          Array.from({ length: 12 }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={6 + c * 9.2}
              y={4 + r * 10}
              width="7.4"
              height="8"
              rx="1"
              fill={c >= 4 + r / 2 && c <= 7 ? C.accent : C.line2}
            />
          )),
        )}
      </svg>
    ),
  },
  {
    title: "New episode inside?",
    body: <>A hit only if centred in the event and absent from the unchanged series.</>,
    art: (
      <svg {...glyph}>
        <circle cx="38" cy="24" r="14" fill={C.passSoft} stroke={C.pass} strokeWidth="1.5" />
        <path
          d="M31,24 l5,5 l9,-10"
          fill="none"
          stroke={C.pass}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="82" cy="24" r="14" fill={C.surface} stroke={C.line2} strokeWidth="1.5" />
        <path
          d="M76,18 l12,12 M88,18 l-12,12"
          stroke={C.muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Repeat n times",
    body: (
      <>
        Hits / n estimates the <b>detection rate</b> <i>p</i>(<i>L</i>, <i>q</i> | <i>x</i>) with a
        95% interval.
      </>
    ),
    art: (
      <svg {...glyph}>
        <line x1="6" x2="114" y1="34" y2="34" stroke={C.line2} />
        <line
          x1="40"
          x2="80"
          y1="24"
          y2="24"
          stroke={C.accent}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="58" cy="24" r="4" fill={C.surface} stroke={C.accent} strokeWidth="2" />
        <text x="6" y="46" fontSize="10" fill={C.muted}>
          0
        </text>
        <text x="114" y="46" fontSize="10" fill={C.muted} textAnchor="end">
          1
        </text>
      </svg>
    ),
  },
]

export type Step = { title: string; body: ReactNode; art: ReactNode }

/** A left-to-right process, each step a small drawing and a line of text. */
export function Steps({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className={styles.loop} aria-label={label}>
      {steps.map((step, i) => (
        <li key={step.title}>
          <span className={styles.stepNum}>{i + 1}</span>
          {step.art}
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

/** One Monte Carlo trial, and what n of them estimate. */
export function TrialLoop() {
  return <Steps steps={STEPS} label="One stress-testing trial" />
}

const WINDOW_SERIES =
  "M2,30 L10,27 L18,31 L26,26 L34,29 L42,22 L50,14 L58,18 L66,27 L74,26 L82,30 L90,25 L98,28 L106,26 L118,29"

/** Phase 0: how one window becomes a rarity score and episodes. */
const SCORE_STEPS: Step[] = [
  {
    title: "Take every window",
    body: "Each (start, length) pair, 15 lengths from 2 to 256 bars.",
    art: (
      <svg {...glyph}>
        <path
          d={WINDOW_SERIES}
          fill="none"
          stroke={C.ink2}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect
          x="38"
          y="6"
          width="34"
          height="34"
          fill={C.accent}
          opacity="0.15"
          stroke={C.accent}
        />
      </svg>
    ),
  },
  {
    title: "Measure two features",
    body: "Price range (max − min) / min and traded volume.",
    art: (
      <svg {...glyph}>
        <rect x="14" y="10" width="14" height="30" fill={C.ink2} />
        <rect x="34" y="22" width="14" height="18" fill={C.faint} />
        <text x="58" y="22" fontSize="11" fill={C.muted}>
          range
        </text>
        <text x="58" y="38" fontSize="11" fill={C.muted}>
          volume
        </text>
      </svg>
    ),
  },
  {
    title: "Rank within its length",
    body: "Only against windows of the same length; keep the less extreme rank.",
    art: (
      <svg {...glyph}>
        {[30, 24, 19, 15, 12, 10, 8, 6, 5, 4].map((h, i) => (
          <rect
            key={i}
            x={8 + i * 11}
            y={42 - h}
            width="8"
            height={h}
            fill={i === 0 ? C.accent : C.line2}
          />
        ))}
      </svg>
    ),
  },
  {
    title: "Score its rarity",
    body: <>S = −log10(rank / count). S = 3 means top 0.1% on both features.</>,
    art: (
      <svg {...glyph}>
        {["#f1f1ec", "#cdd2f2", "#929eea", "#5a6be0", "#3441c4", "#1a2272"].map((c, i) => (
          <rect key={c} x={6 + i * 18} y="14" width="16" height="18" fill={c} stroke={C.line} />
        ))}
        <text x="6" y="46" fontSize="10" fill={C.muted}>
          S 0
        </text>
        <text x="114" y="46" fontSize="10" fill={C.muted} textAnchor="end">
          5
        </text>
      </svg>
    ),
  },
  {
    title: "Report the top 20",
    body: "Local peaks with S ≥ 2, merged into episodes when close.",
    art: (
      <svg {...glyph}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="14" cy={10 + i * 14} r="4" fill={C.accent} />
            <rect x="24" y={7 + i * 14} width={80 - i * 18} height="6" rx="2" fill={C.line2} />
          </g>
        ))}
      </svg>
    ),
  },
]

export function ScoreSteps() {
  return <Steps steps={SCORE_STEPS} label="How the scan scores a window" />
}

// N = 604,800, K = 15, one policy, one thread, L = 30, q = 16 (tables.md).
const STAGES = [
  { method: "full", total: 1180.55, scan: 147.1, rank: 1025.57, select: 7.87 },
  { method: "tail", total: 224.27, scan: 147.16, rank: 70.12, select: 7.16 },
  { method: "incremental", total: 3.36, scan: 0.04, rank: 1.87, select: 1.44 },
] as const

const STAGE_KEYS = [
  { key: "scan", label: "scan / update" },
  { key: "rank", label: "rank / merge" },
  { key: "select", label: "select" },
] as const

/** Time per trial and how it splits into stages, on one linear axis. */
export function StageBars() {
  const max = STAGES[0].total
  return (
    <div className={styles.stages}>
      <ul className={styles.stageKey} aria-hidden="true">
        {STAGE_KEYS.map((s) => (
          <li key={s.key} data-stage={s.key}>
            {s.label}
          </li>
        ))}
      </ul>
      {STAGES.map((row) => {
        const sum = row.scan + row.rank + row.select
        return (
          <div key={row.method} className={styles.stageRow} data-method={row.method}>
            <span className={styles.stageName}>{row.method}</span>
            <span className={styles.stageTrack}>
              <span
                className={styles.stageFill}
                style={{ width: `max(${(row.total / max) * 100}%, 3px)` }}
              >
                {STAGE_KEYS.map((s) => (
                  <span key={s.key} data-stage={s.key} style={{ flexGrow: row[s.key] / sum }} />
                ))}
              </span>
              <span className={styles.stageValue}>{row.total.toLocaleString("en-US")} ms</span>
            </span>
            <span className={styles.stageNote}>
              scan {row.scan} · rank {row.rank.toLocaleString("en-US")} · select {row.select} ms
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Key for charts that colour the trial methods; the decision line is optional. */
export function MethodLegend({
  methods,
  hour,
}: {
  methods: (keyof typeof METHOD)[]
  hour?: boolean
}) {
  return (
    <ul className={styles.legend} aria-hidden="true">
      {methods.map((m) => (
        <li key={m} style={{ ["--swatch" as string]: METHOD[m].colour }}>
          {METHOD[m].label}
        </li>
      ))}
      {hour && <li data-hour="">1-hour decision line</li>}
    </ul>
  )
}

import { C, METHOD, MONO, fmt, logScale } from "./palette"

// Phase 1, section 3: single-thread time per trial against series length,
// K = 15, one policy (tables.md, AWS c7i.16xlarge run of 2026-10-09).

const N = [16000, 32000, 64000, 128000, 256000, 604800]
const MS = {
  full: [22.92, 48.13, 102.75, 218.71, 467.47, 1180.55],
  tail: [5.79, 11.11, 22.95, 46.33, 89.46, 224.27],
  incremental: [0.15, 0.25, 0.41, 0.71, 1.53, 3.36],
} as const

const Y_TICKS = [0.1, 1, 10, 100, 1000]
const X_TICKS = [16000, 64000, 256000, 604800]

function Drawing({ narrow }: { narrow: boolean }) {
  const W = narrow ? 360 : 760
  const fs = narrow ? 13.5 : 13.5
  const left = narrow ? 46 : 58
  const right = narrow ? 104 : 150
  const top = 22
  const h = narrow ? 210 : 260
  const x = logScale(14000, 680000, left, W - right)
  const y = logScale(0.1, 2000, top + h, top)
  const H = top + h + 40

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label="Milliseconds per trial on one thread as the series grows from 16,000 to 604,800 bars. At 604,800 bars, full recomputation takes 1,180.55 ms, tail ranking 224.27 ms and incremental evaluation 3.36 ms."
    >
      {Y_TICKS.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke={C.line} />
          <text
            x={left - 8}
            y={y(t) + 4}
            fontSize={fs - 1.5}
            textAnchor="end"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t >= 1 ? fmt(t) : t}
          </text>
        </g>
      ))}
      {X_TICKS.map((t) => (
        <text
          key={t}
          x={x(t)}
          y={top + h + 17}
          fontSize={fs - 1.5}
          textAnchor="middle"
          fill={C.muted}
          fontFamily={MONO}
        >
          {t >= 600000 ? "604,800" : `${t / 1000}k`}
        </text>
      ))}
      <text x={left} y={12} fontSize={fs - 1} fill={C.muted}>
        ms per trial, 1 thread (log)
      </text>
      <text x={W - right} y={H - 4} fontSize={fs - 1} fill={C.muted} textAnchor="end">
        series length N, bars (log)
      </text>
      {(Object.keys(MS) as (keyof typeof MS)[]).map((m) => {
        const pts = MS[m].map((v, i) => [x(N[i]), y(v)] as const)
        const { colour } = METHOD[m]
        const last = MS[m][MS[m].length - 1]
        return (
          <g key={m}>
            <path
              d={pts
                .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`)
                .join("")}
              fill="none"
              stroke={colour}
              strokeWidth="2"
            />
            {pts.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r="3" fill={colour} />
            ))}
            <text
              x={x(604800) + 10}
              y={y(last) + 4}
              fontSize={fs - 0.5}
              fill={m === "incremental" ? C.accentInk : C.ink2}
              fontWeight="600"
              fontFamily={MONO}
            >
              {m}
              <tspan x={x(604800) + 10} dy={fs + 2} fontWeight="400" fill={C.muted}>
                {fmt(last, 2)} ms
              </tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function CostVsN() {
  return (
    <>
      <Drawing narrow={false} />
      <Drawing narrow />
    </>
  )
}

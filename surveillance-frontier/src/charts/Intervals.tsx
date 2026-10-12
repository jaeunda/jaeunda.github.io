import { C, MONO, fmt, linScale } from "./palette"

// Phase 0, section 5: the same detector re-run on fresh injected copies until
// a time budget runs out, on the CPU and on the GPU. Each row is the 95%
// interval of the estimated hit rate from the trials that fitted in the
// budget; the narrower the bar, the more precisely the detector is measured.
// budget_same_time.csv, Colab T4 run of 2026-10-04.

export const BUDGET = [
  { budget: 10, side: "CPU", trials: 18, p: 0.1667, lo: 0.0584, hi: 0.3922 },
  { budget: 10, side: "GPU", trials: 1032, p: 0.1424, lo: 0.1224, hi: 0.1651 },
  { budget: 30, side: "CPU", trials: 60, p: 0.1167, lo: 0.0577, hi: 0.2218 },
  { budget: 30, side: "GPU", trials: 3195, p: 0.1308, lo: 0.1196, hi: 0.143 },
  { budget: 60, side: "CPU", trials: 119, p: 0.1261, lo: 0.0779, hi: 0.1976 },
  { budget: 60, side: "GPU", trials: 6312, p: 0.1534, lo: 0.1447, hi: 0.1625 },
] as const

function Drawing({ narrow, wide }: { narrow: boolean; wide?: number }) {
  const W = narrow ? 360 : (wide ?? 760)
  const fs = narrow ? 13.5 : 13.5
  const left = narrow ? 78 : 150
  const right = narrow ? 70 : 150
  const top = 28
  const rowH = narrow ? 30 : 28
  const groupGap = narrow ? 14 : 16
  const x = linScale(0, 0.4, left, W - right)
  const yOf = (i: number) => top + i * rowH + Math.floor(i / 2) * groupGap + rowH / 2
  const H = yOf(BUDGET.length - 1) + rowH / 2 + 26
  const ticks = [0, 0.1, 0.2, 0.3, 0.4]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label="95% intervals of the estimated hit rate after 10, 30 and 60 seconds. The CPU completes 18, 60 and 119 trials and its interval stays wide; the GPU completes 1,032, 3,195 and 6,312 trials and its interval is 6.7 times narrower at 60 seconds."
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 6} y2={H - 22} stroke={C.line} />
          <text
            x={x(t)}
            y={H - 6}
            fontSize={fs - 1.5}
            textAnchor="middle"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t}
          </text>
        </g>
      ))}
      <text x={left} y={12} fontSize={fs - 1} fill={C.muted}>
        estimated hit rate, 95% interval
      </text>
      <text x={W - right + (narrow ? 10 : 18)} y={12} fontSize={fs - 1} fill={C.muted}>
        trials run
      </text>
      {BUDGET.map((r, i) => {
        const y = yOf(i)
        const gpu = r.side === "GPU"
        const colour = gpu ? C.accent : C.ink2
        return (
          <g key={`${r.budget}-${r.side}`}>
            {i % 2 === 0 && (
              <text x={0} y={y + rowH / 2 + 4} fontSize={fs} fill={C.ink} fontWeight="600">
                {r.budget} s
              </text>
            )}
            <text
              x={left - 12}
              y={y + 4}
              fontSize={fs - 1}
              textAnchor="end"
              fill={gpu ? C.accentInk : C.ink2}
              fontFamily={MONO}
            >
              {r.side}
            </text>
            <line
              x1={x(r.lo)}
              x2={x(r.hi)}
              y1={y}
              y2={y}
              stroke={colour}
              strokeWidth={gpu ? 6 : 6}
              strokeLinecap="round"
              opacity={gpu ? 1 : 0.55}
            />
            <circle cx={x(r.p)} cy={y} r="3.5" fill={C.surface} stroke={colour} strokeWidth="1.5" />
            <text
              x={W - right + (narrow ? 10 : 18)}
              y={y + 4}
              fontSize={fs - 1}
              fill={gpu ? C.accentInk : C.ink2}
              fontFamily={MONO}
              fontWeight={gpu ? 600 : 400}
            >
              {fmt(r.trials)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** `wide` sets the wide drawing's width when the figure spans the whole frame. */
export function Intervals({ wide }: { wide?: number } = {}) {
  return (
    <>
      <Drawing narrow={false} wide={wide} />
      <Drawing narrow />
    </>
  )
}

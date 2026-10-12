import { C, METHOD, MONO, logScale } from "./palette"

// The overview's one figure: the whole project on one wall-clock axis. Phase 0
// measured what a minute buys, Phase 1 how long the stated tasks take, and
// Phase 2 is the dashed band beyond the hour. Solid marks are measured,
// dashed ones designed, so progress and direction read without labels.

const TICKS = [
  { v: 10, l: "10 s" },
  { v: 60, l: "1 min" },
  { v: 600, l: "10 min" },
  { v: 3600, l: "1 h" },
  { v: 86400, l: "1 day" },
  { v: 864000, l: "10 days" },
]

const TASKS = [
  { id: "T1 · 1 policy", short: "T1", from: 14400, fromL: "4.0 h", to: 42.9, toL: "43 s" },
  {
    id: "T2 · 24 policies",
    short: "T2",
    from: 1313280,
    fromL: "15.2 days",
    to: 726,
    toL: "12 min",
  },
]

const halo = {
  paintOrder: "stroke" as const,
  stroke: C.paper,
  strokeWidth: 5,
  strokeLinejoin: "round" as const,
}

function Arrow({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  return (
    <g>
      <line x1={x1 + 12} x2={x0 - 9} y1={y} y2={y} stroke={C.ink2} strokeWidth="1.8" />
      <path
        d={`M${x1 + 20},${y - 6} L${x1 + 11},${y} L${x1 + 20},${y + 6}`}
        fill="none"
        stroke={C.ink2}
        strokeWidth="1.8"
      />
      <circle cx={x0} cy={y} r="7" fill={METHOD.full.colour} />
      <circle cx={x1} cy={y} r="9" fill={C.accent} />
    </g>
  )
}

/** Two stacked intervals, wide grey over narrow indigo: the 60-second result. */
function IntervalGlyph({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      <line
        x1={cx - 34}
        x2={cx + 34}
        y1={y - 8}
        y2={y - 8}
        stroke={C.ink2}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1={cx - 5}
        x2={cx + 5}
        y1={y + 8}
        y2={y + 8}
        stroke={C.accent}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>
  )
}

function Wide() {
  const W = 1080
  const gut = 180
  const x = logScale(10, 2_600_000, gut, W - 20)
  const top = 34
  const bottom = 304
  const y0 = 72
  const y1 = 146
  const y2 = 204
  const y3 = 272
  const hour = x(3600)
  return (
    <svg viewBox={`0 0 ${W} 344`} className="wide" role="img" aria-label={LABEL}>
      {TICKS.map((t) => (
        <g key={t.v}>
          <line x1={x(t.v)} x2={x(t.v)} y1={top - 6} y2={bottom} stroke={C.line} />
          <text
            x={x(t.v)}
            y={18}
            fontSize="12.5"
            textAnchor="middle"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t.l}
          </text>
        </g>
      ))}
      <line x1={0} x2={W} y1={108} y2={108} stroke={C.line} />
      <line x1={0} x2={W} y1={238} y2={238} stroke={C.line} />

      <text x={0} y={y0 - 2} fontSize="14" fontWeight="600" fill={C.ink}>
        Phase 0 · pilot
      </text>
      <text x={0} y={y0 + 16} fontSize="12" fill={C.muted} fontFamily={MONO}>
        Colab T4 · done
      </text>
      <line x1={x(60)} x2={x(60)} y1={y0 - 14} y2={y0 + 14} stroke={C.ink} strokeWidth="2.5" />
      <IntervalGlyph cx={x(60) + 52} y={y0} />
      <text x={x(60) + 100} y={y0 + 5} fontSize="14" fill={C.ink2} {...halo}>
        same 60 s budget: the GPU ran 53× more trials, so its interval was{" "}
        <tspan fill={C.accentInk} fontWeight="700">
          6.7× narrower
        </tspan>
      </text>

      <text x={0} y={y1 - 22} fontSize="14" fontWeight="600" fill={C.ink}>
        Phase 1 · 32-core CPU
      </text>
      {TASKS.map((t, i) => {
        const y = i === 0 ? y1 : y2
        return (
          <g key={t.id}>
            <text x={0} y={y + 5} fontSize="12.5" fill={C.muted} fontFamily={MONO}>
              {t.id}
            </text>
            <Arrow x0={x(t.from)} x1={x(t.to)} y={y} />
            <text
              x={x(t.from)}
              y={y + 25}
              fontSize="13"
              textAnchor="middle"
              fill={C.ink2}
              fontFamily={MONO}
            >
              full {t.fromL}
            </text>
            <text
              x={x(t.to)}
              y={y + 25}
              fontSize="14"
              textAnchor="middle"
              fill={C.accentInk}
              fontWeight="700"
              fontFamily={MONO}
            >
              {t.toL}
            </text>
          </g>
        )
      })}

      <text x={0} y={y3 - 2} fontSize="14" fontWeight="600" fill={C.plan}>
        Phase 2 · next
      </text>
      <text x={0} y={y3 + 16} fontSize="12" fill={C.muted} fontFamily={MONO}>
        designed
      </text>
      <rect
        x={hour + 4}
        y={y3 - 13}
        width={W - 20 - hour - 4}
        height="26"
        rx="4"
        fill="none"
        stroke={C.plan}
        strokeDasharray="5 4"
      />
      <text x={hour + 16} y={y3 + 5} fontSize="13.5" fill={C.plan} fontWeight="600">
        larger tasks · bit-identical GPU engine vs incremental CPU
      </text>

      <line
        x1={hour}
        x2={hour}
        y1={top - 6}
        y2={bottom}
        stroke={C.fail}
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <text x={hour} y={326} fontSize="13" textAnchor="middle" fill={C.fail} fontWeight="600">
        1-hour line, fixed before measuring
      </text>
      <text x={W - 20} y={326} fontSize="12" textAnchor="end" fill={C.muted} fontFamily={MONO}>
        solid: measured · dashed: designed
      </text>
    </svg>
  )
}

function Narrow() {
  const W = 360
  const x = logScale(10, 2_600_000, 16, W - 14)
  const top = 26
  const bottom = 318
  const hour = x(3600)
  return (
    <svg viewBox={`0 0 ${W} 372`} className="narrow" role="img" aria-label={LABEL}>
      {TICKS.filter((t) => [60, 3600, 86400].includes(t.v)).map((t) => (
        <g key={t.v}>
          <line x1={x(t.v)} x2={x(t.v)} y1={top - 4} y2={bottom} stroke={C.line} />
          <text
            x={x(t.v)}
            y={14}
            fontSize="12.5"
            textAnchor="middle"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t.l}
          </text>
        </g>
      ))}

      <text x={0} y={46} fontSize="13.5" fontWeight="600" fill={C.ink} {...halo}>
        Phase 0 · pilot
      </text>
      <line x1={x(60)} x2={x(60)} y1={60} y2={86} stroke={C.ink} strokeWidth="2.5" />
      <IntervalGlyph cx={x(60) + 50} y={73} />
      <text x={0} y={112} fontSize="13" fill={C.ink2} {...halo}>
        same 60 s: 53× trials,{" "}
        <tspan fill={C.accentInk} fontWeight="700">
          6.7× narrower
        </tspan>
      </text>

      <line x1={0} x2={W} y1={128} y2={128} stroke={C.line} />
      <text x={0} y={150} fontSize="13.5" fontWeight="600" fill={C.ink} {...halo}>
        Phase 1 · 32-core CPU
      </text>
      {TASKS.map((t, i) => {
        const y = 176 + i * 52
        return (
          <g key={t.id}>
            <text x={0} y={y + 4} fontSize="12" fill={C.muted} fontFamily={MONO}>
              {t.short}
            </text>
            <Arrow x0={x(t.from)} x1={x(t.to)} y={y} />
            <text
              x={x(t.from)}
              y={y + 23}
              fontSize="12"
              textAnchor="middle"
              fill={C.ink2}
              fontFamily={MONO}
            >
              {t.fromL}
            </text>
            <text
              x={x(t.to)}
              y={y + 23}
              fontSize="13"
              textAnchor="middle"
              fill={C.accentInk}
              fontWeight="700"
              fontFamily={MONO}
            >
              {t.toL}
            </text>
          </g>
        )
      })}

      <line x1={0} x2={W} y1={258} y2={258} stroke={C.line} />
      <text x={0} y={280} fontSize="13.5" fontWeight="600" fill={C.plan} {...halo}>
        Phase 2 · next
      </text>
      <rect
        x={hour + 4}
        y={290}
        width={W - 14 - hour - 4}
        height="24"
        rx="4"
        fill={C.paper}
        stroke={C.plan}
        strokeDasharray="5 4"
      />
      <text x={hour + 12} y={306} fontSize="12" fill={C.plan} fontWeight="600">
        GPU vs CPU, larger tasks
      </text>

      <line
        x1={hour}
        x2={hour}
        y1={top - 4}
        y2={bottom}
        stroke={C.fail}
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <text x={hour} y={340} fontSize="12.5" textAnchor="middle" fill={C.fail} fontWeight="600">
        1-hour line, fixed in advance
      </text>
      <text x={0} y={364} fontSize="11.5" fill={C.muted} fontFamily={MONO}>
        solid: measured · dashed: designed
      </text>
    </svg>
  )
}

const LABEL =
  "The project on one wall-clock axis. Phase 0, a pilot on a Colab T4: in the same 60-second budget the GPU ran 53 times more trials, so its interval was 6.7 times narrower. Phase 1, a 32-core CPU: with incremental evaluation T1 takes 43 seconds instead of 4.0 hours and T2 12 minutes instead of 15.2 days, both left of the one-hour line fixed before measuring. Phase 2, designed and not yet measured: larger tasks beyond the hour, a bit-identical GPU engine against the incremental CPU."

export function HeroArc() {
  return (
    <>
      <Wide />
      <Narrow />
    </>
  )
}

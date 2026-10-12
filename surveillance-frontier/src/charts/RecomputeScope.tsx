import { C } from "./palette"

// What one trial recomputes. Every cell is a (window length, start) pair:
// full recomputation scans and re-ranks all of them; incremental evaluation
// recomputes only the windows that overlap the injected event and merges
// them into the base series' precomputed orderings.

function Grid({
  x0,
  y0,
  cols,
  rows,
  event,
  incremental,
}: {
  x0: number
  y0: number
  cols: number
  rows: number
  event: { from: number; to: number }
  incremental: boolean
}) {
  const cell = 9
  const step = cell + 2
  return (
    <g>
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          // Row r is window length r + 1 (top = longest); a window that
          // starts within its length of the event overlaps it.
          const reach = rows - r
          const hit = c >= event.from - reach + 1 && c <= event.to
          return (
            <rect
              key={`${r}-${c}`}
              x={x0 + c * step}
              y={y0 + r * step}
              width={cell}
              height={cell}
              rx="1.5"
              fill={incremental ? (hit ? C.accent : C.surface) : C.ink2}
              stroke={incremental && !hit ? C.line2 : "none"}
              strokeWidth="0.8"
            />
          )
        }),
      )}
    </g>
  )
}

function Drawing({ narrow }: { narrow: boolean }) {
  const rows = 8
  const cols = narrow ? 30 : 46
  const step = 11
  const event = narrow ? { from: 14, to: 16 } : { from: 22, to: 25 }
  const gx = narrow ? 0 : 170
  const g1 = narrow ? 26 : 10
  const g2 = narrow ? 146 : 130
  const eventY = g2 + rows * step + 6
  const eventX = gx + event.from * step
  const eventW = (event.to - event.from + 1) * step - 2
  const W = narrow ? 330 : 680
  const H = eventY + (narrow ? 62 : 54)
  const fs = narrow ? 13 : 13

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label="Full recomputation rescans and re-ranks every window length at every start. Incremental evaluation recomputes only the windows that overlap the injected event, a triangle of cells above it, and merges them into precomputed orderings."
    >
      {narrow ? (
        <>
          <text x={0} y={16} fontSize={fs + 0.5} fill={C.ink} fontWeight="700">
            full
            <tspan fill={C.muted} fontWeight="400" fontSize={fs}>
              {"  "}scan and rank every cell
            </tspan>
          </text>
          <text x={0} y={g2 - 10} fontSize={fs + 0.5} fill={C.accentInk} fontWeight="700">
            incremental
            <tspan fill={C.muted} fontWeight="400" fontSize={fs}>
              {"  "}only cells the event touches
            </tspan>
          </text>
        </>
      ) : (
        <>
          <text x={0} y={24} fontSize={fs + 1} fill={C.ink} fontWeight="700">
            full
          </text>
          <text x={0} y={44} fontSize={fs} fill={C.muted}>
            scan every cell,
          </text>
          <text x={0} y={60} fontSize={fs} fill={C.muted}>
            sort each row again
          </text>
          <text x={0} y={144} fontSize={fs + 1} fill={C.accentInk} fontWeight="700">
            incremental
          </text>
          <text x={0} y={164} fontSize={fs} fill={C.muted}>
            recompute the cells
          </text>
          <text x={0} y={180} fontSize={fs} fill={C.muted}>
            the event touches, merge
          </text>
          <text x={0} y={196} fontSize={fs} fill={C.muted}>
            into stored orderings
          </text>
        </>
      )}
      <Grid x0={gx} y0={g1} cols={cols} rows={rows} event={event} incremental={false} />
      <Grid x0={gx} y0={g2} cols={cols} rows={rows} event={event} incremental />
      <rect x={eventX} y={eventY} width={eventW} height="8" rx="2" fill={C.ink} />
      <text
        x={eventX + eventW / 2}
        y={eventY + 24}
        fontSize={fs}
        textAnchor="middle"
        fill={C.ink}
        fontWeight="600"
      >
        injected event
      </text>
      {narrow && (
        <text x={0} y={eventY + 48} fontSize={fs - 1} fill={C.muted}>
          rows: window lengths (15) · columns: starts (604,800)
        </text>
      )}
      {!narrow && (
        <text x={gx} y={eventY + 46} fontSize={fs - 1} fill={C.muted}>
          rows: window lengths (15 in the engine) · columns: starts (604,800)
        </text>
      )}
    </svg>
  )
}

export function RecomputeScope() {
  return (
    <>
      <Drawing narrow={false} />
      <Drawing narrow />
    </>
  )
}

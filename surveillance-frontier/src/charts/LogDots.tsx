import { C, MONO, logScale } from "./palette"

// Values that span several orders of magnitude, one row each, as dots on a
// shared log axis. Used for task time-to-solution (seconds to weeks) and for
// pipeline times (tens of milliseconds to seconds). An optional reference
// line marks a decision threshold.

export type Dot = { key: string; value: number; colour: string; label?: string; ring?: boolean }
export type Row = { label: string; sub?: string; dots: Dot[] }

type Props = {
  rows: Row[]
  min: number
  max: number
  ticks: { value: number; label: string }[]
  reference?: { value: number; label: string }
  label: string
  /** Width of the wide drawing, for a figure set across the whole frame. */
  wide?: number
}

function Drawing({
  rows,
  min,
  max,
  ticks,
  reference,
  label,
  narrow,
  wide,
}: Props & { narrow: boolean }) {
  const W = narrow ? 360 : (wide ?? 760)
  const labelW = narrow ? 0 : 190
  const left = labelW + (narrow ? 8 : 12)
  const right = narrow ? 14 : 24
  const fs = narrow ? 13.5 : 13.5
  const top = 26
  // Narrow: the row's name sits on its own line above the track.
  const rowH = narrow ? 70 : 54
  const trackOffset = narrow ? 34 : rowH / 2
  const H = top + rows.length * rowH + (reference ? 26 : 10)
  const x = logScale(min, max, left, W - right)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label={label}
    >
      {ticks.map((t) => (
        <g key={t.value}>
          <line
            x1={x(t.value)}
            x2={x(t.value)}
            y1={top - 6}
            y2={H - (reference ? 18 : 4)}
            stroke={C.line}
          />
          <text
            x={x(t.value)}
            y={top - 12}
            fontSize={fs - 1.5}
            textAnchor="middle"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t.label}
          </text>
        </g>
      ))}
      {reference && (
        <g>
          <line
            x1={x(reference.value)}
            x2={x(reference.value)}
            y1={top - 6}
            y2={H - 18}
            stroke={C.fail}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={x(reference.value)}
            y={H - 4}
            textAnchor="middle"
            fontSize={fs - 1.5}
            fill={C.fail}
            fontWeight="600"
          >
            {reference.label}
          </text>
        </g>
      )}
      {rows.map((row, i) => {
        const y0 = top + i * rowH
        const ty = y0 + trackOffset
        const xs = row.dots.map((d) => x(d.value))
        return (
          <g key={row.label + (row.sub ?? "")}>
            {i > 0 && <line x1={0} x2={W} y1={y0} y2={y0} stroke={C.line} />}
            {narrow ? (
              <text x={0} y={y0 + 16} fontSize={fs} fill={C.ink} fontWeight="600">
                {row.label}
                {row.sub && (
                  <tspan fill={C.muted} fontWeight="400">
                    {"  "}
                    {row.sub}
                  </tspan>
                )}
              </text>
            ) : (
              <>
                <text x={0} y={ty - (row.sub ? 3 : -4)} fontSize={fs} fill={C.ink} fontWeight="600">
                  {row.label}
                </text>
                {row.sub && (
                  <text x={0} y={ty + 13} fontSize={fs - 1} fill={C.muted}>
                    {row.sub}
                  </text>
                )}
              </>
            )}
            {xs.length > 1 && (
              <line
                x1={Math.min(...xs)}
                x2={Math.max(...xs)}
                y1={ty}
                y2={ty}
                stroke={C.line2}
                strokeWidth="2"
              />
            )}
            {row.dots.map((d) => (
              <g key={d.key}>
                <circle
                  cx={x(d.value)}
                  cy={ty}
                  r={narrow ? 5 : 5.5}
                  fill={d.ring ? C.surface : d.colour}
                  stroke={d.colour}
                  strokeWidth={d.ring ? 2 : 1}
                />
                {d.label && (
                  <text
                    x={x(d.value)}
                    y={ty + (narrow ? 20 : 20)}
                    fontSize={fs - 1}
                    textAnchor="middle"
                    fill={d.colour === C.accent ? C.accentInk : C.ink2}
                    fontWeight={d.colour === C.accent ? 600 : 400}
                    fontFamily={MONO}
                  >
                    {d.label}
                  </text>
                )}
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function LogDots(props: Props) {
  return (
    <>
      <Drawing {...props} narrow={false} />
      <Drawing {...props} narrow />
    </>
  )
}

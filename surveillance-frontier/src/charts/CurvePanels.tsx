import { C, MONO, linScale, logScale } from "./palette"

// Rates (0 to 1) against event strength on a log axis, one panel per event
// length. Side by side on a wide screen, stacked on a narrow one, always on
// the same axes so panels compare at a glance.

export type Series = {
  key: string
  label: string
  colour: string
  dash?: string
  points: [number, number][]
}
export type Panel = { title: string; series: Series[] }

type Props = {
  panels: Panel[]
  xTicks: number[]
  xLabel: string
  yLabel: string
  /** Horizontal guide, e.g. 0.5. */
  guide?: number
  label: string
}

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1]

function PanelDrawing({
  panel,
  xTicks,
  guide,
  x0,
  y0,
  w,
  h,
  fs,
  yAxis,
}: {
  panel: Panel
  xTicks: number[]
  guide?: number
  x0: number
  y0: number
  w: number
  h: number
  fs: number
  yAxis: boolean
}) {
  const x = logScale(xTicks[0], xTicks[xTicks.length - 1], x0 + 6, x0 + w - 6)
  const y = linScale(0, 1, y0 + h, y0)
  return (
    <g>
      <text x={x0} y={y0 - 12} fontSize={fs + 0.5} fill={C.ink} fontWeight="600">
        {panel.title}
      </text>
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={C.line2} />
      {Y_TICKS.map((t) => (
        <g key={t}>
          {t > 0 && t < 1 && (
            <line
              x1={x0}
              x2={x0 + w}
              y1={y(t)}
              y2={y(t)}
              stroke={t === guide ? C.line2 : C.line}
              strokeDasharray={t === guide ? "2 3" : undefined}
            />
          )}
          {yAxis && (
            <text
              x={x0 - 6}
              y={y(t) + 4}
              fontSize={fs - 1.5}
              textAnchor="end"
              fill={C.muted}
              fontFamily={MONO}
            >
              {t}
            </text>
          )}
        </g>
      ))}
      {xTicks.map((t) => (
        <text
          key={t}
          x={x(t)}
          y={y0 + h + 15}
          fontSize={fs - 1.5}
          textAnchor="middle"
          fill={C.muted}
          fontFamily={MONO}
        >
          {t}
        </text>
      ))}
      {panel.series.map((s) => {
        const d = s.points.map(
          ([q, p], i) => `${i ? "L" : "M"}${x(q).toFixed(1)},${y(p).toFixed(1)}`,
        )
        return (
          <g key={s.key}>
            <path
              d={d.join("")}
              fill="none"
              stroke={s.colour}
              strokeWidth="2"
              strokeDasharray={s.dash}
              strokeLinejoin="round"
            />
            {!s.dash &&
              s.points.map(([q, p]) => (
                <circle key={q} cx={x(q)} cy={y(p)} r="3" fill={s.colour} />
              ))}
          </g>
        )
      })}
    </g>
  )
}

function Drawing({
  panels,
  xTicks,
  xLabel,
  yLabel,
  guide,
  label,
  narrow,
}: Props & { narrow: boolean }) {
  const fs = narrow ? 13.5 : 13.5
  const W = narrow ? 360 : 760
  const left = narrow ? 40 : 44
  const gap = narrow ? 0 : 22
  const ph = narrow ? 150 : 190
  const n = panels.length
  const pw = narrow ? W - left - 8 : (W - left - 8 - gap * (n - 1)) / n
  const step = narrow ? ph + 62 : 0
  const top = 28
  const legendY = narrow ? top + n * step - 8 : top + ph + 58
  const perRow = narrow ? 1 : 2
  const legendRows = Math.ceil(panels[0].series.length / perRow)
  const H = legendY + legendRows * 22 + (narrow ? 2 : 8)
  const series = panels[0].series

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label={label}
    >
      {panels.map((panel, i) => (
        <PanelDrawing
          key={panel.title}
          panel={panel}
          xTicks={xTicks}
          guide={guide}
          x0={narrow ? left : left + i * (pw + gap)}
          y0={narrow ? top + i * step : top}
          w={pw}
          h={ph}
          fs={fs}
          yAxis={narrow || i === 0}
        />
      ))}
      <text
        x={0}
        y={top + ph / 2}
        fontSize={fs - 1}
        fill={C.muted}
        transform={`rotate(-90 ${narrow ? 10 : 12} ${top + ph / 2})`}
        textAnchor="middle"
        dx={narrow ? 10 : 12}
      >
        {yLabel}
      </text>
      <text
        x={W - 8}
        y={narrow ? top + (n - 1) * step + ph + 32 : top + ph + 34}
        fontSize={fs - 1}
        fill={C.muted}
        textAnchor="end"
      >
        {xLabel}
      </text>
      {series.map((s, i) => {
        const colW = (W - left) / perRow
        const lx = left + (i % perRow) * colW
        const ly = legendY + Math.floor(i / perRow) * 22
        return (
          <g key={s.key}>
            <line
              x1={lx}
              x2={lx + 22}
              y1={ly - 4}
              y2={ly - 4}
              stroke={s.colour}
              strokeWidth="2.5"
              strokeDasharray={s.dash}
            />
            <text x={lx + 30} y={ly} fontSize={fs - 1} fill={C.ink2} fontFamily={MONO}>
              {s.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function CurvePanels(props: Props) {
  return (
    <>
      <Drawing {...props} narrow={false} />
      <Drawing {...props} narrow />
    </>
  )
}

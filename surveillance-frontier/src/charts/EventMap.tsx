import type { Band } from "../data/generated"
import { RAMP } from "../data/generated"
import { C, MONO, linScale } from "./palette"

// The Phase 0 rarity map around the fake SEC post: price band, volume and
// the map on one time axis. The map itself is a PNG with one pixel per
// (window centre, window length), drawn with nearest-neighbour scaling so it
// stays sharp at any size (scripts/make-data.mjs).

const WINDOWS = [2, 3, 4, 6, 8, 11, 16, 23, 32, 45, 64, 91, 128, 181, 256]
const LABELLED = [2, 8, 32, 128, 256]
const LEVELS = ["all", "top 10%", "1%", "0.1%", "0.01%", "0.001%"]

type Props = {
  band: Band
  image: string
  /** Window-length unit for the map's axis label. */
  unit: "min" | "s"
  /** Minutes between time ticks. */
  tickMinutes: number
  /** One-sentence description for assistive technology. */
  label: string
}

function hhmm(ms: number) {
  const d = new Date(ms)
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
}

function niceStep(range: number, target: number) {
  const raw = range / target
  const pow = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw)!
}

function Drawing({ band, image, unit, tickMinutes, label, narrow }: Props & { narrow: boolean }) {
  const W = narrow ? 360 : 760
  const left = narrow ? 50 : 64
  const right = narrow ? 8 : 16
  const fs = narrow ? 13.5 : 13
  const priceTop = narrow ? 52 : 30
  const priceH = narrow ? 92 : 128
  const volTop = priceTop + priceH + 10
  const volH = narrow ? 36 : 46
  const mapTop = volTop + volH + (narrow ? 22 : 12)
  const mapH = narrow ? 135 : 165
  const axisY = mapTop + mapH + 18
  const legendY = axisY + (narrow ? 40 : 30)
  const H = legendY + (narrow ? 30 : 26)

  const plotW = W - left - right
  const col = plotW / band.bars
  const x = (bar: number) => left + bar * col
  const msPerBar = band.n > 200_000 ? 1000 : 60_000

  const lo = Math.min(...band.low)
  const hi = Math.max(...band.high)
  const pad = (hi - lo) * 0.08
  const py = linScale(lo - pad, hi + pad, priceTop + priceH, priceTop)
  const step = niceStep(hi - lo, narrow ? 2 : 3)
  const priceTicks: number[] = []
  for (let v = Math.ceil((lo - pad) / step) * step; v <= hi + pad; v += step) priceTicks.push(v)

  const vMax = Math.max(...band.volume)
  const vy = linScale(0, vMax, volTop + volH, volTop)

  const pts = band.high.map((h, j) => [x(j * band.step + band.step / 2), h] as const)
  const bandPath =
    `M${pts.map(([px, h]) => `${px.toFixed(1)},${py(h).toFixed(1)}`).join("L")}` +
    `L${band.low
      .map((l, j) => [x(j * band.step + band.step / 2), l] as const)
      .reverse()
      .map(([px, l]) => `${px.toFixed(1)},${py(l).toFixed(1)}`)
      .join("L")}Z`
  const volPath = band.volume
    .map((v, j) => {
      const px = x(j * band.step + band.step / 2).toFixed(1)
      return `M${px},${volTop + volH}V${vy(v).toFixed(1)}`
    })
    .join("")
  const barW = Math.max(col * band.step * 0.7, 0.6)

  const ticks: { x: number; label: string }[] = []
  const tickMs = tickMinutes * 60_000
  const first = Math.ceil(band.startMs / tickMs) * tickMs
  for (let t = first; t < band.startMs + band.bars * msPerBar; t += tickMs) {
    ticks.push({ x: x((t - band.startMs) / msPerBar + 0.5), label: hhmm(t) })
  }
  const shown = narrow ? ticks.filter((_, i) => i % 2 === 0) : ticks

  const ev = x(band.eventIndex + 0.5)
  const rowH = mapH / WINDOWS.length
  const legendW = narrow ? 51 : 62

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={narrow ? "narrow" : "wide"}
      role="img"
      aria-label={label}
    >
      {/* price */}
      <text x={narrow ? 0 : left} y={14} fontSize={fs} fill={C.muted}>
        {narrow ? "Price, USDT" : "Price, USDT (high–low per bar)"}
      </text>
      {priceTicks.map((v) => (
        <g key={v}>
          <line x1={left} x2={W - right} y1={py(v)} y2={py(v)} stroke={C.line} />
          <text
            x={left - 8}
            y={py(v) + 4}
            fontSize={fs - 1}
            textAnchor="end"
            fill={C.muted}
            fontFamily={MONO}
          >
            {narrow ? `${v / 1000}k` : v.toLocaleString("en-US")}
          </text>
        </g>
      ))}
      <path d={bandPath} fill={C.ink} stroke={C.ink} strokeWidth="0.6" strokeLinejoin="round" />

      {/* volume */}
      <path d={volPath} stroke={C.faint} strokeWidth={barW} />
      <line x1={left} x2={W - right} y1={volTop + volH} y2={volTop + volH} stroke={C.line2} />
      <text
        x={left - 8}
        y={volTop + volH / 2 + 4}
        fontSize={fs - 1}
        textAnchor="end"
        fill={C.muted}
      >
        vol.
      </text>

      {/* rarity map */}
      <image
        href={image}
        x={left}
        y={mapTop}
        width={plotW}
        height={mapH}
        preserveAspectRatio="none"
        style={{ imageRendering: "pixelated" }}
      />
      {WINDOWS.map((w, k) =>
        LABELLED.includes(w) ? (
          <text
            key={w}
            x={left - 8}
            y={mapTop + (WINDOWS.length - 1 - k) * rowH + rowH / 2 + 4}
            fontSize={fs - 1}
            textAnchor="end"
            fill={C.muted}
            fontFamily={MONO}
          >
            {w}
          </text>
        ) : null,
      )}
      <text x={narrow ? 0 : 6} y={mapTop - 4} fontSize={fs - 1} fill={C.muted}>
        {narrow ? `len (${unit})` : `window (${unit})`}
      </text>

      {/* time axis */}
      <line x1={left} x2={W - right} y1={mapTop + mapH} y2={mapTop + mapH} stroke={C.line2} />
      {shown.map((t) => (
        <g key={t.label}>
          <line x1={t.x} x2={t.x} y1={mapTop + mapH} y2={mapTop + mapH + 4} stroke={C.line2} />
          <text
            x={t.x}
            y={axisY}
            fontSize={fs - 1}
            textAnchor="middle"
            fill={C.muted}
            fontFamily={MONO}
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* the event */}
      <line
        x1={ev}
        x2={ev}
        y1={priceTop - 6}
        y2={mapTop + mapH}
        stroke={C.ink}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {narrow ? (
        <g>
          <line x1={2} x2={2} y1={24} y2={40} stroke={C.ink} strokeDasharray="3 3" />
          <text x={10} y={36} fontSize={fs} fill={C.ink}>
            fake SEC post, 21:11 UTC
          </text>
        </g>
      ) : (
        <text x={ev - 6} y={priceTop + 4} fontSize={fs} textAnchor="end" fill={C.ink}>
          fake SEC post, 21:11 UTC
        </text>
      )}

      {/* legend */}
      <text x={left} y={legendY - (narrow ? 16 : 0)} fontSize={fs - 1} fill={C.muted}>
        {narrow ? "Rarity: top share of windows of that length" : "Rarity, for its length"}
      </text>
      {RAMP.map((c, i) => {
        const lx = narrow ? left + i * legendW : left + 150 + i * legendW
        const ly = narrow ? legendY - 6 : legendY - 10
        return (
          <g key={c}>
            <rect x={lx} y={ly} width={legendW - 4} height="10" fill={c} stroke={C.line} />
            <text x={lx} y={ly + 24} fontSize={fs - 2} fill={C.muted} fontFamily={MONO}>
              {narrow && i === 1 ? "10%" : LEVELS[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function EventMap(props: Props) {
  return (
    <>
      <Drawing {...props} narrow={false} />
      <Drawing {...props} narrow />
    </>
  )
}

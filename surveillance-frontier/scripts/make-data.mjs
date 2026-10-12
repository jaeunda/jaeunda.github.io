// Builds the data-driven figures of this site from the surveillance-frontier
// repository at a pinned commit, so nothing on the page is redrawn by hand.
//
//   node scripts/make-data.mjs /path/to/surveillance-frontier
//
// Writes
//   static/figures/rarity-1m.png, static/figures/rarity-1s.png
//       one pixel per (window centre, window length), coloured by rarity
//   src/data/generated.ts
//       the price band and volume under each map, and the exact detection
//       rates of Phase 1 (estimator_cells.csv)
//
// The rarity is the Phase 0 score, computed exactly as
// experiments/phase0-pilot/make_figures.py does it: for every (start, length)
// the price range (max high − min low) / min low and the volume sum, each
// ranked against all windows of the same length; S = −log10(rank / count)
// with the less extreme of the two ranks, plotted at the window centre.
import { readFile, writeFile } from "node:fs/promises"
import { deflateSync } from "node:zlib"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const repo = process.argv[2]
if (!repo) throw new Error("usage: node scripts/make-data.mjs /path/to/surveillance-frontier")

const WINDOWS = [2, 3, 4, 6, 8, 11, 16, 23, 32, 45, 64, 91, 128, 181, 256]
const EVENT_MS = Date.UTC(2024, 0, 9, 21, 11) // fake SEC post, 21:11 UTC

/** engine/src/series.cpp: "SFSER001", u64 n, i64 ts_ns[n], f32 low/high/volume[n]. */
async function loadSeries(file) {
  const buf = await readFile(path.join(repo, "data", file))
  if (buf.toString("latin1", 0, 8) !== "SFSER001") throw new Error(`${file}: not a series file`)
  const n = Number(buf.readBigUInt64LE(8))
  const at = (i) => 16 + i * n * 8
  const f32 = (offset) =>
    new Float32Array(buf.buffer.slice(buf.byteOffset + offset, buf.byteOffset + offset + n * 4))
  const ts = new BigInt64Array(buf.buffer.slice(buf.byteOffset + 16, buf.byteOffset + 16 + n * 8))
  const base = at(1)
  return { n, ts, low: f32(base), high: f32(base + n * 4), volume: f32(base + n * 8) }
}

/** Range and volume sum for every (length, start): monotonic deques and a float64 prefix sum. */
function features({ n, low, high, volume }, w) {
  const nk = n - w + 1
  const rng = new Float32Array(nk)
  const vol = new Float32Array(nk)
  const pre = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + volume[i]
  const qmin = new Int32Array(n)
  const qmax = new Int32Array(n)
  let h1 = 0,
    t1 = 0,
    h2 = 0,
    t2 = 0
  for (let i = 0; i < n; i++) {
    while (t1 > h1 && low[qmin[t1 - 1]] >= low[i]) t1--
    qmin[t1++] = i
    while (t2 > h2 && high[qmax[t2 - 1]] <= high[i]) t2--
    qmax[t2++] = i
    if (qmin[h1] <= i - w) h1++
    if (qmax[h2] <= i - w) h2++
    const s = i - w + 1
    if (s >= 0) {
      const mn = low[qmin[h1]]
      const mx = high[qmax[h2]]
      rng[s] = Math.fround(Math.fround(mx - mn) / mn)
      vol[s] = Math.fround(pre[s + w] - pre[s])
    }
  }
  return { rng, vol, nk }
}

/** Number of values ≥ v in an ascending array. */
function countAtLeast(sorted, v) {
  let lo = 0,
    hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sorted[mid] < v) lo = mid + 1
    else hi = mid
  }
  return sorted.length - lo
}

/** S for rows k = 0..14 over bars [lo, hi), indexed by window centre; NaN where no window is centred. */
function rarity(series, lo, hi) {
  return WINDOWS.map((w) => {
    const { rng, vol, nk } = features(series, w)
    const sr = Float32Array.from(rng).sort()
    const sv = Float32Array.from(vol).sort()
    const h = Math.floor(w / 2)
    const row = new Float64Array(hi - lo).fill(NaN)
    for (let c = lo; c < hi; c++) {
      const s = c - h
      if (s < 0 || s >= nk) continue
      const count = Math.max(countAtLeast(sr, rng[s]), countAtLeast(sv, vol[s]))
      row[c - lo] = -Math.log10(count / nk)
    }
    return row
  })
}

// One hue, light → dark: paper is a common window, deep indigo a rare one.
// Stops at S = 0, 1, 2, 3, 4, 5 (all, top 10%, 1%, 0.1%, 0.01%, 0.001%).
export const RAMP = ["#f1f1ec", "#cdd2f2", "#929eea", "#5a6be0", "#3441c4", "#1a2272"]
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const STOPS = RAMP.map(rgb)

function colour(s) {
  if (Number.isNaN(s)) return rgb("#f6f6f3")
  const x = Math.min(Math.max(s, 0), 5)
  const i = Math.min(Math.floor(x), 4)
  const t = x - i
  return STOPS[i].map((a, j) => Math.round(a + (STOPS[i + 1][j] - a) * t))
}

const CRC = new Int32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})
function crc32(buf) {
  let c = -1
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, "latin1")
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

/** The longest window on top, the shortest at the bottom, one pixel per bar. */
function png(rows) {
  const width = rows[0].length
  const height = rows.length
  const raw = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    const row = rows[height - 1 - y]
    const o = y * (1 + width * 3)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = colour(row[x])
      raw[o + 1 + x * 3] = r
      raw[o + 2 + x * 3] = g
      raw[o + 3 + x * 3] = b
    }
  }
  const head = Buffer.alloc(13)
  head.writeUInt32BE(width, 0)
  head.writeUInt32BE(height, 4)
  head[8] = 8 // bit depth
  head[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", head),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/** Price band (min low, max high) and volume sum per block of `step` bars. */
function band(series, lo, hi, step) {
  const out = { low: [], high: [], volume: [] }
  for (let b = lo; b < hi; b += step) {
    let l = Infinity,
      h = -Infinity,
      v = 0
    for (let i = b; i < Math.min(b + step, hi); i++) {
      l = Math.min(l, series.low[i])
      h = Math.max(h, series.high[i])
      v += series.volume[i]
    }
    out.low.push(Math.round(l))
    out.high.push(Math.round(h))
    out.volume.push(Math.round(v))
  }
  return out
}

/** The bar that opens at `ms` (both series have a bar at every minute). */
function barAt(series, ms) {
  const i = series.ts.indexOf(BigInt(ms) * 1_000_000n)
  if (i < 0) throw new Error(`no bar opens at ${new Date(ms).toISOString()}`)
  return i
}

async function map(file, half, step, out) {
  const series = await loadSeries(file)
  const i = barAt(series, EVENT_MS)
  const lo = i - half
  const hi = i + half + 1
  const S = rarity(series, lo, hi)
  await writeFile(path.join(root, "static", "figures", out), png(S))
  const startMs = Number(series.ts[lo] / 1_000_000n)
  console.log(`make-data: ${out} ${hi - lo}×${S.length} around bar ${i} of ${series.n}`)
  return {
    n: series.n,
    bars: hi - lo,
    eventIndex: i - lo,
    startMs,
    step,
    ...band(series, lo, hi, step),
  }
}

const m1 = await map("BTCUSDT_1m_2024Q1.bin", 180, 1, "rarity-1m.png")
const s1 = await map("BTCUSDT_1s_20240108_14.bin", 1200, 4, "rarity-1s.png")

// Exact rates by enumeration on the 64,000-bar prefix (Phase 1, E1).
const run = "experiments/phase1-feasibility/results/aws-c7i-16xlarge_2026-10-09"
const csv = (await readFile(path.join(repo, run, "estimator_cells.csv"), "utf8")).trim().split("\n")
const header = csv[0].split(",")
const cells = csv
  .slice(1)
  .map((line) => Object.fromEntries(line.split(",").map((v, j) => [header[j], Number(v)])))
const POLICIES = [
  [15, 1.5],
  [15, 2],
  [15, 3],
  [8, 2],
]
const exact = [6, 30, 120].map((L) => ({
  L,
  series: POLICIES.map(([K, s]) => ({
    K,
    sMin: s,
    points: cells
      .filter((c) => c.length === L && c.K === K && c.s_min === s && c.episode_gap === 60)
      .sort((a, b) => a.strength - b.strength)
      .map((c) => [c.strength, Number(c.p.toFixed(5))]),
  })),
}))

const ts = `// Generated by scripts/make-data.mjs from the surveillance-frontier
// repository (see README). Do not edit by hand.

export type Band = {
  /** Bars in the series the map was computed over. */
  n: number
  /** Bars shown, one map column each. */
  bars: number
  /** Column of the bar nearest 2024-01-09 21:11 UTC. */
  eventIndex: number
  /** Open time of the first shown bar, ms since epoch. */
  startMs: number
  /** Bars per entry of low/high/volume. */
  step: number
  low: number[]
  high: number[]
  volume: number[]
}

export const RAMP = ${JSON.stringify(RAMP)}

export const BAND_1M: Band = ${JSON.stringify(m1)}

export const BAND_1S: Band = ${JSON.stringify(s1)}

/** Exact new-episode rate p by strength q, per event length and policy (gap = 60). */
export const EXACT: { L: number; series: { K: number; sMin: number; points: [number, number][] }[] }[] = ${JSON.stringify(exact)}
`
await writeFile(path.join(root, "src", "data", "generated.ts"), ts)
console.log("make-data: src/data/generated.ts")

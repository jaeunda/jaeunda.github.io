import { METHOD, type MethodKey } from "../charts/palette"
import type { Row } from "../charts/LogDots"

// Projected time to solution, seconds (Phase 1, section 6; tables.md of the
// AWS c7i.16xlarge run of 2026-10-09). null = method not measured for that
// grid; such values are left empty, not extrapolated.
export const TTS: {
  task: string
  series: string
  full: number
  shared: number | null
  tail: number
  incremental: number
}[] = [
  {
    task: "T1 · 1 policy",
    series: "1-min quarter",
    full: 2910,
    shared: null,
    tail: 726,
    incremental: 11.1,
  },
  {
    task: "T1 · 1 policy",
    series: "1-s week",
    full: 14400,
    shared: null,
    tail: 3156,
    incremental: 42.9,
  },
  {
    task: "T2 · 24 policies",
    series: "1-min quarter",
    full: 267840,
    shared: 14040,
    tail: 3600,
    incremental: 180,
  },
  {
    task: "T2 · 24 policies",
    series: "1-s week",
    full: 1313280,
    shared: 69840,
    tail: 16920,
    incremental: 726,
  },
]

/** The way the source tables print a duration. */
export function human(s: number): string {
  if (s < 60) return `${s} s`
  if (s < 3600) return `${(s / 60).toFixed(1)} min`
  if (s < 86400) return `${(s / 3600).toFixed(1)} h`
  return `${(s / 86400).toFixed(1)} days`
}

const ORDER: MethodKey[] = ["full", "shared", "tail", "incremental"]

export function ttsRows(): Row[] {
  return TTS.map((row) => ({
    label: row.task,
    sub: row.series,
    dots: ORDER.filter((m) => row[m] !== null).map((m) => ({
      key: m,
      value: row[m]!,
      colour: METHOD[m].colour,
      label: m === "full" || m === "incremental" ? human(row[m]!) : undefined,
    })),
  }))
}

export const TTS_TICKS = [
  { value: 10, label: "10 s" },
  { value: 60, label: "1 min" },
  { value: 600, label: "10 min" },
  { value: 3600, label: "1 h" },
  { value: 86400, label: "1 day" },
  { value: 864000, label: "10 days" },
]

export const TTS_LABEL =
  "Projected time to solution on 32 cores. T1 on the 1-minute quarter: full 48.5 min, tail 12.1 min, incremental 11.1 s. T1 on the 1-second week: full 4.0 h, tail 52.6 min, incremental 42.9 s. T2 on the 1-minute quarter: full 3.1 days, shared 3.9 h, tail 1.0 h, incremental 3.0 min. T2 on the 1-second week: full 15.2 days, shared 19.4 h, tail 4.7 h, incremental 12.1 min. The one-hour decision line lies to the right of every incremental time."

export const ONE_HOUR = { value: 3600, label: "1-hour decision line" }

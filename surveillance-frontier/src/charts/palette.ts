// Diagram colours. These mirror the tokens in styles/global.css so an SVG
// reads in the same colours as the text around it; change both together.
export const C = {
  ink: "#17191e",
  ink2: "#3a3e46",
  muted: "#5d626c",
  faint: "#8a8f98",
  line: "#e1e1db",
  line2: "#c8c8c0",
  paper: "#f6f6f3",
  sunk: "#efefea",
  surface: "#ffffff",
  accent: "#3d4fd6",
  accentInk: "#2b3aa8",
  accentSoft: "#eceefc",
  pass: "#13724a",
  passSoft: "#e5f3eb",
  fail: "#b42318",
  hold: "#8f5300",
  plan: "#6b7079",
} as const

export const MONO = "'IBM Plex Mono', ui-monospace, monospace"

/**
 * The four exact trial methods, from the reference to the fastest. Grey for
 * the slower three, getting darker as they get faster; indigo for the
 * method every result is finally read against.
 */
export const METHOD = {
  full: { label: "full", colour: "#8f949c" },
  shared: { label: "shared", colour: "#737882" },
  tail: { label: "tail", colour: "#3a3e46" },
  incremental: { label: "incremental", colour: "#3d4fd6" },
} as const

export type MethodKey = keyof typeof METHOD

/** Maps a value to an x or y position on a log10 axis. */
export function logScale(min: number, max: number, from: number, to: number) {
  const a = Math.log10(min)
  const b = Math.log10(max)
  return (v: number) => from + ((Math.log10(v) - a) / (b - a)) * (to - from)
}

/** Maps a value to a position on a linear axis. */
export function linScale(min: number, max: number, from: number, to: number) {
  return (v: number) => from + ((v - min) / (max - min)) * (to - from)
}

/** Thousands separators, the way the source documents print numbers. */
export const fmt = (v: number, digits = 0) =>
  v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })

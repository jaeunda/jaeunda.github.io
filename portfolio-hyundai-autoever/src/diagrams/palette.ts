// Diagram colours. These mirror the tokens in styles/global.css so an SVG
// reads in the same colours as the text around it; change both together.
export const C = {
  ink: "#17191e",
  ink2: "#3a3e46",
  muted: "#5d626c",
  line: "#e1e1db",
  line2: "#c8c8c0",
  paper: "#f6f6f3",
  sunk: "#efefea",
  surface: "#ffffff",
  accent: "#3d4fd6",
  accentSoft: "#eceefc",
  fail: "#b42318",
  failSoft: "#fdecea",
  pass: "#13724a",
  passSoft: "#e5f3eb",
  hold: "#8f5300",
  holdSoft: "#fbf0dc",
  plan: "#6b7079",
} as const

export const MONO = "'IBM Plex Mono', ui-monospace, monospace"
export const DISPLAY = "'Space Grotesk', Pretendard, sans-serif"

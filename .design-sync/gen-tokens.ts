// Emits the design system's token CSS straight from quartz.config.ts, using
// Quartz's own emitter (quartz/util/theme.ts) so the tokens can never drift
// from what the site actually ships.
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import config from "../quartz.config"
import { joinStyles, googleFontHref } from "../quartz/util/theme"

const theme = config.configuration.theme
const outDir = process.argv[2] ?? "./.design-sync/.cache/dist/tokens"
mkdirSync(outDir, { recursive: true })

// joinStyles with no extra stylesheets yields exactly the :root token blocks.
const tokens = joinStyles(theme).trim() + "\n"
writeFileSync(join(outDir, "tokens.css"), tokens)

// googleFontHref leaves family spaces raw, which a browser tolerates in a
// <link href> but not reliably inside @import url() — encode them.
const fontHref = googleFontHref(theme).replace(/ /g, "%20")
const fontsCss = `/* Brand families, served by Google Fonts exactly as the live site does
   (quartz.config.ts theme.fontOrigin === "${theme.fontOrigin}"). */
@import url("${fontHref}");
`
writeFileSync(join(outDir, "fonts.css"), fontsCss)

// The GlobalConfiguration the components read at render time. Emitted as JSON
// so entry.tsx can have it without importing quartz.config.ts, which would drag
// Quartz's Node-only plugin graph (fs, git) into a browser bundle.
const cfgOut = { ...config.configuration }
delete (cfgOut as { analytics?: unknown }).analytics // carries a deploy token
mkdirSync("./.design-sync/.cache/ds-entry", { recursive: true })
writeFileSync("./.design-sync/.cache/ds-entry/cfg.json", JSON.stringify(cfgOut, null, 2))

console.log(`wrote tokens.css (${tokens.length}B) and fonts.css to ${outDir}`)
console.log(`wrote ds-entry/cfg.json`)
console.log(`fonts href: ${googleFontHref(theme)}`)

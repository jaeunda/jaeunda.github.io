// Compiles the design system's real stylesheets with dart-sass — the same
// compiler Quartz's own build uses through esbuild-sass-plugin.
//
// Two tiers, concatenated in the order the site loads them:
//   1. quartz/styles/custom.scss — the single global root (it @uses base.scss,
//      which pulls in variables/syntax/callouts).
//   2. quartz/components/styles/*.scss — per-component styles, which Quartz
//      normally injects via each component's static `css` property.
import { compile } from "sass"
import { globbySync } from "globby"
import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { basename, dirname } from "path"

const outFile = process.argv[2] ?? "./.design-sync/.cache/dist/ds-styles.css"
mkdirSync(dirname(outFile), { recursive: true })

const parts = []
const failures = []

// Rendered designs receive ONLY the transitive @import closure of styles.css,
// and the converter copies this file wholesale into _ds_bundle.css — a relative
// @import to a sibling token file would dangle. So the font @import and the
// token :root blocks are inlined here, ahead of everything that consumes them.
// (cfg.tokensGlob cannot do this job: lib/css.mjs copyTokens() returns early
// unless cfg.tokensPkg names a node_modules package, which this repo has not.)
const tokenDir = "./.design-sync/.cache/dist/tokens"
const fontsCss = readFileSync(`${tokenDir}/fonts.css`, "utf8").trim()
const tokensCss = readFileSync(`${tokenDir}/tokens.css`, "utf8").trim()
// @import rules are only valid at the very top of a stylesheet.
parts.push(`/* ===== brand fonts ===== */\n${fontsCss}`)
parts.push(`/* ===== design tokens (generated from quartz.config.ts) ===== */\n${tokensCss}`)

function add(file, label) {
  try {
    const res = compile(file, { loadPaths: ["quartz/styles", "node_modules"], silenceDeprecations: ["import", "global-builtin", "color-functions"] })
    parts.push(`/* ===== ${label} ===== */\n${res.css}`)
    return res.css.length
  } catch (e) {
    failures.push(`${label}: ${e.message.split("\n")[0]}`)
    return 0
  }
}

const globalBytes = add("quartz/styles/custom.scss", "quartz/styles/custom.scss (global)")
console.log(`global: ${globalBytes}B`)

let componentBytes = 0
for (const f of globbySync("quartz/components/styles/*.scss").sort()) {
  componentBytes += add(f, `components/styles/${basename(f)}`)
}
console.log(`components: ${componentBytes}B across 18 files`)

writeFileSync(outFile, parts.join("\n\n") + "\n")
console.log(`wrote ${outFile} (${parts.join("\n\n").length}B)`)
if (failures.length) {
  console.error(`\n${failures.length} FAILED:`)
  for (const f of failures) console.error(`  ! ${f}`)
  process.exit(1)
}

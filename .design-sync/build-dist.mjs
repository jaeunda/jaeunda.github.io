// Produces the `dist/` the design-sync converter consumes.
//
// Quartz has no published component build — it is a CLI, not a component
// package — so this compiles its real component source with the same loader
// treatment Quartz's own esbuild pipeline uses (quartz/cli/handlers.js):
//   · .scss            → compiled CSS text (that's what components assign to
//                        their static `css` property)
//   · .inline.(ts|js)  → text (Quartz injects these as <script> bodies)
// react / react/jsx-runtime stay EXTERNAL so the converter's own reactShim can
// point them at window.React.
import { build } from "esbuild"
import { sassPlugin } from "esbuild-sass-plugin"
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, unlinkSync, lstatSync } from "fs"
import { resolve } from "path"

const outfile = process.argv[2] ?? "./.design-sync/.cache/dist/index.mjs"
mkdirSync("./.design-sync/.cache/dist", { recursive: true })

// Quartz's component graph reaches a few Node-only modules for trivial
// reasons. Each is replaced with the smallest browser-safe equivalent rather
// than pulling a Node polyfill.
const browserShims = {
  name: "browser-shims",
  setup(b) {
    // util/resources.tsx uses randomUUID only to key React elements.
    b.onResolve({ filter: /^crypto$/ }, () => ({ path: "crypto-shim", namespace: "shim" }))
    b.onLoad({ filter: /^crypto-shim$/, namespace: "shim" }, () => ({
      contents: `export const randomUUID = () =>
        (globalThis.crypto && globalThis.crypto.randomUUID)
          ? globalThis.crypto.randomUUID()
          : 'id-' + Math.random().toString(36).slice(2)`,
      loader: "js",
    }))

    // Head.tsx imports ONE string constant from the og:image emitter, which
    // itself pulls node:fs, sharp and satori. Stub it to that constant.
    b.onResolve({ filter: /plugins\/emitters\/ogImage$/ }, () => ({
      path: "ogimage-shim",
      namespace: "shim",
    }))
    b.onLoad({ filter: /^ogimage-shim$/, namespace: "shim" }, () => ({
      // Value copied from quartz/plugins/emitters/ogImage.tsx:103.
      contents: `export const CustomOgImagesEmitterName = "CustomOgImages"`,
      loader: "js",
    }))

    // util/jsx.tsx calls trace() only on a Markdown parse failure, but
    // util/trace.ts imports workerpool + node:util/process for its pretty
    // stack formatting. In a browser preview, console.error is the equivalent.
    // Filters match the import specifier as written ("./trace",
    // "../util/trace"), not the resolved path.
    b.onResolve({ filter: /\/trace$/ }, () => ({ path: "trace-shim", namespace: "shim" }))
    b.onLoad({ filter: /^trace-shim$/, namespace: "shim" }, () => ({
      contents: `export function trace(msg, err) { console.error(msg, err) }`,
      loader: "js",
    }))

    // reading-time's CJS entry re-exports a Node stream API that nothing here
    // uses; its core module is browser-safe.
    b.onResolve({ filter: /^reading-time$/ }, () => ({
      path: resolve("node_modules/reading-time/lib/reading-time.js"),
    }))
  },
}

const inlineScriptAsText = {
  name: "inline-script-as-text",
  setup(b) {
    b.onLoad({ filter: /\.inline\.(ts|js)$/ }, (args) => ({
      contents: readFileSync(args.path, "utf8"),
      loader: "text",
    }))
  },
}

const result = await build({
  entryPoints: [".design-sync/ds-entry/entry.tsx"],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  // Quartz authors JSX for Preact (`class=`, `for=`); this shim renames those
  // to React spellings before delegating to react/jsx-runtime.
  // Aliased rather than given as a relative path: jsxImportSource resolves
  // relative to each importing file, which differs per component directory.
  jsxImportSource: "quartz-jsx-shim",
  alias: {
    "quartz-jsx-shim/jsx-runtime": resolve(".design-sync/ds-entry/jsx-runtime.js"),
    "quartz-jsx-shim/jsx-dev-runtime": resolve(".design-sync/ds-entry/jsx-runtime.js"),
    // quartz/util/jsx.tsx imports jsx/jsxs/Fragment from preact at RUNTIME to
    // drive hast-util-to-jsx-runtime for page bodies. It has to produce React
    // elements like everything else.
    "preact/jsx-runtime": resolve(".design-sync/ds-entry/jsx-runtime.js"),
    preact: "react",
  },
  // tsconfig.json sets jsxImportSource: "preact", and esbuild honours the
  // tsconfig per-file over the build-level option. Override it explicitly.
  tsconfigRaw: {
    compilerOptions: { jsx: "react-jsx", jsxImportSource: "quartz-jsx-shim" },
  },
  external: ["react", "react-dom", "react/jsx-runtime"],
  loader: { ".json": "json" },
  plugins: [browserShims, inlineScriptAsText, sassPlugin({ type: "css-text", cssImports: true, silenceDeprecations: ["import", "global-builtin", "color-functions"] })],
  metafile: true,
  logLevel: "warning",
  logLimit: 40,
})

const bytes = result.metafile.outputs[outfile.replace(/^\.\//, "")]?.bytes ?? 0
console.log(`wrote ${outfile} (${(bytes / 1024).toFixed(1)} KiB)`)

/* ------------------------------------------------------ types for the entry */

// The converter discovers components from PascalCase value exports in the
// .d.ts tree (lib/source-kit.mjs), and the design agent reads <Name>Props as
// the API contract. Generated from entry.tsx's own export list so the two can
// never drift.
const entrySrc = readFileSync(".design-sync/ds-entry/entry.tsx", "utf8")
const names = [...entrySrc.matchAll(/^export const (\w+) = bind\(/gm)].map((m) => m[1])
if (names.length === 0) throw new Error("no bound components found in entry.tsx")

const dts = `// Generated by .design-sync/build-dist.mjs — do not edit.
import type { ReactElement, ReactNode } from "react"

/** One page's data, as Quartz's build pipeline produces it. */
export interface QuartzPageData {
  /** Path-like page id, e.g. "Deadlocks" or "tags/topic/database". */
  slug?: string
  filePath?: string
  relativePath?: string
  frontmatter?: {
    title?: string
    tags?: string[]
    featured?: boolean
    pinOrder?: number
    [key: string]: unknown
  }
  /** Short summary text shown on post cards. */
  description?: string
  /** Full body text, used for reading-time estimates. */
  text?: string
  dates?: { created?: Date; modified?: Date; published?: Date }
  /** Heading outline, used by TableOfContents. */
  toc?: { depth: number; text: string; slug: string }[]
  /** Slugs this page links to, used by Backlinks. */
  links?: string[]
}

/** Site-wide configuration from quartz.config.ts. */
export interface QuartzSiteConfig {
  pageTitle?: string
  pageTitleSuffix?: string
  locale?: string
  baseUrl?: string
  defaultDateType?: "created" | "modified" | "published"
  theme?: Record<string, unknown>
}

/**
 * Props every component accepts. All are optional: each export is pre-bound to
 * a realistic build context, so a component renders with no props at all.
 * Override any field to drive the component with your own data.
 */
export interface QuartzComponentProps {
  /** The page being rendered. Several components key off \`fileData.slug\`. */
  fileData?: QuartzPageData
  /** Every page on the site; list components read from this. */
  allFiles?: QuartzPageData[]
  cfg?: QuartzSiteConfig
  /** Restricts the component to one breakpoint. */
  displayClass?: "mobile-only" | "desktop-only"
  /** hast tree of the page body, used by the page-body components. */
  tree?: unknown
  children?: ReactNode
  [key: string]: unknown
}

${names.map((n) => `export interface ${n}Props extends QuartzComponentProps {}`).join("\n")}

${names.map((n) => `export declare const ${n}: (props?: ${n}Props) => ReactElement | null`).join("\n")}

/** The raw QuartzComponentConstructor factories, unbound. */
export declare const constructors: Record<string, (opts?: unknown) => unknown>
/** The build context the exports above are bound to. */
export declare const fixtures: {
  cfg: QuartzSiteConfig
  allFiles: QuartzPageData[]
  indexPage: QuartzPageData
  articlePage: QuartzPageData
  tagPage: QuartzPageData
  tree: unknown
}
export declare const cfg: QuartzSiteConfig
export declare const allFiles: QuartzPageData[]
`

writeFileSync(outfile.replace(/\.mjs$/, ".d.ts"), dts)
console.log(`wrote ${outfile.replace(/\.mjs$/, ".d.ts")} (${names.length} components)`)

// package-build.mjs walks UP from --entry to the first package.json that has a
// name, and treats that directory as the package root. Without this file the
// walk reaches the repo's own package.json and looks for components in the
// repo root instead of here.
const distPkg = {
  name: "@jackyzha0/quartz",
  version: JSON.parse(readFileSync("package.json", "utf8")).version,
  private: true,
  type: "module",
  module: "./index.mjs",
  main: "./index.mjs",
  types: "./index.d.ts",
}
writeFileSync(".design-sync/.cache/dist/package.json", JSON.stringify(distPkg, null, 2) + "\n")
console.log(`wrote .design-sync/.cache/dist/package.json (${distPkg.name}@${distPkg.version})`)

// lib/dts.mjs resolves @types/react by walking up from the package dir looking
// for <dir>/node_modules/@types/react. The repo's own node_modules has no React
// types (Quartz is a Preact project), so without this link every React utility
// type collapses to `any` and the emitted prop bodies come out empty.
const nmLink = ".design-sync/.cache/dist/node_modules"
try {
  if (lstatSync(nmLink, { throwIfNoEntry: false })) unlinkSync(nmLink)
} catch {
  /* not a symlink — leave it alone */
}
symlinkSync(resolve(".ds-sync/node_modules"), nmLink, "dir")
console.log(`linked ${nmLink} -> .ds-sync/node_modules`)

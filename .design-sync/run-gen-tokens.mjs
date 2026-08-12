// quartz.config.ts pulls in the whole plugin graph, which imports .scss and
// .inline scripts that plain tsx cannot load. Bundle through esbuild with the
// same loader treatment Quartz's own build uses, then execute the result.
import { build } from "esbuild"
import { mkdirSync } from "fs"
import { pathToFileURL } from "url"

const outfile = "./.design-sync/.cache/gen-tokens.bundle.mjs"
mkdirSync("./.design-sync/.cache", { recursive: true })

await build({
  entryPoints: ["./.design-sync/gen-tokens.ts"],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  plugins: [
    {
      // Same treatment Quartz's own worker transpile applies
      // (quartz/processors/parse.ts): styles and inline scripts are irrelevant
      // to reading the config object, so stub them rather than compile them.
      name: "css-and-scripts-as-text",
      setup(b) {
        b.onLoad({ filter: /\.scss$/ }, () => ({ contents: "", loader: "text" }))
        b.onLoad({ filter: /\.inline\.(ts|js)$/ }, () => ({ contents: "", loader: "text" }))
      },
    },
  ],
  jsx: "automatic",
  jsxImportSource: "preact",
  logLevel: "warning",
})

process.argv[2] = process.argv[2] ?? "./.design-sync/.cache/tokens"
await import(pathToFileURL(outfile).href)

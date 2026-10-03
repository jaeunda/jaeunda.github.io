// Renders every route to static HTML: dist/index.html for the home page and
// dist/<route>/index.html for each project page. The first paint does not wait
// for JavaScript, the content is readable without it, and a direct visit to a
// project URL works on GitHub Pages. The client hydrates the same markup
// (src/main.tsx).
import { mkdir, readFile, writeFile, rm } from "node:fs/promises"
import { fileURLToPath, pathToFileURL } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")
const serverEntry = path.join(root, "dist-ssr", "entry-server.js")
const marker = "<!--app-html-->"
const origin = "https://jaeunda.github.io/portfolio-dbinc"

const { render, routes } = await import(pathToFileURL(serverEntry).href)
const template = await readFile(path.join(dist, "index.html"), "utf8")
if (!template.includes(marker)) {
  throw new Error(`prerender: ${marker} not found in dist/index.html`)
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

// Swaps one tag's value, and fails loudly if index.html stops matching.
function set(html, pattern, value) {
  if (!pattern.test(html)) throw new Error(`prerender: no match for ${pattern}`)
  return html.replace(pattern, (_, before, after) => before + escape(value) + after)
}

for (const route of routes) {
  const url = origin + route.path
  // The root records which route its markup is for, so the client hydrates
  // only when the URL it was served at resolves to the same route.
  let html = template
    .replace('<div id="root">', `<div id="root" data-route="${route.path}">`)
    .replace(marker, render(route.path))
  html = set(html, /(<title>)[^<]*(<\/title>)/, route.title)
  html = set(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, route.description)
  html = set(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, route.title)
  html = set(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, route.description)
  html = set(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url)
  html = set(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, url)

  const dir = path.join(dist, route.path)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, "index.html"), html)
  console.log(`prerender: ${route.path}`)
}

await rm(path.join(root, "dist-ssr"), { recursive: true, force: true })

// Builds the QuartzComponentProps fixture from the repository's REAL content,
// so preview cards show this blog's actual posts, tags and dates rather than
// invented placeholder data. Emitted as JSON and inlined into the bundle by
// esbuild (the browser bundle cannot read the filesystem).
//
// Dates travel as ISO strings and are revived in entry.tsx — JSON has no Date.
import matter from "gray-matter"
import { globbySync } from "globby"
import isAbsoluteUrl from "is-absolute-url"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { readFileSync, mkdirSync, writeFileSync } from "fs"
import { basename, dirname } from "path"

const outFile = process.argv[2] ?? "./.design-sync/.cache/ds-entry/fixture-data.json"
mkdirSync(dirname(outFile), { recursive: true })

// Mirrors quartz/util/path.ts slugification for the flat content/ layout here:
// spaces and other unsafe characters become dashes.
function slugify(name) {
  return name
    .replace(/\.md$/, "")
    .split("/")
    .map((seg) =>
      seg
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, ""),
    )
    .join("/")
}

function stripSlashes(value, onlyPrefix = false) {
  const withoutPrefix = value.startsWith("/") ? value.slice(1) : value
  return !onlyPrefix && withoutPrefix.endsWith("/") ? withoutPrefix.slice(0, -1) : withoutPrefix
}

function endsWithPath(value, suffix) {
  return value === suffix || value.endsWith(`/${suffix}`)
}

function simplifySlug(value) {
  const withoutIndex = endsWithPath(value, "index") ? value.slice(0, -5) : value
  const simple = stripSlashes(withoutIndex, true)
  return simple.length === 0 ? "/" : simple
}

function joinSegments(...segments) {
  if (segments.length === 0) return ""

  let joined = segments
    .filter((segment) => segment !== "" && segment !== "/")
    .map((segment) => stripSlashes(segment))
    .join("/")

  if (segments[0].startsWith("/")) joined = `/${joined}`
  if (segments.at(-1).endsWith("/")) joined += "/"
  return joined
}

function pathToRoot(slug) {
  const root = slug
    .split("/")
    .filter(Boolean)
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return root || "."
}

function resolveRelative(current, target) {
  return joinSegments(pathToRoot(current), simplifySlug(target))
}

function isFolderPath(value) {
  return (
    value.endsWith("/") ||
    endsWithPath(value, "index") ||
    endsWithPath(value, "index.md") ||
    endsWithPath(value, "index.html")
  )
}

// Mirrors the "shortest" CrawlLinks strategy configured in quartz.config.ts,
// then applies the same canonicalization CrawlLinks uses for fileData.links.
function resolveInternalLink(sourceSlug, rawTarget, allSlugs) {
  if (isAbsoluteUrl(rawTarget, { httpOnly: false }) || rawTarget.startsWith("#")) return null

  const decoded = decodeURI(rawTarget)
  const fileLike = decoded.split("#", 1)[0]
  const folderPath = isFolderPath(fileLike)
  const segments = fileLike.split("/").filter(Boolean)
  const prefix = segments.filter((segment) => /^\.{1,2}$/.test(segment)).join("/")
  const filePath = segments.filter((segment) => !/^\.{1,2}$/.test(segment)).join("/")
  const simpleTarget = simplifySlug(slugify(filePath))
  const targetPath = joinSegments(stripSlashes(prefix), stripSlashes(simpleTarget))
  const relativeTarget = targetPath.startsWith(".") ? targetPath : `./${targetPath || "."}`
  const canonicalTarget = stripSlashes(relativeTarget.slice(1))
  const matchingSlugs = allSlugs.filter((slug) => slug.split("/").at(-1) === canonicalTarget)
  const transformed =
    matchingSlugs.length === 1
      ? resolveRelative(sourceSlug, matchingSlugs[0])
      : joinSegments(pathToRoot(sourceSlug), canonicalTarget) + (folderPath ? "/" : "")

  const current = simplifySlug(sourceSlug)
  const url = new URL(transformed, `https://base.com/${stripSlashes(current, true)}`)
  let destination = url.pathname
  if (destination.endsWith("/")) destination += "index"
  return simplifySlug(decodeURIComponent(stripSlashes(destination, true)))
}

function firstProse(body) {
  // Skip fenced code, headings and list markers to find a real sentence for
  // the card preview text (Quartz's Description plugin does the equivalent).
  const cleaned = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6} .*$/gm, "")
    .replace(/^[-*+>|] .*$/gm, "")
    .replace(/^\s*\d+\.\s.*$/gm, "")
    .replace(/[*_`]/g, "")
  const para = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .find((p) => p.length > 40)
  if (!para) return ""
  return para.length > 150 ? para.slice(0, 150).trimEnd() + "…" : para
}

const markdownParser = unified().use(remarkParse).use(remarkGfm)
const contentFiles = globbySync("content/**/*.md").sort()
const allSlugs = contentFiles.map((file) => slugify(file.replace(/^content\//, "")))

const pages = []
for (const file of contentFiles) {
  const raw = readFileSync(file, "utf8")
  const { data, content } = matter(raw)
  const rel = file.replace(/^content\//, "")
  const slug = slugify(rel)
  if (slug === "index") continue

  // Quartz's title falls back to the filename when frontmatter omits it,
  // which is exactly the case for this repo's notes.
  const title = data.title ?? basename(rel).replace(/\.md$/, "")
  const dateStr = data.Date ?? data.date ?? data.published ?? data.created
  const iso = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

  // TocEntry[] as quartz/plugins/transformers/toc.ts defines it: depth is
  // relative to the shallowest heading in the file.
  const headings = [...content.matchAll(/^(#{1,6})\s+(.+)$/gm)]
    .filter((m) => !/^```/.test(m[2]))
    .map((m) => ({ level: m[1].length, text: m[2].replace(/[*_`]/g, "").trim() }))
  const minLevel = headings.length ? Math.min(...headings.map((h) => h.level)) : 0
  const toc = headings.map((h) => ({
    depth: h.level - minLevel,
    text: h.text,
    slug: h.text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  }))

  // Wikilinks and parsed Markdown links, resolved with Quartz's "shortest"
  // strategy — Backlinks filters allFiles on `links?.includes(slug)`.
  // `![[x]]` is an image embed, not a page link — the negative lookbehind keeps
  // those out, otherwise every embedded screenshot looks like an outgoing link.
  const linkTargets = [...content.matchAll(/(?<!!)\[\[([^\]|#]+)/g)].map((m) => m[1].trim())
  const markdownTree = markdownParser.parse(content)
  const definitions = new Map()
  visit(markdownTree, "definition", (node) => definitions.set(node.identifier, node.url))
  visit(markdownTree, "link", (node) => linkTargets.push(node.url))
  visit(markdownTree, "linkReference", (node) => {
    const target = definitions.get(node.identifier)
    if (target) linkTargets.push(target)
  })
  const links = [
    ...new Set(
      linkTargets
        .map((target) => resolveInternalLink(slug, target, allSlugs))
        .filter((target) => target !== null),
    ),
  ]

  pages.push({
    slug,
    filePath: `content/${rel}`,
    relativePath: rel,
    frontmatter: {
      title,
      tags: data.tags ?? [],
      featured: data.featured,
      pinOrder: data.pinOrder,
    },
    description: firstProse(content),
    text: content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    datesISO: { created: iso, modified: iso, published: iso },
    toc,
    links,
  })
}

const tagCounts = {}
for (const p of pages) for (const t of p.frontmatter.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1

const out = { pages, tagCounts }
writeFileSync(outFile, JSON.stringify(out, null, 2))
console.log(`wrote ${outFile}: ${pages.length} pages, ${Object.keys(tagCounts).length} tags`)
console.log(
  `tags: ${Object.entries(tagCounts)
    .map(([t, n]) => `${t}(${n})`)
    .join(", ")}`,
)
console.log(`titles: ${pages.map((p) => p.frontmatter.title).join(" | ")}`)

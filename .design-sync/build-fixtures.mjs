// Builds the QuartzComponentProps fixture from the repository's REAL content,
// so preview cards show this blog's actual posts, tags and dates rather than
// invented placeholder data. Emitted as JSON and inlined into the bundle by
// esbuild (the browser bundle cannot read the filesystem).
//
// Dates travel as ISO strings and are revived in entry.tsx — JSON has no Date.
import matter from "gray-matter"
import { globbySync } from "globby"
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

const pages = []
for (const file of globbySync("content/**/*.md").sort()) {
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

  // Wikilinks and relative markdown links, resolved to slugs — Backlinks
  // filters allFiles on `links?.includes(slug)`.
  // `![[x]]` is an image embed, not a page link — the negative lookbehind keeps
  // those out, otherwise every embedded screenshot looks like an outgoing link.
  const links = [
    ...[...content.matchAll(/(?<!!)\[\[([^\]|#]+)/g)].map((m) => slugify(m[1].trim())),
    ...[...content.matchAll(/(?<!!)\]\(\.?\/?([^)\s#]+\.md)/g)].map((m) => slugify(m[1].trim())),
  ].filter((l) => !/\.(png|jpe?g|gif|svg|webp)$/i.test(l))

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

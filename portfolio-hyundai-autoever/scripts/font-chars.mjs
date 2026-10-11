// The Korean face (static/fonts/pretendard-variable-subset.woff2) is a subset,
// so a character it was not cut with falls back to whatever the visitor's OS
// has and no longer matches the rest of the page.
//
//   node scripts/font-chars.mjs          rewrite scripts/font-chars.txt
//   node scripts/font-chars.mjs --check  fail if the copy uses a character
//                                        the committed list does not cover
//
// font-chars.txt is the list the font was cut from: the charset shared with the
// rest of jaeunda.github.io plus every character this site's copy uses. After
// rewriting it, re-cut the font (see README).
import { readFile, writeFile, readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const listPath = path.join(root, "scripts", "font-chars.txt")
const sharedPath = path.join(root, "..", "scripts", "fonts", "portfolio-subset-chars.txt")

async function sources(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await sources(full)))
    else if (/\.(tsx?|html)$/.test(entry.name)) out.push(full)
  }
  return out
}

const files = [...(await sources(path.join(root, "src"))), path.join(root, "index.html")]
const used = new Set()
for (const file of files) {
  for (const char of await readFile(file, "utf8")) {
    if (char > "\u007f") used.add(char)
  }
}

if (process.argv.includes("--check")) {
  const covered = new Set(await readFile(listPath, "utf8"))
  const missing = [...used].filter((char) => !covered.has(char)).sort()
  if (missing.length > 0) {
    console.error(`font-chars: not in the font subset: ${missing.join("")}`)
    console.error("font-chars: run `node scripts/font-chars.mjs` and re-cut the font (see README)")
    process.exit(1)
  }
  console.log(`font-chars: ${used.size} non-ASCII characters, all covered`)
} else {
  const shared = await readFile(sharedPath, "utf8").catch(() => "")
  const all = new Set([...shared, ...used])
  all.delete("\n")
  all.delete("\r")
  await writeFile(listPath, [...all].sort().join("") + "\n")
  console.log(`font-chars: wrote ${all.size} characters to scripts/font-chars.txt`)
}

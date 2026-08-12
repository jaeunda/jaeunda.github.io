// Design-system entry for jaeunda.log.
//
// WHY THIS FILE EXISTS
// Quartz components are not standalone UI parts: each is a
// QuartzComponentConstructor factory whose product reads the entire static-site
// build context as props (ctx, cfg, fileData, allFiles, tree). A design agent
// cannot synthesize that, and several components return null unless the page
// slug matches (Hero, PinnedPosts, RecentNotesWithPreview).
//
// So each export below is the REAL component, constructed with the REAL options
// from quartz.layout.ts, with a realistic build context pre-bound as default
// props. Callers override any prop. Nothing here reimplements a component —
// the actual Quartz source renders; this only supplies its context.
//
// The raw factories stay reachable as `constructors.<Name>` and the fixtures as
// `fixtures`, so the original API is never hidden.
import type { ComponentType } from "react"
import * as Q from "../../quartz/components"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"
import type { GlobalConfiguration } from "../../quartz/cfg"
import type { QuartzPluginData } from "../../quartz/plugins/vfile"
import type { FullSlug } from "../../quartz/util/path"
import cfgJson from "../.cache/ds-entry/cfg.json"
import fixtureData from "../.cache/ds-entry/fixture-data.json"

/* ------------------------------------------------------------------ context */

export const cfg = cfgJson as unknown as GlobalConfiguration

type RawPage = (typeof fixtureData.pages)[number]

// JSON has no Date; Quartz reads fileData.dates[cfg.defaultDateType].
function revive(p: RawPage): QuartzPluginData {
  return {
    ...p,
    slug: p.slug as FullSlug,
    dates: {
      created: new Date(p.datesISO.created),
      modified: new Date(p.datesISO.modified),
      published: new Date(p.datesISO.published),
    },
  } as unknown as QuartzPluginData
}

export const allFiles: QuartzPluginData[] = fixtureData.pages.map(revive)

const articlePage =
  allFiles.find((p) => (p.slug as string) === "Deadlocks") ?? allFiles[0]

const indexPage = {
  slug: "index" as FullSlug,
  filePath: "content/index.md",
  relativePath: "index.md",
  frontmatter: { title: cfg.pageTitle, tags: [] },
  dates: articlePage.dates,
  toc: [],
  links: [],
} as unknown as QuartzPluginData

const tagPage = {
  slug: "tags/topic/database" as FullSlug,
  filePath: "content/tags/topic/database.md",
  relativePath: "tags/topic/database.md",
  frontmatter: { title: "topic/database", tags: ["topic/database"] },
  dates: articlePage.dates,
  toc: [],
  links: [],
} as unknown as QuartzPluginData

// A small but real hast tree so the page-body components have content to lay
// out. Shape matches what remark/rehype hands Quartz.
const tree = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        {
          type: "text",
          value:
            "Lock 기반 동시성 제어에서 Transaction은 데이터를 읽거나 쓰기 전에 반드시 Lock을 획득해야 한다.",
        },
      ],
    },
    {
      type: "element",
      tagName: "h2",
      properties: { id: "deadlock-detection" },
      children: [{ type: "text", value: "Deadlock Detection" }],
    },
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        { type: "text", value: "Wait-for graph에 cycle이 존재하면 deadlock이다. " },
        {
          type: "element",
          tagName: "a",
          properties: { href: "./Lock-based-Protocol", className: ["internal"] },
          children: [{ type: "text", value: "Lock based Protocol" }],
        },
        { type: "text", value: " 문서에서 이어진다." },
      ],
    },
    {
      type: "element",
      tagName: "ul",
      properties: {},
      children: ["Wait-die", "Wound-wait", "Timeout based"].map((t) => ({
        type: "element",
        tagName: "li",
        properties: {},
        children: [{ type: "text", value: t }],
      })),
    },
  ],
}

// ctx is mutated by Breadcrumbs/FolderContent (`ctx.trie ??= …`), so it must be
// a plain mutable object. `cfg.plugins.emitters` exists only because Head reads
// it; the preview never needs real emitters.
const ctx = {
  cfg: { configuration: cfg, plugins: { transformers: [], filters: [], emitters: [] } },
  argv: {
    directory: "content",
    verbose: false,
    output: "public",
    serve: false,
    watch: false,
    port: 8080,
    wsPort: 3001,
  },
  allSlugs: allFiles.map((p) => p.slug as FullSlug),
  allFiles,
  incremental: false,
}

const externalResources = { css: [], js: [], additionalHead: [] }

function baseProps(fileData: QuartzPluginData): QuartzComponentProps {
  return {
    ctx,
    externalResources,
    fileData,
    cfg,
    children: [],
    tree,
    allFiles,
  } as unknown as QuartzComponentProps
}

export const fixtures = { cfg, allFiles, indexPage, articlePage, tagPage, tree }

/* -------------------------------------------------------------- prop binding */

type Bound = ComponentType<Partial<QuartzComponentProps>> & {
  css?: unknown
  beforeDOMLoaded?: unknown
  afterDOMLoaded?: unknown
}

// Wraps a constructed Quartz component so the build context is optional.
// `extra` supplies props for components whose render is gated on data this
// site's content does not currently contain (see the call sites).
function bind(
  name: string,
  Comp: QuartzComponent,
  fileData: QuartzPluginData,
  extra?: Partial<QuartzComponentProps>,
): Bound {
  const Wrapped = (props: Partial<QuartzComponentProps>) => {
    const merged = { ...baseProps(fileData), ...extra, ...props } as QuartzComponentProps
    return <Comp {...merged} />
  }
  Wrapped.displayName = name
  // Quartz attaches styles/scripts as statics; keep them reachable.
  Wrapped.css = (Comp as Bound).css
  Wrapped.beforeDOMLoaded = (Comp as Bound).beforeDOMLoaded
  Wrapped.afterDOMLoaded = (Comp as Bound).afterDOMLoaded
  return Wrapped as Bound
}

/* ------------------------------------------------------- home page (index/) */

export const Hero = bind(
  "Hero",
  Q.Hero({
    greeting: "Hi, I'm {accent}.",
    accent: "jaeunda",
    subtitle: "공부하면서 이해한 것들을 제 언어로 기록합니다.",
  }),
  indexPage,
)

// PinnedPosts renders only pages with `featured: true` in frontmatter, and no
// post in content/ carries that flag today — so it renders nothing on the live
// site too, despite being the mounted home component (quartz.layout.ts:12).
// The card marks the four most recent posts featured so the component's real
// 2-column layout is visible.
const featuredFiles = allFiles.map((p, i) =>
  i < 4
    ? ({ ...p, frontmatter: { ...p.frontmatter, featured: true, pinOrder: i } } as QuartzPluginData)
    : p,
)

export const PinnedPosts = bind("PinnedPosts", Q.PinnedPosts(), indexPage, {
  allFiles: featuredFiles,
} as Partial<QuartzComponentProps>)

export const RecentNotesWithPreview = bind(
  "RecentNotesWithPreview",
  Q.RecentNotesWithPreview({ limit: 5, showTags: true, showReadTime: true, mode: "featured" }),
  indexPage,
)

// quartz.layout.ts mounts TagCloud twice: bare on mobile home, and as a
// sidebar variant on every page.
export const TagCloud = bind("TagCloud", Q.TagCloud({ limit: 8 }), indexPage)
export const TagCloudSidebar = bind(
  "TagCloudSidebar",
  Q.TagCloud({ limit: 8, showOnAllPages: true, variant: "sidebar" }),
  articlePage,
)

/* ------------------------------------------------------------ article chrome */

export const ArticleTitle = bind("ArticleTitle", Q.ArticleTitle(), articlePage)
export const ContentMeta = bind("ContentMeta", Q.ContentMeta(), articlePage)
export const TagList = bind("TagList", Q.TagList(), articlePage)
export const Breadcrumbs = bind("Breadcrumbs", Q.Breadcrumbs(), articlePage)
export const TableOfContents = bind("TableOfContents", Q.TableOfContents(), articlePage)
// Backlinks lists pages whose `links` include this slug. content/ currently has
// no note-to-note links (only image embeds), so it renders empty on the live
// site. The card points two real posts at the article so the component is
// visible; see .design-sync/NOTES.md.
const backlinkFiles = allFiles.map((p) =>
  ["Lock-based-Protocol", "Transaction-Isolation-in-SQL"].includes(p.slug as string)
    ? ({ ...p, links: [articlePage.slug] } as QuartzPluginData)
    : p,
)

export const Backlinks = bind("Backlinks", Q.Backlinks(), articlePage, {
  allFiles: backlinkFiles,
} as Partial<QuartzComponentProps>)
export const Graph = bind("Graph", Q.Graph(), articlePage)
export const ReaderMode = bind("ReaderMode", Q.ReaderMode(), articlePage)
// VisitorCount returns null without a workerUrl (VisitorCount.tsx:34). The live
// site supplies one from $CF_VISITOR_WORKER_URL at build time; the card uses a
// representative URL so the counter shell renders.
export const VisitorCount = bind(
  "VisitorCount",
  Q.VisitorCount({ workerUrl: "https://visitor-count.jaeunda.workers.dev" }),
  articlePage,
)

/* -------------------------------------------------------------- site chrome */

export const PageTitle = bind("PageTitle", Q.PageTitle(), articlePage)
export const ProfileCard = bind("ProfileCard", Q.ProfileCard(), articlePage)
export const Search = bind("Search", Q.Search(), articlePage)
export const Darkmode = bind("Darkmode", Q.Darkmode(), articlePage)
export const Explorer = bind("Explorer", Q.Explorer(), articlePage)
export const RecentNotes = bind("RecentNotes", Q.RecentNotes(), articlePage)
export const Spacer = bind("Spacer", Q.Spacer(), articlePage)
export const Footer = bind(
  "Footer",
  Q.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
  articlePage,
)
export const Comments = bind(
  "Comments",
  Q.Comments({ provider: "giscus", options: { repo: "jaeunda/jaeunda.github.io", repoId: "", category: "General", categoryId: "" } } as never),
  articlePage,
)

/* --------------------------------------------------------------- page bodies */

export const Content = bind("Content", Q.Content(), articlePage)
export const TagContent = bind("TagContent", Q.TagContent(), tagPage)
// FolderContent resolves fileData.slug against a trie built from allFiles, so
// it only renders on a page whose slug IS a folder. content/ is flat — this
// site has no folder pages — so the card nests the real posts under a "notes"
// folder to show the listing the component produces.
const folderFiles = allFiles.map(
  (p) => ({ ...p, slug: `notes/${p.slug}` }) as unknown as QuartzPluginData,
)
const folderPage = {
  ...tagPage,
  slug: "notes" as FullSlug,
  frontmatter: { title: "notes", tags: [] },
} as unknown as QuartzPluginData

export const FolderContent = bind("FolderContent", Q.FolderContent(), folderPage, {
  allFiles: folderFiles,
  // ctx.trie is memoised per context object; this component needs its own so it
  // does not inherit a trie built from the flat file list.
  ctx: { ...ctx, trie: undefined },
} as unknown as Partial<QuartzComponentProps>)
export const NotFound = bind("NotFound", Q.NotFound(), articlePage)

/* ---------------------------------------------- layout wrappers (composed) */

// These take another component rather than rendering anything themselves, so a
// bare card would be blank. Each is shown wrapping a real component.
export const Flex = bind(
  "Flex",
  Q.Flex({
    components: [{ Component: Q.Search(), grow: true }, { Component: Q.Darkmode() }],
  }),
  articlePage,
)
export const DesktopOnly = bind("DesktopOnly", Q.DesktopOnly(Q.ProfileCard()), articlePage)
export const MobileOnly = bind("MobileOnly", Q.MobileOnly(Q.TagCloud({ limit: 8 })), indexPage)
export const ConditionalRender = bind(
  "ConditionalRender",
  Q.ConditionalRender({
    component: Q.ArticleTitle(),
    condition: (page) => (page.fileData.slug as string) !== "index",
  }),
  articlePage,
)

/* ------------------------------------------------------------- raw factories */

// The untouched QuartzComponentConstructor for every component, for callers who
// want to supply their own options and build context.
export const constructors = Q

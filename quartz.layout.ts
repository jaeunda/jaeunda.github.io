import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// A written post: not the home page, and not one of the tag listings.
const isPost = (slug?: string) => slug !== undefined && slug !== "index" && !slug.startsWith("tags")
const hasLayer = (data: { frontmatter?: { [key: string]: unknown } }) =>
  typeof data.frontmatter?.layer === "string"

// Navigation lives in one horizontal bar at the top of the content column.
//
// The `left` slot holds the reading page's outline; editorial.scss places it
// on the right of the post, where readers expect "on this page". It was the
// left rail — the table of contents, where an
// editor puts it. It used to be the right rail at 230px, which is narrower than
// most of the headings it had to print, while the left rail carried a profile
// card on every page: the reader got a bio at full width and the document's own
// structure in a gutter. Reading pages have no profile at all now; identity is
// the home masthead and the footer.
//
// The site is light only — there is no dark palette and no toggle anywhere.
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.SiteNav(), Component.Search()],
  afterBody: [
    // The home page: the masthead is `content/index.md`'s tagline, which is
    // copy the author edits as content, and this is the writing under it.
    // There is no profile block here — the author is in the footer, on every
    // page, so the first screen belongs to the posts.
    Component.HomeStack(),
    // Posts used to end in an empty page-footer; this gives the reader a next
    // step. **Posts only.** It was mounted unconditionally and `ReadNext` only
    // guards against the home page and unlisted pages, so `Posts`, `Topics`
    // and every leaf topic ended a list of posts with three more posts under a
    // heading that said `Read next` — a suggestion on a page that is nothing
    // but suggestions.
    Component.ConditionalRender({
      component: Component.ReadNext(),
      condition: (page) => isPost(page.fileData.slug),
    }),
    // Both used to live in the right rail, which reading pages no longer have.
    // They are end-matter, so the foot of the post is where they belong.
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => isPost(page.fileData.slug),
    }),
    Component.ConditionalRender({
      component: Component.VisitorCount({
        workerUrl: process.env.CF_VISITOR_WORKER_URL ?? "",
      }),
      condition: (page) => isPost(page.fileData.slug),
    }),
  ],
  footer: Component.Footer({
    // The blog's direction in one line, on every page — most readers arrive
    // on a post and never see the home masthead. It is the only thing the
    // footer says about the site; the destinations come from
    // `components/socialLinks.ts`.
    // Not a second masthead: the home page's statement already says how the
    // blog reads systems, and a footer that ended on the same phrase said it
    // twice. This one names the subjects, for the reader who arrived on a post
    // and has never seen the home page.
    note: "Linux internals · Database concurrency · Network paths",
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    // Nothing above the title. A post used to carry a layer kicker over it and
    // a `#topic` chip under the metadata — three rows of classification around
    // one title, in three different shapes, before a word of the writing. The
    // layer is the first segment of the metadata line now (see `ContentMeta`)
    // and the topic chip is gone: it is a taxonomy the reader of a single post
    // did not ask for, and `Topics` is a destination in the bar for anyone who
    // wants it.
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    // The question the post answers, from its `description`, under the title.
    Component.ConditionalRender({
      component: Component.PostDek(),
      condition: (page) => isPost(page.fileData.slug) && hasLayer(page.fileData),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    // Below the desktop breakpoint the right rail — and the table of contents
    // with it — is gone, so this carries the chapter list into the column.
    // Closed by default; hidden at desktop, where the rail already has one.
    Component.ConditionalRender({
      component: Component.CompactToc(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  // The outline, and nothing else. The home page has no rail at all.
  left: [
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  right: [],
}

// A tag page under another one: `tags/topic/database`, not `tags/topic` or
// `tags`. Only those have a trail worth printing.
const isLeafTagPage = (slug?: string) => (slug ?? "").replace(/\/index$/, "").split("/").length > 2

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  // `ContentMeta` is not mounted here: it needs `fileData.text`, which a tag
  // page does not have, so it rendered nothing on every one of them.
  //
  // The breadcrumb is only on a leaf topic, where `Home › Topics › database`
  // is a real trail. On `Posts` and `Topics` themselves it printed
  // `Home › Topics` directly above an h1 reading `Topics`, and `home` is a
  // destination in the bar now — one crumb the nav offers and one the reader
  // is about to read in 40px.
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => isLeafTagPage(page.fileData.slug),
    }),
    Component.ArticleTitle(),
  ],
  // Posts and Topics are lists, not documents: no outline, no profile, one
  // column. The same shell the home page has.
  left: [],
  right: [],
}

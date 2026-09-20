import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// A written post: not the home page, and not one of the tag listings.
const isPost = (slug?: string) => slug !== undefined && slug !== "index" && !slug.startsWith("tags")

// Navigation lives in one horizontal bar at the top of the content column.
//
// The left rail is the reading page's outline — the table of contents, where an
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
    // The home masthead is `content/index.md`'s tagline — which is the page's
    // h1, and is copy the author edits as content — followed by this byline.
    // The home page has no rail, so the profile has exactly one home at every
    // width instead of moving between the rail and the foot of the page.
    Component.ConditionalRender({
      component: Component.ProfileCard(),
      condition: (page) => page.fileData.slug === "index",
    }),
    // One featured post, the layer filter, then the index.
    Component.HomeStack(),
    // Posts used to end in an empty page-footer; this gives the reader a next step.
    Component.ReadNext(),
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
    links: {
      GitHub: "https://github.com/jaeunda",
      LinkedIn: "https://www.linkedin.com/in/jaeunda/",
      RSS: "https://jaeunda.github.io/index.xml",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
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

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  // `ContentMeta` is not mounted here: it needs `fileData.text`, which a tag
  // page does not have, so it rendered nothing on every one of them.
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  // Posts and Topics are lists, not documents: no outline, no profile, one
  // column. The same shell the home page has.
  left: [],
  right: [],
}

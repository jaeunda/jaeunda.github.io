import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import breadcrumbsStyle from "./styles/breadcrumbs.scss"
import { FullSlug, SimpleSlug, resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import { trieFromAllFiles } from "../util/ctx"

type CrumbData = {
  displayName: string
  path: string
}

interface BreadcrumbOptions {
  /**
   * Symbol between crumbs
   */
  spacerSymbol: string
  /**
   * Name of first crumb
   */
  rootName: string
  /**
   * Whether to look up frontmatter title for folders (could cause performance problems with big vaults)
   */
  resolveFrontmatterTitle: boolean
  /**
   * Whether to display the current page in the breadcrumbs.
   */
  showCurrentPage: boolean
}

const defaultOptions: BreadcrumbOptions = {
  spacerSymbol: "❯",
  rootName: "Home",
  resolveFrontmatterTitle: true,
  showCurrentPage: true,
}

function formatCrumb(displayName: string, baseSlug: FullSlug, currentSlug: SimpleSlug): CrumbData {
  return {
    displayName: displayName.replaceAll("-", " "),
    path: resolveRelative(baseSlug, currentSlug),
  }
}

// Tag pages are emitted by the `TagPage` plugin rather than read from
// `content/`, so they are absent from the trie this component normally walks
// and it returned null on every one of them. The result was two ways to go up:
// posts got this breadcrumb, while `/tags/…` got a bordered `←` icon button
// floating above the title — the only bordered icon button on the site, in a
// different idiom, at a different position, and pointing a leaf topic at Posts
// rather than at Topics. The trail is derivable from the slug, so it is built
// here and every page navigates up the same way.
//
// `tags/index` is Posts, `tags/topic` is Topics, `tags/topic/<name>` is one
// subject beneath it.
function tagCrumbs(slug: FullSlug, rootName: string): CrumbData[] {
  const rest = slug.slice("tags/".length).replace(/\/?index$/, "")
  const crumbs: CrumbData[] = [
    { displayName: rootName, path: resolveRelative(slug, "/" as SimpleSlug) },
  ]

  if (rest === "") {
    crumbs.push({ displayName: "Posts", path: "" })
    return crumbs
  }

  const segments = rest.split("/")
  segments.forEach((segment, idx) => {
    const isLast = idx === segments.length - 1
    const target = `tags/${segments.slice(0, idx + 1).join("/")}` as FullSlug
    crumbs.push({
      displayName: segment === "topic" ? "Topics" : segment.replaceAll("-", " "),
      path: isLast ? "" : resolveRelative(slug, simplifySlug(target)),
    })
  })
  return crumbs
}

export default ((opts?: Partial<BreadcrumbOptions>) => {
  const options: BreadcrumbOptions = { ...defaultOptions, ...opts }
  const Breadcrumbs: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    ctx,
  }: QuartzComponentProps) => {
    const slug = fileData.slug!
    let crumbs: CrumbData[]

    if (slug.startsWith("tags/")) {
      crumbs = tagCrumbs(slug, options.rootName)
    } else {
      const trie = (ctx.trie ??= trieFromAllFiles(allFiles))
      const pathNodes = trie.ancestryChain(slug.split("/"))

      if (!pathNodes) {
        return null
      }

      crumbs = pathNodes.map((node, idx) => {
        const crumb = formatCrumb(node.displayName, slug, simplifySlug(node.slug))
        if (idx === 0) {
          crumb.displayName = options.rootName
        }

        // For last node (current page), set empty path
        if (idx === pathNodes.length - 1) {
          crumb.path = ""
        }

        return crumb
      })
    }

    if (!options.showCurrentPage) {
      crumbs.pop()
    }

    return (
      <nav class={classNames(displayClass, "breadcrumb-container")} aria-label="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <div class="breadcrumb-element">
            <a href={crumb.path}>{crumb.displayName}</a>
            {index !== crumbs.length - 1 && <p>{` ${options.spacerSymbol} `}</p>}
          </div>
        ))}
      </nav>
    )
  }
  Breadcrumbs.css = breadcrumbsStyle

  return Breadcrumbs
}) satisfies QuartzComponentConstructor

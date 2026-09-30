import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"
import { routeFor } from "./data/routes"

// A few pages and no data loading: the History API is enough. Every route is
// also prerendered to its own index.html, so a direct visit or a reload works
// on GitHub Pages without a fallback page.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

/** Site path ("/ongi/") → URL path ("/portfolio-4dplex/ongi/"). */
export function href(path: string): string {
  return BASE + path
}

/** URL path → site path, tolerant of a missing trailing slash. */
export function toSitePath(pathname: string): string {
  let path = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  path = path.replace(/index\.html$/, "")
  if (!path.endsWith("/")) path += "/"
  return routeFor(path).path
}

type RouterValue = { path: string; navigate: (to: string) => void }

const RouterContext = createContext<RouterValue>({ path: "/", navigate: () => {} })

export function Router({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    const onPop = () => setPath(toSitePath(window.location.pathname))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    document.title = routeFor(path).title
  }, [path])

  const navigate = useCallback((to: string) => {
    const [target, hash] = to.split("#")
    window.history.pushState(null, "", href(target) + (hash ? `#${hash}` : ""))
    setPath(target)
    // A new page starts at its top, and keyboard focus starts with it.
    requestAnimationFrame(() => {
      const anchor = hash ? document.getElementById(hash) : null
      if (anchor) anchor.scrollIntoView({ behavior: "instant" })
      else window.scrollTo({ top: 0, behavior: "instant" })
      document.getElementById("main")?.focus({ preventScroll: true })
    })
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function usePath(): string {
  return useContext(RouterContext).path
}

type LinkProps = {
  /** Site path, optionally with a fragment: "/ongi/" or "/#profile". */
  to: string
  className?: string
  children: ReactNode
  "aria-current"?: "page"
  "aria-label"?: string
}

export function Link({ to, children, ...rest }: LinkProps) {
  const { navigate } = useContext(RouterContext)
  const [target, hash] = to.split("#")

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Leave new-tab and new-window clicks to the browser.
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={href(target) + (hash ? `#${hash}` : "")} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}

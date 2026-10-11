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

// Four pages and no data loading: the History API is enough. Every route is
// also prerendered to its own index.html, so a direct visit or a reload works
// on GitHub Pages without a fallback page.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

/** Site path ("/weavegate/") → URL path ("/portfolio-hyundai-autoever/weavegate/"). */
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

/** Remembers where the reader was on the entry being left, for Back/Forward. */
function saveScroll() {
  window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, "")
}

function focusMain() {
  document.getElementById("main")?.focus({ preventScroll: true })
}

export function Router({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    // The page height changes with the route, so the browser's own
    // restoration would land before the new page is drawn.
    window.history.scrollRestoration = "manual"
    const onPop = (event: PopStateEvent) => {
      setPath(toSitePath(window.location.pathname))
      const y = typeof event.state?.scrollY === "number" ? event.state.scrollY : 0
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" })
        focusMain()
      })
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    document.title = routeFor(path).title
  }, [path])

  const navigate = useCallback((to: string) => {
    const [target, hash] = to.split("#")
    saveScroll()
    document.documentElement.dataset.navigated = ""
    window.history.pushState({ scrollY: 0 }, "", href(target) + (hash ? `#${hash}` : ""))
    setPath(target)
    // A new page starts at its top (or its anchor), and keyboard focus with it.
    requestAnimationFrame(() => {
      const anchor = hash ? document.getElementById(hash) : null
      if (anchor) anchor.scrollIntoView({ behavior: "instant" })
      else window.scrollTo({ top: 0, behavior: "instant" })
      focusMain()
    })
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function usePath(): string {
  return useContext(RouterContext).path
}

type LinkProps = {
  /** Site path, optionally with a fragment: "/weavegate/" or "/#profile". */
  to: string
  className?: string
  children: ReactNode
  "aria-current"?: "page" | "true"
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

import { Nav } from "./components/Nav"
import { Footer } from "./components/Footer"
import { Router, usePath } from "./router"
import { routeFor, type RouteId } from "./data/routes"
import { Overview } from "./pages/Overview"
import { Phase0 } from "./pages/Phase0"
import { Phase1 } from "./pages/Phase1"

const PAGES: Record<RouteId, () => React.JSX.Element> = {
  overview: Overview,
  "phase-0": Phase0,
  "phase-1": Phase1,
}

function Page() {
  const route = routeFor(usePath())
  const Current = PAGES[route.id]
  return (
    <main id="main" tabIndex={-1} key={route.id}>
      <Current />
    </main>
  )
}

export function App({ path }: { path: string }) {
  return (
    <Router initialPath={path}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <Page />
      <Footer />
    </Router>
  )
}

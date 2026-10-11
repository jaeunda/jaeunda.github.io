import { Nav } from "./components/Nav"
import { Footer } from "./components/Footer"
import { Router, usePath } from "./router"
import { routeFor, type RouteId } from "./data/routes"
import { Overview } from "./sections/Overview"
import { Profile } from "./sections/Profile"
import { Weavegate } from "./projects/Weavegate"
import { SurveillanceFrontier } from "./projects/SurveillanceFrontier"
import { WeaveTrail } from "./projects/WeaveTrail"

// Home is the three projects with the profile below them; each project is
// one page.
function Home() {
  return (
    <>
      <Overview />
      <Profile />
    </>
  )
}

const PAGES: Record<RouteId, () => React.JSX.Element> = {
  home: Home,
  weavegate: Weavegate,
  "surveillance-frontier": SurveillanceFrontier,
  weavetrail: WeaveTrail,
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
        본문으로 건너뛰기
      </a>
      <Nav />
      <Page />
      <Footer />
    </Router>
  )
}

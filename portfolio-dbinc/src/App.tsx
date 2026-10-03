import { Nav } from "./components/Nav"
import { Footer } from "./components/Footer"
import { Router, usePath } from "./router"
import { routeFor, type RouteId } from "./data/routes"
import { Overview } from "./sections/Overview"
import { Profile } from "./sections/Profile"
import { Weavegate } from "./projects/Weavegate"
import { WeaveTrail } from "./projects/WeaveTrail"
import { TeamPo } from "./projects/TeamPo"
import { MarketScan } from "./projects/MarketScan"

// Home is the overview with the profile below it; each project is one page.
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
  weavetrail: WeaveTrail,
  teampo: TeamPo,
  "market-scan": MarketScan,
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

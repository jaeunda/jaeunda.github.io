import { Nav } from "./components/Nav"
import { Router, usePath } from "./router"
import { routeFor, type RouteId } from "./data/routes"
import { Overview } from "./sections/Overview"
import { Ongi } from "./sections/Ongi"
import { Weavegate } from "./sections/Weavegate"
import { Cuda } from "./sections/Cuda"
import { Foundation } from "./sections/Foundation"
import { Profile } from "./sections/Profile"
import { Footer } from "./sections/Footer"

function Home() {
  return (
    <>
      <Overview />
      <Profile />
    </>
  )
}

const PAGES: Record<RouteId, () => React.JSX.Element> = {
  overview: Home,
  integration: Ongi,
  verification: Weavegate,
  performance: Cuda,
  fundamentals: Foundation,
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

import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { App } from "./App"
import { toSitePath } from "./router"
import "./styles/global.css"

const root = document.getElementById("root")!
const path = toSitePath(window.location.pathname)
const app = (
  <StrictMode>
    <App path={path} />
  </StrictMode>
)

// The production build ships prerendered markup for each route
// (scripts/prerender.mjs) and the dev server ships none. Hydrate only markup
// that was rendered for this route; a server that answers a project URL with
// the home page's HTML gets a fresh render instead of a mismatch.
if (root.dataset.route === path) {
  hydrateRoot(root, app)
} else {
  root.replaceChildren()
  createRoot(root).render(app)
}

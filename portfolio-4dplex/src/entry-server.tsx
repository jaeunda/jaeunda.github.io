import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { App } from "./App"
import { ROUTES } from "./data/routes"
import "./styles/global.css"

export const routes = ROUTES

export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  )
}

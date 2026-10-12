import { Link, usePath } from "../router"
import { ROUTES, routeFor } from "../data/routes"
import { LINKS } from "../data/links"
import styles from "./Nav.module.css"

// The project name on the left, the three pages as tabs with the current one
// marked, and the repository. Every page is one tap from every other.
export function Nav() {
  const current = routeFor(usePath())

  return (
    <header className={styles.bar}>
      <nav className={styles.inner} aria-label="Site">
        <Link to="/" className={styles.brand} aria-label="surveillance-frontier, overview">
          <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#17191e" />
            <path d="M16 24 9 8h14z" fill="#3d4fd6" />
            <path d="M16 24 12.5 15h7z" fill="#cdd2f2" />
          </svg>
          <span className={styles.name}>surveillance-frontier</span>
        </Link>

        <ul className={styles.tabs}>
          {ROUTES.map((route) => (
            <li key={route.id}>
              <Link
                to={route.path}
                className={styles.tab}
                aria-current={route.id === current.id ? "page" : undefined}
              >
                {route.label}
              </Link>
            </li>
          ))}
          <li className={styles.ext}>
            <a href={LINKS.repo} className={styles.tab} target="_blank" rel="noreferrer">
              Code<span aria-hidden="true"> ↗</span>
              <span className="sr-only"> on GitHub (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

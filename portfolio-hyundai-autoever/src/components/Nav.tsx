import { Link, usePath } from "../router"
import { PROJECTS, routeFor } from "../data/routes"
import { LINKS } from "../data/links"
import styles from "./Nav.module.css"

// Home: the name on the left, three destinations on the right. A project page
// swaps the name for the way back and shows all three projects with the
// current one marked, so the next one is one tap away from the top.
export function Nav() {
  const route = routeFor(usePath())
  const onProject = route.id !== "home"

  return (
    <header className={styles.bar}>
      <nav className={styles.inner} aria-label="사이트">
        {onProject ? (
          <Link to="/" className={styles.back}>
            <span aria-hidden="true">←</span> 전체 프로젝트
          </Link>
        ) : (
          <Link to="/" className={styles.brand} aria-current="page">
            <span className={styles.name}>장다은</span>
            <span className={styles.latin}>Jang Daeun</span>
          </Link>
        )}

        {onProject ? (
          <ol className={styles.switcher} aria-label="프로젝트">
            {PROJECTS.map((project, i) => {
              const current = project.id === route.id
              return (
                <li key={project.id}>
                  <Link
                    to={project.path}
                    className={styles.tab}
                    aria-current={current ? "page" : undefined}
                  >
                    <span className={styles.tabNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.tabName}>{project.name}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        ) : (
          <ul className={styles.links}>
            <li>
              <Link to="/#projects">Projects</Link>
            </li>
            <li>
              <Link to="/#profile">Profile</Link>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">
                GitHub<span className="sr-only"> (새 창)</span>
              </a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  )
}

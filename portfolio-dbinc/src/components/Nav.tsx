import { Link, usePath } from "../router"
import { PROJECTS, routeFor } from "../data/routes"
import { LINKS } from "../data/links"
import styles from "./Nav.module.css"

// Home: name on the left, three destinations on the right. A project page
// swaps the name for the way back and shows where the reader is.
export function Nav() {
  const route = routeFor(usePath())
  const index = PROJECTS.findIndex((project) => project.id === route.id)

  return (
    <header className={styles.bar}>
      <nav className={styles.inner} aria-label="사이트">
        {index < 0 ? (
          <p className={styles.identity}>
            <Link to="/" className={styles.brand}>
              <span className={styles.name}>장다은</span>
              <span className={styles.latin}>JANG DAEUN</span>
            </Link>
            <span className={styles.school}>숭실대학교 컴퓨터학부 · 2027.02 졸업예정</span>
          </p>
        ) : (
          <Link to="/" className={styles.back}>
            <span aria-hidden="true">←</span> Overview
          </Link>
        )}

        {index < 0 ? (
          <ul className={styles.links}>
            <li>
              <Link to="/" aria-current="page">
                Overview
              </Link>
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
        ) : (
          <p className={styles.where}>
            <span className={styles.capability}>{route.capability}</span>
            <span className={styles.count}>
              <span className="sr-only">프로젝트 </span>
              {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
            </span>
          </p>
        )}
      </nav>
    </header>
  )
}

import { Link } from "../router"
import { LINKS } from "../data/links"
import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.name}>
          장다은 <span>Jang Daeun</span>
        </p>
        <ul className={styles.links}>
          <li>
            <Link to="/#projects">Projects</Link>
          </li>
          <li>
            <Link to="/#profile">Profile</Link>
          </li>
          <li>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              github.com/jaeunda<span className="sr-only"> (새 창)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

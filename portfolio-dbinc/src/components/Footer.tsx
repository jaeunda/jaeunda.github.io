import { LINKS } from "../data/links"
import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>
          운영 중 문제를 다시 만들고, 변경한 결과를 같은 기준으로 확인하는 개발자.
        </p>
        <ul className={styles.contact}>
          <li>
            <span className={styles.label}>Name</span>장다은 · Jang Daeun
          </li>
          <li>
            <span className={styles.label}>Email</span>
            <a href={LINKS.email}>jaeunda@gmail.com</a>
          </li>
          <li>
            <span className={styles.label}>GitHub</span>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              github.com/jaeunda<span className="sr-only"> (새 창)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

import { LINKS } from "../data/links"
import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <p className={styles.name}>surveillance-frontier</p>
          <p>
            A personal research project by{" "}
            <a className="text" href={LINKS.author} target="_blank" rel="noreferrer">
              Jang Daeun
            </a>
            . Code and documentation are MIT licensed; every figure here is taken or recomputed from
            the project repository.
          </p>
          <p className={styles.small}>
            Market data: Binance public archive (BTCUSDT spot), downloaded at run time and not
            redistributed. Detectors are research reimplementations; nothing here labels any trading
            as manipulative.
          </p>
        </div>
        <ul className={styles.links}>
          <li>
            <a href={LINKS.repo} target="_blank" rel="noreferrer">
              GitHub repository<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={LINKS.references} target="_blank" rel="noreferrer">
              Background and sources<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={LINKS.blog}>jaeunda.log</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

import { LINKS } from "../data/links"
import { Link } from "../router"
import s from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={s.foot}>
      <div className={s.in}>
        <div>
          <p className={s.name}>JANG DAEUN</p>
          <p className={s.sub}>Software Development Portfolio</p>
        </div>
        <dl className={s.rows}>
          <div>
            <dt>GitHub</dt>
            <dd>
              <a href={LINKS.github} target="_blank" rel="noreferrer">
                github.com/jaeunda
              </a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={LINKS.email}>jaeunda@gmail.com</a>
            </dd>
          </div>
          <div>
            <dt>지원 구분</dt>
            <dd>CJ 4DPLEX 2026 하반기 신입사원 S/W개발</dd>
          </div>
        </dl>
        <Link className={s.top} to="/">
          <span aria-hidden="true">← </span>Overview
        </Link>
      </div>
    </footer>
  )
}

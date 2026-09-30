import { ROUTES } from "../data/routes"
import { Link, usePath } from "../router"
import s from "./Nav.module.css"

export function Nav() {
  const path = usePath()

  return (
    <header className={s.bar}>
      <div className={s.in}>
        <Link className={s.brand} to="/">
          <b>JANG DAEUN</b>
          <span>S/W Development Portfolio</span>
        </Link>
        <nav aria-label="페이지 이동">
          <ul className={s.list}>
            {ROUTES.map((route, i) => (
              <li key={route.id}>
                <Link
                  className={s.link}
                  to={route.path}
                  aria-current={path === route.path ? "page" : undefined}
                >
                  <i aria-hidden="true">{String(i).padStart(2, "0")}</i>
                  {route.nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

import type { ReactNode } from "react"
import { Link } from "../router"
import { routeById, type RouteId } from "../data/routes"
import styles from "./Overview.module.css"

type Card = {
  id: RouteId
  title: string
  summary: string
  /** A figure worth stating on the card; keyword lists stay off the card body. */
  figure?: ReactNode
  stack: string
  /** Shown on the lead card; the smaller cards show only the arrow. */
  cta?: string
}

// weavegate carries the cover letter's message, so it leads on its own row.
// The other three follow in the cover letter's order: finance and AI, the
// application foundation, and a new technology applied to trading data.
const LEAD: Card = {
  id: "weavegate",
  title: "운영 중 발생한 DB 오류를 같은 조건으로 재현하고 변경 결과까지 검증",
  summary:
    "특정 실행 순서에서 발생하는 DB 오류를 다시 만들고, 수정 이후에도 같은 조건을 실행해 정상 처리 여부를 확인하는 개발 절차를 자동화했습니다.",
  figure: (
    <>
      <span className={styles.figureRow}>
        <span className={styles.figureValue} data-tone="fail">
          20/20
        </span>
        <span className={styles.figureLabel}>취약 구현에서 오류 재현</span>
      </span>
      <span className={styles.figureArrow} aria-hidden="true">
        ↓ 수정
      </span>
      <span className={styles.figureRow}>
        <span className={styles.figureValue} data-tone="pass">
          20/20
        </span>
        <span className={styles.figureLabel}>같은 조건에서 정상 처리</span>
      </span>
    </>
  ),
  stack: "Go · SQL · MySQL/InnoDB · GitHub Actions · Java Integration",
  cta: "Explore Verification",
}

const CARDS: Card[] = [
  {
    id: "weavetrail",
    title: "흩어진 금융 정보를 한 화면에서 근거와 함께 확인",
    summary:
      "금융당국의 공식 발표와 공개 시장 데이터를 연결하고, 분석 글과 AI 답변의 주장과 숫자까지 같은 자료로 다시 확인할 수 있게 만들었습니다.",
    stack: "TypeScript · LLM · Financial Data",
  },
  {
    id: "teampo",
    title: "Java/Spring으로 신청부터 팀 생성까지 상태가 바뀌는 서비스 흐름 구현",
    summary:
      "Java와 Spring Boot로 신청·매칭·팀 생성 REST API를 구현하고 여러 요청이 같은 데이터를 변경할 때의 정합성을 관리했습니다.",
    stack: "Java · Spring Boot · JPA · MySQL · Redis",
  },
  {
    id: "market-scan",
    title: "60만 건 거래 시계열에서 결과 일치를 먼저 확인하고 GPU 병목을 개선",
    summary:
      "BTCUSDT 1초봉 604,800행에서 CPU 기준 결과와 GPU 결과를 먼저 대조하고, 연산·전송·후처리 시간을 나눠 병목을 개선했습니다.",
    figure: (
      <span className={styles.figureInline}>
        2,360.3 → 37.9 ms <span>같은 Top-20 · 62.3×</span>
      </span>
    ),
    stack: "Python · CUDA · CuPy · Numba",
  },
]

function CardHead({ index, id }: { index: number; id: RouteId }) {
  return (
    <p className={styles.cardHead}>
      <span className={styles.cardNum}>{String(index).padStart(2, "0")}</span>
      <span className={styles.cardCap}>{routeById(id).capability}</span>
    </p>
  )
}

function CardFoot({ card }: { card: Card }) {
  return (
    <p className={styles.cardFoot}>
      <span className={styles.stack}>{card.stack}</span>
      <span className={styles.cta} aria-hidden="true">
        <span className={styles.ctaArrow}>→</span>
      </span>
    </p>
  )
}

export function Overview() {
  const lead = routeById(LEAD.id)
  return (
    <section className={styles.overview} aria-labelledby="hero-title">
      <div className={styles.frame}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>DB Inc. / S/W ENGINEER · FINANCIAL AFFILIATES</p>
          <h1 id="hero-title" className={styles.headline}>
            운영 중 오류를 재현하고,
            <br />
            변경 영향까지 검증합니다.
          </h1>
          <p className={styles.sub}>
            Java/Spring으로 업무 흐름을 구현하고, 금융 데이터와 시스템의 결과를 다시 확인하며, AI와
            GPU 같은 새로운 기술도 검증 가능한 방식으로 적용해 왔습니다.
          </p>
        </header>

        <h2 className="sr-only">대표 프로젝트</h2>
        <ol className={styles.projects}>
          <li className={`${styles.card} ${styles.lead}`}>
            <div className={styles.leadMain}>
              <CardHead index={1} id={LEAD.id} />
              <h3 className={styles.leadTitle}>
                <Link to={lead.path} className={styles.cardLink}>
                  {LEAD.title}
                </Link>
              </h3>
              <p className={styles.cardName}>{lead.name}</p>
              <p className={styles.cardSummary}>{LEAD.summary}</p>
              <p className={styles.leadStack}>{LEAD.stack}</p>
            </div>
            <div className={styles.leadSide}>
              <p className={styles.leadFigure}>{LEAD.figure}</p>
              <span className={styles.cta} aria-hidden="true">
                {LEAD.cta} <span className={styles.ctaArrow}>→</span>
              </span>
            </div>
          </li>
          {CARDS.map((card, i) => {
            const route = routeById(card.id)
            return (
              <li key={card.id} className={styles.card}>
                <CardHead index={i + 2} id={card.id} />
                <h3 className={styles.cardTitle}>
                  <Link to={route.path} className={styles.cardLink}>
                    {card.title}
                  </Link>
                </h3>
                <p className={styles.cardName}>{route.name}</p>
                <p className={styles.cardSummary}>{card.summary}</p>
                {card.figure && <p className={styles.cardFigure}>{card.figure}</p>}
                <CardFoot card={card} />
              </li>
            )
          })}
        </ol>

        <p className={styles.next}>
          <Link to="/#profile" className={styles.nextLink}>
            Engineering Profile <span aria-hidden="true">↓</span>
          </Link>
        </p>
      </div>
    </section>
  )
}

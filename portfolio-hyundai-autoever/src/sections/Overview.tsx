import type { ReactNode } from "react"
import { Link } from "../router"
import { routeById, type RouteId } from "../data/routes"
import { FrontierMini, WeavegateMini, WeaveTrailMini } from "../diagrams/Minis"
import styles from "./Overview.module.css"

type Card = {
  id: Exclude<RouteId, "home">
  what: string
  diagram: ReactNode
  summary: string
  result: { value: string; label: string; tone: "pass" | "hold" | "accent" }
  status: { label: string; tone: "pass" | "hold" | "plan" }
  stack: string
}

// The three projects, each stated in one sentence, the mechanism
// (drawn), and where it stands, with the condition behind every number.
const CARDS: Card[] = [
  {
    id: "weavegate",
    what: "DB 정합성 검증 자동화 도구",
    diagram: <WeavegateMini />,
    summary:
      "동시 요청으로 데이터가 중복 저장되는 오류를 같은 조건에서 재현하고, SQL로 판정해 배포 전에 CI에서 차단합니다.",
    result: {
      value: "20/20 · 20/20",
      label: "같은 실행 순서에서 취약 코드 실패 · 수정 코드 통과",
      tone: "pass",
    },
    status: { label: "v0.2.0 · Marketplace 출시", tone: "pass" },
    stack: "Go · MySQL 8.4 · Spring Boot · GitHub Actions",
  },
  {
    id: "surveillance-frontier",
    what: "탐지 정책 검증용 대용량 데이터 처리 엔진",
    diagram: <FrontierMini />,
    summary:
      "변경된 구간만 다시 계산해 탐지 정책 검증 속도를 시행당 349배 높였고, 결과는 전체 재계산과 같습니다.",
    result: {
      value: "349×",
      label: "시행당 처리량 · 60만 행, 1스레드 기준",
      tone: "accent",
    },
    status: { label: "CPU 엔진 완료 · CUDA 병렬화 진행 중", tone: "pass" },
    stack: "C++17 · OpenMP · CUDA · Python",
  },
  {
    id: "weavetrail",
    what: "이종 데이터 표준화와 AI 출력 품질 검증",
    diagram: <WeaveTrailMini />,
    summary:
      "형식이 다른 거래 파일을 공통 스키마로 변환하며, 품질 기준 검사와 담당자 승인을 통과한 AI 매핑 제안만 처리에 반영합니다.",
    result: {
      value: "6개 기준",
      label: "모델 품질 기준을 코드로 판정해 자동 적용 여부 결정",
      tone: "accent",
    },
    status: { label: "규칙 엔진·검증기 구현", tone: "pass" },
    stack: "TypeScript · Next.js · Zod · Vitest",
  },
]

export function Overview() {
  return (
    <section id="projects" className={styles.overview} aria-labelledby="overview-title">
      <div className={styles.frame}>
        <header className={styles.hero}>
          <h1 id="overview-title" className={styles.headline}>
            데이터 처리 결과의 정합성을 코드로 검증하고, 검증 과정을 자동화합니다.
          </h1>
          <p className={styles.sub}>
            DB 동시성 오류 검증 자동화, 대용량 데이터 처리 최적화, AI 출력 품질 검증을 구현한 세
            프로젝트입니다.
          </p>
        </header>

        {/* On a phone the cards are a long scroll; this row names all three at once. */}
        <ol className={styles.quick} aria-label="대표 프로젝트 바로가기">
          {CARDS.map((card, i) => (
            <li key={card.id}>
              <Link to={routeById(card.id).path} className={styles.quickLink}>
                <span className={styles.quickNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.quickName}>{routeById(card.id).name}</span>
                <span className={styles.quickWhat}>{card.what}</span>
                <span className={styles.quickGo} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <ol className={styles.cards}>
          {CARDS.map((card, i) => {
            const route = routeById(card.id)
            const titleId = `card-${card.id}`
            return (
              <li key={card.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.status} data-tone={card.status.tone}>
                    {card.status.label}
                  </span>
                </div>
                <h2 id={titleId} className={styles.name}>
                  {/* The title link is stretched over the whole card. */}
                  <Link to={route.path} className={styles.cardLink}>
                    {route.name}
                  </Link>
                </h2>
                <p className={styles.what}>{card.what}</p>
                <div className={styles.diagram}>{card.diagram}</div>
                <p className={styles.summary}>{card.summary}</p>
                <p className={styles.result} data-tone={card.result.tone}>
                  <span className={styles.resultValue}>{card.result.value}</span>
                  <span className={styles.resultLabel}>{card.result.label}</span>
                </p>
                <div className={styles.cardFoot}>
                  <span className={styles.stack}>{card.stack}</span>
                  <span className={styles.cta} aria-hidden="true">
                    사례 보기 →
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

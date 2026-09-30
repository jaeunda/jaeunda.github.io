import { Link } from "../router"
import s from "./Overview.module.css"

type Card = {
  index: string
  capability: string
  /** What the project is, in a phrase. This is the card's headline. */
  title: string
  /** The project's own name, set smaller under the headline. */
  project: string
  /** The one sentence the card gets. */
  summary: string
  /** The one row of keywords the card gets. */
  tags: string[]
  cta: string
  /** The project page the whole card opens. */
  to: string
  /** A second page reachable from the same card. */
  also?: { label: string; to: string }
}

// A card says three things and no more: what the project is and its name,
// one sentence, one row of keywords. Everything else is on the project page.
const CARDS: Card[] = [
  {
    index: "01",
    capability: "Integration & Control",
    title: "스마트 복약 보조 IoT 기기",
    project: "Ongi",
    summary:
      "앱에서 등록한 일정이 실제 센서·모터 동작으로 이어지도록 서버와 디바이스를 연동했습니다.",
    tags: ["ESP32 / FreeRTOS", "MQTT", "Single Control Task"],
    cta: "Explore Integration",
    to: "/ongi/",
  },
  {
    index: "02",
    capability: "Reproduction & Verification",
    title: "동시성 오류 검증 자동화 도구",
    project: "weavegate",
    summary:
      "실행 순서를 직접 제어해 동시성 오류를 재현하고, 수정 전 20/20이던 위반이 0/20이 되는 것을 검증했습니다.",
    tags: ["Go", "MySQL / InnoDB", "GitHub Actions"],
    cta: "Explore Verification",
    to: "/weavegate/",
  },
  {
    index: "03",
    capability: "Systems & Performance",
    title: "GPU 병렬 처리와 OS 커널 구현",
    project: "CUDA / xv6 / Linux",
    summary:
      "시뮬레이터를 GPU로 병렬화해 목표 처리량을 19.8% 넘겼고, xv6 커널과 Linux 도구를 C로 구현했습니다.",
    tags: ["C", "CUDA C++", "Linux", "xv6"],
    cta: "Explore Performance",
    to: "/cuda/",
    also: { label: "Fundamentals", to: "/foundation/" },
  },
]

const STACK = ["C", "Linux", "FreeRTOS", "Go", "CUDA", "CI Automation"]

export function Overview() {
  return (
    <section id="overview" className={s.hero} aria-labelledby="overview-title">
      <div className={s.in}>
        <div className={s.top}>
          <p className={s.eyebrow}>CJ 4DPLEX / S/W DEVELOPMENT PORTFOLIO</p>
          <p className={s.who}>
            <b>장다은</b>
            <span>JANG DAEUN</span>
            <span className={s.school}>숭실대학교 컴퓨터학부 · 2027.02 졸업예정</span>
          </p>
        </div>
        <h1 className={s.title} id="overview-title">
          여러 시스템과 장비가
          <br />
          <em>의도한 순간에 정확히 동작</em>하도록.
        </h1>
        <p className={s.copy}>
          서버와 디바이스를 연결하고, 실행 순서를 제어해 오류를 재현하며, 성능과 정확성을 함께
          검증해 왔습니다.
        </p>

        <p className={s.cardsK}>
          <span>Three Core Capabilities</span>
          S/W개발 직무의 주요 업무와 그에 대응하는 경험
        </p>
        <ul className={s.cards}>
          {CARDS.map((card) => (
            <li key={card.index}>
              <div className={s.card}>
                <p className={s.cardK}>
                  <span>{card.index}</span>
                  {card.capability}
                </p>
                <h2 className={s.title2}>{card.title}</h2>
                <p className={s.project}>{card.project}</p>
                <p className={s.summary}>{card.summary}</p>
                <p className={s.chips}>
                  {card.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </p>
                <p className={s.cta}>
                  <Link className={s.open} to={card.to}>
                    {card.cta}
                    <span aria-hidden="true"> ↗</span>
                  </Link>
                  {card.also && (
                    <Link className={s.also} to={card.also.to}>
                      {card.also.label}
                      <span aria-hidden="true"> ↗</span>
                    </Link>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className={s.foot}>
          <ul className={s.stack} aria-label="주요 기술">
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className={s.cue} href="#profile">
            기술 스택과 프로필
            <i aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

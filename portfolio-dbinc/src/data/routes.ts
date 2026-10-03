// Every page of the site: the home page and one page per project. The order
// of PROJECTS is the reading order on the home page and in the pager.
export type RouteId = "home" | "weavegate" | "weavetrail" | "teampo" | "market-scan"

export type Route = {
  id: RouteId
  /** Path under the site base, always with a trailing slash. */
  path: string
  /** Project name shown in the pager and the detail bar. */
  name: string
  /** Capability line shown above the title. */
  capability: string
  title: string
  description: string
}

const SUFFIX = "장다은 S/W Engineer Portfolio"

export const ROUTES: Route[] = [
  {
    id: "home",
    path: "/",
    name: "Overview",
    capability: "",
    title: "장다은 | S/W Engineer Portfolio — DB Inc. Financial IT",
    description:
      "운영 중 오류를 재현하고 변경 영향을 검증하며, Java/Spring 애플리케이션과 금융 데이터·AI·GPU 성능 개선을 구현해 온 장다은의 S/W엔지니어 포트폴리오.",
  },
  {
    id: "weavegate",
    path: "/weavegate/",
    name: "weavegate",
    capability: "OPERATION · REPRODUCTION · VERIFICATION",
    title: `weavegate — 오류 재현과 변경 검증 | ${SUFFIX}`,
    description:
      "특정 실행 순서에서 발생하는 DB 오류를 같은 조건으로 다시 만들고, 수정 후 같은 조건에서 정상 처리를 확인하는 검증 절차를 자동화한 도구입니다. 20/20 재현, 수정 후 20/20 정상.",
  },
  {
    id: "weavetrail",
    path: "/weavetrail/",
    name: "WeaveTrail",
    capability: "FINANCE · AI · WORKFLOW",
    title: `WeaveTrail — 금융 정보와 AI의 확인 흐름 | ${SUFFIX}`,
    description:
      "금융당국의 공식 발표와 공개 시장 데이터를 연결하고, 분석 글과 AI 답변의 주장과 숫자를 같은 자료로 다시 확인하는 금융 서비스입니다.",
  },
  {
    id: "teampo",
    path: "/teampo/",
    name: "TeamPo",
    capability: "APPLICATION · STATE · TRANSACTION",
    title: `TeamPo — Java/Spring 상태 흐름 구현 | ${SUFFIX}`,
    description:
      "Java와 Spring Boot로 매칭 신청부터 팀 생성까지 상태가 바뀌는 REST API를 구현하고, 동시 요청에서 MySQL 트랜잭션과 DB 제약으로 정합성을 관리한 백엔드 프로젝트입니다.",
  },
  {
    id: "market-scan",
    path: "/market-scan/",
    name: "거래 시계열 GPU 스캔",
    capability: "TRADING DATA · PERFORMANCE",
    title: `거래 시계열 GPU 병렬처리 — 정확성 검증과 병목 개선 | ${SUFFIX}`,
    description:
      "BTCUSDT 1초봉 604,800행에서 CPU 기준 결과와 GPU 결과를 먼저 대조하고, 구간별 시간을 측정해 처리 구조를 바꿨습니다. 같은 Top-20, 2,360.3ms → 37.9ms.",
  },
]

/** The project pages, in reading order. */
export const PROJECTS = ROUTES.filter((route) => route.id !== "home")

export function routeFor(path: string): Route {
  return ROUTES.find((route) => route.path === path) ?? ROUTES[0]
}

export function routeById(id: RouteId): Route {
  return ROUTES.find((route) => route.id === id)!
}

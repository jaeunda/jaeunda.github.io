// Every page of the site: the home page and one page per project. The order
// of PROJECTS is the reading order on the home page, in the project switcher
// and in the pager.
export type RouteId = "home" | "weavegate" | "surveillance-frontier" | "weavetrail"

export type Route = {
  id: RouteId
  /** Path under the site base, always with a trailing slash. */
  path: string
  /** Project name, as the repository spells it. */
  name: string
  /** What the project is about, in a few words (switcher, pager). */
  topic: string
  /** One sentence shown in the pager's preview of the next project. */
  preview: string
  title: string
  description: string
}

const SUFFIX = "장다은 Portfolio"

export const ROUTES: Route[] = [
  {
    id: "home",
    path: "/",
    name: "Projects",
    topic: "",
    preview: "",
    title: "장다은 — 데이터 처리 정합성 검증과 자동화 포트폴리오",
    description:
      "DB 동시성 오류 검증 자동화, 대용량 탐지 데이터 처리 최적화, 이종 데이터 표준화와 AI 출력 품질 검증을 구현한 세 프로젝트.",
  },
  {
    id: "weavegate",
    path: "/weavegate/",
    name: "weavegate",
    topic: "DB 정합성 검증 자동화",
    preview:
      "동시 요청으로 데이터가 중복 저장되는 오류를 같은 조건에서 재현하고, SQL로 판정해 배포 전에 CI에서 차단합니다.",
    title: `weavegate — DB 동시성 오류 검증 자동화 | ${SUFFIX}`,
    description:
      "DB 동시성 오류를 같은 실행 순서로 재현하고 SQL로 판정해 CI에서 차단하는 Go 기반 검증 도구. 취약 코드 20/20 실패, 수정 코드 20/20 통과. GitHub Marketplace 출시.",
  },
  {
    id: "surveillance-frontier",
    path: "/surveillance-frontier/",
    name: "surveillance-frontier",
    topic: "대용량 탐지 데이터 처리 최적화",
    preview:
      "변경된 구간만 다시 계산해 탐지 정책 검증 속도를 시행당 349배 높였고, 결과는 전체 재계산과 같습니다.",
    title: `surveillance-frontier — 탐지 정책 검증용 대용량 데이터 처리 엔진 | ${SUFFIX}`,
    description:
      "탐지 정책의 누락률을 수십만 개 시나리오로 측정하는 C++/OpenMP 엔진. 변경 구간만 다시 계산해 전체 재계산과 같은 결과를 시행당 349배 빠르게 얻었습니다. CUDA 병렬화 진행 중.",
  },
  {
    id: "weavetrail",
    path: "/weavetrail/",
    name: "WeaveTrail",
    topic: "이종 데이터 표준화와 AI 출력 품질 검증",
    preview:
      "형식이 다른 거래 파일을 공통 스키마로 변환하며, 품질 기준 검사와 담당자 승인을 통과한 AI 매핑 제안만 처리에 반영합니다.",
    title: `WeaveTrail — 이종 데이터 표준화와 AI 출력 품질 검증 | ${SUFFIX}`,
    description:
      "CSV·JSON Lines 거래 데이터를 공통 스키마로 표준화하는 시스템. AI 매핑 제안은 6단계 검증과 담당자 승인을 거쳐 반영되고, 결과는 원본 행까지 추적됩니다. 모델 품질 기준을 코드로 판정합니다.",
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

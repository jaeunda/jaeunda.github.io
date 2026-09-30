// Every page of the site. The home page is the summary; each project is its
// own page so a reader opens only the one they want to go into.
export type RouteId = "overview" | "integration" | "verification" | "performance" | "fundamentals"

export type Route = {
  id: RouteId
  /** Path under the site base, always with a trailing slash. */
  path: string
  /** Label in the top navigation. */
  nav: string
  /** Project name shown in the pager; the home page has none. */
  name: string
  title: string
  description: string
}

const SUFFIX = "장다은 S/W Development Portfolio"

export const ROUTES: Route[] = [
  {
    id: "overview",
    path: "/",
    nav: "Overview",
    name: "Overview",
    title: "장다은 | S/W Development Portfolio — CJ 4DPLEX",
    description:
      "서버와 디바이스를 연결하고, 실행 순서를 제어해 오류를 재현하며, 성능과 정확성을 함께 검증해 온 장다은의 S/W개발 포트폴리오입니다.",
  },
  {
    id: "integration",
    path: "/ongi/",
    nav: "Integration",
    name: "Ongi",
    title: `Ongi — Integration & Control | ${SUFFIX}`,
    description:
      "서버에 저장된 일정이 실제 하드웨어 동작으로 이어지고 실행 결과가 다시 서비스 상태로 돌아오는 전체 흐름을 구현한 ESP32·FreeRTOS 펌웨어 프로젝트입니다.",
  },
  {
    id: "verification",
    path: "/weavegate/",
    nav: "Verification",
    name: "weavegate",
    title: `weavegate — Reproduction & Verification | ${SUFFIX}`,
    description:
      "특정 실행 순서에서 발생하는 동시성 오류를 다시 만들고 수정 결과를 코드 변경 때마다 검증하는 자동화 도구입니다.",
  },
  {
    id: "performance",
    path: "/cuda/",
    nav: "Performance",
    name: "CUDA",
    title: `CUDA — Performance | ${SUFFIX}`,
    description:
      "CPU 전용 Maxwell 방정식 시뮬레이터를 GPU로 옮기고 처리량과 정확성을 단계별로 검증한 NVIDIA DLI 최종 평가 기록입니다.",
  },
  {
    id: "fundamentals",
    path: "/foundation/",
    nav: "Fundamentals",
    name: "xv6 · Linux",
    title: `xv6 · Linux — Systems Foundation | ${SUFFIX}`,
    description:
      "xv6 커널의 시스템 호출, 스케줄링, 메모리, 파일시스템을 C로 확장하고 Linux 시스템 호출로 도구를 구현한 기록입니다.",
  },
]

/** The project pages, in reading order. */
export const PROJECTS = ROUTES.filter((route) => route.id !== "overview")

export function routeFor(path: string): Route {
  return ROUTES.find((route) => route.path === path) ?? ROUTES[0]
}

export function routeById(id: RouteId): Route {
  return ROUTES.find((route) => route.id === id)!
}

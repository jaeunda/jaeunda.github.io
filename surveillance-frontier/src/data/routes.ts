// Every page of the site. The order is the reading order: the nav tabs and
// the pager at the foot of each page follow it.
export type RouteId = "overview" | "phase-0" | "phase-1"

export type Route = {
  id: RouteId
  /** Path under the site base, always with a trailing slash. */
  path: string
  /** Tab label. */
  label: string
  /** The page's question, in a few words (pager). */
  topic: string
  title: string
  description: string
}

const SITE = "surveillance-frontier"

export const ROUTES: Route[] = [
  {
    id: "overview",
    path: "/",
    label: "Overview",
    topic: "The question, and what is known so far",
    title: `${SITE} — stress-testing surveillance policies under a time budget`,
    description:
      "A research project on how far and how finely a market-surveillance policy can be stress-tested within a fixed time budget on CPUs and GPUs. Results of Phase 0 and Phase 1.",
  },
  {
    id: "phase-0",
    path: "/phase-0/",
    label: "Phase 0",
    topic: "Scanning every window of a market series on a GPU",
    title: `Phase 0 — scanning every window on a GPU | ${SITE}`,
    description:
      "Pilot on a Tesla T4: a correctness gate that catches broken kernels, a rarity map that finds the fake SEC post, where the GPU time goes, and what a fixed time budget buys.",
  },
  {
    id: "phase-1",
    path: "/phase-1/",
    label: "Phase 1",
    topic: "What a stated stress-testing task costs on a strong CPU",
    title: `Phase 1 — the cost of a stress-testing task on a CPU | ${SITE}`,
    description:
      "Four exact trial methods on a 32-core CPU: incremental evaluation runs 349x more trials per second than full recomputation, and both stated tasks are projected to finish well under an hour.",
  },
]

export function routeFor(path: string): Route {
  return ROUTES.find((route) => route.path === path) ?? ROUTES[0]
}

export function routeIndex(id: RouteId): number {
  return ROUTES.findIndex((route) => route.id === id)
}

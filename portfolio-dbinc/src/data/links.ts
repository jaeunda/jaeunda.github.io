// Every external link on the site. weavegate documents point at a fixed commit
// so the facts quoted on the page cannot drift from the source.
const WG = "https://github.com/weavegate/weavegate"
const WG_AT = `${WG}/blob/b6ece8d56f5bc27c59ebf279c8dccde673922218`
const WT = "https://github.com/WeaveTrail/WeaveTrail"
const TP = "https://github.com/Team-po/Server"

export const LINKS = {
  github: "https://github.com/jaeunda",
  email: "mailto:jaeunda@gmail.com",
  weavegate: {
    repo: WG,
    schedule: `${WG_AT}/fixtures/matching-slice/schedules/concurrent-assign.json`,
    determinism: `${WG_AT}/docs/experiments/determinism.md`,
    ciGate: `${WG_AT}/docs/howto/ci-gate.md`,
    javaSdk: `${WG_AT}/docs/reference/external-sut-java.md`,
  },
  weavetrail: {
    repo: WT,
    service: "https://weave-trail-web-flax.vercel.app",
    caseReplay: "https://weave-trail-web-flax.vercel.app/case-2026-09-03",
  },
  teampo: {
    repo: TP,
    matching: `${TP}/pull/37`,
    withdrawal: `${TP}/pull/97`,
  },
} as const

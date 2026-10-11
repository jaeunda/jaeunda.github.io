// Every external link on the site. Documents point at the commit the page was
// written from, so a quoted figure cannot drift away from its source.
const WG = "https://github.com/weavegate/weavegate"
const WG_AT = `${WG}/blob/36f3f4ff9b82e19d1bea5e286d1ff2297bc53f82`
const SF = "https://github.com/jaeunda/surveillance-frontier"
const SF_AT = `${SF}/blob/84b6e2d1be442c5c29e2192c30dfe5d749923b52`
const WT = "https://github.com/WeaveTrail/WeaveTrail"
const WT_AT = `${WT}/blob/892e4d389a86056ae16a8ee6e14c964822237b2b`

export const LINKS = {
  github: "https://github.com/jaeunda",
  weavegate: {
    repo: WG,
    marketplace: "https://github.com/marketplace/actions/weavegate-gate",
    adoption: "https://github.com/weavegate/spring-boot-adoption-example",
    baseline: `${WG_AT}/docs/experiments/baseline-comparison.md`,
    spring: `${WG_AT}/docs/experiments/spring-replay.md`,
    gateTime: `${WG_AT}/docs/experiments/gate-run-time.md`,
    limitations: `${WG_AT}/docs/limitations.md`,
  },
  sf: {
    repo: SF,
    phase1: `${SF_AT}/docs/phase1.md`,
    phase2: `${SF_AT}/experiments/phase2-gpu/README.md`,
  },
  weavetrail: {
    repo: WT,
    replay: "https://weave-trail-web-flax.vercel.app/replay",
    architecture: `${WT_AT}/docs/ARCHITECTURE.ko.md`,
    evaluation: `${WT_AT}/docs/EVALUATION.ko.md`,
    failureLog: `${WT_AT}/docs/AI_FAILURE_LOG.ko.md`,
  },
  teampo: {
    repo: "https://github.com/Team-po/Server",
    matching: "https://github.com/Team-po/Server/pull/37",
    withdrawal: "https://github.com/Team-po/Server/pull/97",
  },
  carrycheck: {
    repo: "https://github.com/jaeunda/CarryCheck",
  },
} as const

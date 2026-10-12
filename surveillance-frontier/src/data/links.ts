// Every external link on the site. Documents point at the commit the pages
// were written from, so a quoted figure cannot drift away from its source.
const REPO = "https://github.com/jaeunda/surveillance-frontier"
const AT = `${REPO}/blob/84b6e2d1be442c5c29e2192c30dfe5d749923b52`
const TREE = `${REPO}/tree/84b6e2d1be442c5c29e2192c30dfe5d749923b52`

export const LINKS = {
  repo: REPO,
  readme: `${AT}/README.md`,
  phase0: `${AT}/docs/phase0.md`,
  phase1: `${AT}/docs/phase1.md`,
  phase2: `${AT}/experiments/phase2-gpu/README.md`,
  references: `${AT}/docs/references.md`,
  engine: `${TREE}/engine`,
  pilot: `${TREE}/experiments/phase0-pilot`,
  feasibility: `${TREE}/experiments/phase1-feasibility`,
  phase0Results: `${TREE}/experiments/phase0-pilot/results/colab-t4_2026-10-04`,
  phase1Results: `${TREE}/experiments/phase1-feasibility/results/aws-c7i-16xlarge_2026-10-09`,
  license: `${AT}/LICENSE`,
  binance: "https://data.binance.vision",
  author: "https://github.com/jaeunda",
  blog: "https://jaeunda.github.io/",
}

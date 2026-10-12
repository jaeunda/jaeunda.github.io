import {
  Ext,
  Figure,
  Note,
  PageHeader,
  Pager,
  Section,
  Table,
  WithToc,
  type TocItem,
} from "../components/Page"
import { CostVsN } from "../charts/CostVsN"
import { CurvePanels } from "../charts/CurvePanels"
import { LogDots } from "../charts/LogDots"
import { RecomputeScope } from "../charts/RecomputeScope"
import { MethodLegend, StageBars, TrialLoop } from "../charts/Blocks"
import { CheckGrid, Columns, Flow, Scorecard } from "../charts/Boards"
import { C } from "../charts/palette"
import { EXACT } from "../data/generated"
import { LINKS } from "../data/links"
import { ONE_HOUR, TTS, TTS_LABEL, TTS_TICKS, human, ttsRows } from "../data/results"
import styles from "./Phase1.module.css"

// Every figure is from surveillance-frontier docs/phase1.md and the run
// folder experiments/phase1-feasibility/results/aws-c7i-16xlarge_2026-10-09/.

const TOC: TocItem[] = [
  { id: "rule", label: "Decision rule" },
  { id: "estimand", label: "Estimand" },
  { id: "controls", label: "Controls" },
  { id: "methods", label: "Methods" },
  { id: "gate", label: "Gate" },
  { id: "cost", label: "Cost" },
  { id: "cores", label: "Cores" },
  { id: "estimator", label: "Intervals" },
  { id: "verdicts", label: "Verdicts" },
  { id: "meaning", label: "What it means" },
]
const n = (id: string) => TOC.findIndex((t) => t.id === id) + 1

const POLICY_STYLE: Record<string, { colour: string; dash?: string; label: string }> = {
  "15-1.5": { colour: C.ink, dash: "5 4", label: "K = 15, s_min = 1.5" },
  "15-2": { colour: C.accent, label: "default: K = 15, s_min = 2" },
  "15-3": { colour: C.faint, label: "K = 15, s_min = 3" },
  "8-2": { colour: "#a15c00", dash: "2 3", label: "K = 8, s_min = 2" },
}
// The default policy last, so it is drawn on top of the two that coincide with it.
const DRAW_ORDER = ["15-3", "8-2", "15-1.5", "15-2"]

// Parallel efficiency at 32 threads, median; full and incremental share the
// reported range 0.83–0.86 (docs/phase1.md, section 4).
const SCALING = [
  { m: "full", lo: 0.83, hi: 0.86, label: "0.83–0.86" },
  { m: "tail", lo: 0.72, hi: 0.72, label: "0.72" },
  { m: "incremental", lo: 0.83, hi: 0.86, label: "0.83–0.86" },
]
const eff = (v: number) => `${((v - 0.5) / 0.5) * 100}%`

function Scaling() {
  return (
    <div
      className={styles.scaling}
      role="img"
      aria-label="Parallel efficiency at 32 threads: full and incremental 0.83 to 0.86, tail 0.72, all above the 0.7 criterion."
    >
      <div className={styles.axis} aria-hidden="true">
        <span />
        <span>
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
            <i key={t} style={{ left: eff(t) }}>
              {t}
            </i>
          ))}
        </span>
        <span />
      </div>
      {SCALING.map((r) => (
        <div key={r.m} className={styles.row} data-m={r.m} aria-hidden="true">
          <span className={styles.name}>{r.m}</span>
          <span className={styles.track}>
            <span className={styles.criterion} style={{ left: eff(0.7) }} />
            <span className={styles.bar} style={{ left: 0, width: `max(${eff(r.hi)}, 4px)` }} />
          </span>
          <span className={styles.value}>{r.label}</span>
        </div>
      ))}
      <p className={styles.note} aria-hidden="true">
        ┆ criterion 0.7 × 32 × single-thread throughput
      </p>
    </div>
  )
}

// Controls on the full 1-second week, default policy (docs/phase1.md, section 7).
const CONTROLS = [
  { L: 2, rates: [0, 0.0004, 0.0004, 0, 0.0004] },
  { L: 30, rates: [0, 0.0022, 0.954, 0.005, 0.0021] },
  { L: 256, rates: [0, 0.0123, 0.999, 0.0131, 0.0181] },
]

function shade(p: number) {
  return `color-mix(in srgb, var(--accent) ${Math.round(Math.sqrt(p) * 85)}%, var(--surface))`
}

export function Phase1() {
  return (
    <>
      <PageHeader
        crumb="Phase 1 · feasibility · AWS c7i.16xlarge, 32 cores · done 2026-10-09"
        title="What does a stated stress-testing task cost on a strong CPU?"
        sentence="With incremental evaluation, even the larger task takes 12 minutes against a one-hour line fixed beforehand: H2 is not supported, and the GPU comparison moves to larger tasks."
        figure={
          <>
            <LogDots
              rows={ttsRows()}
              min={5}
              max={2_600_000}
              ticks={TTS_TICKS}
              reference={ONE_HOUR}
              label={TTS_LABEL}
              wide={1080}
            />
            <MethodLegend methods={["full", "shared", "tail", "incremental"]} hour />
          </>
        }
        caption="Projected time to solution on 32 cores from measured throughput; the trial loop was checked within 5%. All four methods return identical results; only their cost differs."
        facts={["C++17 · OpenMP", "bit-exact engine", "pre-registered 2026-10-07"]}
        links={[
          { label: "Write-up", href: LINKS.phase1 },
          { label: "Engine", href: LINKS.engine },
          { label: "Raw results", href: LINKS.phase1Results },
        ]}
      />

      <WithToc items={TOC}>
        <Section
          id="rule"
          n={n("rule")}
          title="The decision rule, written before the run"
          text={
            <p>
              H2 says that even the fastest exact CPU method, not just a full re-run, needs more
              time than is available. "Full recomputation is slow" does not count as support. The
              solid row is what happened.
            </p>
          }
        >
          <Flow
            rows={[
              {
                from: (
                  <>
                    Fastest exact method finishes in <b>under 1 hour</b> on 32 cores
                  </>
                ),
                to: "The CPU is not the bottleneck; the GPU comparison moves to larger tasks.",
              },
              {
                from: (
                  <>
                    Fastest exact method needs <b>over 1 hour</b>
                  </>
                ),
                to: "H2 is supported for that task; Phase 2 compares CPU and GPU on it.",
                muted: true,
              },
            ]}
          />
        </Section>

        <Section
          id="estimand"
          n={n("estimand")}
          title="What is estimated: a conditional detection rate"
          text={
            <p>
              p<sub>π</sub>(L, q | x) is the share of starts at which policy π reports a{" "}
              <em>new</em> episode inside an injected event. It holds for this series only, is not a
              damage bound, and on small problems can be computed exactly.
            </p>
          }
        >
          <Figure title="Fig. 1 · One Monte Carlo trial">
            <TrialLoop />
          </Figure>
          <Table label="The two stress-testing tasks">
            <thead>
              <tr>
                <th scope="col">Task</th>
                <th scope="col" data-num="">
                  Policies
                </th>
                <th scope="col">Coverage over 8 × 17 cells</th>
                <th scope="col" data-num="">
                  Trials per cell
                </th>
                <th scope="col" data-num="">
                  Trials
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">T1-curve</th>
                <td data-num="">1</td>
                <td>pointwise 95%, half-width ≤ 0.02</td>
                <td data-num="">2,449</td>
                <td data-num="">333,064</td>
              </tr>
              <tr>
                <th scope="row">T2-policy-map</th>
                <td data-num="">24</td>
                <td>all 3,264 intervals at once</td>
                <td data-num="">11,726</td>
                <td data-num="">1,594,736</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section
          id="controls"
          n={n("controls")}
          title="Controls: what the rate means"
          aside={
            <>
              <p>
                q = 0 never yields a new detection, as defined. One-feature events are rarely
                caught.
              </p>
              <p>
                Two-bar events stay near zero even at q = 128: q scales each length's typical range,
                which is tiny at L = 2.
              </p>
            </>
          }
        >
          <Table label="Detection rate on the full 1-second week, default policy">
            <thead>
              <tr>
                <th scope="col">L</th>
                <th scope="col" data-num="">
                  q = 0
                </th>
                <th scope="col" data-num="">
                  q = 8
                </th>
                <th scope="col" data-num="">
                  q = 128
                </th>
                <th scope="col" data-num="">
                  price only
                </th>
                <th scope="col" data-num="">
                  volume only
                </th>
              </tr>
            </thead>
            <tbody className={styles.heat}>
              {CONTROLS.map((r) => (
                <tr key={r.L}>
                  <th scope="row">{r.L}</th>
                  {r.rates.map((p, i) => (
                    <td
                      key={i}
                      data-rate=""
                      style={{ background: shade(p), color: p > 0.5 ? "#fff" : undefined }}
                    >
                      {p}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>

        <Section
          id="methods"
          n={n("methods")}
          title="Four exact ways to run a trial"
          text={
            <p>
              Float32 prices, fixed-point volume and integer ranks make every method produce the
              same bits, so episodes are compared for equality, never within a tolerance. They
              differ only in how much they recompute.
            </p>
          }
        >
          <Figure
            title="Fig. 2 · What one trial recomputes"
            caption="A window overlaps the event if it starts within its own length before it, so the touched cells form a triangle; the rest keep their stored rank."
          >
            <RecomputeScope />
          </Figure>
          <Table label="Trial methods">
            <tbody>
              <tr>
                <th scope="row">full</th>
                <td>every policy re-scans, re-sorts each length and selects — the reference</td>
              </tr>
              <tr>
                <th scope="row">shared</th>
                <td>one scan and ranking shared by all policies</td>
              </tr>
              <tr>
                <th scope="row">tail</th>
                <td>ranks only values that can still reach the threshold</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: C.accentInk }}>
                  incremental
                </th>
                <td>recomputes windows overlapping the event, merges them into stored orderings</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section
          id="gate"
          n={n("gate")}
          title="Correct first: 0 mismatching trials of 2,112"
          aside={
            <p>
              G is a measured check, not a proof: on the 1-second week only L = 30 at q = 0 and 128
              enter it.
            </p>
          }
        >
          <CheckGrid
            items={[
              {
                label: (
                  <>
                    <b>G</b> · real data: shared, tail, incremental vs full, all 24 policies
                  </>
                ),
                result: "0 / 2,112 differ",
                kind: "pass",
              },
              {
                label: (
                  <>
                    <code>sf_test</code> · tie-heavy synthetic data, 18 policies × 42 events
                  </>
                ),
                result: "pass",
                kind: "pass",
              },
              {
                label: (
                  <>
                    <code>check_phase0.py</code> · the C++ engine reproduces the Phase 0 top 20
                  </>
                ),
                result: "match",
                kind: "pass",
              },
              {
                label: "Four deliberately broken variants",
                result: "4 / 4 caught",
                kind: "caught",
              },
            ]}
          />
        </Section>

        <Section
          id="cost"
          n={n("cost")}
          title="Full recomputation is not the CPU's floor"
          text={
            <p>
              At N = 604,800 incremental runs 349× more trials per second than full (criterion ≥
              10×). Its advantage needs a short, local event and a fixed base series; the merged
              tail still grows with N and lower thresholds.
            </p>
          }
        >
          <Figure
            title="Fig. 3 · Time per trial vs series length, one thread (log–log)"
            caption="K = 15, one policy, L = 30, q = 16, setup excluded. Tail alone gives about 5×."
            source={<Ext href={LINKS.phase1}>Phase 1, section 3 · tables.md</Ext>}
          >
            <CostVsN />
          </Figure>
          <Figure
            title="Fig. 4 · Where the time goes at N = 604,800"
            caption="Ranking is 87% of a full trial; in incremental, merging (1.87 ms) and selection (1.44 ms) remain."
          >
            <StageBars />
          </Figure>
        </Section>

        <Section
          id="cores"
          n={n("cores")}
          title="Using all cores: one trial per thread"
          aside={
            <p>
              Trials are independent, so they are split across threads. Tail passes narrowly
              (0.68–0.75 by repetition). 64 threads add 1.11–1.50×, unused in the projections.
            </p>
          }
        >
          <Figure
            title="Fig. 5 · Parallel efficiency at 32 threads (median)"
            source={<Ext href={LINKS.phase1}>Phase 1, section 4</Ext>}
          >
            <Scaling />
          </Figure>
        </Section>

        <Section
          id="estimator"
          n={n("estimator")}
          title="Can the interval method be trusted?"
          text={
            <p>
              On a 64,000-bar prefix every start was enumerated, giving exact rates. No cell fell
              below the coverage floor of 0.931. <b>The exact curves are not monotone</b>: 12 of 360
              strength steps lower the rate, so bisection for a threshold has no guarantee.
            </p>
          }
        >
          <Figure
            title="Fig. 6 · Exact detection rates by enumeration"
            caption="Four of 24 policies, gap 60. s_min = 1.5 and 2 coincide and K = 8 nearly does, so the dashed lines lie on the default."
            source={<Ext href={LINKS.phase1}>Phase 1, section 5 · estimator_cells.csv</Ext>}
          >
            <CurvePanels
              panels={EXACT.map((panel) => ({
                title: `L = ${panel.L} bars`,
                series: DRAW_ORDER.map((key) => {
                  const s = panel.series.find((x) => `${x.K}-${x.sMin}` === key)!
                  return { key, ...POLICY_STYLE[key], points: s.points }
                }),
              }))}
              xTicks={[4, 8, 16, 32, 64, 128]}
              xLabel="strength q (log)"
              yLabel="exact rate p"
              guide={0.5}
              label="Exact new-episode rates against strength for event lengths 6, 30 and 120. All curves rise from near 0 at q = 4 towards 1 at q = 128; longer events are detected at lower strength, and the s_min = 3 policy lies to the right of the others."
            />
          </Figure>
          <Table label="Interval coverage replay (E1), 432 cells, 2,000 runs">
            <thead>
              <tr>
                <th scope="col">Half-width</th>
                <th scope="col" data-num="">
                  n per cell
                </th>
                <th scope="col" data-num="">
                  Pointwise min
                </th>
                <th scope="col" data-num="">
                  All 432, unadjusted
                </th>
                <th scope="col" data-num="">
                  All 432, Bonferroni
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0.05</td>
                <td data-num="">402</td>
                <td data-num="">0.945</td>
                <td data-num="">0.111</td>
                <td data-num="" data-em="">
                  0.995
                </td>
              </tr>
              <tr>
                <td>0.02</td>
                <td data-num="">2,449</td>
                <td data-num="">0.940</td>
                <td data-num="">0.042</td>
                <td data-num="" data-em="">
                  0.994
                </td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section
          id="verdicts"
          n={n("verdicts")}
          title="Verdicts"
          text={
            <p>
              The times behind the figure at the top, then every hypothesis with its pre-set
              criterion. F4 checked the projection only for the trial loop, so the end-to-end claim
              stays partial until Phase 2 measures it.
            </p>
          }
        >
          <Table label="Projected time to solution by task, series and method">
            <thead>
              <tr>
                <th scope="col">Task</th>
                <th scope="col">Series</th>
                <th scope="col" data-num="">
                  full
                </th>
                <th scope="col" data-num="">
                  shared
                </th>
                <th scope="col" data-num="">
                  tail
                </th>
                <th scope="col" data-num="">
                  incremental
                </th>
              </tr>
            </thead>
            <tbody>
              {TTS.map((row) => (
                <tr key={row.task + row.series}>
                  <th scope="row">{row.task}</th>
                  <td>{row.series}</td>
                  <td data-num="">{human(row.full)}</td>
                  <td data-num="">{row.shared === null ? "—" : human(row.shared)}</td>
                  <td data-num="">{human(row.tail)}</td>
                  <td data-num="" data-em="">
                    {human(row.incremental)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Scorecard
            items={[
              {
                id: "G",
                claim: "Fast methods return the same episodes as full",
                measured: "0 / 2,112 differ",
                verdict: "passed",
                tone: "pass",
              },
              {
                id: "F1",
                claim: "Full recomputation is not the floor",
                predicted: "≥ 10×",
                measured: "349×",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "F2",
                claim: "Small-N cost models predict N = 604,800",
                predicted: "≤ 20%",
                measured: "worst 19%",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "F3",
                claim: "Parallel efficiency at 32 threads",
                predicted: "≥ 0.7",
                measured: "0.72",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "F4",
                claim: "Projection matches an end-to-end run",
                predicted: "≤ 15%",
                measured: "≤ 4.4%, loop only",
                verdict: "partial",
                tone: "hold",
              },
              {
                id: "E1",
                claim: "Intervals keep coverage against exact rates",
                predicted: "≥ 0.931",
                measured: "0.940",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H2",
                claim: "Fastest exact CPU needs more than 1 hour",
                predicted: "> 1 h",
                measured: "43 s / 12.1 min",
                verdict: "not supported",
                tone: "fail",
              },
              {
                id: "H1, H3, H4",
                claim: "Policy comparison; GPU time and error",
                measured: "no GPU, no damage bound yet",
                verdict: "not tested",
                tone: "plan",
              },
            ]}
          />
        </Section>

        <Section
          id="meaning"
          n={n("meaning")}
          title="What Phase 1 establishes, and what it does not"
        >
          <Columns
            columns={[
              {
                title: "Established",
                tone: "pass",
                items: [
                  "A defined target rate with controls and an exact reference",
                  "Four bit-identical methods; the fastest 349× faster",
                  "Both stated tasks within minutes, by a rule fixed in advance",
                  "Rates not always monotone in strength",
                  "CPU algorithm choice alone: T2 from 15 days to 12 minutes",
                ],
              },
              {
                title: "Not established",
                tone: "plan",
                items: [
                  "Anything about the GPU (H3, H4)",
                  "A lower bound on CPU time",
                  "Complete end-to-end task runs",
                  "Generality: one asset, two periods, one machine",
                  "Damage bounds or group-level policies (H1)",
                ],
              },
              {
                title: "Next, in Phase 2",
                tone: "accent",
                items: [
                  "Incremental CPU at 32 and 64 threads as the baseline",
                  "A persistent task runner, timed end to end",
                  "Trials fixed by (cell, trial id) on every device",
                  "Larger tasks, each with criteria set before measuring",
                ],
              },
            ]}
          />
          <Note>
            <p>
              Full write-up and every limit: <Ext href={LINKS.phase1}>docs/phase1.md</Ext> · Phase 2
              protocol: <Ext href={LINKS.phase2}>experiments/phase2-gpu</Ext>.
            </p>
          </Note>
        </Section>
      </WithToc>

      <Pager id="phase-1" />
    </>
  )
}

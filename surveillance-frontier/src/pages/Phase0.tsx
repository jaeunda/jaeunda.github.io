import {
  Ext,
  Figure,
  Note,
  PageHeader,
  Pager,
  Pair,
  Section,
  WithToc,
  type TocItem,
} from "../components/Page"
import { EventMap } from "../charts/EventMap"
import { CurvePanels } from "../charts/CurvePanels"
import { Intervals } from "../charts/Intervals"
import { LogDots } from "../charts/LogDots"
import { ScoreSteps } from "../charts/Blocks"
import { CheckGrid, Flow, Scorecard } from "../charts/Boards"
import { C } from "../charts/palette"
import { BAND_1M, BAND_1S } from "../data/generated"
import { LINKS } from "../data/links"

// Every figure is from surveillance-frontier docs/phase0.md and the run
// folder experiments/phase0-pilot/results/colab-t4_2026-10-04/.

const BASE = import.meta.env.BASE_URL

const TOC: TocItem[] = [
  { id: "scan", label: "Scoring" },
  { id: "gate", label: "Gate" },
  { id: "map", label: "Real events" },
  { id: "time", label: "Where time goes" },
  { id: "hypotheses", label: "Hypotheses" },
  { id: "changed", label: "What changed" },
]
const n = (id: string) => TOC.findIndex((t) => t.id === id) + 1

// injection_summary.csv: top-20 hit rate by strength, 20 trials per point.
const INJECTION = [
  { L: 6, rates: [0, 0, 0, 0.3, 0.6] },
  { L: 30, rates: [0, 0, 0.15, 0.65, 0.95] },
  { L: 120, rates: [0, 0, 0.3, 0.85, 0.95] },
]
const Q = [2, 4, 8, 16, 32]

// Median times, 1-second data, N = 604,800, 15 window lengths (docs/phase0.md, section 3).
const SINGLE = [
  { label: "CPU direct scan", sub: "1 thread", ms: 726.5, colour: C.faint },
  { label: "CPU direct scan", sub: "2 threads", ms: 975.0, colour: C.faint },
  { label: "CPU optimized", sub: "1 thread, the baseline", ms: 200.5, colour: C.ink2 },
  { label: "GPU end to end", sub: "upload, kernel, download", ms: 37.4, colour: C.accent },
  { label: "GPU kernel only", sub: "", ms: 3.4, colour: C.accent },
]

// e2e_breakdown.csv, 1-second data, N = 604,800, median ms.
const PIPELINES = [
  { label: "CPU only", sub: "direct scan, 2 threads", ms: 3480 },
  { label: "(1) GPU features", sub: "CPU ranks and selects", ms: 2547 },
  { label: "(2) GPU also ranks", sub: "CPU selects candidates", ms: 82.7 },
  { label: "(3) GPU does everything", sub: "returns only candidates", ms: 38.5 },
]

const MS_TICKS = [
  { value: 3, label: "3 ms" },
  { value: 10, label: "10 ms" },
  { value: 30, label: "30 ms" },
  { value: 100, label: "100 ms" },
  { value: 300, label: "300 ms" },
  { value: 1000, label: "1 s" },
  { value: 3000, label: "3 s" },
]

export function Phase0() {
  return (
    <>
      <PageHeader
        crumb="Phase 0 · pilot · Colab Tesla T4 · done 2026-10-04"
        title="Scanning every window of a market time series on a GPU"
        sentence="In the same minute the GPU ran 53× more trials, so its interval was 6.7× narrower: precision is bought with re-runs, which reframed the project around evaluation under a time budget."
        figure={<Intervals wide={1080} />}
        caption="Each side re-ran the full detector on fresh injected copies of the 1-minute quarter until the budget ran out. The CPU side used two cores, so 53× holds for this setup only."
        facts={["Numba CPU baseline", "CUDA kernels via CuPy", "BTCUSDT 2024"]}
        links={[
          { label: "Write-up", href: LINKS.phase0 },
          { label: "Notebook and code", href: LINKS.pilot },
          { label: "Raw results", href: LINKS.phase0Results },
        ]}
      />

      <WithToc items={TOC}>
        <Section
          id="scan"
          n={n("scan")}
          title="How a window is scored"
          text={
            <p>
              Every (start, length) window of BTCUSDT bars — a 2024 quarter at 1 minute, one week at
              1 second — is scored for how unusual its price range and volume are for its length.
              The GPU runs one thread per window; the fair CPU baseline is an optimized O(N·K) scan.
            </p>
          }
        >
          <Figure title="Fig. 1 · From a window to a reported episode">
            <ScoreSteps />
          </Figure>
        </Section>

        <Section
          id="gate"
          n={n("gate")}
          title="Correct first: a gate that catches broken kernels"
          aside={
            <p>
              A gate that passes everything proves little. Catching two deliberately broken kernels
              shows it can tell a correct kernel from a subtly wrong one, and it ran before every
              timing.
            </p>
          }
        >
          <CheckGrid
            items={[
              {
                label: "GPU features (two thread layouts) and both CPU scans match",
                result: "pass",
                kind: "pass",
              },
              {
                label: "GPU rarity ranks and candidate flags, exact",
                result: "pass",
                kind: "pass",
              },
              {
                label: "Top 20 identical on the CPU and all three GPU paths",
                result: "pass",
                kind: "pass",
              },
              { label: "Broken kernel: boundary off by one", result: "caught", kind: "caught" },
              { label: "Broken kernel: wrong window length", result: "caught", kind: "caught" },
            ]}
          />
        </Section>

        <Section
          id="map"
          n={n("map")}
          title="Does the map find anything real?"
          text={
            <p>
              The fake SEC post draws one cone at 1-minute resolution and three at 1-second. Against
              news events fixed in advance (every CPI and FOMC release) the hits are 1 of 5 (p =
              0.086): <strong>the map finds large moves, not their cause.</strong>
            </p>
          }
        >
          <Pair>
            <Figure
              title="Fig. 2 · 1-minute bars, 2024 Q1"
              caption="One cone opens at 21:11; ranks over the whole quarter."
            >
              <EventMap
                band={BAND_1M}
                image={`${BASE}figures/rarity-1m.png`}
                unit="min"
                tickMinutes={60}
                label="Rarity map of 1-minute bars from 18:11 to 00:11 UTC. A single cone of rare windows opens at 21:11, darkest for short windows right after the post."
              />
            </Figure>
            <Figure
              title="Fig. 3 · 1-second bars, one week"
              caption="Three cones: the jump at 21:12, the pullback at 21:17, the drop at 21:25."
            >
              <EventMap
                band={BAND_1S}
                image={`${BASE}figures/rarity-1s.png`}
                unit="s"
                tickMinutes={5}
                label="Rarity map of 1-second bars from 20:51 to 21:31 UTC. Three separate cones of rare windows appear, around 21:12, 21:17 and 21:25."
              />
            </Figure>
          </Pair>
          <Figure
            title="Fig. 4 · Injected pump-and-dump events that reach the top 20"
            caption="20 trials per point. Weak events never make the top 20 because the quarter has larger real shocks."
            source={<Ext href={LINKS.phase0}>Phase 0, section 2 · injection_summary.csv</Ext>}
          >
            <CurvePanels
              panels={INJECTION.map((r) => ({
                title: `L = ${r.L} min`,
                series: [
                  {
                    key: "hit",
                    label: "top-20 hit rate, 20 trials per point",
                    colour: C.accent,
                    points: Q.map((q, i) => [q, r.rates[i]] as [number, number]),
                  },
                ],
              }))}
              xTicks={Q}
              xLabel="strength q (× typical range, log)"
              yLabel="hit rate"
              guide={0.5}
              label="Top-20 hit rate by strength 2, 4, 8, 16, 32. Six-minute events: 0, 0, 0, 0.30, 0.60. Thirty-minute events: 0, 0, 0.15, 0.65, 0.95. 120-minute events: 0, 0, 0.30, 0.85, 0.95."
            />
          </Figure>
        </Section>

        <Section
          id="time"
          n={n("time")}
          title="Where the time goes: not the kernel"
          text={
            <p>
              The kernel is 59× faster than the optimized CPU, but end to end only 5.4×: sending
              features for nine million windows back costs more than computing them. Keeping ranking
              and selection on the GPU removes that cost.
            </p>
          }
        >
          <Figure
            title="Fig. 5 · One full scan of 604,800 bars × 15 lengths (median, log scale)"
            caption="A cost model predicted the GPU/CPU crossover at a mean window length of 4.0; it was 2.85."
            source={<Ext href={LINKS.phase0}>Phase 0, section 3</Ext>}
          >
            <LogDots
              rows={SINGLE.map((r) => ({
                label: r.label,
                sub: r.sub || undefined,
                dots: [{ key: "t", value: r.ms, colour: r.colour, label: `${r.ms} ms` }],
              }))}
              min={2}
              max={2000}
              ticks={MS_TICKS.filter((t) => t.value <= 1000)}
              label="Median time for one scan: CPU direct 726.5 ms on 1 thread and 975.0 ms on 2 threads, optimized CPU 200.5 ms, GPU end to end 37.4 ms, GPU kernel only 3.4 ms."
            />
          </Figure>
          <Figure
            title="Fig. 6 · End-to-end time per pipeline (log scale)"
            caption="All four return the same top 20. Returning only candidates is 66× faster than returning features; the per-length sort is then 72% of what remains. On the same 40 trials the GPU path took 10.6 ms per trial against 493 ms on the optimized CPU, with identical decisions."
            source={<Ext href={LINKS.phase0}>Phase 0, sections 4–5 · e2e_breakdown.csv</Ext>}
          >
            <LogDots
              rows={PIPELINES.map((p, i) => ({
                label: p.label,
                sub: p.sub,
                dots: [
                  {
                    key: "t",
                    value: p.ms,
                    colour: i === 0 ? C.ink2 : C.accent,
                    label: `${p.ms.toLocaleString("en-US")} ms`,
                  },
                ],
              }))}
              min={20}
              max={6000}
              ticks={MS_TICKS.filter((t) => t.value >= 30)}
              label="End-to-end median time on 604,800 one-second bars: CPU only 3,480 ms; GPU features with CPU ranking 2,547 ms; GPU ranking with CPU selection 82.7 ms; GPU does everything and returns only candidates 38.5 ms."
            />
          </Figure>
        </Section>

        <Section
          id="hypotheses"
          n={n("hypotheses")}
          title="Seven hypotheses, written before the run"
          text={
            <p>Every one was fixed with a numerical criterion before measuring, and all held.</p>
          }
        >
          <Scorecard
            items={[
              {
                id: "H1",
                claim: "A cost model predicts the GPU/CPU crossover",
                predicted: "4.00",
                measured: "2.85",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H2",
                claim: "Download dominates when all features return",
                measured: "82% of GPU time",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H3",
                claim: "Candidates-only output beats features output",
                predicted: "≥ 2×",
                measured: "66×",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H4",
                claim: "Mixed window lengths in a warp slow the kernel",
                predicted: "4.4×",
                measured: "3.6×",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H5",
                claim: "The map reads an event's length",
                predicted: "⅓–1 × L",
                measured: "0.34–0.58",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H6",
                claim: "A minimum detectable strength exists",
                measured: "50% at 8–32×",
                verdict: "supported",
                tone: "pass",
              },
              {
                id: "H7",
                claim: "Same budget: more trials, interval narrows as 1/√n",
                predicted: "7.3×",
                measured: "6.7×",
                verdict: "supported",
                tone: "pass",
              },
            ]}
          />
        </Section>

        <Section id="changed" n={n("changed")} title="What this changed">
          <Flow
            rows={[
              {
                from: "After moving to the GPU, sorting and data movement dominate, not the kernel.",
                to: "Optimise the whole pipeline and what is sent back.",
              },
              {
                from: "The optimized CPU is 3.6× the direct scan, and still ranks single-threaded.",
                to: "Phase 1 rebuilds the CPU baseline in C++ with parallel sorting.",
              },
              {
                from: "Two broken kernels were caught.",
                to: "The correctness gate runs before every timing.",
              },
              {
                from: "Precision is bounded by re-runs per unit time.",
                to: "The project's question: evaluation under a time budget.",
              },
            ]}
          />
          <Note>
            <h3>Corrections (2026-10-07)</h3>
            <ul>
              <li>
                The 3,480 ms CPU-only pipeline uses the direct scan; an end-to-end comparison with
                the optimized CPU was not measured.
              </li>
              <li>
                53× is a ratio for this setup: two cores and a full re-run per trial, which Phase 1
                shows is not the CPU's floor.
              </li>
            </ul>
            <p>
              One Colab session; synthetic events without market reaction; nothing judges whether
              any trading was manipulative. Details: <Ext href={LINKS.phase0}>docs/phase0.md</Ext>.
            </p>
          </Note>
        </Section>
      </WithToc>

      <Pager id="phase-0" />
    </>
  )
}

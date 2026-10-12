import { Ext, Figure, Note, PageHeader, Pager, Pair, Section } from "../components/Page"
import { EventMap } from "../charts/EventMap"
import { HeroArc } from "../charts/Hero"
import { Intervals } from "../charts/Intervals"
import { StageBars, TrialLoop } from "../charts/Blocks"
import { PhaseLinks, Scorecard } from "../charts/Boards"
import { BAND_1M } from "../data/generated"
import { LINKS } from "../data/links"

const BASE = import.meta.env.BASE_URL

export function Overview() {
  return (
    <>
      <PageHeader
        crumb="surveillance-frontier · a research project in market surveillance"
        title="How well can a surveillance policy be stress-tested within a fixed time budget?"
        sentence="Each phase fixes its hypotheses before measuring. So far, the right exact algorithm on a 32-core CPU brings both stated tasks well under the hour, and a GPU engine is next."
        figure={<HeroArc />}
        caption="The whole project on one clock. Phase 0 measured what a minute buys, Phase 1 how long the stated tasks take with exact CPU methods; Phase 2 is designed, not yet measured."
        facts={["Oct 2026 – ongoing", "C++17 · OpenMP · CUDA · Python"]}
        links={[
          { label: "GitHub", href: LINKS.repo },
          { label: "README", href: LINKS.readme },
        ]}
      />

      <Section
        id="detector"
        n={1}
        title="What the detector sees"
        text={
          <p>
            On 2024-01-09 a fake post from the SEC's hacked X account moved Bitcoin by more than
            $1,000 in minutes. The detector ranks every window — each start × 15 lengths, about two
            million per quarter — against windows of its own length, so an event draws a cone of
            rare windows.
          </p>
        }
      >
        <Figure
          title="Fig. 1 · Rarity of every window around the fake SEC post, 1-minute bars"
          caption="Columns are window centres, rows window lengths. Short windows react first; long ones stay rare for longer."
          source={
            <>
              Recomputed from the project's data with the Phase 0 score ·{" "}
              <Ext href={LINKS.phase0}>Phase 0, section 2</Ext>
            </>
          }
        >
          <EventMap
            band={BAND_1M}
            image={`${BASE}figures/rarity-1m.png`}
            unit="min"
            tickMinutes={60}
            label="Price, volume and rarity map from 18:11 to 00:11 UTC around the fake SEC post. At 21:11 the price spikes, volume jumps, and the map turns dark in a cone: short windows are rarest right at the event, and longer windows stay rare for hours."
          />
        </Figure>
      </Section>

      <Section
        id="evaluation"
        n={2}
        title="Evaluating a policy means repeating one trial thousands of times"
        text={
          <p>
            Whether a policy holds up is an estimate: inject a test event, re-run the detector,
            count the hits. Its precision depends on how many trials fit in the time — the quantity
            every hypothesis of the project is about.
          </p>
        }
      >
        <Figure
          title="Fig. 2 · One trial, and what n trials estimate"
          caption={
            <>
              <b>T1</b>: one policy over 8 lengths × 17 strengths, 333,064 trials. <b>T2</b>: 24
              policies with all 3,264 intervals holding at once, 1,594,736 trials.
            </>
          }
        >
          <TrialLoop />
        </Figure>
        <Scorecard
          items={[
            {
              id: "H1",
              claim: "Group-level policies bound the undetected effect; account-level ones do not.",
              measured: "needs group policies and damage bounds",
              verdict: "not tested",
              tone: "plan",
            },
            {
              id: "H2",
              claim: "Even the fastest exact CPU method needs more time than is available.",
              predicted: "> 1 h",
              measured: "12.1 min",
              verdict: "not supported",
              tone: "fail",
            },
            {
              id: "H3",
              claim: "A bit-identical GPU engine reaches the same accuracy sooner.",
              measured: "Phase 2",
              verdict: "not tested",
              tone: "plan",
            },
            {
              id: "H4",
              claim: "At equal wall-clock time, the GPU's estimate has a smaller error.",
              measured: "Phase 2",
              verdict: "not tested",
              tone: "plan",
            },
          ]}
        />
      </Section>

      <Section
        id="shaped"
        n={3}
        title="Two measurements that shaped the project"
        text={
          <p>
            The pilot showed that precision is bought with re-runs. Before giving that job to a GPU,
            Phase 1 asked what the best exact CPU method costs — and found full recomputation was
            far from its floor.
          </p>
        }
      >
        <Pair>
          <Figure
            title="Phase 0 · same time budget, CPU vs GPU"
            caption="In 60 s the GPU ran 53× more trials; its interval was 6.7× narrower. CPU side: full re-run on two cores."
            source={<Ext href={LINKS.phase0}>Phase 0, section 5</Ext>}
          >
            <Intervals />
          </Figure>
          <Figure
            title="Phase 1 · time per trial, N = 604,800, one thread"
            caption="Incremental evaluation recomputes only what an event touches: 349× faster, with results identical in 2,112 checks."
            source={<Ext href={LINKS.phase1}>Phase 1, section 3</Ext>}
          >
            <StageBars />
          </Figure>
        </Pair>
      </Section>

      <Section
        id="phases"
        n={4}
        title="Read each phase"
        text={
          <p>
            Each phase page opens with its core result, then the evidence: correctness gates, the
            measurements, and every hypothesis with its verdict.
          </p>
        }
      >
        <PhaseLinks
          phases={[
            {
              tag: "Phase 0 · pilot",
              question:
                "When does a GPU help an exhaustive window scan, and what does a time budget buy?",
              more: "Read Phase 0 →",
              to: "/phase-0/",
            },
            {
              tag: "Phase 1 · feasibility",
              question:
                "What does a stated stress-testing task cost with the fastest exact CPU method?",
              more: "Read Phase 1 →",
              to: "/phase-1/",
            },
            {
              tag: "Phase 2 · designed",
              question: "Does a bit-identical GPU engine beat the incremental CPU on larger tasks?",
              more: "Protocol on GitHub ↗",
              href: LINKS.phase2,
            },
          ]}
        />
        <Note>
          <p>
            <b>Scope.</b> Rates are conditional on one asset and two periods; no damage bound is
            reported yet; task times are projections from measured throughput; detectors are
            research reimplementations, and nothing here labels trading as manipulative.
          </p>
        </Note>
      </Section>

      <Pager id="overview" />
    </>
  )
}

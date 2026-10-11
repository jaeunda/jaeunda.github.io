import { Apply, Decisions, Ext, Figure, Pager, ProjectHeader, Section } from "../components/Page"
import { LINKS } from "../data/links"
import { C, MONO } from "../diagrams/palette"
import styles from "./SurveillanceFrontier.module.css"

// Figures are from surveillance-frontier docs/phase1.md (reference run
// 2026-10-09, AWS c7i.16xlarge, commit bc9cd9c) and the Phase 2 protocol
// experiments/phase2-gpu/README.md (design r2.1, no measurement yet), at the
// commit pinned in data/links.ts.

/** The T1 task: 8 event lengths × 17 strengths, each cell estimated by trials. */
function TaskGridSvg({ narrow }: { narrow: boolean }) {
  const cols = 17
  const rows = 8
  const cell = narrow ? 16 : 22
  const gap = narrow ? 2 : 3
  const x0 = narrow ? 34 : 64
  const y0 = narrow ? 44 : 34
  const lengths = ["2", "4", "8", "16", "32", "64", "128", "256"]
  const pick = { r: 4, c: 9 }
  const gw = cols * (cell + gap)
  const gh = rows * (cell + gap)
  // Wide: the opened cell sits to the right of the grid. Narrow: below it.
  const box = narrow
    ? { x: 0, y: y0 + gh + 18, w: 360, h: 76 }
    : { x: x0 + gw + 22, y: 82, w: 720 - (x0 + gw + 22), h: 132 }
  const totalsY = narrow ? box.y + box.h + 24 : y0 + gh + 24
  const cx = x0 + pick.c * (cell + gap)
  const cy = y0 + pick.r * (cell + gap)
  return (
    <svg
      viewBox={narrow ? `0 0 360 ${totalsY + 30}` : "0 0 720 300"}
      className={narrow ? styles.svgNarrow : styles.svgWide}
      role="img"
      aria-label="이벤트 길이 8개와 강도 17개로 이루어진 136칸. 칸마다 시작 위치를 무작위로 2,449번 뽑아 탐지율을 추정합니다."
    >
      <text x={x0} y="16" fontSize="13" fill={C.ink2} fontWeight="600">
        이벤트 강도 q (1 → 256, √2배씩 17단계)
      </text>
      <text x="0" y={y0 - 10} fontSize="12" fill={C.muted}>
        길이 L
      </text>
      {lengths.map((l, r) => (
        <text
          key={l}
          x={x0 - 6}
          y={y0 + r * (cell + gap) + cell / 2 + 4}
          fontSize="11.5"
          textAnchor="end"
          fill={C.muted}
          fontFamily={MONO}
        >
          {l}
        </text>
      ))}
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const on = r === pick.r && c === pick.c
          return (
            <rect
              key={`${r}-${c}`}
              x={x0 + c * (cell + gap)}
              y={y0 + r * (cell + gap)}
              width={cell}
              height={cell}
              rx="3"
              fill={on ? C.accent : C.sunk}
              stroke={on ? C.accent : C.line2}
              strokeWidth="1"
            />
          )
        }),
      )}
      {narrow ? (
        <line
          x1={cx + cell / 2}
          y1={cy + cell}
          x2={cx + cell / 2}
          y2={box.y}
          stroke={C.accent}
          strokeWidth="1.2"
        />
      ) : (
        <line
          x1={cx + cell}
          y1={cy + cell / 2}
          x2={box.x}
          y2={box.y + box.h / 2}
          stroke={C.accent}
          strokeWidth="1.2"
        />
      )}
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx="8"
        fill={C.accentSoft}
        stroke={C.accent}
      />
      {narrow ? (
        <>
          <text x="14" y={box.y + 24} fontSize="13" fill={C.accent} fontWeight="700">
            한 칸 = 탐지율 하나
          </text>
          <text x="14" y={box.y + 44} fontSize="12" fill={C.ink2}>
            무작위 위치에 이벤트를 넣고 정책을 재실행
          </text>
          <text x="14" y={box.y + 64} fontSize="12.5" fill={C.ink} fontWeight="600">
            × 2,449회 · 95% 구간 반폭 ≤ 0.02
          </text>
        </>
      ) : (
        <>
          <text x={box.x + 14} y="108" fontSize="13" fill={C.accent} fontWeight="700">
            한 칸 = 탐지율 하나
          </text>
          <text x={box.x + 14} y="132" fontSize="12.5" fill={C.ink2}>
            시작 위치를 무작위로 뽑아
          </text>
          <text x={box.x + 14} y="150" fontSize="12.5" fill={C.ink2}>
            이벤트를 넣고 정책을 재실행
          </text>
          <text x={box.x + 14} y="178" fontSize="13" fill={C.ink} fontWeight="600">
            × 2,449회
          </text>
          <text x={box.x + 14} y="198" fontSize="11.5" fill={C.muted}>
            95% 구간 반폭 ≤ 0.02
          </text>
        </>
      )}
      <text x={narrow ? 0 : x0} y={totalsY} fontSize="12" fill={C.ink2}>
        T1: 136칸 × 2,449 = 333,064회
      </text>
      <text x={narrow ? 0 : x0} y={totalsY + 20} fontSize="12" fill={C.ink2}>
        T2: 정책 24개 · 신뢰구간 3,264개 동시 충족 → 1,594,736회
      </text>
    </svg>
  )
}

function TaskGrid() {
  return (
    <>
      <TaskGridSvg narrow={false} />
      <TaskGridSvg narrow />
    </>
  )
}

/** What one trial recomputes: every (window length, start) vs. only the ones an event touches. */
function RecomputeScopeSvg({ narrow }: { narrow: boolean }) {
  const rows = 8
  const cols = narrow ? 30 : 44
  const cell = 9
  const gap = 2
  const step = cell + gap
  const event = narrow ? { from: 14, to: 16 } : { from: 20, to: 23 }
  const gx = narrow ? 0 : 150
  const p1 = narrow ? 28 : 12
  const p2 = narrow ? 150 : 136
  const panel = (y0: number, incremental: boolean) =>
    Array.from({ length: rows }).flatMap((_, r) =>
      Array.from({ length: cols }).map((__, c) => {
        // A window of length w that starts within w of the event overlaps it.
        const reach = r + 1
        const hit = c >= event.from - reach && c <= event.to
        return (
          <rect
            key={`${y0}-${r}-${c}`}
            x={gx + c * step}
            y={y0 + r * step}
            width={cell}
            height={cell}
            rx="1.5"
            fill={incremental ? (hit ? C.accent : C.surface) : C.ink2}
            stroke={incremental && !hit ? C.line2 : "none"}
            strokeWidth="0.8"
          />
        )
      }),
    )
  const eventX = gx + event.from * step
  const eventW = (event.to - event.from + 1) * step - gap
  const eventY = p2 + rows * step + 6
  return (
    <svg
      viewBox={narrow ? `0 0 330 ${eventY + 62}` : "0 0 650 270"}
      className={narrow ? styles.svgNarrow : styles.svgWide}
      role="img"
      aria-label="전체 재계산은 모든 창 길이와 시작 위치를 다시 계산하고 다시 정렬합니다. 증분 재계산은 이벤트와 겹치는 창만 다시 계산해 미리 정렬한 순서에 병합합니다."
    >
      {narrow ? (
        <>
          <text x="0" y="18" fontSize="13" fill={C.ink} fontWeight="700">
            전체 재계산{" "}
            <tspan fill={C.muted} fontWeight="400" fontSize="12">
              모든 칸 계산 + 정렬
            </tspan>
          </text>
          <text x="0" y={p2 - 10} fontSize="13" fill={C.accent} fontWeight="700">
            증분 재계산{" "}
            <tspan fill={C.muted} fontWeight="400" fontSize="12">
              겹치는 칸만 계산 + 병합
            </tspan>
          </text>
        </>
      ) : (
        <>
          <text x="0" y="24" fontSize="13" fill={C.ink} fontWeight="700">
            전체 재계산
          </text>
          <text x="0" y="42" fontSize="11.5" fill={C.muted}>
            모든 칸 계산 + 정렬
          </text>
          <text x="0" y="148" fontSize="13" fill={C.accent} fontWeight="700">
            증분 재계산
          </text>
          <text x="0" y="166" fontSize="11.5" fill={C.muted}>
            겹치는 칸만 계산
          </text>
          <text x="0" y="182" fontSize="11.5" fill={C.muted}>
            + 기존 순서에 병합
          </text>
        </>
      )}
      {panel(p1, false)}
      {panel(p2, true)}
      <rect x={eventX} y={eventY} width={eventW} height="8" rx="2" fill={C.ink} />
      <text
        x={eventX + eventW / 2}
        y={eventY + 24}
        fontSize="11.5"
        textAnchor="middle"
        fill={C.ink}
        fontWeight="600"
      >
        넣은 이벤트 (길이 L)
      </text>
      <text x={gx} y={eventY + (narrow ? 48 : 40)} fontSize="11" fill={C.muted}>
        {narrow
          ? "행 = 창 길이(15개) · 열 = 시작 위치(604,800개)"
          : "행 = 창 길이 (실제 15개) · 열 = 시작 위치 (실제 604,800개)"}
      </text>
    </svg>
  )
}

function RecomputeScope() {
  return (
    <>
      <RecomputeScopeSvg narrow={false} />
      <RecomputeScopeSvg narrow />
    </>
  )
}

const COST = [
  { method: "full", label: "전체 재계산", ms: 1180.55, note: "정렬이 시간의 87%(1,025.6ms)" },
  { method: "tail", label: "상위 값만 정렬", ms: 224.27, note: "기준을 넘을 수 있는 값만 정렬" },
  {
    method: "incremental",
    label: "증분 재계산",
    ms: 3.36,
    note: "재계산 0.04 · 병합 1.87 · 선택 1.44ms",
  },
]

// Projected time to solution, seconds. Empty = method not measured for that grid.
const TASKS = [
  {
    task: "T1 · 정책 1개",
    series: "1분 단위 · 3개월",
    full: 2910,
    shared: null,
    tail: 726,
    inc: 11.1,
  },
  {
    task: "T1 · 정책 1개",
    series: "1초 단위 · 1주",
    full: 14400,
    shared: null,
    tail: 3156,
    inc: 42.9,
  },
  {
    task: "T2 · 정책 24개",
    series: "1분 단위 · 3개월",
    full: 267840,
    shared: 14040,
    tail: 3600,
    inc: 180,
  },
  {
    task: "T2 · 정책 24개",
    series: "1초 단위 · 1주",
    full: 1313280,
    shared: 69840,
    tail: 16920,
    inc: 726,
  },
]

const METHODS = [
  { key: "full", label: "전체" },
  { key: "shared", label: "계산 공유" },
  { key: "tail", label: "상위 값 정렬" },
  { key: "inc", label: "증분" },
] as const

const LOG_MIN = 1 // 10 s
const LOG_MAX = 6.3 // ≈ 23 days
const pos = (s: number) => ((Math.log10(s) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100

function human(s: number): string {
  if (s < 60) return `${s}초`
  if (s < 3600) return `${(s / 60).toFixed(1)}분`
  if (s < 86400) return `${(s / 3600).toFixed(1)}시간`
  return `${(s / 86400).toFixed(1)}일`
}

const TICKS = [
  { s: 10, label: "10초" },
  { s: 60, label: "1분" },
  { s: 600, label: "10분" },
  { s: 3600, label: "1시간" },
  { s: 86400, label: "1일" },
  { s: 864000, label: "10일" },
]

function TimeChart() {
  return (
    <div className={styles.tts} role="table" aria-label="과제별, 방법별 예상 소요 시간">
      <div className={styles.ttsAxis} aria-hidden="true">
        <span />
        <span className={styles.ttsScale}>
          {TICKS.map((t) => (
            <span
              key={t.s}
              style={{ left: `${pos(t.s)}%` }}
              data-hour={t.s === 3600 ? "" : undefined}
            >
              {t.label}
            </span>
          ))}
        </span>
      </div>
      {TASKS.map((row) => (
        <div key={row.task + row.series} className={styles.ttsRow} role="row">
          <span className={styles.ttsTask} role="rowheader">
            {row.task}
            <small>{row.series}</small>
          </span>
          <span className={styles.ttsTrack} role="cell">
            <span className={styles.ttsList}>
              {METHODS.filter((m) => row[m.key] !== null)
                .map((m) => `${m.label} ${human(row[m.key]!)}`)
                .join(" · ")}
            </span>
            <span className={styles.ttsHour} style={{ left: `${pos(3600)}%` }} />
            {METHODS.map((m) => {
              const s = row[m.key]
              if (s === null) return null
              return (
                <span
                  key={m.key}
                  className={styles.ttsDot}
                  data-method={m.key}
                  style={{ left: `${pos(s)}%` }}
                >
                  <span className={styles.ttsLabel}>
                    {m.label} {human(s)}
                  </span>
                </span>
              )
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

const PLAN = [
  {
    step: "1단계",
    title: "보유 GPU에서 실행",
    body: "보유 GPU에서 같은 작업을 끝까지 실행하고 병목 구간을 기록합니다.",
  },
  {
    step: "2단계",
    title: "병목 구간 기록",
    body: "측정한 병목을 근거로 필요한 장비를 정합니다.",
  },
  {
    step: "3단계",
    title: "같은 작업으로 재측정",
    body: "같은 작업을 다시 실행해 개선 폭을 확인합니다.",
  },
  {
    step: "4단계",
    title: "CPU와 비교",
    body: "같은 결과까지 걸린 시간과 같은 시간 안의 오차를 CPU와 비교합니다.",
  },
]

export function SurveillanceFrontier() {
  return (
    <>
      <ProjectHeader
        id="surveillance-frontier"
        title="탐지 정책 검증을 위한 / 대용량 시계열 처리 엔진과 | 연산 최적화"
        lead="탐지 정책이 놓치는 경우를 측정하려면 60만 행 시계열에서 정책을 수십만 번 다시 실행해야 합니다. C++/OpenMP 엔진이 변경된 구간만 다시 계산하도록 구현해, 전체 재계산과 같은 결과를 시행당 349배 빠르게 얻었습니다."
        status={[
          { tone: "pass", label: "Phase 1 CPU 엔진 완료" },
          { tone: "plain", label: "Phase 2 CUDA 병렬화 진행 중" },
          { tone: "plain", label: "개인 연구" },
        ]}
        results={[
          {
            value: "349×",
            label: "시행당 처리량 (전체 재계산 대비)",
            scope: "60만 행 · 1스레드 · AWS c7i.16xlarge",
          },
          {
            value: "0 / 2,112",
            label: "전체 재계산과 결과가 다른 시행",
            scope: "오차 허용 없이 비교",
            tone: "pass",
          },
          {
            value: "15.2일 → 12.1분",
            label: "정책 24개 검증 작업의 예상 시간",
            scope: "32코어 측정 처리량 기준",
          },
        ]}
        facts={[
          { label: "기간", value: "2026.10 – 진행 중" },
          { label: "역할", value: "개인 연구" },
          { label: "스택", value: "C++17 · OpenMP · CUDA · Python · AWS EC2" },
        ]}
        refs={[
          { label: "GitHub", href: LINKS.sf.repo },
          { label: "Phase 1 결과", href: LINKS.sf.phase1 },
          { label: "Phase 2 설계", href: LINKS.sf.phase2 },
        ]}
      />

      <Section
        n={1}
        kicker="문제"
        title="탐지 정책이 놓치는 비율은 / 시나리오를 수천 번 실행해야 | 측정할 수 있습니다"
      >
        <Figure
          label="검증 작업의 규모"
          caption="시계열의 무작위 위치에 합성 이벤트를 넣고 정책을 다시 실행해, 칸마다 탐지율을 구합니다."
        >
          <TaskGrid />
        </Figure>
      </Section>

      <Section
        n={2}
        kicker="병목"
        title="전체 재계산은 | 이벤트 하나를 바꿀 때도 / 모든 구간을 | 다시 계산하고 정렬합니다"
        tone="surface"
      >
        <Figure
          label="시행 1회의 계산 범위"
          caption="증분 재계산은 이벤트와 겹치는 구간만 다시 계산하고, 미리 정렬해 둔 순서에 병합합니다."
        >
          <RecomputeScope />
        </Figure>

        <div className={styles.cost} role="table" aria-label="방법별 시행 1회 시간">
          <p className={styles.costHead}>시행 1회 처리 시간 · 같은 축</p>
          {COST.map((row) => (
            <div key={row.method} className={styles.costRow} data-method={row.method} role="row">
              <span className={styles.costLabel} role="rowheader">
                {row.label}
              </span>
              <span className={styles.costTrack} role="cell">
                <span
                  className={styles.costFill}
                  style={{ width: `max(${(row.ms / 1180.55) * 100}%, 2px)` }}
                />
                <span className={styles.costValue}>{row.ms.toLocaleString("en-US")} ms</span>
              </span>
              <span className={styles.costNote} role="cell">
                {row.note}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        n={3}
        kicker="설계 판단"
        title="처리 속도를 높이기 전에 / 결과가 같은지부터 검증했습니다"
      >
        <Decisions
          items={[
            {
              title: "결과를 오차 없이 비교하도록 설계",
              body: "가격은 float32, 거래량은 고정소수점, 순위는 정수로 계산해 모든 방법이 같은 값을 냅니다.",
            },
            {
              title: "시행 단위로 병렬 처리",
              body: "서로 독립인 시행을 스레드에 나눠 32스레드에서 병렬 효율 0.72–0.86을 얻었습니다.",
            },
            {
              title: "판정 기준을 측정 전에 확정",
              body: "가설과 1시간 판정 기준을 측정 전에 커밋하고, 결과에 맞춰 바꾸지 않았습니다.",
            },
          ]}
        />
      </Section>

      <Section
        n={4}
        kicker="검증 결과"
        title="정책 24개 검증 작업의 예상 시간이 / 15.2일에서 12.1분으로 줄었습니다"
        tone="surface"
      >
        <Figure
          label="작업별 예상 처리 시간 (로그 축)"
          caption="32코어에서 측정한 처리량으로 계산한 값입니다."
        >
          <TimeChart />
          <ul className={styles.legend} aria-hidden="true">
            {METHODS.map((m) => (
              <li key={m.key} data-method={m.key}>
                {m.label}
              </li>
            ))}
            <li data-method="hour">1시간 기준선</li>
          </ul>
        </Figure>

        <div className={styles.findings}>
          <div className={styles.finding}>
            <h3>강도를 높여도 탐지율이 낮아지는 구간 발견</h3>
            <p>
              인접한 강도 360쌍 중 12쌍에서 확인했습니다. 이분 탐색으로 탐지 임계값을 찾는 방식은 이
              정책에 쓸 수 없습니다.
            </p>
          </div>
          <div className={styles.finding}>
            <h3>신뢰구간 계산을 정확값으로 검증</h3>
            <p>432개 칸에서 최저 포함률 0.940으로 사전 기준 0.931을 넘었습니다.</p>
          </div>
        </div>
      </Section>

      <Section
        n={5}
        kicker="진행 중 · GPU 병렬화"
        title="CUDA 병렬 처리 경로 2개와 / CPU 결과 비교 검사를 구현했습니다"
      >
        <div className={styles.gpuBuilt}>
          <h3 className={styles.gpuTitle}>구현한 것</h3>
          <ul>
            <li>
              CUDA 경로 2개: GPU에서 증분 계산까지 처리(G-inc), GPU 계산 후 CPU에서 정렬(G-hyb)
            </li>
            <li>CPU 결과와 모든 값을 비교하는 정확성 검사</li>
            <li>CPU와 GPU가 같은 시나리오를 처리하도록 난수 순서 고정</li>
          </ul>
        </div>

        <ol className={styles.plan} aria-label="GPU 비교 진행 순서">
          {PLAN.map((p) => (
            <li key={p.step}>
              <span className={styles.planStep}>{p.step}</span>
              <h3 className={styles.planTitle}>{p.title}</h3>
              <p className={styles.planBody}>{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        n={6}
        kicker="실무 적용"
        title="탐지 룰을 바꿀 때마다 / 누락률을 같은 조건으로 | 다시 측정합니다"
        tone="surface"
      >
        <Apply
          steps={[
            {
              title: "기준 데이터 준비",
              body: "기준 시계열의 구간별 특징과 순위를 한 번 계산해 저장합니다.",
            },
            {
              title: "시나리오 재실행",
              body: "룰을 바꾼 뒤 같은 시나리오 집합에서 변경된 구간만 다시 계산합니다.",
            },
            {
              title: "누락률 비교",
              body: "조건별 탐지율과 신뢰구간을 계산해 변경 전후를 비교합니다.",
            },
          ]}
          target="거래·로그처럼 시간 순서가 있는 데이터에서 이상 구간을 찾는 탐지 룰의 변경 검증"
        />
        <p className={styles.docs}>
          <Ext href={LINKS.sf.phase1}>Phase 1 결과 ↗</Ext>
          <Ext href={LINKS.sf.phase2}>Phase 2 설계 ↗</Ext>
        </p>
      </Section>

      <Pager id="surveillance-frontier" />
    </>
  )
}

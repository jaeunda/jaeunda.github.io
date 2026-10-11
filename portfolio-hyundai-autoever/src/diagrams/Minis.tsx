import { C, MONO } from "./palette"

// The small diagrams on the home cards. Each draws the one mechanism its
// project is about, so the three cards differ in structure, not only in text.

/** weavegate: two requests interleaved at named points, judged by SQL, gating CI. */
export function WeavegateMini() {
  const lanes = [
    { y: 34, label: "요청 A" },
    { y: 78, label: "요청 B" },
  ]
  // Release order of the saved schedule w1 w2 w1 w2: both read before either writes.
  const steps = [
    { lane: 0, x: 92, text: "read" },
    { lane: 1, x: 132, text: "read" },
    { lane: 0, x: 172, text: "insert" },
    { lane: 1, x: 212, text: "insert" },
  ]
  return (
    <svg
      viewBox="0 0 340 128"
      role="img"
      aria-label="요청 A와 B가 고정된 순서로 read, read, insert, insert를 실행하고, SQL 조건이 활성 배정 2건을 위반으로 판정해 CI가 실패합니다."
    >
      {lanes.map((lane) => (
        <g key={lane.label}>
          <text x="0" y={lane.y + 4} fontSize="12" fill={C.ink2} fontWeight="600">
            {lane.label}
          </text>
          <line x1="50" x2="236" y1={lane.y} y2={lane.y} stroke={C.line2} strokeWidth="1.5" />
        </g>
      ))}
      {steps.map((step, i) => {
        const y = lanes[step.lane].y
        return (
          <g key={i}>
            {i > 0 && (
              <line
                x1={steps[i - 1].x}
                y1={lanes[steps[i - 1].lane].y}
                x2={step.x}
                y2={y}
                stroke={C.accent}
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            )}
            <circle
              cx={step.x}
              cy={y}
              r="10"
              fill={C.surface}
              stroke={C.accent}
              strokeWidth="1.8"
            />
            <text
              x={step.x}
              y={y + 4}
              fontSize="11"
              textAnchor="middle"
              fill={C.accent}
              fontFamily={MONO}
              fontWeight="600"
            >
              {i + 1}
            </text>
            <text
              x={step.x}
              y={step.lane === 0 ? y - 15 : y + 24}
              fontSize="11.5"
              textAnchor="middle"
              fill={C.muted}
              fontFamily={MONO}
            >
              {step.text}
            </text>
          </g>
        )
      })}
      <line x1="236" y1="56" x2="252" y2="56" stroke={C.ink2} strokeWidth="1.4" />
      <rect
        x="252"
        y="22"
        width="88"
        height="68"
        rx="6"
        fill={C.failSoft}
        stroke={C.fail}
        strokeWidth="1.2"
      />
      <text x="296" y="41" fontSize="11.5" textAnchor="middle" fill={C.ink2} fontFamily={MONO}>
        SQL assert
      </text>
      <text
        x="296"
        y="59"
        fontSize="12"
        textAnchor="middle"
        fill={C.fail}
        fontFamily={MONO}
        fontWeight="600"
      >
        count = 2
      </text>
      <text x="296" y="78" fontSize="11" textAnchor="middle" fill={C.fail} fontWeight="700">
        CI 실패 · exit 2
      </text>
      <text x="50" y="122" fontSize="11.5" fill={C.muted}>
        저장한 실행 순서로 매번 재실행
      </text>
    </svg>
  )
}

/** surveillance-frontier: what one trial recomputes, full vs incremental. */
export function FrontierMini() {
  const rows = 6
  const cols = 18
  const cell = 7
  const gap = 1.5
  const band = { from: 8, to: 10 } // columns an injected event overlaps
  const grid = (x0: number, incremental: boolean) =>
    Array.from({ length: rows }).flatMap((_, r) =>
      Array.from({ length: cols }).map((__, c) => {
        // Longer windows (lower rows) overlap a wider span around the event.
        const reach = Math.floor(r / 2)
        const hit = c >= band.from - reach && c <= band.to + reach
        const fill = incremental ? (hit ? C.accent : C.sunk) : C.ink2
        return (
          <rect
            key={`${r}-${c}`}
            x={x0 + c * (cell + gap)}
            y={22 + r * (cell + gap)}
            width={cell}
            height={cell}
            rx="1"
            fill={fill}
          />
        )
      }),
    )
  const w = cols * (cell + gap)
  return (
    <svg
      viewBox="0 0 340 128"
      role="img"
      aria-label="한 번의 시행에서 전체 재계산은 모든 구간을 다시 계산하고, 증분 재계산은 시나리오가 바꾼 구간만 다시 계산합니다. 시행당 1,180.55ms와 3.36ms입니다."
    >
      <text x="0" y="13" fontSize="12" fill={C.ink2} fontWeight="600">
        전체 재계산
      </text>
      <text x={w + 22} y="13" fontSize="12" fill={C.accent} fontWeight="600">
        증분 재계산
      </text>
      {grid(0, false)}
      {grid(w + 22, true)}
      <text x="0" y="90" fontSize="11.5" fill={C.muted}>
        행 = 창 길이 · 열 = 시작 위치
      </text>
      <rect x="0" y="100" width={w} height="8" rx="2" fill={C.ink2} />
      {/* Same scale as the full bar: 3.36 / 1,180.55 of its width, drawn at least 1px. */}
      <rect
        x={w + 22}
        y="100"
        width={Math.max((w * 3.36) / 1180.55, 1)}
        height="8"
        fill={C.accent}
      />
      <text x="0" y="124" fontSize="11" fill={C.ink2} fontWeight="600">
        1,180.55 ms/시행
      </text>
      <text x={w + 22} y="124" fontSize="11" fill={C.accent} fontWeight="600">
        3.36 ms/시행
      </text>
    </svg>
  )
}

/** WeaveTrail: who may do what, and where a doubtful proposal stops. */
export function WeaveTrailMini() {
  const nodes = [
    { x: 0, label: "원본", sub: "CSV·JSONL" },
    { x: 70, label: "AI 제안", sub: "열 매핑", untrusted: true },
    { x: 140, label: "검증", sub: "계약·변환" },
    { x: 210, label: "승인", sub: "사람" },
    { x: 280, label: "처리", sub: "결정론" },
  ]
  const y = 40
  const w = 58
  const h = 40
  return (
    <svg
      viewBox="0 0 340 128"
      role="img"
      aria-label="원본 파일에서 AI가 열 매핑을 제안하고, 코드가 계약과 변환을 검증하고, 사람이 승인한 뒤 결정론적 엔진이 처리합니다. 검증에 실패하면 REVIEW_REQUIRED로 멈추고, 결과는 원본 행까지 추적됩니다."
    >
      <path
        d={`M ${280 + w / 2} ${y - 2} C ${280 + w / 2} 22, ${w / 2} 22, ${w / 2} ${y - 2}`}
        fill="none"
        stroke={C.pass}
        strokeWidth="1.3"
        strokeDasharray="3 3"
        markerEnd="url(#wt-mini-arrow-pass)"
      />
      <text x="170" y="13" fontSize="11.5" textAnchor="middle" fill={C.pass}>
        결과 → rawRowHash → 원본 행 추적
      </text>
      <defs>
        <marker
          id="wt-mini-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" fill={C.ink2} />
        </marker>
        <marker
          id="wt-mini-arrow-pass"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" fill={C.pass} />
        </marker>
        <marker
          id="wt-mini-arrow-hold"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" fill={C.hold} />
        </marker>
      </defs>
      {nodes.map((node, i) => (
        <g key={node.label}>
          {i > 0 && (
            <line
              x1={nodes[i - 1].x + w}
              y1={y + h / 2}
              x2={node.x - 1}
              y2={y + h / 2}
              stroke={C.ink2}
              strokeWidth="1.2"
              markerEnd="url(#wt-mini-arrow)"
            />
          )}
          <rect
            x={node.x}
            y={y}
            width={w}
            height={h}
            rx="6"
            fill={node.untrusted ? C.surface : i === 2 ? C.accentSoft : C.surface}
            stroke={node.untrusted ? C.plan : i === 2 ? C.accent : C.line2}
            strokeWidth="1.3"
            strokeDasharray={node.untrusted ? "4 3" : undefined}
          />
          <text
            x={node.x + w / 2}
            y={y + 17}
            fontSize="12"
            textAnchor="middle"
            fill={C.ink}
            fontWeight="700"
          >
            {node.label}
          </text>
          <text x={node.x + w / 2} y={y + 32} fontSize="11" textAnchor="middle" fill={C.muted}>
            {node.sub}
          </text>
        </g>
      ))}
      <line
        x1={140 + w / 2}
        y1={y + h}
        x2={140 + w / 2}
        y2={y + h + 18}
        stroke={C.hold}
        strokeWidth="1.3"
        markerEnd="url(#wt-mini-arrow-hold)"
      />
      <rect
        x="92"
        y={y + h + 20}
        width="154"
        height="24"
        rx="5"
        fill={C.holdSoft}
        stroke={C.hold}
        strokeWidth="1"
      />
      <text
        x="169"
        y={y + h + 36}
        fontSize="11.5"
        textAnchor="middle"
        fill={C.hold}
        fontWeight="600"
      >
        REVIEW_REQUIRED · 중단
      </text>
    </svg>
  )
}

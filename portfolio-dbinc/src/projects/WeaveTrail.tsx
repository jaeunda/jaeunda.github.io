import { useState } from "react"
import { Block, Pager, ProjectHeader, Takeaway } from "../components/Page"
import { LINKS } from "../data/links"
import styles from "./WeaveTrail.module.css"

// Facts follow the WeaveTrail README and its product brief. The service is in
// active development: what runs today and what is being built are labelled
// on the page, and nothing here is presented as a measured user outcome.

const HOPS = [
  { tab: "분석 글 · AI 답변", act: "주장 확인" },
  { tab: "금융위 · 금감원", act: "공식 발표 검색" },
  { tab: "시장 데이터", act: "시장 데이터 검색" },
  { tab: "스프레드시트", act: "숫자 다시 계산" },
  { tab: "발표 원문", act: "원문 재확인" },
]

type Actor = "user" | "ai" | "code" | "source"

const FLOW: { actor: Actor; step: string; note: string }[] = [
  { actor: "user", step: "분석 글 / AI 답변", note: "사용자가 읽거나 쓴 글을 붙여 넣습니다" },
  { actor: "ai", step: "주장과 숫자 추출", note: "확인할 문장과 수치, 데이터 항목을 제안" },
  {
    actor: "source",
    step: "공식 발표 + 시장 데이터 연결",
    note: "보존된 원문 스냅숏과 공개 시세를 사건 날짜에 맞춰 연결",
  },
  { actor: "code", step: "코드 재계산", note: "고정된 정의로 값을 다시 계산하고 원문과 대조" },
  { actor: "code", step: "결과 분류", note: "계산 확인 · 불일치 · 확인 불가 · AI 해석" },
  { actor: "source", step: "근거 + 계산 기준 표시", note: "원문 구간, 원본 행, 계산식까지 열람" },
]

const LANES: { actor: Actor; name: string }[] = [
  { actor: "user", name: "사용자" },
  { actor: "ai", name: "AI" },
  { actor: "code", name: "코드" },
  { actor: "source", name: "자료 · 근거" },
]

type Grade = "confirmed" | "mismatch" | "unverifiable" | "interpretation"

const GRADES: {
  id: Grade
  name: string
  meaning: string
  by: string
  trail: { claim: string; source: string; data: string; rule: string; shown: string }
}[] = [
  {
    id: "confirmed",
    name: "계산 확인",
    meaning: "검증된 원자료로 다시 계산한 값과 같습니다.",
    by: "코드",
    trail: {
      claim: "글 속의 수치 문장 (예: 지수의 하루 등락률)",
      source: "같은 날짜의 공식 발표 원문 구간",
      data: "공개 시세의 해당 일자 원본 행",
      rule: "버전이 고정된 등락률 정의",
      shown: "다시 계산한 값과 함께 ‘계산 확인’",
    },
  },
  {
    id: "mismatch",
    name: "불일치",
    meaning: "계산하면 다른 값이 나옵니다. 그 값을 옆에 적습니다.",
    by: "코드",
    trail: {
      claim: "글 속의 수치 문장",
      source: "같은 날짜의 공식 발표 원문 구간",
      data: "공개 시세의 해당 일자 원본 행",
      rule: "같은 정의로 다시 계산",
      shown: "글의 값과 계산한 값을 나란히 표시. 글이 틀렸다고 쓰지 않습니다",
    },
  },
  {
    id: "unverifiable",
    name: "확인 불가",
    meaning: "검증된 원자료로 확인할 수 없습니다. 이유와 필요한 자료를 적습니다.",
    by: "코드",
    trail: {
      claim: "공개 자료로 다시 만들 수 없는 수치",
      source: "연결할 발표 없음",
      data: "필요한 데이터 항목이 수집 범위 밖",
      rule: "추측해 채우지 않음",
      shown: "확인하지 못한 이유와 필요한 자료",
    },
  },
  {
    id: "interpretation",
    name: "AI 해석",
    meaning: "모델의 요약이거나, 데이터로 답할 수 없는 질문입니다.",
    by: "없음 · 제안일 뿐",
    trail: {
      claim: "원인·전망처럼 데이터로 답할 수 없는 서술",
      source: "—",
      data: "—",
      rule: "판정하지 않음",
      shown: "확인된 사실과 구분되는 ‘AI 해석’ 표시",
    },
  },
]

const TRAIL_STEPS = [
  { key: "result", label: "Result" },
  { key: "claim", label: "Claim" },
  { key: "source", label: "Source" },
  { key: "data", label: "Market Data" },
  { key: "rule", label: "Calculation Rule" },
] as const

function EvidenceTrail() {
  const [grade, setGrade] = useState<Grade>("mismatch")
  const current = GRADES.find((item) => item.id === grade)!
  const values: Record<(typeof TRAIL_STEPS)[number]["key"], string> = {
    result: `${current.name} — ${current.trail.shown}`,
    claim: current.trail.claim,
    source: current.trail.source,
    data: current.trail.data,
    rule: current.trail.rule,
  }
  return (
    <div className={styles.trail}>
      <div className={styles.badges} role="group" aria-label="결과 유형 선택">
        {GRADES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.badge}
            data-grade={item.id}
            aria-pressed={grade === item.id}
            onClick={() => setGrade(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <ol className={styles.trailSteps} aria-live="polite">
        {TRAIL_STEPS.map((step) => (
          <li key={step.key} data-step={step.key} data-grade={grade}>
            <span className={styles.trailKey}>{step.label}</span>
            <span className={styles.trailValue}>{values[step.key]}</span>
          </li>
        ))}
      </ol>
      <p className={styles.trailNote}>
        화면 구성 예시입니다. 실제 화면에서는 각 단계가 원문과 원본 행으로 열립니다.
      </p>
    </div>
  )
}

export function WeaveTrail() {
  return (
    <>
      <ProjectHeader
        id="weavetrail"
        title="흩어진 금융 정보를 한 화면에서 근거와 함께 확인"
        message="금융 정보를 빠르게 읽는 AI의 장점을 살리면서, 중요한 주장과 숫자를 다시 공식 자료와 시장 데이터로 확인하는 과정까지 서비스에 넣었습니다."
        meta={[
          { label: "Period", value: "2026.07–10" },
          { label: "Role", value: "단독 기획·설계·개발" },
          { label: "Context", value: "2026 금융 AI Challenge" },
          { label: "Stack", value: "TypeScript · Next.js · LLM" },
          { label: "Data", value: "금융위·금감원·SEC 발표, 공개 시장 데이터" },
        ]}
        repo={{ href: LINKS.weavetrail.repo, label: "WeaveTrail/WeaveTrail" }}
      />

      <Block
        n={1}
        kicker="USER PROBLEM"
        title="분석 글 하나를 확인하려면 여러 사이트를 오가야 합니다"
        lead="공식 발표는 기관마다 HTML·PDF·HWP로 흩어져 있고, 발표 속 숫자를 확인하려면 다른 사이트의 시장 데이터를 열어야 합니다. 매끄러운 요약에서는 인용과 계산과 추측이 같은 무게로 보입니다."
      >
        <ol className={styles.hops}>
          {HOPS.map((hop, i) => (
            <li key={hop.tab}>
              <span className={styles.hopTab}>{hop.tab}</span>
              <span className={styles.hopAct}>
                <span className={styles.hopNum}>{i + 1}</span>
                {hop.act}
              </span>
            </li>
          ))}
        </ol>
        <Takeaway>목표: 분석 결과와 근거 확인을 하나의 흐름으로 만든다.</Takeaway>
      </Block>

      <Block
        n={2}
        kicker="SERVICE FLOW"
        title="글에서 주장을 꺼내고, 같은 자료로 다시 계산해 근거와 함께 돌려줍니다"
        lead="각 단계는 누가 결과를 만드는지가 정해져 있습니다. 어느 단계에서든 ‘이건 누가 정했나’에 답할 수 있습니다."
        tone="surface"
      >
        <div className={styles.swim}>
          <div className={styles.swimHead} aria-hidden="true">
            {LANES.map((lane) => (
              <span key={lane.actor} data-actor={lane.actor}>
                {lane.name}
              </span>
            ))}
          </div>
          <ol className={styles.swimRows}>
            {FLOW.map((row, i) => {
              const lane = LANES.findIndex((item) => item.actor === row.actor)
              return (
                <li key={row.step} className={styles.swimRow}>
                  <span
                    className={styles.swimNode}
                    data-actor={row.actor}
                    style={{ gridColumn: `${lane + 1} / span 1` }}
                  >
                    <span className={styles.swimIndex}>
                      {String(i + 1).padStart(2, "0")}
                      <span className="sr-only"> · {LANES[lane].name}</span>
                    </span>
                    <strong>{row.step}</strong>
                    <span>{row.note}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        <h3 className={styles.subhead}>결과 유형</h3>
        <ul className={styles.grades}>
          {GRADES.map((item) => (
            <li key={item.id} data-grade={item.id}>
              <span className={styles.gradeName}>{item.name}</span>
              <span className={styles.gradeMeaning}>{item.meaning}</span>
              <span className={styles.gradeBy}>보증: {item.by}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        n={3}
        kicker="ROLE OF AI"
        title="AI가 빠르게 범위를 좁히고, 반복 가능한 확인은 코드가 수행합니다"
        lead="한 층이 두 권한을 갖지 않도록 나눴습니다. 제안하는 층은 승인하지 못하고, 계산하는 층은 받은 범위를 넓히지 못합니다."
      >
        <div className={styles.roles}>
          <section className={styles.role} data-actor="ai" aria-labelledby="role-ai">
            <h3 id="role-ai">AI가 하는 일</h3>
            <ul>
              <li>문서 구조 정리 (누가·언제·무엇·얼마·조치·근거 조항)</li>
              <li>확인할 주장 추출</li>
              <li>숫자와 데이터 항목 파악</li>
              <li>서로 다른 자료의 의미 연결 제안</li>
            </ul>
            <p className={styles.roleLimit}>값을 계산하거나 결론을 내리지 않습니다.</p>
          </section>
          <section className={styles.role} data-actor="code" aria-labelledby="role-code">
            <h3 id="role-code">코드가 하는 일</h3>
            <ul>
              <li>반복 계산</li>
              <li>동일 기준 적용 (정의·시각·소수 비교 방식 고정)</li>
              <li>결과 분류</li>
              <li>source 연결 (원문 구간, 원본 행)</li>
            </ul>
            <p className={styles.roleLimit}>원문과 일치하지 않는 인용은 보여 주지 않습니다.</p>
          </section>
        </div>
        <Takeaway>AI가 빠르게 범위를 좁히고, 반복 가능한 확인은 코드가 수행한다.</Takeaway>
      </Block>

      <Block
        n={4}
        kicker="EVIDENCE"
        title="결과를 누르면 주장, 자료, 데이터, 계산 기준까지 따라갈 수 있습니다"
        lead="결과 유형을 선택하면 사용자가 확인하게 되는 흐름이 바뀝니다."
        tone="surface"
      >
        <EvidenceTrail />
        <aside className={styles.case}>
          <p className={styles.caseTag}>운영 중인 사례 재생</p>
          <p className={styles.caseBody}>
            2026년 9월 3일 코스피 200은 전일보다 아주 조금 높게 끝났지만, 같은 날 고가에서 그
            상승폭의 약 14배를 되돌렸고 그 지수를 기초로 한 선물은 약 25배를 되돌렸습니다. 사람이
            분석 날짜와 비교 기간을 정하면 고정된 코드가 계산하고, 각 관측값은 공개 원본 행까지 열어
            볼 수 있습니다. 같은 입력으로 다시 실행하면 같은 결과가 나옵니다.
          </p>
          <a href={LINKS.weavetrail.caseReplay} target="_blank" rel="noreferrer">
            사례 따라가기<span className="sr-only"> (새 창)</span> →
          </a>
        </aside>
      </Block>

      <Block
        n={5}
        kicker="ENGINEERING DIRECTION"
        title="이 구조를 금융 업무용 RAG와 Agent로 이어 가고 싶습니다"
      >
        <div className={styles.direction}>
          <section className={styles.now} aria-labelledby="dir-now">
            <h3 id="dir-now">지금 구현한 것</h3>
            <ul>
              <li>
                <strong>사례 재생</strong>AI 제안 → 사람 승인 → 코드 재계산 → 원본 행 추적 (운영 중)
              </li>
              <li>
                <strong>근거 등급 계약</strong>결과 유형의 정의와 한국어·영어 배지 부품
              </li>
              <li>
                <strong>결정론적 확인 경계</strong>정렬·시각 정밀도·소수 비교를 고정해 같은 입력에
                같은 결과
              </li>
              <li>
                <strong>분석 글 확인 화면</strong>붙여 넣은 글을 문장별로 확인하는 화면 (개발 중)
              </li>
            </ul>
          </section>
          <section className={styles.later} aria-labelledby="dir-later">
            <h3 id="dir-later">이어서 만들고 싶은 것</h3>
            <ul>
              <li>운영 이력 검색</li>
              <li>업무 문서 검색</li>
              <li>서비스 요청 해석</li>
              <li>관련 조치 정리</li>
              <li>로그와 SQL 연결</li>
            </ul>
          </section>
        </div>
      </Block>

      <Pager id="weavetrail" />
    </>
  )
}

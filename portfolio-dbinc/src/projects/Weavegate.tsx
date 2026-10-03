import { useState } from "react"
import { Block, Pager, ProjectHeader, Takeaway } from "../components/Page"
import { Explorer } from "../components/Explorer"
import { LINKS } from "../data/links"
import styles from "./Weavegate.module.css"

// Facts on this page come from the weavegate repository at the commit pinned
// in data/links.ts: docs/quickstart.md (captured output), the matching-slice
// fixture config, and docs/experiments/determinism.md (20 + 20 runs).

const FLOW = [
  {
    key: "app",
    label: "Application",
    title: "검증할 업무 흐름",
    body: "요청을 읽고(read), 배정 여부를 판단하고(decide), 배정을 기록하는(write) 흐름입니다. 두 작업자 w1, w2가 같은 요청 42에 대해 동시에 assign을 실행합니다.",
  },
  {
    key: "sync",
    label: "Transaction Sync Points",
    title: "실행을 멈추고 풀어 줄 지점",
    body: "트랜잭션 안의 after_read_request, before_insert_assignment 두 지점에 테스트 전용 sync point를 둡니다. 작업자는 이 지점에서 멈추고, weavegate가 정한 순서대로만 진행합니다.",
  },
  {
    key: "schedule",
    label: "Saved Schedule",
    title: "실행 순서를 파일로 저장",
    body: "w1 읽기 → w2 읽기 → w1 기록 → w2 기록, 네 단계의 해제 순서를 schedule로 저장합니다. 내용 기반 ID가 붙어 같은 순서를 언제든 다시 지정할 수 있습니다.",
  },
  {
    key: "db",
    label: "MySQL / InnoDB",
    title: "실제 DB에서 실행",
    body: "Testcontainers로 MySQL 8.4 컨테이너를 띄우고, 실행마다 같은 schema와 seed로 초기화합니다. 잠금과 격리 수준은 실제 InnoDB가 결정합니다.",
  },
  {
    key: "oracle",
    label: "SQL State Check",
    title: "서비스가 지켜야 할 상태를 SQL로 판정",
    body: "요청 하나에 ACTIVE 배정은 하나뿐이어야 한다는 규칙을 SQL로 적고, 결과 행이 0개여야 통과로 봅니다. 반환된 행이 곧 위반 데이터입니다.",
  },
  {
    key: "verdict",
    label: "PASS / FAIL",
    title: "종료 코드로 판정 전달",
    body: "위반이 있으면 진단 WG001과 함께 종료 코드 2, 없으면 0을 돌려줍니다. CI는 이 값으로 변경을 막거나 통과시킵니다.",
  },
  {
    key: "evidence",
    label: "Trace + Violating Data + Replay",
    title: "다시 실행할 수 있는 증거",
    body: "실패한 schedule, 단계별 trace, 위반 행, 재현 명령을 함께 남깁니다. 같은 명령으로 수정 전후를 같은 조건에서 비교합니다.",
  },
]

type Variant = "vulnerable" | "fixed"

type Cell = { worker: "w1" | "w2"; text: string; tone?: "write" | "wait" | "skip" | "lock" }

const TIMELINE: Record<Variant, { steps: Cell[]; result: string; pass: boolean }> = {
  vulnerable: {
    steps: [
      { worker: "w1", text: "요청 42 조회: 배정 없음" },
      { worker: "w2", text: "요청 42 조회: 배정 없음" },
      { worker: "w1", text: "배정 INSERT · commit", tone: "write" },
      { worker: "w2", text: "배정 INSERT · commit", tone: "write" },
    ],
    result: "요청 42의 ACTIVE 배정 2건",
    pass: false,
  },
  fixed: {
    steps: [
      { worker: "w1", text: "SELECT … FOR UPDATE: 행 잠금", tone: "lock" },
      { worker: "w2", text: "같은 행 잠금 대기 (InnoDB row-lock wait)", tone: "wait" },
      { worker: "w1", text: "배정 INSERT · commit, 잠금 해제", tone: "write" },
      { worker: "w2", text: "배정 확인 후 종료, INSERT 단계 건너뜀", tone: "skip" },
    ],
    result: "요청 42의 ACTIVE 배정 1건",
    pass: true,
  },
}

function ScheduleTimeline() {
  const [variant, setVariant] = useState<Variant>("vulnerable")
  const current = TIMELINE[variant]
  return (
    <figure className={styles.timeline}>
      <div className={styles.timelineBar}>
        <figcaption className={styles.timelineCaption}>
          같은 schedule · 두 구현
          <span className={styles.timelineId}>concurrent-assign · request 42</span>
        </figcaption>
        <div className={styles.toggle} role="group" aria-label="구현 선택">
          {(["vulnerable", "fixed"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={variant === key}
              data-variant={key}
              onClick={() => setVariant(key)}
            >
              {key === "vulnerable" ? "Vulnerable" : "Fixed"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.lanes} data-variant={variant}>
        <div className={styles.grid}>
          <div className={styles.axis} aria-hidden="true">
            <span />
            {current.steps.map((_, i) => (
              <span key={i}>t{i + 1}</span>
            ))}
            <span>SQL check</span>
          </div>
          {(["w1", "w2"] as const).map((worker) => (
            <div key={worker} className={styles.lane}>
              <span className={styles.worker}>{worker}</span>
              {current.steps.map((step, i) =>
                step.worker === worker ? (
                  <span key={i} className={styles.event} data-tone={step.tone ?? "read"}>
                    <span className="sr-only">t{i + 1}: </span>
                    {step.text}
                  </span>
                ) : (
                  <span key={i} className={styles.idle} aria-hidden="true" />
                ),
              )}
              {worker === "w1" ? (
                <span
                  className={styles.verdict}
                  data-pass={current.pass ? "" : undefined}
                  aria-live="polite"
                >
                  <strong>{current.pass ? "PASS" : "FAIL"}</strong>
                  {current.result}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <p className={styles.timelineNote}>
        저장된 해제 순서는 같습니다. 수정한 구현은 첫 읽기에서 행을 잠그기 때문에 w2가 기다리고, 그
        사이 w1이 기록을 끝냅니다.
      </p>
    </figure>
  )
}

const REPORT = `## weavegate: FAIL (WG001)
scenario: concurrent-assign | schedules explored: 1 | violating: sch_7dcb74b1e506
assertion: active-assignment-is-unique
flaky: false (repeat=20)
error[WG001]: invariant violated under a controlled schedule
  observed:  active-assignment-is-unique returned 1 row: active_assignment_count=2 project_request_id=42`

const ORACLE = `SELECT project_request_id, COUNT(*) AS active_assignment_count
FROM assignment
WHERE status = 'ACTIVE'
GROUP BY project_request_id
HAVING COUNT(*) > 1;          -- expect_rows: 0`

const REPLAY = `weavegate run --config fixtures/matching-slice/.weavegate/config.yaml \\
  --scenario concurrent-assign --variant fixed \\
  --replay sch_7dcb74b1e506 --repeat 20`

const CI = [
  { step: "Code Change", note: "트랜잭션 코드 수정" },
  { step: "Pull Request", note: "PR 생성" },
  { step: "Automatic Replay", note: "저장된 schedule 재실행" },
  { step: "SQL Check", note: "상태 규칙 판정" },
  { step: "Result", note: "종료 코드 + PR 진단 댓글" },
  { step: "Re-run after Fix", note: "같은 schedule로 재검증" },
]

export function Weavegate() {
  return (
    <>
      <ProjectHeader
        id="weavegate"
        title="운영 중 발생한 DB 오류를 같은 조건으로 재현하고 변경 결과까지 검증"
        message="개발자가 반복하던 오류 재현과 수정 확인을 코드 변경 과정에서 자동으로 수행하는 검증 절차로 만들었습니다."
        meta={[
          { label: "Period", value: "2026.06–10" },
          { label: "Role", value: "단독 기획·설계·개발" },
          { label: "Context", value: "2026 오픈소스 개발자 대회" },
          { label: "Stack", value: "Go · SQL · MySQL 8.4/InnoDB" },
          { label: "CI", value: "GitHub Actions" },
        ]}
        repo={{ href: LINKS.weavegate.repo, label: "weavegate/weavegate" }}
        metrics={[
          { value: "20 / 20", label: "취약 구현에서 같은 오류 재현", tone: "fail" },
          { value: "20 / 20", label: "수정 후 같은 조건에서 정상 동작", tone: "pass" },
          { value: "8.78 s", label: "두 구현 40회 초기화·재실행 (컨테이너 기동 제외)" },
        ]}
      />

      <Block
        n={1}
        kicker="PROBLEM"
        title="같은 오류를 다시 만들 수 있어야 수정도 확인할 수 있습니다"
        lead="특정 실행 순서에서만 발생하는 DB 오류는 일반 반복 테스트로는 발생 시점을 통제하기 어렵습니다. 개발자가 요청 순서를 손으로 맞춰 오류를 만들고, 수정한 뒤 다시 확인하는 일도 매번 반복됩니다. 이 과정을 하나의 도구로 묶었습니다."
      >
        <ol className={styles.chain}>
          {[
            "실행 순서 지정",
            "오류 재현",
            "SQL 상태 판정",
            "증거 저장",
            "수정",
            "같은 조건 재실행",
          ].map((step, i) => (
            <li key={step} data-loop={i === 5 ? "" : undefined}>
              <span className={styles.chainNum}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Block>

      <Block
        n={2}
        kicker="VERIFICATION FLOW"
        title="실행 순서를 통제하고, 결과 상태를 SQL로 판정합니다"
        lead="단계를 선택하면 각 단계가 하는 일을 볼 수 있습니다. 검증 예제는 매칭 서비스의 배정 흐름(matching-slice)입니다."
        tone="surface"
      >
        <Explorer steps={FLOW} label="검증 흐름 단계" />
      </Block>

      <Block
        n={3}
        kicker="ON FAILURE"
        title="실패했다는 사실보다 같은 오류를 다시 실행할 수 있는 정보를 남겼습니다"
        lead="취약 구현을 실행하면 SQL 규칙이 위반 행을 돌려주고, 다음 네 가지가 함께 저장됩니다."
      >
        <div className={styles.evidence}>
          <figure className={styles.report}>
            <figcaption>report.md · 실제 출력 발췌 (quickstart)</figcaption>
            <pre tabIndex={0}>
              <code>{REPORT}</code>
            </pre>
          </figure>
          <ul className={styles.package}>
            <li>
              <span className={styles.file}>schedule.json</span>
              <strong>실행 schedule</strong>
              <span>w1·w2를 어느 지점에서 어떤 순서로 풀었는지 4단계로 기록</span>
            </li>
            <li>
              <span className={styles.file}>trace.json</span>
              <strong>단계별 trace</strong>
              <span>요청한 해제 순서와 실제로 일어난 해제·대기·종료를 순서대로 기록</span>
            </li>
            <li>
              <span className={styles.file}>observation.json</span>
              <strong>위반 데이터</strong>
              <span>project_request_id=42, active_assignment_count=2</span>
            </li>
            <li>
              <span className={styles.file}>--replay</span>
              <strong>재현 command</strong>
              <span>schedule ID 하나로 같은 실행 순서를 다시 지정</span>
            </li>
          </ul>
        </div>
        <details className={styles.more}>
          <summary>판정에 쓴 SQL 규칙과 재현 명령 보기</summary>
          <div className={styles.moreBody}>
            <figure>
              <figcaption>oracle · active-assignment-is-unique</figcaption>
              <pre tabIndex={0}>
                <code>{ORACLE}</code>
              </pre>
            </figure>
            <figure>
              <figcaption>수정한 구현에 같은 schedule을 20회 재실행</figcaption>
              <pre tabIndex={0}>
                <code>{REPLAY}</code>
              </pre>
            </figure>
          </div>
        </details>
      </Block>

      <Block
        n={4}
        kicker="BEFORE / AFTER"
        title="수정 전과 후를 같은 실행 조건으로 비교했습니다"
        lead="같은 schedule, 같은 schema와 seed, 같은 MySQL 8.4 이미지에서 두 구현을 각각 20회 실행했습니다. 실행마다 DB를 초기화하고 결과 지문을 비교해 20회 모두 같은 결과가 나왔는지(flaky=false)도 확인했습니다."
        tone="surface"
      >
        <div className={styles.compare}>
          <div className={styles.side} data-tone="fail">
            <p className={styles.sideLabel}>VULNERABLE</p>
            <p className={styles.sideValue}>20 / 20</p>
            <p className={styles.sideState}>ERROR</p>
            <p className={styles.sideNote}>매 실행 요청 42에 ACTIVE 배정 2건 · 종료 코드 2</p>
          </div>
          <div className={styles.fix} aria-hidden="true">
            <span>fix</span>
            <span className={styles.fixArrow}>→</span>
            <span className={styles.fixWhat}>읽기를 FOR UPDATE로 잠금</span>
          </div>
          <div className={styles.side} data-tone="pass">
            <p className={styles.sideLabel}>CHANGED</p>
            <p className={styles.sideValue}>20 / 20</p>
            <p className={styles.sideState}>NORMAL</p>
            <p className={styles.sideNote}>
              매 실행 배정 1건 · 20회 모두 InnoDB 행 잠금 대기 관측 · 종료 코드 0
            </p>
          </div>
        </div>
        <ScheduleTimeline />
        <p className={styles.source}>
          근거:{" "}
          <a href={LINKS.weavegate.determinism} target="_blank" rel="noreferrer">
            docs/experiments/determinism.md
            <span className="sr-only"> (새 창)</span>
          </a>{" "}
          · 이 결과는 기록한 schedule과 같은 fixture 조건에서의 반복성을 보여 줍니다.
        </p>
      </Block>

      <Block
        n={5}
        kicker="CI"
        title="코드 변경마다 같은 검증이 실행되도록 PR 단계에 연결합니다"
        lead="GitHub Actions에서 발행된 CLI를 설치하고, 저장된 schedule을 다시 실행해 판정과 증거를 PR에 남기는 흐름입니다."
      >
        <ol className={styles.ci}>
          {CI.map((item, i) => (
            <li key={item.step}>
              <span className={styles.ciNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.ciStep}>{item.step}</span>
              <span className={styles.ciNote}>{item.note}</span>
            </li>
          ))}
        </ol>
        <dl className={styles.status}>
          <div>
            <dt>동작</dt>
            <dd>
              재사용 GitHub Action, 종료 코드 기반 gate, report 업로드, PR 진단 댓글 · Go 레퍼런스
              서비스로 실행
            </dd>
          </div>
          <div>
            <dt>개발 중</dt>
            <dd>
              Java SDK로 Spring Boot 서비스의 트랜잭션을 같은 방식으로 실행하는 연결 (
              <a href={LINKS.weavegate.javaSdk} target="_blank" rel="noreferrer">
                external SUT · Java
                <span className="sr-only"> (새 창)</span>
              </a>
              )
            </dd>
          </div>
        </dl>
        <Takeaway>
          오류 재현을 일회성 디버깅에서 코드 변경마다 반복할 수 있는 검증으로 옮겼습니다.
        </Takeaway>
      </Block>

      <Pager id="weavegate" />
    </>
  )
}

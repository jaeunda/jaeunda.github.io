import {
  Decisions,
  Ext,
  Figure,
  Pager,
  ProjectHeader,
  Apply,
  Section,
  ko,
} from "../components/Page"
import { LINKS } from "../data/links"
import styles from "./Weavegate.module.css"

// Every figure on this page comes from the weavegate repository at the commit
// pinned in data/links.ts: docs/experiments/{baseline-comparison,
// spring-replay,exploration,gate-run-time}.md, the spring-matching fixture
// and the spring-boot-adoption-example README.

type Step = { who: "A" | "B" | "DB"; text: string; code?: string; tone?: "fail" | "pass" | "hold" }

const VULNERABLE: Step[] = [
  { who: "A", text: "요청 42가 활성 상태인지 조회", code: "SELECT … WHERE id = 42" },
  { who: "B", text: "같은 요청을 조회", code: "SELECT … WHERE id = 42" },
  { who: "A", text: "활성 배정 수 0 → 배정 추가", code: "INSERT assignment" },
  { who: "B", text: "B가 조회한 배정 수도 0 → 배정 추가", code: "INSERT assignment" },
  { who: "DB", text: "요청 42의 활성 배정 2건", code: "active_assignment_count = 2", tone: "fail" },
]

const FIXED: Step[] = [
  { who: "A", text: "요청 행을 잠그고 조회", code: "SELECT … FOR UPDATE" },
  { who: "B", text: "같은 행의 잠금 해제를 대기", code: "SELECT … FOR UPDATE", tone: "hold" },
  { who: "A", text: "활성 배정 수 0 → 배정 추가 후 커밋", code: "INSERT · COMMIT" },
  { who: "B", text: "잠금 획득 후 배정 수 1 → 추가 안 함", code: "COUNT = 1 → return" },
  { who: "DB", text: "요청 42의 활성 배정 1건", code: "expect_rows: 0 충족", tone: "pass" },
]

function Sequence({
  title,
  verdict,
  tone,
  steps,
}: {
  title: string
  verdict: string
  tone: "fail" | "pass"
  steps: Step[]
}) {
  return (
    <div className={styles.seq} data-tone={tone}>
      <div className={styles.seqHead}>
        <span className={styles.seqTitle}>{title}</span>
        <span className={styles.seqVerdict}>{verdict}</span>
      </div>
      <div className={styles.lanes} aria-hidden="true">
        <span>요청 A</span>
        <span>MySQL</span>
        <span>요청 B</span>
      </div>
      <ol className={styles.seqSteps}>
        {steps.map((step, i) => (
          <li key={i} data-who={step.who} data-tone={step.tone}>
            <span className={styles.seqWho}>{step.who === "DB" ? "결과" : `요청 ${step.who}`}</span>
            <span className={styles.seqText}>{step.text}</span>
            {step.code && (
              <code className={styles.seqCode} data-ko={ko(step.code)}>
                {step.code}
              </code>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

const FLOW = [
  {
    k: "Declare",
    title: "검증 조건 선언",
    body: "스키마, 초기 데이터, SQL 불변식을 설정 파일 하나에 정의합니다.",
    code: "expect_rows: 0",
  },
  {
    k: "Orchestrate",
    title: "실행 순서 제어",
    body: "코드에 지정한 지점에서 요청을 멈추고, 정한 순서대로 다시 실행합니다.",
    code: "after_read_request → before_insert_assignment",
  },
  {
    k: "Execute",
    title: "실제 MySQL에서 실행",
    body: "실행할 때마다 DB를 초기화하고, 요청마다 별도 연결로 실행합니다.",
    code: "mysql:8.4 · InnoDB · REPEATABLE READ",
  },
  {
    k: "Judge",
    title: "SQL 조건으로 판정",
    body: "실행이 끝난 DB에 SQL을 실행해 위반 데이터를 찾습니다.",
    code: "WG001 · active-assignment-is-unique",
  },
  {
    k: "Gate",
    title: "기록 보존과 CI 차단",
    body: "재현 명령과 실행 기록을 저장하고, 종료 코드로 CI 작업을 실패시킵니다.",
    code: "exit 2 → CI 실패 · PR 코멘트",
  },
]

const SQL = `SELECT project_request_id,
       COUNT(*) AS active_assignment_count
FROM assignment
WHERE status = 'ACTIVE'
GROUP BY project_request_id
HAVING COUNT(*) > 1;   -- expect_rows: 0`

const LOG = `$ weavegate run --config fixtures/spring-matching/.weavegate/config.yaml \\
    --scenario concurrent-assign --variant vulnerable \\
    --replay fixtures/spring-matching/schedules/concurrent-assign.json
## weavegate: FAIL (WG001)
flaky: false (repeat=20)
replay: weavegate run … --replay sch_7dcb74b1e506 --repeat 20
  observed:  active-assignment-is-unique returned 1 row:
             active_assignment_count=2 project_request_id=42
  evidence:  schedule sch_7dcb74b1e506 · trace.json · observation.json · 1 violating row
$ echo $?
2`

// Detection counts per invocation. Development host: one `-count=3` run.
// GitHub-hosted runner: five independent smoke runs, newest first.
const BASELINE = [
  {
    arm: "동시 실행",
    note: "두 요청을 함께 시작",
    dev: [100, 100, 100],
    ci: [100, 100, 98, 100, 99],
  },
  {
    arm: "2ms 지연 삽입",
    note: "저장 직전 2ms 대기",
    dev: [100, 100, 100],
    ci: [100, 100, 100, 100, 100],
  },
  {
    arm: "2ms 간격 시작",
    note: "B를 2ms 늦게 시작",
    dev: [100, 100, 100],
    ci: [35, 62, 36, 52, 27],
  },
  { arm: "20ms 간격 시작", note: "B를 20ms 늦게 시작", dev: [0, 0, 0], ci: [0, 0, 0, 1, 1] },
  { arm: "100ms 간격 시작", note: "B를 100ms 늦게 시작", dev: [0, 0, 0], ci: [0, 0, 0, 0, 0] },
  { arm: "직렬 실행 (대조군)", note: "A가 끝난 뒤 B 시작", dev: [0, 0, 0], ci: [0, 0, 0, 0, 0] },
]

function Bars({ values, of }: { values: number[]; of: number }) {
  return (
    <span className={styles.bars}>
      {values.map((v, i) => (
        <span key={i} className={styles.bar} title={`${v}/${of}`}>
          <span className={styles.barFill} style={{ height: `${(v / of) * 100}%` }} />
          <span className={styles.barValue}>{v}</span>
        </span>
      ))}
    </span>
  )
}

const ADOPTION = [
  { commit: "563b05d", code: "취약 코드 · 탐색 작업만", gate: "FAIL · WG001", tone: "fail" },
  {
    commit: "df6e07d",
    code: "취약 코드 · 실행 순서 추가",
    gate: "두 작업 모두 FAIL",
    tone: "fail",
  },
  { commit: "8950c8a", code: "좌석 행 FOR UPDATE", gate: "두 작업 모두 PASS", tone: "pass" },
]

export function Weavegate() {
  return (
    <>
      <ProjectHeader
        id="weavegate"
        title="DB 동시성 오류의 | 재현, 판정, 배포 차단을 / 자동화한 검증 도구"
        lead="동시 요청으로 데이터가 중복 저장되는 오류를 같은 실행 순서로 재현하고, SQL 조건으로 판정한 결과를 GitHub Actions의 통과·실패로 연결했습니다."
        status={[
          { tone: "pass", label: "v0.2.0 릴리스" },
          { tone: "pass", label: "GitHub Marketplace 출시" },
          { tone: "plain", label: "Java 연동 라이브러리 Maven Central 배포" },
        ]}
        results={[
          {
            value: "20/20 → 20/20",
            label: "같은 실행 순서에서 취약 코드는 실패, 수정 코드는 통과",
            scope: "Spring Boot, 반복마다 DB 초기화",
            tone: "pass",
          },
          {
            value: "27–62 / 100",
            label: "대기 시간 조정 방식의 재현 횟수",
            scope: "GitHub 러너 5회 · 개발 PC에서는 100/100",
            tone: "hold",
          },
          {
            value: "85–129초",
            label: "PR 1건의 CI 검증 시간",
            scope: "Spring Boot 예제, ubuntu-latest",
          },
        ]}
        facts={[
          { label: "기간", value: "2026.07 – 진행 중" },
          { label: "역할", value: "개인 프로젝트" },
          { label: "스택", value: "Go · MySQL 8.4 · Java · Spring Boot · GitHub Actions" },
        ]}
        refs={[
          { label: "GitHub", href: LINKS.weavegate.repo },
          { label: "Marketplace", href: LINKS.weavegate.marketplace },
          { label: "적용 예제", href: LINKS.weavegate.adoption },
        ]}
      />

      <Section
        n={1}
        kicker="문제"
        title="두 요청이 서로의 커밋 전에 조회하면, / 배정 데이터가 두 건 저장됩니다"
      >
        <Figure
          label="취약 코드와 수정 코드의 실행 순서"
          caption={
            <>
              같은 실행 순서에서 두 코드의 판정 차이는 <code>FOR UPDATE</code> 한 줄에서 생깁니다.
            </>
          }
        >
          <div className={styles.seqPair}>
            <Sequence title="취약 코드" verdict="FAIL · WG001" tone="fail" steps={VULNERABLE} />
            <Sequence title="수정 코드 · FOR UPDATE" verdict="PASS" tone="pass" steps={FIXED} />
          </div>
        </Figure>
      </Section>

      <Section
        n={2}
        kicker="해결 과정"
        title="실행 순서는 코드로 고정하고, / 결과는 DB 최종 상태로 판정합니다"
        tone="surface"
      >
        <ol className={styles.flow}>
          {FLOW.map((step, i) => (
            <li key={step.k}>
              <span className={styles.flowIndex}>
                {String(i + 1).padStart(2, "0")} <span>{step.k}</span>
              </span>
              <h3 className={styles.flowTitle}>{step.title}</h3>
              <p className={styles.flowBody}>{step.body}</p>
              <code className={styles.flowCode} data-ko={ko(step.code)}>
                {step.code}
              </code>
            </li>
          ))}
        </ol>

        <div className={styles.codePair}>
          <figure className={styles.code}>
            <figcaption>판정 기준 · SQL 불변식</figcaption>
            <pre>{SQL}</pre>
          </figure>
          <figure className={styles.code} data-tone="fail">
            <figcaption>실제 출력 · 취약 코드 20회 재실행</figcaption>
            <pre>{LOG}</pre>
          </figure>
        </div>
      </Section>

      <Section
        n={3}
        kicker="설계 판단"
        title="재현 조건을 대기 시간이 아닌 / 실행 순서로 정했습니다"
      >
        <Decisions
          items={[
            {
              title: "대기 시간 대신 실행 순서를 저장",
              body: "대기 시간을 넣어 두 요청을 겹치게 하면 서버 부하에 따라 결과가 달라집니다. 실행 순서를 파일로 저장해 그대로 다시 실행합니다.",
            },
            {
              title: "판정은 SQL 조건으로",
              body: "실행이 끝난 DB 데이터를 SQL로 조회해 판정합니다. Go 코드와 Spring Boot 코드에 같은 기준을 적용합니다.",
            },
            {
              title: "결과를 종료 코드로 구분",
              body: "위반은 exit 2, 반복 결과가 일치하지 않으면 exit 3으로 구분해 CI가 바로 판단합니다.",
            },
          ]}
        />
      </Section>

      <Section
        n={4}
        kicker="검증 결과"
        title="대기 시간 조정은 | 환경마다 결과가 달랐고, / 저장한 실행 순서는 | 모든 환경에서 같았습니다"
        tone="surface"
      >
        <Figure
          label="오류 유도 방법별 위반 탐지 횟수"
          caption="막대 하나는 100회 반복 결과입니다. 직렬 실행에서 0회이므로 이 오류는 두 요청이 겹칠 때만 발생합니다."
        >
          <div className={styles.matrix} role="table" aria-label="방법별 위반 탐지 횟수 (100회 중)">
            <div className={styles.matrixHead} role="row">
              <span role="columnheader">유도 방법</span>
              <span role="columnheader">개발 PC · 3회</span>
              <span role="columnheader">GitHub 러너 · 5회</span>
            </div>
            {BASELINE.map((row) => (
              <div key={row.arm} className={styles.matrixRow} role="row">
                <span role="rowheader" className={styles.arm}>
                  {row.arm}
                  <small>{row.note}</small>
                </span>
                <span role="cell">
                  <Bars values={row.dev} of={100} />
                </span>
                <span role="cell">
                  <Bars values={row.ci} of={100} />
                </span>
              </div>
            ))}
            <div className={`${styles.matrixRow} ${styles.matrixSaved}`} role="row">
              <span role="rowheader" className={styles.arm}>
                저장한 실행 순서 재실행
                <small>weavegate가 순서를 고정</small>
              </span>
              <span role="cell" className={styles.saved}>
                20/20 · 20/20 · 20/20
              </span>
              <span role="cell" className={styles.saved}>
                20/20 × 5회
              </span>
            </div>
          </div>
        </Figure>

        <div className={styles.proof}>
          <div className={styles.pairCard}>
            <h3 className={styles.pairTitle}>같은 실행 순서에서 코드만 바꾼 결과</h3>
            <div className={styles.pairRow}>
              <span className={styles.pairSide} data-tone="fail">
                <b>취약 코드</b>
                <span className={styles.pairNum}>20/20 위반</span>
                <span>WG001 · exit 2</span>
              </span>
              <span className={styles.pairMid}>
                같은 실행 순서
                <code>sch_7dcb74b1e506</code>
                같은 데이터·같은 SQL
              </span>
              <span className={styles.pairSide} data-tone="pass">
                <b>수정 코드</b>
                <span className={styles.pairNum}>20/20 통과</span>
                <span>PASS · exit 0</span>
              </span>
            </div>
            <ul className={styles.pairPoints}>
              <li>판정이 실패에서 통과로 바뀐 원인은 FOR UPDATE 수정입니다.</li>
              <li>40회 모두 예상한 판정이 나왔습니다(flaky=false).</li>
            </ul>
          </div>

          <div className={styles.pairCard}>
            <h3 className={styles.pairTitle}>다른 저장소에 적용한 결과</h3>
            <p className={styles.pairLead}>
              Spring Boot 좌석 예약 서비스에서 수정 전 커밋은 CI에서 실패했고, 수정 커밋부터
              통과했습니다.
            </p>
            <ol className={styles.commits}>
              {ADOPTION.map((row) => (
                <li key={row.commit} data-tone={row.tone}>
                  <code>{row.commit}</code>
                  <span>{row.code}</span>
                  <b>{row.gate}</b>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section
        n={5}
        kicker="실무 적용"
        title="Spring Boot 서비스의 | PR 검증 단계에 추가해 / 동시성 오류의 재발을 막습니다"
      >
        <Apply
          steps={[
            {
              title: "검증 지점과 조건 선언",
              body: "트랜잭션 코드에 검증 지점을 표시하고, 지켜야 할 데이터 조건을 SQL로 작성합니다.",
            },
            {
              title: "GitHub Actions에 추가",
              body: "Marketplace의 weavegate gate를 워크플로 한 단계로 추가합니다.",
            },
            {
              title: "PR마다 자동 검증",
              body: "저장한 실행 순서를 다시 실행하고, 위반이 있으면 머지 전에 작업을 실패시킵니다.",
            },
            {
              title: "실패 기록으로 바로 재현",
              body: "실행 순서, 위반 데이터, 재현 명령이 아티팩트와 PR 코멘트로 남습니다.",
            },
          ]}
          target="재고 차감, 예약, 중복 신청처럼 데이터를 조회한 뒤 판단해 저장하는 트랜잭션"
        />
        <ul className={styles.docs}>
          <li>
            <Ext href={LINKS.weavegate.baseline}>방법별 탐지 비교 ↗</Ext>
          </li>
          <li>
            <Ext href={LINKS.weavegate.spring}>Spring Boot 반복 검증 ↗</Ext>
          </li>
          <li>
            <Ext href={LINKS.weavegate.gateTime}>CI 검증 시간 ↗</Ext>
          </li>
        </ul>
      </Section>

      <Pager id="weavegate" />
    </>
  )
}

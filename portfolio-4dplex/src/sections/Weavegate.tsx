import type { CSSProperties } from "react"
import { Block, Ext, Note, Section } from "../components/Section"
import { StepExplorer, type Step } from "../components/StepExplorer"
import { Detail } from "../components/Detail"
import { Tabs } from "../components/Tabs"
import { CodeBlock } from "../components/CodeBlock"
import { EXCERPTS } from "../data/excerpts"
import { LINKS } from "../data/links"
import u from "./shared.module.css"
import s from "./Weavegate.module.css"

const PIPELINE: Step[] = [
  {
    id: "pr",
    label: "Pull Request",
    title: "코드 변경이 검증을 시작",
    detail: (
      <Detail
        lead="코드가 바뀔 때마다 같은 검증이 자동으로 실행됩니다."
        points={[
          <>
            <code>pull_request</code> 이벤트에서 워크플로가 실행됩니다.
          </>,
          "개발자가 따로 기억해서 돌릴 필요가 없습니다. 검증을 통과해야 변경을 합칠 수 있습니다.",
        ]}
      />
    ),
  },
  {
    id: "actions",
    label: "GitHub Actions",
    title: "증거를 보존한 뒤 통과 여부를 결정",
    detail: (
      <Detail
        lead="저장소에 포함한 action이 도구를 설치해 실행하고, 결과를 먼저 보존한 다음 종료 코드로 통과 여부를 정합니다."
        points={[
          "릴리스 바이너리를 체크섬으로 확인한 뒤 실행합니다.",
          "실행 결과를 artifact로 올리고 job summary를 작성합니다.",
          "종료 코드가 0이고 PASS 리포트가 완전하며 업로드까지 성공해야 통과합니다.",
        ]}
      />
    ),
  },
  {
    id: "db",
    label: "Testcontainers",
    title: "실제 MySQL 8.4를 같은 상태로 준비",
    sub: "MySQL 8.4 / InnoDB",
    detail: (
      <Detail
        lead="실제 MySQL 8.4 컨테이너에서 실행하고, 실행할 때마다 같은 상태에서 시작합니다."
        points={[
          "Testcontainers로 MySQL 8.4 컨테이너를 띄웁니다.",
          "매 실행 전에 같은 스키마와 초기 데이터를 다시 적용합니다.",
          "환경이 같으면 결과가 달라졌을 때 원인을 코드에서 찾을 수 있습니다.",
        ]}
      />
    ),
  },
  {
    id: "target",
    label: "Target Application",
    title: "읽고 판단한 뒤 쓰는 트랜잭션 흐름",
    sub: "Go 레퍼런스 구현, Spring Boot 연동",
    detail: (
      <Detail
        lead="검증 대상은 데이터를 읽고 그 값으로 판단한 뒤 쓰는 트랜잭션 흐름입니다."
        points={[
          "아래 측정 결과는 저장소에 포함된 레퍼런스 시나리오에서 얻었습니다. 두 worker가 같은 요청을 동시에 배정하는 흐름이며 취약한 구현과 수정한 구현을 함께 둡니다.",
          "Spring Boot 애플리케이션은 Java SDK로 연결합니다. 테스트에서만 켜지는 동기화 지점을 Spring 트랜잭션 구간에 두고, MySQL 8.4에서 SDK 인수 시험을 통과했습니다.",
          "CLI에서 Spring 대상을 선택하는 통합은 진행 중입니다.",
        ]}
        facts={[
          {
            k: "근거",
            v: <Ext href={LINKS.weavegate.javaSdk}>Java Spring peer 문서</Ext>,
          },
        ]}
      />
    ),
  },
  {
    id: "sync",
    label: "Synchronization Points",
    title: "트랜잭션 실행 순서를 직접 제어",
    sub: "Transaction Execution Control",
    detail: (
      <Detail
        lead="트랜잭션 안에 이름을 붙인 지점을 두고, worker를 그 지점에 세웠다가 정해진 순서대로 하나씩 진행시킵니다."
        points={[
          <>
            레퍼런스 시나리오의 지점은 <code>after_read_request</code>와{" "}
            <code>before_insert_assignment</code>입니다.
          </>,
          "sleep이나 요청 간 시간차를 쓰지 않으므로 같은 순서를 매번 똑같이 만들 수 있습니다.",
          "잠금을 기다리느라 다음 지점에 오지 못하는 worker는 시간 초과 뒤 대기 상태로 기록하고 다음 단계로 진행합니다.",
        ]}
      />
    ),
  },
  {
    id: "invariant",
    label: "SQL Invariants",
    title: "지켜야 할 데이터 상태로 자동 판정",
    sub: "Automatic Pass / Fail",
    detail: (
      <Detail
        lead="서비스가 반드시 지켜야 할 데이터 상태를 SQL 조건으로 선언하면 도구가 실행 결과를 판정합니다."
        points={[
          "조건을 어긴 행을 찾는 쿼리를 적어 둡니다. 쿼리가 행을 반환하면 위반입니다.",
          "판정 기준이 SQL로 고정되어 있어 누가 언제 실행해도 같은 결과가 나옵니다.",
        ]}
      />
    ),
  },
  {
    id: "evidence",
    label: "Evidence",
    title: "실패한 실행을 그대로 저장",
    sub: "Schedule / Trace / Violated Data",
    detail: (
      <Detail
        lead="어떤 순서에서 어떤 데이터가 어긋났는지를 파일로 남깁니다."
        points={[
          "실행 순서(schedule)",
          "단계별 기록(trace)",
          "조건을 어긴 데이터(violating rows)",
          "리포트와 종료 코드",
        ]}
      />
    ),
  },
  {
    id: "replay",
    label: "Replay",
    title: "같은 조건으로 다시 실행",
    detail: (
      <Detail
        lead="저장된 순서를 지정해 다시 실행합니다. 수정한 코드가 그 순서에서도 조건을 지키는지 확인합니다."
        points={[
          <>
            <code>--replay</code>에 저장된 순서를, <code>--repeat</code>에 반복 횟수를 지정합니다.
          </>,
          "같은 순서를 여러 번 실행했을 때 결과가 서로 다르면 불안정(flaky)으로 판정하고 종료 코드 3으로 실패합니다.",
        ]}
      />
    ),
  },
]

const PROCESS = [
  { k: "코드 변경", d: "Pull Request 생성" },
  { k: "자동 검증", d: "저장된 실행 순서를 다시 실행" },
  { k: "위반 시 증거", d: "순서와 위반 데이터, 재현 명령" },
  { k: "수정", d: "같은 순서로 통과 확인" },
  { k: "병합", d: "검증을 통과한 변경만" },
]

const AUTOMATION = [
  {
    k: "Every Push",
    t: "변경마다 실제 DB에서 전체 시험",
    d: "push와 Pull Request마다 GitHub Actions가 MySQL 8.4 컨테이너를 띄워 재현과 판정, 재실행 시험을 모두 실행합니다. race 검사와 lint, 문서 링크 검사도 함께 돕니다.",
  },
  {
    k: "Gate Self-Test",
    t: "게이트가 제대로 막는지도 매번 확인",
    d: "발행된 릴리스를 취약한 구현과 수정한 구현에 각각 실행합니다. 취약한 쪽은 실패하고 수정한 쪽은 통과하는지를 CI가 확인합니다.",
  },
  {
    k: "Release",
    t: "태그 하나로 릴리스 발행",
    d: "태그를 push하면 플랫폼별 바이너리와 체크섬, 빌드 출처 증명이 자동으로 발행됩니다. 2026년 9월에 v0.1.0-alpha를 공개했습니다.",
  },
  {
    k: "Determinism",
    t: "결과가 흔들리면 도구가 먼저 실패",
    d: "같은 순서를 20회 반복해 결과가 하나로 모이는지 확인합니다. 결과가 갈리면 통과로 처리하지 않고 별도의 종료 코드로 알립니다.",
  },
]

const QUICKSTART_FAIL = `$ weavegate run --config fixtures/matching-slice/.weavegate/config.yaml \\
  --scenario concurrent-assign --variant vulnerable
## weavegate: FAIL (WG001)
scenario: concurrent-assign | schedules explored: 1 | violating: sch_7dcb74b1e506
assertion: active-assignment-is-unique
flaky: false (repeat=20)
error[WG001]: invariant violated under a controlled schedule
  observed:  active-assignment-is-unique returned 1 row: active_assignment_count=2 project_request_id=42
$ echo $?
2`

const QUICKSTART_PASS = `$ weavegate run --config fixtures/matching-slice/.weavegate/config.yaml \\
  --scenario concurrent-assign --variant fixed \\
  --replay sch_7dcb74b1e506 --repeat 20
## weavegate: PASS
scenario: concurrent-assign | schedules explored: 0 | replayed: sch_7dcb74b1e506
flaky: false (repeat=20)
$ echo $?
0`

const WORKFLOW = `name: weavegate gate
on: pull_request
permissions:
  contents: read
jobs:
  gate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v7
      - id: weavegate
        uses: weavegate/weavegate@afc6b4fa493602bd64b6401c5bae0c6f7bf108b2
        with:
          version: v0.1.0-alpha
          config: fixtures/matching-slice/.weavegate/config.yaml
          scenario: concurrent-assign
          variant: vulnerable
          replay: sch_ba00582f9632
          artifact-name: weavegate-evidence`

type Row = { step: string; worker: string; state: "release" | "blocked" | "skipped"; what: string }

const VARIANTS: {
  id: string
  label: string
  kicker: string
  verdict: "fail" | "pass"
  verdictText: string
  count: string
  countCap: string
  rows: Row[]
  outcome: string
  extra: string
}[] = [
  {
    id: "vulnerable",
    label: "Vulnerable",
    kicker: "수정 전",
    verdict: "fail",
    verdictText: "FAIL · WG001 · exit 2",
    count: "20 / 20",
    countCap: "20회 모두 상태 위반 재현",
    rows: [
      { step: "01", worker: "w1", state: "release", what: "요청 행을 읽고 통과" },
      {
        step: "02",
        worker: "w2",
        state: "release",
        what: "같은 행을 읽고 통과. 두 worker가 모두 쓰기 전에 읽기를 마침",
      },
      { step: "03", worker: "w1", state: "release", what: "배정을 기록" },
      { step: "04", worker: "w2", state: "release", what: "같은 요청에 배정을 한 번 더 기록" },
    ],
    outcome:
      "요청 42에 활성 배정이 2건 남아 조건을 어깁니다. 조건은 요청 하나에 활성 배정이 하나여야 한다는 것입니다.",
    extra: "저장된 네 단계가 순서 그대로 실행됐습니다.",
  },
  {
    id: "fixed",
    label: "FOR UPDATE Applied",
    kicker: "수정 후",
    verdict: "pass",
    verdictText: "PASS · exit 0",
    count: "0 / 20",
    countCap: "20회 모두 상태 위반 없음",
    rows: [
      { step: "01", worker: "w1", state: "release", what: "요청 행을 잠그고 읽은 뒤 통과" },
      {
        step: "02",
        worker: "w2",
        state: "blocked",
        what: "행 잠금을 기다리느라 지점에 도착하지 못함. 시간 초과 뒤 대기 상태로 기록",
      },
      {
        step: "03",
        worker: "w1",
        state: "release",
        what: "배정을 기록하고 커밋. 잠금이 풀리며 w2의 읽기가 이어짐",
      },
      {
        step: "04",
        worker: "w2",
        state: "skipped",
        what: "이미 배정이 있음을 확인하고 쓰지 않고 종료",
      },
    ],
    outcome: "활성 배정은 1건이고 조건을 어긴 행이 없습니다.",
    extra: "20회 모두에서 InnoDB 행 잠금 대기가 관측됐습니다.",
  },
]

const STATE_LABEL: Record<Row["state"], string> = {
  release: "진행",
  blocked: "잠금 대기",
  skipped: "건너뜀",
}

function Variant({ variant }: { variant: (typeof VARIANTS)[number] }) {
  return (
    <div className={s.variant} data-verdict={variant.verdict}>
      <div className={s.timeline}>
        <p className={s.colK}>같은 저장 순서를 실행한 결과</p>
        <ol className={s.rows}>
          {variant.rows.map((row) => (
            <li key={row.step} data-state={row.state}>
              <span className={s.rowN}>{row.step}</span>
              <span className={s.rowW}>{row.worker}</span>
              <span className={s.rowS}>{STATE_LABEL[row.state]}</span>
              <span className={s.rowT}>{row.what}</span>
            </li>
          ))}
        </ol>
        <p className={s.extra}>{variant.extra}</p>
      </div>
      <div className={s.result}>
        <p className={s.colK}>판정</p>
        <p className={s.verdict}>{variant.verdictText}</p>
        <p className={s.count}>{variant.count}</p>
        <p className={s.countCap}>{variant.countCap}</p>
        <div className={s.dots} role="img" aria-label={`20회 실행: ${variant.countCap}`}>
          {Array.from({ length: 20 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <p className={s.outcome}>{variant.outcome}</p>
      </div>
    </div>
  )
}

const CONTENTS = [
  { id: "problem", label: "문제 정의" },
  { id: "pipeline", label: "자동 검증 절차" },
  { id: "results", label: "검증 결과" },
  { id: "implementation", label: "구현 세부" },
  { id: "automation", label: "개발 과정 자동화" },
]

export function Weavegate() {
  return (
    <Section
      id="verification"
      route="verification"
      tone="surface"
      index="02"
      label="Reproduction & Verification"
      name="weavegate"
      tagline="동시성 오류 검증 자동화 도구"
      contents={CONTENTS}
      keywords={["PROCESS AUTOMATION", "EXECUTION CONTROL", "REPLAYABLE EVIDENCE", "CI GATE"]}
      message="특정 실행 순서에서 발생하는 동시성 오류를 다시 만들고, 수정 결과를 코드 변경 때마다 검증하는 자동화 도구를 개발했습니다."
      meta={[
        { k: "기간", v: "2026.06 – 2026.09" },
        { k: "역할", v: "단독 기획과 설계, 개발 (2026 오픈소스 개발자대회 참가)" },
        { k: "기술", v: "Go, Spring Boot, MySQL / InnoDB, Testcontainers, GitHub Actions" },
        { k: "GitHub", v: <Ext href={LINKS.weavegate.repo}>weavegate/weavegate</Ext> },
      ]}
      fit="특정 조건에서만 나타나는 오류를 같은 조건으로 다시 만들고, 수정 결과를 확인하는 절차를 개발 과정에 자동으로 넣었습니다. 현장 장애의 원인 분석과 검증에 같은 접근을 적용하고자 합니다."
      summary={
        <ul className={u.trio}>
          <li>
            <p className={u.trioK}>What</p>
            <p className={u.trioV}>오류 재현과 수정 검증을 개발 절차에 넣는 자동화 도구</p>
            <p className={u.trioD}>데이터베이스를 사용하는 애플리케이션 코드가 검증 대상입니다.</p>
          </li>
          <li>
            <p className={u.trioK}>Problem</p>
            <p className={u.trioV}>특정 실행 순서에서만 드러나는 오류</p>
            <p className={u.trioD}>
              반복 실행이나 시간차만으로는 같은 조건을 매번 만들기 어렵습니다.
            </p>
          </li>
          <li>
            <p className={u.trioK}>Result</p>
            <p className={u.trioV}>같은 순서에서 수정 전 20/20 위반, 수정 후 0/20</p>
            <p className={u.trioD}>
              40회 반복 실행에 8.78초가 걸려 코드가 바뀔 때마다 다시 실행할 수 있습니다.
            </p>
          </li>
        </ul>
      }
    >
      <Block
        id="problem"
        n={1}
        label="Problem Definition"
        title="발견한 오류를 다시 만들 수 있어야 수정도 검증할 수 있습니다"
        lead="여러 요청이 같은 데이터를 처리할 때 트랜잭션의 실행 순서에 따라 데이터 상태가 잘못 바뀔 수 있습니다. 이 문제를 다루는 데 필요한 세 가지를 도구의 구성 요소로 만들었습니다."
      >
        <ol className={s.needs}>
          <li>
            <p className={s.needN}>1</p>
            <p className={s.needT}>실행 순서를 직접 제어할 수 있을 것</p>
            <p className={s.needTo}>Synchronization Points</p>
          </li>
          <li>
            <p className={s.needN}>2</p>
            <p className={s.needT}>결과가 올바른지 자동으로 판정할 수 있을 것</p>
            <p className={s.needTo}>SQL Invariants</p>
          </li>
          <li>
            <p className={s.needN}>3</p>
            <p className={s.needT}>실패한 실행을 같은 조건으로 다시 만들 수 있을 것</p>
            <p className={s.needTo}>Evidence · Replay</p>
          </li>
        </ol>
      </Block>

      <Block
        id="pipeline"
        n={2}
        label="Verification Pipeline"
        title="코드가 바뀔 때마다 같은 오류 조건을 자동으로 다시 실행합니다"
        lead="오류를 재현하고 수정을 확인하는 일을 개발 절차 안으로 옮겼습니다. Pull Request를 열면 저장된 실행 순서가 다시 실행되고, 검증을 통과한 변경만 병합됩니다."
        hint="단계를 선택하면 그 단계의 구현 방식이 표시됩니다."
      >
        <ol className={s.process} aria-label="개발 절차">
          {PROCESS.map((step) => (
            <li key={step.k}>
              <b>{step.k}</b>
              <span>{step.d}</span>
            </li>
          ))}
        </ol>
        <StepExplorer
          label="weavegate 검증 파이프라인"
          layout="rail"
          steps={PIPELINE}
          initial="sync"
        />
      </Block>

      <Block
        id="results"
        n={3}
        label="Results"
        title="같은 순서에서 수정 전에는 매번 실패하고 수정 후에는 매번 통과했습니다"
        lead="레퍼런스 시나리오의 저장된 실행 순서 하나를 취약한 구현과 수정한 구현에 각각 20회씩 실행했습니다."
      >
        <div className={s.headline}>
          <div className={s.side} data-verdict="fail">
            <p className={s.sideK}>Vulnerable Implementation</p>
            <p className={s.sideN}>20 / 20</p>
            <p className={s.sideD}>State violations reproduced</p>
          </div>
          <p className={s.fix}>
            <i aria-hidden="true" />
            <span>FOR UPDATE</span>
          </p>
          <div className={s.side} data-verdict="pass">
            <p className={s.sideK}>Fixed Implementation</p>
            <p className={s.sideN}>0 / 20</p>
            <p className={s.sideD}>State violations</p>
          </div>
        </div>

        <div className={s.compare}>
          <p className={s.compareK}>
            <span>Failure vs Fixed</span>
            구현을 선택해 같은 조건에서 나온 결과를 비교할 수 있습니다.
          </p>
          <Tabs
            label="구현 선택"
            variant="segmented"
            items={VARIANTS.map((variant) => ({
              id: variant.id,
              kicker: variant.kicker,
              label: variant.label,
              content: <Variant variant={variant} />,
            }))}
          />
          <ol className={s.method} aria-label="검증 방식">
            <li>동일 조건 재실행</li>
            <li>결과 비교</li>
            <li>수정 효과 확인</li>
          </ol>
        </div>

        <ul className={s.perf} style={{ "--cols": 3 } as CSSProperties}>
          <li>
            <p className={s.perfN}>40</p>
            <p className={s.perfK}>Runs</p>
            <p className={s.perfD}>두 구현에 각 20회</p>
          </li>
          <li>
            <p className={s.perfN}>8.78s</p>
            <p className={s.perfK}>Total</p>
            <p className={s.perfD}>실행마다 하는 DB 초기화 포함, 컨테이너 기동 제외</p>
          </li>
          <li>
            <p className={s.perfN}>~220ms</p>
            <p className={s.perfK}>/ Run</p>
            <p className={s.perfD}>로컬 Docker의 MySQL 8.4에서 측정</p>
          </li>
        </ul>

        <Note label="검증 범위">
          레퍼런스 시나리오 하나와 저장된 실행 순서 하나에서 얻은 결과입니다. 모든 동시성 오류에
          대한 검출률이나 시스템 전체의 무결성을 뜻하지 않습니다. 이 도구는 지정한 지점 사이의 실행
          순서와 선언한 조건만 확인합니다. <Ext href={LINKS.weavegate.determinism}>실험 기록</Ext>
        </Note>
      </Block>

      <Block
        id="implementation"
        n={4}
        label="Implementation Details"
        title="실제 설정과 출력으로 보는 네 가지 구현"
        lead="공개 저장소의 설정 파일과 문서에 있는 내용을 그대로 옮겼습니다."
      >
        <Tabs
          label="구현 세부"
          items={[
            {
              id: "control",
              kicker: "01",
              label: "Execution Control",
              content: (
                <div className={s.impl}>
                  <div className={s.implText}>
                    <p className={s.implLead}>
                      트랜잭션 처리 구간에 테스트용 동기화 지점을 연결했습니다. 두 트랜잭션의 실행
                      순서를 직접 제어해 같은 상황을 반복해서 만듭니다.
                    </p>
                    <ul className={u.list}>
                      <li>
                        시나리오에는 두 worker가 같은 요청(42)을 동시에 배정하도록 선언합니다.
                      </li>
                      <li>
                        저장된 순서에는 어느 worker를 어느 지점에서 진행시킬지가 차례로 적혀
                        있습니다.
                      </li>
                      <li>
                        이 순서가 오류를 다시 만드는 조건이므로 파일로 저장하고 ID를 붙입니다.
                      </li>
                    </ul>
                  </div>
                  <div className={s.implCode}>
                    <CodeBlock
                      caption="config.yaml · 시나리오 선언"
                      code={EXCERPTS.scenario}
                      href={LINKS.weavegate.config}
                    />
                    <CodeBlock
                      caption="concurrent-assign.json · 저장된 실행 순서"
                      code={EXCERPTS.schedule}
                      href={LINKS.weavegate.schedule}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "invariant",
              kicker: "02",
              label: "Invariant Check",
              content: (
                <div className={s.impl}>
                  <div className={s.implText}>
                    <p className={s.implLead}>
                      서비스가 반드시 지켜야 할 데이터 상태를 SQL 조건으로 정의했습니다. 도구가 실행
                      결과를 자동으로 판정합니다.
                    </p>
                    <ul className={u.list}>
                      <li>요청 하나에 활성 상태의 배정은 하나여야 합니다.</li>
                      <li>
                        쿼리는 이 조건을 어긴 요청을 찾습니다. <code>expect_rows: 0</code>이므로 한
                        행이라도 나오면 위반입니다.
                      </li>
                      <li>반환된 행은 증거로 저장됩니다.</li>
                    </ul>
                  </div>
                  <div className={s.implCode}>
                    <CodeBlock
                      caption="config.yaml · SQL 조건"
                      code={EXCERPTS.assertion}
                      href={LINKS.weavegate.config}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "evidence",
              kicker: "03",
              label: "Evidence & Replay",
              content: (
                <div className={s.impl}>
                  <div className={s.implText}>
                    <p className={s.implLead}>
                      실패한 실행의 정보를 저장합니다. 개발자는 실패한 조건을 확인하고 같은 상황을
                      다시 실행할 수 있습니다.
                    </p>
                    <ul className={u.list}>
                      <li>
                        <b>Schedule</b> 어떤 순서였는지
                      </li>
                      <li>
                        <b>Step-by-step Trace</b> 단계마다 무슨 일이 있었는지
                      </li>
                      <li>
                        <b>Violated Data</b> 어떤 데이터가 조건을 어겼는지
                      </li>
                      <li>
                        <b>Replay Command</b> 같은 순서를 다시 실행하는 명령
                      </li>
                    </ul>
                    <p className={s.implNote}>
                      오른쪽은 문서에 실린 실제 출력입니다. 위반 때 출력된 순서 ID를 수정한 구현에
                      그대로 지정해 20회 다시 실행합니다.
                    </p>
                  </div>
                  <div className={s.implCode}>
                    <CodeBlock
                      caption="취약한 구현 실행 · 위반과 증거"
                      code={QUICKSTART_FAIL}
                      href={LINKS.weavegate.quickstart}
                    />
                    <CodeBlock
                      caption="수정한 구현에 같은 순서를 재실행"
                      code={QUICKSTART_PASS}
                      href={LINKS.weavegate.quickstart}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "ci",
              kicker: "04",
              label: "CI Integration",
              content: (
                <div className={s.impl}>
                  <div className={s.implText}>
                    <p className={s.implLead}>
                      Testcontainers로 MySQL 시험 환경을 구성하고 GitHub Actions와 연결했습니다.
                      코드가 바뀔 때마다 같은 검증이 반복됩니다.
                    </p>
                    <ul className={u.list}>
                      <li>Pull Request마다 저장된 순서를 다시 실행합니다.</li>
                      <li>
                        위반이 재현되면 종료 코드 2로 job이 실패하고 증거가 artifact로 남습니다.
                      </li>
                      <li>종료 코드로 통과(0)와 위반(2), 불안정(3), 환경 오류(4)를 구분합니다.</li>
                    </ul>
                  </div>
                  <div className={s.implCode}>
                    <CodeBlock
                      caption="Pull Request 게이트 워크플로"
                      code={WORKFLOW}
                      href={LINKS.weavegate.ciGate}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Block>

      <Block
        id="automation"
        n={5}
        label="Project Automation"
        title="도구를 만드는 과정도 같은 방식으로 자동화했습니다"
        lead="검증 도구가 틀리면 그 위의 검증도 믿을 수 없습니다. 그래서 저장소의 변경과 릴리스에도 자동 검증을 걸었습니다."
      >
        <ul className={u.cards} style={{ "--cols": 4 } as CSSProperties}>
          {AUTOMATION.map((item) => (
            <li key={item.k} className={u.card} data-tone="paper">
              <p className={u.cardK}>{item.k}</p>
              <p className={u.cardT}>{item.t}</p>
              <p className={u.cardD}>{item.d}</p>
            </li>
          ))}
        </ul>
      </Block>
    </Section>
  )
}

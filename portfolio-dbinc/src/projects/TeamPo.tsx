import { useState } from "react"
import { Block, Pager, ProjectHeader, Takeaway } from "../components/Page"
import { LINKS } from "../data/links"
import styles from "./TeamPo.module.css"

// Facts come from Team-po/Server (main): the Status / ProjectGroupStatus
// enums, MatchService, the Flyway migrations, the workflows, and the PR
// descriptions of #37 and #97. "내 구현" marks code whose commits are the
// author's; "팀" marks parts a teammate wrote.

type State = "WAITING" | "MATCHING" | "MATCHED" | "CANCELED" | "ACTIVE"

const STATES: { id: State; owner: string; label: string }[] = [
  { id: "WAITING", owner: "ProjectRequest", label: "매칭 대기" },
  { id: "MATCHING", owner: "ProjectRequest", label: "팀 후보 확정, 수락 대기" },
  { id: "MATCHED", owner: "ProjectRequest", label: "매칭 완료" },
  { id: "ACTIVE", owner: "ProjectGroup", label: "팀 생성 · 협업 시작" },
  { id: "CANCELED", owner: "ProjectRequest", label: "취소" },
]

const TRANSITIONS: {
  id: string
  name: string
  from: State[]
  to: State[]
  api: string
  tx: string
}[] = [
  {
    id: "request",
    name: "매칭 신청",
    from: [],
    to: ["WAITING"],
    api: "POST /api/match/request",
    tx: "사용자당 진행 중인 요청은 하나만 저장됩니다. 동시에 두 번 신청해도 DB 고유 인덱스가 두 번째 행을 막습니다.",
  },
  {
    id: "match",
    name: "매칭 세션 생성",
    from: ["WAITING"],
    to: ["MATCHING"],
    api: "@Scheduled · 60초 주기",
    tx: "후보 요청들을 ID 순서로 정렬해 행 잠금을 잡고, 잠근 뒤 다시 WAITING인지 확인한 다음 한 트랜잭션에서 MATCHING으로 바꿉니다.",
  },
  {
    id: "accept",
    name: "전원 수락",
    from: ["MATCHING"],
    to: ["MATCHED", "ACTIVE"],
    api: "POST /api/match/accept",
    tx: "세션을 잠그고 멤버를 다시 조회합니다. 마지막 수락이 들어오면 같은 트랜잭션에서 요청을 MATCHED로 바꾸고 프로젝트 그룹을 ACTIVE로 생성합니다. 이미 수락한 요청은 같은 결과를 돌려줍니다.",
  },
  {
    id: "reject",
    name: "거절",
    from: ["MATCHING"],
    to: ["WAITING"],
    api: "POST /api/match/reject",
    tx: "거절한 멤버만 WAITING으로 돌아가고, 같은 팀 후보로 다시 묶이지 않도록 기록을 남깁니다. 빈자리는 다음 주기에 충원합니다.",
  },
  {
    id: "cancel",
    name: "취소 · 탈퇴",
    from: ["WAITING", "MATCHING"],
    to: ["CANCELED"],
    api: "POST /api/match/cancel · 회원 탈퇴",
    tx: "멤버가 취소하면 그 멤버만 빠지고 빈자리를 충원하며, 호스트가 취소하면 세션을 해산합니다. 탈퇴는 같은 정리를 거친 뒤 ACTIVE 팀이 생겼는지 한 번 더 확인합니다.",
  },
]

function StateFlow() {
  const [active, setActive] = useState("accept")
  const current = TRANSITIONS.find((item) => item.id === active)!
  const role = (state: State) =>
    current.from.includes(state) ? "from" : current.to.includes(state) ? "to" : undefined

  return (
    <div className={styles.machine}>
      <ol className={styles.states} aria-label="요청 상태">
        <li className={styles.user}>
          <span className={styles.stateId}>사용자</span>
          <span className={styles.stateLabel}>요청</span>
        </li>
        {STATES.map((state) => (
          <li
            key={state.id}
            className={styles.state}
            data-state={state.id}
            data-role={role(state.id)}
          >
            <span className={styles.owner}>{state.owner}</span>
            <span className={styles.stateId}>{state.id}</span>
            <span className={styles.stateLabel}>{state.label}</span>
            {role(state.id) && (
              <span className="sr-only">
                {role(state.id) === "from" ? " (변경 전 상태)" : " (변경 후 상태)"}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className={styles.events} role="group" aria-label="상태를 바꾸는 요청 선택">
        {TRANSITIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === active}
            onClick={() => setActive(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className={styles.detail} aria-live="polite">
        <p className={styles.change}>
          <span>{current.from.length ? current.from.join(" · ") : "—"}</span>
          <span aria-hidden="true">→</span>
          <span className="sr-only">에서</span>
          <span>{current.to.join(" + ")}</span>
        </p>
        <p className={styles.api}>{current.api}</p>
        <p className={styles.tx}>{current.tx}</p>
      </div>
    </div>
  )
}

const TX_STEPS = [
  { step: "BEGIN", note: "@Transactional" },
  { step: "행 잠금", note: "PESSIMISTIC_WRITE, ID 정렬 순서" },
  { step: "다시 조회", note: "잠금 대기 중 커밋된 변경 반영" },
  { step: "상태 검증", note: "현재 상태에서 가능한 변경인지" },
  { step: "상태 변경", note: "요청·세션·그룹을 함께 변경" },
  { step: "COMMIT", note: "DB 제약이 마지막 방어선" },
  { step: "AFTER_COMMIT", note: "@Async 알림 이벤트" },
]

const GUARDS = [
  {
    name: "DB 제약",
    who: "내 구현 · V5",
    body: "진행 중인 상태일 때만 user_id를 갖는 생성 열에 고유 인덱스를 걸어, 사용자당 활성 요청이 하나만 저장되게 했습니다.",
  },
  {
    name: "행 잠금과 재조회",
    who: "내 구현",
    body: "세션과 요청 행을 비관적 잠금으로 잡고, 잠근 뒤 상태를 다시 읽어 그사이 커밋된 취소를 반영합니다.",
  },
  {
    name: "잠금 순서 정렬",
    who: "내 구현 · #97",
    body: "탈퇴와 전원 수락이 동시에 들어올 때를 점검해 두 경로의 잠금 순서를 맞추고, 탈퇴 중 생성된 ACTIVE 팀이 있는지 다시 확인했습니다.",
  },
  {
    name: "커밋 후 이벤트",
    who: "내 구현 · #37",
    body: "알림은 커밋이 끝난 뒤 비동기로 보내, 알림 실패가 매칭 트랜잭션을 되돌리지 않게 했습니다.",
  },
]

export function TeamPo() {
  return (
    <>
      <ProjectHeader
        id="teampo"
        title="Java/Spring으로 신청부터 팀 생성까지 상태가 바뀌는 서비스 흐름 구현"
        message="사용자 요청이 여러 단계의 상태 변경을 거쳐 실제 서비스 결과로 이어지는 백엔드 흐름을 구현했습니다."
        meta={[
          { label: "Period", value: "2026.03–06" },
          { label: "Role", value: "4인 팀 팀장 · Backend" },
          { label: "Context", value: "숭실대학교 RISE 사업단 캡스톤" },
          { label: "Stack", value: "Java · Spring Boot · MySQL · Redis" },
        ]}
        repo={{ href: LINKS.teampo.repo, label: "Team-po/Server" }}
      />

      <Block
        n={1}
        kicker="BUSINESS FLOW"
        title="사용자의 요청 하나가 여러 상태를 거쳐 팀 생성으로 이어집니다"
        lead="초보 개발자의 팀 구성과 협업을 돕는 플랫폼입니다. 상태를 바꾸는 요청을 선택하면 변경 전후 상태와 그때의 트랜잭션 처리를 볼 수 있습니다."
        tone="surface"
      >
        <StateFlow />
      </Block>

      <Block
        n={2}
        kicker="APPLICATION"
        title="화면 기능 목록보다 요청이 바꾸는 상태를 기준으로 설계했습니다"
        lead="매칭 도메인은 신청·세션·멤버·프로젝트 그룹으로 나누고, 각 API가 어떤 상태를 바꾸는지부터 정했습니다. 매칭 알고리즘은 인터페이스로 분리해 기준을 바꿀 수 있게 했습니다."
      >
        <ol className={styles.layers} aria-label="요청 처리 계층">
          <li>
            <span className={styles.layerName}>Spring Security</span>
            <span>인증된 사용자만 요청</span>
          </li>
          <li>
            <span className={styles.layerName}>Controller · REST API</span>
            <span>/api/match/request · accept · reject · cancel</span>
          </li>
          <li>
            <span className={styles.layerName}>Service · @Transactional</span>
            <span>상태 검증과 변경, 스케줄러, 이벤트 발행</span>
          </li>
          <li>
            <span className={styles.layerName}>JPA Repository</span>
            <span>잠금 조회, 활성 멤버 조회</span>
          </li>
          <li>
            <span className={styles.layerName}>MySQL</span>
            <span>트랜잭션과 고유 인덱스</span>
          </li>
        </ol>
        <dl className={styles.scope}>
          <div>
            <dt>내 구현</dt>
            <dd>
              매칭 신청·취소·상태 조회 API, 매칭 세션 생성·수락·거절·취소 흐름과 스케줄러, 매칭
              스키마(V5·V7), 탈퇴 시 매칭 정리와 동시성 처리, Gemini API 기반 개발 가이드 생성
            </dd>
          </div>
          <div>
            <dt>팀</dt>
            <dd>회원·인증(Spring Security, Redis), 협업 기능, Docker·AWS 배포 파이프라인</dd>
          </div>
        </dl>
      </Block>

      <Block
        n={3}
        kicker="DATA INTEGRITY"
        title="여러 요청이 같은 데이터를 동시에 바꾸면 어떤 상태가 저장되어야 하는가"
        lead="매칭 생성, 수락, 취소, 탈퇴는 같은 요청 행과 세션을 함께 건드립니다. 상태를 바꾸는 트랜잭션은 모두 같은 순서를 따르게 했습니다."
        tone="surface"
      >
        <ol className={styles.txFlow}>
          {TX_STEPS.map((item, i) => (
            <li key={item.step} data-edge={i === 0 || i === TX_STEPS.length - 2 ? "" : undefined}>
              <span className={styles.txStep}>{item.step}</span>
              <span className={styles.txNote}>{item.note}</span>
            </li>
          ))}
        </ol>
        <ul className={styles.guards}>
          {GUARDS.map((guard) => (
            <li key={guard.name}>
              <p className={styles.guardHead}>
                <strong>{guard.name}</strong>
                <span>{guard.who}</span>
              </p>
              <p>{guard.body}</p>
            </li>
          ))}
        </ul>
        <p className={styles.links}>
          <a href={LINKS.teampo.matching} target="_blank" rel="noreferrer">
            PR #37 매칭 시스템<span className="sr-only"> (새 창)</span>
          </a>
          <a href={LINKS.teampo.withdrawal} target="_blank" rel="noreferrer">
            PR #97 탈퇴와 매칭 동시성<span className="sr-only"> (새 창)</span>
          </a>
        </p>
      </Block>

      <Block
        n={4}
        kicker="SCHEMA & DEPLOYMENT CHANGE"
        title="코드 변경이 데이터 구조와 배포까지 이어지는 흐름을 경험했습니다"
      >
        <ol className={styles.release}>
          <li>
            <span className={styles.releaseTool}>Flyway</span>
            <strong>DB 변경 이력</strong>
            <span>
              V1부터 V26까지 스키마 변경을 버전 파일로 관리. 매칭 스키마와 활성 요청 고유 인덱스를
              이 방식으로 추가
            </span>
          </li>
          <li>
            <span className={styles.releaseTool}>GitHub Actions</span>
            <strong>Build · Test · Deploy</strong>
            <span>
              PR과 main 반영마다 MySQL을 띄워 빌드·테스트하고, 배포 워크플로는 실행 시점을 정해
              수동으로 실행
            </span>
          </li>
          <li>
            <span className={styles.releaseTool}>Docker · AWS</span>
            <strong>실행·배포 환경</strong>
            <span>이미지를 ECR에 올리고 EC2에서 교체한 뒤 상태 확인 요청으로 배포 결과 확인</span>
          </li>
        </ol>
        <Takeaway>
          애플리케이션 코드 변경이 데이터 구조와 배포까지 이어지는 흐름을 경험했습니다.
        </Takeaway>
      </Block>

      <Pager id="teampo" />
    </>
  )
}

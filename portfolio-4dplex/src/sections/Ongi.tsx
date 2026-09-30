import type { CSSProperties } from "react"
import { Block, Ext, Note, Section } from "../components/Section"
import { StepExplorer, type Step } from "../components/StepExplorer"
import { Detail } from "../components/Detail"
import { ControlPath } from "../components/ControlPath"
import { CodeBlock } from "../components/CodeBlock"
import { EXCERPTS } from "../data/excerpts"
import { LINKS } from "../data/links"
import u from "./shared.module.css"
import s from "./Ongi.module.css"

const ARCHITECTURE: Step[] = [
  {
    id: "app",
    label: "User / App",
    title: "복약 일정 등록",
    sub: "칸별 복약 시각",
    detail: (
      <Detail
        lead="보호자가 앱에서 칸별 복약 시간을 등록합니다."
        points={[
          "등록한 일정은 REST API로 서버에 전달됩니다.",
          "기기가 실행한 결과도 나중에 이 앱에서 조회합니다.",
        ]}
        facts={[
          { k: "Out", v: "칸별 복약 시각" },
          { k: "담당", v: "팀원이 구현했습니다." },
        ]}
      />
    ),
  },
  {
    id: "server",
    label: "Server",
    title: "일정 저장 · 변경 알림",
    sub: "Spring Boot, AWS",
    detail: (
      <Detail
        lead="일정의 기준은 서버입니다. 서버는 일정을 저장하고 일정이 바뀌었다는 사실만 기기에 알립니다."
        points={[
          "일정이 등록되거나 수정되면 MQTT로 변경 알림을 발행합니다.",
          "일정 내용은 기기가 HTTP로 다시 가져갑니다.",
        ]}
        facts={[
          { k: "In", v: "앱의 일정 등록 요청" },
          { k: "Out", v: "MQTT 변경 알림과 원격 명령" },
          {
            k: "담당",
            v: "일정 관리는 팀원이 구현했고 기기와 주고받는 통신 규약을 함께 정했습니다.",
          },
        ]}
      />
    ),
  },
  {
    id: "link",
    label: "Communication",
    title: "알림과 데이터를 분리",
    sub: "MQTT / HTTP",
    mine: true,
    detail: (
      <Detail
        lead="MQTT로는 변경 사실만 알리고 실제 데이터는 HTTP로 읽고 씁니다."
        points={[
          "기기는 사설망 안에 있어 서버가 먼저 접속할 수 없습니다. 그래서 기기가 연결을 열어 두는 MQTT로 알림을 받습니다.",
          "알림을 받으면 일정 전체를 HTTP로 다시 조회합니다. 알림이 중복되거나 늦게 와도 기기의 일정은 서버의 최신 상태와 같아집니다.",
        ]}
        facts={[
          { k: "MQTT", v: "일정 변경 알림과 OPEN_ALL / CLOSE_ALL 원격 명령" },
          { k: "HTTP", v: "일정 조회, 복약 이벤트 보고, heartbeat" },
          { k: "담당", v: "기기 측 통신 구현과 서버 연동" },
        ]}
      />
    ),
  },
  {
    id: "device",
    label: "Device",
    title: "일정 조회와 실행 판단, 장비 제어",
    sub: "ESP32, FreeRTOS",
    tags: ["I2C Sensor", "PWM Motor", "Time Sync"],
    mine: true,
    detail: (
      <Detail
        lead="ESP32의 FreeRTOS 태스크들이 일정을 받아 두었다가 시각이 되면 해당 칸을 열고 결과를 보고합니다."
        points={[
          "ESP32와 FreeRTOS 위에서 C(ESP-IDF)로 작성했습니다.",
          "서버의 일정과 원격 요청을 수신합니다.",
          "SNTP로 맞춘 시각과 일정을 1초마다 비교해 실행을 판단합니다.",
          "PWM으로 서보 모터를 구동해 칸을 열고 닫습니다.",
          "I2C로 연결한 ADC(ADS1115)에서 광센서 입력을 읽습니다.",
          "실행 결과를 서버에 보고합니다.",
        ]}
        facts={[
          { k: "In", v: "변경 알림과 일정, 원격 명령" },
          { k: "Out", v: "서보 PWM 출력과 복약 이벤트" },
          { k: "담당", v: "펌웨어 전체와 하드웨어 연동" },
        ]}
      />
    ),
  },
  {
    id: "result",
    label: "Result",
    title: "센서로 복용 여부 판정",
    sub: "Sensor Judgment",
    mine: true,
    detail: (
      <Detail
        lead="칸을 연 뒤 15초 동안 광센서 값을 확인해 약을 꺼냈는지 기기가 직접 판정합니다."
        points={[
          "시간 안에 꺼낸 것이 감지되면 복용으로, 감지되지 않으면 미복용으로 기록합니다.",
          "판정이 끝나면 칸을 닫고 결과를 이벤트로 만듭니다.",
        ]}
        facts={[
          { k: "In", v: "광센서 ADC 값 (I2C)" },
          {
            k: "Out",
            v: (
              <>
                <code>MEDICATION_TAKEN</code> / <code>MEDICATION_MISSED</code>
              </>
            ),
          },
          { k: "담당", v: "센서 입력 처리와 판정 로직" },
        ]}
      />
    ),
  },
  {
    id: "record",
    label: "Server Record",
    title: "실행 결과 기록",
    sub: "HTTP 보고와 재시도",
    mine: true,
    detail: (
      <Detail
        lead="기기가 복약 이벤트를 HTTP로 보고하면 서버가 이를 복약 기록으로 저장합니다."
        points={[
          "전송은 별도 태스크가 맡아서 모터 제어가 네트워크 응답을 기다리지 않습니다.",
          "전송에 실패하면 다시 시도합니다.",
        ]}
        facts={[
          { k: "In", v: "칸 번호와 복용 상태" },
          { k: "Out", v: "서버의 복약 기록" },
          { k: "담당", v: "이벤트 전송부터 서버 기록까지" },
        ]}
      />
    ),
  },
  {
    id: "view",
    label: "App Result View",
    title: "복약 이력 조회",
    sub: "보호자 확인",
    detail: (
      <Detail
        lead="서버에 기록된 결과를 보호자가 앱에서 확인합니다."
        points={["일정 등록에서 시작한 흐름이 기기의 실제 동작을 거쳐 서비스 상태로 돌아옵니다."]}
        facts={[{ k: "담당", v: "팀원이 구현했고 전 구간 시연에서 이 화면까지 확인했습니다." }]}
      />
    ),
  },
]

const STATE = [
  {
    k: "Shared State",
    t: "공유 상태 보호",
    d: "일정 저장소는 mutex를 잡은 상태에서만 읽고 씁니다. 갱신할 때는 일정 전체를 한 번에 교체하고 버전을 올립니다.",
  },
  {
    k: "Snapshot",
    t: "실행 시점의 데이터 복사",
    d: "실행을 판단하는 태스크는 주기마다 저장소의 복사본을 만들어 그것만 봅니다. 도중에 일정이 바뀌어도 한 번의 판단은 같은 기준을 따릅니다.",
  },
  {
    k: "Time Sync",
    t: "시간 동기화",
    d: "SNTP 동기화가 끝난 뒤에만 일정을 실행합니다. 시각이 틀린 기기가 칸을 여는 일을 막습니다.",
  },
  {
    k: "Sequential",
    t: "제어 태스크의 순차 실행",
    d: "제어 태스크는 요청을 하나씩 꺼내 처리합니다. 칸을 열고 감지하고 닫는 과정이 끝나면 다음 요청으로 넘어갑니다.",
  },
]

const VALIDATION = [
  {
    name: "CI 빌드",
    mode: "CI_BUILD",
    what: "GitHub Actions에서 비공개 설정 없이 빌드합니다. 하드웨어 경로는 더미 구현으로 대체합니다.",
  },
  {
    name: "로직 시험 빌드",
    mode: "TEST_BUILD",
    what: "실물과 MQTT에 의존하는 경로를 빼고 일정 로직과 태스크 간 전달을 확인합니다.",
  },
  {
    name: "고정 일정 실행",
    mode: "DUMMY_TEST",
    what: "서버 대신 고정 일정으로 실행해 모터 흐름과 복약 이벤트를 로그로 확인합니다.",
  },
  {
    name: "네트워크 연동",
    mode: "일반 빌드",
    what: "MQTT 알림과 원격 명령, HTTP 일정 조회와 이벤트 보고를 실제 서버와 확인합니다.",
  },
  {
    name: "하드웨어 결합",
    mode: "ESP32 실물",
    what: "소프트웨어 경로가 안정된 뒤 서보 구동부와 센서를 차례로 결합합니다.",
  },
  {
    name: "전 구간 시연",
    mode: "앱 + 서버 + 기기",
    what: "앱에서 등록한 일정이 기기 동작과 센서 판정을 거쳐 다시 앱에 표시되는 것을 실물로 확인합니다.",
  },
]

const E2E = ["앱 일정 등록", "서버 저장", "디바이스 실행", "센서 판정", "서버 기록", "앱 조회"]

const CONTENTS = [
  { id: "architecture", label: "전체 구조" },
  { id: "control", label: "제어 충돌과 해결" },
  { id: "state", label: "상태 관리" },
  { id: "validation", label: "통합 검증" },
]

export function Ongi() {
  return (
    <Section
      id="integration"
      route="integration"
      index="01"
      label="Integration & Control"
      name="Ongi"
      tagline="스마트 복약 보조 IoT 기기"
      contents={CONTENTS}
      keywords={[
        "DEVICE CONTROL",
        "STATE MANAGEMENT",
        "SYSTEM INTEGRATION",
        "END-TO-END VALIDATION",
      ]}
      message="서버에 저장된 일정이 실제 하드웨어 동작으로 이어지고, 실행 결과가 다시 서비스 상태로 돌아오는 전체 흐름을 구현했습니다."
      meta={[
        { k: "기간", v: "2026.04 – 2026.07" },
        { k: "형태", v: "4인 팀 프로젝트, BMW 코리아 미래재단 영 이노베이터 드림 프로젝트" },
        { k: "담당", v: "ESP32·FreeRTOS 펌웨어 및 H/W 연동 전담, 서버–디바이스 통합" },
        { k: "GitHub", v: <Ext href={LINKS.ongi.repo}>Ongi-Team/ongi-device</Ext> },
      ]}
      fit="요청이 실제 장비의 동작으로 이어지고 그 결과가 시스템 상태로 돌아오기까지를 구현하고 검증했습니다. 상영 장비의 연동과 제어 업무에 이 경험을 적용하고자 합니다."
      summary={
        <ul className={u.trio}>
          <li>
            <p className={u.trioK}>What</p>
            <p className={u.trioV}>앱과 서버, 디바이스가 연결된 자동 복약 보조 시스템</p>
            <p className={u.trioD}>등록한 시간에 기기가 해당 칸을 열고 복용 여부를 기록합니다.</p>
          </li>
          <li>
            <p className={u.trioK}>Responsibility</p>
            <p className={u.trioV}>ESP32 펌웨어와 센서·모터 제어, 서버 연동과 전체 동작 검증</p>
            <p className={u.trioD}>
              복약 결과가 서버에 기록되는 구간까지 맡았습니다. 앱과 서버의 나머지 기능은 팀원이
              구현했습니다.
            </p>
          </li>
          <li>
            <p className={u.trioK}>Technical Focus</p>
            <p className={u.trioV}>여러 경로의 제어 요청을 하나의 실행 흐름으로 정리</p>
            <p className={u.trioD}>
              공유 상태를 보호해 일정이 갱신되는 중에도 실행이 같은 기준을 따릅니다.
            </p>
          </li>
        </ul>
      }
    >
      <Block
        id="architecture"
        n={1}
        label="End-to-End Architecture"
        title="일정 하나가 장비를 움직이고 결과가 돌아오기까지"
        hint="단계를 선택하면 그 구간의 역할과 주고받는 데이터가 표시됩니다."
      >
        <StepExplorer
          label="Ongi 전체 흐름"
          layout="loop"
          steps={ARCHITECTURE}
          initial="device"
          legend={
            <>
              <span className={s.legendK}>
                <b>담당</b> 표시가 직접 구현한 구간입니다.
              </span>
              <span>앱과 서버의 일정 관리는 팀원이 구현했습니다.</span>
            </>
          }
        />
      </Block>

      <Block
        id="control"
        n={2}
        label="Control Conflict"
        title="두 경로가 같은 하드웨어를 움직일 수 있었습니다"
      >
        <div className={s.ps}>
          <div className={s.psItem} data-kind="problem">
            <p className={s.psK}>Problem</p>
            <p className={s.psT}>
              예약 실행과 원격 제어가 같은 하드웨어를 동시에 조작할 수 있었습니다.
            </p>
            <p className={s.psD}>
              예약 작업과 원격 제어가 서로 다른 실행 경로를 쓰면 하드웨어 상태가 예상하지 못한
              순서로 바뀔 수 있습니다.
            </p>
          </div>
          <div className={s.psItem} data-kind="solution">
            <p className={s.psK}>Solution</p>
            <p className={s.psT}>
              메시지 큐와 단일 제어 태스크로 실제 장비를 조작하는 경로를 하나로 통합했습니다.
            </p>
            <p className={s.psD}>
              모든 요청은 큐에 넣고, 모터와 센서는 제어 태스크 하나만 다룹니다.
            </p>
          </div>
        </div>
        <ControlPath />
        <details className={u.more}>
          <summary>
            <span>Design Decision</span>
            단일 제어 태스크를 선택한 과정과 한계
            <em>PR 기록 포함</em>
          </summary>
          <div className={u.moreB}>
            <ul className={u.cards} style={{ "--cols": 4 } as CSSProperties}>
              <li className={u.card} data-tone="paper">
                <p className={u.cardK}>처음</p>
                <p className={u.cardD}>
                  두 태스크가 같은 큐를 함께 소비해서 배출 이벤트가 나뉘어 처리됐습니다.
                </p>
                <p className={u.cardL}>
                  <Ext href={LINKS.ongi.pr23}>PR #23</Ext>
                </p>
              </li>
              <li className={u.card} data-tone="paper">
                <p className={u.cardK}>결정</p>
                <p className={u.cardD}>
                  모터를 움직이는 주체를 태스크 하나로 정하고 원격 명령도 Queue Set으로 같은
                  태스크에 모았습니다.
                </p>
                <p className={u.cardL}>
                  <Ext href={LINKS.ongi.pr57}>PR #57</Ext>
                </p>
              </li>
              <li className={u.card} data-tone="paper">
                <p className={u.cardK}>효과</p>
                <p className={u.cardD}>
                  장비를 조작하는 경로가 하나라서 두 요청이 동시에 모터를 구동할 수 없습니다.
                  하드웨어 접근에 별도의 잠금도 필요 없습니다.
                </p>
              </li>
              <li className={u.card} data-tone="paper">
                <p className={u.cardK}>한계</p>
                <p className={u.cardD}>
                  한 번에 한 요청만 처리하므로 15초 감지 대기 중에는 닫기 명령도 기다립니다. 안전
                  관련 명령을 먼저 처리하는 경로가 남은 과제입니다.
                </p>
              </li>
            </ul>
          </div>
        </details>
      </Block>

      <Block
        id="state"
        n={3}
        label="State Management"
        title="갱신되는 도중에도 실행은 하나의 기준을 따릅니다"
        lead="일정이 갱신되는 도중에도 실행 중인 작업이 일관된 기준을 사용하도록 공유 상태를 보호하고, 실행 시점의 복사본을 사용했습니다."
      >
        <ul className={u.cards} style={{ "--cols": 4 } as CSSProperties}>
          {STATE.map((item) => (
            <li key={item.k} className={u.card}>
              <p className={u.cardK}>{item.k}</p>
              <p className={u.cardT}>{item.t}</p>
              <p className={u.cardD}>{item.d}</p>
            </li>
          ))}
        </ul>
        <details className={u.more}>
          <summary>
            <span>Implementation Detail</span>
            저장소의 실제 구현 보기
            <em>C · FreeRTOS</em>
          </summary>
          <div className={u.moreB} style={{ "--cols": 2 } as CSSProperties}>
            <p className={u.moreP}>
              공개 저장소의 코드를 그대로 옮겼습니다. 일정 조회에 실패하면 이전 스냅샷을 유지하고
              5초 뒤 다시 시도하므로 네트워크가 끊겨도 마지막 정상 일정으로 계속 동작합니다 (
              <Ext href={LINKS.ongi.pr38}>PR #38</Ext>, <Ext href={LINKS.ongi.pr60}>PR #60</Ext>).
            </p>
            <CodeBlock
              caption="schedule_store.c · mutex 아래에서 스냅샷 복사"
              code={EXCERPTS.snapshot}
              href={LINKS.ongi.snapshot}
            />
            <CodeBlock
              caption="motor_task.c · 두 큐를 하나의 태스크가 소비"
              code={EXCERPTS.motorTask}
              href={LINKS.ongi.motorTask}
            />
          </div>
        </details>
      </Block>

      <Block
        id="validation"
        n={4}
        label="Integration & Validation"
        title="전체 흐름을 단계별로 검증했습니다"
        lead="실패했을 때 원인이 소프트웨어와 하드웨어, 네트워크 중 어디에 있는지 가려낼 수 있도록 검증 범위를 한 단계씩 넓혔습니다."
      >
        <ol className={s.e2e} aria-label="검증한 전체 흐름">
          {E2E.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ol className={u.rows}>
          {VALIDATION.map((row) => (
            <li key={row.name}>
              <b>{row.name}</b>
              <i>{row.mode}</i>
              <span>{row.what}</span>
            </li>
          ))}
        </ol>
        <Note label="검증 범위">
          로그와 실물 동작으로 기능을 확인했습니다. 장시간 신뢰성은 측정하지 않았습니다. 전 구간
          시연은 팀원이 구현한 앱과 Spring Boot·AWS 서버를 함께 연동한 결과입니다.
        </Note>
      </Block>
    </Section>
  )
}

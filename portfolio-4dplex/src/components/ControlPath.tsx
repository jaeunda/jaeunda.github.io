import { useState } from "react"
import s from "./ControlPath.module.css"

type PathId = "scheduled" | "remote"

const PATHS: Record<PathId, { button: string; source: string; via: string; steps: string[] }> = {
  scheduled: {
    button: "Scheduled Execution",
    source: "schedule task",
    via: "dispense queue",
    steps: [
      "schedule task가 1초마다 동기화된 시각과 일정 스냅샷을 비교합니다.",
      "시각이 일치하면 해당 칸의 배출 이벤트를 dispense queue에 넣습니다. 같은 일정은 하루에 한 번만 넣습니다.",
      "motor task가 Queue Set에서 이벤트를 꺼내 칸을 엽니다. 15초 동안 센서로 복용 여부를 확인한 뒤 닫습니다.",
      "판정 결과(TAKEN / MISSED)를 event queue로 넘기면 event task가 HTTP로 서버에 보고합니다.",
    ],
  },
  remote: {
    button: "Remote Command",
    source: "MQTT handler",
    via: "command queue",
    steps: [
      "서버가 MQTT로 OPEN_ALL / CLOSE_ALL 명령을 보냅니다.",
      "MQTT 핸들러는 명령을 command queue에 넣고 바로 반환합니다. 중복 수신은 broker의 dup 표시와 30초 구간으로 걸러냅니다.",
      "예약 실행과 같은 motor task가 Queue Set에서 명령을 꺼내 모든 칸을 차례로 열거나 닫습니다.",
      "OPEN_ALL 뒤 CLOSE_ALL이 오지 않으면 10분 뒤 같은 태스크가 스스로 닫습니다.",
    ],
  },
}

const ORDER: PathId[] = ["scheduled", "remote"]

// Two request paths, one task that touches the hardware. Selecting a path
// highlights its route; the shared half of the diagram never changes, which
// is the point.
export function ControlPath() {
  const [active, setActive] = useState<PathId>("scheduled")
  const path = PATHS[active]

  return (
    <div className={s.root} data-path={active}>
      <div className={s.switch} role="group" aria-label="요청 경로 선택">
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={s.switchB}
            aria-pressed={active === id}
            onClick={() => setActive(id)}
          >
            {PATHS[id].button}
          </button>
        ))}
      </div>

      <div className={s.diagram} role="img" aria-label={diagramLabel(active)}>
        <div className={s.sources}>
          <div className={s.node} data-id="scheduled">
            <p className={s.k}>Scheduled Event</p>
            <p className={s.t}>예약 실행</p>
            <p className={s.d}>schedule task → dispense queue</p>
          </div>
          <div className={s.node} data-id="remote">
            <p className={s.k}>Remote Command</p>
            <p className={s.t}>원격 제어</p>
            <p className={s.d}>MQTT handler → command queue</p>
          </div>
        </div>

        <svg
          className={s.mergeH}
          viewBox="0 0 60 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path data-id="scheduled" d="M0,38 C34,38 26,80 60,80" />
          <path data-id="remote" d="M0,122 C34,122 26,80 60,80" />
        </svg>
        <svg
          className={s.mergeV}
          viewBox="0 0 160 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path data-id="scheduled" d="M40,0 C40,24 80,16 80,40" />
          <path data-id="remote" d="M120,0 C120,24 80,16 80,40" />
        </svg>

        <div className={s.shared}>
          <div className={s.node} data-shared="true">
            <p className={s.k}>Message Queue</p>
            <p className={s.t}>Queue Set</p>
            <p className={s.d}>두 큐를 하나의 대기 지점으로</p>
          </div>
          <i className={s.arrow} aria-hidden="true" />
          <div className={s.node} data-shared="true" data-core="true">
            <p className={s.k}>Single Control Task</p>
            <p className={s.t}>motor task</p>
            <p className={s.d}>한 번에 한 요청만 처리</p>
          </div>
          <i className={s.arrow} aria-hidden="true" />
          <div className={s.node} data-shared="true">
            <p className={s.k}>Hardware Control</p>
            <p className={s.t}>Sensor / Motor</p>
            <p className={s.d}>서보 PWM, 광센서 I2C</p>
          </div>
        </div>
      </div>

      <div className={s.trace} aria-live="polite">
        <p className={s.traceK}>
          {path.button}
          <span>
            {path.source} → {path.via} → motor task
          </span>
        </p>
        <ol className={s.traceL}>
          {path.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
      <p className={s.disclaimer}>
        펌웨어의 구현 구조를 설명하는 다이어그램이며 실제 펌웨어가 실행되는 시뮬레이터는 아닙니다.
      </p>
    </div>
  )
}

function diagramLabel(active: PathId): string {
  const path = PATHS[active]
  return `${path.button} 경로: ${path.source}가 ${path.via}에 넣은 요청이 Queue Set을 거쳐 단일 제어 태스크인 motor task로 들어가고, motor task만 센서와 모터를 제어합니다. 다른 경로의 요청도 같은 Queue Set과 motor task로 합쳐집니다.`
}

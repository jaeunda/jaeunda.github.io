import type { CSSProperties, ReactNode } from "react"
import { Block, Ext, Section } from "../components/Section"
import { Tabs } from "../components/Tabs"
import { LINKS } from "../data/links"
import u from "./shared.module.css"
import s from "./Foundation.module.css"

type Area = {
  id: string
  label: string
  what: string
  points: ReactNode[]
  href: string
  repo: string
}

const XV6: Area[] = [
  {
    id: "syscall",
    label: "System Call",
    what: "사용자 요청이 커널로 전달되고 결과가 반환되는 경로를 확장했습니다.",
    points: [
      <>
        파일의 읽기·쓰기 위치를 옮기는 <code>lseek</code>를 시스템 호출 표부터 커널 구현까지
        추가했습니다.
      </>,
      <>
        프로세스 정보를 반환하는 <code>get_procinfo</code>는 잠금을 잡은 동안 커널 버퍼에 복사해
        두고 잠금을 푼 뒤 사용자 공간으로 내보냅니다.
      </>,
      "사용자 공간으로 복사하는 도중에는 실행이 멈출 수 있어서 그동안 스핀락을 잡지 않도록 순서를 나눴습니다.",
    ],
    href: LINKS.os.syscall,
    repo: "os-p1-syscall",
  },
  {
    id: "sched",
    label: "CPU Scheduling",
    what: "프로세스별 실행량에 따라 CPU를 배분하도록 스케줄러를 바꿨습니다.",
    points: [
      "기본 Round-Robin을 Stride 스케줄링으로 교체했습니다.",
      "티켓이 많은 프로세스가 더 자주 선택되어 지정한 비율대로 CPU를 사용합니다.",
      "누적 값이 넘치기 전에 모든 프로세스의 값을 함께 낮춰 상대 순서를 유지합니다.",
    ],
    href: LINKS.os.scheduler,
    repo: "os-p2-scheduler",
  },
  {
    id: "memory",
    label: "Physical Memory",
    what: "물리 메모리의 할당과 주소 매핑 상태를 추적할 수 있게 했습니다.",
    points: [
      "프레임별 사용 표를 할당·해제 함수 안에서 갱신합니다.",
      "물리 프레임에서 프로세스와 가상 주소를 찾는 역페이지 테이블과 64칸 소프트웨어 TLB를 추가했습니다.",
      "매핑이 바뀌는 모든 지점에서 이 자료구조들이 실제 페이지 테이블과 일치하도록 갱신했습니다.",
    ],
    href: LINKS.os.pageframe,
    repo: "os-p3-pageframe",
  },
  {
    id: "fs",
    label: "File System",
    what: "Copy-on-Write 기반 스냅샷의 생성과 복구, 삭제를 구현했습니다.",
    points: [
      "스냅샷은 데이터 블록을 원본과 공유합니다.",
      "공유된 블록은 이후 처음 쓰기가 일어날 때 새 블록으로 분리됩니다.",
      "블록마다 참조 횟수를 디스크에 기록하고 0이 되면 해제합니다.",
    ],
    href: LINKS.os.snapshot,
    repo: "os-p4-snapshot",
  },
]

const DEBUG = [
  {
    k: "CALL STACK",
    d: "GDB로 함수 호출 흐름을 거슬러 올라가 문제가 처음 시작된 지점을 확인했습니다.",
  },
  {
    k: "LOCK / SHARED STATE",
    d: "잠금을 잡는 순서가 어긋나 실행이 멈추는 지점을 찾아 순서를 고쳤습니다.",
  },
  {
    k: "MEMORY / BLOCK REFERENCE",
    d: "주소 매핑과 공유 블록의 참조 횟수가 처음 어긋난 시점을 실행 로그로 찾았습니다.",
  },
]

const LSP = [
  {
    k: "File Management",
    t: "파일 정리 도구",
    repo: "lsp-p1",
    href: LINKS.lsp.p1,
    points: [
      "파일 입출력과 디렉터리 탐색을 시스템 호출만으로 구현",
      "확장자별 파일 정리와 디렉터리 구조 출력",
      "fork와 exec, wait로 자식 프로세스 실행과 회수",
    ],
  },
  {
    k: "Daemon",
    t: "디렉터리 감시 데몬",
    repo: "lsp-p2",
    href: LINKS.lsp.p2,
    points: [
      "데몬화 절차로 백그라운드 프로세스 생성",
      "여러 데몬이 함께 쓰는 설정·로그 파일을 fcntl 파일 잠금으로 보호",
      "Signal로 장기 실행 프로세스의 종료 흐름 처리",
    ],
  },
  {
    k: "ext2 Filesystem",
    t: "파일시스템 분석기",
    repo: "lsp-p3",
    href: LINKS.lsp.p3,
    points: [
      "ext2 이미지를 전용 라이브러리 없이 직접 해석",
      "디렉터리 구조를 재구성해 탐색",
      "파일 데이터가 저장된 블록을 따라가 내용 출력",
    ],
  },
]

const CONTENTS = [
  { id: "xv6", label: "xv6 커널 확장" },
  { id: "linux", label: "Linux 시스템 프로그래밍" },
]

export function Foundation() {
  return (
    <Section
      id="fundamentals"
      route="fundamentals"
      tone="surface"
      index="04"
      label="Systems Foundation"
      name="xv6 · Linux"
      tagline="운영체제 커널 확장과 Linux 시스템 프로그래밍"
      contents={CONTENTS}
      keywords={["KERNEL INTERNALS", "PROCESS / MEMORY / FILESYSTEM", "STATE TRACING"]}
      message="운영체제의 시스템 호출과 스케줄링, 메모리, 파일시스템을 C로 직접 구현하고 내부 상태가 어긋난 지점을 추적해 고쳤습니다."
      meta={[
        { k: "기간", v: "2025.03 – 2025.12" },
        { k: "과목", v: "운영체제, 리눅스시스템프로그래밍" },
        { k: "언어", v: "C" },
        { k: "GitHub", v: <Ext href={LINKS.os.repo}>jaeunda/operating-system</Ext> },
      ]}
      fit="프로세스와 메모리, 파일이 실제로 동작하는 방식을 직접 구현하며 익혔습니다. 프로그램 구조를 이해하고 오류의 원인을 추적하는 기초로 삼고 있습니다."
    >
      <Block
        id="xv6"
        n={1}
        label="xv6 Kernel Extension"
        title="교육용 운영체제의 네 영역을 직접 확장했습니다"
        lead="C로 교육용 운영체제 xv6의 시스템 호출과 CPU 스케줄링, 메모리 관리, 파일시스템을 직접 확장했습니다."
        hint="영역을 선택하면 구현 내용이 표시됩니다."
      >
        <Tabs
          label="xv6 확장 영역"
          items={XV6.map((area, i) => ({
            id: area.id,
            kicker: String(i + 1).padStart(2, "0"),
            label: area.label,
            content: (
              <div className={s.area}>
                <p className={s.areaWhat}>{area.what}</p>
                <div>
                  <ul className={u.list} style={{ marginTop: 0 }}>
                    {area.points.map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                  </ul>
                  <p className={s.areaRepo}>
                    <Ext href={area.href}>jaeunda/{area.repo}</Ext>
                  </p>
                </div>
              </div>
            ),
          }))}
        />

        <div className={s.debug}>
          <div className={s.debugHead}>
            <p className={s.debugK}>Debugging</p>
            <p className={s.debugT}>
              잠금 순서와 주소 매핑, 공유 블록 참조 횟수가 어긋나는 문제를 GDB와 실행 로그로
              추적했습니다.
            </p>
          </div>
          <ul className={s.debugL}>
            {DEBUG.map((item) => (
              <li key={item.k}>
                <p>{item.k}</p>
                <span>{item.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </Block>

      <Block
        id="linux"
        n={2}
        label="Linux System Programming"
        title="시스템 호출로 프로세스와 파일을 직접 다뤘습니다"
        lead="C와 Linux 시스템 호출로 프로세스와 파일, 백그라운드 실행, 파일시스템 구조를 직접 다루는 도구를 구현했습니다."
      >
        <ul className={u.cards} style={{ "--cols": 3 } as CSSProperties}>
          {LSP.map((item) => (
            <li key={item.k} className={u.card} data-tone="paper">
              <p className={u.cardK}>{item.k}</p>
              <p className={u.cardT}>{item.t}</p>
              <ul className={u.list}>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className={u.cardL}>
                <Ext href={item.href}>jaeunda/{item.repo}</Ext>
              </p>
            </li>
          ))}
        </ul>
      </Block>
    </Section>
  )
}

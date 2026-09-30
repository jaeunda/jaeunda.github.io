import type { CSSProperties } from "react"
import { Block, Note, Section } from "../components/Section"
import { StepExplorer, type Step } from "../components/StepExplorer"
import { Detail } from "../components/Detail"
import { Tabs } from "../components/Tabs"
import { CodeBlock } from "../components/CodeBlock"
import { CUDA_EXCERPTS } from "../data/cudaExcerpts"
import u from "./shared.module.css"
import s from "./Cuda.module.css"

const QUESTIONS = [
  {
    k: "Decomposition",
    t: "연산을 어떻게 분할할 것인가?",
    d: "셀마다 독립적인 갱신은 병렬 알고리즘에 맡겼습니다. 타일 평균은 스레드 블록 하나가 타일 하나를 맡는 커널로 작성했습니다.",
  },
  {
    k: "Cost",
    t: "커널 실행과 데이터 이동은 어디서 시간이 소모되는가?",
    d: "호스트로 데이터를 복사하는 구간과 중간 결과를 메모리에 쓰는 구간에서 시간이 소모됐습니다.",
  },
  {
    k: "Concurrency",
    t: "비동기 실행을 어떻게 활용할 것인가?",
    d: "과정 실습에서 CUDA Stream과 비동기 복사로 계산과 데이터 이동이 겹쳐 실행되도록 했습니다.",
  },
  {
    k: "Correctness",
    t: "성능을 개선한 뒤에도 결과의 정확성이 유지되는가?",
    d: "단계마다 처리량과 계산 결과의 정확성을 함께 검증했습니다.",
  },
]

const WORKFLOW: Step[] = [
  {
    id: "baseline",
    label: "Workload Analysis",
    title: "CPU 시뮬레이터 분석",
    detail: (
      <Detail
        lead="2D 격자에서 전자기파의 전파를 계산하는 Maxwell 방정식 시뮬레이터입니다. 시간 단계마다 모든 셀의 전기장과 자기장을 갱신합니다."
        points={[
          "주어진 코드는 데이터를 호스트로 복사해 CPU에서 계산한 뒤 다시 디바이스로 보냈습니다.",
          "셀 하나의 갱신은 이웃 셀의 값만 읽으므로 셀 단위로 병렬화할 수 있습니다.",
        ]}
      />
    ),
  },
  {
    id: "port",
    label: "Parallel Execution",
    title: "GPU에서 직접 계산",
    detail: (
      <Detail
        lead="호스트로의 복사를 없애고 디바이스 메모리에서 바로 계산하도록 바꿨습니다."
        points={[
          <>
            <code>std::vector</code>를 <code>thrust::device_vector</code>로 바꾸고 알고리즘을 GPU
            실행 정책으로 실행했습니다.
          </>,
          "이 단계의 처리량은 초당 약 25.0억 cells였습니다. 목표는 약 21.4억이었습니다.",
        ]}
      />
    ),
  },
  {
    id: "bottleneck",
    label: "Bottleneck Analysis",
    title: "남은 병목 확인",
    detail: (
      <Detail
        lead="GPU로 옮긴 뒤에도 매 단계마다 필요 없는 메모리 쓰기가 남아 있었습니다."
        points={[
          <>
            이웃 셀의 차이값(<code>ez[i + n] - ez[i]</code>)을 버퍼에 먼저 저장한 다음 다시
            읽었습니다.
          </>,
          "셀 번호 배열도 호스트에서 만들어 디바이스로 복사했습니다.",
          "두 값은 계산 중에만 쓰는 임시 값이어서 메모리에 둘 필요가 없었습니다.",
        ]}
      />
    ),
  },
  {
    id: "iterators",
    label: "Structure Improvement",
    title: "임시 메모리 제거",
    detail: (
      <Detail
        lead="임시 값을 메모리에 쓰지 않고 계산하는 시점에 만들어 쓰도록 실행 구조를 바꿨습니다."
        points={[
          "차이값은 zip iterator와 transform iterator로 읽는 순간에 계산합니다.",
          "셀 번호는 counting iterator로 대체해 배열 할당과 복사를 없앴습니다.",
          "처리량이 초당 약 25.0억에서 49.2억 cells로 늘었습니다.",
        ]}
      />
    ),
  },
  {
    id: "kernel",
    label: "GPU Kernel Design",
    title: "CUDA 커널 작성",
    detail: (
      <Detail
        lead="결과 격자를 타일 단위로 평균해 해상도를 낮추는 커널을 직접 작성했습니다."
        points={[
          "스레드 블록 하나가 타일 하나를 맡고 스레드마다 셀 하나를 읽습니다.",
          <>
            블록 안의 합은 공유 메모리를 쓰는 <code>cub::BlockReduce</code>로 구했습니다.
          </>,
          "합은 블록의 첫 스레드에만 유효하므로 그 스레드만 평균을 기록합니다.",
        ]}
      />
    ),
  },
  {
    id: "verify",
    label: "Measurement & Validation",
    title: "처리량과 정확성 검증",
    detail: (
      <Detail
        lead="단계마다 자동 검증이 처리량과 계산 결과의 정확성을 확인했습니다."
        points={[
          "최종 처리량은 초당 약 49.1억 cells로 목표 처리량을 약 19.8% 넘었습니다.",
          "세 단계 모두 정확성 검증을 통과했습니다.",
        ]}
      />
    ),
  },
]

// The autograder's own numbers, 1024² cells, in cells per second.
const STEPS = [
  { name: "1. GPU 포팅", achieved: 2499773261, expected: 2137099341 },
  { name: "2. 임시 메모리 제거", achieved: 4915297053, expected: 4166569469 },
  { name: "3. CUDA 커널 추가", achieved: 4912618429, expected: 4101423008 },
]

const MAX = Math.max(...STEPS.map((step) => step.achieved))
const eok = (value: number) => (value / 1e8).toFixed(1)
const over = (step: (typeof STEPS)[number]) =>
  ((step.achieved / step.expected - 1) * 100).toFixed(1)

const PROFILING = [
  {
    k: "Kernel Execution",
    d: "타임라인에서 GPU 연산이 시작하고 끝나는 시점을 확인했습니다.",
  },
  {
    k: "CPU–GPU Data Movement",
    d: "동기 복사를 비동기 복사로 바꾸고 pinned 메모리를 써서 복사가 계산과 겹치도록 했습니다.",
  },
  {
    k: "Synchronization",
    d: "동기화 지점을 옮겨 GPU가 계산하는 동안 CPU가 결과를 디스크에 쓰도록 했습니다.",
  },
  {
    k: "Asynchronous Execution",
    d: "계산과 복사를 서로 다른 CUDA Stream에 두고, NVTX로 구간에 이름을 붙여 타임라인에서 확인했습니다.",
  },
]

const CONTENTS = [
  { id: "challenge", label: "기술 과제" },
  { id: "workflow", label: "최적화 과정" },
  { id: "results", label: "성능과 정확성" },
  { id: "code", label: "개선 전후 코드" },
  { id: "profiling", label: "프로파일링 실습" },
]

export function Cuda() {
  return (
    <Section
      id="performance"
      route="performance"
      index="03"
      label="Performance"
      name="CUDA"
      tagline="GPU 병렬 처리와 성능 분석"
      contents={CONTENTS}
      keywords={["GPU PARALLELIZATION", "BOTTLENECK ANALYSIS", "PROFILING", "ACCURACY VALIDATION"]}
      message="연산을 GPU로 병렬화하고 실행 과정의 병목을 분석해 처리량을 개선했습니다. 성능 개선 이후에는 계산 결과의 정확성도 별도로 검증했습니다."
      meta={[
        { k: "기관", v: "NVIDIA Deep Learning Institute" },
        { k: "과정", v: "Fundamentals of Accelerated Computing with Modern CUDA C++" },
        { k: "시기", v: "2026.09" },
        { k: "대상", v: "과정의 최종 평가 (Maxwell 방정식 시뮬레이터 가속)" },
      ]}
      fit="연산을 GPU로 병렬화하고, 시간이 쓰이는 곳을 찾아 개선한 뒤 결과의 정확성을 확인했습니다. 초고화질 영상의 실시간 처리 업무를 익히는 바탕으로 삼고자 합니다."
      summary={
        <ul className={u.trio}>
          <li>
            <p className={u.trioK}>What</p>
            <p className={u.trioV}>CPU 전용 Maxwell 방정식 시뮬레이터의 GPU 가속</p>
            <p className={u.trioD}>격자의 모든 셀을 시간 단계마다 갱신하는 프로그램입니다.</p>
          </li>
          <li>
            <p className={u.trioK}>Approach</p>
            <p className={u.trioV}>GPU 포팅, 임시 메모리 제거, CUDA 커널 작성</p>
            <p className={u.trioD}>세 단계로 나눠 단계마다 처리량과 정확성을 확인했습니다.</p>
          </li>
          <li>
            <p className={u.trioK}>Result</p>
            <p className={u.trioV}>초당 약 49.1억 cells, 목표 처리량 대비 +19.8%</p>
            <p className={u.trioD}>세 단계 모두 정확성 검증을 통과했습니다.</p>
          </li>
        </ul>
      }
    >
      <Block
        id="challenge"
        n={1}
        label="Technical Challenge"
        title="GPU 가속에서 답해야 했던 네 가지 질문"
        lead="CPU에서 수행하던 Maxwell 방정식 시뮬레이터의 연산을 GPU 기반 병렬 처리로 전환했습니다."
      >
        <ul className={u.cards} style={{ "--cols": 4 } as CSSProperties}>
          {QUESTIONS.map((q) => (
            <li key={q.k} className={u.card}>
              <p className={u.cardK}>{q.k}</p>
              <p className={u.cardT}>{q.t}</p>
              <p className={u.cardD}>{q.d}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        id="workflow"
        n={2}
        label="Optimization Workflow"
        title="분석에서 검증까지의 여섯 단계"
        hint="단계를 선택하면 그 단계에서 한 일이 표시됩니다."
      >
        <StepExplorer label="CUDA 최적화 과정" layout="row" steps={WORKFLOW} initial="iterators" />
      </Block>

      <Block id="results" n={3} label="Results" title="성능과 정확성을 각각 확인했습니다">
        <div className={s.results}>
          <div className={s.panel}>
            <p className={s.panelK}>
              <span>A</span>Performance
            </p>
            <div className={s.nums}>
              <div>
                <p className={s.num}>
                  약 49.1억 <small>cells / sec</small>
                </p>
                <p className={s.cap}>Maxwell 방정식 시뮬레이터 처리량</p>
              </div>
              <div>
                <p className={s.num}>+19.8%</p>
                <p className={s.cap}>목표 처리량 대비 초과 달성</p>
              </div>
            </div>
            <table className={s.table}>
              <caption className="sr-only">단계별 달성 처리량과 목표 처리량</caption>
              <thead>
                <tr>
                  <th scope="col">단계</th>
                  <th scope="col">
                    <i data-kind="actual" />
                    달성 <i data-kind="target" />
                    목표 <small>(억 cells/s)</small>
                  </th>
                  <th scope="col">초과</th>
                </tr>
              </thead>
              <tbody>
                {STEPS.map((step) => (
                  <tr key={step.name}>
                    <th scope="row">{step.name}</th>
                    <td>
                      <span className={s.bar} data-kind="actual">
                        <i style={{ width: `${(step.achieved / MAX) * 100}%` }} />
                        <b>{eok(step.achieved)}</b>
                      </span>
                      <span className={s.bar} data-kind="target">
                        <i style={{ width: `${(step.expected / MAX) * 100}%` }} />
                        <b>{eok(step.expected)}</b>
                      </span>
                    </td>
                    <td>+{over(step)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.panel} data-kind="accuracy">
            <p className={s.panelK}>
              <span>B</span>Accuracy
            </p>
            <p className={s.verified}>
              <i aria-hidden="true" />
              ACCURACY VERIFIED
            </p>
            <p className={s.cap}>정확성 검증 통과</p>
            <p className={s.accD}>
              세 단계 모두 처리량 확인과 별도로 계산 결과의 정확성 검증을 통과했습니다. 속도를
              높이는 과정에서 결과가 달라지지 않았음을 단계마다 확인했습니다.
            </p>
          </div>
        </div>
        <Note label="수치의 의미">
          1024×1024 cells 격자에서 과정의 자동 검증이 측정한 값입니다. +19.8%는 과정이 제시한 목표
          처리량을 넘어선 비율이며 CPU 대비 속도 향상률과는 다른 값입니다.
        </Note>
      </Block>

      <Block
        id="code"
        n={4}
        label="Implementation"
        title="제출한 코드로 보는 개선 전후"
        lead="최종 평가에 제출한 코드입니다. 같은 함수가 임시 버퍼를 쓰던 형태에서 iterator로 계산하는 형태로 바뀌었습니다."
      >
        <Tabs
          label="코드 단계"
          items={[
            {
              id: "materialized",
              kicker: "Step 1",
              label: "버퍼에 저장한 뒤 계산",
              content: (
                <div className={s.code}>
                  <ul className={u.list} style={{ marginTop: 0 }}>
                    <li>첫 번째 transform이 차이값을 buffer에 씁니다.</li>
                    <li>두 번째 transform이 buffer를 다시 읽어 자기장을 갱신합니다.</li>
                    <li>셀 수만큼의 메모리 쓰기와 읽기가 시간 단계마다 추가로 일어납니다.</li>
                  </ul>
                  <CodeBlock
                    caption="maxwell.cu, update_hx (Step 1)"
                    code={CUDA_EXCERPTS.materialized}
                  />
                </div>
              ),
            },
            {
              id: "fancy",
              kicker: "Step 2",
              label: "읽는 시점에 계산",
              content: (
                <div className={s.code}>
                  <ul className={u.list} style={{ marginTop: 0 }}>
                    <li>zip iterator가 이웃한 두 값을 한 쌍으로 묶습니다.</li>
                    <li>transform iterator가 그 쌍을 읽는 순간에 차이값으로 바꿉니다.</li>
                    <li>buffer 인자가 사라지고 transform 한 번으로 갱신이 끝납니다.</li>
                  </ul>
                  <CodeBlock caption="maxwell.cu, update_hx (Step 2)" code={CUDA_EXCERPTS.fancy} />
                </div>
              ),
            },
            {
              id: "coarse",
              kicker: "Step 3",
              label: "타일 평균 커널",
              content: (
                <div className={s.code}>
                  <ul className={u.list} style={{ marginTop: 0 }}>
                    <li>블록 번호로 타일 위치를, 스레드 번호로 타일 안의 셀 위치를 구합니다.</li>
                    <li>BlockReduce의 임시 저장소는 블록의 공유 메모리에 둡니다.</li>
                    <li>
                      첫 스레드만 평균을 기록해 같은 위치에 여러 스레드가 쓰지 않도록 했습니다.
                    </li>
                  </ul>
                  <CodeBlock caption="coarse.cu, kernel (Step 3)" code={CUDA_EXCERPTS.coarse} />
                </div>
              ),
            },
          ]}
        />
      </Block>

      <Block
        id="profiling"
        n={5}
        label="Profiling Practice"
        title="Nsight Systems로 실행 과정을 시간축에서 분석했습니다"
        lead="같은 과정의 실습에서 시뮬레이션 코드를 프로파일링했습니다. 타임라인에서 시간이 소모되는 구간을 찾고 실행 구조를 바꿔 다시 확인했습니다."
      >
        <ul className={u.cards} style={{ "--cols": 4 } as CSSProperties}>
          {PROFILING.map((item) => (
            <li key={item.k} className={u.card}>
              <p className={u.cardK}>{item.k}</p>
              <p className={u.cardD}>{item.d}</p>
            </li>
          ))}
        </ul>
        <Note label="측정 방법">
          별도의 CUDA 실습에서는 정확성 확인, warm-up, 30회 반복 순서로 측정해 중앙값과 p95를
          기록했습니다. 커널 호출이 반환되는 시간과 GPU가 실제로 실행한 시간을 구분해 측정했습니다.
        </Note>
      </Block>
    </Section>
  )
}

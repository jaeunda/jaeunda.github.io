import { Block, Pager, ProjectHeader, Takeaway } from "../components/Page"
import { CPU_ONLY_TOTAL, GATE, PATHS, type PathResult } from "../data/marketScan"
import styles from "./MarketScan.module.css"

const WINDOWS = [2, 3, 4, 6, 8, 11, 16, 23, 32, 45, 64, 91, 128, 181, 256]

const ms = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Horizontal bars on one linear axis; the largest bar is the bottleneck. */
function Bars({
  rows,
  max,
  caption,
  unitNote,
}: {
  rows: { label: string; value: number; note?: string; emphasis?: boolean }[]
  max: number
  caption: string
  unitNote: string
}) {
  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartCaption}>
        {caption}
        <span>{unitNote}</span>
      </figcaption>
      <ul className={styles.bars}>
        {rows.map((row) => {
          const width = Math.max((row.value / max) * 100, 0.4)
          return (
            <li
              key={row.label}
              className={styles.barRow}
              data-emphasis={row.emphasis ? "" : undefined}
            >
              <span className={styles.barLabel}>{row.label}</span>
              <span className={styles.barTrack} title={`${row.label}: ${ms(row.value)} ms`}>
                <span className={styles.bar} style={{ width: `${width}%` }} />
                <span className={styles.barValue} style={{ left: `${width}%` }}>
                  {ms(row.value)} ms{row.note && <span className={styles.barNote}>{row.note}</span>}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}

function PathTable({ paths }: { paths: PathResult[] }) {
  const keys = ["h2d", "features", "rarity", "peaks", "d2h", "cpu_post"]
  const names: Record<string, string> = {
    h2d: "CPU → GPU",
    features: "GPU 특징 계산",
    rarity: "GPU 순위 계산",
    peaks: "GPU 후보 선별",
    d2h: "GPU → CPU",
    cpu_post: "CPU 후처리",
  }
  return (
    <details className={styles.table}>
      <summary>구간별 측정값 표로 보기</summary>
      <div className={styles.tableWrap} tabIndex={0}>
        <table>
          <caption className="sr-only">경로별 구간 시간 (ms, 중앙값)</caption>
          <thead>
            <tr>
              <th scope="col">구간</th>
              {paths.map((path) => (
                <th key={path.id} scope="col">
                  {path.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key}>
                <th scope="row">{names[key]}</th>
                {paths.map((path) => {
                  const seg = path.segments.find((item) => item.key === key)
                  return <td key={path.id}>{seg ? ms(seg.ms) : "—"}</td>
                })}
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <th scope="row">전체 (별도 측정)</th>
              {paths.map((path) => (
                <td key={path.id}>{ms(path.total)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.tableNote}>
        구간 값은 구간 측정 실행, 전체 값은 전체 시간 실행의 중앙값이라 합이 전체와 정확히 같지
        않습니다.
      </p>
    </details>
  )
}

export function MarketScan() {
  const before = PATHS[0]
  const after = PATHS[2]
  const segmentRows = [...before.segments]
    .sort((a, b) => b.ms - a.ms)
    .map((seg) => ({
      label: seg.label,
      value: seg.ms,
      note: ` · ${((seg.ms / before.total) * 100).toFixed(1)}%`,
      emphasis: seg.key === "cpu_post",
    }))

  return (
    <>
      <ProjectHeader
        id="market-scan"
        title="60만 건 거래 시계열에서 결과 일치를 먼저 확인하고 GPU 병목을 찾아 구조를 개선"
        message="GPU를 적용한 뒤 빠르다고 가정하지 않고, CPU 기준 결과와 정확성을 맞춘 뒤 전체 처리 시간을 나눠 실제 병목을 측정했습니다."
        meta={[
          { label: "Project", value: "거래 시계열 GPU 병렬처리 및 성능 최적화" },
          { label: "Period", value: "2026.09–10" },
          { label: "Context", value: "숭실대학교 수업 프로젝트" },
          { label: "Role", value: "단독 설계 · CUDA 구현 · 성능 분석" },
          { label: "Stack", value: "Python · CUDA · CuPy · Numba" },
          { label: "GPU", value: "Tesla T4 (Colab)" },
        ]}
        metrics={[
          { value: "2,360.3 → 37.9 ms", label: "GPU 처리 경로 전체 시간 · 1초봉 604,800행" },
          { value: "62.3×", label: "같은 입력·같은 Top-20 기준 단축" },
          { value: "Same Top-20", label: "모든 GPU 경로가 CPU 기준과 같은 후보", tone: "pass" },
        ]}
      />

      <Block
        n={1}
        kicker="WORKLOAD"
        title="모든 시작 시점과 구간 길이 조합을 빠짐없이 계산합니다"
        lead="거래 시계열에서 ‘언제부터 얼마 동안’ 가격 변동폭과 거래량이 함께 드물게 컸는지를 찾습니다. 사건이 몇 분짜리인지 미리 알 수 없어 모든 조합을 훑고, 조합 하나를 GPU 스레드 하나가 맡습니다."
      >
        <div className={styles.workload}>
          <dl className={styles.conditions}>
            <div>
              <dt>Data</dt>
              <dd>BTCUSDT 1초봉 · 2024-01-08–14</dd>
            </div>
            <div>
              <dt>Rows</dt>
              <dd>604,800</dd>
            </div>
            <div>
              <dt>Windows</dt>
              <dd>15개 · {WINDOWS.join(", ")}초</dd>
            </div>
            <div>
              <dt>Candidates</dt>
              <dd>604,800 × 15 = 9,072,000</dd>
            </div>
          </dl>
          <ol className={styles.pipeline}>
            <li>
              <strong>Start Point × Window</strong>
              <span>(시작 시점, 구간 길이) = 1 thread</span>
            </li>
            <li>
              <strong>Price Movement + Volume Rarity</strong>
              <span>구간별 가격 변동폭과 거래량을 길이별 순위로 환산</span>
            </li>
            <li>
              <strong>Candidate Ranking</strong>
              <span>같은 길이 안에서 가장 드문 지점만 남김</span>
            </li>
            <li>
              <strong>Top-20</strong>
              <span>겹치는 후보는 한 사건으로 묶어 상위 20개</span>
            </li>
          </ol>
        </div>
      </Block>

      <Block
        n={2}
        kicker="CORRECTNESS FIRST"
        title="성능을 재기 전에 결과가 같은지 먼저 확인했습니다"
        lead="CPU 기준 구현과 GPU 결과를 값 단위로 대조하는 검사를 통과해야 측정 단계로 넘어갑니다. 일부러 틀리게 만든 커널 두 개가 이 검사에서 실제로 걸리는지도 확인했습니다."
        tone="surface"
      >
        <div className={styles.correct}>
          <ol className={styles.gateFlow} aria-label="정확성 확인 순서">
            <li>CPU Reference</li>
            <li data-pair="">GPU Result</li>
            <li>Result Match</li>
            <li data-last="">Performance Measurement</li>
          </ol>
          <div className={styles.gateTableWrap} tabIndex={0}>
            <table className={styles.gate}>
              <caption className="sr-only">정확성 검사 결과</caption>
              <thead>
                <tr>
                  <th scope="col">검사</th>
                  <th scope="col">기대</th>
                  <th scope="col">결과</th>
                  <th scope="col">근거</th>
                </tr>
              </thead>
              <tbody>
                {GATE.map((row) => (
                  <tr key={row.case}>
                    <th scope="row">{row.case}</th>
                    <td>{row.expected}</td>
                    <td>
                      <span className={styles.verdict} data-result={row.result}>
                        {row.result === "PASS" ? "✓" : "✕"} {row.result}
                      </span>
                    </td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Takeaway>성능 개선보다 결과가 같은지 먼저 확인했다.</Takeaway>
      </Block>

      <Block
        n={3}
        kicker="MEASURE THE REAL BOTTLENECK"
        title="전체 시간을 구간으로 나누자, 병목은 GPU 계산이 아니라 CPU 후처리였습니다"
        lead="처음 구조에서 GPU 특징 계산은 5.4ms였습니다. 2,360.3ms 대부분은 계산 결과 전부를 CPU로 가져온 뒤 CPU에서 순위를 매기고 후보를 고르는 시간이었습니다."
      >
        <Bars
          caption="경로 ① 구간별 시간"
          unitNote="1초봉 604,800행 · K=15 · 10회 중앙값"
          rows={segmentRows}
          max={before.total}
        />
        <p className={styles.reading}>
          GPU 쪽만 보면 결과 전송(GPU → CPU 34.3ms)이 전송과 계산 합의 83%였지만, 전체에서는 CPU
          후처리 2,325.4ms가 98.5%를 차지했습니다. 커널을 더 빠르게 만드는 것보다 무엇을 어디서
          처리하는지를 바꿔야 했습니다.
        </p>
      </Block>

      <Block
        n={4}
        kicker="CHANGE THE PROCESSING STRUCTURE"
        title="후보 선별까지 GPU에서 끝내고 필요한 결과만 CPU로 보냈습니다"
        tone="surface"
      >
        <div className={styles.structures}>
          <section className={styles.structure} aria-labelledby="st-before">
            <h3 id="st-before">Before</h3>
            <ol>
              <li>GPU computes all candidates</li>
              <li data-heavy="">All results to CPU</li>
              <li data-heavy="">CPU selection</li>
              <li>Top-20</li>
            </ol>
            <p className={styles.structureTotal}>{ms(before.total)} ms</p>
          </section>
          <p className={styles.structureArrow} aria-hidden="true">
            →
          </p>
          <section className={styles.structure} data-after="" aria-labelledby="st-after">
            <h3 id="st-after">After</h3>
            <ol>
              <li>GPU computes</li>
              <li>GPU selects candidates</li>
              <li>Only needed results to CPU</li>
              <li>Top-20</li>
            </ol>
            <p className={styles.structureTotal}>{ms(after.total)} ms</p>
          </section>
        </div>

        <ul className={styles.big}>
          <li>
            <span className={styles.bigValue}>2,360.3 → 37.9 ms</span>
            <span>GPU 처리 경로 전체 시간</span>
          </li>
          <li>
            <span className={styles.bigValue}>62.3×</span>
            <span>① 대비 ③ (② 순위 GPU 이동 28.9× · ③ 후보 선별 GPU 이동 2.2×)</span>
          </li>
          <li>
            <span className={styles.bigValue}>Same Top-20</span>
            <span>세 경로 모두 CPU 기준과 같은 상위 20개</span>
          </li>
        </ul>

        <Bars
          caption="경로별 전체 시간"
          unitNote="같은 입력 · 10회 중앙값"
          rows={[
            ...PATHS.map((path) => ({
              label: path.label,
              value: path.total,
              emphasis: path.id === "3",
            })),
            { label: "참고: CPU 전용 (2 threads)", value: CPU_ONLY_TOTAL },
          ]}
          max={CPU_ONLY_TOTAL}
        />
        <PathTable paths={PATHS} />

        <dl className={styles.env}>
          <div>
            <dt>측정 환경</dt>
            <dd>
              Colab Tesla T4 (40 SM, CC 7.5) · Intel Xeon 2.00GHz 2 vCPU · CUDA 12.9 · CuPy 14.0.1 ·
              Numba 0.61.2
            </dd>
          </div>
          <div>
            <dt>측정 방법</dt>
            <dd>
              warm-up 2회 뒤 10회 중앙값 · 구간 측정과 전체 시간 측정을 분리 · 매 실행 Top-20 일치
              확인
            </dd>
          </div>
        </dl>
      </Block>

      <Pager id="market-scan" />
    </>
  )
}

// Measured on Colab, Tesla T4 (40 SM, CC 7.5), Intel Xeon 2.00GHz × 2 vCPU,
// CuPy 14.0.1, Numba 0.61.2. Source: market_results/e2e_breakdown.csv and
// summary.json from cuda_market_window_scan_v2.ipynb, data "1s, N=604,800".
// Medians over 10 runs after 2 warm-ups. `total` comes from a separate
// whole-path run, so the segments do not add up to it exactly.

export type Segment = { key: string; label: string; ms: number; where: "cpu" | "gpu" | "link" }

export type PathResult = {
  id: string
  label: string
  summary: string
  total: number
  segments: Segment[]
}

export const PATHS: PathResult[] = [
  {
    id: "1",
    label: "① 전체 결과 반환",
    summary: "GPU가 모든 후보의 특징을 계산하고, 전부 CPU로 가져와 순위와 후보를 고릅니다.",
    total: 2360.3,
    segments: [
      { key: "h2d", label: "CPU → GPU", ms: 1.8, where: "link" },
      { key: "features", label: "GPU 특징 계산", ms: 5.4, where: "gpu" },
      { key: "d2h", label: "GPU → CPU", ms: 34.3, where: "link" },
      { key: "cpu_post", label: "CPU 순위·후보 선별", ms: 2325.4, where: "cpu" },
    ],
  },
  {
    id: "2",
    label: "② GPU 순위 계산",
    summary: "순위(희귀도)를 GPU에서 계산하고 후보당 4 B만 CPU로 가져옵니다.",
    total: 81.7,
    segments: [
      { key: "h2d", label: "CPU → GPU", ms: 1.8, where: "link" },
      { key: "features", label: "GPU 특징 계산", ms: 5.4, where: "gpu" },
      { key: "rarity", label: "GPU 순위 계산", ms: 27.9, where: "gpu" },
      { key: "d2h", label: "GPU → CPU", ms: 7.9, where: "link" },
      { key: "cpu_post", label: "CPU 후보 선별", ms: 36.2, where: "cpu" },
    ],
  },
  {
    id: "3",
    label: "③ GPU 후보 선별",
    summary: "후보 선별까지 GPU에서 끝내고 필요한 후보만 CPU로 가져옵니다.",
    total: 37.9,
    segments: [
      { key: "h2d", label: "CPU → GPU", ms: 1.8, where: "link" },
      { key: "features", label: "GPU 특징 계산", ms: 5.4, where: "gpu" },
      { key: "rarity", label: "GPU 순위 계산", ms: 27.9, where: "gpu" },
      { key: "peaks", label: "GPU 후보 선별", ms: 1.8, where: "gpu" },
      { key: "d2h", label: "GPU → CPU", ms: 0.1, where: "link" },
      { key: "cpu_post", label: "CPU 정리", ms: 1.8, where: "cpu" },
    ],
  },
]

/** CPU-only (2 threads) for the same scan: features 910.6 + post 2,345.4. */
export const CPU_ONLY_TOTAL = 3401.2

/** market_results/correctness_gate.csv */
export const GATE = [
  {
    case: "GPU 특징 계산 (k-major)",
    expected: "PASS",
    result: "PASS",
    note: "min·max·range·volume 오차 0",
  },
  { case: "GPU 특징 계산 (s-major)", expected: "PASS", result: "PASS", note: "오차 0" },
  { case: "GPU 순위 카운트", expected: "PASS", result: "PASS", note: "정수 정확 일치" },
  { case: "GPU 후보 플래그", expected: "PASS", result: "PASS", note: "1,323개 정확 일치" },
  {
    case: "음성 대조군: 경계 조건 오류",
    expected: "FAIL",
    result: "FAIL",
    note: "NaN 위치 불일치로 검출",
  },
  {
    case: "음성 대조군: 창 길이 오류",
    expected: "FAIL",
    result: "FAIL",
    note: "NaN 위치 불일치로 검출",
  },
] as const

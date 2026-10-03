import styles from "./Profile.module.css"

const FACTS = [
  {
    label: "Education",
    main: "숭실대학교 컴퓨터학부",
    sub: "2023.03 – 2027.02 · GPA 4.13 / 4.5",
  },
  { label: "Qualification", main: "정보처리기사", sub: "2026.09 · 한국산업인력공단" },
  { label: "Language", main: "TOEIC Speaking AL · 160", sub: "TOEIC 855" },
]

// Technology grouped by what it was used for, each with the context it was
// used in. The four groups mirror BUILD / VERIFY / APPLY on the home page.
const STACK = [
  {
    group: "Application",
    items: [
      { tech: "Java / Spring Boot", use: "REST API, 상태 변화, 트랜잭션 기반 백엔드" },
      { tech: "Spring Security / JPA / Flyway", use: "인증, 데이터 접근, DB 변경 관리" },
    ],
  },
  {
    group: "Database & Verification",
    items: [
      { tech: "SQL / MySQL / InnoDB", use: "서비스 상태 관리와 DB 동시성 검증" },
      { tech: "Redis", use: "인증 관련 데이터 처리" },
      { tech: "Testcontainers / GitHub Actions", use: "반복 가능한 검증과 CI 흐름" },
    ],
  },
  {
    group: "Data & AI",
    items: [
      { tech: "TypeScript / LLM", use: "금융 문서와 공개 데이터의 분석·확인 흐름" },
      { tech: "Python / RAG / Agent", use: "검색 결과를 서비스 판정과 업무 처리 흐름에 연결" },
    ],
  },
  {
    group: "Performance",
    items: [
      {
        tech: "CUDA / CuPy / Numba / Nsight Systems",
        use: "GPU 병렬 처리, 데이터 이동, E2E 병목 분석",
      },
    ],
  },
  {
    group: "Infrastructure",
    items: [{ tech: "Docker / AWS / Kubernetes / CI/CD", use: "서비스 빌드·배포·업데이트·롤백" }],
  },
]

const TRAINING = [
  {
    name: "Co-op AI Cloud Track",
    org: "스파르탄SW교육원 · 2025.12–2026.01 · 90h",
    point: "서비스 변경을 배포와 운영까지 연결",
    flow: ["Docker", "Kubernetes", "CI/CD", "Rolling Update / Rollback"],
    note: "AWS EKS·K-PaaS에 배포하고, Build → Static Analysis → JUnit Test → Deployment 파이프라인을 구성했습니다.",
  },
  {
    name: "LLM Agent & RAG",
    org: "FuriosaAI / 숭실대 POLARIS · 2026.07–08 · 12h",
    point: "검색 결과를 실제 서비스 판단 과정에 연결",
    flow: ["Hybrid Search", "Re-ranking", "Tool Calling", "FastAPI"],
    note: "수하물 규정 확인 서비스 CarryCheck에서 검색 → 판정 → 설명을 잇고, 10개 평가 질문에서 Recall@3 1.00, 판정·Guardrail 평가 10/10을 확인했습니다.",
  },
  {
    name: "NVIDIA DLI · Modern CUDA C++",
    org: "NVIDIA Deep Learning Institute · 2026.09 · 12h",
    point: "측정 이후 병목을 개선하는 GPU 개발",
    flow: ["CUDA Kernel", "Stream", "Nsight Systems"],
    note: "최종 평가에서 Maxwell 방정식 시뮬레이터의 정확성 검증을 통과하고 목표보다 약 19.8% 높은 처리량을 달성했습니다.",
  },
]

const NEXT = [
  { name: "RAG", body: "운영 이력, 매뉴얼, 업무 문서에서 필요한 근거 검색" },
  { name: "Agent", body: "서비스 요청을 해석하고 관련 자료와 조치 항목 정리" },
  { name: "System Data", body: "로그와 SQL 등 실제 시스템 데이터를 함께 연결" },
]

export function Profile() {
  return (
    <section id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className={styles.frame}>
        <header className={styles.head}>
          <p className={styles.kicker}>PROFILE</p>
          <h2 id="profile-title" className={styles.title}>
            Engineering Profile
          </h2>
          <p className={styles.lead}>
            기능 구현부터 검증과 운영까지 이어지는 개발 경험을 쌓아 왔습니다.
          </p>
        </header>

        <dl className={styles.facts}>
          {FACTS.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt>{fact.label}</dt>
              <dd>
                <span className={styles.factMain}>{fact.main}</span>
                <span className={styles.factSub}>{fact.sub}</span>
              </dd>
            </div>
          ))}
        </dl>

        <section className={styles.part} aria-labelledby="p-stack">
          <h3 id="p-stack" className={styles.partTitle}>
            Technology by Use
          </h3>
          <div className={styles.stack}>
            {STACK.map((group) => (
              <div key={group.group} className={styles.stackGroup}>
                <h4 className={styles.groupName}>{group.group}</h4>
                <dl className={styles.stackList}>
                  {group.items.map((item) => (
                    <div key={item.tech}>
                      <dt>{item.tech}</dt>
                      <dd>{item.use}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.part} aria-labelledby="p-beyond">
          <h3 id="p-beyond" className={styles.partTitle}>
            Evidence Beyond Main Projects
          </h3>
          <article className={styles.beyond}>
            <div>
              <p className={styles.beyondKind}>App · Server · Device Integration</p>
              <h4 className={styles.beyondName}>BMW 코리아 미래재단 영 이노베이터 드림 프로젝트</h4>
              <p className={styles.beyondMeta}>
                2026.04–07 · 팀 프로젝트 · 디바이스 펌웨어와 서버 연동 담당
              </p>
              <p className={styles.beyondBody}>
                앱에 등록한 복약 일정이 서버를 거쳐 ESP32 디바이스에서 실행되고, 실행 결과가 다시
                앱에 기록되는 서비스입니다.
              </p>
              <p className={styles.tags}>ESP32 · FreeRTOS · MQTT · HTTP</p>
            </div>
            <ol className={styles.loop} aria-label="일정이 실행되고 결과가 돌아오는 흐름">
              <li>
                <span>App</span>복약 일정 입력
              </li>
              <li>
                <span>Server</span>일정 저장·전달
              </li>
              <li>
                <span>Device</span>ESP32에서 실행
              </li>
              <li>
                <span>App</span>실행 결과 기록·조회
              </li>
            </ol>
          </article>
        </section>

        <section className={styles.part} aria-labelledby="p-training">
          <h3 id="p-training" className={styles.partTitle}>
            Learning &amp; Applied Training
          </h3>
          <ul className={styles.training}>
            {TRAINING.map((item) => (
              <li key={item.name} className={styles.course}>
                <p className={styles.courseName}>{item.name}</p>
                <p className={styles.courseOrg}>{item.org}</p>
                <p className={styles.coursePoint}>{item.point}</p>
                <p className={styles.courseFlow}>
                  {item.flow.map((step, i) => (
                    <span key={step}>
                      {i > 0 && <span aria-hidden="true"> → </span>}
                      {step}
                    </span>
                  ))}
                </p>
                <p className={styles.courseNote}>{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.direction} aria-labelledby="p-next">
          <p className={styles.directionTag}>NEXT · 앞으로의 방향</p>
          <h3 id="p-next" className={styles.directionTitle}>
            What I want to build next
          </h3>
          <p className={styles.directionLead}>
            금융 업무에서 AI가 정보를 찾는 데서 끝나지 않고, 담당자가 바로 확인하고 다음 행동으로
            이어갈 수 있는 결과를 만드는 데 관심이 있습니다.
          </p>
          <ul className={styles.nextList}>
            {NEXT.map((item) => (
              <li key={item.name}>
                <span className={styles.nextName}>{item.name}</span>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
          <p className={styles.directionClose}>
            AI의 탐색 속도를 금융 시스템의 개발과 운영에 실제로 사용할 수 있는 결과로 연결하고
            싶습니다.
          </p>
        </section>
      </div>
    </section>
  )
}

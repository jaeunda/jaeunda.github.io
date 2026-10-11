import { Ext } from "../components/Page"
import { LINKS } from "../data/links"
import styles from "./Profile.module.css"

// Below the projects: what the three cases leave out, kept short. Technology
// is listed with where it was used, not as logos.
const TOOLKIT = [
  {
    group: "Languages",
    items: [
      { tech: "Java", use: "Spring Boot 백엔드, weavegate Java 연동 라이브러리" },
      { tech: "Python", use: "데이터 전처리·분석, RAG 서비스" },
      { tech: "SQL", use: "데이터 정합성 조건 작성, 제약·잠금 설계" },
      { tech: "Go", use: "DB 정합성 검증 도구" },
      { tech: "C++17", use: "대용량 시계열 처리 엔진" },
      { tech: "TypeScript", use: "데이터 표준화·검증 시스템" },
    ],
  },
  {
    group: "Backend & Data",
    items: [
      { tech: "Spring Boot · JPA · Flyway", use: "상태 전이 API, DB 스키마 변경 관리" },
      { tech: "MySQL / InnoDB", use: "격리 수준, 행 잠금, 고유 인덱스로 정합성 확보" },
      { tech: "Redis", use: "인증 데이터 처리 (팀 프로젝트)" },
      { tech: "데이터 표준화·검증", use: "이종 형식 변환, 결과 해시 비교, 십진수 연산" },
    ],
  },
  {
    group: "Systems & Performance",
    items: [
      { tech: "OpenMP", use: "시행 단위 병렬 처리, 스레드 확장성 측정" },
      { tech: "CUDA", use: "GPU 병렬 처리 경로 구현, NVIDIA DLI 이수" },
      { tech: "성능 측정", use: "판정 기준 사전 확정, 정확성 검사, 반복 측정" },
    ],
  },
  {
    group: "Infrastructure & Automation",
    items: [
      { tech: "GitHub Actions", use: "Marketplace 액션 배포, CI 검증 자동화" },
      { tech: "Docker · Testcontainers", use: "실행마다 초기화되는 MySQL 검증 환경" },
      { tech: "AWS", use: "EC2 성능 실험, ECR·EC2 배포 (팀 프로젝트)" },
      { tech: "Kubernetes", use: "AWS EKS 배포와 롤링 업데이트 (교육 과정)" },
    ],
  },
  {
    group: "AI & Evaluation",
    items: [
      { tech: "RAG · Hybrid Search", use: "BM25와 임베딩 검색 결과를 RRF로 결합" },
      { tech: "LLM 출력 검증", use: "응답 형식 검사, 판정·출처 불일치 응답 거부" },
      { tech: "평가 하네스", use: "고정 평가 데이터와 사전 품질 기준으로 자동 판정" },
      { tech: "통계적 검증", use: "Clopper–Pearson 신뢰구간 계산과 검증" },
    ],
  },
  {
    group: "Security",
    items: [
      { tech: "입력·출력 검증", use: "외부 입력과 모델 응답의 형식·허용 값 검사" },
      { tech: "프롬프트 주입 대응", use: "공격 문구 회귀 테스트로 지시 추종 여부 점검" },
    ],
  },
]

const LEARNING = [
  { name: "숭실대학교 컴퓨터학부", detail: "2023.03 – 2027.02 졸업 예정" },
  { name: "정보처리기사", detail: "2026.09 취득" },
  {
    name: "Co-op AI Cloud Track",
    detail: "2025.12 – 2026.01 · 90시간 · Docker, Kubernetes(AWS EKS), CI/CD 파이프라인 구축",
  },
  {
    name: "GPU/NPU 기반 RAG·LLM Agent 실습",
    detail: "2026.07 – 08 · Hybrid Search, Tool Calling, RAG 서비스 구현 (CarryCheck)",
  },
  {
    name: "NVIDIA DLI · Modern CUDA C++",
    detail: "2026.09 · CUDA 커널 작성, Stream, Nsight Systems 성능 분석",
  },
]

export function Profile() {
  return (
    <section id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className={styles.frame}>
        <header className={styles.head}>
          <p className={styles.kicker}>Profile</p>
          <h2 id="profile-title" className={styles.title}>
            장다은 <span>Jang Daeun</span>
          </h2>
          <p className={styles.intro}>
            데이터베이스 정합성, 대용량 데이터 처리, AI 출력 검증을 중심으로 개발해 왔습니다. 처리
            결과는 SQL 조건과 고정된 규칙으로 판정하고, 같은 조건에서 다시 실행할 수 있도록 검증
            과정을 자동화합니다.
          </p>
        </header>

        <section className={styles.part} aria-labelledby="p-work">
          <h3 id="p-work" className={styles.partTitle}>
            Additional Work
          </h3>
          <div className={styles.work}>
            <article className={styles.workItem}>
              <p className={styles.workMeta}>팀 프로젝트 · 4인 · 팀장, 백엔드</p>
              <h4 className={styles.workName}>
                TeamPo <span>팀 매칭·협업 플랫폼 백엔드</span>
              </h4>
              <p className={styles.workBody}>
                매칭 신청, 자동 매칭, 수락·거절, 취소·탈퇴로 이어지는 상태 전이를 Java/Spring Boot로
                구현했습니다. 동시 요청은 ID 순서로 행을 잠근 뒤 다시 조회해 처리하고, 사용자당 진행
                중인 요청이 하나만 저장되도록 DB 고유 인덱스를 적용했습니다.
              </p>
              <ul className={styles.mine}>
                <li>
                  <b>내 구현</b> 매칭 도메인, 60초 주기 자동 매칭 스케줄러, 탈퇴·수락 동시 처리의
                  잠금 순서 통일(
                  <Ext href={LINKS.teampo.withdrawal}>#97</Ext>), 커밋 후 비동기 알림(
                  <Ext href={LINKS.teampo.matching}>#37</Ext>), Gemini 기반 개발 가이드 생성과 필수
                  항목 검증
                </li>
                <li>
                  <b>팀 구현</b> Spring Security·Redis 인증, Docker·AWS ECR/EC2·GitHub Actions 배포
                </li>
              </ul>
              <p className={styles.tags}>
                Java · Spring Boot · JPA · MySQL · Flyway · Redis · Docker · AWS
              </p>
              <Ext href={LINKS.teampo.repo} className={styles.repo}>
                Team-po/Server ↗
              </Ext>
            </article>

            <article className={styles.workItem}>
              <p className={styles.workMeta}>
                교육 과정 팀 프로젝트 · 2026.07–08 · 공개 저장소 관리
              </p>
              <h4 className={styles.workName}>
                CarryCheck <span>공식 규정 기반 수하물 RAG 에이전트</span>
              </h4>
              <p className={styles.workBody}>
                BM25와 임베딩 검색 결과를 RRF로 결합해 공식 규정을 찾고, 용량 계산과 허용 여부
                판정은 규칙 엔진이 처리합니다. LLM 설명의 판정 상태나 출처 ID가 규칙 엔진 결과와
                다르면 응답을 거부합니다.
              </p>
              <ul className={styles.mine}>
                <li>
                  <b>발표 측정</b> 선별 질문 10개에서 Recall@3 1.00, 판정 일치 10/10, Guardrail
                  10/10. 같은 요청 1건에서 근거 선별로 토큰 4,396 → 2,699(−38.6%)
                </li>
              </ul>
              <p className={styles.tags}>
                Python · FastAPI · BM25 · Embedding · RRF · Tool Calling
              </p>
              <Ext href={LINKS.carrycheck.repo} className={styles.repo}>
                jaeunda/CarryCheck ↗
              </Ext>
            </article>
          </div>
        </section>

        <section className={styles.part} aria-labelledby="p-toolkit">
          <h3 id="p-toolkit" className={styles.partTitle}>
            Technical Toolkit
          </h3>
          <div className={styles.toolkit}>
            {TOOLKIT.map((group) => (
              <div key={group.group} className={styles.toolGroup}>
                <h4 className={styles.groupName}>{group.group}</h4>
                <dl className={styles.toolList}>
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

        <section className={styles.part} aria-labelledby="p-learning">
          <h3 id="p-learning" className={styles.partTitle}>
            Education & Learning
          </h3>
          <dl className={styles.learning}>
            {LEARNING.map((item) => (
              <div key={item.name}>
                <dt>{item.name}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  )
}

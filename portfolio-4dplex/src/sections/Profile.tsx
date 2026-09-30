import { Block, Ext, Section } from "../components/Section"
import { LINKS } from "../data/links"
import s from "./Profile.module.css"

const LANGUAGES = [
  { name: "C", use: "FreeRTOS 펌웨어와 Linux 시스템 프로그래밍, xv6 커널 확장" },
  { name: "Go", use: "weavegate 자동화 도구" },
  { name: "Java / Spring Boot", use: "서버 애플리케이션과 시스템 연동" },
  { name: "CUDA C++", use: "GPU 병렬 처리와 성능 분석 실습" },
]

const SYSTEMS = [
  { name: "Linux", use: "시스템 호출 기반 도구 구현" },
  { name: "FreeRTOS", use: "Ongi 펌웨어의 태스크와 큐, mutex" },
  { name: "xv6", use: "커널 네 영역 확장" },
  { name: "ESP32", use: "Ongi 디바이스" },
  { name: "I2C / PWM", use: "센서 입력과 서보 모터 구동" },
  { name: "MQTT / HTTP", use: "서버–디바이스 통신" },
]

const VERIFICATION = [
  { name: "MySQL / InnoDB", use: "weavegate의 검증 대상 데이터베이스" },
  { name: "Testcontainers", use: "반복 가능한 시험 환경" },
  { name: "GitHub Actions", use: "Pull Request 검증과 펌웨어 CI 빌드" },
  { name: "Docker", use: "시험용 MySQL 컨테이너" },
  { name: "Git", use: "PR 단위 개발과 기록" },
  { name: "GDB", use: "xv6 커널 디버깅" },
  { name: "Nsight Systems", use: "GPU 실행 프로파일링" },
  { name: "Thrust / CUB", use: "GPU 병렬 알고리즘과 커널 작성" },
]

const REPOS = [
  { name: "Ongi-Team/ongi-device", what: "Ongi 디바이스 펌웨어", href: LINKS.ongi.repo },
  { name: "weavegate/weavegate", what: "동시성 오류 검증 자동화 도구", href: LINKS.weavegate.repo },
  { name: "jaeunda/operating-system", what: "xv6 커널 확장", href: LINKS.os.repo },
  { name: "jaeunda/lsp-p1", what: "파일 정리 도구", href: LINKS.lsp.p1 },
  { name: "jaeunda/lsp-p2", what: "디렉터리 감시 데몬", href: LINKS.lsp.p2 },
  { name: "jaeunda/lsp-p3", what: "ext2 파일시스템 분석기", href: LINKS.lsp.p3 },
]

function Group({ title, items }: { title: string; items: { name: string; use: string }[] }) {
  return (
    <div className={s.group}>
      <h4 className={s.groupK}>{title}</h4>
      <dl className={s.uses}>
        {items.map((item) => (
          <div key={item.name}>
            <dt>{item.name}</dt>
            <dd>{item.use}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function Profile() {
  return (
    <Section
      id="profile"
      label="Engineering Profile"
      name="Profile"
      tagline="기술 스택과 학력, 저장소"
      message="각 기술을 어디에 사용했는지와 함께 정리했습니다."
      meta={[
        { k: "학력", v: "숭실대학교 컴퓨터학부" },
        { k: "졸업", v: "2027.02 졸업예정" },
        { k: "평점", v: "4.13 / 4.5" },
        { k: "GitHub", v: <Ext href={LINKS.github}>github.com/jaeunda</Ext> },
      ]}
    >
      <Block label="Technical Stack" title="사용한 기술과 사용한 곳">
        <div className={s.stack}>
          <Group title="Languages" items={LANGUAGES} />
          <Group title="Systems" items={SYSTEMS} />
          <Group title="Verification & Infrastructure" items={VERIFICATION} />
        </div>
      </Block>

      <Block label="Project Repositories" title="코드로 확인할 수 있는 곳">
        <ul className={s.repos}>
          {REPOS.map((repo) => (
            <li key={repo.name}>
              <Ext href={repo.href}>{repo.name}</Ext>
              <span>{repo.what}</span>
            </li>
          ))}
        </ul>
      </Block>
    </Section>
  )
}

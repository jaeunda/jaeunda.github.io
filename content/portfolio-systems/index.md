---
title: Portfolio
description: 장다은 — 서로 다른 시스템을 연동하고 실제 장비와 환경에서 검증합니다.
unlisted: true
cssclasses:
  - portfolio-shell
  - portfolio-systems
---

<div class="pf-bar">
  <div class="pf-bar-in">
    <a class="pf-bar-id" href="#top"><b>장다은</b><span>Portfolio</span></a>
    <nav class="pf-bar-nav" aria-label="페이지 이동">
      <a href="/portfolio-systems/teampo">협업 플랫폼</a>
      <a href="/portfolio-systems/weavegate">검증 도구</a>
      <a href="/portfolio-systems/ongi">IoT 서비스</a>
      <a href="/portfolio-systems/foundation">Foundation</a>
      <a href="#profile">프로필</a>
    </nav>
  </div>
</div>
<header class="pf-hero" id="top">
  <div class="pf-hero-in">
    <p class="pf-eyebrow"><span class="pf-dot"></span>숭실대학교 컴퓨터학부 <i>|</i> 2027.02 졸업예정</p>
    <h1 class="pf-display">서로 다른 시스템을 연동하고<br /><em class="ps-em">실제 장비와 환경에서 검증</em>합니다</h1>
    <p class="pf-deck">AI 기능을 백엔드 서비스에 연결하고 컨테이너로 배포합니다.<br />디바이스와 서버의 연동은 실물 통합 시험까지 확인합니다.</p>
    <ul class="pf-caps">
      <li>AI · 백엔드 연동</li>
      <li>컨테이너 배포 · CI/CD</li>
      <li>디바이스–서버 통신 연동</li>
      <li>Linux C 시스템 프로그래밍</li>
    </ul>
    <ul class="pf-ev pf-ev--3">
      <li class="pf-ev-card">
        <p class="pf-ev-tag"><span>Project 01</span>RISE 캡스톤디자인 프로젝트</p>
        <p class="pf-ev-title">초보 개발자를 위한 협업 플랫폼</p>
        <p class="pf-ev-one">외부 AI API를 백엔드 처리 흐름에 연결하고, 컨테이너 배포와 롤백을 자동화한 Spring&nbsp;Boot 서비스</p>
        <ol class="ps-mini" aria-label="구조"><li>REST API</li><li>비동기 AI</li><li>Schema 검증</li><li>EC2</li></ol>
        <div class="pf-ev-nums">
          <div><b>커밋 후 호출</b><span>AI 응답이 늦어도 팀 생성은 바로 완료</span></div>
          <div><b>헬스체크 롤백</b><span>새 컨테이너가 통과해야 전환, 실패하면 이전 버전</span></div>
        </div>
        <p class="pf-ev-foot"><span class="pf-ev-stack">Java <i>|</i> Spring Boot <i>|</i> AWS</span><a class="pf-ev-go" href="/portfolio-systems/teampo">구조와 설계 판단</a></p>
      </li>
      <li class="pf-ev-card">
        <p class="pf-ev-tag"><span>Project 02</span>2026 오픈소스 개발자대회</p>
        <p class="pf-ev-title">DB 동시성 오류 검증 자동화 도구</p>
        <p class="pf-ev-one">DB 워크플로의 실행 순서를 고정해, 수정 전후를 같은 순서로 CI에서 다시 검증하는 replay&nbsp;gate</p>
        <ol class="ps-mini" aria-label="구조"><li>Sync-point</li><li>순서 탐색</li><li>SQL oracle</li><li>Replay</li></ol>
        <div class="pf-ev-nums">
          <div><b>20/20 → 0/20</b><span>같은 순서에서 수정 전 20회 위반, 수정 후 0회</span></div>
          <div><b>8.78s</b><span>40회 반복 검증에 걸린 시간</span></div>
        </div>
        <p class="pf-ev-foot"><span class="pf-ev-stack">Go <i>|</i> MySQL <i>|</i> Testcontainers</span><a class="pf-ev-go" href="/portfolio-systems/weavegate">구조와 설계 판단</a></p>
      </li>
      <li class="pf-ev-card">
        <p class="pf-ev-tag"><span>Project 03</span>2026 BMW 영 이노베이터 드림 프로젝트</p>
        <p class="pf-ev-title">스마트 복약 케어 IoT 서비스</p>
        <p class="pf-ev-one">앱·서버·디바이스를 하나로 잇는 ESP32 펌웨어와 서버–디바이스 통신 연동</p>
        <ol class="ps-mini" aria-label="구조"><li>App</li><li>Server</li><li>ESP32</li><li>Servo · ADC</li></ol>
        <div class="pf-ev-nums">
          <div><b>단일 제어 경로</b><span>예약·원격 명령을 motor task 하나로 모아 동시 구동을 차단</span></div>
          <div><b>실물 E2E</b><span>앱 → 서버 → 기기 → 센서 → 서버 → 앱 시연</span></div>
        </div>
        <p class="pf-ev-foot"><span class="pf-ev-stack">C <i>|</i> FreeRTOS <i>|</i> MQTT</span><a class="pf-ev-go" href="/portfolio-systems/ongi">구조와 설계 판단</a></p>
      </li>
    </ul>
    <a class="pf-cue" href="#foundation"><i class="pf-cue-a" aria-hidden="true"></i><span>Linux C로 다진 시스템 기반</span></a>
  </div>
</header>
<main class="pf-main">
  <section class="pf-block" id="foundation">
    <div class="pf-block-h">
      <p class="pf-idx">Foundation</p>
      <h2 class="pf-h">Linux C로 다진 시스템 기반</h2>
      <p class="pf-lead">프로젝트에서 반복된 질문, 같은 자원을 누가 언제 어떤 순서로 쓰는가를 Linux 시스템 호출과 xv6 커널 수준에서 C로 먼저 구현했습니다. 컨테이너 배포와 AI 추론 환경은 교육 과정에서 실습했습니다.</p>
    </div>
    <div class="pf-group">
      <p class="pf-group-k">전공 프로젝트<a class="ps-go" href="/portfolio-systems/foundation">구현 범위와 설계 판단</a></p>
      <ul class="pf-cards3">
        <li>
          <p class="pf-card-m">2025.03 — 2025.06 <i>|</i> 리눅스 시스템 프로그래밍</p>
          <h3 class="pf-card-t">Linux 데몬·파일시스템 분석기 구현</h3>
          <ul class="pf-li pf-li--sm">
            <li>파일 관리 프로그램, 백그라운드 데몬, 파일시스템 분석기를 C로 구현했습니다.</li>
            <li>여러 프로세스가 같은 파일을 쓸 때 파일&nbsp;잠금으로 충돌을 막았습니다.</li>
            <li>종료 요청을 받으면 진행 중인 작업을 정리한 뒤 안전하게 끝나도록 했습니다.</li>
          </ul>
          <p class="pf-card-l"><span>github.com/jaeunda/</span><a href="https://github.com/jaeunda/lsp-p1">lsp-p1</a><i>|</i><a href="https://github.com/jaeunda/lsp-p2">lsp-p2</a><i>|</i><a href="https://github.com/jaeunda/lsp-p3">lsp-p3</a></p>
        </li>
        <li>
          <p class="pf-card-m">2025.09 — 2025.12 <i>|</i> 운영체제</p>
          <h3 class="pf-card-t">xv6 커널 확장</h3>
          <ul class="pf-li pf-li--sm">
            <li>시스템 호출, CPU 스케줄링, 메모리 관리, 파일시스템을 네&nbsp;차례에&nbsp;걸쳐 C로 확장했습니다.</li>
            <li>파일시스템에 수정 시점으로 블록을 분리하는 스냅샷 기능을 더했습니다.</li>
            <li>잠금 순서와 참조&nbsp;횟수가 어긋나는 문제를 GDB와 실행 로그로 추적해 고쳤습니다.</li>
          </ul>
          <p class="pf-card-l"><a href="https://github.com/jaeunda/operating-system">github.com/jaeunda/operating-system</a></p>
        </li>
        <li>
          <p class="pf-card-m">2025.09 — 2025.12 <i>|</i> 컴파일러</p>
          <h3 class="pf-card-t">C 컴파일러 구현</h3>
          <ul class="pf-li pf-li--sm">
            <li>C 코드를 구문 분석하고 변수와 자료형의 의미를 검사했습니다.</li>
            <li>검사한 결과를 실행 명령으로 바꾸는 과정을 단계별로 구현했습니다.</li>
            <li>앞&nbsp;단계의 분석 정보를 뒤&nbsp;단계가 정확히 쓰도록 자료구조와 오류&nbsp;검사를 분리했습니다.</li>
          </ul>
          <p class="pf-card-l"><a href="https://github.com/jaeunda/compiler">github.com/jaeunda/compiler</a></p>
        </li>
      </ul>
    </div>
    <div class="pf-group">
      <p class="pf-group-k">교육 과정</p>
      <ul class="pf-cards3">
        <li>
          <p class="pf-card-m">2025.12 — 2026.01 <i>|</i> 스파르탄SW교육원 <i>|</i> 90시간</p>
          <h3 class="pf-card-t">Co-op AI Cloud Track</h3>
          <p class="ps-card-one">Docker 이미지를 ECR에 등록하고 AWS EKS와 K‑PaaS의 Kubernetes 클러스터에 배포했습니다. 롤링 업데이트·롤백과 CI/CD 파이프라인을 실습했습니다.</p>
        </li>
        <li>
          <p class="pf-card-m">2026.07 — 2026.08 <i>|</i> FuriosaAI <i>|</i> 12시간</p>
          <h3 class="pf-card-t">GPU/NPU 기반 LLM Agent와 RAG</h3>
          <p class="ps-card-one">NPU 환경에서 LLM 추론을 실습하고, RAG 파이프라인과 Tool Calling을 연결한 AI 애플리케이션을 구현했습니다.</p>
        </li>
        <li>
          <p class="pf-card-m">2026.09 <i>|</i> NVIDIA Deep Learning Institute</p>
          <h3 class="pf-card-t">Fundamentals of Accelerated Computing with Modern CUDA C++</h3>
          <p class="ps-card-one">GPU 커널 병렬화와 CUDA Stream을 적용하고 Nsight로 병목을 분석해 목표 대비 약 19.8% 높은 처리량을 얻었습니다.</p>
        </li>
      </ul>
    </div>
  </section>
  <section class="pf-block" id="stack">
    <div class="pf-block-h">
      <p class="pf-idx">Stack</p>
      <h2 class="pf-h">기술 스택</h2>
    </div>
    <ul class="pf-stack">
      <li>
        <p class="pf-stack-k">언어</p>
        <p class="pf-stack-v"><span>Java</span><span>Python</span><span>C</span><span>Go</span><span>TypeScript</span><span>CUDA C++</span></p>
      </li>
      <li>
        <p class="pf-stack-k">서버·데이터</p>
        <p class="pf-stack-v"><span>Spring Boot</span><span>JPA</span><span>MySQL</span><span>InnoDB</span><span>Redis</span></p>
      </li>
      <li>
        <p class="pf-stack-k">인프라</p>
        <p class="pf-stack-v"><span>Docker</span><span>GitHub Actions</span><span>AWS</span><span>Testcontainers</span><span>Kubernetes</span></p>
      </li>
      <li>
        <p class="pf-stack-k">AI 연동</p>
        <p class="pf-stack-v"><span>Gemini API</span><span>LLM API</span><span>RAG</span><span>Tool Calling</span></p>
      </li>
      <li>
        <p class="pf-stack-k">통신</p>
        <p class="pf-stack-v"><span>MQTT</span><span>HTTP / REST</span><span>SNTP</span><span>TLS</span></p>
      </li>
      <li>
        <p class="pf-stack-k">임베디드</p>
        <p class="pf-stack-v"><span>ESP32</span><span>ESP-IDF</span><span>FreeRTOS</span><span>I2C</span><span>PWM</span><span>ADS1115</span></p>
      </li>
      <li>
        <p class="pf-stack-k">시스템</p>
        <p class="pf-stack-v"><span>Linux</span><span>POSIX</span><span>xv6</span><span>GDB</span><span>ext2</span></p>
      </li>
    </ul>
  </section>
  <section class="pf-block" id="profile">
    <div class="pf-block-h">
      <p class="pf-idx">Profile</p>
      <h2 class="pf-h">활동과 프로필</h2>
    </div>
    <div class="pf-profile">
      <div class="pf-profile-main">
        <p class="pf-profile-k">활동</p>
        <ol class="pf-time">
          <li>
            <p class="pf-time-w">2026.06 — 진행 중</p>
            <div class="pf-time-b">
              <p class="pf-time-t">2026 오픈소스 개발자대회<span>정보통신산업진흥원</span></p>
              <p class="pf-time-d">DB 동시성 오류의 실행 순서를 저장해 CI에서 같은 조건으로 재검증하는 도구를 단독 개발</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.07 — 진행 중</p>
            <div class="pf-time-b">
              <p class="pf-time-t">2026 금융 AI Challenge<span>금융보안원</span></p>
              <p class="pf-time-d">AI 분석 결과를 원문과 코드로 재검증하는 금융 분석 서비스를 단독 개발</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.09</p>
            <div class="pf-time-b">
              <p class="pf-time-t">Fundamentals of Accelerated Computing with Modern CUDA C++<span>NVIDIA Deep Learning Institute</span></p>
              <p class="pf-time-d">CPU 연산을 GPU로 병렬화하고 병목을 측정해 처리량 개선</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.07 — 2026.08</p>
            <div class="pf-time-b">
              <p class="pf-time-t">GPU/NPU 기반 LLM Agent와 RAG 실습<span>FuriosaAI</span></p>
              <p class="pf-time-d">NPU 환경에서 LLM 추론, Tool Calling, RAG를 실습</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.04 — 2026.07</p>
            <div class="pf-time-b">
              <p class="pf-time-t">2026 BMW 영 이노베이터 드림 프로젝트<span>BMW 코리아 미래재단</span></p>
              <p class="pf-time-d">ESP32 펌웨어와 서버 통신을 맡아 IoT 서비스 전 구간을 연동</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.03 — 2026.06</p>
            <div class="pf-time-b">
              <p class="pf-time-t">RISE 캡스톤디자인 프로젝트<span>숭실대학교 RISE사업단</span></p>
              <p class="pf-time-d">팀장으로 협업 플랫폼의 백엔드와 배포 환경을 설계</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2026.01</p>
            <div class="pf-time-b">
              <p class="pf-time-t">AAAI-26 Conference on Artificial Intelligence<span>Singapore</span></p>
              <p class="pf-time-d">국제 학술대회 세션 참관과 난양공과대학교 방문</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2025.12 — 2026.01</p>
            <div class="pf-time-b">
              <p class="pf-time-t">Co-op AI Cloud Track<span>스파르탄SW교육원</span></p>
              <p class="pf-time-d">90시간 동안 컨테이너 배포와 CI/CD 파이프라인 구성을 실습</p>
            </div>
          </li>
          <li>
            <p class="pf-time-w">2025.09 — 2026.08</p>
            <div class="pf-time-b">
              <p class="pf-time-t">GDGoC 5기<span>Google Developer Groups on Campus</span></p>
              <p class="pf-time-d">운영체제 주제 세미나 발표와 CS 스터디 참여</p>
            </div>
          </li>
        </ol>
      </div>
      <aside class="pf-card-side">
        <div class="pf-sum-g">
          <p class="pf-sum-k">학력</p>
          <p class="pf-sum-v">숭실대학교 컴퓨터학부</p>
          <p class="pf-sum-s">2027.02 졸업예정 <i>|</i> 평점 4.13 / 4.5</p>
        </div>
        <div class="pf-sum-g">
          <p class="pf-sum-k">자격</p>
          <ul class="pf-sum-l">
            <li><b>정보처리기사</b><span><span>2026.09</span></span></li>
          </ul>
        </div>
        <div class="pf-sum-g">
          <p class="pf-sum-k">어학</p>
          <ul class="pf-sum-l pf-sum-l--score">
            <li><b>TOEIC</b><span><span>855</span></span></li>
            <li><b>TOEIC Speaking</b><span><span>Advanced Low</span></span></li>
          </ul>
        </div>
        <div class="pf-sum-g">
          <p class="pf-sum-k">링크</p>
          <ul class="pf-links">
            <li><a href="https://github.com/jaeunda"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>github.com/jaeunda</a></li>
            <li><a href="/"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm5.9 5.6h-2.2a12.6 12.6 0 0 0-1-2.8 6.5 6.5 0 0 1 3.2 2.8ZM8 1.6c.6.8 1.1 1.9 1.4 3.2H6.6c.3-1.3.8-2.4 1.4-3.2ZM1.6 8c0-.5.1-1 .2-1.4h2.5a13.7 13.7 0 0 0 0 2.8H1.8A6.4 6.4 0 0 1 1.6 8Zm.7 2.4h2.2c.2 1 .5 2 1 2.8a6.5 6.5 0 0 1-3.2-2.8Zm2.2-4.8H2.3a6.5 6.5 0 0 1 3.2-2.8c-.5.8-.8 1.8-1 2.8ZM8 14.4c-.6-.8-1.1-1.9-1.4-3.2h2.8c-.3 1.3-.8 2.4-1.4 3.2Zm1.7-4.8H6.3a12.4 12.4 0 0 1 0-3.2h3.4a12.4 12.4 0 0 1 0 3.2Zm.8 3.6c.5-.8.8-1.8 1-2.8h2.2a6.5 6.5 0 0 1-3.2 2.8Zm1.2-4.4a13.7 13.7 0 0 0 0-2.8h2.5a6.4 6.4 0 0 1 0 2.8h-2.5Z"/></svg>jaeunda.github.io</a></li>
            <li><a href="mailto:jaeunda@gmail.com"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3h13c.28 0 .5.22.5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9c0-.28.22-.5.5-.5Zm.5 1.7v7.3h12V4.7L8 8.9 2 4.7Zm11-.7H3l5 3.5L13 4Z"/></svg>jaeunda@gmail.com</a></li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</main>
<footer class="pf-foot">
  <p class="pf-foot-l"><a href="mailto:jaeunda@gmail.com">jaeunda@gmail.com</a><a href="https://github.com/jaeunda">github.com/jaeunda</a></p>
  <p class="pf-foot-r">2026.09</p>
</footer>

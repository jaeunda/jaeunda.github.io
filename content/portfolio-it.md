---
title: Portfolio
description: 장다은 — 금융 AI 분석 결과 검증, DB 동시성 제어, CI 검증 자동화.
unlisted: true
cssclasses:
  - portfolio-shell
---

<div class="pf-bar">
  <div class="pf-bar-in">
    <a class="pf-bar-id" href="#top"><b>장다은</b></a>
    <nav class="pf-bar-nav" aria-label="섹션 바로가기">
      <a href="#case-weavetrail">WeaveTrail</a>
      <a href="#case-weavegate">weavegate</a>
      <a href="#build">프로젝트</a>
      <a href="#interests">관심사</a>
      <a href="#stack">스택</a>
      <a href="#foundation">교육</a>
      <a href="#profile">프로필</a>
    </nav>
  </div>
</div>
<header class="pf-hero" id="top">
  <div class="pf-hero-in">
    <p class="pf-eyebrow"><span class="pf-dot"></span>숭실대학교 컴퓨터학부 <i>|</i> 2027.02 졸업예정</p>
    <h1 class="pf-display">금융 AI 분석 결과를 <em class="pf-hl">원문까지 추적</em>하고<br />DB 동시성 오류를 <em class="pf-hl">CI에서 자동 검증</em>합니다</h1>
    <p class="pf-deck">두 서비스를 기획부터 검증까지 단독으로 개발했습니다.<br />결과는 반복 실행에서 재현되는 수치로 확인했습니다.</p>
    <ul class="pf-caps">
      <li>AI 결과 검증</li>
      <li>DB 동시성 제어</li>
      <li>CI 검증 자동화</li>
    </ul>
    <ul class="pf-ev">
      <li class="pf-ev-card">
        <p class="pf-ev-tag"><span>Evidence 01</span>2026 금융 AI Challenge</p>
        <p class="pf-ev-title">WeaveTrail</p>
        <p class="pf-ev-one">금융당국 공식 발표와 공개 시장 데이터를 사건 단위로 연결한 TypeScript&nbsp;웹&nbsp;서비스</p>
        <div class="pf-ev-nums">
          <div><b>66/66</b><span>다시 요청한 원문이 바이트까지 일치</span></div>
          <div><b>1,269</b><span>정합성과 실패 경로 테스트 통과</span></div>
        </div>
        <p class="pf-ev-foot"><span class="pf-ev-stack">TypeScript <i>|</i> LLM <i>|</i> SHA-256</span><a class="pf-ev-go" href="#case-weavetrail">설계 보기</a></p>
      </li>
      <li class="pf-ev-card">
        <p class="pf-ev-tag"><span>Evidence 02</span>2026 오픈소스 개발자대회</p>
        <p class="pf-ev-title">weavegate</p>
        <p class="pf-ev-one">Spring Boot 서비스에 연결해 DB 동시성 오류를 자동 검증하는 CI&nbsp;도구</p>
        <div class="pf-ev-nums">
          <div><b>20/20 → 0/20</b><span>20회 모두 재현, 수정 후 0회</span></div>
          <div><b>8.78s</b><span>40회 반복 검증에 걸린 시간</span></div>
        </div>
        <p class="pf-ev-foot"><span class="pf-ev-stack">Go <i>|</i> MySQL <i>|</i> GitHub Actions</span><a class="pf-ev-go" href="#case-weavegate">구현 보기</a></p>
      </li>
    </ul>
    <a class="pf-cue" href="#case-weavetrail"><i class="pf-cue-a" aria-hidden="true"></i><span>문제 정의부터 검증까지</span></a>
  </div>
</header>
<main class="pf-main">
  <article class="pf-case" id="case-weavetrail">
    <div class="pf-case-top">
      <p class="pf-idx">Case 01</p>
      <h2 class="pf-case-h">WeaveTrail</h2>
      <p class="pf-case-sub">AI 결과를 사람이 재검증하고 원천자료까지 추적하는 금융&nbsp;분석&nbsp;서비스입니다.<br />LLM이 제안하고 사람이 확정하며 코드가 다시 계산합니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.07 — 진행 중</li>
        <li><span>역할</span>기획부터 검증까지 단독</li>
        <li><span>출품</span>2026 금융 AI Challenge <i>|</i> 금융보안원</li>
        <li><span>서비스</span><a href="https://weavetrail.site">weavetrail.site</a></li>
        <li><span>저장소</span><a href="https://github.com/WeaveTrail/WeaveTrail">github.com/WeaveTrail/WeaveTrail</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">이상거래 후보를 찾아낸 다음<br />그 판단은 어떻게 다시 확인하는가</p>
        <ul class="pf-li">
          <li>같은 정보도 기관마다 필드명과 시간 형식이 다릅니다.</li>
          <li>위험 점수와 요약만 남으면 근거 자료를 되짚을 수 없습니다.</li>
          <li>판단이 자산에 영향을 주는 영역에서는 AI 출력을 그대로 쓸 수 없습니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계</p>
      <div class="pf-sec-b">
        <ol class="pf-dec">
          <li>
            <p class="pf-dec-n">D1</p>
            <p class="pf-dec-t">AI는 제안까지만 담당한다</p>
            <p class="pf-dec-d">LLM이 문서 구조화, 확인할 주장 추출, 필드&nbsp;의미&nbsp;해석을 제안합니다. 사람이 확정한 항목만 이후 분석에 들어갑니다.</p>
          </li>
          <li>
            <p class="pf-dec-n">D2</p>
            <p class="pf-dec-t">해석과 검증을 분리한다</p>
            <p class="pf-dec-d">인용문은 원문과 문자열로 대조합니다. 수치는 고정된 코드로 다시 계산합니다. 최종 값은 재현&nbsp;가능한 경로에서만 나옵니다.</p>
          </li>
          <li>
            <p class="pf-dec-n">D3</p>
            <p class="pf-dec-t">사용한 자료를 그대로 보존한다</p>
            <p class="pf-dec-d">원천 자료의 snapshot과 SHA-256을 저장합니다. 분석 결과에서 그 시점 원문까지 역추적합니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">처리 흐름</p>
      <div class="pf-sec-b">
        <ol class="pf-flow">
          <li data-zone="in"><b>01</b><span class="pf-fl-t">수집과 연결</span><span class="pf-fl-d">공식 발표와 시장 데이터를 사건&nbsp;단위로 연결</span></li>
          <li data-zone="ai"><b>02</b><span class="pf-fl-t">AI 제안</span><span class="pf-fl-d">문서 구조화와 확인할 주장&nbsp;추출</span></li>
          <li data-zone="code"><b>03</b><span class="pf-fl-t">사람 확정</span><span class="pf-fl-d">확정한 항목만 분석에 반영</span></li>
          <li data-zone="code"><b>04</b><span class="pf-fl-t">코드 재검증</span><span class="pf-fl-d">인용은 원문과 대조하고 수치는 재계산</span></li>
          <li data-zone="code"><b>05</b><span class="pf-fl-t">근거 추적</span><span class="pf-fl-d">snapshot과 해시로 원문까지 역추적</span></li>
        </ol>
        <p class="pf-key"><span class="pf-key-ai">AI가 제안하는 구간</span><span class="pf-key-code">사람과 코드가 확정하는 구간</span></p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">검증</p>
      <div class="pf-sec-b">
        <ul class="pf-met">
          <li><b>66 / 66</b><span class="pf-met-t">다시 요청한 원문이 바이트와 해시까지 일치</span><span class="pf-met-d">공개 데이터 수집 검증</span></li>
          <li><b>1,269</b><span class="pf-met-t">테스트 통과, 65개 파일</span><span class="pf-met-d">입력, 처리, 결과 사이의 정합성</span></li>
          <li><b>예외 경로</b><span class="pf-met-t">데이터 누락, 형식 차이, 시간 기준 오류</span><span class="pf-met-d">실제 연동에서 생기는 조건까지 포함</span></li>
        </ul>
        <p class="pf-note"><span>검증 범위</span>제품 기준 브랜치와 수집 검증 시점의 값입니다. 이상거래 탐지 성능이 아니라 데이터 정합성을 확인한 결과입니다.</p>
      </div>
    </section>
  </article>
  <article class="pf-case" id="case-weavegate">
    <div class="pf-case-top">
      <p class="pf-idx">Case 02</p>
      <h2 class="pf-case-h">weavegate</h2>
      <p class="pf-case-sub">PR마다 오류 재현과 수정 여부를 확인하도록 개발&nbsp;프로세스를 자동화했습니다.<br />Spring Boot 트랜잭션 구간에 연결해 애플리케이션 로직과 MySQL을 함께 검증합니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.06 — 진행 중</li>
        <li><span>역할</span>기획부터 검증까지 단독</li>
        <li><span>출품</span>2026 오픈소스 개발자대회 <i>|</i> 정보통신산업진흥원</li>
        <li><span>저장소</span><a href="https://github.com/weavegate/weavegate">github.com/weavegate/weavegate</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">특정 실행 순서에서만 생기는 오류는<br />반복 실행만으로 재현되지 않는다</p>
        <ul class="pf-li">
          <li>매칭, 예약, 작업 할당 구간에서 중복 처리가 생깁니다.</li>
          <li>일반 테스트는 같은 실행 순서를 다시 만들지 못합니다.</li>
          <li>재현하지 못하면 수정 효과도 확인할 수 없습니다.</li>
          <li>코드가 바뀌면 같은 오류가 조용히 되돌아옵니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">구현 과정</p>
      <div class="pf-sec-b">
        <ol class="pf-try">
          <li data-state="dropped">
            <p class="pf-try-k">시간차 제어<em>폐기</em></p>
            <p class="pf-try-d">두 요청 사이에 지연을 두어 실행 순서를 맞췄습니다. 환경에 따라 결과가 달라져 재현이 성립하지 않았습니다.</p>
          </li>
          <li data-state="kept">
            <p class="pf-try-k">동기화 지점<em>채택</em></p>
            <p class="pf-try-d">트랜잭션 구간에 동기화 지점을 연결해 InnoDB 두 트랜잭션의 실행 순서를 직접 통제합니다. 시간이 아니라 순서 자체가 조건이 됩니다.</p>
          </li>
          <li data-state="kept">
            <p class="pf-try-k">SQL 판정<em>채택</em></p>
            <p class="pf-try-d">서비스가 지켜야 할 데이터 조건을 SQL로 정의합니다. 매 실행 뒤 위반 여부를 자동으로 판정합니다.</p>
          </li>
          <li data-state="kept">
            <p class="pf-try-k">재현 기록<em>채택</em></p>
            <p class="pf-try-d">실패한 실행의 schedule, 단계별 trace, 위반 데이터, 재현 명령을 남깁니다. 같은 조건에서 바로 다시 실행합니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">처리 흐름</p>
      <div class="pf-sec-b">
        <ol class="pf-flow">
          <li data-zone="in"><b>01</b><span class="pf-fl-t">Pull Request</span><span class="pf-fl-d">코드 변경마다 GitHub&nbsp;Actions 실행</span></li>
          <li data-zone="code"><b>02</b><span class="pf-fl-t">환경 자동 구성</span><span class="pf-fl-d">Testcontainers로 MySQL 8.4 구성</span></li>
          <li data-zone="code"><b>03</b><span class="pf-fl-t">실행 순서 제어</span><span class="pf-fl-d">동기화 지점으로 트랜잭션 순서 지정</span></li>
          <li data-zone="code"><b>04</b><span class="pf-fl-t">SQL 판정</span><span class="pf-fl-d">데이터 조건 위반 여부를 자동 판정</span></li>
          <li data-zone="code"><b>05</b><span class="pf-fl-t">재현 기록</span><span class="pf-fl-d">schedule, trace, 재현 명령 기록</span></li>
        </ol>
        <p class="pf-key"><span class="pf-key-code">반복 실행에서 같은 결과가 나오는 경로</span></p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">검증</p>
      <div class="pf-sec-b">
        <ul class="pf-met">
          <li><b>20/20 → 0/20</b><span class="pf-met-t">취약 구현에서 20회 모두 재현, 수정 후 0회</span><span class="pf-met-d">같은 순서에서 <code>FOR UPDATE</code> 적용 전후 비교</span></li>
          <li><b>8.78s</b><span class="pf-met-t">40회 반복 검증에 걸린 시간</span><span class="pf-met-d">평균 약 220ms로 CI 반복 실행 가능</span></li>
          <li><b>PR 단계</b><span class="pf-met-t">수작업 확인을 자동 검증으로 이동</span><span class="pf-met-d">재발 위험을 개발 과정에서 관리</span></li>
        </ul>
        <p class="pf-note"><span>검증 범위</span>레퍼런스 시나리오와 지정한 환경에서 확인한 값입니다. 도구 전체의 오류 검출률로 일반화하지 않도록 실험&nbsp;조건을 문서에 남겼습니다.</p>
      </div>
    </section>
  </article>
  <section class="pf-block" id="build">
    <div class="pf-block-h">
      <p class="pf-idx">Projects</p>
      <h2 class="pf-h">그 외 프로젝트</h2>
    </div>
    <div class="pf-group">
      <p class="pf-group-k">팀 프로젝트</p>
      <ul class="pf-grid2">
        <li>
          <p class="pf-mini-m">2026.03 — 2026.06 <i>|</i> RISE 캡스톤디자인</p>
          <h3 class="pf-mini-t">TeamPo</h3>
          <p class="pf-mini-o">개발자 팀 매칭부터 협업까지 잇는 Spring Boot 플랫폼</p>
          <ul class="pf-li pf-li--sm">
            <li>매칭 신청부터 팀 생성까지의 상태 흐름과 REST&nbsp;API를 설계했습니다.</li>
            <li>MySQL과 Redis에 트랜잭션과 DB 제약을 적용해 동시 요청의 정합성을 유지했습니다.</li>
            <li>Gemini API 호출을 핵심 요청 처리와 분리해 응답 지연의 영향을 차단했습니다.</li>
            <li>Docker, AWS, GitHub&nbsp;Actions로 배포하고 실패 시 롤백을 구성했습니다.</li>
          </ul>
          <p class="pf-mini-l"><a href="https://github.com/Team-po/Server">github.com/Team-po/Server</a></p>
        </li>
        <li>
          <p class="pf-mini-m">2026.04 — 2026.07 <i>|</i> BMW 코리아 미래재단</p>
          <h3 class="pf-mini-t">Ongi</h3>
          <p class="pf-mini-o">복약을 돕는 스마트 케어 IoT 서비스</p>
          <ul class="pf-li pf-li--sm">
            <li>ESP32와 FreeRTOS 펌웨어에서 센서 입력, 모터 제어, 시간 동기화를 구현했습니다.</li>
            <li>예약 실행과 원격 제어의 충돌을 메시지 큐와 단일&nbsp;제어&nbsp;태스크로 해결했습니다.</li>
            <li>MQTT로 변경을 알리고 HTTP로 조회하는 통신 구조를 설계했습니다.</li>
            <li>앱 등록부터 서버 기록까지 전 구간을 단계별로 검증했습니다.</li>
          </ul>
          <p class="pf-mini-l"><a href="https://github.com/Ongi-Team/ongi-device">github.com/Ongi-Team/ongi-device</a></p>
        </li>
      </ul>
      <div class="pf-side">
        <div class="pf-side-h">
          <p class="pf-side-m">2026.07 — 2026.08 <i>|</i> FuriosaAI 특강</p>
          <h3 class="pf-side-t">CarryCheck</h3>
          <p class="pf-side-l"><a href="https://github.com/jaeunda/CarryCheck">github.com/jaeunda/CarryCheck</a></p>
        </div>
        <div class="pf-side-b">
          <p class="pf-side-o">항공 수하물과 입국 규정을 판정하는 RAG 에이전트입니다. 검색과 판정과 설명을 세 단계로 나눴습니다. AI는 규정을 찾고 코드가 판정합니다.</p>
          <p class="pf-side-n">평가 10문항에서 Recall@3 1.00과 판정 10/10 일치를 확인했습니다. 필요한 근거만 전달해 Context&nbsp;Token을 38.6% 줄였습니다.</p>
        </div>
      </div>
    </div>
    <div class="pf-group">
      <p class="pf-group-k">전공 프로젝트</p>
      <ul class="pf-cards3">
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
          <p class="pf-card-m">2025.03 — 2025.06 <i>|</i> 리눅스 시스템 프로그래밍</p>
          <h3 class="pf-card-t">시스템 도구 구현</h3>
          <ul class="pf-li pf-li--sm">
            <li>파일 관리 프로그램, 백그라운드 데몬, 파일시스템 분석기를 C로 구현했습니다.</li>
            <li>여러 프로세스가 같은 파일을 쓸 때 파일&nbsp;잠금으로 충돌을 막았습니다.</li>
            <li>ext2 이미지를 라이브러리 없이 읽어 저장&nbsp;구조를 직접 추적했습니다.</li>
          </ul>
          <p class="pf-card-l"><span>github.com/jaeunda/</span><a href="https://github.com/jaeunda/lsp-p1">lsp-p1</a><i>|</i><a href="https://github.com/jaeunda/lsp-p2">lsp-p2</a><i>|</i><a href="https://github.com/jaeunda/lsp-p3">lsp-p3</a></p>
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
  </section>
  <section class="pf-block" id="interests">
    <div class="pf-block-h">
      <p class="pf-idx">Interests</p>
      <h2 class="pf-h">파고드는 주제</h2>
      <p class="pf-lead">시스템이 실패하는 지점을 따라가며 정리합니다. 전체 기록은 <a href="/">블로그</a>에 있습니다.</p>
    </div>
    <ul class="pf-topics">
      <li>
        <h3 class="pf-topic-t">트랜잭션과 동시성 제어</h3>
        <p class="pf-topic-d">격리 수준이 막아주는 이상 현상의 범위와 락이 잡히는 단위를 확인합니다.</p>
        <ul class="pf-posts">
          <li><a href="Transaction-Isolation-in-SQL">Transaction Isolation in SQL</a><span>격리 수준마다 허용되는 이상 현상과 SQL 표준의 정의를 정리했습니다.</span></li>
          <li><a href="Database-Locking-and-2PL">Database Locking and 2PL</a><span>2단계 잠금이 직렬 가능한 스케줄을 만드는 원리를 따라갔습니다.</span></li>
        </ul>
      </li>
      <li>
        <h3 class="pf-topic-t">장애 복구와 분산 트랜잭션</h3>
        <p class="pf-topic-d">장애 이후 데이터가 일관된 상태로 돌아오는 절차를 확인합니다.</p>
        <ul class="pf-posts">
          <li><a href="./Database-Recovery:-WAL-and-ARIES">Database Recovery: WAL and ARIES</a><span>커밋 도중 서버가 꺼져도 원자성과 지속성이 유지되는 과정을 정리했습니다.</span></li>
          <li><a href="Saga-Pattern-in-Microservices">Saga Pattern in Microservices</a><span>서비스 경계를 넘는 트랜잭션을 보상으로 되돌리는 방식을 다뤘습니다.</span></li>
        </ul>
      </li>
      <li>
        <h3 class="pf-topic-t">운영체제와 실행 환경</h3>
        <p class="pf-topic-d">주소 공간과 스케줄링이 응답 시간에 만드는 차이를 확인합니다.</p>
        <ul class="pf-posts">
          <li><a href="./Virtual-Memory:-Paging-and-Swap">Virtual Memory: Paging and Swap</a><span>프로세스가 물리 메모리를 침범하지 않게 만드는 주소 변환을 정리했습니다.</span></li>
          <li><a href="./RTOS:-Deadlines-and-Predictability">RTOS: Deadlines and Predictability</a><span>실시간 시스템의 기준이 속도가 아니라 데드라인인 이유를 다뤘습니다.</span></li>
        </ul>
      </li>
      <li>
        <h3 class="pf-topic-t">네트워크와 컨테이너</h3>
        <p class="pf-topic-d">요청이 커널 전송 계층과 클러스터를 지나는 경로를 따라갑니다.</p>
        <ul class="pf-posts">
          <li><a href="Linux-Transport-Layer-Internals">Linux Transport Layer Internals</a><span>호스트까지 온 패킷이 프로세스에 도달하는 커널 경로를 정리했습니다.</span></li>
          <li><a href="Kubernetes-Packet-Flow">Kubernetes Packet Flow</a><span>외부 클라이언트의 패킷이 목적지 Pod에 닿기까지를 추적했습니다.</span></li>
        </ul>
      </li>
    </ul>
  </section>
  <section class="pf-block" id="stack">
    <div class="pf-block-h">
      <p class="pf-idx">Stack</p>
      <h2 class="pf-h">기술 스택</h2>
    </div>
    <ul class="pf-stack">
      <li>
        <p class="pf-stack-k">언어</p>
        <p class="pf-stack-v"><span>Java</span><span>TypeScript</span><span>Go</span><span>C</span><span>Python</span></p>
      </li>
      <li>
        <p class="pf-stack-k">백엔드</p>
        <p class="pf-stack-v"><span>Spring Boot</span><span>JPA</span><span>Spring Security</span><span>FastAPI</span></p>
      </li>
      <li>
        <p class="pf-stack-k">데이터</p>
        <p class="pf-stack-v"><span>MySQL</span><span>InnoDB</span><span>Redis</span></p>
      </li>
      <li>
        <p class="pf-stack-k">인프라</p>
        <p class="pf-stack-v"><span>Docker</span><span>Kubernetes</span><span>GitHub Actions</span><span>AWS</span><span>Testcontainers</span></p>
      </li>
      <li>
        <p class="pf-stack-k">AI 연동</p>
        <p class="pf-stack-v"><span>LLM API</span><span>RAG</span><span>Hybrid Search</span><span>Re-ranking</span><span>Tool Calling</span></p>
      </li>
      <li>
        <p class="pf-stack-k">임베디드</p>
        <p class="pf-stack-v"><span>ESP32</span><span>FreeRTOS</span><span>MQTT</span><span>CUDA C++</span></p>
      </li>
    </ul>
  </section>
  <section class="pf-block" id="foundation">
    <div class="pf-block-h">
      <p class="pf-idx">Education</p>
      <h2 class="pf-h">교육 과정</h2>
    </div>
    <ul class="pf-cards3">
      <li>
        <p class="pf-card-m">2025.12 — 2026.01 <i>|</i> 스파르탄SW교육원 <i>|</i> 90시간</p>
        <h3 class="pf-card-t">Co-op AI Cloud Track</h3>
        <ul class="pf-li pf-li--sm">
          <li>Docker 이미지를 ECR에 올리고 EKS와 K‑PaaS에 배포했습니다.</li>
          <li>롤링&nbsp;업데이트와 롤백으로 배포 중 장애 대응을 실습했습니다.</li>
          <li>빌드에서 정적&nbsp;분석과 테스트를 거쳐 배포까지 이어지는 CI/CD 파이프라인을 구성했습니다.</li>
          <li>MSA에서 서비스별 트랜잭션을 나누는 구조와 Saga를 분석했습니다.</li>
        </ul>
      </li>
      <li>
        <p class="pf-card-m">2026.09 <i>|</i> NVIDIA Deep Learning Institute</p>
        <h3 class="pf-card-t">Fundamentals of Accelerated Computing with Modern CUDA C++</h3>
        <ul class="pf-li pf-li--sm">
          <li>CPU 코드를 GPU 커널로 병렬화하고 CUDA Stream으로 비동기&nbsp;실행을 적용했습니다.</li>
          <li>Nsight Systems로 연산과 메모리 이동의 병목을 분석했습니다.</li>
          <li>Maxwell&nbsp;방정식&nbsp;시뮬레이터를 초당 약 49.1억 cells로 처리해 목표 대비 19.8% 높은 처리량을 얻었습니다.</li>
        </ul>
      </li>
      <li>
        <p class="pf-card-m">2026.07 — 2026.08 <i>|</i> FuriosaAI <i>|</i> 12시간</p>
        <h3 class="pf-card-t">GPU/NPU 기반 LLM Agent와 RAG</h3>
        <ul class="pf-li pf-li--sm">
          <li>Chunking, Embedding, FAISS 검색을 연결해 RAG 파이프라인을 구현했습니다.</li>
          <li>BM25와 Dense Search를 합친 Hybrid&nbsp;Search에 Re‑ranking을 적용했습니다.</li>
          <li>Tool&nbsp;Calling으로 검색을 외부 도구에 연결하고 실행 결과를 검증했습니다.</li>
        </ul>
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
        <p class="pf-time-w">2026.07 — 진행 중</p>
        <div class="pf-time-b">
          <p class="pf-time-t">2026 금융 AI Challenge<span>금융보안원</span></p>
          <p class="pf-time-d">AI 분석 결과를 원문과 코드로 재검증하는 금융 분석 서비스를 단독 개발</p>
        </div>
      </li>
      <li>
        <p class="pf-time-w">2026.06 — 진행 중</p>
        <div class="pf-time-b">
          <p class="pf-time-t">2026 오픈소스 개발자대회<span>정보통신산업진흥원</span></p>
          <p class="pf-time-d">DB 동시성 오류를 재현하고 PR 단계에서 자동 검증하는 CI 도구를 단독 개발</p>
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
          <p class="pf-time-t">GPU/NPU 기반 LLM Agent와 RAG 특강<span>FuriosaAI</span></p>
          <p class="pf-time-d">검색과 판정을 분리한 규정 질의 에이전트를 팀으로 구현</p>
        </div>
      </li>
      <li>
        <p class="pf-time-w">2026.04 — 2026.07</p>
        <div class="pf-time-b">
          <p class="pf-time-t">영 이노베이터 드림 프로젝트<span>BMW 코리아 미래재단</span></p>
          <p class="pf-time-d">임베디드 펌웨어와 서버 통신을 맡아 IoT 서비스 전 구간을 연동</p>
        </div>
      </li>
      <li>
        <p class="pf-time-w">2026.03 — 2026.06</p>
        <div class="pf-time-b">
          <p class="pf-time-t">RISE 캡스톤디자인<span>숭실대학교 RISE사업단</span></p>
          <p class="pf-time-d">팀 매칭 플랫폼의 백엔드 API와 동시 요청 정합성을 설계</p>
        </div>
      </li>
      <li>
        <p class="pf-time-w">2026.01</p>
        <div class="pf-time-b">
          <p class="pf-time-t">AAAI-26 Conference on Artificial Intelligence<span>Singapore</span></p>
          <p class="pf-time-d">Attended</p>
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
          <p class="pf-time-d">Google이 지원하는 대학 개발자 커뮤니티에서 운영체제 주제 발표와 CS 스터디 참여</p>
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
            <li><b>정보처리기사</b><span>2026.09</span></li>
          </ul>
        </div>
        <div class="pf-sum-g">
          <p class="pf-sum-k">어학</p>
          <ul class="pf-sum-l pf-sum-l--score">
            <li><b>TOEIC</b><span>855</span></li>
            <li><b>TOEIC Speaking</b><span>Advanced Low</span></li>
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

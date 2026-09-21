---
title: DB 동시성 오류 검증 자동화 도구
description: DB 워크플로가 특정 실행 순서에서 불변식을 깨는지 CI에서 결정론적으로 재현하는 replay gate의 설계 기록.
unlisted: true
cssclasses:
  - portfolio-shell
  - portfolio-systems
---

<div class="pf-bar">
  <div class="pf-bar-in">
    <a class="pf-bar-id" href="/portfolio-systems/"><b>장다은</b><span>← 전체 보기</span></a>
    <nav class="pf-bar-nav" aria-label="페이지 이동">
      <a href="/portfolio-systems/teampo">협업 플랫폼</a>
      <a href="/portfolio-systems/weavegate" aria-current="page">검증 도구</a>
      <a href="/portfolio-systems/ongi">IoT 서비스</a>
      <a href="/portfolio-systems/foundation">Foundation</a>
    </nav>
  </div>
</div>
<main class="pf-main">
  <article class="pf-case ps-detail" id="top">
    <div class="pf-case-top">
      <p class="ps-tag">Project 02</p>
      <h1 class="pf-case-h">DB 동시성 오류 검증 자동화 도구</h1>
      <p class="ps-name">weavegate <i>|</i> Deterministically replay the DB race, gate the deploy.</p>
      <p class="pf-case-sub">DB 워크플로의 <code>read → decide → write</code> 경로에 테스트 전용 sync-point를 심어, 불변식을 깨는 실행 순서를 CI에서 결정론적으로 재현하고 SQL oracle 위반을 증거로 남기는 replay gate입니다.<br />협업 플랫폼의 매칭 기능에서 겪은 중복 배정 문제를 일반화한 시나리오에서 출발했습니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.06 — 진행 중</li>
        <li><span>역할</span>단독 기획·설계·개발 <i>|</i> Go</li>
        <li><span>출품</span>2026 오픈소스 개발자대회 <i>|</i> 정보통신산업진흥원</li>
        <li><span>릴리스</span>v0.1.0-alpha <i>|</i> 2026.09</li>
        <li><span>저장소</span><a href="https://github.com/weavegate/weavegate">github.com/weavegate/weavegate</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">구조</p>
      <div class="pf-sec-b">
        <ol class="ps-arch">
          <li><p class="ps-box-k">Scenario engine</p><p class="ps-box-t">실행 순서 후보 생성</p><p class="ps-box-d">worker × sync-point release 순열 전수 열거</p></li>
          <li><p class="ps-box-k">Orchestrator</p><p class="ps-box-t">순서대로 release · replay</p><p class="ps-box-d">탐색 · 저장된 순서 재실행 · repeat</p></li>
          <li><p class="ps-box-k">Sync-point runtime</p><p class="ps-box-t">arrive → block → release</p><p class="ps-box-d">worker 상태 추적 · timeout 판정</p></li>
          <li><p class="ps-box-k">SUT adapter</p><p class="ps-box-t">대상 앱의 트랜잭션 실행</p><p class="ps-box-d">Go-native · 외부 JVM(설계)</p></li>
        </ol>
        <p class="ps-return"><span>SQL oracle 판정 → WG 진단 · report · trace · schedule</span></p>
        <p class="ps-lab">한 실행 순서의 처리</p>
        <ol class="pf-flow">
          <li data-zone="in"><b>01</b><span class="pf-fl-t">Reset</span><span class="pf-fl-d">Testcontainers MySQL에 같은 schema·seed 재적용</span></li>
          <li data-zone="code"><b>02</b><span class="pf-fl-t">Invoke</span><span class="pf-fl-d">worker 전원이 첫 sync-point에 도착해 대기</span></li>
          <li data-zone="code"><b>03</b><span class="pf-fl-t">Release</span><span class="pf-fl-d">저장한 순서대로 한 worker씩 진행, lock 대기는 db_blocked</span></li>
          <li data-zone="code"><b>04</b><span class="pf-fl-t">Oracle</span><span class="pf-fl-d">SQL assertion이 행을 돌려주면 위반</span></li>
          <li data-zone="code"><b>05</b><span class="pf-fl-t">Repeat</span><span class="pf-fl-d">같은 순서를 20회 다시 실행해 flaky 여부 판정</span></li>
        </ol>
        <p class="pf-key"><span class="pf-key-code">엔진은 대상 앱의 언어를 모르고, 언어 경계는 adapter와 sync-point만 안다</span></p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">통합테스트는 DB 경합 버그를 운에 맡기고<br />실패해도 어떤 순서에서 깨졌는지 남기지 않는다</p>
        <ul class="pf-li">
          <li>매칭 배정, 예약, 쿠폰, 작업 할당처럼 상태가 한 번만 바뀌어야 하는 흐름은 대부분 <code>read → decide → write</code> 구조입니다.</li>
          <li>DB는 격리 수준 안에서 이런 흐름이 깨지는 실행 순서를 허용합니다. 앱이 그 순서를 견디는지는 앱의 책임입니다.</li>
          <li>어떤 순서를 시험해야 하는지 사람이 직접 쓰기 어렵고, 수정이 그 순서를 정말 막았는지 확인할 방법도 없습니다.</li>
          <li>코드 생산이 자동화될수록 사람이 매 커밋 보증하지 못하는 정합성 결함이 배포로 흘러갈 가능성이 커집니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 판단</p>
      <div class="pf-sec-b">
        <ol class="ps-why">
          <li>
            <p class="ps-why-q">버그를 찾는 도구인가, 수정을 증명하는 도구인가?</p>
            <p class="ps-why-s" data-k="가설">일반 테스트는 이 버그를 잘 잡지 못하고, 순서를 고정하면 검출이 늘어날 것이라고 봤습니다.</p>
            <p class="ps-why-s" data-k="실측">일반 반복과 2ms 시차 모두 100회 중 100회 검출했습니다. 시차를 20ms로 늘리자 0회였습니다. 결과를 가른 것은 두 트랜잭션이 겹치느냐였습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>검출 빈도가 아니라 재현 가능성과 증거로 주장을 좁혔습니다.</b> 같은 순서로 수정 전은 실패하고 수정 후는 통과함을 보이는 게이트입니다.</p>
          </li>
          <li>
            <p class="ps-why-q">락을 기다리는 worker는 어떻게 다룰까?</p>
            <p class="ps-why-s" data-k="조건">수정 버전에서는 worker가 <code>FOR UPDATE</code> 대기에 들어가 다음 sync-point에 도착하지 못합니다. 그대로 두면 실행이 멈춥니다.</p>
            <p class="ps-why-s" data-k="결정"><b>도착 대기가 timeout되면 그 worker를 db_blocked로 표시하고 다음 단계로 진행</b>합니다. deadlock(1213)은 따로 분류합니다.</p>
            <p class="ps-why-s" data-k="효과">다른 worker가 커밋해 락이 풀리면 blocked worker가 재개되어, 수정 버전도 같은 순서로 끝까지 실행됩니다.</p>
          </li>
          <li>
            <p class="ps-why-q">통과는 무엇을 뜻해야 할까?</p>
            <p class="ps-why-s" data-k="조건">UNIQUE 제약이 중복 행을 막아도, 앱이 그 오류를 삼키거나 500으로 흘리면 사용자 입장의 불변식은 여전히 깨집니다.</p>
            <p class="ps-why-s" data-k="결정"><b>제약이 있는 것이 아니라, 위반 신호를 도메인 결과로 처리하고 불변식이 유지될 때만 PASS</b>로 정했습니다. 처리하지 않은 오류는 진단 대상입니다.</p>
          </li>
          <li>
            <p class="ps-why-q">판정은 누가, 어떤 형식으로 할까?</p>
            <p class="ps-why-s" data-k="조건">사람이나 AI가 결과를 보면 판정이 재현되지 않고 리뷰에서 방어할 수 없습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>사용자가 도메인 불변식을 SQL assertion으로 선언하고, 행이 나오면 위반</b>입니다. 결과는 컴파일러처럼 <code>error[WG001]</code>과 observed · invariant · reason · help · evidence로 출력합니다.</p>
          </li>
          <li>
            <p class="ps-why-q">도구 자신의 결정론은 누가 감사할까?</p>
            <p class="ps-why-s" data-k="조건">같은 순서에서 결과가 흔들리면 PASS도, 안정된 위반도 아닙니다.</p>
            <p class="ps-why-s" data-k="결정"><b>같은 순서를 20회 반복해 결과가 갈리면 flaky로 스스로 실패(exit 3)</b>합니다. 오류는 판정을 이기고 flaky는 위반을 이기며, 정리 실패는 PASS만 4로 올립니다.</p>
            <p class="ps-why-s" data-k="효과">exit code 하나로 통과 · 위반 · 흔들림 · 환경 오류를 구분합니다.</p>
          </li>
          <li>
            <p class="ps-why-q">Spring Boot 앱은 어떻게 붙일까? <em class="ps-plan">설계</em></p>
            <p class="ps-why-s" data-k="조건">엔진은 Go로 쓰여 있고, 제품 목표는 Spring Boot 프로젝트의 CI입니다.</p>
            <p class="ps-why-s" data-k="결정"><b>실행 순서마다 child JVM 하나를 띄우고 stdin/stdout으로 길이 접두 JSON 프레임만 주고받습니다.</b> 처음 검토한 HTTP 채널은 포트 · endpoint 탐색 · 인증 · polling이 필요해 버렸습니다.</p>
            <p class="ps-why-s" data-k="원칙">한 호출은 스레드 하나 · 트랜잭션 하나이며 트랜잭션은 Spring이 소유합니다. 계측은 테스트 프로필에서만 켜지고, 운영 경로에서는 아무 일도 하지 않습니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">검증</p>
      <div class="pf-sec-b">
        <ul class="pf-met">
          <li><b>20/20 → 0/20</b><span class="pf-met-t">같은 순서에서 취약 구현 20회 모두 위반, 수정 후 20회 모두 통과</span><span class="pf-met-d">레퍼런스 시나리오 · <code>FOR UPDATE</code> 적용 전후</span></li>
          <li><b>8.78s</b><span class="pf-met-t">DB 초기화를 포함한 40회 실행</span><span class="pf-met-d">1회 평균 약 220ms로 CI에서 반복 가능</span></li>
          <li><b>v0.1.0-alpha</b><span class="pf-met-t">2026.09 공개 릴리스</span><span class="pf-met-d">새 환경에서 탐색 → replay → 수정 후 PASS를 직접 완주</span></li>
        </ul>
        <p class="ps-lab">위반 리포트</p>
        <pre class="ps-out"><code>## weavegate: FAIL (WG001)
scenario: concurrent-assign | schedules explored: 1 | violating: sch_7dcb74b1e506
assertion: active-assignment-is-unique
flaky: false (repeat=20)
replay: weavegate run --config &lt;path&gt; --scenario concurrent-assign --variant vulnerable --replay sch_7dcb74b1e506 --repeat 20</code></pre>
        <p class="pf-note"><span>검증 범위</span>Go로 작성한 레퍼런스 시나리오에서 확인한 값입니다. 이 도구는 지정한 sync-point 사이의 실행 순서와 선언한 불변식만 봅니다. DB의 ACID를 검증하지 않고, 모든 경합 버그를 자동으로 찾는다고 주장하지 않습니다.</p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 목표</p>
      <div class="pf-sec-b">
        <p class="ps-log-intro">Spring Boot 프로젝트의 CI에 붙여, 트랜잭션 흐름이 특정 실행 순서에서 도메인 불변식을 깨는지 PR 단계에서 확인하는 것이 제품 목표입니다. 누구나 공개 문서만 보고 도입할 수 있어야 합니다.</p>
        <ol class="ps-steps">
          <li><p class="ps-box-t"><b>1</b>외부 SUT 프로토콜</p><p class="ps-box-d">child JVM · 프레임 규약</p></li>
          <li><p class="ps-box-t"><b>2</b>Spring 계측 라이브러리</p><p class="ps-box-d">opt-in sync-point</p></li>
          <li><p class="ps-box-t"><b>3</b>재사용 CI Action</p><p class="ps-box-d">verdict · 증거 보존 · PR comment</p></li>
          <li data-final><p class="ps-box-t">문서만으로 도입</p><p class="ps-box-d">외부 프로젝트에서 빨강 → 초록</p></li>
        </ol>
        <ul class="ps-gap">
          <li><b>순서가 필요한 두 번째 시나리오</b><span>레퍼런스 시나리오는 두 트랜잭션이 겹치기만 하면 깨지는 스냅샷 결함입니다. 특정 순서에서만 깨지는 시나리오와 격리 수준 비교를 이어서 설계했습니다.</span></li>
          <li><b>직렬 실행 기준 비교</b><span>worker를 하나씩 실행한 결과를 기준으로 누락 · 중복 · 오래된 행을 판정하는 oracle입니다. 비결정 컬럼은 비교에서 뺍니다.</span></li>
          <li><b>락 대기의 DB 확인</b><span>지금은 timeout으로 추론합니다. InnoDB의 lock wait 정보로 실제 대기를 확인하는 방식을 다음 단계로 뒀습니다.</span></li>
        </ul>
      </div>
    </section>
    <nav class="ps-pager" aria-label="다른 프로젝트">
      <a href="/portfolio-systems/teampo" data-dir="prev"><span>← 이전</span><b>초보 개발자를 위한 협업 플랫폼</b></a>
      <a href="/portfolio-systems/ongi" data-dir="next"><span>다음 →</span><b>스마트 복약 케어 IoT 서비스</b></a>
    </nav>
  </article>
</main>
<footer class="pf-foot">
  <p class="pf-foot-l"><a href="mailto:jaeunda@gmail.com">jaeunda@gmail.com</a><a href="https://github.com/jaeunda">github.com/jaeunda</a></p>
  <p class="pf-foot-r">2026.09</p>
</footer>

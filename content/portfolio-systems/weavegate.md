---
title: DB 동시성 오류 검증 자동화 도구
description: 간헐적 동시성 오류를 재현 가능한 조건으로 만들어 CI에서 자동 검증하는 도구의 설계 기록.
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
      <p class="ps-name">weavegate <i>|</i> 재현하기 어려운 오류를 실행 순서로 고정해 CI에서 다시 검증</p>
      <p class="pf-case-sub">협업 플랫폼에서 겪은 동시성 문제에서 출발해, 오류가 난 실행 순서를 저장하고 수정 전후를 같은 조건에서 비교하도록 만든 도구입니다.<br />Spring Boot 애플리케이션의 트랜잭션 구간에 연결하는 구조로 설계했습니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.06 — 진행 중</li>
        <li><span>역할</span>단독 기획·설계·개발 <i>|</i> Go</li>
        <li><span>출품</span>2026 오픈소스 개발자대회 <i>|</i> 정보통신산업진흥원</li>
        <li><span>저장소</span><a href="https://github.com/weavegate/weavegate">github.com/weavegate/weavegate</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">구조</p>
      <div class="pf-sec-b">
        <ol class="ps-steps ps-steps--5 ps-steps--line">
          <li><p class="ps-box-t">PR 생성</p><p class="ps-box-d">GitHub Actions</p></li>
          <li><p class="ps-box-t">DB 자동 구성</p><p class="ps-box-d">MySQL 8.4 컨테이너</p></li>
          <li><p class="ps-box-t">실행 순서 고정</p><p class="ps-box-d">동기화 지점 삽입</p></li>
          <li><p class="ps-box-t">자동 판정</p><p class="ps-box-d">SQL 조건 검사</p></li>
          <li><p class="ps-box-t">실패 기록</p><p class="ps-box-d">trace · 재현 명령</p></li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">타이밍에 기대는 테스트는<br />같은 오류를 같은 조건으로 다시 보여주지 못한다</p>
        <ul class="pf-li">
          <li>코드 리뷰와 일반 테스트를 통과한 뒤에도 두 요청이 거의 동시에 들어올 때만 정합성이 깨졌습니다.</li>
          <li>일반 테스트는 같은 실행 순서를 다시 만들지 못합니다.</li>
          <li>재현하지 못하면 수정 효과도 확인할 수 없고, 코드가 바뀌면 같은 오류가 조용히 되돌아옵니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 판단</p>
      <div class="pf-sec-b">
        <ol class="ps-why">
          <li>
            <p class="ps-why-q">시간차를 주면 재현되지 않을까?</p>
            <p class="ps-why-s" data-k="처음">요청 사이에 시차를 두는 테스트를 반복했습니다.</p>
            <p class="ps-why-s" data-k="관찰">시차의 크기와 실행 환경에 따라 검출 결과가 달라졌습니다. 재현 여부가 코드가 아니라 타이밍에 달려 있었습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>시간 대신 순서를 고정했습니다.</b> 조회·판단·저장 구간에 동기화 지점을 두고 두 트랜잭션의 실행 순서를 직접 제어합니다.</p>
          </li>
          <li>
            <p class="ps-why-q">오류가 나는 순서를 어떻게 다시 만들까?</p>
            <p class="ps-why-s" data-k="조건">같은 순서를 다시 실행할 수 있어야 수정 전후를 비교할 수 있습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>작업마다 독립된 DB 연결을 할당하고</b>, 가능한 실행 순서를 탐색해 오류가 난 순서를 저장합니다.</p>
            <p class="ps-why-s" data-k="효과">저장한 순서에서 취약 구현은 20회 모두 같은 위반을 보였고, 잠금을 적용한 구현은 20회 모두 통과했습니다.</p>
          </li>
          <li>
            <p class="ps-why-q">오류가 났다는 것은 누가 판정할까?</p>
            <p class="ps-why-s" data-k="조건">사람이 결과를 눈으로 확인하면 기준이 흔들립니다.</p>
            <p class="ps-why-s" data-k="결정"><b>매 실행 전 같은 스키마와 초기 데이터로 복원하고</b>, 서비스가 지켜야 할 데이터 조건을 SQL로 정의해 자동 판정합니다.</p>
            <p class="ps-why-s" data-k="효과">사람이 결과를 보지 않아도 매 실행이 같은 기준으로 통과·실패를 냅니다.</p>
          </li>
          <li>
            <p class="ps-why-q">실패하면 무엇을 남길까?</p>
            <p class="ps-why-s" data-k="조건">재현 조건이 사라지면 원인도, 수정 효과도 확인할 수 없습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>실행 순서, 단계별 trace, 위반 데이터, 재현 명령</b>을 보고서로 남깁니다.</p>
            <p class="ps-why-s" data-k="효과">같은 조건으로 바로 다시 실행해 원인을 확인할 수 있습니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">검증</p>
      <div class="pf-sec-b">
        <ul class="pf-met">
          <li><b>20/20 → 0/20</b><span class="pf-met-t">레퍼런스 시나리오에서 취약 구현 20회 모두 재현, 수정 후 0회</span><span class="pf-met-d">같은 순서에서 <code>FOR UPDATE</code> 적용 전후 비교</span></li>
          <li><b>8.78s</b><span class="pf-met-t">40회 반복 검증에 걸린 시간</span><span class="pf-met-d">1회 평균 약 220ms로 CI 반복 실행 가능</span></li>
          <li><b>순서 고정</b><span class="pf-met-t">타이밍이 아니라 실행 순서로 재현</span><span class="pf-met-d">저장한 순서를 그대로 다시 실행해 수정 전후 비교</span></li>
        </ul>
        <p class="pf-note"><span>검증 범위</span>레퍼런스 시나리오와 지정한 환경에서 확인한 값입니다. 도구 전체의 오류 검출률로 일반화하지 않도록 실험&nbsp;조건을 문서에 남겼습니다.</p>
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

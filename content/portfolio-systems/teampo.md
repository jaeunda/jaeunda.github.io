---
title: 초보 개발자를 위한 협업 플랫폼
description: AI 기능을 백엔드 처리 흐름에 통합하고 클라우드 배포까지 구현한 Spring Boot 서비스의 설계 기록.
unlisted: true
cssclasses:
  - portfolio-shell
  - portfolio-systems
---

<div class="pf-bar">
  <div class="pf-bar-in">
    <a class="pf-bar-id" href="/portfolio-systems/"><b>장다은</b><span>← 전체 보기</span></a>
    <nav class="pf-bar-nav" aria-label="페이지 이동">
      <a href="/portfolio-systems/teampo" aria-current="page">협업 플랫폼</a>
      <a href="/portfolio-systems/weavegate">검증 도구</a>
      <a href="/portfolio-systems/ongi">IoT 서비스</a>
      <a href="/portfolio-systems/foundation">Foundation</a>
    </nav>
  </div>
</div>
<main class="pf-main">
  <article class="pf-case ps-detail" id="top">
    <div class="pf-case-top">
      <p class="ps-tag">Project 01</p>
      <h1 class="pf-case-h">초보 개발자를 위한 협업 플랫폼</h1>
      <p class="ps-name">TeamPo <i>|</i> AI 기능을 백엔드 처리 흐름에 통합하고 클라우드 배포까지</p>
      <p class="pf-case-sub">초보 개발자의 팀 구성부터 협업까지 잇는 Spring Boot 서비스입니다.<br />팀장으로 서비스 기획과 백엔드 설계·구현을 맡았습니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.03 — 2026.06</li>
        <li><span>역할</span>서비스 기획, 백엔드 설계 및 구현 <i>|</i> 팀장</li>
        <li><span>소속</span>RISE 캡스톤디자인 프로젝트 <i>|</i> 숭실대학교 RISE사업단 <i>|</i> 4인 팀</li>
        <li><span>저장소</span><a href="https://github.com/Team-po/Server">github.com/Team-po/Server</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">구조</p>
      <div class="pf-sec-b">
        <p class="ps-lab">AI feature</p>
        <ol class="ps-steps ps-steps--line">
          <li><p class="ps-box-t">팀 생성 완료</p><p class="ps-box-d">커밋 후 이벤트</p></li>
          <li><p class="ps-box-t">비동기 AI 호출</p><p class="ps-box-d">Gemini API</p></li>
          <li><p class="ps-box-t">형식 검증</p><p class="ps-box-d">JSON Schema</p></li>
          <li><p class="ps-box-t">상태 저장</p><p class="ps-box-d">생성 중 · 완료 · 실패</p></li>
        </ol>
        <p class="ps-lab">Deploy</p>
        <ol class="ps-steps">
          <li><p class="ps-box-t">빌드 · 테스트</p><p class="ps-box-d">GitHub Actions CI</p></li>
          <li><p class="ps-box-t">이미지 등록</p><p class="ps-box-d">Docker → Amazon ECR</p></li>
          <li><p class="ps-box-t">EC2 배포</p><p class="ps-box-d">헬스체크 · 실패 시 롤백</p></li>
          <li><p class="ps-box-t">DB 스키마 반영</p><p class="ps-box-d">Flyway 마이그레이션</p></li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">여러 사람이 동시에 신청하고 느린 외부 AI가 끼어드는 흐름에서<br />팀 구성 결과를 어떻게 정확하게 지킬까</p>
        <ul class="pf-li">
          <li>프로젝트 경험이 적은 개발자는 맞는 팀원을 찾기 어렵고, 팀이 생겨도 끝까지 협업하기 어렵습니다.</li>
          <li>여러 요청이 동시에 들어오면 제약 조건이 깨지거나 화면의 상태와 실제 팀 구성이 달라질 수 있습니다.</li>
          <li>외부 AI는 응답이 느리고 형식이 일정하지 않아, 핵심 요청에 직접 붙이면 전체가 흔들립니다.</li>
          <li>제한된 기간 안에 팀원들이 낸 모든 기능을 구현할 수는 없었습니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 판단</p>
      <div class="pf-sec-b">
        <ol class="ps-why">
          <li>
            <p class="ps-why-q">기간 안에 무엇부터 만들까?</p>
            <p class="ps-why-s" data-k="조건">팀원마다 중요하게 보는 기능이 달랐고, 모든 제안을 구현할 수는 없었습니다.</p>
            <p class="ps-why-s" data-k="결정">제안을 사용자의 상황과 해결할 문제로 정리한 뒤 <b>공통 문제인지, 핵심 이용 흐름에 필요한지, 다른 기능의 선행 조건인지, 기간 안에 검증할 수 있는지</b>로 비교했습니다.</p>
            <p class="ps-why-s" data-k="효과">핵심 이용 흐름을 먼저 완성하고, 나머지는 선행 조건 순서로 미뤘습니다.</p>
          </li>
          <li>
            <p class="ps-why-q">동시에 신청하면 한 사람이 두 번 배정된다면?</p>
            <p class="ps-why-s" data-k="조건">두 요청이 같은 상태를 동시에 읽으면 한 사용자가 중복 처리될 수 있었습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>핵심 상태 변경을 하나의 트랜잭션으로 묶고, 비관적 락과 DB 제약으로 중복 참여를 막았습니다.</b></p>
            <p class="ps-why-s" data-k="효과">같은 사용자의 중복 참여는 DB 수준에서 거부됩니다.</p>
            <p class="ps-why-s" data-k="이어서">이런 오류를 코드가 바뀐 뒤에도 같은 조건으로 다시 확인하고 싶었던 것이 <a href="/portfolio-systems/weavegate">검증 자동화 도구</a>의 출발점입니다.</p>
          </li>
          <li>
            <p class="ps-why-q">느린 외부 AI를 핵심 요청에 어떻게 붙일까?</p>
            <p class="ps-why-s" data-k="조건">Gemini 응답은 느리고 형식이 일정하지 않아, 직접 연결하면 팀 생성이 지연되고 잘못된 결과가 저장됩니다.</p>
            <p class="ps-why-s" data-k="결정"><b>팀 생성이 커밋된 뒤 비동기로 호출하고</b>, 응답 형식을 JSON Schema로 지정한 뒤 서버에서 필드를 다시 검증해 <b>통과한 결과만 저장</b>했습니다.</p>
            <p class="ps-why-s" data-k="효과">AI 응답이 늦어도 팀 생성은 바로 완료되고, 형식이 틀리거나 생성 중에 멈춘 요청은 실패 상태로 남아 다시 생성할 수 있습니다.</p>
          </li>
          <li>
            <p class="ps-why-q">배포하다 실패하면 서비스는 어떻게 될까?</p>
            <p class="ps-why-s" data-k="조건">새 버전이 제대로 뜨지 않으면 서비스가 멈추고, 스키마 변경이 코드와 따로 적용되면 데이터가 어긋납니다.</p>
            <p class="ps-why-s" data-k="결정">PR마다 CI에서 빌드·테스트하고, 배포 때는 Docker 이미지를 ECR에 올린 뒤 <b>EC2에서 새 컨테이너가 헬스체크를 통과해야 트래픽을 넘기며 실패하면 이전 버전으로 롤백</b>합니다. 스키마 변경은 Flyway로 버전을 관리합니다.</p>
            <p class="ps-why-s" data-k="효과">배포 절차가 코드와 함께 남고, 실패해도 이전 버전으로 돌아갑니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">기술</p>
      <div class="pf-sec-b">
        <p class="pf-stack-v"><span>Java</span><span>Spring Boot 3</span><span>Spring Security</span><span>JPA</span><span>MySQL</span><span>Flyway</span><span>Redis</span><span>AWS S3</span><span>GitHub App</span><span>Gemini API</span><span>Docker</span><span>Amazon ECR</span><span>EC2</span><span>GitHub Actions</span></p>
      </div>
    </section>
    <nav class="ps-pager" aria-label="다른 프로젝트">
      <a href="/portfolio-systems/" data-dir="prev"><span>↑ 처음으로</span><b>전체 보기</b></a>
      <a href="/portfolio-systems/weavegate" data-dir="next"><span>다음 →</span><b>DB 동시성 오류 검증 자동화 도구</b></a>
    </nav>
  </article>
</main>
<footer class="pf-foot">
  <p class="pf-foot-l"><a href="mailto:jaeunda@gmail.com">jaeunda@gmail.com</a><a href="https://github.com/jaeunda">github.com/jaeunda</a></p>
  <p class="pf-foot-r">2026.09</p>
</footer>

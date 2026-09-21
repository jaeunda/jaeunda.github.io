---
title: Linux 시스템 프로그래밍과 운영체제 커널
description: Linux 시스템 호출과 xv6 커널 수준에서 C로 직접 구현한 전공 프로젝트의 설계 기록.
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
      <a href="/portfolio-systems/weavegate">검증 도구</a>
      <a href="/portfolio-systems/ongi">IoT 서비스</a>
      <a href="/portfolio-systems/foundation" aria-current="page">Foundation</a>
    </nav>
  </div>
</div>
<main class="pf-main">
  <article class="pf-case ps-detail" id="top">
    <div class="pf-case-top">
      <p class="ps-tag">Foundation</p>
      <h1 class="pf-case-h">Linux 시스템 프로그래밍과 운영체제 커널</h1>
      <p class="ps-name">Linux System Programming · xv6 <i>|</i> 시스템 호출 수준에서 C로 직접 구현</p>
      <p class="pf-case-sub">Linux 시스템 호출만으로 데몬과 파일시스템 분석기를 만들고, 교육용 운영체제 xv6의 커널을 네 차례에 걸쳐 확장했습니다.<br />자원을 누가, 언제, 어떤 순서로 쓰는지를 코드로 통제하는 연습이었습니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2025.03 — 2025.12</li>
        <li><span>역할</span>단독 구현</li>
        <li><span>과목</span>리눅스 시스템 프로그래밍 <i>|</i> 운영체제 <i>|</i> 컴파일러</li>
        <li><span>저장소</span><a href="https://github.com/jaeunda/operating-system">github.com/jaeunda/operating-system</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">구현 범위</p>
      <div class="pf-sec-b">
        <ul class="ps-scope">
          <li><b>시스템 호출</b><span>사용자 요청이 커널로 들어가 결과가 돌아오는 경로</span><a href="https://github.com/jaeunda/os-p1-syscall">os-p1</a></li>
          <li><b>Stride 스케줄러</b><span>티켓 비율대로 CPU를 결정론적으로 배분</span><a href="https://github.com/jaeunda/os-p2-scheduler">os-p2</a></li>
          <li><b>물리 메모리 추적</b><span>프레임 소유 추적, 역페이지 테이블, SW TLB</span><a href="https://github.com/jaeunda/os-p3-pageframe">os-p3</a></li>
          <li><b>파일시스템 스냅샷</b><span>블록 공유와 Copy-on-Write로 생성·롤백·삭제</span><a href="https://github.com/jaeunda/os-p4-snapshot">os-p4</a></li>
          <li><b>파일 정리 CLI</b><span>시스템 호출만으로 디렉터리 탐색과 분류</span><a href="https://github.com/jaeunda/lsp-p1">lsp-p1</a></li>
          <li><b>감시 데몬</b><span>데몬화 7단계, fcntl 잠금으로 설정·로그 보호</span><a href="https://github.com/jaeunda/lsp-p2">lsp-p2</a></li>
          <li><b>ext2 분석기</b><span>디스크 이미지를 전용 헤더 없이 직접 해석</span><a href="https://github.com/jaeunda/lsp-p3">lsp-p3</a></li>
          <li><b>C 컴파일러</b><span>구문 분석, 의미 검사, 코드 생성을 단계별로 구현</span><a href="https://github.com/jaeunda/compiler">compiler</a></li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">여러 자료구조가 같은 자원을 가리킬 때<br />갱신 순서와 참조 횟수가 어긋나면 시스템 전체가 틀린다</p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 판단</p>
      <div class="pf-sec-b">
        <ol class="ps-why">
          <li>
            <p class="ps-why-q">전체를 복사하지 않고 스냅샷을 만들려면?</p>
            <p class="ps-why-s" data-k="조건">바뀐 블록은 일부인데 전체를 복사하면 디스크 공간을 버립니다.</p>
            <p class="ps-why-s" data-k="결정"><b>블록을 공유하고 블록별 참조 횟수를 두어, 쓰기 경로에서만 Copy-on-Write</b>하게 했습니다.</p>
            <p class="ps-why-s" data-k="효과">읽기는 기존 경로 그대로이고, 블록은 참조가 0이 될 때만 실제로 해제됩니다.</p>
            <p class="ps-why-s" data-k="디버깅">GDB와 실행 로그로 공유 블록의 참조 횟수가 처음 어긋난 지점을 찾아 수정했습니다.</p>
          </li>
          <li>
            <p class="ps-why-q">CPU를 비율대로, 예측 가능하게 나누려면?</p>
            <p class="ps-why-s" data-k="조건">기본 Round-Robin은 프로세스별 점유율을 지정할 수 없습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>pass가 가장 작은 프로세스를 고르고, 동률이면 PID로</b> 정했습니다.</p>
            <p class="ps-why-s" data-k="효과">같은 입력이면 같은 순서로 실행되고, pass가 넘치기 전에 전체를 기준값만큼 낮춥니다.</p>
          </li>
          <li>
            <p class="ps-why-q">커널 자료구조를 여러 개 함께 고칠 때 일관성은?</p>
            <p class="ps-why-s" data-k="조건">프레임 테이블, 역페이지 테이블, SW TLB가 같은 매핑을 따로 들고 있습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>테이블 갱신을 할당기의 임계 구역 안에서</b> 하고, 매핑이 바뀌면 TLB 항목을 즉시 무효화했습니다.</p>
            <p class="ps-why-s" data-k="디버깅">GDB로 함수 호출과 잠금 흐름을 따라가 교착 상태가 시작된 지점을 찾아 고쳤습니다.</p>
          </li>
          <li>
            <p class="ps-why-q">여러 데몬이 같은 파일을 쓴다면?</p>
            <p class="ps-why-s" data-k="조건">디렉터리마다 뜬 데몬이 설정 파일과 로그를 함께 씁니다.</p>
            <p class="ps-why-s" data-k="결정"><b>fcntl 잠금으로 접근을 직렬화</b>하고, 감시 경로가 겹치는 등록은 처음부터 막았습니다.</p>
            <p class="ps-why-s" data-k="효과">여러 데몬이 동시에 기록해도 설정과 로그가 깨지지 않고, 종료 요청 시 진행 중인 작업을 마친 뒤 끝납니다.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">교육 과정</p>
      <div class="pf-sec-b">
        <ul class="pf-cards3">
        <li>
          <p class="pf-card-m">2025.12 — 2026.01 <i>|</i> 스파르탄SW교육원 <i>|</i> 90시간</p>
          <h3 class="pf-card-t">Co-op AI Cloud Track</h3>
          <ul class="pf-li pf-li--sm">
            <li>Docker 이미지를 ECR에 올리고 EKS와 K‑PaaS에 배포했습니다.</li>
            <li>롤링&nbsp;업데이트와 롤백으로 배포 중 장애 대응을 실습했습니다.</li>
            <li>빌드에서 정적&nbsp;분석과 테스트를 거쳐 배포까지 이어지는 CI/CD 파이프라인을 구성했습니다.</li>
          </ul>
        </li>
        <li>
          <p class="pf-card-m">2026.07 — 2026.08 <i>|</i> FuriosaAI <i>|</i> 12시간</p>
          <h3 class="pf-card-t">GPU/NPU 기반 LLM Agent와 RAG</h3>
          <ul class="pf-li pf-li--sm">
            <li>FuriosaAI RNGD NPU 환경에서 LLM 추론과 AI 애플리케이션을 실습했습니다.</li>
            <li>Chunking, Embedding, FAISS 검색을 연결해 RAG 파이프라인을 구현했습니다.</li>
            <li>Tool&nbsp;Calling으로 검색을 외부 도구에 연결하고 실행 결과를 검증했습니다.</li>
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
        </ul>
      </div>
    </section>
    <nav class="ps-pager" aria-label="다른 프로젝트">
      <a href="/portfolio-systems/ongi" data-dir="prev"><span>← 이전</span><b>스마트 복약 케어 IoT 서비스</b></a>
      <a href="/portfolio-systems/" data-dir="next"><span>↑ 처음으로</span><b>전체 보기</b></a>
    </nav>
  </article>
</main>
<footer class="pf-foot">
  <p class="pf-foot-l"><a href="mailto:jaeunda@gmail.com">jaeunda@gmail.com</a><a href="https://github.com/jaeunda">github.com/jaeunda</a></p>
  <p class="pf-foot-r">2026.09</p>
</footer>

---
title: 스마트 복약 케어 IoT 서비스
description: ESP32·FreeRTOS 펌웨어로 서버–디바이스 통신 연동부터 실물 통합 시험까지 구현한 기록.
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
      <a href="/portfolio-systems/ongi" aria-current="page">IoT 서비스</a>
      <a href="/portfolio-systems/foundation">Foundation</a>
    </nav>
  </div>
</div>
<main class="pf-main">
  <article class="pf-case ps-detail" id="top">
    <div class="pf-case-top">
      <p class="ps-tag">Project 03</p>
      <h1 class="pf-case-h">스마트 복약 케어 IoT 서비스</h1>
      <p class="ps-name">Ongi <i>|</i> 서버–디바이스 통신 연동부터 실물 통합 시험까지</p>
      <p class="pf-case-sub">서버의 일정대로 기기가 약통을 열고, 센서로 복용 여부를 판정해 서버에 보고합니다.<br />이 흐름을 끝까지 동작하게 만드는 ESP32 펌웨어를 맡았습니다.</p>
      <ul class="pf-case-meta">
        <li><span>기간</span>2026.04 — 2026.07</li>
        <li><span>역할</span>서버–디바이스 연동 <i>|</i> ESP32 펌웨어 개발</li>
        <li><span>소속</span>2026 BMW 영 이노베이터 드림 프로젝트 <i>|</i> BMW 코리아 미래재단 <i>|</i> 4인 팀</li>
        <li><span>저장소</span><a href="https://github.com/Ongi-Team/ongi-device">github.com/Ongi-Team/ongi-device</a></li>
      </ul>
    </div>
    <section class="pf-sec">
      <p class="pf-sec-k">구조</p>
      <div class="pf-sec-b">
        <ol class="ps-arch">
          <li><p class="ps-box-k">App</p><p class="ps-box-t">복약 일정 등록</p><p class="ps-box-d">슬롯 · 시간</p></li>
          <li><p class="ps-box-k">Server · Spring Boot</p><p class="ps-box-t">일정 저장 · 변경 알림</p><p class="ps-box-d">MQTT 발행</p></li>
          <li><p class="ps-box-k">Device · ESP32 / FreeRTOS</p><p class="ps-box-t">최신 일정 조회 · 실행 판단</p><p class="ps-box-d">HTTP 재조회 · RTC</p></li>
          <li><p class="ps-box-k">Hardware · PWM / I2C</p><p class="ps-box-t">슬롯 개방 · 배출 감지</p><p class="ps-box-d">서보 · 광센서(ADC)</p></li>
        </ol>
        <p class="ps-return"><span>처리 결과 HTTP 회신 · 서버 기록 후 앱에서 조회</span></p>
        <p class="ps-lab">Firmware tasks</p>
        <ol class="pf-flow">
          <li data-zone="in"><b>MQTT</b><span class="pf-fl-t">이벤트 핸들러</span><span class="pf-fl-d">갱신 요청 기록, 원격 명령 enqueue만 수행</span></li>
          <li data-zone="code"><b>TASK</b><span class="pf-fl-t">schedule task</span><span class="pf-fl-d">HTTP로 일정 재조회, 1초마다 RTC와 슬롯 비교</span></li>
          <li data-zone="code"><b>TASK</b><span class="pf-fl-t">motor task</span><span class="pf-fl-d">Queue Set으로 예약·원격 명령을 한 줄로 처리</span></li>
          <li data-zone="code"><b>TASK</b><span class="pf-fl-t">intake 판정</span><span class="pf-fl-d">ADS1115로 15초간 배출 감지</span></li>
          <li data-zone="code"><b>TASK</b><span class="pf-fl-t">event task</span><span class="pf-fl-d">TAKEN / MISSED를 HTTP로 보고, 실패 시 재시도</span></li>
        </ol>
        <p class="pf-key"><span class="pf-key-code">콜백은 긴 작업을 하지 않고, 오래 걸리는 일은 전용 Task 하나가 맡는다</span></p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">문제</p>
      <div class="pf-sec-b">
        <p class="pf-ask">일정은 서버에 있고 모터는 기기에 있다<br />둘 사이가 끊겨도 기기는 틀리지 않아야 한다</p>
        <ul class="pf-li">
          <li>기기는 사설망(NAT) 뒤에 있어 서버가 직접 명령을 보낼 수 없습니다.</li>
          <li>예약 실행과 원격 제어가 같은 모터를 동시에 구동할 위험이 있습니다.</li>
          <li>일정이 갱신되는 도중에도 실행 중인 판단은 하나의 기준을 따라야 합니다.</li>
          <li>SW·HW·네트워크를 한 번에 붙이면 실패 원인이 어느 경계에 있는지 알 수 없습니다.</li>
        </ul>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">설계 판단</p>
      <div class="pf-sec-b">
        <ol class="ps-why">
          <li>
            <p class="ps-why-q">서버가 기기에 직접 명령할 수 없다면?</p>
            <p class="ps-why-s" data-k="조건">기기는 사설망(NAT) 뒤에 있고, 일정의 기준은 서버에 있습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>MQTT는 “바뀌었다”는 알림만, 일정은 HTTP로 통째로 다시 조회</b>하게 나눴습니다.</p>
            <p class="ps-why-s" data-k="효과">알림이 중복되거나 늦어도 기기는 서버의 최신 일정으로 수렴합니다.</p>
            <p class="ps-why-e"><a href="https://github.com/Ongi-Team/ongi-device/pull/60">PR #60</a></p>
          </li>
          <li>
            <p class="ps-why-q">두 경로가 같은 모터를 움직인다면?</p>
            <p class="ps-why-s" data-k="처음">두 Task가 같은 queue를 함께 소비해 배출 이벤트가 나뉘어 처리됐습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>모터는 motor task 하나만 제어</b>하고, 원격 명령도 Queue Set으로 같은 Task에 합류시켰습니다.</p>
            <p class="ps-why-s" data-k="효과">모터를 움직이는 경로가 하나뿐이라 동시 구동이 구조적으로 불가능하고, 하드웨어 접근에 잠금이 필요 없습니다.</p>
            <p class="ps-why-e"><a href="https://github.com/Ongi-Team/ongi-device/pull/23">PR #23</a><a href="https://github.com/Ongi-Team/ongi-device/pull/57">PR #57</a></p>
          </li>
          <li>
            <p class="ps-why-q">통신이 끊기거나 시간이 틀리면?</p>
            <p class="ps-why-s" data-k="조건">갱신 도중 실행 판단이 흔들리거나, 시각이 틀린 채로 약통이 열리면 안 됩니다.</p>
            <p class="ps-why-s" data-k="결정"><b>일정은 mutex 아래 통째로 교체하고 실행은 복사본으로</b>, SNTP 동기화 전에는 실행하지 않게 했습니다.</p>
            <p class="ps-why-s" data-k="효과">조회에 실패해도 마지막 정상 일정으로 계속 동작하고 5초 뒤 다시 시도합니다.</p>
            <p class="ps-why-e"><a href="https://github.com/Ongi-Team/ongi-device/pull/38">PR #38</a><a href="https://github.com/Ongi-Team/ongi-device/pull/15">PR #15</a></p>
          </li>
          <li>
            <p class="ps-why-q">하드웨어 없이 어디까지 검증할까?</p>
            <p class="ps-why-s" data-k="조건">SW·HW·네트워크를 한 번에 붙이면 실패가 어느 경계에서 났는지 알 수 없습니다.</p>
            <p class="ps-why-s" data-k="결정"><b>서보·센서·RTC를 인터페이스 뒤에 두고</b> 빌드 모드로 더미와 실물을 바꿔 끼웠습니다.</p>
            <p class="ps-why-s" data-k="효과">CI는 하드웨어 없이 빌드를 확인하고, 로직은 더미 빌드 로그로, 하드웨어는 하나씩 결합하며 실패 경계를 좁혔습니다.</p>
            <p class="ps-why-e"><a href="https://github.com/Ongi-Team/ongi-device/pull/25">PR #25</a><a href="https://github.com/Ongi-Team/ongi-device/pull/45">PR #45</a></p>
          </li>
        </ol>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">통합 시험</p>
      <div class="pf-sec-b">
        <p class="ps-lab">Integration test</p>
        <ol class="ps-steps">
          <li><p class="ps-box-t"><b>1</b>SW 연동 시험</p><p class="ps-box-d">더미 드라이버 적용</p></li>
          <li><p class="ps-box-t"><b>2</b>구동부 결합</p><p class="ps-box-d">서보 PWM · 배선</p></li>
          <li><p class="ps-box-t"><b>3</b>센서 결합</p><p class="ps-box-d">ADS1115 ADC</p></li>
          <li data-final><p class="ps-box-t">End-to-End 시연</p><p class="ps-box-d">실물 전 구간 동작 확인</p></li>
        </ol>
        <p class="ps-lab">Build modes</p>
        <ul class="ps-modes">
          <li><code>CI_BUILD</code><span>비공개 설정 없이 GitHub Actions에서 빌드. 하드웨어 경로는 더미로 대체</span></li>
          <li><code>TEST_BUILD</code><span>MQTT와 실물 의존 경로를 빼고 일정·이벤트·Task 전달만 확인</span></li>
          <li><code>DUMMY_TEST</code><span>서버 대신 고정 일정으로 실행해 모터 흐름과 이벤트를 로그로 확인</span></li>
          <li><code>일반 빌드</code><span>MQTT·HTTP·서보·센서를 모두 연결한 실물 시험</span></li>
        </ul>
      </div>
    </section>
    <section class="pf-sec" id="ongi-log">
      <p class="pf-sec-k">시험 로그</p>
      <div class="pf-sec-b">
        <p class="ps-log-intro">PR마다 확인 기준을 먼저 적고, 로그로 확인한 결과를 남겼습니다. 아래는 그중 통합 과정의 주요 항목입니다.</p>
        <ol class="ps-log">
          <li class="ps-log-g">1 <i>|</i> SW 연동 시험</li>
          <li>
            <p class="ps-log-w">05.02</p>
            <div class="ps-log-b">
              <p class="ps-log-t">Wi‑Fi 연결과 heartbeat<a href="https://github.com/Ongi-Team/ongi-device/pull/7">#7</a></p>
              <p class="ps-log-d">heartbeat Task가 IP 할당 전에 요청을 보내고 스택이 넘쳤습니다. IP 할당까지 대기하고 스택을 늘려 해결했습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.16</p>
            <div class="ps-log-b">
              <p class="ps-log-t">RTC 추상화와 NTP 동기화<a href="https://github.com/Ongi-Team/ongi-device/pull/15">#15</a></p>
              <p class="ps-log-d">블로킹 NTP 동기화가 Wi‑Fi 이벤트 콜백 안에 있었습니다. 콜백 밖으로 옮기고 SNTP 재초기화를 막았습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.25</p>
            <div class="ps-log-b">
              <p class="ps-log-t">motor task를 dispense queue의 유일한 소비자로<a href="https://github.com/Ongi-Team/ongi-device/pull/23">#23</a></p>
              <p class="ps-log-d">두 Task가 같은 queue를 소비해 이벤트가 나뉘어 처리됐습니다. 소비자를 하나로 줄이고 슬롯별 개방 → 대기 → 닫힘 순서를 로그로 확인했습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.29</p>
            <div class="ps-log-b">
              <p class="ps-log-t">복약 이벤트 HTTP 보고<a href="https://github.com/Ongi-Team/ongi-device/pull/32">#32</a></p>
              <p class="ps-log-d">정상 응답은 <code>http_status=200</code>, 403 응답은 실패로 판정해 <code>attempt=1/3</code>부터 <code>3/3</code>까지 재시도한 뒤 종료되는 것을 확인했습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.30</p>
            <div class="ps-log-b">
              <p class="ps-log-t">RAM 일정 snapshot<a href="https://github.com/Ongi-Team/ongi-device/pull/38">#38</a></p>
              <p class="ps-log-d">고정 일정 8개를 <code>version=1</code>로 적용하고, 슬롯 시각마다 한 번씩 배출 이벤트가 생겨 서버까지 기록되는 흐름을 더미 모터로 확인했습니다.</p>
            </div>
          </li>
          <li class="ps-log-g">2 <i>|</i> 구동부 결합</li>
          <li>
            <p class="ps-log-w">05.31</p>
            <div class="ps-log-b">
              <p class="ps-log-t">LEDC 서보 드라이버<a href="https://github.com/Ongi-Team/ongi-device/pull/45">#45</a></p>
              <p class="ps-log-d">50Hz, 14비트 PWM으로 슬롯마다 채널을 배정했습니다. 90°는 duty 1228, 0°는 409로 나오고 해당 슬롯만 움직이는 것을 확인했습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.31</p>
            <div class="ps-log-b">
              <p class="ps-log-t">서보 동작 보정<a href="https://github.com/Ongi-Team/ongi-device/pull/47">#47</a></p>
              <p class="ps-log-d">순간 이동을 500ms fade로 바꾸고, 뚜껑이 다 열린 뒤부터 감지를 시작하도록 대기 시간을 3초에서 15초로 늘렸습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">05.31</p>
            <div class="ps-log-b">
              <p class="ps-log-t">8채널 연속 구동<a href="https://github.com/Ongi-Team/ongi-device/pull/49">#49</a></p>
              <p class="ps-log-d">1분 간격 고정 일정으로 모든 슬롯을 차례로 열고 닫아, 건너뛰거나 두 번 실행되는 슬롯이 없는지 확인했습니다.</p>
            </div>
          </li>
          <li class="ps-log-g">3 <i>|</i> 센서 결합</li>
          <li>
            <p class="ps-log-w">06.02</p>
            <div class="ps-log-b">
              <p class="ps-log-t">ADS1115 광센서 입력<a href="https://github.com/Ongi-Team/ongi-device/pull/51">#51</a></p>
              <p class="ps-log-d">I2C 주소 두 개의 ADC에서 슬롯별 값을 읽습니다. 버스 오류는 “장치 없음”과 구분해 실물 빌드에서는 기동을 멈추게 했습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">06.02</p>
            <div class="ps-log-b">
              <p class="ps-log-t">6슬롯 하드웨어 구성<a href="https://github.com/Ongi-Team/ongi-device/pull/54">#54</a></p>
              <p class="ps-log-d">실제 기구에 맞춰 슬롯 매핑을 6개로 줄이고, 슬롯마다 한 번씩 개방·닫힘이 일어나는지 실물로 다시 시험했습니다.</p>
            </div>
          </li>
          <li class="ps-log-g">E2E <i>|</i> 서버 연동과 전 구간 시연</li>
          <li>
            <p class="ps-log-w">06.03</p>
            <div class="ps-log-b">
              <p class="ps-log-t">원격 OPEN_ALL / CLOSE_ALL<a href="https://github.com/Ongi-Team/ongi-device/pull/57">#57</a></p>
              <p class="ps-log-d">닫기 실패 시 남은 슬롯을 계속 닫고, CLOSE_ALL이 오지 않으면 10분 뒤 자동으로 닫습니다. MQTT 시작 전에 queue를 등록해 초기 명령 유실을 막았습니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">06.04</p>
            <div class="ps-log-b">
              <p class="ps-log-t">MQTT 알림 뒤 HTTP 일정 조회<a href="https://github.com/Ongi-Team/ongi-device/pull/60">#60</a></p>
              <p class="ps-log-d">부팅 시와 <code>SCHEDULE_UPDATED</code> 수신 시 일정을 받아 적용합니다. 잘못된 응답은 거부하고 이전 snapshot으로 계속 동작합니다.</p>
            </div>
          </li>
          <li>
            <p class="ps-log-w">07</p>
            <div class="ps-log-b">
              <p class="ps-log-t">최종 시연</p>
              <p class="ps-log-d">앱 → 서버 → 기기 → 센서 → 서버 → 앱으로 이어지는 전 구간을 실물로 시연했습니다.</p>
            </div>
          </li>
        </ol>
        <p class="pf-note"><span>검증 범위</span>로그와 실물 동작으로 확인한 기능 검증입니다. 장시간 신뢰성을 측정한 수치는 아닙니다.</p>
      </div>
    </section>
    <section class="pf-sec">
      <p class="pf-sec-k">남은 과제</p>
      <div class="pf-sec-b">
        <ul class="ps-gap">
          <li><b>재부팅 시 이벤트 유실</b><span>일정과 미전송 이벤트가 RAM에만 있습니다. 전송 전 NVS에 기록하고 응답 뒤 지우는 방식이 필요합니다.</span></li>
          <li><b>재시도와 새 이벤트의 구분</b><span>이벤트에 기기 측 시각과 멱등 키가 없어 서버가 재전송을 구분하지 못합니다.</span></li>
          <li><b>안전 명령의 지연</b><span>15초 감지 대기 중에는 CLOSE_ALL도 기다립니다. 안전 관련 명령에는 우선 처리 경로가 필요합니다.</span></li>
        </ul>
      </div>
    </section>
    <nav class="ps-pager" aria-label="다른 프로젝트">
      <a href="/portfolio-systems/weavegate" data-dir="prev"><span>← 이전</span><b>DB 동시성 오류 검증 자동화 도구</b></a>
      <a href="/portfolio-systems/foundation" data-dir="next"><span>다음 →</span><b>Linux 시스템 프로그래밍과 운영체제 커널</b></a>
    </nav>
  </article>
</main>
<footer class="pf-foot">
  <p class="pf-foot-l"><a href="mailto:jaeunda@gmail.com">jaeunda@gmail.com</a><a href="https://github.com/jaeunda">github.com/jaeunda</a></p>
  <p class="pf-foot-r">2026.09</p>
</footer>

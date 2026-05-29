---
tags:
  - project/seminar
  - topic/operating-systems
  - topic/rtos
Date: 2025-11-11
---

2025년 11월 11일 GDG 슈몰세미나 요약입니다.

![[rtos-overview_1.png]]

- GPOS → Soft RTOS → Hard RTOS 순으로 실시간성 요구 수준이 강화된다.
- 핵심은 “빠른 OS”가 아니라 “데드라인 보장 가능 여부”이다.
- Real-Time 시스템은 시간 제약을 만족해야 하는 시스템을 의미한다.

### General-Purpose Operating System

![[rtos-overview_2.png]]

- GPOS는 처리량(Throughput)과 공정성(Fairness)을 우선 목표로 설계된다.
- 여러 프로세스를 동시에 실행하며 CPU 자원을 균등하게 분배한다.
- 정확한 실행 시간 보장은 어렵기 때문에 Hard Real-Time에는 부적합하다.

### Real-Time

![[rtos-overview_3.png]]

- 두 시스템 모두 데드라인이 존재한다.
- Soft RT는 데드라인 실패 시 품질 저하 수준으로 끝난다.
- 그러나 Hard RT는 시스템 실패·안전사고 등 치명적 결과로 이어질 수 있다.

![[rtos-overview_4.png]]

- 스트리밍 서비스는 RTOS 없이 Application 레벨에서 실시간성 해결
- 버퍼링과 화질 조절을 통해 끊김 최소화
- 네트워크 상태 변화에 적응하며 재생 안정성 유지

![[rtos-overview_5.png]]

- ABR은 네트워크·버퍼 상태를 기반으로 화질을 동적으로 조절하는 기술이다.
- MSE는 브라우저가 미디어 버퍼를 직접 제어할 수 있도록 지원하는 API이다.
- 유튜브·넷플릭스 등의 적응형 스트리밍 핵심 기술로 사용된다.

### Soft RTOS

![[rtos-overview_6.png]]

- IoT·웨어러블 환경은 메모리와 전력 자원이 매우 제한적이다.
- 범용 OS 대신 경량 RTOS를 사용해 빠른 부팅·낮은 전력 소모 달성
- 대표 사례: FreeRTOS, Zephyr OS

![[rtos-overview_7.png]]

- Soft RTOS는 개발자가 Task priority와 자원 사용을 직접 제어한다.
- 범용 OS보다 훨씬 적은 메모리 환경에서 동작 가능하다.
- 대신 라이브러리·추상화 기능은 제한적이며 하드웨어 제어 비중이 크다.

### Hard RTOS

![[rtos-overview_8.png]]

- Hard RTOS의 핵심 목표는 “최악의 상황에서도 데드라인 보장”이다.
- 실행 시간 예측 가능성이 매우 중요하다.
- 항공기 제어·브레이크·에어백 등 안전 필수 시스템에 사용된다.

![[rtos-overview_9.png]]

- Hard RTOS는 실행 시간 예측을 위해 정적 메모리 할당 위주로 구성된다.
- Strict Priority 기반으로 높은 우선순위 Task를 항상 우선 실행한다.
- Priority Inheritance를 통해 우선순위 역전 문제를 완화한다.

##### 우선순위 역전(Priority Inversion) 문제

- 낮은 우선순위 Task가 점유한 자원을 높은 우선순위 Task가 기다리는 현상이다.
- 1997년 NASA Pathfinder 탐사선 문제로 유명해졌다.
- 이후 RTOS에서는 Priority Inheritance가 핵심 기법으로 자리잡았다.

![[rtos-overview_10.png]]

- 실제 시스템에서는 GPOS와 RTOS가 함께 사용되는 경우가 많다.
- 인포테인먼트·내비게이션은 GPOS 담당한다.
- 브레이크·에어백·센서 제어는 Hard RTOS 담당한다.

![[rtos-overview_11.png]]

- RTOS의 핵심은 “빠른 실행”보다 “예측 가능한 실행”
- Soft RT는 품질 저하를 허용하지만 Hard RT는 실패 자체를 허용하지 않는다.
- 시스템 요구사항에 따라 GPOS·Soft RTOS·Hard RTOS를 구분해 사용한다.

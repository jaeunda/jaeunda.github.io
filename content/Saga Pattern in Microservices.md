---
Date: 2026-01-05
tags:
  - topic/cloud
  - topic/distributed-systems
  - type/notes
  - project/co-op-cloud
featured: true
pinOrder: 4
---

Microservice Architecture에서는 각 서비스가 자신의 데이터베이스를 소유하고, 다른 서비스의 데이터베이스에 직접 접근하지 않는다. 서비스의 독립성과 데이터 캡슐화를 지킬 수 있는 구조지만, 하나의 비즈니스 작업이 여러 서비스의 데이터를 함께 변경해야 할 때는 트랜잭션을 처리하기 어려워진다.

예를 들어 주문을 생성하면서 고객의 한도를 확인하고 크레딧을 예약해야 한다고 하자. `Order Service`와 `Customer Service`가 서로 다른 데이터베이스를 사용한다면 두 변경을 하나의 로컬 ACID 트랜잭션으로 묶을 수 없다. 이처럼 서비스 경계를 넘는 비즈니스 트랜잭션의 일관성을 어떻게 관리할 것인지가 Saga Pattern이 해결하려는 문제다.

## 마이크로서비스에서 트랜잭션이 어려운 이유

- 각 마이크로서비스는 자신의 데이터베이스만 소유하고 관리한다.
- 서비스 경계를 넘는 작업에는 하나의 로컬 ACID 트랜잭션을 적용할 수 없다.
- 일부 서비스의 변경만 commit되면 분산된 데이터 사이에 불일치가 생길 수 있다.

단일 데이터베이스에서는 하나의 ACID 트랜잭션으로 여러 변경을 원자적으로 commit하거나 rollback할 수 있다. 반면 Database per Service 구조에서는 각 서비스가 자신의 로컬 트랜잭션만 제어할 수 있다. 주문 데이터 저장은 성공했지만 고객 크레딧 예약은 실패하는 것처럼, 일부 서비스의 변경만 commit된 상태가 생길 수 있다.

### 2PC를 사용하기 어려운 이유

- 참여자는 `Prepare`와 `Commit` 과정에서 coordinator의 결정을 기다려야 한다.
- Coordinator나 일부 참여자의 장애가 전체 트랜잭션을 지연시킬 수 있다.
- 데이터베이스와 메시지 브로커가 2PC를 지원하지 않거나, 지원하더라도 인프라 간 결합도가 높아질 수 있다.

**2PC(Two-Phase Commit)** 는 coordinator가 참여자들에게 `Prepare`를 요청한 뒤, 모두 준비됐을 때 `Commit`을 지시하는 전통적인 분산 트랜잭션 방식이다. 그러나 참여자가 coordinator의 결정을 기다리는 동안 관련 자원을 오래 점유할 수 있어 지연과 장애의 영향을 크게 받는다. Coordinator나 일부 참여자에 장애가 발생하면 복구될 때까지 트랜잭션이 진행되지 못할 수도 있다.

또한 데이터베이스와 메시지 브로커가 모두 2PC를 지원한다고 보장할 수 없고, 지원하더라도 서비스가 여러 인프라의 분산 트랜잭션 기능에 강하게 결합된다. 따라서 독립적인 배포와 장애 격리를 중시하는 MSA에서는 2PC 대신 서비스별 로컬 트랜잭션을 연결하는 방식을 고려할 수 있다.

## Saga Pattern

![[2pc-to-saga.png]]

- 분산 트랜잭션을 여러 Local Transaction의 연속으로 재정의한다.
- 각 Local Transaction은 데이터베이스를 갱신한 뒤 다음 작업을 실행할 메시지나 이벤트를 발행한다.
- 중간 단계가 실패하면 앞서 commit된 변경에 대해 Compensating Transaction을 역순으로 실행한다.

Saga Pattern은 서비스 경계를 넘는 하나의 비즈니스 트랜잭션을 **여러 로컬 트랜잭션의 연속**으로 재정의한다. 각 로컬 트랜잭션은 자신이 소유한 데이터베이스만 갱신하고, 처리 결과를 메시지나 이벤트로 전달해 다음 로컬 트랜잭션을 실행한다.

이미 commit된 로컬 트랜잭션은 일반적인 DB rollback으로 되돌릴 수 없다. 따라서 Saga는 앞선 작업의 효과를 비즈니스 의미에서 취소하는 **Compensating Transaction(보상 트랜잭션)**을 역순으로 실행한다. 예를 들어 크레딧 예약을 취소하거나 주문 상태를 `REJECTED`로 변경하는 작업이 보상 트랜잭션에 해당한다.

Saga가 여러 서비스의 변경을 하나의 ACID 트랜잭션으로 만드는 것은 아니다. 각 단계가 순차적으로 완료되면서 최종적으로 올바른 상태에 도달하도록 관리하는 방식이며, 처리 중에는 중간 상태가 외부에 노출될 수 있다. 따라서 시스템은 Eventual Consistency를 허용할 수 있어야 한다.

## Choreography와 Orchestration

Saga의 로컬 트랜잭션을 연결하는 방식은 크게 Choreography와 Orchestration으로 나뉜다.

| 구분      | Choreography                                             | Orchestration                                   |
| --------- | -------------------------------------------------------- | ----------------------------------------------- |
| 상호작용  | Event Driven                                             | Command Driven                                  |
| 제어 방식 | 각 서비스가 이벤트에 반응                                | 중앙 Saga Orchestrator가 흐름을 지시            |
| 장점      | 서비스 간 결합도가 낮고 별도의 중앙 조정 로직이 없음     | 전체 흐름이 명시적이며 모니터링과 관리가 쉬움   |
| 단점      | 흐름이 여러 서비스에 흩어지고 순환 의존성이 생길 수 있음 | Orchestrator의 상태 관리와 운영 복잡성이 추가됨 |

Choreography에 중앙 조정자가 없다고 해서 시스템 전체에 단일 실패 지점이 없다고 단정할 수는 없다. 마찬가지로 Orchestrator도 상태를 내구성 있게 저장하고 복제할 수 있으므로 그 자체가 반드시 SPOF가 되는 것은 아니다. 두 방식의 핵심적인 차이는 장애 유무보다 비즈니스 흐름의 제어 책임을 어디에 둘 것인가에 있다.

### Choreography-Based Saga

![[choreography-based-saga.png]]

Choreography 방식에서는 중앙 제어자 없이 각 서비스의 event handler가 다른 서비스에서 발행한 domain event를 구독한다. 하나의 로컬 트랜잭션이 완료되면 이벤트를 발행하고, 해당 이벤트를 받은 다음 서비스가 자신의 로컬 트랜잭션을 실행한다.

주문 생성 과정은 다음과 같이 진행된다.

1. `Order Service`가 `POST /orders` 요청을 받고 `Order`를 `PENDING` 상태로 생성한다.
2. `Order Service`가 `Order Created` 이벤트를 발행한다.
3. 이벤트를 구독한 `Customer Service`의 event handler가 고객 크레딧 예약을 시도한다.
4. 처리 결과에 따라 `Credit Reserved` 또는 `Credit Limit Exceeded` 이벤트를 발행한다.
5. `Order Service`의 event handler가 결과 이벤트를 받아 주문 상태를 `APPROVED` 또는 `REJECTED`로 변경한다.

서비스는 서로의 구현을 직접 호출하지 않고 이벤트로 연결되므로 결합도가 낮다. 반면 참여 서비스가 많아지면 전체 실행 흐름을 한곳에서 파악하기 어렵고, 서비스가 서로의 이벤트를 연쇄적으로 구독하면서 순환 의존성이 생길 수 있다.

### Orchestration-Based Saga

![[orchestration-based-saga.png]]

Orchestration 방식에서는 중앙의 Saga Orchestrator가 참여 서비스에 command를 전송하고 결과를 받아 다음 단계를 결정한다. 각 서비스는 자신에게 전달된 로컬 트랜잭션만 수행하며, 전체 비즈니스 흐름은 Orchestrator에 명시적으로 표현된다.

같은 주문 생성 과정은 다음과 같이 진행된다.

1. `Order Service`가 `POST /orders` 요청을 받고 `Create Order Saga` Orchestrator를 생성한다.
2. Orchestrator가 `Order`를 `PENDING` 상태로 생성한다.
3. Orchestrator가 `Customer Service`에 `Reserve Credit` command를 전송한다.
4. `Customer Service`가 크레딧 예약을 시도한다.
5. `Customer Service`가 처리 결과를 Orchestrator에 반환한다.
6. Orchestrator가 결과에 따라 주문 상태를 `APPROVED` 또는 `REJECTED`로 변경한다.

Orchestrator를 보면 Saga의 현재 단계와 다음 작업을 파악할 수 있어 복잡한 흐름을 관리하고 모니터링하기 쉽다. 대신 Orchestrator의 상태를 안정적으로 저장하고 복구해야 하며, 비즈니스 절차가 한 컴포넌트에 집중되면서 별도의 운영 복잡성이 생긴다.

## 실패와 보상 트랜잭션

### Automatic Rollback의 부재

- Local Transaction이 실패하면 이미 commit된 변경을 취소하는 Compensating Transaction을 역순으로 실행해야 한다.
- ACID 트랜잭션의 자동 rollback과 달리 보상 동작은 개발자가 직접 설계해야 한다.

Saga에는 ACID 트랜잭션과 같은 자동 rollback이 없다. Local Transaction이 실패하면 개발자가 앞서 commit된 변경을 취소하는 보상 트랜잭션을 직접 설계하고, 일반적으로 실행의 역순으로 호출해야 한다.

보상 트랜잭션은 데이터베이스를 과거 시점으로 완전히 되돌리는 물리적인 rollback과 다르다. 이미 외부에 알림을 보냈거나 결제 취소 수수료가 발생한 경우처럼 원래 작업의 흔적을 없앨 수 없는 상황도 있기 때문이다. 이때는 취소 상태와 이력을 새로 기록하는 방식으로 비즈니스 의미를 보상해야 한다. 보상 작업 자체가 실패할 가능성도 있으므로 retry할 수 있어야 하고, 같은 요청이 반복돼도 결과가 달라지지 않도록 idempotent하게 설계해야 한다.

### Isolation의 부재

- 완료되지 않은 Saga의 중간 상태가 다른 트랜잭션에 노출될 수 있다.
- 다른 작업이 중간 데이터를 읽거나 변경하면 데이터 이상으로 이어질 수 있다.
- 논리적인 접근 제한이나 실행 순서에 영향을 받지 않는 연산 설계가 필요하다.

여러 Saga와 일반 트랜잭션이 동시에 실행되면 Saga가 완료되기 전의 중간 상태가 다른 작업에 노출될 수 있다. 다른 트랜잭션이 이 데이터를 읽거나 변경하면 데이터 이상이나 잘못된 비즈니스 판단으로 이어질 수 있다.

이를 완화하기 위해 `PENDING`과 같은 상태를 두고 Saga가 완료될 때까지 특정 작업을 논리적으로 제한하는 **Semantic Lock**을 사용할 수 있다. 데이터 버전을 확인한 뒤 변경하는 낙관적 동시성 제어, 값을 다시 읽어 조건이 여전히 유효한지 확인하는 방식, 연산 순서가 달라도 결과가 같도록 만드는 commutative update도 상황에 따라 사용할 수 있다.

## DB 갱신과 이벤트 발행

- DB 갱신과 이벤트 발행 중 하나만 성공하면 데이터와 메시지의 상태가 달라진다.
- 비즈니스 데이터와 발행할 메시지를 하나의 Local Transaction으로 저장해야 한다.
- Transactional Outbox와 멱등한 consumer를 함께 고려해야 한다.

Saga의 각 단계는 데이터베이스를 갱신하면서 다음 단계를 위한 이벤트나 메시지도 발행해야 한다. DB 갱신은 성공했지만 이벤트 발행 전에 서비스가 중단되면 다음 단계가 실행되지 않는다. 반대로 트랜잭션이 rollback됐는데 이벤트만 발행되면 실제 데이터와 다른 흐름이 시작된다.

데이터베이스와 메시지 브로커를 하나의 로컬 트랜잭션으로 직접 묶을 수는 없으므로 **Transactional Outbox**를 사용할 수 있다. 서비스는 비즈니스 데이터와 발행할 메시지를 같은 DB 트랜잭션으로 저장하고, 별도의 Message Relay가 outbox에 기록된 메시지를 브로커로 전달한다. DB 트랜잭션이 commit될 때만 메시지가 남기 때문에 데이터 갱신과 이벤트 생성의 원자성을 확보할 수 있다.

Message Relay는 메시지를 발행한 직후 처리 완료를 기록하기 전에 중단될 수 있으므로 같은 메시지를 두 번 전달할 가능성이 있다. 따라서 메시지 ID를 기록하거나 이미 처리한 요청을 무시하는 방식으로 consumer를 idempotent하게 구현해야 한다.

## 언제 Saga를 사용할까

Saga Pattern은 다음 조건에 적합하다.

- 하나의 비즈니스 작업이 여러 서비스의 데이터를 변경한다.
- 각 서비스의 독립적인 데이터 소유권을 유지해야 한다.
- 처리 도중의 중간 상태와 Eventual Consistency를 허용할 수 있다.
- 실패한 작업을 취소할 명확한 보상 동작을 정의할 수 있다.

반대로 모든 변경이 즉시 함께 반영돼야 하거나 중간 상태 노출을 허용할 수 없고, 실패한 작업을 비즈니스적으로 보상하기도 어렵다면 Saga가 적합하지 않을 수 있다. 하나의 서비스와 데이터베이스 안에서 끝나는 작업이라면 로컬 ACID 트랜잭션을 사용하는 편이 더 단순하다.

## 정리

Saga Pattern은 분산 트랜잭션을 로컬 트랜잭션의 연속으로 나누고, 실패 시 보상 트랜잭션을 수행해 여러 서비스의 데이터 일관성을 관리한다. Choreography는 이벤트를 통해 제어 책임을 분산하고, Orchestration은 중앙 Orchestrator에 흐름을 명시한다.

다만 Saga는 자동 rollback과 isolation을 제공하지 않는다. 실제 시스템에서는 보상 트랜잭션뿐 아니라 Transactional Outbox, retry, idempotency, 동시성 제어와 모니터링까지 함께 설계해야 한다.

> Saga Pattern을 공부하면서 참고 자료의 핵심 내용과 추가로 확인한 실무 고려사항을 함께 정리했다.

## References

- [Microservice Architecture Pattern: Saga](https://microservices.io/patterns/data/saga.html)
- [Microservice Architecture Pattern: Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html)

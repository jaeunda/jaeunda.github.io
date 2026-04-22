---
tags:
  - topic/database
  - project/database-system
Date: 2026-04-21
---
# 2. Concurrency Control
## 2.5. Transaction Isolation in SQL

### 2.5.1. Transactions in SQL

> In SQL, a transaction **begins implicitly**

SQL에서 Transaction은 DML(Data Manipulate Language) 문장이 나오면 암시작으로 시작된다.

> A transaction ends by:
> - `COMMIT WORK`: commits current transaction and begins a new one
> - `ROLLBACK WORK`: causes current transaction to abort

Transaction은 commit work 또는 rollback 문장으로 종료된다.
- Commit work는 Transaction이 성공적으로 종료되었음을 의미한다.
- Rollback은 실패에 의한 Transaction 종료를 의미한다. (Abort)

##### Auto Commit

> In almost all database systems, by default, every SQL statement also **commits implicitly** if it executes successfully (**auto commit**).

SQL은 기본적으로 statement 하나를 transaction 하나로 간주한다. 따라서 DDL(Data Definition Language) 문장이 성공적으로 수행되면 따로 명시하지 않아도 자동으로 commit된다.

하지만 auto commit으로 인해 Atomicity가 깨지는 경우가 생길 수 있다. 이러한 경우 여러 statement가 하나의 단위가 되어 Transaction을 구성해야 한다. 이때는 명시적으로 auto commit을 끄고 직접 Transaction을 관리해야 한다.
- SQL transaction statements: `SET TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`

###### `SAVEPOINT` Example 

— Kim 계좌에서 Lee 계좌로 이체:
```sql
UPDATE accounts SET balance = balance - 100 WHERE name = 'Kim';
SAVEPOINT mySavePoint;
UPDATE accounts SET balance = balance + 100 WHERE name = 'Park';
-- oops... wrong account!!!
ROLLBACK TO mySavePoint;
UPDATE accounts SET balance = balance + 100 WHERE name = 'Lee';
COMMIT;
```

`SAVEPOINT`는 Transaction의 중간 저장점이다. `SAVEPOINT`를 활용하면 전체를 rollback하지 않고 중간 지점으로 rollback할 수 있다. (`ROLLBACK TO SAVEPOINT`)

### 2.5.2. Weak Levels of Consistency

모든 Transaction이 항상 Serializable할 필요는 없다. Transaction에서 정확한 값을 도출해야 하는 경우가 아니라면 Serializable이 불필요하므로 Accuracy를 위한 Isolation 대신 Performance를 택할 수 있다. (Trade-off)

> Some applications are willing to live with **weak levels of consistency** (non-serializable schedules):
> - e.g. A read-only transaction that wants an **approximate** total balance of all accounts
> - e.g. Database **statistics** computed for query optimization

Such transactions need not be serializable with respect to other transactions.

> **Tradeoff: accuracy for performance.** 
> Performance is the most important concern in database communities.

### 2.5.3. Degree-two Consistency

Weak Levels of Consistency로 보편적으로 지원되는 형식이 Degree-two Consistency이다. Degree-two Consistency에서는 2PL과 달리 S-lock을 제한 없이 해제할 수 있어 Serializable Transaction이 보장되지는 않는다.

> **Degree-two consistency** differs from 2PL:
> 	- **S-locks** may be released at **any time**
> 	- Locks may be **acquired at any time**
> 	- **X-locks** must be held till **end of transaction**
> 	- Serializability is **not guaranteed**

Consistency를 보장하기 위해 lock을 획득하고 해제하는 시점을 제한할 수 있다. 이때 Degree-two Consistency는 2PL에 비해 시점을 약하게 제한하며 Serializability를 보장하지 않는다.
- X-lock은 언제 잡아도 상관 없으나 transaction의 끝까지 들고 있어야 한다.

##### Cursor stability (special case of degree-two):

> - For reads: each tuple is locked → read → lock **immediately released** (커서가 위치하는 동안에만 읽기 록 보유)
> - X-locks held till end of transaction

|                | 2-Phase Locking | Degree-two Consistency<br>(Weak Levels of Consistency) | Cursor Stability<br>(Special case of Degree-two) |
| -------------- | --------------- | ------------------------------------------------------ | ------------------------------------------------ |
| aquire S-lock  | Growing Phase   | at any time                                            | **Cursor가 위치하는 동안만**                             |
| release S-lock | Shrinking Phase | **at any time**                                        | **데이터를 읽자마자**                                    |
| aquire X-lock  | Growing Phase   | at any time                                            | at any time                                      |
| release X-lock | Shrinking Phase | **till the end of transaction**                        | **till the end of transaction**                  |
데이터에 cursor가 위치하는 동안만 S-lock을 보유하며 데이터를 읽자마자 lock을 해제한다. Write할 때에는 X-lock을 획득하고 Transaction이 끝날 때까지 보유한다.
Cursor가 위치한 데이터는 타 Transaction에 의해 변경될 수 없다. 따라서 사용자에게 Cursor Data는 안정되게 보인다.

| T1        | T2        |
| --------- | --------- |
| Lock-S(Q) |           |
| Read(Q)   |           |
| Unlock(Q) |           |
|           | Lock-X(Q) |
|           | Read(Q)   |
|           | Write(Q)  |
|           | Unlock(Q) |
| Lock-S(Q) |           |
| Read(Q)   |           |
| Unlock(Q) |           |
- T1에서 Q에 대하여 lock-S를 획득하고, 데이터를 읽자마자 lock-S를 해제한다.
- T1이 lock을 해제했으므로 T2는 Q에 대한 lock-X를 획득할 수 있다.
- T2에서 Q에 대하여 lock-X를 획득하면 T2가 끝날 때까지 lock-X를 보유하고 있어야 한다.

이 예시에서, T1이 한 Transaction 안에서 Q의 값을 두 번 읽었는데 값이 달라졌다. Unrepeatable Read가 발생하였으므로 Serializable하지 않다.
### 2.5.4. Transaction Isolation in SQL

SQL은 non-serializable execution을 지원한다. 이를 위한 4가지 격리 수준이 있다. 격리 수준이 낮을수록 performance는 높지만 accuracy는 떨어진다.

##### Problem
먼저 세 가지 이상 현상을 이해해야 한다.
###### 1. Lost Update $\to$ Long X-lock
두 Transaction이 같은 데이터를 동시에 수정할 때 먼저 쓴 값이 사라지는 현상이다. 한 Transaction에서 write한 데이터를 commit하지 않은 채로  다른 Transaction에서 같은 데이터를 write하면 Lost Update가 발생한다. 따라서 Lost update를 방지하기 위해서는 해당 데이터에 대한 X-lock을 commit/abort까지 유지해야 한다.
```
T1: Read(X=100) → Write(X=150)
T2: Read(X=100) → Write(X=200)  ← T1의 수정이 사라짐!
```

###### 2. Dirty Read $\to$ acquire S-lock
아직 commit되지 않은 데이터를 읽는 현상이다. Cascading Rollback의 원인이 될 수 있다.
```
T1: Write(X=200) (미완료)
T2: Read(X=200)  ← T1이 rollback하면 없던 값을 읽은 것!
```
###### 3. Unrepeatable Read $\to$ Long S-lock
한 Transaction 내에서 같은 데이터를 두 번 읽었는데 값이 다른 현상이다. S-lock을 commit/abort 시에만 해제할 수 있도록 강제하면 Unrepeatable Read를 방지할 수 있으나 performance가 저하된다. 
```
T1: Read(X=100)
T2: Write(X=200), Commit
T1: Read(X=200)  ← 같은 트랜잭션인데 값이 바뀜!
```

##### Isolation Level

SQL allows **non-serializable** executions. Four isolation levels:

| Level                | 설명                                                                                                                                  | 방지하는 문제                                                                  |                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Serializable**     | Default. 완전한 직렬가능 보장<br>                                                                                                            | Lost update <br>+ Dirty read <br>+ Unrepeatable read +Phantom Phenomenon | Long S-lock <br>+ Long X-lock <br>+ Index or Table Locking |
| **Repeatable read**  | Committed records only; repeating a read returns the same value (read locks retained). <br>But **phantom phenomenon not prevented** | Lost update <br>+ Unrepeatable Read<br>+ Dirty read                      | Long S-lock<br>+ Long X-lock                               |
| **Read committed**   | Same as degree-two consistency (most systems: cursor-stability)                                                                     | Lost update <br>+ Dirty read                                             | Short S-lock<br>+ Long X-lock                              |
| **Read uncommitted** | Allows even uncommitted data to be read                                                                                             | Lost update                                                              | No S-lock <br>+ Long X-lock                                |

```sql
SET TRANSACTION [READ ONLY | READ WRITE]
  ISOLATION LEVEL [SERIALIZABLE | REPEATABLE READ
                  | READ COMMITTED | READ UNCOMMITTED];
```

- SQL2 default: **READ WRITE, SERIALIZABLE**
	- Exception: `READ UNCOMMITTED` → automatically **READ ONLY**
- **In many commercial DB systems, `READ COMMITTED` is the actual default** 
	- — must be explicitly changed to serializable when required


##### Transaction Isolation Effect:

|Common Name|Read Uncommitted|Read Committed|Serializable|
|---|:-:|:-:|:-:|
|**Lock Protocol**|Long X-lock on writes|Long X-lock + **Short S-lock** on reads|Long X-lock + **Long S-lock** on reads|
|**Protection**|No lost update|No lost update, No dirty read|No lost update, No dirty read, Repeatable read|
|**Dirty data**|Don't overwrite dirty data; others don't overwrite yours|Additionally, don't read dirty data|Additionally, others don't read dirty data|
|**Committed data**|Writes visible at EOT|Same|Same|

### 2.5.5. Transaction Isolation Example

**시나리오:** 비행기 좌석 예약 시스템

1. Find an available seat.
2. Reserve it by setting occupied to 1. If none, abort.
3. Ask the customer for approval.
4. If so, commit. If not, release the seat by setting occupied to 0.
5. And repeat step 1 to get another seat.

| Isolation Level      | 발생 가능한 현상                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **Read uncommitted** | No S-lock: 읽은 데이터에 신빙성이 없다. 예를 들어 모든 좌석이 만석이라고 표시되어도 실제로는 빈 좌석이 있을 수 있다. 반대의 경우도 성립한다.                   |
| **Read committed**   | Short S-lock: 고객의 승인과 실제 예약 처리 사이에 다른 Transaction이 같은 좌석을 먼저 차지할 수 있다.                                   |
| **Repeatable read**  | Long S-lock: 한 번 확인한 좌석은 Transaction 끝까지 유지된다. <br>Phantom: 단, Transaction 중간에 생기는 새로운 좌석은 인식하지 못할 수 있다. |

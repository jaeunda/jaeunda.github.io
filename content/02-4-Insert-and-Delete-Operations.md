---
tags:
  - topic/database
  - project/database-system
Date: 2026-04-21
---
# 2. Concurrency Control
## 2.4. Insert and Delete Operations

### 2.4.1. Insert and Delete Operations

- A **delete** operation may be performed only if the transaction has an **X-mode lock** on the tuple
- A transaction that **inserts** a new tuple is given an **X-mode lock** on the tuple
- Insertions and deletions can lead to the **phantom phenomenon**

Delete와 Insert Operation은 X-mode lock을 획득해야만 수행 가능하다. 

이때 Insertion과 Deletion으로 인해 Phantom Phenomenon이 발생할 수 있다. Insert/Delete는 tuple이 아니라 **집합 자체**를 변경하기 때문이다. 따라서 Tuple locking을 하는 경우 **현재 존재하는 tuple만 lock**을 걸기 때문에 새로 생긴 tuple 또는 삭제된 tuple는 다른 Transation이 인식하지 못할 수 있다.

이렇게 한 Transaction 안에서 동일한 조건을 두 번 읽었는데 결과가 달라지는 현상을 Phantom Phenomenon이라고 한다.

##### **Phantom Phenomenon**
- 한 트랜잭션 안에서 insert 전과 후의 스냅샷을 각각 읽게 되어, (없었던 tuple이 나중에 나타남)
- 또는 delete 전과 후의 스냅샷을 각각 읽게 되어 (있었던 tuple이 나중에 사라짐)
- non-serializable한 결과가 나오는 현상
	- 어떤 serial order로도 재현할 수 없는 모순된 결과가 나오는 현상.
- insert나 delete 연산이 포함된 경우에만 발생한다.

> A transaction that scans a relation to find sum of balances of all accounts in Busan, and another transaction that inserts a new Busan account, are **conceptually in conflict despite not accessing any tuple in common**. If only tuple locks are used, non-serializable schedules can result.

예를 들어 한 Transaction은 Busan의 모든 계좌의 합을 계산하고, 다른 Transaction은 새로운 Busan account tuple을 추가한다고 하자. 이러한 경우 **물리적으로는 lock conflict가 발생하지 않는다**. Busan account는 기존 Table에 없던 새로운 tuple이기 때문이다. 하지만 둘 다 동일한 Busan account 집합을 다루고 있으므로 논리적으로 semantic conflict가 발생한다.
### 2.4.2. Phantom Phenomenon Example

**Bank databases:**

`Account(number, location, balance)`

|number|location|balance|
|---|---|---|
|100|Seoul|1700|
|200|Busan|1000|
|300|Busan|500|

`Assets(location, total)`

|location|total|
|---|---|
|Seoul|1700|
|Busan|1500|

- **T1**: Reads all accounts in Busan from `Account` and compares with `Assets`
- **T2**: Add tuple `<400, Busan, 700>` to `Account` and update `Assets` accordingly

T1은 Busan의 모든 account를 읽고 계좌의 합을 계산한다. 
T2는 <400, Busan, 700> tuple을 추가하고 Assets 테이블을 갱신한다.

**Possible 2PL-based execution (with tuple locking):**

Table lock이 아닌 Tuple 단위로 lock을 걸 경우 다음과 같은 문제가 발생한다. (2PL-based라고 가정한다.)

```
T1: Read(Account[100], Account[200], Account[300])
T2: insert(Account[400, Busan, 700])
T2: read(Assets[Busan])    // returns 1500
T2: write(Assets[Busan])   // writes 2200
T1: read(Assets[Busan])    // returns 2200  ← 불일치 발생!
```

T2가 Tuple을 추가하기 전에 T1이 Account Table을 읽는다. T1은 Busan account의 잔액을 모두 더하여 Assets와 비교하는데, Assets를 읽기 전에 T2가 추가하면 T1은 Tuple을 추가하기 전과 후의 데이터를 모두 읽게 된다. 한 Transaction 내에서 Serializable하지 않으며 Inconsistent한 현상이 발생하는 것이다.

- Not serializable — `<T1, T2>`나 `<T2, T1>` 어느 Serial Schedule과도 동일하지 않다.
- Possible with tuple locking
	- T1이 기존 tuple에 대한 lock-S를 보유하고 있으므로 T2이 요청한 새로운 tuple의 lock-X와 충돌하지 않는다.
	- T2가 Assets에서 Busan에 해당하는 tuple에 대해 lock-X를 얻어 update한 후, T1이 동일한 tuple에 대해 lock-S를 요청했다. 동시에 접근하지 않으므로 lock 충돌이 발생하지 않는다.

###### Table Locking Only

Tuple locking이 아닌 Table locking을 사용하는 방식으로 Phantom Phenomenon 문제를 해결할 수 있다.

- T1이 Account Table 전체에 S-lock을 건다면
- T2는 tuple을 insert하기 위해 X-lock을 요청하고 T1이 끝나기를 기다려야 한다.
- 위 예시는 2PL을 전제하므로 T1은 Account Table의 S-lock을 획득하고, Assets의 S-lock도 획득하여 Busan의 합계를 읽고 나서야 S-lock을 release할 수 있다.
- 이후에는 T2가 X-lock을 얻어 값을 갱신하여도 T1에서는 문제가 발생하지 않으며 Serializable한 결과가 도출된다.

하지만 Concurrency는 박살난다...

### 2.4.3. How to Handle Phantom Problem

Phantom Problem을 방지하기 위해 Table Locking 대신 실질적으로 Index Locking을 사용할 수 있다.
집합 조건을 Index로 표현하여 Tuple이 아니라 Index entry에 lock을 건다.
##### Index Locking

> - Every relation is likely to have at least one index
> - A transaction can access tuples only after finding them through indices

T1이 Index 자체에 S-lock을 얻으면, T2는 새로운 Tuple을 insert하기 위해 해당 Index에 대해 X-lock을 요청한다.
하지만 S-lock과 X-lock은 Incompatible하므로 Lock Conflict가 발생하고 T2는 T1이 lock을 해제할 때까지 기다린다.
따라서 Phantom Phenomenon이 발생하지 않는다.

###### Index Locking이란?

- T1이 Busan account 전체를 읽으려면 
- Root $\to$ Internal nodes $\to$ Leaf nodes 순서대로 타고 내려가면서 데이터를 찾아야 한다. 
- 이 경로의 Internal nodes와 Leaf Nodes에 S-lock을 건다. (lookup)
```
			  [Busan | Seoul]          ← Internal node
             /               \
    [Busan,1000]          [Seoul,1700]  ← Leaf nodes
    [Busan,500]                         (실제 데이터 위치 저장)
```
- T2가 새 Busan tuple `<400, Busan, 700>`을 삽입하려면 Busan Index의 leaf node를 수정해야 한다. 
- 해당 leaf node에 X-lock을 요청하면 T1의 S-lock과 incompatible하므로 대기한다.
- 따라서 Phantom Phenomenon을 방지할 수 있다.

###### Applying 2PL for Index:

이론적으로 Index Locking에 2PL을 적용하면 Phantom Phenomenon을 완전히 방지할 수 있다.

Index 기반에서는 lookup을 수행하기 위해 internal nodes와 leaf nodes 모두에 S-mode lock을 걸어야 한다. 여기에 더하여 insert/delete/update를 수행하기 위해서는 해당 연산에 영향을 받는 모든 node에 X-lock을 걸어야 한다. 이 둘 사이에는 lock conflict가 발생하므로 동시에 수행할 수 없으며 하나의 Transaction은 반드시 기다려야 한다. 

따라서 Phantom Phenomenon은 발생하지 않는다.

- A transaction performing a **lookup** must lock all non-leaf/leaf nodes in **S-mode** (even if leaf contains no matching tuples)
- A transaction that **inserts/updates/deletes** must obtain **exclusive locks** on all affected nonleaf/leaf nodes
- Guarantees phantom phenomenon never occurs — but **not practical** due to excessive **overhead**

하지만 Index 구조에서는 자연적으로 데이터 간의 순서가 발생한다. 2PL을 그대로 적용하면 Index의 Internal node lock을 Shrinking phase 이전에 해제하지 못하므로 병목이 발생한다. 따라서 Index에는 Graph-based Protocol을 사용하는 것이 더 효율적이다.

### 2.4.4. Concurrency in Index Structures

> Index structures are accessed **very often** (much more than other data items). 
> Applying 2PL to index structures → **low concurrency**. 
> 
> Goal: **release locks on internal nodes early** (not in a two-phase fashion).

 Index는 모든 Transaction이 데이터를 찾을 때마다 반드시 거쳐가는 구조이다. Index는 일반 tuple보다 훨씬 자주 접근된다. 
 
 앞서 보았듯이 Index Locking에 2PL을 그대로 적용하면 병목이 발생할 수 있다. 예를 들어 Root는 모든 Transaction의 공통 진입점인데 2PL에 따라 Shrinking Phase 이전에는 Lock을 해제할 수 없으므로 뒤따르는 Transaction이 모두 Wait해야할 수 있다. 이러한 경우 Concurrency가 현저히 떨어진다.
 
##### Crabbing for B⁺-tree:

Crab이 옆으로 걷는 것과 유사하여 Crabbing이라고 한다.

> 1. Lock **root** node in **shared** mode
> 2. After locking required children in shared mode, **release lock on parent**
> 3. During insertion/deletion, **upgrade leaf node locks to exclusive**
> 4. When split/coalescing requires changes to parent, lock parent in **exclusive** mode

###### Search

데이터를 읽을 때 자식 lock을 잡는 순간 부모 lock을 해제한다면 위와 같은 문제를 해결할 수 있다.  
- Root node에 Shared lock을 걸고, 자식 node에 접근한다. 이때 자식 node의 S-mode lock을 획득하고 나면 Root node의 S-mode lock을 즉시 해제한다. 
- 또한 Leaf node의 S-mode lock을 획득하면 Internal node의 S-mode lock을 즉시 해제한다. 
이처럼 상대적으로 Transaction이 더 많이 거쳐가는 상위 노드의 lock을 미리 해제한다면 병목 발생을 줄일 수 있다.

###### Insert/Delete

데이터를 insert/delete할 때에는 leaf node의 lock을 X-mode로 upgrade한다. 
- Root node부터 Leaf node에 도달할 때까지 Crabbing 방식으로 S-mode lock을 획득한다.
- Leaf node에 도달하면 X-mode lock으로 upgrade하고 데이터를 insert/delete한다.

만약 Split/Merge가 발생하면?
- Leaf node의 X-lock을 보유한 상태로 부모인 Internal node의 X-lock을 요청해야 한다.

###### Excessive Deadlock 발생 가능성

T1에서 Split 또는 Merge가 발생하여 부모인 Internal node의 X-lock을 요청할 때, T2에서 search하며 Internal node가 S-lock을 보유하고 있다면 Deadlock이 발생할 수 있다.
- T2: Internal node는 S-lock을 보유한 상태로 Leaf node의 S-lock을 기다리고, 
- T1: Leaf node는 X-lock을 보유한 상태로 Leaf node의 X-lock을 기다리게 된다.

Index는 Top-down 순서로 데이터를 읽도록 설계된 구조이다. Split/Merge 때문에 역방향(Bottom-up)으로 lock을 추가 요청하게 되므로 Excessive Deadlock이 발생한다. 

##### Better protocols are available:

실제 상용 시스템에서는 Index의 정확성만 보장되면 **non-serializable**한 접근을 허용한다.
Internal node를 읽는 순간 다른 Transaction이 그 값을 바꿔 정확하지 않더라도, 최종적으로 올바른 Leaf node에만 도착하면 된다는 아이디어를 기반으로 한다.

> - It is acceptable to have **non-serializable** concurrent access to an index as long as the **accuracy** of the index is maintained
> - Release lock on parent **before** acquiring lock on child, and deal with changes that may have happened in between
> - The exact values read in an **internal node** of a B⁺-tree are irrelevant so long as we land up in the **correct leaf node**

Crabbing 방식과 달리 **자식의 lock을 획득하기 전**에 부모의 lock을 해제한다. 부모 lock을 해제하고 자식이 lock을 획득하는 사이 다른 Transaction이 Internal node의 값을 바꿀 수 있다. 하지만 Internal node의 값은 상관 없고 올바른 Leaf node에 도착하기만 하면 된다.

이때 node에 대한 split/merge가 필요하면 lock을 해제하고 구조 연산을 수행한다. 이때 운영체제의 semaphore로 구현한 **latch**를 활용하여 배타적인 수행을 보장한다.
- 부모 lock을 먼저 해제하고 자식 lock을 획득한다.
- 그 사이 다른 transaction이 split/merge를 수행할 수 있다. (structural modification)
- 이때 짧은 시간 동안 노드를 배타적으로 점유해야 하므로 transaction lock 대신 latch를 사용한다.
- latch를 걸어 해당 노드를 잠시 잠그고, split/merge가 끝나면 즉시 해제한다.
	- Semaphore가 한 시점에 하나의 thread만 critical section에 진입하도록 보장한다.

참고: C. Mohan and F. Levine, "ARIES/IM: An Efficient and High-Concurrency Index Management Method Using Write-Ahead Logging", ACM SIGMOD 1992.
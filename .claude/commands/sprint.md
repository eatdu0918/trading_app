# /project:sprint — 스프린트 계획 및 작업 분배

$ARGUMENTS

## Orchestrator: 스프린트 계획 프로토콜

위 목표/마일스톤을 기반으로 스프린트를 계획하세요.

### 1. 현재 상태 파악

```bash
git log --oneline -10        # 최근 커밋
git diff main --name-only    # 진행 중인 변경사항
pnpm typecheck               # 현재 타입 상태
pnpm test                    # 현재 테스트 상태
```

### 2. 마일스톤 분석

각 목표에 대해:

- **Core 작업**: 필요한 새 타입/함수
- **DataFeed 작업**: 새 WS 스트림
- **Frontend 작업**: UI 컴포넌트/페이지
- **Test 작업**: 작성할 테스트
- **의존성**: 어떤 작업이 먼저 완료되어야 하는가

### 3. 작업 분배 계획

```markdown
## 스프린트 계획: [마일스톤명]

### 작업 순서

#### Phase 1: Core (병렬 불가 — 다른 모든 작업의 기반)

- [ ] [Core Agent] [타입/함수 작업]
- [ ] [Core Agent] [테스트 작성]

#### Phase 2: DataFeed + Frontend (병렬 실행 가능)

- [ ] [DataFeed Agent] [새 스트림 구현]
- [ ] [Frontend Agent] [컴포넌트 구현]

#### Phase 3: 통합 & 테스트

- [ ] [Frontend Agent] [DataFeed 훅 연결]
- [ ] [Test Agent] 전체 테스트 실행

#### Phase 4: QA & PR

- [ ] [QA Agent] 코드 리뷰
- [ ] Orchestrator: PR 생성
```

### 4. 실행 시작

계획 확인 후 Phase 1부터 순서대로 각 에이전트에 위임하세요.
각 에이전트 완료 시 결과를 확인하고 다음 Phase로 진행.

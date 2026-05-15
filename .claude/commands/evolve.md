# /project:evolve — 자율 진화 사이클

$ARGUMENTS

## Orchestrator: 프로젝트 자율 진화 프로토콜

이 명령은 외부 리서치 → 기획 → 설계 → 구현 → 검증의 전체 사이클을 실행합니다.
인수 없으면 전체 사이클, 인수 있으면 해당 단계부터 시작.

```
evolve                → 전체 사이클 (리서치부터)
evolve from-pm        → PM 단계부터 (기존 리서치 결과 활용)
evolve from-design    → 디자인 단계부터 (기존 PM 결과 활용)
evolve from-feature   → 구현 단계부터 (기존 설계 결과 활용)
evolve quick          → 리서치 생략, 백로그 상위 항목 즉시 구현
```

---

## Phase 0: 현재 상태 파악 (항상 실행)

```bash
git log --oneline -5          # 최근 작업 확인
pnpm typecheck 2>&1 | tail -5  # 타입 오류 없는지 확인
pnpm test 2>&1 | tail -10      # 테스트 상태 확인
```

현재 백로그 확인: `agents/pm/backlog.md` (있다면)

---

## Phase 1: 외부 리서치 (Research + Competitive)

> 스킵 조건: `from-pm`, `from-design`, `from-feature`, `quick` 인수

### 1-A: 사용자 불편사항 리서치

다음 쿼리로 WebSearch 실행 (최소 3개 소스):

```
site:reddit.com "TradingView" (slow OR lag OR frustrating OR missing OR wish) 2024 2025
site:reddit.com "crypto trading app" mobile experience
"trading platform" alternative complaints site:news.ycombinator.com
site:reddit.com r/algotrading "wish it had" OR "I want" chart features
TradingView community forum complaints 2025
```

### 1-B: 경쟁사 최신 업데이트 확인

```
TradingView new features 2025
Coinigy update 2024 2025
"crypto charting" app new release 2025
```

### 1-C: 리서치 결과 저장

`agents/research/findings/YYYY-MM-DD.md`에 저장.
상위 5개 불편사항 식별.

---

## Phase 2: 기획 (PM Agent)

> 스킵 조건: `from-design`, `from-feature`, `quick`

### 2-A: 기능 후보 추출

Phase 1 결과에서 구현 가능한 기능 추출.
ICE 점수 산출 (Impact × Confidence × Effort).

### 2-B: 백로그 업데이트

`agents/pm/backlog.md` 업데이트.
ICE 상위 2-3개를 이번 진화 사이클 대상으로 선정.

### 2-C: 선정 근거 문서화

왜 이 기능을 선택했는지 명시:

- 리서치 빈도
- 경쟁사 대비 차별화
- 구현 비용 대비 효과

---

## Phase 3: 설계 (Design Agent)

> 스킵 조건: `from-feature`

선정된 기능별로:

### 3-A: UI/UX 스펙 작성

`agents/design/specs/[feature].md` 생성:

- 데스크톱/모바일 레이아웃
- 컴포넌트 분해
- CSS 변수 매핑
- 상태 설계

### 3-B: 영향 범위 확정

- Core 변경 필요 여부
- DataFeed 변경 필요 여부
- Frontend 컴포넌트 목록
- DB 스키마 변경 여부

---

## Phase 4: 구현 (기존 Feature 워크플로우)

Phase 3의 설계를 기반으로 `/project:feature`와 동일한 흐름으로 실행:

### 4-A: Core Agent (타입/함수 변경 있을 때)

`packages/core/CLAUDE.md` 참고하여 실행.

### 4-B: DataFeed Agent + Frontend Agent (병렬)

각 CLAUDE.md 참고하여 실행.

### 4-C: Test Agent

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## Phase 5: 품질 검증 (QA + Performance + Security)

### 5-A: QA 체크

`pnpm typecheck && pnpm lint && pnpm test && pnpm build`
0 errors, 0 warnings 확인.

### 5-B: 성능 회귀 체크

`agents/performance/CLAUDE.md`의 체크리스트:

- 새 WebSocket 핸들러에서 배칭 적용됐는가
- 불필요한 리렌더 패턴 없는가

### 5-C: 보안 체크

`agents/security/CLAUDE.md`의 매 PR 체크리스트:

- 새 Server Action에 auth() 있는가
- 외부 데이터 검증 있는가

---

## Phase 6: 완료 보고

```
## 진화 사이클 완료

### 리서치 발견 (상위 불편사항)
1. [문제] — 빈도: [높음]

### 이번 사이클에서 구현한 기능
1. [기능명] — ICE: XX
   변경 파일: [목록]
   완료 기준: ✅ 모두 통과

### 품질 게이트
✅ typecheck: 0 errors
✅ lint: 0 warnings
✅ test: all pass
✅ build: successful

### 다음 사이클 후보
1. [기능명] — ICE: XX (백로그 대기)

### 저장된 산출물
- agents/research/findings/YYYY-MM-DD.md
- agents/pm/backlog.md (업데이트)
- agents/design/specs/[feature].md
```

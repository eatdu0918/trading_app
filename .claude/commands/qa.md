# /project:qa — 품질 검사 및 코드 리뷰

$ARGUMENTS

## QA Agent: 코드 품질 검사 프로토콜

현재 브랜치 변경사항을 대상으로 품질 검사를 수행하세요.

### 1. 자동 품질 게이트

```bash
pnpm typecheck   # TypeScript 에러 0개
pnpm lint        # ESLint 경고 0개
pnpm test        # 전체 테스트 통과
```

### 2. 변경사항 검토

```bash
git diff main --name-only   # 변경된 파일 목록
git diff main               # 전체 diff
```

각 변경 파일에 대해:

**Core (`packages/core/`)**

- 순수 함수 원칙 준수 여부
- Zod 스키마 정확성
- 테스트 커버리지

**DataFeed (`packages/datafeed/`)**

- WebSocket cleanup (unsubscribe) 누락 여부
- 에러 핸들링 적절성
- 어댑터 타입 변환 정확성

**Frontend (`apps/web/`)**

- Tailwind v4 CSS 변수 패턴 (`var(--color-xxx)`)
- `useEffect` cleanup 누락 여부
- `noUncheckedIndexedAccess` 배열 가드
- 모바일 반응형 (`md:` 브레이크포인트)
- Server Actions 인증 체크 (`auth()` 호출)

### 3. 보안 체크

- Server Actions에서 `userId` 검증 여부
- 환경 변수 클라이언트 노출 여부 (`NEXT_PUBLIC_` 접두사)
- SQL injection 위험 여부 (Drizzle ORM 사용 시 파라미터화)

### 4. 성능 체크

- 불필요한 리렌더링 (`useMemo`, `useCallback` 필요 여부)
- WebSocket 중복 구독 여부
- 큰 컴포넌트 dynamic import 필요 여부

### 리포트 형식

```
## QA 리포트

### 자동 게이트
[typecheck/lint/test 결과]

### 코드 리뷰 소견
[파일별 이슈 또는 "이슈 없음"]

### 보안 이슈
[발견된 보안 이슈 또는 "없음"]

### 권장 개선사항
[필수 수정 / 선택적 개선사항 구분]

### 승인 여부
✅ 병합 준비 완료 / ⚠️ 수정 필요
```

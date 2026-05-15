# /project:feature — 전체 기능 개발 워크플로우

$ARGUMENTS

## Orchestrator: 새 기능 개발 프로토콜

위 기능 요청을 분석하여 다음 단계로 처리하세요.

### 1단계: 기능 분석 (먼저 실행)

다음을 파악하세요:

- 영향받는 패키지: core / datafeed / web (복수 가능)
- 새로 필요한 타입/인터페이스
- 새로 필요한 Binance WS 스트림 (있다면)
- UI 컴포넌트 및 상태 변경
- DB 스키마 변경 필요 여부

### 2단계: Core Agent 위임 (타입/함수 변경이 있을 때)

`packages/core/CLAUDE.md`를 참고하여 다음을 수행:

- 필요한 새 타입/스키마 정의 (`Zod`)
- 필요한 새 순수 함수 추가 (`indicators.ts` 또는 `patterns.ts`)
- 단위 테스트 작성
- 완료 후 다음 단계로

### 3단계: DataFeed Agent 위임 (새 WS 스트림이 필요할 때)

`packages/datafeed/CLAUDE.md`를 참고하여 다음을 수행:

- `packages/datafeed/src/sources/binance-xxx.ts` 생성
- `index.ts`에서 export
- 어댑터 함수 추가 (필요 시)
- Core 완료 후 실행 (병렬 가능: Frontend와)

### 4단계: Frontend Agent 위임

`apps/web/CLAUDE.md`를 참고하여 다음을 수행:

- 새 컴포넌트 구현 (`apps/web/src/components/[feature]/`)
- 필요한 훅 추가 (`apps/web/src/hooks/useXxx.ts`)
- Zustand 스토어 업데이트 (필요 시)
- Server Actions 추가 (DB 필요 시)
- 페이지 레이아웃 업데이트

### 5단계: Test Agent

완료 후 다음 테스트 실행:

```bash
pnpm typecheck    # 타입 에러 0개 확인
pnpm lint         # ESLint 경고 0개 확인
pnpm test         # 전체 단위 테스트 통과
pnpm build        # 프로덕션 빌드 성공
```

새로 추가된 Core 함수가 있다면 테스트 추가.
E2E가 필요한 UI 변경이라면: `cd apps/web && pnpm e2e`

### 6단계: 완료 보고

다음 형식으로 요약:

- 변경된 파일 목록 (패키지별)
- 새로 추가된 기능
- 알려진 제약사항
- 다음 작업 추천

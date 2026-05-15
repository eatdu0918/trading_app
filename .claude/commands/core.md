# /project:core — Core 도메인 작업

$ARGUMENTS

## Core Agent: 도메인 작업 프로토콜

`packages/core/CLAUDE.md`의 가이드라인을 따라 위 작업을 수행하세요.

### 작업 범위

**담당**: `packages/core/src/` 내 모든 파일

- 타입/스키마 정의 (Zod)
- 순수 계산 함수 (지표, 패턴)
- 단위 테스트

**금지**: React 컴포넌트, WebSocket 코드, Server Actions, DB 코드

### 실행 체크리스트

1. 변경 전 기존 테스트 확인: `pnpm test`
2. 변경 구현
3. 새 함수/타입에 대한 테스트 추가
4. `pnpm test` — 모든 테스트 통과 확인
5. `pnpm typecheck` — 타입 에러 0개 확인
6. `index.ts` export 업데이트 (필요 시)

### 완료 보고

변경된 파일과 새로 추가된 공개 API (타입, 함수 시그니처) 목록 제공.
DataFeed 또는 Frontend Agent가 업데이트해야 하는 부분이 있으면 명시.

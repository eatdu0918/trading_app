# /project:frontend — Frontend 컴포넌트 작업

$ARGUMENTS

## Frontend Agent: UI 작업 프로토콜

`apps/web/CLAUDE.md`의 가이드라인을 따라 위 작업을 수행하세요.

### 작업 범위

**담당**: `apps/web/src/` 내 모든 파일

- React 컴포넌트 (`components/`)
- Next.js 페이지/레이아웃 (`app/`)
- 커스텀 훅 (`hooks/`)
- Zustand 스토어 (`store/`)
- Server Actions (`server/actions/`)
- 유틸리티 (`lib/`)

**금지**: Core 도메인 로직 변경, DataFeed WebSocket 소스 변경

### 실행 체크리스트

1. 관련 기존 컴포넌트 검토
2. Tailwind v4 CSS 변수 사용 확인 (`var(--color-xxx)` 패턴)
3. 모바일/데스크톱 반응형 레이아웃 (`md:` 브레이크포인트)
4. WebSocket 훅 사용 시 cleanup 확인 (`return unsubscribe`)
5. TypeScript strict 모드 준수 (`noUncheckedIndexedAccess`)
6. `pnpm typecheck` — 타입 에러 0개
7. `pnpm lint` — ESLint 경고 0개

### UI 컨벤션

```tsx
// 색상: CSS 변수 직접 참조
className = 'bg-[var(--color-surface)] border-[var(--color-border)]';

// 반응형: mobile-first
className = 'block md:flex';

// 텍스트 크기: 일관성 유지
className = 'text-xs text-[var(--color-text-muted)]'; // 보조 정보
className = 'text-sm text-[var(--color-text-primary)]'; // 기본 텍스트
```

### 완료 보고

- 변경된 컴포넌트 목록
- 새로 추가된 컴포넌트 경로
- 모바일/데스크톱 동작 확인 여부

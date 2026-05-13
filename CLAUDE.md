# CLAUDE.md — Trading App

TradingView 스타일 실시간 암호화폐 트레이딩 플랫폼. Turborepo 모노레포, Next.js 15 App Router, Binance 공개 WebSocket API.

---

## 필수: 명령어는 루트에서 실행

```bash
# 모든 pnpm 명령은 반드시 루트(trading_app/)에서 실행
cd C:\aistudio\test\trading_app
pnpm dev          # 개발 서버 → http://localhost:3000
pnpm build        # 프로덕션 빌드
pnpm typecheck    # 전체 패키지 TypeScript 검사
pnpm lint         # ESLint
pnpm test         # Vitest 단위 테스트
```

**git worktree에서 작업 중일 때**: `node_modules`가 루트에만 있으므로 prettier, lint-staged 등은 루트에서 실행해야 합니다.

```bash
# worktree 파일에 prettier 적용 시
pnpm prettier --write ".claude/worktrees/<name>/path/to/file.tsx"
```

---

## 패키지 구조

```
trading_app/
├── apps/web/                    # Next.js 15 App Router (메인 앱)
├── packages/core/               # 도메인 타입 + 순수 계산 함수 (의존성 없음)
├── packages/datafeed/           # Binance WebSocket/REST 데이터 추상화
├── packages/ui/                 # 공유 유틸 (cn = twMerge + clsx)
└── packages/config/             # 공유 ESLint flat config, TS base config
```

**import 경로**: 앱 내부는 `@/...`, 패키지 간은 `@trading-app/core`, `@trading-app/datafeed`, `@trading-app/ui`.

---

## 핵심 기술 스택 주의사항

### Tailwind CSS v4

설정 파일(`tailwind.config.js`) 없음. 모든 테마 변수는 `apps/web/src/app/globals.css`의 `@theme` 블록에서 CSS 변수로 정의.

```css
/* 색상 사용 — Tailwind arbitrary value 대신 CSS 변수 직접 참조 */
className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"

/* 주요 색상 변수 */
--color-background       /* #0b0e11 — 페이지 배경 */
--color-surface          /* #11151c — 패널/카드 */
--color-surface-elevated /* #161b24 — 드롭다운, 호버 */
--color-border           /* #232a36 — 구분선 */
--color-accent           /* #3b82f6 — 강조색 */
--color-bullish          /* #22c55e — 매수/상승 */
--color-bearish          /* #ef4444 — 매도/하락 */
```

### TypeScript

`strict` + `noUncheckedIndexedAccess` 활성화. 배열 인덱스 접근 시 `undefined` 가드 필요.

### Lightweight Charts v4

- `Chart.tsx`에서 `createChart()` 인스턴스 관리
- `useEffect` cleanup에서 반드시 `chart.remove()` 호출
- ResizeObserver로 컨테이너 크기 감지

### Zustand v5

`apps/web/src/store/chart.ts` — 지표 설정(`IndicatorsConfig`)과 드로잉 모드(`DrawingMode`) 전역 상태 관리.

---

## 반응형 레이아웃 (M4 이후)

| 뷰포트         | 레이아웃                                         |
| -------------- | ------------------------------------------------ |
| `< md` (768px) | 하단 탭 네비게이션: 관심 / 차트 / 호가           |
| `≥ md`         | 3단 데스크톱: Sidebar + ChartGrid + TradingPanel |

**WebSocket 연결 유지**: 차트(`ChartGrid`)와 호가창(`TradingPanel`)은 모바일 탭 전환 시에도 항상 마운트 상태 유지. CSS `hidden`으로만 표시/숨김 처리.

모바일 레이아웃 관련 컴포넌트:

- `MobileNav.tsx` — 하단 탭 바 (`md:hidden`)
- `page.tsx` — `mobileTab` 상태로 패널 가시성 제어

---

## WebSocket 데이터 흐름

```
Binance REST → BinanceDatafeed.getHistory() → Chart.tsx (초기 캔들 로드)

Binance WS:
  <symbol>@kline_<tf>      → subscribeBars()      → candleSeries.update()
  <symbol>@depth20@100ms   → useOrderBook()        → OrderBook.tsx
  <symbol>@aggTrade        → useRecentTrades()     → RecentTrades.tsx
  <symbol>@miniTicker      → useTicker24h()        → PriceHeader.tsx
```

- `WsManager` (`packages/datafeed/src/ws-manager.ts`): 지수 백오프 재연결 (500ms → 30s)
- 심볼 변경 시 기존 구독 해제 후 새 심볼로 재구독

---

## Server Actions & DB

워치리스트만 서버/DB 사용. 나머지는 전부 클라이언트 사이드 WebSocket.

```
apps/web/src/server/actions/watchlist.ts  — get/add/remove Server Actions
apps/web/src/lib/db/schema.ts             — watchlist_items 테이블 (Drizzle)
apps/web/src/lib/db/client.ts             — Neon 지연 초기화
```

DB 스키마 변경 시: `cd apps/web && pnpm db:push`

---

## 새 기능 추가 패턴

### 새 지표 추가

1. `packages/core/src/indicators.ts` — 순수 계산 함수 추가
2. `apps/web/src/store/chart.ts` — `IndicatorsConfig`에 필드 추가
3. `apps/web/src/components/chart/Chart.tsx` — `applyIndicators()`에 렌더링 로직 추가
4. `apps/web/src/components/chart/IndicatorSelector.tsx` — UI 토글 추가

### 새 심볼 추가

`apps/web/src/lib/symbols.ts`의 `SYMBOL_PRESETS` 배열에 추가.

### 새 Binance WS 스트림 추가

1. `packages/datafeed/src/sources/` — 새 source 파일 생성 (`binance-xxx.ts` 패턴)
2. `apps/web/src/hooks/` — `useXxx.ts` 훅 생성
3. 컴포넌트에서 훅 사용

---

## 테스트

```bash
pnpm test           # Vitest 단위 테스트 (17개)
cd apps/web && pnpm e2e      # Playwright E2E (headless)
cd apps/web && pnpm e2e:ui   # Playwright UI 모드
```

단위 테스트 위치: `packages/core/src/*.test.ts`, `packages/datafeed/src/**/*.test.ts`

---

## 환경 변수 (apps/web/.env.local)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY   # Clerk 공개 키
CLERK_SECRET_KEY                    # Clerk 비밀 키
DATABASE_URL                        # Neon PostgreSQL 연결 문자열
```

Clerk/Neon 없이도 차트·호가창·지표·드로잉 기능은 완전히 작동. 워치리스트만 두 서비스 필요.

# Trading App

TradingView 스타일의 실시간 암호화폐 트레이딩 플랫폼입니다. Binance 공개 WebSocket API를 사용해 BTC/ETH/BNB/SOL/XRP 현물 데이터를 실시간으로 표시합니다.

---

## 주요 기능

| 기능                     | 설명                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| **실시간 캔들스틱 차트** | Binance `@kline` WS 스트림, 1m ~ 1w 타임프레임 7종                        |
| **멀티 차트 그리드**     | 1×1 / 1×2 / 2×2 분할 레이아웃, 패널별 독립 타임프레임                     |
| **기술 지표**            | SMA(5/20) · EMA(20) · BB(20,2) 오버레이, RSI(14) · MACD(12,26,9) 서브패널 |
| **드로잉 도구**          | 수평선 · 추세선 · 피보나치 레트레이스먼트 (클릭 드로잉), 전체 삭제        |
| **호가창 (Order Book)**  | Binance `@depth20@100ms` WS, 12레벨 매수/매도, 뎁스 바, 스프레드 표시     |
| **체결 내역**            | Binance `@aggTrade` WS, 최근 50건 실시간 피드, 매수/매도 색상 구분        |
| **24h 티커**             | Binance `@miniTicker` WS, 24시간 고가·저가·거래량 실시간 업데이트         |
| **워치리스트**           | Clerk 로그인 연동, Neon PostgreSQL 영속 저장, `useOptimistic` 낙관적 UI   |
| **심볼 전환**            | BTC/ETH/BNB/SOL/XRP 즉시 전환, 모든 패널 동기 업데이트                    |

---

## 기술 스택

### 프론트엔드

- **[Next.js 15](https://nextjs.org/)** — App Router, Turbopack, Server Actions
- **[React 19](https://react.dev/)** — `useOptimistic`, React Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** — strict + `noUncheckedIndexedAccess`
- **[Tailwind CSS v4](https://tailwindcss.com/)** — `@theme` CSS 변수 방식 (설정 파일 없음)
- **[Lightweight Charts v4](https://tradingview.github.io/lightweight-charts/)** — MIT 라이선스 차트 라이브러리
- **[Zustand v5](https://zustand-demo.pmnd.rs/)** — 차트 스토어 (지표 설정, 드로잉 모드)

### 백엔드 / 인프라

- **[Binance 공개 WebSocket API](https://binance-docs.github.io/apidocs/spot/en/)** — 인증 불필요, 스팟 현물
- **[Neon Serverless PostgreSQL](https://neon.tech/)** — 워치리스트 영속화
- **[Drizzle ORM](https://orm.drizzle.team/)** — 타입세이프 SQL, `drizzle-kit push`
- **[Clerk v7](https://clerk.com/)** — 소셜 로그인, `useAuth`, `UserButton`, `clerkMiddleware`

### 개발 인프라

- **[Turborepo](https://turbo.build/)** + **[pnpm workspaces](https://pnpm.io/workspaces)** — 모노레포
- **[Vitest v4](https://vitest.dev/)** — OXC 트랜스포머, 17개 단위 테스트
- **[Playwright](https://playwright.dev/)** — E2E 스모크 테스트 6개
- **[Husky v9](https://typicode.github.io/husky/) + lint-staged** — pre-commit Prettier 자동 포맷

---

## 프로젝트 구조

```
trading_app/
├── apps/
│   └── web/                         # Next.js 15 App Router
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css       # Tailwind v4 테마 변수 (다크 트레이딩 테마)
│       │   │   ├── layout.tsx        # ClerkProvider 루트 레이아웃
│       │   │   ├── page.tsx          # 메인 페이지 (symbol 상태 소유)
│       │   │   ├── sign-in/          # Clerk 로그인 페이지
│       │   │   └── sign-up/          # Clerk 회원가입 페이지
│       │   ├── components/
│       │   │   ├── chart/
│       │   │   │   ├── Chart.tsx          # LW Charts 인스턴스, 지표 오버레이, 드로잉
│       │   │   │   ├── ChartView.tsx      # 타임프레임 선택, 지표/드로잉 툴바, RSI/MACD 서브패널
│       │   │   │   ├── ChartGrid.tsx      # 1×1/1×2/2×2 그리드 레이아웃
│       │   │   │   ├── SubChart.tsx       # RSI / MACD 서브패널 (독립 LW 차트)
│       │   │   │   ├── PriceHeader.tsx    # 현재가 + OHLCV + 24h 통계
│       │   │   │   ├── TimeframeSelector.tsx
│       │   │   │   ├── SymbolSelector.tsx
│       │   │   │   ├── IndicatorSelector.tsx  # 지표 토글 드롭다운
│       │   │   │   └── DrawingToolbar.tsx     # 수평선/추세선/피보나치 도구
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx         # 브랜드, 심볼 전환, 로그인 버튼
│       │   │   │   └── Sidebar.tsx        # 접이식 왼쪽 사이드바
│       │   │   ├── trading/
│       │   │   │   ├── OrderBook.tsx      # 호가창 (12레벨 + 뎁스 바)
│       │   │   │   ├── RecentTrades.tsx   # 실시간 체결 내역
│       │   │   │   └── TradingPanel.tsx   # 접이식 오른쪽 패널 (호가창/체결 탭)
│       │   │   └── watchlist/
│       │   │       └── WatchlistPanel.tsx # 워치리스트 + useOptimistic
│       │   ├── hooks/
│       │   │   ├── useTicker24h.ts        # @miniTicker WS 구독
│       │   │   ├── useOrderBook.ts        # @depth20 WS 구독
│       │   │   └── useRecentTrades.ts     # @aggTrade WS 구독
│       │   ├── lib/
│       │   │   ├── db/
│       │   │   │   ├── client.ts          # Neon + Drizzle 지연 초기화
│       │   │   │   ├── schema.ts          # watchlist_items 테이블
│       │   │   │   └── index.ts
│       │   │   ├── symbols.ts             # SYMBOL_PRESETS (5종)
│       │   │   └── format.ts              # formatPrice / formatVolume / formatSignedPercent
│       │   ├── server/
│       │   │   └── actions/
│       │   │       └── watchlist.ts       # Server Actions: get/add/remove
│       │   └── store/
│       │       └── chart.ts               # Zustand: IndicatorsConfig + DrawingMode
│       ├── e2e/
│       │   └── chart.spec.ts              # Playwright E2E 스모크 테스트
│       └── drizzle.config.ts
├── packages/
│   ├── core/                        # 도메인 타입 + 순수 계산 함수 (의존성 없음)
│   │   └── src/
│   │       ├── symbol.ts            # TradingSymbol Zod 스키마, ExchangeId, AssetKind
│   │       ├── timeframe.ts         # Timeframe 타입, timeframeToMs, alignToTimeframe
│   │       ├── ohlcv.ts             # Candle, Tick Zod 스키마
│   │       ├── indicators.ts        # SMA, EMA, BB, RSI, MACD 순수 함수
│   │       ├── orderbook.ts         # OrderBook, OrderBookLevel 타입
│   │       ├── trade.ts             # RecentTrade 타입
│   │       └── ticker.ts            # Ticker24h 타입
│   ├── datafeed/                    # 차트 라이브러리 독립 데이터 추상화
│   │   └── src/
│   │       ├── types.ts             # Datafeed 인터페이스 (getHistory + subscribeBars)
│   │       ├── ws-manager.ts        # 지수 백오프 WebSocket 재연결 (500ms → 30s)
│   │       ├── sources/
│   │       │   ├── binance.ts            # BinanceDatafeed — 히스토리 + 실시간 바
│   │       │   ├── binance-orderbook.ts  # @depth20@100ms 구독
│   │       │   ├── binance-trades.ts     # @aggTrade 구독
│   │       │   └── binance-ticker.ts     # @miniTicker 구독
│   │       └── adapters/
│   │           └── lightweight.ts        # Candle → LW Charts 포맷 변환
│   ├── ui/                          # 공유 UI 유틸 (cn = twMerge + clsx)
│   └── config/                      # 공유 ESLint flat config, TypeScript base config
├── vitest.config.ts                 # Vitest — OXC 트랜스포머, 패키지 경로 alias
├── tsconfig.json                    # Vitest용 루트 tsconfig
├── turbo.json                       # Turborepo 파이프라인 (build/dev/lint/typecheck)
└── pnpm-workspace.yaml
```

### 데이터 흐름

```
Binance REST API (/api/v3/klines)
    └─► BinanceDatafeed.getHistory()
            └─► Chart.tsx — candleSeries.setData() + applyIndicators()
                    └─► onBarsLoad() ──► ChartView ──► SubChart (RSI/MACD)

Binance WebSocket
    ├─ <symbol>@kline_<tf>      ──► subscribeBars()      ──► candleSeries.update()
    ├─ <symbol>@depth20@100ms   ──► subscribeOrderBook() ──► useOrderBook() ──► OrderBook
    ├─ <symbol>@aggTrade        ──► subscribeTrades()    ──► useRecentTrades() ──► RecentTrades
    └─ <symbol>@miniTicker      ──► subscribeTicker24h() ──► useTicker24h() ──► PriceHeader
```

---

## 시작하기

### 요구사항

- **Node.js** 20 이상
- **pnpm** 9 이상

### 설치

```bash
git clone https://github.com/eatdu0918/trading_app.git
cd trading_app
pnpm install
```

### 환경 변수 설정

```bash
cp .env.local.example apps/web/.env.local
```

`apps/web/.env.local` 파일을 편집합니다:

```env
# Clerk 인증 (https://dashboard.clerk.com 에서 발급)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon PostgreSQL (https://neon.tech 에서 발급)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

> **참고**: Clerk와 Neon이 없어도 차트·호가창·체결 내역·기술 지표·드로잉 도구는 모두 작동합니다. 워치리스트 영속화 기능만 두 서비스가 필요합니다.

### DB 스키마 적용 (워치리스트 사용 시)

```bash
cd apps/web
pnpm db:push      # Drizzle로 watchlist_items 테이블 생성
pnpm db:studio    # Drizzle Studio (웹 GUI)
```

### 개발 서버 실행

```bash
# 루트에서
pnpm dev          # → http://localhost:3000
```

---

## 스크립트 레퍼런스

루트에서 실행:

| 명령             | 설명                               |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | 전체 개발 서버 (Next.js Turbopack) |
| `pnpm build`     | 프로덕션 빌드                      |
| `pnpm typecheck` | 전체 패키지 TypeScript 검사        |
| `pnpm lint`      | ESLint (flat config)               |
| `pnpm test`      | Vitest 단위 테스트                 |

`apps/web` 내에서 실행:

| 명령             | 설명                         |
| ---------------- | ---------------------------- |
| `pnpm db:push`   | Drizzle → Neon 스키마 동기화 |
| `pnpm db:studio` | Drizzle Studio               |
| `pnpm e2e`       | Playwright E2E (headless)    |
| `pnpm e2e:ui`    | Playwright UI 모드           |

---

## 테스트

### 단위 테스트

```bash
pnpm vitest run
# 3개 파일, 17개 테스트 통과
```

| 파일                                                 | 테스트 내용                   |
| ---------------------------------------------------- | ----------------------------- |
| `packages/core/src/timeframe.test.ts`                | 타임프레임 ms 변환, 정렬 로직 |
| `packages/core/src/ohlcv.test.ts`                    | Candle/Tick Zod 스키마 검증   |
| `packages/datafeed/src/adapters/lightweight.test.ts` | LW Charts 어댑터 변환         |

### E2E 테스트

```bash
cd apps/web && pnpm e2e
```

Playwright가 개발 서버를 자동 시작한 뒤 6개 스모크 테스트를 실행합니다:

- 헤더 렌더링 확인
- 심볼 전환 동작
- 타임프레임 전환
- 그리드 레이아웃 전환 (1×1/1×2/2×2)
- 사이드바 열기/닫기

---

## 마일스톤별 커밋 히스토리

| 커밋      | 마일스톤                             | 주요 변경 사항                                                                                                                                 |
| --------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `b95458d` | **M0 — 모노레포 부트스트랩**         | Turborepo + pnpm workspaces 초기 셋업. packages/core·datafeed·ui·config, Next.js 15 + Tailwind v4 + TypeScript strict 설정                     |
| `f77367f` | **M1-초기 — BTC/USDT 차트**          | BinanceDatafeed (REST 히스토리 + WS 실시간 바), Lightweight Charts 캔들스틱 + 볼륨, WsManager 재연결                                           |
| `38ceb8c` | **M1-완성 — 멀티심볼**               | 5종 심볼(BTC/ETH/BNB/SOL/XRP), WS 지수 백오프 재연결, 로딩/에러 상태                                                                           |
| `5930456` | **M2 — 인증·워치리스트·레이아웃**    | Clerk v7 인증, Neon + Drizzle 워치리스트 DB, 접이식 사이드바, 1×1/1×2/2×2 멀티 차트 그리드, Vitest 17 테스트, Playwright E2E, Husky pre-commit |
| `a649211` | **M3 — 트레이딩 데이터·지표·드로잉** | 호가창(depth20) + 체결 내역(aggTrade) + 24h 티커(miniTicker), SMA/EMA/BB 오버레이, RSI/MACD 서브패널, 수평선/추세선/피보나치 드로잉            |

---

## 환경 변수 레퍼런스

| 변수                                | 필수 여부          | 설명                        |
| ----------------------------------- | ------------------ | --------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | 워치리스트 사용 시 | Clerk 공개 키               |
| `CLERK_SECRET_KEY`                  | 워치리스트 사용 시 | Clerk 비밀 키               |
| `DATABASE_URL`                      | 워치리스트 사용 시 | Neon PostgreSQL 연결 문자열 |

---

## 향후 계획

- [ ] TradingView Charting Library 교체 (현재 Lightweight Charts — `adapters/` 파일 하나만 추가하면 교체 가능)
- [ ] 가격 알림 (목표가 도달 시 브라우저 Push 알림)
- [ ] 캔들스틱 패턴 인식 (Doji, Hammer, Engulfing)
- [ ] 포트폴리오 트래커 (보유 수량 입력 → 실시간 손익 계산)
- [ ] 다크/라이트 테마 토글
- [ ] PWA + 서비스 워커 (히스토리 캐시)
- [ ] 모바일 레이아웃 최적화

---

## 라이선스

MIT

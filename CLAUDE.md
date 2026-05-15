# CLAUDE.md — Trading App Orchestrator

TradingView 스타일 실시간 암호화폐 트레이딩 플랫폼. Turborepo 모노레포, Next.js 15 App Router, Binance 공개 WebSocket API.

---

## Claude 팀 구성 (Multi-Agent Orchestration)

이 프로젝트는 전문화된 Claude 에이전트 팀으로 운영됩니다. **메인 오케스트레이터**(루트 컨텍스트)가 기능 요청을 분해하여 각 전문 에이전트에 위임합니다.

### 에이전트 로스터

| 에이전트           | 디렉터리             | 전문 영역                              |
| ------------------ | -------------------- | -------------------------------------- |
| **Orchestrator**   | `/` (루트)           | 기능 분해, 작업 조율, 통합, PR 관리    |
| **Core Agent**     | `packages/core/`     | 도메인 타입, 지표 계산, 캔들 패턴      |
| **DataFeed Agent** | `packages/datafeed/` | Binance WS/REST 소스, 어댑터           |
| **Frontend Agent** | `apps/web/`          | React 컴포넌트, Next.js 페이지, 스토어 |
| **Test Agent**     | 전체 (테스트 파일)   | Vitest 단위 테스트, Playwright E2E     |
| **QA Agent**       | 전체 (검토)          | 타입 검사, ESLint, 코드 리뷰           |

---

## 오케스트레이터 프로토콜

### 기능 요청 처리 흐름

```
사용자 요청
    │
    ▼
Orchestrator: 기능 분석 & 영향 범위 파악
    │
    ├─► Core Agent (격리된 worktree)
    │       └─ 도메인 타입/함수 변경
    │
    ├─► DataFeed Agent (격리된 worktree)
    │       └─ 새 WS 스트림/REST 엔드포인트
    │
    ├─► Frontend Agent (격리된 worktree)
    │       └─ 컴포넌트/훅/스토어 구현
    │
    ├─► Test Agent
    │       └─ 단위 테스트 + E2E 작성
    │
    └─► QA Agent
            └─ typecheck + lint + review
```

### 에이전트 위임 규칙

1. **Core가 먼저**: 타입/도메인 변경이 있으면 Core Agent 먼저 완료 후 나머지 진행
2. **DataFeed는 독립**: Core 완료 후 Frontend와 병렬 진행 가능
3. **Test는 마지막**: 구현 완료 후 Test Agent 실행
4. **QA는 항상**: 모든 변경 후 반드시 실행

### 작업 위임 시 필수 컨텍스트

에이전트 위임 시 다음을 명시:

- 변경할 파일 경로 (정확한 경로)
- 의존하는 타입/인터페이스
- 완료 기준 (Done criteria)
- 건드리지 말아야 할 영역

---

## 필수: 명령어는 루트에서 실행

```bash
# 모든 pnpm 명령은 반드시 루트(trading_app/)에서 실행
pnpm dev          # 개발 서버 → http://localhost:3000
pnpm build        # 프로덕션 빌드
pnpm typecheck    # 전체 패키지 TypeScript 검사
pnpm lint         # ESLint
pnpm test         # Vitest 단위 테스트
pnpm format       # Prettier 포맷팅
```

---

## 패키지 구조

```
trading_app/
├── apps/web/                    # Next.js 15 App Router (메인 앱)
│   └── CLAUDE.md               # → Frontend Agent 컨텍스트
├── packages/core/               # 도메인 타입 + 순수 계산 함수
│   └── CLAUDE.md               # → Core Agent 컨텍스트
├── packages/datafeed/           # Binance WebSocket/REST 데이터 추상화
│   └── CLAUDE.md               # → DataFeed Agent 컨텍스트
├── packages/ui/                 # 공유 유틸 (cn = twMerge + clsx)
└── packages/config/             # 공유 ESLint flat config, TS base config
```

**import 경로**: 앱 내부는 `@/...`, 패키지 간은 `@trading-app/core`, `@trading-app/datafeed`, `@trading-app/ui`.

---

## 마일스톤 이력

| 마일스톤 | 주요 기능                                                         |
| -------- | ----------------------------------------------------------------- |
| M0       | Turborepo 스캐폴드, Next.js 15 설정                               |
| M1       | BTC/USDT 라이브 차트, 멀티 심볼, WS 재연결                        |
| M2       | Clerk 인증, Neon 워치리스트, 사이드바, 멀티차트 그리드            |
| M3       | 호가창, 최근 체결, 기술 지표 (SMA/EMA/BB/RSI/MACD), 드로잉 도구   |
| M4       | 테마 토글, 모바일 레이아웃, 캔들 패턴, 가격 알림, 포트폴리오, PWA |

---

## 핵심 기술 스택 주의사항

### Tailwind CSS v4

설정 파일(`tailwind.config.js`) 없음. 모든 테마 변수는 `apps/web/src/app/globals.css`의 `@theme` 블록에서 CSS 변수로 정의.

```css
/* 색상 사용 — Tailwind arbitrary value 대신 CSS 변수 직접 참조 */
className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
```

### TypeScript

`strict` + `noUncheckedIndexedAccess` 활성화. 배열 인덱스 접근 시 `undefined` 가드 필요.

### Lightweight Charts v4

- `Chart.tsx`에서 `createChart()` 인스턴스 관리
- `useEffect` cleanup에서 반드시 `chart.remove()` 호출

---

## 반응형 레이아웃

| 뷰포트         | 레이아웃                                         |
| -------------- | ------------------------------------------------ |
| `< md` (768px) | 하단 탭 네비게이션                               |
| `≥ md`         | 3단 데스크톱: Sidebar + ChartGrid + TradingPanel |

WebSocket 연결 유지: 차트/호가창은 탭 전환 시에도 항상 마운트. CSS `hidden`으로만 표시/숨김.

---

## WebSocket 데이터 흐름

```
Binance REST → BinanceDatafeed.getHistory() → Chart.tsx (초기 캔들)

Binance WS:
  <symbol>@kline_<tf>      → subscribeBars()   → candleSeries.update()
  <symbol>@depth20@100ms   → useOrderBook()    → OrderBook.tsx
  <symbol>@aggTrade        → useRecentTrades() → RecentTrades.tsx
  <symbol>@miniTicker      → useTicker24h()    → PriceHeader.tsx
```

---

## 품질 게이트 (모든 PR 전 필수)

```bash
pnpm typecheck   # 0 errors
pnpm lint        # 0 warnings
pnpm test        # all pass
pnpm build       # successful
```

E2E는 기능 변경 시에만: `cd apps/web && pnpm e2e`

---

## 커스텀 슬래시 명령어

| 명령어              | 설명                                                    |
| ------------------- | ------------------------------------------------------- |
| `/project:feature`  | 전체 기능 개발 워크플로우 (Core→DataFeed→Frontend→Test) |
| `/project:core`     | Core 도메인 작업 위임                                   |
| `/project:datafeed` | DataFeed 작업 위임                                      |
| `/project:frontend` | Frontend 컴포넌트 작업 위임                             |
| `/project:test`     | 전체 테스트 실행 및 리포트                              |
| `/project:qa`       | 품질 검사 (typecheck + lint + review)                   |
| `/project:sprint`   | 스프린트 계획 및 작업 분배                              |

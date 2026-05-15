# CLAUDE.md — Frontend Agent

`apps/web`는 Next.js 15 App Router 기반 트레이딩 UI를 담당합니다.

---

## Frontend Agent 역할

- React 컴포넌트 구현 (chart, trading, layout, watchlist)
- Next.js 페이지, 레이아웃, Server Actions
- Zustand 스토어 상태 관리
- 모바일 반응형 UI
- PWA 설정

**건드리지 않는 것**: Core 도메인 로직, DataFeed WebSocket 소스, DB 스키마

---

## 파일 구조

```
apps/web/src/
├── app/
│   ├── page.tsx              # 메인 트레이딩 대시보드
│   ├── layout.tsx            # 루트 레이아웃 (ClerkProvider, ThemeProvider)
│   └── globals.css           # Tailwind v4 테마 변수
├── components/
│   ├── chart/               # 차트 시스템 (10 컴포넌트)
│   ├── layout/              # 헤더, 사이드바, 모바일 네비게이션
│   ├── trading/             # 호가창, 체결 내역, 트레이딩 패널
│   ├── watchlist/           # 관심 목록 패널
│   ├── alerts/              # 가격 알림 패널
│   └── portfolio/           # 포트폴리오 패널
├── hooks/                   # WebSocket 커스텀 훅
├── store/                   # Zustand 스토어
├── server/actions/          # Next.js Server Actions
└── lib/                     # 유틸, DB 클라이언트, 심볼 프리셋
```

---

## Tailwind CSS v4 패턴

**중요**: `tailwind.config.js` 없음. 테마는 `globals.css`의 `@theme` 블록에서 CSS 변수로 정의.

```tsx
// 색상 — CSS 변수 직접 참조 (arbitrary value 사용)
<div className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">

// 주요 색상 변수
--color-background       // #0b0e11 — 페이지 배경
--color-surface          // #11151c — 패널/카드
--color-surface-elevated // #161b24 — 드롭다운, 호버
--color-border           // #232a36 — 구분선
--color-accent           // #3b82f6 — 강조색
--color-bullish          // #22c55e — 매수/상승
--color-bearish          // #ef4444 — 매도/하락
--color-text-primary     // 기본 텍스트
--color-text-secondary   // 보조 텍스트
--color-text-muted       // 비활성 텍스트
```

다크/라이트 모드: `ThemeProvider`가 `html` 요소에 `class="dark"` 또는 `class="light"` 적용.

---

## 컴포넌트 패턴

### 클라이언트 컴포넌트

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Props {
  symbol: string;
}

export function MyComponent({ symbol }: Props) {
  // ...
}
```

### Zustand 스토어 사용

```typescript
// store/chart.ts 패턴
import { create } from 'zustand';

interface ChartStore {
  indicators: IndicatorsConfig;
  setIndicators: (config: IndicatorsConfig) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  indicators: defaultConfig,
  setIndicators: (config) => set({ indicators: config }),
}));
```

### WebSocket 훅 패턴

```typescript
// hooks/useMyStream.ts
export function useMyStream(symbol: string) {
  const [data, setData] = useState<MyData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeBinanceXxx(symbol, setData);
    return unsubscribe; // cleanup 필수
  }, [symbol]);

  return data;
}
```

---

## 반응형 레이아웃

| 뷰포트         | 레이아웃                                |
| -------------- | --------------------------------------- |
| `< md` (768px) | 하단 탭 네비게이션 (`MobileNav.tsx`)    |
| `≥ md`         | 3단: Sidebar + ChartGrid + TradingPanel |

**WS 연결 유지**: `ChartGrid`와 `TradingPanel`은 탭 전환 시 `hidden` 클래스로만 숨김. unmount 금지.

```tsx
// page.tsx 패턴
<ChartGrid className={mobileTab !== 'chart' ? 'hidden md:block' : ''} />
<TradingPanel className={mobileTab !== 'orderbook' ? 'hidden md:block' : ''} />
```

---

## Server Actions 패턴

```typescript
// server/actions/watchlist.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';

export async function addToWatchlist(symbol: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.insert(watchlistItems).values({ userId, symbol });
}
```

---

## 새 기능 추가 패턴

### 새 지표 추가

1. `store/chart.ts` — `IndicatorsConfig`에 필드 추가
2. `components/chart/Chart.tsx` — `applyIndicators()`에 렌더링 로직
3. `components/chart/IndicatorSelector.tsx` — UI 토글 추가

### 새 패널 추가 (사이드바)

1. `components/[feature]/[Feature]Panel.tsx` — 패널 컴포넌트
2. `components/layout/Sidebar.tsx` — 탭 추가
3. `components/trading/TradingPanel.tsx` — 탭 콘텐츠 추가

### 새 WebSocket 훅

1. `hooks/useXxx.ts` — DataFeed Agent의 subscribe 함수 사용
2. 컴포넌트에서 훅 임포트

---

## 환경 변수

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY   # Clerk 공개 키
CLERK_SECRET_KEY                    # Clerk 비밀 키
DATABASE_URL                        # Neon PostgreSQL 연결 문자열
```

Clerk/Neon 없어도 차트·호가창·지표·드로잉은 완전 작동. 워치리스트만 두 서비스 필요.

---

## 심볼 프리셋

`lib/symbols.ts`의 `SYMBOL_PRESETS` — 현재 BTC, ETH, BNB, SOL, XRP. 새 심볼 추가 시 여기에만 추가.

---

## Lightweight Charts v4

- `Chart.tsx`에서 `createChart()` 인스턴스 관리
- `useEffect` cleanup에서 반드시 `chart.remove()` 호출
- `ResizeObserver`로 컨테이너 크기 감지
- SSR 비호환: `dynamic(() => import('./Chart'), { ssr: false })` 패턴 사용

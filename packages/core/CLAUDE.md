# CLAUDE.md — Core Agent

`packages/core`는 도메인 모델과 순수 계산 함수를 담당합니다. **외부 의존성 없음** (Zod 제외).

---

## Core Agent 역할

- 도메인 타입/스키마 정의 (Zod)
- 순수 계산 함수 (지표, 패턴, 시간프레임)
- 단위 테스트 작성 (`*.test.ts`)

**건드리지 않는 것**: UI 컴포넌트, WebSocket 코드, Server Actions, DB 스키마

---

## 파일 소유권

```
packages/core/src/
├── symbol.ts        # TradingSymbol, ExchangeId
├── timeframe.ts     # Timeframe 타입, timeframeToMs(), alignToTimeframe()
├── ohlcv.ts         # Candle, Tick Zod 스키마
├── indicators.ts    # SMA, EMA, BB, RSI, MACD 순수 함수
├── patterns.ts      # 캔들스틱 패턴 감지 (M4)
├── orderbook.ts     # OrderBook, OrderBookLevel 타입
├── trade.ts         # RecentTrade 타입
├── ticker.ts        # Ticker24h 타입
├── index.ts         # 전체 public export
└── *.test.ts        # Vitest 단위 테스트
```

---

## 코딩 원칙

### 순수 함수 우선

```typescript
// 올바른 패턴: 순수 함수, 사이드 이펙트 없음
export function calculateSMA(values: number[], period: number): number[] {
  // ...
}

// 금지: 외부 상태 변경, I/O, Math.random()
```

### Zod 스키마 패턴

```typescript
import { z } from 'zod';

export const CandleSchema = z.object({
  time: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type Candle = z.infer<typeof CandleSchema>;
```

### noUncheckedIndexedAccess 대응

```typescript
// 배열 인덱스 접근 시 항상 undefined 가드
const value = arr[i];
if (value === undefined) return;

// 또는 옵셔널 체이닝
const value = arr[i]?.someProperty;
```

---

## 테스트 패턴

```typescript
// packages/core/src/indicators.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSMA } from './indicators';

describe('calculateSMA', () => {
  it('returns correct SMA for known values', () => {
    const result = calculateSMA([1, 2, 3, 4, 5], 3);
    expect(result).toEqual([2, 3, 4]);
  });

  it('returns empty array when insufficient data', () => {
    expect(calculateSMA([1, 2], 3)).toEqual([]);
  });
});
```

테스트 실행: `pnpm test` (루트에서)

---

## 새 지표 추가 패턴

1. `indicators.ts`에 순수 함수 추가
2. `index.ts`에서 export 추가
3. `indicators.test.ts`에 테스트 추가
4. Frontend Agent에 알림: 사용 가능한 함수 시그니처 전달

## 새 캔들 패턴 추가 패턴

1. `patterns.ts`에 감지 함수 추가 (입력: `Candle[]`, 출력: `PatternResult[]`)
2. `index.ts`에서 export
3. 패턴 테스트 추가

---

## 의존하는 패키지들

Core의 타입을 사용하는 패키지:

- `packages/datafeed` — `Candle`, `Tick`, `OrderBook`, `RecentTrade`, `Ticker24h`
- `apps/web` — 모든 Core 타입

Core 타입을 변경하면 반드시 오케스트레이터에게 알려 DataFeed/Frontend Agent 업데이트 조율.

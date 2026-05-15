# CLAUDE.md — DataFeed Agent

`packages/datafeed`는 Binance WebSocket/REST API 통합을 담당합니다.

---

## DataFeed Agent 역할

- Binance 공개 API (인증 불필요) 소스 구현
- WebSocket 연결 관리 및 재연결 로직
- Lightweight Charts 어댑터
- DataFeed 인터페이스 정의

**건드리지 않는 것**: React 컴포넌트, Server Actions, DB 스키마, Core 도메인 타입

---

## 파일 소유권

```
packages/datafeed/src/
├── types.ts                     # Datafeed 인터페이스 (getHistory, subscribeBars)
├── ws-manager.ts                # WS 관리, 지수 백오프 재연결 (500ms→30s)
├── sources/
│   ├── binance.ts               # 메인 BinanceDatafeed (히스토리 + 라이브 바)
│   ├── binance-orderbook.ts     # @depth20@100ms 구독
│   ├── binance-trades.ts        # @aggTrade 구독
│   └── binance-ticker.ts        # @miniTicker 구독
├── adapters/
│   └── lightweight.ts           # Candle → Lightweight Charts 포맷 변환
└── index.ts                     # public exports
```

---

## Binance WebSocket 패턴

### 새 스트림 소스 추가

```typescript
// packages/datafeed/src/sources/binance-xxx.ts
import { WsManager } from '../ws-manager';

const WS_BASE = 'wss://stream.binance.com:9443/ws';

export function subscribeBinanceXxx(
  symbol: string,
  onData: (data: XxxData) => void,
  onError?: (err: Error) => void,
): () => void {
  const streamName = `${symbol.toLowerCase()}@xxx`;
  const ws = new WsManager(`${WS_BASE}/${streamName}`);

  ws.onMessage((raw: string) => {
    const parsed = JSON.parse(raw) as RawBinanceXxx;
    onData(transform(parsed));
  });

  ws.connect();
  return () => ws.close();
}
```

### WsManager 사용법

```typescript
const manager = new WsManager(url);
manager.onMessage((data: string) => {
  /* 처리 */
});
manager.onError((err: Error) => {
  /* 에러 처리 */
});
manager.connect(); // 연결 + 자동 재연결
manager.close(); // 구독 해제 시 반드시 호출
```

---

## Binance REST API 패턴

```typescript
const BASE = 'https://api.binance.com/api/v3';

// 캔들 히스토리
const response = await fetch(`${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
const data = (await response.json()) as BinanceKline[];
```

---

## 어댑터 패턴

```typescript
// Binance raw → Core 타입으로 변환
export function adaptBinanceKline(raw: BinanceKline): Candle {
  return {
    time: raw[0] / 1000, // ms → s
    open: Number(raw[1]),
    high: Number(raw[2]),
    low: Number(raw[3]),
    close: Number(raw[4]),
    volume: Number(raw[5]),
  };
}
```

---

## 테스트 패턴

```typescript
// packages/datafeed/src/adapters/lightweight.test.ts 참고
import { describe, it, expect } from 'vitest';
import { adaptBinanceKline } from './lightweight';

describe('adaptBinanceKline', () => {
  it('converts raw Binance kline to Candle', () => {
    const raw = ['1700000000000', '42000', '43000', '41000', '42500', '100'];
    const result = adaptBinanceKline(raw as BinanceKline);
    expect(result.time).toBe(1700000000); // ms → s
    expect(result.open).toBe(42000);
  });
});
```

---

## 스트림 URL 레퍼런스

```
wss://stream.binance.com:9443/ws/
  {symbol}@kline_{interval}     # 캔들 스트림
  {symbol}@depth20@100ms        # 20레벨 호가창
  {symbol}@aggTrade             # 체결 스트림
  {symbol}@miniTicker           # 24h 통계
  {symbol}@ticker               # 전체 24h 통계 (상세)
  {symbol}@bookTicker           # 최우선 매수/매도 호가
```

---

## 의존 관계

- **사용**: `@trading-app/core` (Candle, OrderBook, RecentTrade, Ticker24h 타입)
- **사용됨**: `apps/web` hooks (`useOrderBook`, `useRecentTrades`, `useTicker24h`)

Core 타입이 변경되면 어댑터 함수 업데이트 필요.

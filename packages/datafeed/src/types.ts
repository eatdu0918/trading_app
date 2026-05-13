import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';

export interface HistoryRequest {
  symbol: TradingSymbol;
  timeframe: Timeframe;
  /** UTC ms, inclusive. */
  from: number;
  /** UTC ms, exclusive. */
  to: number;
  /** Optional upper bound on bars returned. */
  limit?: number;
}

export interface SubscribeOptions {
  symbol: TradingSymbol;
  timeframe: Timeframe;
  onBar: (bar: Candle) => void;
  onError?: (err: Error) => void;
}

export type Unsubscribe = () => void;

/**
 * Library-agnostic datafeed contract. Both Lightweight Charts and the future
 * TradingView Charting Library adapter consume this same interface.
 */
export interface Datafeed {
  getHistory(req: HistoryRequest): Promise<Candle[]>;
  subscribeBars(options: SubscribeOptions): Unsubscribe;
}

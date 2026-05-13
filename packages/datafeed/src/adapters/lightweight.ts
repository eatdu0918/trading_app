import type { Candle } from '@trading-app/core';

/**
 * Lightweight Charts expects either UTC seconds (UTCTimestamp) or a date string for
 * candlestick series. We feed UTC seconds to keep things numeric and lossless.
 */
export interface LightweightCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LightweightHistogramPoint {
  time: number;
  value: number;
  color?: string;
}

export function toLightweightCandle(bar: Candle): LightweightCandle {
  return {
    time: Math.floor(bar.time / 1000),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  };
}

export function toLightweightVolume(bar: Candle, upColor: string, downColor: string): LightweightHistogramPoint {
  return {
    time: Math.floor(bar.time / 1000),
    value: bar.volume,
    color: bar.close >= bar.open ? upColor : downColor,
  };
}

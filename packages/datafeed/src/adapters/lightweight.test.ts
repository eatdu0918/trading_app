import { describe, expect, it } from 'vitest';
import type { Candle } from '@trading-app/core';
import { toLightweightCandle, toLightweightVolume } from './lightweight';

const bar: Candle = {
  time: 1_700_000_000_000,
  open: 40_000,
  high: 41_000,
  low: 39_500,
  close: 40_500,
  volume: 12.5,
};

describe('toLightweightCandle', () => {
  it('converts ms to seconds', () => {
    const lw = toLightweightCandle(bar);
    expect(lw.time).toBe(1_700_000_000);
  });

  it('preserves OHLC values', () => {
    const lw = toLightweightCandle(bar);
    expect(lw.open).toBe(bar.open);
    expect(lw.high).toBe(bar.high);
    expect(lw.low).toBe(bar.low);
    expect(lw.close).toBe(bar.close);
  });
});

describe('toLightweightVolume', () => {
  it('assigns up color for bullish bar', () => {
    const lw = toLightweightVolume(bar, 'green', 'red');
    expect(lw.color).toBe('green');
    expect(lw.value).toBe(bar.volume);
  });

  it('assigns down color for bearish bar', () => {
    const bearish: Candle = { ...bar, close: bar.open - 1 };
    const lw = toLightweightVolume(bearish, 'green', 'red');
    expect(lw.color).toBe('red');
  });

  it('treats doji (open === close) as bullish', () => {
    const doji: Candle = { ...bar, close: bar.open };
    const lw = toLightweightVolume(doji, 'green', 'red');
    expect(lw.color).toBe('green');
  });
});

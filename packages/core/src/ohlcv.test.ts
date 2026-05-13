import { describe, expect, it } from 'vitest';
import { CandleSchema, TickSchema } from './ohlcv';

describe('CandleSchema', () => {
  const valid = {
    time: 1_700_000_000_000,
    open: 40000,
    high: 41000,
    low: 39500,
    close: 40500,
    volume: 12.5,
  };

  it('accepts a valid candle', () => {
    expect(() => CandleSchema.parse(valid)).not.toThrow();
  });

  it('rejects negative time', () => {
    expect(() => CandleSchema.parse({ ...valid, time: -1 })).toThrow();
  });

  it('rejects non-finite price', () => {
    expect(() => CandleSchema.parse({ ...valid, close: Infinity })).toThrow();
  });

  it('rejects negative volume', () => {
    expect(() => CandleSchema.parse({ ...valid, volume: -5 })).toThrow();
  });
});

describe('TickSchema', () => {
  it('accepts tick with optional side', () => {
    expect(() =>
      TickSchema.parse({ time: 1_700_000_000_000, price: 40000, size: 0.01, side: 'buy' }),
    ).not.toThrow();
    expect(() =>
      TickSchema.parse({ time: 1_700_000_000_000, price: 40000, size: 0.01 }),
    ).not.toThrow();
  });

  it('rejects invalid side', () => {
    expect(() =>
      TickSchema.parse({ time: 1_700_000_000_000, price: 40000, size: 0.01, side: 'long' }),
    ).toThrow();
  });
});

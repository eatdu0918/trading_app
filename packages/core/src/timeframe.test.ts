import { describe, expect, it } from 'vitest';
import { TimeframeSchema, alignToTimeframe, timeframeToMs } from './timeframe';

describe('TimeframeSchema', () => {
  it('accepts valid timeframes', () => {
    expect(() => TimeframeSchema.parse('1m')).not.toThrow();
    expect(() => TimeframeSchema.parse('1d')).not.toThrow();
    expect(() => TimeframeSchema.parse('1M')).not.toThrow();
  });

  it('rejects invalid timeframes', () => {
    expect(() => TimeframeSchema.parse('2m')).toThrow();
    expect(() => TimeframeSchema.parse('')).toThrow();
  });
});

describe('timeframeToMs', () => {
  it('returns correct milliseconds', () => {
    expect(timeframeToMs('1m')).toBe(60_000);
    expect(timeframeToMs('1h')).toBe(3_600_000);
    expect(timeframeToMs('1d')).toBe(86_400_000);
  });
});

describe('alignToTimeframe', () => {
  it('aligns a timestamp to the start of the bar', () => {
    const ts = new Date('2024-01-15T10:37:45Z').getTime();
    const aligned = alignToTimeframe(ts, '1m');
    expect(aligned).toBe(new Date('2024-01-15T10:37:00Z').getTime());
  });

  it('aligns to 1h boundary', () => {
    const ts = new Date('2024-01-15T10:37:45Z').getTime();
    const aligned = alignToTimeframe(ts, '1h');
    expect(aligned).toBe(new Date('2024-01-15T10:00:00Z').getTime());
  });

  it('returns the same value for an already-aligned timestamp', () => {
    const ts = new Date('2024-01-15T10:00:00Z').getTime();
    expect(alignToTimeframe(ts, '1h')).toBe(ts);
  });
});

import { z } from 'zod';

export const TIMEFRAMES = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '1M',
] as const;

export type Timeframe = (typeof TIMEFRAMES)[number];

export const TimeframeSchema = z.enum(TIMEFRAMES);

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

const TIMEFRAME_MS: Record<Timeframe, number> = {
  '1m': MINUTE_MS,
  '3m': 3 * MINUTE_MS,
  '5m': 5 * MINUTE_MS,
  '15m': 15 * MINUTE_MS,
  '30m': 30 * MINUTE_MS,
  '1h': HOUR_MS,
  '2h': 2 * HOUR_MS,
  '4h': 4 * HOUR_MS,
  '6h': 6 * HOUR_MS,
  '8h': 8 * HOUR_MS,
  '12h': 12 * HOUR_MS,
  '1d': DAY_MS,
  '3d': 3 * DAY_MS,
  '1w': WEEK_MS,
  '1M': MONTH_MS,
};

export function timeframeToMs(tf: Timeframe): number {
  return TIMEFRAME_MS[tf];
}

export function alignToTimeframe(timestampMs: number, tf: Timeframe): number {
  const span = timeframeToMs(tf);
  return Math.floor(timestampMs / span) * span;
}

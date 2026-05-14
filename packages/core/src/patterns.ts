import type { Candle } from './ohlcv';

export type PatternKind =
  | 'doji'
  | 'hammer'
  | 'inverted_hammer'
  | 'shooting_star'
  | 'bullish_engulfing'
  | 'bearish_engulfing'
  | 'morning_star'
  | 'evening_star';

export interface PatternMatch {
  time: number;
  kind: PatternKind;
  bullish: boolean;
  label: string;
}

function bodySize(c: Candle) {
  return Math.abs(c.close - c.open);
}

function rangeSize(c: Candle) {
  return c.high - c.low;
}

function upperShadow(c: Candle) {
  return c.high - Math.max(c.open, c.close);
}

function lowerShadow(c: Candle) {
  return Math.min(c.open, c.close) - c.low;
}

function isBullish(c: Candle) {
  return c.close > c.open;
}

function isBearish(c: Candle) {
  return c.close < c.open;
}

function isDoji(c: Candle): boolean {
  const range = rangeSize(c);
  if (range === 0) return false;
  return bodySize(c) / range < 0.1;
}

function isHammer(c: Candle): boolean {
  const body = bodySize(c);
  const lower = lowerShadow(c);
  const upper = upperShadow(c);
  const range = rangeSize(c);
  if (range === 0 || body === 0) return false;
  return lower >= body * 2 && upper <= body * 0.5 && lower / range >= 0.5;
}

function isInvertedHammer(c: Candle): boolean {
  const body = bodySize(c);
  const lower = lowerShadow(c);
  const upper = upperShadow(c);
  const range = rangeSize(c);
  if (range === 0 || body === 0) return false;
  return upper >= body * 2 && lower <= body * 0.5 && upper / range >= 0.5;
}

export function detectPatterns(candles: Candle[]): PatternMatch[] {
  const results: PatternMatch[] = [];

  for (let i = 2; i < candles.length; i++) {
    const prev2 = candles[i - 2]!;
    const prev = candles[i - 1]!;
    const cur = candles[i]!;

    // Doji
    if (isDoji(cur)) {
      results.push({ time: cur.time, kind: 'doji', bullish: false, label: 'Doji' });
    }

    // Hammer (bullish reversal — appears after downtrend; we just detect the shape)
    if (isHammer(cur) && isBullish(cur)) {
      results.push({ time: cur.time, kind: 'hammer', bullish: true, label: 'Hammer' });
    }

    // Inverted Hammer
    if (isInvertedHammer(cur) && isBullish(cur)) {
      results.push({
        time: cur.time,
        kind: 'inverted_hammer',
        bullish: true,
        label: 'Inv. Hammer',
      });
    }

    // Shooting Star (bearish — inverted hammer after uptrend)
    if (isInvertedHammer(cur) && isBearish(cur)) {
      results.push({
        time: cur.time,
        kind: 'shooting_star',
        bullish: false,
        label: 'Shooting Star',
      });
    }

    // Bullish Engulfing: prev bearish, cur bullish and body engulfs prev
    if (isBearish(prev) && isBullish(cur) && cur.open <= prev.close && cur.close >= prev.open) {
      results.push({
        time: cur.time,
        kind: 'bullish_engulfing',
        bullish: true,
        label: 'Bull. Engulfing',
      });
    }

    // Bearish Engulfing: prev bullish, cur bearish and body engulfs prev
    if (isBullish(prev) && isBearish(cur) && cur.open >= prev.close && cur.close <= prev.open) {
      results.push({
        time: cur.time,
        kind: 'bearish_engulfing',
        bullish: false,
        label: 'Bear. Engulfing',
      });
    }

    // Morning Star: bearish → small body → bullish
    if (
      isBearish(prev2) &&
      bodySize(prev) < bodySize(prev2) * 0.3 &&
      isBullish(cur) &&
      cur.close > (prev2.open + prev2.close) / 2
    ) {
      results.push({ time: cur.time, kind: 'morning_star', bullish: true, label: 'Morning Star' });
    }

    // Evening Star: bullish → small body → bearish
    if (
      isBullish(prev2) &&
      bodySize(prev) < bodySize(prev2) * 0.3 &&
      isBearish(cur) &&
      cur.close < (prev2.open + prev2.close) / 2
    ) {
      results.push({ time: cur.time, kind: 'evening_star', bullish: false, label: 'Evening Star' });
    }
  }

  return results;
}

export function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j] ?? 0;
    return sum / period;
  });
}

export function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev: number | null = null;

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (val === undefined) {
      result.push(null);
      continue;
    }
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (prev === null) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j] ?? 0;
      prev = sum / period;
      result.push(prev);
    } else {
      prev = val * k + prev * (1 - k);
      result.push(prev);
    }
  }
  return result;
}

export interface BBResult {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export function bollingerBands(data: number[], period = 20, mult = 2): BBResult[] {
  const middle = sma(data, period);
  return data.map((_, i) => {
    const m = middle[i];
    if (m === null || m === undefined) return { upper: null, middle: null, lower: null };
    const slice = data.slice(i - period + 1, i + 1);
    const variance = slice.reduce((acc, v) => acc + (v - m) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    return { upper: m + mult * std, middle: m, lower: m - mult * std };
  });
}

export function rsi(data: number[], period = 14): (number | null)[] {
  if (data.length < period + 1) return data.map(() => null);

  const result: (number | null)[] = [null];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = (data[i] ?? 0) - (data[i - 1] ?? 0);
    avgGain += Math.max(0, diff) / period;
    avgLoss += Math.abs(Math.min(0, diff)) / period;
  }
  result.push(...new Array<null>(period - 1).fill(null));
  const rs0 = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  result.push(rs0 === Infinity ? 100 : 100 - 100 / (1 + rs0));

  for (let i = period + 1; i < data.length; i++) {
    const diff = (data[i] ?? 0) - (data[i - 1] ?? 0);
    const gain = Math.max(0, diff);
    const loss = Math.abs(Math.min(0, diff));
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result.push(rs === Infinity ? 100 : 100 - 100 / (1 + rs));
  }
  return result;
}

export interface MACDResult {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function macd(data: number[], fast = 12, slow = 26, signal = 9): MACDResult[] {
  const fastEma = ema(data, fast);
  const slowEma = ema(data, slow);

  const macdLine: (number | null)[] = data.map((_, i) => {
    const f = fastEma[i];
    const s = slowEma[i];
    return f !== null && f !== undefined && s !== null && s !== undefined ? f - s : null;
  });

  const validVals: number[] = [];
  const validIdx: number[] = [];
  macdLine.forEach((v, i) => {
    if (v !== null) {
      validVals.push(v);
      validIdx.push(i);
    }
  });
  const sigEma = ema(validVals, signal);

  const signalLine: (number | null)[] = new Array<null>(data.length).fill(null);
  validIdx.forEach((origIdx, j) => {
    const sv = sigEma[j];
    if (origIdx !== undefined) signalLine[origIdx] = sv !== undefined ? sv : null;
  });

  return data.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    const mv = m !== undefined ? m : null;
    const sv = s !== undefined ? s : null;
    return {
      macd: mv,
      signal: sv,
      histogram: mv !== null && sv !== null ? mv - sv : null,
    };
  });
}

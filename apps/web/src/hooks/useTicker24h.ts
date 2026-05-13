'use client';

import type { Ticker24h, TradingSymbol } from '@trading-app/core';
import { subscribeTicker24h } from '@trading-app/datafeed';
import { useEffect, useState } from 'react';

export function useTicker24h(symbol: TradingSymbol): Ticker24h | null {
  const [ticker, setTicker] = useState<Ticker24h | null>(null);

  useEffect(() => {
    setTicker(null);
    const unsub = subscribeTicker24h(symbol, setTicker);
    return unsub;
  }, [symbol]);

  return ticker;
}

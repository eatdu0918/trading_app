'use client';

import type { RecentTrade, TradingSymbol } from '@trading-app/core';
import { subscribeTrades } from '@trading-app/datafeed';
import { useEffect, useState } from 'react';

const MAX_TRADES = 50;

export function useRecentTrades(symbol: TradingSymbol): RecentTrade[] {
  const [trades, setTrades] = useState<RecentTrade[]>([]);

  useEffect(() => {
    setTrades([]);
    const unsub = subscribeTrades(symbol, (trade) => {
      setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES));
    });
    return unsub;
  }, [symbol]);

  return trades;
}

'use client';

import type { OrderBook, TradingSymbol } from '@trading-app/core';
import { subscribeOrderBook } from '@trading-app/datafeed';
import { useEffect, useState } from 'react';

export function useOrderBook(symbol: TradingSymbol): OrderBook | null {
  const [book, setBook] = useState<OrderBook | null>(null);

  useEffect(() => {
    setBook(null);
    const unsub = subscribeOrderBook(symbol, setBook);
    return unsub;
  }, [symbol]);

  return book;
}

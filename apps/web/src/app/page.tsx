'use client';

import type { TradingSymbol } from '@trading-app/core';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChartGrid } from '@/components/chart/ChartGrid';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { WatchlistPanel } from '@/components/watchlist/WatchlistPanel';
import { BTC_USDT } from '@/lib/symbols';

export default function HomePage() {
  const [symbol, setSymbol] = useState<TradingSymbol>(BTC_USDT);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header symbol={symbol} onSymbolChange={setSymbol} />

      <div className="flex min-h-0 flex-1">
        {/* Left sidebar — watchlist */}
        <Sidebar>
          <WatchlistPanel initialIds={[]} activeSymbolId={symbol.id} onSymbolClick={setSymbol} />
        </Sidebar>

        {/* Main chart area */}
        <main className="min-w-0 flex-1 p-2">
          <ChartGrid primarySymbol={symbol} initialTimeframe="1m" />
        </main>

        {/* Right sidebar — order book + trades */}
        <TradingPanel symbol={symbol} />
      </div>
    </div>
  );
}

'use client';

import type { TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav, type MobileTab } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChartGrid } from '@/components/chart/ChartGrid';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { WatchlistPanel } from '@/components/watchlist/WatchlistPanel';
import { BTC_USDT } from '@/lib/symbols';

export default function HomePage() {
  const [symbol, setSymbol] = useState<TradingSymbol>(BTC_USDT);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chart');

  const handleWatchlistSymbolClick = (s: TradingSymbol) => {
    setSymbol(s);
    setMobileTab('chart');
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header symbol={symbol} onSymbolChange={setSymbol} />

      <div className="flex min-h-0 flex-1">
        {/* Desktop: left sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar>
            <WatchlistPanel initialIds={[]} activeSymbolId={symbol.id} onSymbolClick={setSymbol} />
          </Sidebar>
        </div>

        {/* Mobile: watchlist tab — full screen, hidden on desktop */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-auto md:hidden',
            mobileTab !== 'watchlist' && 'hidden',
          )}
        >
          <WatchlistPanel
            initialIds={[]}
            activeSymbolId={symbol.id}
            onSymbolClick={handleWatchlistSymbolClick}
          />
        </div>

        {/* Chart — always rendered to keep WS alive; hidden on mobile when inactive */}
        <main className={cn('min-w-0 flex-1 p-2', mobileTab !== 'chart' && 'hidden md:block')}>
          <ChartGrid primarySymbol={symbol} initialTimeframe="1m" />
        </main>

        {/* Desktop: right trading panel */}
        <div className="hidden md:flex">
          <TradingPanel symbol={symbol} />
        </div>

        {/* Mobile: trading tab — full screen, hidden on desktop */}
        <div className={cn('min-h-0 flex-1 md:hidden', mobileTab !== 'trading' && 'hidden')}>
          <TradingPanel symbol={symbol} mobile />
        </div>
      </div>

      {/* Mobile bottom navigation — hidden on desktop */}
      <MobileNav activeTab={mobileTab} onChange={setMobileTab} />
    </div>
  );
}

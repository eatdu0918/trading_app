'use client';

import type { TradingSymbol } from '@trading-app/core';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav, type MobilePanel } from '@/components/layout/MobileBottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ChartGrid } from '@/components/chart/ChartGrid';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { OrderBook } from '@/components/trading/OrderBook';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { WatchlistPanel } from '@/components/watchlist/WatchlistPanel';
import { PortfolioPanel } from '@/components/portfolio/PortfolioPanel';
import { BTC_USDT } from '@/lib/symbols';

export default function HomePage() {
  const [symbol, setSymbol] = useState<TradingSymbol>(BTC_USDT);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header symbol={symbol} onSymbolChange={setSymbol} />

      {/* Desktop 3-column layout */}
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar — watchlist + portfolio (desktop only) */}
        <div className="hidden md:flex">
          <Sidebar
            watchlist={
              <WatchlistPanel
                initialIds={[]}
                activeSymbolId={symbol.id}
                onSymbolClick={setSymbol}
              />
            }
            portfolio={<PortfolioPanel />}
          />
        </div>

        {/* Main chart area */}
        <main className="min-w-0 flex-1 p-1 md:p-2">
          <ChartGrid primarySymbol={symbol} initialTimeframe="1m" />
        </main>

        {/* Right sidebar — order book + trades (desktop only) */}
        <div className="hidden md:flex">
          <TradingPanel symbol={symbol} />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav activePanel={mobilePanel} onPanelChange={setMobilePanel} />

      {/* Mobile drawers */}
      <MobileDrawer
        open={mobilePanel === 'watchlist'}
        onClose={() => setMobilePanel(null)}
        title="관심 종목"
      >
        <WatchlistPanel
          initialIds={[]}
          activeSymbolId={symbol.id}
          onSymbolClick={(s) => {
            setSymbol(s);
            setMobilePanel(null);
          }}
        />
      </MobileDrawer>

      <MobileDrawer
        open={mobilePanel === 'orderbook'}
        onClose={() => setMobilePanel(null)}
        title="호가창"
      >
        <OrderBook symbol={symbol} />
      </MobileDrawer>

      <MobileDrawer
        open={mobilePanel === 'trades'}
        onClose={() => setMobilePanel(null)}
        title="최근 체결"
      >
        <RecentTrades symbol={symbol} />
      </MobileDrawer>
    </div>
  );
}

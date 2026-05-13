'use client';

import type { TradingSymbol } from '@trading-app/core';
import { ChartView } from '@/components/chart/ChartView';
import { SymbolSelector } from '@/components/chart/SymbolSelector';
import { BTC_USDT } from '@/lib/symbols';
import { useState } from 'react';

export default function HomePage() {
  const [symbol, setSymbol] = useState<TradingSymbol>(BTC_USDT);

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      {/* Top nav */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-semibold tracking-widest text-[var(--color-text-primary)]">
            TRADING APP
          </span>
        </div>
        <SymbolSelector value={symbol} onChange={setSymbol} />
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] sm:block">
          Live · Binance
        </span>
      </header>

      {/* Chart */}
      <section className="min-h-0 flex-1 px-4 py-3">
        <ChartView symbol={symbol} initialTimeframe="1m" />
      </section>
    </main>
  );
}

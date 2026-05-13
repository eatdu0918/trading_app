'use client';

import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import { useState } from 'react';
import { Chart } from './Chart';
import { PriceHeader } from './PriceHeader';
import { TimeframeSelector } from './TimeframeSelector';

interface ChartViewProps {
  symbol: TradingSymbol;
  initialTimeframe?: Timeframe;
}

export function ChartView({ symbol, initialTimeframe = '1m' }: ChartViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [latestBar, setLatestBar] = useState<Candle | null>(null);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <PriceHeader symbol={symbol} bar={latestBar} />
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="flex-1 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Chart symbol={symbol} timeframe={timeframe} onLatestBarChange={setLatestBar} />
      </div>
    </div>
  );
}

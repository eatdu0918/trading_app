'use client';

import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import { useState } from 'react';
import { Chart, type ChartStatus } from './Chart';
import { PriceHeader } from './PriceHeader';
import { TimeframeSelector } from './TimeframeSelector';

interface ChartViewProps {
  symbol: TradingSymbol;
  initialTimeframe?: Timeframe;
}

export function ChartView({ symbol, initialTimeframe = '1m' }: ChartViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [latestBar, setLatestBar] = useState<Candle | null>(null);
  const [status, setStatus] = useState<ChartStatus>('loading');

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <PriceHeader symbol={symbol} bar={latestBar} isLoading={status === 'loading'} />
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      {/* Chart area */}
      <div className="relative flex-1 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Chart
          symbol={symbol}
          timeframe={timeframe}
          onLatestBarChange={setLatestBar}
          onStatusChange={setStatus}
        />

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
            <LoadingSpinner />
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--color-surface)]">
            <span className="text-sm text-[var(--color-bearish)]">데이터를 불러올 수 없습니다</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Binance API 연결을 확인하세요
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        className="h-6 w-6 animate-spin text-[var(--color-accent)]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="로딩 중"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="font-mono text-xs text-[var(--color-text-muted)]">차트 로딩 중…</span>
    </div>
  );
}

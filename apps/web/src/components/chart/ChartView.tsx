'use client';

import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import { useState } from 'react';
import { DrawingToolbar } from './DrawingToolbar';
import { IndicatorSelector } from './IndicatorSelector';
import { Chart, type ChartStatus } from './Chart';
import { PriceHeader } from './PriceHeader';
import { SubChart } from './SubChart';
import { TimeframeSelector } from './TimeframeSelector';
import { useChartStore } from '@/store/chart';
import { useTicker24h } from '@/hooks/useTicker24h';

interface ChartViewProps {
  symbol: TradingSymbol;
  initialTimeframe?: Timeframe;
  compact?: boolean;
}

export function ChartView({ symbol, initialTimeframe = '1m', compact = false }: ChartViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [latestBar, setLatestBar] = useState<Candle | null>(null);
  const [bars, setBars] = useState<Candle[]>([]);
  const [status, setStatus] = useState<ChartStatus>('loading');
  const { indicators } = useChartStore();
  const ticker = useTicker24h(symbol);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar — full mode */}
      {!compact && (
        <div className="shrink-0 space-y-2 border-b border-[var(--color-border)] px-1 pb-2 pt-1">
          <PriceHeader
            symbol={symbol}
            bar={latestBar}
            ticker={ticker}
            isLoading={status === 'loading'}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            <div className="h-4 w-px bg-[var(--color-border)]" />
            <IndicatorSelector />
            <div className="h-4 w-px bg-[var(--color-border)]" />
            <DrawingToolbar />
          </div>
        </div>
      )}

      {/* Compact top bar */}
      {compact && (
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-2 py-1">
          <span className="font-mono text-xs font-medium text-[var(--color-text-secondary)]">
            {symbol.base}/{symbol.quote}
          </span>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>
      )}

      {/* Main chart */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Chart
          symbol={symbol}
          timeframe={timeframe}
          onLatestBarChange={setLatestBar}
          onStatusChange={setStatus}
          onBarsLoad={setBars}
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

      {/* RSI sub-panel */}
      {!compact && indicators.rsi && bars.length > 0 && (
        <SubChart type="rsi" bars={bars} height={120} />
      )}

      {/* MACD sub-panel */}
      {!compact && indicators.macd && bars.length > 0 && (
        <SubChart type="macd" bars={bars} height={120} />
      )}
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
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
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

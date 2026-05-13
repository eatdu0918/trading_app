'use client';

import type { Timeframe, TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { useState } from 'react';
import { ChartView } from './ChartView';

type GridLayout = '1x1' | '1x2' | '2x2';

const LAYOUT_OPTIONS: { value: GridLayout; label: string; cols: number; rows: number }[] = [
  { value: '1x1', label: '1×1', cols: 1, rows: 1 },
  { value: '1x2', label: '1×2', cols: 2, rows: 1 },
  { value: '2x2', label: '2×2', cols: 2, rows: 2 },
];

interface ChartGridProps {
  primarySymbol: TradingSymbol;
  initialTimeframe?: Timeframe;
}

const SECONDARY_SYMBOLS: TradingSymbol[] = [
  {
    id: 'BINANCE:ETH-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'ETH',
    quote: 'USDT',
    displayName: 'ETH / USDT',
    pricePrecision: 2,
    quantityPrecision: 4,
  },
  {
    id: 'BINANCE:BNB-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'BNB',
    quote: 'USDT',
    displayName: 'BNB / USDT',
    pricePrecision: 2,
    quantityPrecision: 3,
  },
  {
    id: 'BINANCE:SOL-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'SOL',
    quote: 'USDT',
    displayName: 'SOL / USDT',
    pricePrecision: 2,
    quantityPrecision: 2,
  },
];

export function ChartGrid({ primarySymbol, initialTimeframe = '1m' }: ChartGridProps) {
  const [layout, setLayout] = useState<GridLayout>('1x1');

  const option = LAYOUT_OPTIONS.find((o) => o.value === layout)!;
  const totalPanels = option.cols * option.rows;

  const panels: TradingSymbol[] = [primarySymbol, ...SECONDARY_SYMBOLS.slice(0, totalPanels - 1)];

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Layout switcher — desktop only */}
      <div className="hidden shrink-0 items-center justify-end gap-1 md:flex">
        {LAYOUT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLayout(opt.value)}
            className={cn(
              'cursor-pointer rounded px-2 py-1 font-mono text-xs transition-colors',
              layout === opt.value
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
            )}
            aria-pressed={layout === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        className="min-h-0 flex-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${option.cols}, 1fr)`,
          gridTemplateRows: `repeat(${option.rows}, 1fr)`,
          gap: '8px',
        }}
      >
        {Array.from({ length: totalPanels }).map((_, i) => {
          const symbol = panels[i] ?? primarySymbol;
          return (
            <div
              key={`${layout}-${i}`}
              className="min-h-0 min-w-0 overflow-hidden rounded-md border border-[var(--color-border)]"
            >
              <ChartView
                symbol={symbol}
                initialTimeframe={initialTimeframe}
                compact={totalPanels > 1}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

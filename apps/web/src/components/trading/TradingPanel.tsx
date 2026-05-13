'use client';

import type { TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { useState } from 'react';
import { OrderBook } from './OrderBook';
import { RecentTrades } from './RecentTrades';

interface TradingPanelProps {
  symbol: TradingSymbol;
}

type PanelTab = 'orderbook' | 'trades';

export function TradingPanel({ symbol }: TradingPanelProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<PanelTab>('orderbook');

  if (!open) {
    return (
      <div className="flex w-8 shrink-0 flex-col items-center border-l border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="패널 열기"
          className="mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="9,2 4,7 9,12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-[260px] shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header: tabs + collapse */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-2 py-1">
        <div className="flex gap-1">
          {(['orderbook', 'trades'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                tab === t
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {t === 'orderbook' ? '호가창' : '체결'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          title="패널 닫기"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="5,2 10,7 5,12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'orderbook' ? <OrderBook symbol={symbol} /> : <RecentTrades symbol={symbol} />}
      </div>
    </div>
  );
}

'use client';

import type { Candle, TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { formatPrice, formatSignedPercent, formatVolume } from '@/lib/format';

interface PriceHeaderProps {
  symbol: TradingSymbol;
  bar: Candle | null;
}

export function PriceHeader({ symbol, bar }: PriceHeaderProps) {
  const change = bar ? bar.close - bar.open : 0;
  const changePct = bar && bar.open !== 0 ? (change / bar.open) * 100 : 0;
  const isUp = change >= 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold">{symbol.displayName}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {symbol.exchange} · {symbol.kind}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            'font-mono text-2xl font-semibold tabular-nums',
            isUp ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]',
          )}
        >
          {bar ? formatPrice(bar.close, symbol.pricePrecision) : '—'}
        </span>
        {bar && (
          <span
            className={cn(
              'font-mono text-sm tabular-nums',
              isUp ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]',
            )}
          >
            {formatSignedPercent(changePct)}
          </span>
        )}
      </div>

      {bar && (
        <dl className="flex items-baseline gap-x-4 gap-y-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
          <Stat label="O" value={formatPrice(bar.open, symbol.pricePrecision)} />
          <Stat label="H" value={formatPrice(bar.high, symbol.pricePrecision)} />
          <Stat label="L" value={formatPrice(bar.low, symbol.pricePrecision)} />
          <Stat label="C" value={formatPrice(bar.close, symbol.pricePrecision)} />
          <Stat label="V" value={formatVolume(bar.volume)} />
        </dl>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[var(--color-text-primary)]">{value}</dd>
    </span>
  );
}

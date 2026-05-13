'use client';

import type { Candle, Ticker24h, TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { formatPrice, formatSignedPercent, formatVolume } from '@/lib/format';

interface PriceHeaderProps {
  symbol: TradingSymbol;
  bar: Candle | null;
  ticker?: Ticker24h | null;
  isLoading?: boolean;
}

export function PriceHeader({ symbol, bar, ticker, isLoading }: PriceHeaderProps) {
  const change = bar ? bar.close - bar.open : 0;
  const changePct = bar && bar.open !== 0 ? (change / bar.open) * 100 : 0;
  const isUp = change >= 0;

  // Prefer ticker for price change % (24h) when available, else use bar change
  const displayPct = ticker ? ticker.priceChangePercent : changePct;
  const displayIsUp = displayPct >= 0;

  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
      {/* Symbol + exchange */}
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold">{symbol.displayName}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {symbol.exchange} · {symbol.kind}
        </span>
      </div>

      {/* Price + change */}
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            'font-mono text-2xl font-semibold tabular-nums transition-colors',
            isLoading
              ? 'text-[var(--color-text-muted)]'
              : isUp
                ? 'text-[var(--color-bullish)]'
                : 'text-[var(--color-bearish)]',
          )}
        >
          {bar ? formatPrice(bar.close, symbol.pricePrecision) : '—'}
        </span>
        {bar && !isLoading && (
          <span
            className={cn(
              'font-mono text-sm tabular-nums',
              displayIsUp ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]',
            )}
          >
            {formatSignedPercent(displayPct)}
          </span>
        )}
      </div>

      {/* OHLCV from current bar */}
      {bar && (
        <dl className="flex items-baseline gap-x-4 font-mono text-xs text-[var(--color-text-secondary)]">
          <Stat label="O" value={formatPrice(bar.open, symbol.pricePrecision)} />
          <Stat label="H" value={formatPrice(bar.high, symbol.pricePrecision)} />
          <Stat label="L" value={formatPrice(bar.low, symbol.pricePrecision)} />
          <Stat label="C" value={formatPrice(bar.close, symbol.pricePrecision)} />
          <Stat label="V" value={formatVolume(bar.volume)} />
        </dl>
      )}

      {/* 24h stats from ticker */}
      {ticker && (
        <dl className="flex items-baseline gap-x-4 font-mono text-xs text-[var(--color-text-muted)]">
          <Stat label="24H 고" value={formatPrice(ticker.highPrice, symbol.pricePrecision)} />
          <Stat label="24H 저" value={formatPrice(ticker.lowPrice, symbol.pricePrecision)} />
          <Stat label="24H 거래량" value={formatVolume(ticker.volume)} />
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

'use client';

import type { TradingSymbol } from '@trading-app/core';
import { useOrderBook } from '@/hooks/useOrderBook';
import { formatPrice } from '@/lib/format';

interface OrderBookProps {
  symbol: TradingSymbol;
}

const LEVELS = 12;

export function OrderBook({ symbol }: OrderBookProps) {
  const book = useOrderBook(symbol);

  if (!book) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-text-muted)]">
        연결 중…
      </div>
    );
  }

  const asks = book.asks.slice(0, LEVELS);
  const bids = book.bids.slice(0, LEVELS);

  const maxQty = Math.max(...asks.map((l) => l.quantity), ...bids.map((l) => l.quantity));

  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0;
  const spreadPct = bids[0] && bids[0].price > 0 ? (spread / bids[0].price) * 100 : 0;

  return (
    <div className="flex h-full flex-col font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-muted)]">
        <span>가격 ({symbol.quote})</span>
        <span>수량 ({symbol.base})</span>
      </div>

      {/* Asks (reverse: lowest ask at bottom) */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden">
        {asks.map((level, i) => (
          <BookRow
            key={`ask-${i}`}
            price={level.price}
            qty={level.quantity}
            maxQty={maxQty}
            side="ask"
            precision={symbol.pricePrecision}
            qtyPrecision={symbol.quantityPrecision}
          />
        ))}
      </div>

      {/* Spread */}
      <div className="flex shrink-0 items-center justify-between border-y border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
        <span>스프레드</span>
        <span>
          {formatPrice(spread, symbol.pricePrecision)} ({spreadPct.toFixed(3)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {bids.map((level, i) => (
          <BookRow
            key={`bid-${i}`}
            price={level.price}
            qty={level.quantity}
            maxQty={maxQty}
            side="bid"
            precision={symbol.pricePrecision}
            qtyPrecision={symbol.quantityPrecision}
          />
        ))}
      </div>
    </div>
  );
}

function BookRow({
  price,
  qty,
  maxQty,
  side,
  precision,
  qtyPrecision,
}: {
  price: number;
  qty: number;
  maxQty: number;
  side: 'bid' | 'ask';
  precision: number;
  qtyPrecision: number;
}) {
  const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
  const isBid = side === 'bid';

  return (
    <div className="relative flex shrink-0 items-center justify-between px-2 py-[2px]">
      {/* Depth bar */}
      <div
        className="absolute inset-y-0 opacity-15"
        style={{
          [isBid ? 'left' : 'right']: 0,
          width: `${pct}%`,
          background: isBid ? 'rgb(34,197,94)' : 'rgb(239,68,68)',
        }}
      />
      <span className={isBid ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]'}>
        {formatPrice(price, precision)}
      </span>
      <span className="text-[var(--color-text-secondary)]">{qty.toFixed(qtyPrecision)}</span>
    </div>
  );
}

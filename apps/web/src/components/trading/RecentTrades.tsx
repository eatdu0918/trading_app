'use client';

import type { TradingSymbol } from '@trading-app/core';
import { useRecentTrades } from '@/hooks/useRecentTrades';
import { formatPrice } from '@/lib/format';

interface RecentTradesProps {
  symbol: TradingSymbol;
}

export function RecentTrades({ symbol }: RecentTradesProps) {
  const trades = useRecentTrades(symbol);

  return (
    <div className="flex h-full flex-col font-mono text-xs">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-muted)]">
        <span>가격 ({symbol.quote})</span>
        <span>수량 ({symbol.base})</span>
        <span>시간</span>
      </div>

      {/* Trade list */}
      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
            연결 중…
          </div>
        ) : (
          trades.map((trade) => {
            const isBuy = !trade.isBuyerMaker;
            const d = new Date(trade.time);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

            return (
              <div key={trade.id} className="flex items-center justify-between px-2 py-[2px]">
                <span
                  className={isBuy ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]'}
                >
                  {formatPrice(trade.price, symbol.pricePrecision)}
                </span>
                <span className="text-[var(--color-text-secondary)]">
                  {trade.quantity.toFixed(symbol.quantityPrecision)}
                </span>
                <span className="text-[var(--color-text-muted)]">{timeStr}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

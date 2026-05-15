'use client';

import type { PortfolioHolding } from '@/lib/db';
import { cn } from '@trading-app/ui';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { getHoldings, removeHolding, upsertHolding } from '@/server/actions/portfolio';
import { useTicker24h } from '@/hooks/useTicker24h';
import { SYMBOL_PRESETS } from '@/lib/symbols';
import type { TradingSymbol } from '@trading-app/core';

function HoldingRow({ holding, onRemove }: { holding: PortfolioHolding; onRemove: () => void }) {
  const symbol = SYMBOL_PRESETS.find((s) => s.id === holding.symbolId);
  const ticker = useTicker24h(symbol ?? SYMBOL_PRESETS[0]!);

  const currentPrice = ticker ? ticker.lastPrice : null;
  const totalCost = holding.quantity * holding.avgCost;
  const currentValue = currentPrice ? holding.quantity * currentPrice : null;
  const pnl = currentValue !== null ? currentValue - totalCost : null;
  const pnlPct = pnl !== null && totalCost > 0 ? (pnl / totalCost) * 100 : null;
  const isProfit = pnl !== null && pnl >= 0;

  return (
    <div className="border-b border-[var(--color-border)] px-3 py-2 last:border-0">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">
          {holding.symbolBase}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-bearish)]"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">수량</span>
        <span className="text-right font-mono text-[10px] text-[var(--color-text-secondary)]">
          {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}
        </span>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">평균단가</span>
        <span className="text-right font-mono text-[10px] text-[var(--color-text-secondary)]">
          $
          {holding.avgCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        {currentValue !== null && (
          <>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">평가금액</span>
            <span className="text-right font-mono text-[10px] text-[var(--color-text-secondary)]">
              $
              {currentValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </>
        )}
        {pnl !== null && pnlPct !== null && (
          <>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">손익</span>
            <span
              className={cn(
                'text-right font-mono text-[10px] font-semibold',
                isProfit ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]',
              )}
            >
              {isProfit ? '+' : ''}
              {pnl.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              ({isProfit ? '+' : ''}
              {pnlPct.toFixed(2)}%)
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface AddHoldingFormProps {
  onAdd: (data: {
    symbolId: string;
    symbolBase: string;
    symbolQuote: string;
    quantity: number;
    avgCost: number;
  }) => void;
}

function AddHoldingForm({ onAdd }: AddHoldingFormProps) {
  const [symbol, setSymbol] = useState<TradingSymbol>(SYMBOL_PRESETS[0]!);
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');

  function handleSubmit() {
    const qty = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) return;
    onAdd({
      symbolId: symbol.id,
      symbolBase: symbol.base,
      symbolQuote: symbol.quote,
      quantity: qty,
      avgCost: cost,
    });
    setQuantity('');
    setAvgCost('');
  }

  return (
    <div className="border-b border-[var(--color-border)] p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
        보유 추가
      </p>
      <div className="flex flex-col gap-1.5">
        <select
          value={symbol.id}
          onChange={(e) =>
            setSymbol(SYMBOL_PRESETS.find((s) => s.id === e.target.value) ?? SYMBOL_PRESETS[0]!)
          }
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        >
          {SYMBOL_PRESETS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="수량"
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="number"
          value={avgCost}
          onChange={(e) => setAvgCost(e.target.value)}
          placeholder="평균단가 (USDT)"
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded bg-[var(--color-accent)] py-1 font-mono text-xs text-white hover:opacity-90"
        >
          추가
        </button>
      </div>
    </div>
  );
}

export function PortfolioPanel() {
  const { isSignedIn } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [optimisticHoldings, updateOptimisticHoldings] = useOptimistic(holdings);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isSignedIn) return;
    getHoldings().then(setHoldings).catch(console.error);
  }, [isSignedIn]);

  function handleAdd(data: {
    symbolId: string;
    symbolBase: string;
    symbolQuote: string;
    quantity: number;
    avgCost: number;
  }) {
    startTransition(async () => {
      const tempHolding: PortfolioHolding = {
        id: -Date.now(),
        userId: '',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updateOptimisticHoldings((prev) => {
        const exists = prev.find((h) => h.symbolId === data.symbolId);
        return exists
          ? prev.map((h) => (h.symbolId === data.symbolId ? { ...h, ...data } : h))
          : [...prev, tempHolding];
      });
      await upsertHolding(data);
      const updated = await getHoldings();
      setHoldings(updated);
    });
  }

  function handleRemove(symbolId: string) {
    startTransition(async () => {
      updateOptimisticHoldings((prev) => prev.filter((h) => h.symbolId !== symbolId));
      await removeHolding(symbolId);
      const updated = await getHoldings();
      setHoldings(updated);
    });
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
          포트폴리오 기능은 로그인 후 사용 가능합니다
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AddHoldingForm onAdd={handleAdd} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {optimisticHoldings.length === 0 ? (
          <p className="p-4 text-center font-mono text-[11px] text-[var(--color-text-muted)]">
            보유 종목 없음
          </p>
        ) : (
          optimisticHoldings.map((h) => (
            <HoldingRow key={h.id} holding={h} onRemove={() => handleRemove(h.symbolId)} />
          ))
        )}
      </div>
      {isPending && (
        <div className="shrink-0 border-t border-[var(--color-border)] px-3 py-1">
          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">저장 중…</p>
        </div>
      )}
    </div>
  );
}

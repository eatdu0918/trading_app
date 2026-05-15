'use client';

import type { TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { useEffect, useRef, useState } from 'react';
import { useAlertStore, type AlertDirection } from '@/store/alerts';
import { formatPrice } from '@/lib/format';

interface AlertPanelProps {
  symbol: TradingSymbol;
  currentPrice: number | null;
}

export function AlertPanel({ symbol, currentPrice }: AlertPanelProps) {
  const [open, setOpen] = useState(false);
  const [inputPrice, setInputPrice] = useState('');
  const [direction, setDirection] = useState<AlertDirection>('above');
  const ref = useRef<HTMLDivElement>(null);

  const { alerts, addAlert, removeAlert } = useAlertStore();
  const symbolAlerts = alerts.filter((a) => a.symbolId === symbol.id);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleAdd() {
    const price = parseFloat(inputPrice);
    if (isNaN(price) || price <= 0) return;
    addAlert({
      symbolId: symbol.id,
      symbolBase: symbol.base,
      targetPrice: price,
      direction,
    });
    setInputPrice('');

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  const activeCount = symbolAlerts.filter((a) => !a.triggered).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        title="가격 알림 설정"
        className={cn(
          'flex items-center gap-1 rounded px-2 py-1 font-mono text-xs transition-colors',
          activeCount > 0
            ? 'bg-[var(--color-accent)] text-[var(--color-background)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        알림{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            {symbol.base} 가격 알림
          </p>

          {/* Add alert */}
          <div className="mb-3 flex flex-col gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDirection('above')}
                className={cn(
                  'flex-1 rounded px-2 py-1 font-mono text-[10px] transition-colors',
                  direction === 'above'
                    ? 'bg-[var(--color-bullish)] text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-text-muted)]',
                )}
              >
                ▲ 이상
              </button>
              <button
                type="button"
                onClick={() => setDirection('below')}
                className={cn(
                  'flex-1 rounded px-2 py-1 font-mono text-[10px] transition-colors',
                  direction === 'below'
                    ? 'bg-[var(--color-bearish)] text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-text-muted)]',
                )}
              >
                ▼ 이하
              </button>
            </div>
            <div className="flex gap-1">
              <input
                type="number"
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={
                  currentPrice ? formatPrice(currentPrice, symbol.pricePrecision) : '목표 가격'
                }
                className="min-w-0 flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="rounded bg-[var(--color-accent)] px-2 py-1 font-mono text-[10px] text-white hover:opacity-90"
              >
                추가
              </button>
            </div>
          </div>

          {/* Alert list */}
          {symbolAlerts.length === 0 ? (
            <p className="text-center font-mono text-[10px] text-[var(--color-text-muted)]">
              알림 없음
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {symbolAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    'flex items-center justify-between rounded px-2 py-1',
                    alert.triggered ? 'opacity-40' : 'bg-[var(--color-surface-elevated)]',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[11px]',
                      alert.direction === 'above'
                        ? 'text-[var(--color-bullish)]'
                        : 'text-[var(--color-bearish)]',
                    )}
                  >
                    {alert.direction === 'above' ? '▲' : '▼'}{' '}
                    {formatPrice(alert.targetPrice, symbol.pricePrecision)}
                    {alert.triggered && ' ✓'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAlert(alert.id)}
                    className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-bearish)]"
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { cn } from '@trading-app/ui';
import { useEffect, useRef, useState } from 'react';
import { type IndicatorsConfig, useChartStore } from '@/store/chart';

const OVERLAY_ITEMS: { key: keyof IndicatorsConfig; label: string }[] = [
  { key: 'ma5', label: 'MA 5' },
  { key: 'ma20', label: 'MA 20' },
  { key: 'ema20', label: 'EMA 20' },
  { key: 'bb', label: 'BB (20,2)' },
];

const PANEL_ITEMS: { key: keyof IndicatorsConfig; label: string }[] = [
  { key: 'rsi', label: 'RSI (14)' },
  { key: 'macd', label: 'MACD' },
];

export function IndicatorSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { indicators, setIndicator } = useChartStore();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeCount = Object.values(indicators).filter(Boolean).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-1 rounded px-2 py-1 font-mono text-xs transition-colors',
          activeCount > 0
            ? 'bg-[var(--color-accent)] text-[var(--color-background)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
        )}
        title="지표 선택"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="1,9 4,5 7,7 11,2" />
        </svg>
        지표{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
          <p className="mb-1 px-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            오버레이
          </p>
          {OVERLAY_ITEMS.map(({ key, label }) => (
            <CheckRow
              key={key}
              label={label}
              checked={indicators[key]}
              onChange={(v) => setIndicator(key, v)}
            />
          ))}
          <div className="my-1.5 border-t border-[var(--color-border)]" />
          <p className="mb-1 px-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            패널
          </p>
          {PANEL_ITEMS.map(({ key, label }) => (
            <CheckRow
              key={key}
              label={label}
              checked={indicators[key]}
              onChange={(v) => setIndicator(key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 font-mono text-xs hover:bg-[var(--color-surface-elevated)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--color-accent)]"
      />
      <span className="text-[var(--color-text-secondary)]">{label}</span>
    </label>
  );
}

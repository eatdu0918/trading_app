'use client';

import type { Timeframe } from '@trading-app/core';
import { cn } from '@trading-app/ui';

const VISIBLE_TIMEFRAMES: readonly Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (next: Timeframe) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
      {VISIBLE_TIMEFRAMES.map((tf) => {
        const isActive = tf === value;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => onChange(tf)}
            className={cn(
              'cursor-pointer rounded px-2.5 py-1 font-mono text-xs transition-colors',
              isActive
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
            aria-pressed={isActive}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}

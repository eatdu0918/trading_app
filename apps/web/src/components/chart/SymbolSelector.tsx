'use client';

import type { TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { SYMBOL_PRESETS } from '@/lib/symbols';

interface SymbolSelectorProps {
  value: TradingSymbol;
  onChange: (symbol: TradingSymbol) => void;
}

export function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
      {SYMBOL_PRESETS.map((symbol) => {
        const isActive = symbol.id === value.id;
        const label = `${symbol.base}/${symbol.quote}`;
        return (
          <button
            key={symbol.id}
            type="button"
            onClick={() => onChange(symbol)}
            className={cn(
              'cursor-pointer whitespace-nowrap rounded px-3 py-1.5 font-mono text-xs font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

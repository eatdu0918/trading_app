'use client';

import type { TradingSymbol } from '@trading-app/core';
import { cn } from '@trading-app/ui';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useOptimistic, useTransition } from 'react';
import { SYMBOL_PRESETS } from '@/lib/symbols';
import { addToWatchlist, removeFromWatchlist } from '@/server/actions/watchlist';

interface WatchlistPanelProps {
  initialIds: string[];
  activeSymbolId: string;
  onSymbolClick: (symbol: TradingSymbol) => void;
}

const SYMBOL_MAP = new Map(SYMBOL_PRESETS.map((s) => [s.id, s]));

export function WatchlistPanel({ initialIds, activeSymbolId, onSymbolClick }: WatchlistPanelProps) {
  const { isSignedIn } = useAuth();
  const [, startTransition] = useTransition();

  const [watchedIds, updateOptimistic] = useOptimistic(
    initialIds,
    (prev: string[], action: { type: 'add' | 'remove'; id: string }) => {
      if (action.type === 'add') return prev.includes(action.id) ? prev : [...prev, action.id];
      return prev.filter((id) => id !== action.id);
    },
  );

  function toggle(symbol: TradingSymbol) {
    const isWatched = watchedIds.includes(symbol.id);
    startTransition(async () => {
      updateOptimistic({ type: isWatched ? 'remove' : 'add', id: symbol.id });
      if (isWatched) {
        await removeFromWatchlist(symbol.id);
      } else {
        await addToWatchlist(symbol.id);
      }
    });
  }

  const watchedSymbols = watchedIds
    .map((id) => SYMBOL_MAP.get(id))
    .filter((s): s is TradingSymbol => s !== undefined);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-3 py-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          워치리스트
        </span>
      </div>

      {!isSignedIn && (
        <p className="px-3 py-4 text-xs text-[var(--color-text-muted)]">
          로그인하면 워치리스트를 저장할 수 있습니다.
        </p>
      )}

      {/* Watched symbols */}
      {watchedSymbols.length > 0 && (
        <ul className="border-b border-[var(--color-border)] py-1">
          {watchedSymbols.map((symbol) => (
            <WatchlistRow
              key={symbol.id}
              symbol={symbol}
              isActive={symbol.id === activeSymbolId}
              isWatched
              onClick={() => onSymbolClick(symbol)}
              onToggle={() => toggle(symbol)}
            />
          ))}
        </ul>
      )}

      {/* All presets */}
      <div className="px-3 pb-1 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          Binance Spot
        </span>
      </div>
      <ul className="flex-1 overflow-y-auto py-1">
        {SYMBOL_PRESETS.map((symbol) => (
          <WatchlistRow
            key={symbol.id}
            symbol={symbol}
            isActive={symbol.id === activeSymbolId}
            isWatched={watchedIds.includes(symbol.id)}
            onClick={() => onSymbolClick(symbol)}
            onToggle={isSignedIn ? () => toggle(symbol) : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

interface WatchlistRowProps {
  symbol: TradingSymbol;
  isActive: boolean;
  isWatched: boolean;
  onClick: () => void;
  onToggle?: () => void;
}

function WatchlistRow({ symbol, isActive, isWatched, onClick, onToggle }: WatchlistRowProps) {
  return (
    <li
      className={cn(
        'group flex cursor-pointer items-center justify-between px-3 py-2 transition-colors hover:bg-[var(--color-surface-elevated)]',
        isActive && 'bg-[var(--color-surface-elevated)]',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />}
        {!isActive && <span className="h-1.5 w-1.5" />}
        <div>
          <div className="font-mono text-xs font-medium text-[var(--color-text-primary)]">
            {symbol.base}/{symbol.quote}
          </div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)]">
            {symbol.exchange}
          </div>
        </div>
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          title={isWatched ? '워치리스트에서 제거' : '워치리스트에 추가'}
          className={cn(
            'cursor-pointer rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100',
            isWatched ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            {isWatched ? (
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            ) : (
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            )}
          </svg>
        </button>
      )}
    </li>
  );
}

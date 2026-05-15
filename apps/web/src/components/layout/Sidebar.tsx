'use client';

import { cn } from '@trading-app/ui';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarProps {
  watchlist: ReactNode;
  portfolio: ReactNode;
}

const SIDEBAR_W = 220;
type SidebarTab = 'watchlist' | 'portfolio';

export function Sidebar({ watchlist, portfolio }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<SidebarTab>('watchlist');

  return (
    <aside
      style={{ width: open ? SIDEBAR_W : 40 }}
      className="relative flex h-full shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200"
    >
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={open ? '사이드바 접기' : '사이드바 펼치기'}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={cn('h-3 w-3 transition-transform', open ? 'rotate-0' : 'rotate-180')}
        >
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* Tab header */}
          <div className="flex shrink-0 border-b border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setTab('watchlist')}
              className={cn(
                'flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                tab === 'watchlist'
                  ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              관심
            </button>
            <button
              type="button"
              onClick={() => setTab('portfolio')}
              className={cn(
                'flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                tab === 'portfolio'
                  ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              포트폴리오
            </button>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === 'watchlist' ? watchlist : portfolio}
          </div>
        </>
      )}
    </aside>
  );
}

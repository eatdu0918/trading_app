'use client';

import { cn } from '@trading-app/ui';

export type MobileTab = 'chart' | 'trading' | 'watchlist';

interface MobileNavProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'watchlist',
    label: '관심',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor" stroke="none" />
        <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" stroke="none" />
        <rect x="3" y="14" width="8" height="2" rx="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'chart',
    label: '차트',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polyline points="2,15 7,9 11,12 16,5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="2" y1="18" x2="18" y2="18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'trading',
    label: '호가',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="6" height="14" rx="1" />
        <rect x="11" y="7" width="6" height="10" rx="1" />
      </svg>
    ),
  },
];

export function MobileNav({ activeTab, onChange }: MobileNavProps) {
  return (
    <nav className="flex shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors',
            activeTab === id
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </nav>
  );
}

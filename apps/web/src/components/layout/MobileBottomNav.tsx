'use client';

import { cn } from '@trading-app/ui';

export type MobilePanel = 'watchlist' | 'orderbook' | 'trades' | null;

interface MobileBottomNavProps {
  activePanel: MobilePanel;
  onPanelChange: (panel: MobilePanel) => void;
}

const NAV_ITEMS = [
  {
    id: null as MobilePanel,
    label: '차트',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'watchlist' as MobilePanel,
    label: '관심',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'orderbook' as MobilePanel,
    label: '호가창',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'trades' as MobilePanel,
    label: '체결',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
] as const;

export function MobileBottomNav({ activePanel, onPanelChange }: MobileBottomNavProps) {
  return (
    <nav className="flex shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = activePanel === item.id;
        return (
          <button
            key={String(item.id)}
            type="button"
            onClick={() => onPanelChange(isActive && item.id !== null ? null : item.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 font-mono text-[10px] tracking-wider transition-colors',
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

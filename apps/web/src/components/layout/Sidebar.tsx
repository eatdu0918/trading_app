'use client';

import { cn } from '@trading-app/ui';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

const SIDEBAR_W = 220;

export function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(true);

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

      {open && <div className="min-h-0 flex-1 overflow-hidden">{children}</div>}
    </aside>
  );
}

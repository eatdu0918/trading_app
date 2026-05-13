'use client';

import { cn } from '@trading-app/ui';
import { type DrawingMode, useChartStore } from '@/store/chart';

interface Tool {
  mode: DrawingMode;
  title: string;
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  {
    mode: 'none',
    title: '선택',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 2l8 4-4 1-2 4z" />
      </svg>
    ),
  },
  {
    mode: 'hline',
    title: '수평선',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="1" y1="6" x2="11" y2="6" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    mode: 'trendline',
    title: '추세선',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="1" y1="10" x2="11" y2="2" />
        <circle cx="1" cy="10" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="11" cy="2" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    mode: 'fibonacci',
    title: '피보나치',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="1" y1="3" x2="11" y2="3" />
        <line x1="1" y1="5.5" x2="11" y2="5.5" />
        <line x1="1" y1="8" x2="11" y2="8" strokeDasharray="2 1" />
        <line x1="1" y1="10" x2="11" y2="10" />
      </svg>
    ),
  },
];

export function DrawingToolbar() {
  const { drawingMode, setDrawingMode, clearDrawings } = useChartStore();

  return (
    <div className="flex items-center gap-0.5">
      {TOOLS.map(({ mode, title, icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setDrawingMode(mode)}
          title={title}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded transition-colors',
            drawingMode === mode
              ? 'bg-[var(--color-accent)] text-[var(--color-background)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {icon}
        </button>
      ))}
      <div className="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button
        type="button"
        onClick={clearDrawings}
        title="모든 드로잉 삭제"
        className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-bearish)]"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="2" y1="2" x2="9" y2="9" />
          <line x1="9" y1="2" x2="2" y2="9" />
        </svg>
      </button>
    </div>
  );
}

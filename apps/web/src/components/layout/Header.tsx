'use client';

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import type { TradingSymbol } from '@trading-app/core';
import { SymbolSelector } from '@/components/chart/SymbolSelector';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface HeaderProps {
  symbol: TradingSymbol;
  onSymbolChange: (s: TradingSymbol) => void;
}

export function Header({ symbol, onSymbolChange }: HeaderProps) {
  const { isSignedIn } = useAuth();

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 md:gap-3 md:px-4">
      {/* Brand */}
      <div className="flex shrink-0 items-baseline gap-3">
        <span className="hidden font-mono text-sm font-semibold tracking-widest text-[var(--color-text-primary)] sm:block">
          TRADING APP
        </span>
        <span className="font-mono text-sm font-semibold tracking-widest text-[var(--color-text-primary)] sm:hidden">
          TA
        </span>
      </div>

      {/* Symbol switcher */}
      <div className="flex min-w-0 flex-1 justify-center">
        <SymbolSelector value={symbol} onChange={onSymbolChange} />
      </div>

      {/* Auth */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] sm:block">
          Live · Binance
        </span>
        <ThemeToggle />
        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: { avatarBox: 'w-7 h-7' },
            }}
          />
        ) : (
          <SignInButton mode="modal">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-[var(--color-border)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
            >
              로그인
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}

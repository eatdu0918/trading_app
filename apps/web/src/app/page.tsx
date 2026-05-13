import { ChartView } from '@/components/chart/ChartView';
import { BTC_USDT } from '@/lib/symbols';

export default function HomePage() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm tracking-widest text-[var(--color-text-primary)]">
            TRADING APP
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            M1 · Chart MVP
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          Live · Binance
        </span>
      </header>

      <section className="flex-1 px-6 py-4">
        <ChartView symbol={BTC_USDT} initialTimeframe="1m" />
      </section>
    </main>
  );
}

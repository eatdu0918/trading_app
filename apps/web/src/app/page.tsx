import { cn } from '@trading-app/ui';

const ROADMAP = [
  { id: 'M0', title: 'Bootstrap', status: 'done', detail: '모노레포 · 디자인 시스템 셀' },
  { id: 'M1', title: '차트 MVP', status: 'next', detail: 'Lightweight Charts + Binance WS' },
  { id: 'M2', title: '계정 / 워치리스트', status: 'todo', detail: 'Clerk · 멀티 레이아웃 저장' },
  { id: 'M3', title: '가격 알림', status: 'todo', detail: 'Redpanda · 웹푸시' },
  { id: 'M4', title: '소셜 / 아이디어', status: 'todo', detail: '차트 스냅샷 · 댓글' },
  { id: 'M5', title: '스크립트 엔진', status: 'todo', detail: '축소판 Pine · 백테스트' },
  { id: 'M6', title: '모바일', status: 'todo', detail: 'Expo + TV Mobile SDK' },
] as const;

const STATUS_STYLE: Record<(typeof ROADMAP)[number]['status'], string> = {
  done: 'bg-[var(--color-bullish)]/15 text-[var(--color-bullish)] border-[var(--color-bullish)]/30',
  next: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
  todo: 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]',
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-[var(--color-text-muted)]">
          TRADING APP · M0 BOOTSTRAP
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">
          TradingView 스타일 트레이딩 플랫폼
        </h1>
        <p className="max-w-2xl text-[var(--color-text-secondary)]">
          Turborepo 모노레포 · TypeScript strict · Next.js App Router · Tailwind v4. 차트는
          Lightweight Charts에서 시작해 라이선스 발급 시 TradingView Charting Library로 교체합니다.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-widest text-[var(--color-text-secondary)]">
          ROADMAP
        </h2>
        <ol className="grid gap-3">
          {ROADMAP.map((step) => (
            <li
              key={step.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[var(--color-text-muted)]">{step.id}</span>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{step.detail}</div>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest',
                  STATUS_STYLE[step.status],
                )}
              >
                {step.status}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="text-xs text-[var(--color-text-muted)]">
        다음 단계: <span className="text-[var(--color-text-secondary)]">M1 — 차트 MVP</span>
      </footer>
    </main>
  );
}

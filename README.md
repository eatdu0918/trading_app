# Trading App

TradingView 스타일 트레이딩 플랫폼. Turborepo 모노레포 + TypeScript strict.

## 스택

- **Runtime**: Node 22
- **Package manager**: pnpm 10
- **Monorepo**: Turborepo
- **Web**: Next.js 16 (App Router) + React 19 + Tailwind v4
- **Charts (Phase 1)**: lightweight-charts (MIT) → 추후 TradingView Charting Library 교체
- **Data source (Phase 1)**: Binance public WebSocket / REST

## 구조

```
apps/
  web/                Next.js 트레이딩 UI
packages/
  config/             tsconfig / eslint 프리셋
  core/               도메인 타입 · Zod 스키마 · 상수
  datafeed/           차트 라이브러리에 비종속적인 데이터피드 추상화
  ui/                 디자인 시스템 공용 유틸 (cn, 토큰)
```

## 빠른 시작

```bash
pnpm install
pnpm dev
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 모든 앱 개발 서버 실행 |
| `pnpm build` | 전 워크스페이스 빌드 |
| `pnpm typecheck` | 전 워크스페이스 타입 검사 |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier 자동 포맷 |

## 단계 (Roadmap)

- **M0** Bootstrap — 모노레포·디자인 시스템 셀 ← 현재
- **M1** 차트 MVP — Lightweight Charts + Binance WS
- **M2** 계정 / 워치리스트 / 레이아웃 저장
- **M3** 가격 알림 (Redpanda + 웹푸시)
- **M4** 소셜 / 아이디어 공유
- **M5** 자체 스크립트 엔진
- **M6** 모바일 (Expo)

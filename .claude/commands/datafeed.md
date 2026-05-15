# /project:datafeed — DataFeed 작업

$ARGUMENTS

## DataFeed Agent: 데이터 소스 작업 프로토콜

`packages/datafeed/CLAUDE.md`의 가이드라인을 따라 위 작업을 수행하세요.

### 작업 범위

**담당**: `packages/datafeed/src/` 내 모든 파일

- Binance WebSocket 소스 (`sources/`)
- WebSocket 관리자 (`ws-manager.ts`)
- Lightweight Charts 어댑터 (`adapters/`)
- Datafeed 인터페이스 타입 (`types.ts`)

**금지**: React 컴포넌트, Core 도메인 타입 변경, Server Actions

### 실행 체크리스트

1. 관련 기존 소스 파일 검토
2. 새 소스/어댑터 구현 (`binance-xxx.ts` 패턴)
3. `index.ts` export 업데이트
4. 어댑터 단위 테스트 추가 (필요 시)
5. `pnpm typecheck` — 타입 에러 0개 확인
6. `pnpm test` — 테스트 통과 확인

### Binance 스트림 참조

```
wss://stream.binance.com:9443/ws/
  {symbol}@kline_{interval}
  {symbol}@depth20@100ms
  {symbol}@aggTrade
  {symbol}@miniTicker
  {symbol}@ticker
  {symbol}@bookTicker
```

### 완료 보고

- 새로 추가된 소스 파일
- subscribe 함수 시그니처
- Frontend Agent가 사용할 훅 구현 방법 안내

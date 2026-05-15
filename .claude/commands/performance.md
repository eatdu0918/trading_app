# /project:performance — 성능 분석 및 최적화

$ARGUMENTS

## Performance Agent 프로토콜

`agents/performance/CLAUDE.md`의 지침을 따라 성능을 분석하고 최적화하세요.

### 인수 처리

- 인수 없음: 전체 성능 감사
- `bundle`: 번들 크기 분석만
- `websocket`: WebSocket 처리 성능만
- `render`: React 렌더링 최적화만
- `report`: 최신 성능 리포트 출력

### 1단계: 현재 상태 측정

```bash
# 빌드 결과 크기 확인
pnpm build 2>&1

# 타입체크 (성능 관련 타입 패턴 확인)
pnpm typecheck
```

### 2단계: 코드 분석

다음 파일 중심으로 검토:

**WebSocket 성능**:

- `packages/datafeed/src/ws-manager.ts`
- `packages/datafeed/src/sources/binance-orderbook.ts`
- `apps/web/src/hooks/useOrderBook.ts`
- `apps/web/src/hooks/useRecentTrades.ts`

**React 렌더링**:

- `apps/web/src/components/trading/OrderBook.tsx`
- `apps/web/src/components/chart/Chart.tsx`
- `apps/web/src/store/chart.ts`

**번들 크기**:

- `apps/web/next.config.ts`
- 동적 import 사용 현황

### 3단계: 병목 식별

`agents/performance/CLAUDE.md`의 체크리스트 기준으로:

- 불필요한 리렌더 패턴
- WebSocket 메시지 배칭 부재
- 무거운 라이브러리 정적 import

### 4단계: 최적화 적용

성능 목표치 기준으로 수정:

- JS 번들 < 200KB gzipped
- WebSocket 처리 < 5ms per message
- 60fps 캔들 업데이트

### 5단계: 리포트 저장 및 요약

`agents/performance/reports/YYYY-MM-DD.md`에 저장.

```
## 성능 분석 완료

### 발견된 병목
1. [파일:라인] — [문제] — [예상 개선: Xms]

### 완료한 최적화
1. [최적화] → [결과]

### 남은 작업
1. ...
```

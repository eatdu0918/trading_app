# CLAUDE.md — Performance Agent

트레이딩 앱의 성능 병목을 식별하고 최적화하는 에이전트. 실시간 데이터 스트림 특성상 성능은 UX의 핵심이다.

---

## 역할 및 책임

**Performance Agent**는 다음을 담당합니다:

1. 번들 크기 분석 및 코드 스플리팅 최적화
2. WebSocket 메시지 처리 성능 측정
3. React 렌더링 최적화 (불필요한 리렌더 제거)
4. Core Web Vitals 측정 및 개선
5. Lightweight Charts 렌더링 성능 튜닝
6. 성능 회귀(regression) 탐지

---

## 성능 목표치 (Targets)

### Core Web Vitals

| 지표    | 목표    | 설명            |
| ------- | ------- | --------------- |
| LCP     | < 2.5s  | 첫 차트 렌더링  |
| FID/INP | < 200ms | 심볼 전환 반응  |
| CLS     | < 0.1   | 레이아웃 시프트 |
| TTFB    | < 800ms | 서버 응답       |

### 앱별 성능 지표

| 지표                  | 목표              |
| --------------------- | ----------------- |
| JS 번들 (초기)        | < 200KB gzipped   |
| WebSocket 메시지 처리 | < 5ms per message |
| 캔들 업데이트 주기    | 60fps 유지        |
| 심볼 전환 시간        | < 300ms           |
| 호가창 업데이트       | < 16ms (1 frame)  |

---

## 분석 도구 및 명령어

### 번들 분석

```bash
# Next.js 번들 분석기
cd apps/web
ANALYZE=true pnpm build

# 빌드 결과 크기 확인
pnpm build 2>&1 | grep -E "First Load JS|chunks"
```

### 성능 프로파일링

```bash
# Lighthouse CI (있다면)
npx lighthouse http://localhost:3000 --output=json

# 빌드 시간 측정
time pnpm build
```

### WebSocket 성능 체크 포인트

`packages/datafeed/src/ws-manager.ts` — 연결 관리
`packages/datafeed/src/sources/binance.ts` — 메시지 파싱
`apps/web/src/hooks/useOrderBook.ts` — 상태 업데이트 빈도

---

## 최적화 패턴

### 1. React 렌더링 최적화

```typescript
// ❌ 매 WebSocket 메시지마다 전체 리렌더
const [orderBook, setOrderBook] = useState(data);

// ✅ 필요한 부분만 업데이트
const priceRef = useRef(price);
// chart API 직접 호출 (React state 우회)
candleSeries.update(candle);
```

### 2. 호가창 가상화

현재: 전체 렌더링
목표: 보이는 행만 렌더 (`react-virtual` 또는 CSS clip)

### 3. WebSocket 메시지 배칭

```typescript
// ❌ 매 메시지마다 setState
ws.onmessage = (e) => setState(parse(e));

// ✅ requestAnimationFrame으로 배칭
let pending = null;
ws.onmessage = (e) => {
  pending = parse(e);
};
const tick = () => {
  if (pending) {
    setState(pending);
    pending = null;
  }
  raf(tick);
};
raf(tick);
```

### 4. 코드 스플리팅 포인트

```typescript
// 무거운 컴포넌트 동적 import
const Chart = dynamic(() => import('@/components/chart/Chart'), { ssr: false });
const IndicatorSelector = dynamic(() => import('./IndicatorSelector'));
```

---

## 성능 리포트 형식

저장 위치: `agents/performance/reports/YYYY-MM-DD.md`

```markdown
# Performance Report — [날짜]

## 측정 환경

- Next.js 버전: X.X
- 테스트 조건: [개발/프로덕션], [네트워크 조건]

## 번들 크기

| 청크          | 현재  | 이전  | 변화   |
| ------------- | ----- | ----- | ------ |
| First Load JS | XX KB | XX KB | ±XX KB |

## 병목 발견

### [문제명]

- **위치**: `파일:라인`
- **측정값**: XXms
- **원인**: ...
- **해결 방안**: ...

## 완료한 최적화

- [최적화 항목] → [개선 결과]

## 다음 우선순위 최적화

1. ...
```

---

## 회귀 탐지 체크리스트

PR 리뷰 시 다음 확인:

- [ ] `useEffect` 의존성 배열이 너무 넓지 않은가
- [ ] 컴포넌트가 불필요하게 매 렌더마다 객체/함수를 새로 생성하는가
- [ ] WebSocket 메시지 핸들러에서 과도한 연산이 있는가
- [ ] Lightweight Charts `update()` 호출 빈도가 60fps를 초과하는가
- [ ] 동적 import가 필요한 무거운 라이브러리가 초기 번들에 포함되는가

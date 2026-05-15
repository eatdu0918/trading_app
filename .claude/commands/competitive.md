# /project:competitive — 경쟁 제품 분석

$ARGUMENTS

## Competitive Intelligence Agent 프로토콜

`agents/competitive/CLAUDE.md`의 지침을 따라 경쟁 제품을 분석하세요.

### 분석 대상 (인수 없으면 TradingView 우선)

인수 예시:

- `tradingview` → TradingView 심층 분석
- `all` → 전체 Tier 1 경쟁사 분석
- `mobile` → 모바일 앱 경험 비교

### 1단계: 기능 매트릭스 수집

WebSearch로 다음 검색:

```
[제품명] new features 2024 2025
[제품명] pricing plans comparison
[제품명] vs TradingView reddit
"[제품명]" mobile app review site:reddit.com
```

### 2단계: 사용자 피드백 수집

```
site:reddit.com "[제품명]" (missing OR wish OR should OR annoying)
"[제품명]" review site:g2.com OR site:trustpilot.com
```

### 3단계: 차별화 매핑

우리 앱(M0-M4 기능)과 비교하여:

- 우리가 이미 갖춘 것
- 우리가 부족한 것
- 경쟁사도 없는 틈새 기회

### 4단계: 리포트 저장

`agents/competitive/reports/YYYY-MM-DD-[제품명].md`에 저장.

### 5단계: 요약 출력

```
## 경쟁 분석 완료: [제품명]

### 우리가 더 잘하는 것
1. ...

### 따라야 할 기능 (Quick Wins)
1. ...

### 전략적 차별화 기회
1. ...

### PM Agent 전달 권장 항목
- /project:pm [기능명]
```

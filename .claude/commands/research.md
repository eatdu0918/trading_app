# /project:research — 외부 커뮤니티 리서치

$ARGUMENTS

## Research Agent 프로토콜

`agents/research/CLAUDE.md`의 지침을 따라 외부 커뮤니티에서 트레이딩 플랫폼 불편사항을 조사하세요.

### 1단계: 조사 범위 설정

인수($ARGUMENTS)가 있으면 해당 주제에 집중. 없으면 전체 범위 조사.

예시 인수:

- `mobile` → 모바일 UX 관련 불편사항만
- `performance` → 성능 이슈만
- `indicators` → 기술 지표 관련 요청만

### 2단계: WebSearch 실행

다음 쿼리로 순차 검색:

```
site:reddit.com "TradingView" (frustrating OR slow OR missing OR wish)
site:reddit.com "crypto trading app" (mobile OR chart OR orderbook) complaint
site:news.ycombinator.com trading platform alternative 2024
"TradingView alternative" site:reddit.com
github.com tradingview issues 2024
```

### 3단계: 결과 분류 및 저장

`agents/research/findings/` 디렉토리가 없으면 생성 후,
`YYYY-MM-DD-[topic].md` 형식으로 저장.

### 4단계: 요약 출력

터미널에 다음 형식으로 출력:

```
## 리서치 완료: [주제]

### 상위 5개 불편사항
1. [문제] — 빈도: [높음/중간/낮음] — 우리앱: [해결/미해결]
2. ...

### 즉시 구현 가능한 기능 (난이도 낮음)
- ...

### PM Agent 전달 권장 항목
- ...

### 저장 위치: agents/research/findings/[파일명]
```

### 5단계: PM Agent 호출 제안

리서치 완료 후: "PM Agent에 전달하려면 `/project:pm [findings-파일명]` 실행"

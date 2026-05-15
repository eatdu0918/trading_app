# /project:pm — 제품 기획 및 우선순위 결정

$ARGUMENTS

## PM Agent 프로토콜

`agents/pm/CLAUDE.md`의 지침을 따라 기능 기획 및 우선순위를 결정하세요.

### 인수 처리

- 인수 없음: 전체 백로그 리뷰 및 다음 스프린트 제안
- `[기능명]` 입력: 해당 기능의 PRD 작성
- `backlog`: 현재 백로그 상태 출력
- `roadmap`: 마일스톤 로드맵 출력
- `from-research [파일명]`: research findings 파일에서 기능 추출

### 1단계: 컨텍스트 로드

```
- agents/pm/backlog.md 읽기 (있다면)
- agents/research/findings/ 최신 파일 확인
- agents/competitive/reports/ 최신 파일 확인
- CLAUDE.md의 마일스톤 이력 확인
```

### 2단계: 기능 후보 목록 작성

리서치/경쟁 분석에서 기능 후보 추출 후 ICE 점수 산출:

- Impact (1-10): 사용자 가치
- Confidence (1-10): 구현 필요성 확신
- Effort (1-10, 높을수록 쉬움): 구현 용이성

### 3단계: 백로그 업데이트

`agents/pm/backlog.md` 업데이트 (없으면 생성).

### 4단계: 다음 스프린트 계획

ICE 상위 3-5개 기능으로 스프린트 구성.
각 기능에 대해:

- 영향 패키지 (core/datafeed/web)
- 크기 추정 (XS/S/M/L/XL)
- UI 있으면 `/project:design [기능명]` 호출 권장

### 5단계: 출력

```
## PM 리포트

### 다음 스프린트 추천 기능 (ICE 순)
1. [기능명] — ICE: XX — 크기: M
   담당: Frontend Agent
   Design 필요: 예/아니오

### 백로그 추가 항목
- [기능명] — ICE: XX (대기)

### 저장 위치: agents/pm/backlog.md
```

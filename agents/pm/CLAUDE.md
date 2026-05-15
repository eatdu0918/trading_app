# CLAUDE.md — Product Manager Agent

Research Agent와 Competitive Intelligence Agent의 인사이트를 구체적인 기능 스펙과 우선순위 백로그로 변환하는 에이전트.

---

## 역할 및 책임

**PM Agent**는 다음을 담당합니다:

1. Research/Competitive 인사이트를 기능 제안서(PRD)로 변환
2. ICE 스코어링으로 기능 우선순위 결정
3. 스프린트 로드맵 관리 (`agents/pm/roadmap.md`)
4. 기능 스펙을 Design Agent 및 Orchestrator에 전달

---

## 입력 소스

- `agents/research/findings/*.md` — 사용자 불편사항
- `agents/competitive/reports/*.md` — 경쟁 분석
- 직접 사용자 요청

---

## 우선순위 프레임워크: ICE Score

```
Impact    (1-10): 사용자에게 얼마나 큰 가치인가?
Confidence(1-10): 이 기능이 실제로 원하는 것이라는 확신?
Effort    (1-10, 낮을수록 좋음): 구현 비용 (10 = 매우 쉬움, 1 = 매우 어려움)

ICE = Impact × Confidence × Effort
```

### 기술 복잡도 분류

| 레벨 | 정의                | Effort 점수 |
| ---- | ------------------- | ----------- |
| XS   | 스타일/텍스트 변경  | 9-10        |
| S    | 단순 컴포넌트 추가  | 7-8         |
| M    | 새 훅 + 컴포넌트    | 5-6         |
| L    | 새 패키지 기능 + UI | 3-4         |
| XL   | 아키텍처 변경       | 1-2         |

---

## 백로그 관리

### 백로그 파일 위치

`agents/pm/backlog.md` — 전체 기능 백로그
`agents/pm/roadmap.md` — 마일스톤별 로드맵
`agents/pm/sprints/YYYY-MM-DD.md` — 스프린트별 계획

### 백로그 항목 형식

```markdown
## [기능명]

**출처**: Research / Competitive / 사용자 요청
**ICE Score**: Impact(X) × Confidence(X) × Effort(X) = XX
**크기**: XS/S/M/L/XL
**상태**: 제안 / 승인 / 진행중 / 완료

### 문제 정의

[어떤 사용자가, 어떤 상황에서, 무엇이 불편한가]

### 제안 솔루션

[구체적인 구현 방향]

### 완료 기준 (Definition of Done)

- [ ] 구체적인 완료 조건 1
- [ ] 구체적인 완료 조건 2

### 영향 범위

- Core 변경: 있음/없음
- DataFeed 변경: 있음/없음
- Frontend 변경: 컴포넌트 목록
- DB 변경: 있음/없음
```

---

## PRD 생성 프로토콜

리서치 파일을 받으면 다음 순서로 처리:

1. **파싱**: 불편사항에서 "기능 요청" 추출
2. **중복 제거**: 비슷한 요청 병합
3. **ICE 평가**: 각 기능 점수 산출
4. **백로그 업데이트**: `agents/pm/backlog.md`에 추가
5. **스프린트 제안**: 상위 ICE 항목을 다음 스프린트에 배치
6. **Design Agent 호출 제안**: UI 변경이 있는 항목은 `/project:design [기능명]` 권장

---

## 마일스톤 계획

현재까지 완료: M0-M4

### M5 후보 기능 (ICE 상위)

| 기능                   | Impact | Confidence | Effort | ICE |
| ---------------------- | ------ | ---------- | ------ | --- |
| 커스텀 지표 스크립트   | 9      | 7          | 3      | 189 |
| 알림 Push Notification | 8      | 9          | 6      | 432 |
| 다중 거래소 지원       | 9      | 6          | 2      | 108 |
| 차트 스냅샷 공유       | 7      | 8          | 7      | 392 |
| 백테스팅 기본 기능     | 8      | 6          | 2      | 96  |

_(초기값, 리서치 결과에 따라 업데이트)_

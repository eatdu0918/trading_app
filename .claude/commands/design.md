# /project:design — UI/UX 설계 스펙 작성

$ARGUMENTS

## Design Agent 프로토콜

`agents/design/CLAUDE.md`의 지침을 따라 기능의 UI/UX 스펙을 작성하세요.

### 인수 처리

인수 = 설계할 기능명 (예: "push-notifications", "backtesting-ui", "custom-indicators")

### 1단계: 컨텍스트 수집

```
- agents/pm/backlog.md에서 해당 기능의 PRD 찾기
- apps/web/src/app/globals.css에서 현재 CSS 변수 확인
- apps/web/src/components/ 디렉토리 구조 파악
- 관련 기존 컴포넌트 읽기 (유사 컴포넌트 참고)
```

### 2단계: 레이아웃 설계

다음을 ASCII 다이어그램으로 설계:

- 데스크톱 (≥768px) 레이아웃에서의 위치
- 모바일 (<768px) 레이아웃에서의 위치
- 기존 3단 레이아웃에 어떻게 통합되는지

### 3단계: 컴포넌트 분해

새로 만들 컴포넌트 목록:

- 컴포넌트명, 파일 경로
- Props 인터페이스 (TypeScript)
- 내부 상태 vs 전역 상태 구분
- Zustand store 업데이트 필요 여부

### 4단계: 디자인 시스템 적용

- CSS 변수 매핑 (`var(--color-*)`)
- 기존 패턴 재사용 여부 확인
- 새 CSS 변수 필요 시 globals.css `@theme` 블록에 추가

### 5단계: 스펙 저장 및 출력

`agents/design/specs/[feature-name].md`에 저장 후:

```
## Design Spec 완료: [기능명]

### 새 컴포넌트
- ComponentA → apps/web/src/components/[category]/ComponentA.tsx
- ComponentB → ...

### 수정할 기존 컴포넌트
- ExistingComponent → [변경 내용 요약]

### 상태 변경
- Zustand store: [변경사항]

### Frontend Agent 전달 명령
/project:frontend [기능명]

### 스펙 저장 위치
agents/design/specs/[feature-name].md
```

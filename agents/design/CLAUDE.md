# CLAUDE.md — Design Agent

PM Agent의 기능 스펙을 구체적인 UI/UX 설계로 변환하고, Frontend Agent가 바로 구현할 수 있는 컴포넌트 스펙을 생성하는 에이전트.

---

## 역할 및 책임

**Design Agent**는 다음을 담당합니다:

1. PM PRD를 받아 UI/UX 스펙 문서 작성
2. 컴포넌트 계층 구조 및 상태 설계
3. 모바일/데스크톱 반응형 레이아웃 설계
4. 디자인 시스템 일관성 검토 및 확장
5. 접근성 (A11y) 요구사항 명시

---

## 디자인 시스템 컨텍스트

### 색상 시스템 (globals.css @theme)

현재 CSS 변수 구조:

```
--color-bg-primary       # 메인 배경
--color-bg-secondary     # 패널 배경
--color-surface          # 카드/컨테이너
--color-border           # 구분선
--color-text-primary     # 주요 텍스트
--color-text-secondary   # 보조 텍스트
--color-text-muted       # 비활성 텍스트
--color-accent           # 강조색 (파란계열)
--color-success          # 상승 (초록)
--color-danger           # 하락 (빨강)
--color-warning          # 경고 (노랑)
```

**규칙**: Tailwind arbitrary value보다 `var(--color-*)` 직접 사용.

### 레이아웃 브레이크포인트

```
< 768px (md): 모바일 — 하단 탭 네비게이션
≥ 768px (md): 데스크톱 — 3단 레이아웃
  Sidebar(240px) | ChartGrid(flex-1) | TradingPanel(320px)
```

### 컴포넌트 패턴

- **패널**: `bg-[var(--color-surface)] border border-[var(--color-border)]`
- **헤더**: `text-xs text-[var(--color-text-secondary)] uppercase tracking-wider`
- **버튼 기본**: `px-3 py-1.5 rounded text-sm`
- **버튼 강조**: `+ bg-[var(--color-accent)] text-white`

---

## 스펙 문서 형식

저장 위치: `agents/design/specs/[feature-name].md`

````markdown
# Design Spec: [기능명]

## 개요

[한 줄 설명]

## 사용자 스토리

As a [사용자], I want to [행동], so that [목적].

## 화면 설계

### 데스크톱 레이아웃

[ASCII 아트 또는 구조 설명]

### 모바일 레이아웃

[모바일 특화 설계]

## 컴포넌트 분해

### [ComponentName]

- **위치**: `apps/web/src/components/[category]/[Name].tsx`
- **Props**:
  ```typescript
  interface [Name]Props {
    prop1: type;
    prop2?: type;
  }
  ```
````

- **상태**: [로컬 useState / Zustand store]
- **동작**: [인터랙션 설명]

## 상태 관리 설계

### Zustand Store 업데이트

[필요한 경우 스토어 구조 제안]

## 접근성 (A11y)

- [ ] 키보드 내비게이션
- [ ] ARIA 레이블
- [ ] 색상 대비 비율 4.5:1 이상
- [ ] 스크린리더 호환

## 애니메이션/전환

[CSS 전환 또는 Framer Motion 스펙]

## 엣지 케이스

- 빈 데이터 상태
- 로딩 상태
- 에러 상태
- 모바일 터치 동작

## Frontend Agent 체크리스트

- [ ] Tailwind v4 CSS 변수 사용
- [ ] `noUncheckedIndexedAccess` 대응
- [ ] WebSocket 탭 전환 시 `hidden` 처리
- [ ] chart.remove() cleanup

```

---

## 디자인 리뷰 프로토콜

기존 컴포넌트 변경 시:
1. 현재 컴포넌트 읽기 (Read tool)
2. 변경이 디자인 시스템에 미치는 영향 체크
3. 다른 컴포넌트와 일관성 확인
4. 스펙 문서에 변경 사항 반영

---

## 금지 사항

- `tailwind.config.js`에 새 색상 추가 금지 (globals.css에만)
- 하드코딩된 색상값 (`#fff`, `rgb(...)`) 금지 — CSS 변수 사용
- 모바일 레이아웃 무시 금지 — 모든 스펙에 모바일 섹션 필수
```

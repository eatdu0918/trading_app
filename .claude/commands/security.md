# /project:security — 보안 감사

$ARGUMENTS

## Security Agent 프로토콜

`agents/security/CLAUDE.md`의 지침을 따라 보안 감사를 수행하세요.

### 인수 처리

- 인수 없음: 전체 보안 감사
- `deps`: 의존성 취약점만
- `auth`: 인증/인가 검토만
- `websocket`: WebSocket 보안만
- `env`: 환경변수/API 키 노출 검사만

### 1단계: 의존성 취약점 스캔

```bash
pnpm audit
```

### 2단계: 코드 보안 검토

다음 파일 중심으로 검토:

**인증**:

- `apps/web/src/middleware.ts` — 보호된 라우트
- `apps/web/src/server/actions/*.ts` — Server Action 인증 체크

**데이터 검증**:

- `packages/datafeed/src/sources/*.ts` — WS 메시지 파싱
- `packages/core/src/*.ts` — Zod 스키마 검증

**환경변수**:

- `.env.local.example` — 모든 변수 문서화 확인
- `apps/web/next.config.ts` — NEXT*PUBLIC* 변수 노출 확인

### 3단계: 보안 패턴 체크

`agents/security/CLAUDE.md`의 체크리스트 실행:

- [ ] 모든 Server Action에 auth() 체크
- [ ] WebSocket 데이터 Zod 검증
- [ ] eval() 없음
- [ ] dangerouslySetInnerHTML 없음
- [ ] SQL 파라미터 바인딩 (Drizzle ORM)

### 4단계: 리포트 저장 및 요약

`agents/security/reports/YYYY-MM-DD.md`에 저장.

```
## 보안 감사 완료

### 발견된 취약점
1. [취약점] — 심각도: [Critical/High/Medium/Low]
   위치: 파일:라인
   수정 방안: ...

### 의존성 취약점
[pnpm audit 결과]

### 권장 개선사항
1. ...

### 전체 통과 항목
✅ 인증 체크, ✅ WS 검증, ...
```

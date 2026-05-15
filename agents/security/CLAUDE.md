# CLAUDE.md — Security Agent

트레이딩 앱의 보안 취약점을 식별하고 방어적 코딩 패턴을 적용하는 에이전트.

---

## 역할 및 책임

**Security Agent**는 다음을 담당합니다:

1. 정기적인 보안 감사 (코드 리뷰 관점)
2. OWASP Top 10 취약점 체크
3. 트레이딩 앱 특화 보안 위협 모니터링
4. 의존성 취약점 스캔 (`pnpm audit`)
5. Clerk 인증 설정 검토
6. 환경변수/API 키 노출 방지

---

## 트레이딩 앱 특화 보안 위협

### 1. WebSocket 보안

```
위협: 악의적 WebSocket 메시지로 인한 XSS
체크:
  - 수신 데이터의 타입 검증 (Zod 스키마 활용)
  - innerHTML 사용 금지
  - 숫자 데이터는 parseFloat/parseInt 후 사용
```

### 2. API 키 노출

```
위협: 클라이언트 코드에 API 키 하드코딩
체크:
  - process.env.NEXT_PUBLIC_* 변수는 클라이언트에 노출됨
  - 비밀 키는 서버 전용 환경변수로만 사용
  - .env.local이 git에 포함되지 않았는지 확인
```

### 3. Server Actions 보안

```typescript
// apps/web/src/server/actions/watchlist.ts
// ✅ 필수: 모든 Server Action에 인증 체크
import { auth } from '@clerk/nextjs/server';
export async function addToWatchlist(symbol: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  // ...
}
```

### 4. Input Validation

```
위협: 악의적 심볼 이름으로 인한 인젝션
체크:
  - 심볼 입력은 허용 목록(allowlist)으로 검증
  - packages/core/src/symbol.ts의 Symbol 타입 활용
  - URL 파라미터로 전달되는 심볼 검증
```

### 5. Rate Limiting

```
위협: Binance API 한도 초과로 인한 IP 차단
체크:
  - WebSocket 재연결 exponential backoff 적용 여부
  - REST API 호출 빈도 제한
  - 동시 구독 스트림 수 관리
```

---

## 보안 감사 체크리스트

### 매 PR 체크

- [ ] 새로운 환경변수가 `.env.local.example`에 문서화됨
- [ ] `NEXT_PUBLIC_` 변수에 비밀 값 없음
- [ ] 새 Server Action에 `auth()` 체크 있음
- [ ] 외부 데이터(WS 메시지, URL params) Zod 검증
- [ ] `dangerouslySetInnerHTML` 사용 없음
- [ ] SQL 쿼리에 파라미터 바인딩 사용 (Drizzle ORM이 처리)

### 월간 체크

```bash
# 의존성 취약점 스캔
pnpm audit

# 취약점 자동 수정 (호환성 주의)
pnpm audit --fix
```

### Clerk 설정 검토

- `middleware.ts`에서 보호된 라우트 목록 확인
- 워치리스트 API가 인증 없이 접근 불가한지 확인
- 세션 만료 정책 적절한지 확인

---

## 보안 리포트 형식

저장 위치: `agents/security/reports/YYYY-MM-DD.md`

```markdown
# Security Audit Report — [날짜]

## 감사 범위

[검토한 파일/기능 목록]

## 발견된 취약점

### [취약점명] — 심각도: Critical/High/Medium/Low

- **위치**: `파일:라인`
- **설명**: ...
- **공격 시나리오**: ...
- **수정 방안**: ...
- **상태**: 발견 / 수정중 / 완료

## 의존성 취약점

[pnpm audit 결과 요약]

## 권장 사항

[비취약점이지만 개선 권장 항목]
```

---

## 금지 사항 (절대 허용 안됨)

- `eval()` 사용
- 사용자 입력을 SQL 쿼리에 직접 삽입
- 클라이언트 코드에 DB 연결 문자열
- WebSocket 수신 데이터를 검증 없이 DOM에 삽입
- `crypto.subtle` 없이 클라이언트에서 암호화 처리

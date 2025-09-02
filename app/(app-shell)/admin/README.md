# Admin 페이지 설정 가이드

## 🔐 보안 설정

### 1. 환경변수 설정 (선택사항)

`.env.local` 파일에 다음 환경변수를 추가하여 특정 이메일만 admin 접근을 허용할 수 있습니다:

```bash
# 특정 이메일만 admin 접근 허용 (쉼표로 구분)
ADMIN_EMAILS=admin@example.com,superuser@example.com

# 또는 단일 이메일
ADMIN_EMAILS=admin@example.com
```

**주의사항:**

- 환경변수를 설정하지 않으면 모든 인증된 사용자가 admin에 접근할 수 있습니다.
- 환경변수를 설정하면 지정된 이메일만 admin에 접근할 수 있습니다.

### 2. 보안 기능

#### 기본 보안

- ✅ 인증되지 않은 사용자는 `/login` 페이지로 리다이렉트
- ✅ 세션 만료 시 자동 로그아웃
- ✅ 모든 admin 접근 시도 로깅

#### 고급 보안 (환경변수 설정 시)

- ✅ 특정 이메일만 admin 접근 허용
- ✅ 권한이 없는 사용자는 홈페이지로 리다이렉트
- ✅ 접근 거부 시 상세 로깅

### 3. 로깅

미들웨어에서 다음 정보를 로깅합니다:

```
[ADMIN_ACCESS] 2024-01-01T12:00:00.000Z - Email: user@example.com, Path: /admin, User-Agent: Mozilla/5.0...
[ADMIN_ACCESS_DENIED] Unauthenticated access attempt to /admin
[ADMIN_ACCESS_DENIED] Unauthorized user user@example.com attempted to access admin area
```

### 4. 접근 제어 흐름

```
사용자 → /admin 접근 시도
    ↓
1. 인증 상태 확인
    ↓
2. 인증되지 않은 경우 → /login으로 리다이렉트
    ↓
3. 인증된 경우 → 추가 권한 검증
    ↓
4. ADMIN_EMAILS 환경변수 확인
    ↓
5. 설정되지 않은 경우 → 모든 인증된 사용자 허용
    ↓
6. 설정된 경우 → 지정된 이메일만 허용
    ↓
7. 권한이 없는 경우 → 홈페이지로 리다이렉트
    ↓
8. 권한이 있는 경우 → admin 페이지 접근 허용
```

### 5. 문제 해결

#### 일반적인 문제

**Q: admin 페이지에 접근할 수 없습니다.**
A: 로그인 상태를 확인하고, 환경변수가 설정된 경우 이메일이 허용 목록에 포함되어 있는지 확인하세요.

**Q: 로그인했는데도 admin에 접근할 수 없습니다.**
A: 환경변수 `ADMIN_EMAILS`에 현재 로그인한 이메일이 포함되어 있는지 확인하세요.

**Q: 환경변수를 변경했는데 적용되지 않습니다.**
A: Next.js 개발 서버를 재시작하세요. 환경변수는 서버 시작 시에만 로드됩니다.

### 6. 개발 환경 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 환경변수 편집
nano .env.local

# 개발 서버 재시작
npm run dev
```

### 7. 프로덕션 환경 설정

Vercel, Netlify 등의 플랫폼에서 환경변수를 설정하세요:

```bash
# Vercel CLI 사용
vercel env add ADMIN_EMAILS

# 또는 웹 대시보드에서 설정
# Settings → Environment Variables
```

## 📝 참고사항

- 이 설정은 미들웨어 레벨에서 작동하므로 모든 admin 경로에 적용됩니다.
- 환경변수를 설정하지 않으면 기존과 동일하게 작동합니다.
- 보안을 강화하려면 `ADMIN_EMAILS` 환경변수를 설정하는 것을 권장합니다.

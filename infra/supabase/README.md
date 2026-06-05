# Supabase self-host 운영 묶음

`blog-supabase.jongchoi.com`에서 self-host Supabase를 띄우기 위한 Docker Compose 구성입니다. 기본 구성은 Supabase 공식 Docker compose를 기준으로 하며, 이 프로젝트에 맞춰 Google OAuth, Nginx Proxy Manager 네트워크, MinIO S3 backend를 연결합니다.

## 1. 환경변수 준비

```bash
cp infra/supabase/.env.example infra/supabase/.env
```

`infra/supabase/.env`에서 아래 값은 반드시 실제 값으로 교체합니다.

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `DASHBOARD_USERNAME`
- `DASHBOARD_PASSWORD`
- `SECRET_KEY_BASE`
- `VAULT_ENC_KEY`
- `PG_META_CRYPTO_KEY`
- `S3_PROTOCOL_ACCESS_KEY_ID`
- `S3_PROTOCOL_ACCESS_KEY_SECRET`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID`
- `GOTRUE_EXTERNAL_GOOGLE_SECRET`

도메인 관련 값은 아래 기준으로 고정합니다.

```env
SITE_URL=https://blog.jongchoi.com
API_EXTERNAL_URL=https://blog-supabase.jongchoi.com
SUPABASE_PUBLIC_URL=https://blog-supabase.jongchoi.com
ADDITIONAL_REDIRECT_URLS=https://blog.jongchoi.com/callback,http://localhost:3000/callback
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://blog-supabase.jongchoi.com/auth/v1/callback
```

## 2. Compose 확인과 실행

Nginx Proxy Manager가 붙을 Docker network가 없다면 먼저 만듭니다.

```bash
docker network create npm-network
```

Compose 설정을 확인합니다.

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  config
```

Supabase와 MinIO를 실행합니다.

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  up -d
```

## 3. Nginx Proxy Manager 연결

NPM에서 Proxy Host를 추가합니다.

- Domain: `blog-supabase.jongchoi.com`
- Forward Hostname / IP: `supabase-kong`
- Forward Port: `8000`
- SSL: Let's Encrypt 발급
- Websockets Support: enabled

연결 후 아래 엔드포인트가 응답하는지 확인합니다.

```bash
curl https://blog-supabase.jongchoi.com/auth/v1/health
```

## 4. Google OAuth

Google Cloud Console의 OAuth Client에 아래 Authorized redirect URI를 등록합니다.

```text
https://blog-supabase.jongchoi.com/auth/v1/callback
```

앱의 로그인 코드는 `redirectTo: ${window.location.origin}/callback`을 사용하므로 변경하지 않습니다. self-host 이전 후 기존 Supabase Cloud 세션은 새 JWT와 맞지 않아서 다시 로그인해야 합니다.

## 5. DB dump / restore

Cloud Supabase에서 dump를 생성합니다.

```bash
CLOUD_DB_URL="postgres://..." scripts/supabase/dump.sh
```

생성되는 dump의 역할은 아래와 같습니다.

- `roles.sql`: custom role과 권한
- `schema.sql`: table, view, function, trigger, index, RLS policy 등 DB 구조
- `data.sql`: table row, `auth.users`, Storage bucket metadata 등 데이터

DB dump에는 Storage 실제 파일, OAuth provider env, JWT/API key, SMTP, Edge Functions, DNS 설정은 포함되지 않습니다.

self-host DB로 복원합니다.

```bash
scripts/supabase/restore.sh
```

기본 복원 URL은 `infra/supabase/.env`의 `POSTGRES_PASSWORD`, `POOLER_TENANT_ID`와 `blog-supabase.jongchoi.com:5432`로 만들어집니다. 다른 DB 주소를 쓰려면 `SELF_HOSTED_DB_URL`을 직접 넘깁니다.

복원 후에는 source/self-hosted 인벤토리를 비교합니다.

```bash
scripts/supabase/verify-db.sh
```

이 스크립트는 extension, public table/view/function/trigger, RLS policy, `auth.users` 수, Storage bucket metadata를 확인합니다.

## 6. Storage 이전

Supabase Cloud Dashboard의 Storage S3 Configuration에서 access key를 발급한 뒤 실행합니다.

```bash
PLATFORM_S3_ENDPOINT="https://<project-ref>.supabase.co/storage/v1/s3" \
PLATFORM_S3_REGION="<cloud-region>" \
PLATFORM_S3_ACCESS_KEY_ID="<cloud-access-key>" \
PLATFORM_S3_SECRET_ACCESS_KEY="<cloud-secret-key>" \
scripts/supabase/sync-storage.sh
```

기본 bucket은 `image`입니다. 전체 bucket을 복사하려면 `BUCKET=all`을 추가합니다.

## 7. 앱 전환 체크

앱 배포 환경변수를 self-host 값으로 바꿉니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://blog-supabase.jongchoi.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<self-host anon key>
SUPABASE_SERVICE_ROLE_KEY=<self-host service role key>
```

전환 후 확인할 항목은 Google OAuth 로그인, 이미지 업로드, 게시글 이미지 렌더링, semantic search RPC, admin 조회입니다.

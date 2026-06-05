# Supabase Self-Hosting 이전 가이드

이 문서는 기존 Supabase Cloud 프로젝트를 `blog-supabase.jongchoi.com`에서 동작하는 self-hosted Supabase로 옮기기 위한 작업 노트이다.

기존 `public/tutorials/8-gemma4.md`는 Gemma/Ollama 전환 메모로 그대로 두고, 이 문서는 Supabase self-hosting만 따로 다룬다.

## 1. 목표

이번 이전의 목표는 아래와 같다.

1. Supabase API, Auth, Storage, Studio를 Docker Compose로 띄운다.
2. 공개 주소는 `https://blog-supabase.jongchoi.com`으로 사용한다.
3. 블로그 앱 주소는 기존처럼 `https://blog.jongchoi.com`을 유지한다.
4. Google OAuth 로그인 후 블로그 앱의 `/callback`으로 돌아오게 만든다.
5. Storage는 MinIO S3 backend를 사용한다.
6. 기존 Cloud Supabase의 DB와 Storage 파일을 self-hosted Supabase로 옮긴다.

이 프로젝트에서는 이를 위해 아래 파일들을 추가했다.

```text
infra/
└─ supabase/
   ├─ compose.yaml
   ├─ compose.minio.yaml
   ├─ .env.example
   ├─ README.md
   └─ volumes/

scripts/
└─ supabase/
   ├─ dump.sh
   ├─ restore.sh
   └─ sync-storage.sh
```

## 2. 구성 개요

`infra/supabase/compose.yaml`은 Supabase 공식 Docker self-host compose를 기반으로 한다.

주요 서비스는 아래와 같다.

- `kong`: 외부 요청을 Auth, REST, Storage, Studio 등으로 라우팅하는 API gateway
- `auth`: Supabase Auth, Google OAuth 처리를 담당
- `rest`: PostgREST API
- `storage`: Supabase Storage API
- `db`: PostgreSQL
- `supavisor`: DB pooler
- `studio`: Supabase Dashboard
- `realtime`: Realtime 서버
- `functions`: Edge Functions 런타임

`infra/supabase/compose.minio.yaml`은 Storage backend를 MinIO로 바꾸는 override 파일이다.

```yaml
storage:
  environment:
    STORAGE_BACKEND: s3
    GLOBAL_S3_ENDPOINT: http://minio:9000
    GLOBAL_S3_PROTOCOL: http
    GLOBAL_S3_FORCE_PATH_STYLE: true
```

Next.js 앱 입장에서는 Storage가 로컬 파일인지 MinIO인지 신경 쓰지 않는다. 앱은 계속 Supabase URL만 호출한다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://blog-supabase.jongchoi.com
```

## 3. 환경변수 준비

먼저 예시 env를 실제 env로 복사한다.

```bash
cp infra/supabase/.env.example infra/supabase/.env
```

`infra/supabase/.env`에서 반드시 바꿔야 하는 값은 아래와 같다.

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

도메인 관련 값은 아래 기준으로 맞춘다.

```env
SITE_URL=https://blog.jongchoi.com
API_EXTERNAL_URL=https://blog-supabase.jongchoi.com
SUPABASE_PUBLIC_URL=https://blog-supabase.jongchoi.com
ADDITIONAL_REDIRECT_URLS=https://blog.jongchoi.com/callback,http://localhost:3000/callback
```

각 값의 의미는 다음과 같다.

- `SITE_URL`: Auth가 기본적으로 되돌려보낼 앱 주소
- `API_EXTERNAL_URL`: Auth callback과 이메일 링크 등에 사용되는 Supabase 외부 주소
- `SUPABASE_PUBLIC_URL`: Studio와 client가 인식하는 Supabase 공개 주소
- `ADDITIONAL_REDIRECT_URLS`: OAuth 이후 허용되는 추가 redirect 주소

## 4. Docker Compose 실행

Nginx Proxy Manager를 사용할 것이므로, `supabase-kong` 컨테이너를 `npm-network`에 붙인다.

네트워크가 없다면 먼저 생성한다.

```bash
docker network create npm-network
```

Compose 설정이 정상인지 확인한다.

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  config
```

실행은 아래처럼 한다.

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  up -d
```

종료는 아래처럼 한다.

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  down
```

## 5. Nginx Proxy Manager 연결

NPM에서는 `blog-supabase.jongchoi.com`을 Supabase Kong gateway로 보낸다.

설정값은 아래처럼 잡는다.

```text
Domain Names: blog-supabase.jongchoi.com
Forward Hostname / IP: supabase-kong
Forward Port: 8000
Websockets Support: enabled
SSL: Let's Encrypt
```

프록시 연결 후 health endpoint를 확인한다.

```bash
curl https://blog-supabase.jongchoi.com/auth/v1/health
```

이 요청이 응답하면 최소한 `NPM -> Kong -> Auth` 경로가 열린 것이다.

## 6. Google OAuth 설정

현재 앱 로그인 코드는 아래 방식으로 동작한다.

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/callback` },
});
```

따라서 사용자가 `https://blog.jongchoi.com/login`에서 로그인하면 최종 redirect는 아래 주소가 된다.

```text
https://blog.jongchoi.com/callback
```

self-hosted Supabase의 Auth 서버에는 Google OAuth 설정을 넣어야 한다.

```env
GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=change-me-google-client-id
GOTRUE_EXTERNAL_GOOGLE_SECRET=change-me-google-secret
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://blog-supabase.jongchoi.com/auth/v1/callback
```

Google Cloud Console에는 아래 redirect URI를 등록한다.

```text
https://blog-supabase.jongchoi.com/auth/v1/callback
```

여기서 헷갈리기 쉬운 점은 Google에 등록하는 callback과 앱의 callback이 다르다는 점이다.

- Google OAuth provider callback: `https://blog-supabase.jongchoi.com/auth/v1/callback`
- 블로그 앱 callback: `https://blog.jongchoi.com/callback`

흐름은 아래와 같다.

```text
blog.jongchoi.com/login
-> blog-supabase.jongchoi.com/auth/v1/authorize
-> Google consent
-> blog-supabase.jongchoi.com/auth/v1/callback
-> blog.jongchoi.com/callback
```

Cloud Supabase에서 가져온 기존 세션 토큰은 새 self-hosted Supabase의 JWT secret과 맞지 않는다. 이전 후 다시 로그인해야 하는 것은 정상이다.

## 7. DB 이전

Cloud Supabase DB는 세 개의 SQL 파일로 나눠 dump한다.

```bash
CLOUD_DB_URL="postgres://..." scripts/supabase/dump.sh
```

생성되는 파일은 아래 경로에 저장된다.

```text
infra/supabase/dumps/latest/
├─ roles.sql
├─ schema.sql
└─ data.sql
```

세 파일의 역할은 아래처럼 나뉜다.

- `roles.sql`: custom role, 권한 복원
- `schema.sql`: table, view, function, trigger, index, RLS policy 등 DB 구조 복원
- `data.sql`: table row, `auth.users`, Storage bucket metadata 등 데이터 복원

공식 restore guide 기준으로 DB dump에 포함되는 것은 아래와 같다.

- public schema
- table data
- roles
- RLS policies
- database functions
- triggers
- views
- `auth.users`
- Storage bucket metadata

여기서 주의할 점은 Storage bucket metadata와 Storage 실제 파일은 다르다는 것이다. DB restore로 bucket 정의가 들어와도, 이미지 원본 파일과 object record는 별도 S3/rclone 이전을 통해 맞춰야 한다.

self-hosted DB로 복원한다.

```bash
scripts/supabase/restore.sh
```

복원 후에는 source와 self-hosted 인벤토리를 비교한다.

```bash
scripts/supabase/verify-db.sh
```

`dump.sh`는 `psql`이 설치되어 있으면 `source-inventory.txt`를 같이 만든다. `verify-db.sh`는 self-hosted DB의 `self-hosted-inventory.txt`를 만들고 둘을 `diff`로 비교한다.

기본적으로 `restore.sh`는 `infra/supabase/.env`를 읽고 아래 형태의 접속 문자열을 만든다.

```text
postgres://postgres.<POOLER_TENANT_ID>:<POSTGRES_PASSWORD>@blog-supabase.jongchoi.com:5432/postgres
```

다른 DB 주소를 쓰고 싶다면 직접 넘긴다.

```bash
SELF_HOSTED_DB_URL="postgres://..." scripts/supabase/restore.sh
```

이 프로젝트는 `pgvector`를 사용하므로 복원 전후 extension을 확인해야 한다.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension;
```

복원 후 특히 확인할 RPC는 아래와 같다.

- `search_posts_hybrid`
- `search_post_chunks_cosine`
- `search_posts_with_snippet`
- `batch_update_orders_for_posts`
- `batch_update_orders_for_categories`
- `batch_update_orders_for_subcategories`

DB 복원 후에는 아래 쿼리로 view, function, trigger, policy가 실제로 들어왔는지 확인한다.

```sql
-- 주요 테이블 확인
\dt public.*

-- 주요 뷰 확인
\dv public.*

-- public schema 함수 확인
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
order by proname;

-- 트리거 확인
select event_object_table, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- RLS policy 확인
select schemaname, tablename, policyname
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- auth user 데이터 확인
select count(*) from auth.users;

-- Storage bucket metadata 확인
select id, name, public
from storage.buckets
order by name;
```

DB dump/restore에 포함되지 않아서 별도로 설정해야 하는 것도 있다.

- JWT secret과 anon/service role key
- Google OAuth provider 설정
- SMTP 설정
- custom domain과 DNS
- Storage 실제 파일
- Supabase Edge Functions
- self-hosted compose/env 설정

## 8. Storage 이전

이 프로젝트의 이미지 bucket 이름은 `image`이다.

Storage는 MinIO backend를 쓰지만, 파일 이전은 Supabase Storage의 S3 protocol endpoint를 통해 진행한다.

Cloud Supabase Dashboard에서 Storage S3 access key를 발급한 뒤 아래처럼 실행한다.

```bash
PLATFORM_S3_ENDPOINT="https://<project-ref>.supabase.co/storage/v1/s3" \
PLATFORM_S3_REGION="<cloud-region>" \
PLATFORM_S3_ACCESS_KEY_ID="<cloud-access-key>" \
PLATFORM_S3_SECRET_ACCESS_KEY="<cloud-secret-key>" \
scripts/supabase/sync-storage.sh
```

기본 bucket은 `image`이다.

```bash
BUCKET=image scripts/supabase/sync-storage.sh
```

모든 bucket을 옮기려면 아래처럼 실행한다.

```bash
BUCKET=all scripts/supabase/sync-storage.sh
```

중요한 점은 `volumes/storage`에 파일을 직접 복사하지 않는 것이다. Storage는 내부 metadata와 object path를 함께 관리하므로, 공식 문서 기준으로 S3 protocol과 rclone을 통해 옮기는 편이 안전하다.

DB restore가 먼저 끝나면 `storage.buckets` 정의가 이미 들어와 있을 수 있다. 그래도 rclone 전에 self-hosted Studio나 SQL로 `image` bucket이 존재하는지 확인한다.

## 9. 앱 코드 전환

self-hosted Supabase로 바꾸려면 앱의 배포 env를 아래처럼 바꾼다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://blog-supabase.jongchoi.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<self-host-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<self-host-service-role-key>
```

이번 작업에서 앱 코드도 두 군데 정리했다.

`next.config.ts`에는 self-hosted Storage 이미지를 허용했다.

```ts
{
  protocol: "https",
  hostname: "blog-supabase.jongchoi.com",
}
```

`utils/uploadingUtils.tsx`의 Storage URL은 `NEXT_PUBLIC_SUPABASE_URL` 기반으로 바꿨다.

```ts
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wknphwqwtywjrfclmhjd.supabase.co";
const commonImagePath = `${supabaseUrl}/storage/v1/object/public/image`;
```

이렇게 해두면 Cloud Supabase에서 self-hosted Supabase로 도메인을 바꿔도 이미지 추출 로직이 같은 env를 따라간다.

## 10. Deno 타입 경고

`infra/supabase/volumes/functions/main/index.ts`와 `infra/supabase/volumes/functions/hello/index.ts`는 Supabase Edge Functions용 Deno 코드이다.

Next.js 앱의 TypeScript 환경은 Node/React 기준이므로, VS Code에서 아래 경고가 보일 수 있다.

```text
'Deno' 이름을 찾을 수 없습니다.ts(2304)
```

이는 앱 코드 문제가 아니라 런타임 차이 때문에 생기는 경고이다.

`tsconfig.json`에서는 이 폴더를 타입체크 대상에서 제외했다.

```json
"exclude": ["node_modules", "infra/supabase/volumes/functions"]
```

따라서 `npx tsc --noEmit`은 통과한다. VS Code가 열린 파일 단위로 경고를 보여주는 경우에는 무시하거나, 나중에 Edge Functions를 실제로 운영할 때 Deno 설정을 별도로 추가하면 된다.

## 11. 검증 체크리스트

Compose 설정 확인:

```bash
docker compose \
  -f infra/supabase/compose.yaml \
  -f infra/supabase/compose.minio.yaml \
  --env-file infra/supabase/.env \
  config
```

Auth health 확인:

```bash
curl https://blog-supabase.jongchoi.com/auth/v1/health
```

Storage S3 endpoint 확인:

```bash
AWS_ACCESS_KEY_ID="$S3_PROTOCOL_ACCESS_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$S3_PROTOCOL_ACCESS_KEY_SECRET" \
aws s3 ls \
  --endpoint-url https://blog-supabase.jongchoi.com/storage/v1/s3 \
  --region "$REGION" \
  s3://image
```

앱에서 확인할 항목은 아래와 같다.

- Google OAuth 로그인
- `/callback` 세션 교환
- 게시글 이미지 렌더링
- 이미지 업로드 API
- semantic search
- 추천 게시글 조회
- admin 페이지 조회
- RPC 호출

## 12. 커밋하면 안 되는 것

아래 항목은 커밋하지 않는다.

- `infra/supabase/.env`
- `infra/supabase/dumps/`
- `infra/supabase/rclone.conf`
- `infra/supabase/volumes/db/data/`
- `infra/supabase/volumes/storage/`
- `infra/supabase/volumes/snippets/`

이 값들은 `.gitignore`에 추가되어 있다.

## 참고 문서

- Supabase Self-Hosting with Docker: https://supabase.com/docs/guides/self-hosting/docker
- Configure Social Login: https://supabase.com/docs/guides/self-hosting/self-hosted-oauth
- Configure S3 Storage: https://supabase.com/docs/guides/self-hosting/self-hosted-s3
- Restore Platform Project: https://supabase.com/docs/guides/self-hosting/restore-from-platform
- Copy Storage Objects: https://supabase.com/docs/guides/self-hosting/copy-from-platform-s3

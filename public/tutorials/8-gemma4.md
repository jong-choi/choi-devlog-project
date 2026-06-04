# Gemma4 관련 메모

## 리랭킹 관련 파일과 부분들

- `app/api/embedding/_model/reranker.ts`
  - 리랭킹 핵심 구현 파일
  - 우선 `VoyageAI`의 `rerank-2.5-lite` 호출
  - 실패하면 로컬 Hugging Face 모델 `jinaai/jina-reranker-v2-base-multilingual`로 fallback
  - `applyReranking()`에서 최종 점수 `rerankScore`를 붙여 반환

- `app/api/(fetchers)/posts/semantic-search/route.ts`
  - 하이브리드 검색 결과에 `applyReranking()` 적용
  - `search_posts_hybrid` RPC 결과를 리랭킹한 뒤 최종 선택 로직으로 넘김

- `app/api/embedding/generate/query/route.ts`
  - 청크 코사인 검색 결과에 `applyReranking()` 적용
  - `search_post_chunks_cosine` RPC로 가져온 후보를 다시 정렬

- `app/api/(fetchers)/posts/semantic-search/_utils/selection.ts`
  - 리랭킹 점수 기준으로 threshold 필터링
  - 점수가 부족하면 원본 검색 결과와 섞어서 최소 결과 수 보정

- `app/api/(fetchers)/posts/semantic-search/_utils/transforms.ts`
  - `rerankScore`를 응답용 `rerank_score` 필드로 변환

- `types/semantic-search.ts`
  - `Reranked<T>`, `RerankedCombinedRow` 등 리랭킹 타입 정의

- `scripts/preload-hf-models.mjs`
  - 로컬 fallback 용 리랭커 모델 사전 캐시
  - 기본 리랭커 모델 ID는 `jinaai/jina-reranker-v2-base-multilingual`

- `compose.prod.yaml`
  - `VOYAGE_API_KEY` 전달
  - 운영에서는 Voyage 리랭킹 우선 사용 의도

- `prod.Dockerfile`
  - 리랭커 모델 캐시 환경 변수 주입
  - 빌드 시 모델 프리로드, 런타임은 로컬 캐시 사용

## 임베딩 관련 파일과 부분들

- `app/api/embedding/_model/embeddings.ts`
  - 검색용 임베딩 핵심 구현 파일
  - 기본 모델은 `onnx-community/embeddinggemma-300m-ONNX`
  - `embedQuery()`, `embedDocuments()`, `embedDocument()` 제공
  - `local_files_only: true`라서 로컬 캐시 모델 사용

- `app/api/embedding/_service/generate.ts`
  - 게시글 본문을 청크로 나눈 뒤 `embedDocuments()` 호출
  - 생성한 벡터를 `post_chunks.embedding`에 저장

- `app/api/embedding/generate/query/route.ts`
  - 검색어를 `embedQuery()`로 임베딩
  - `search_post_chunks_cosine` RPC에 벡터 전달

- `app/api/(fetchers)/posts/semantic-search/route.ts`
  - 검색어를 `embedQuery()`로 임베딩
  - `search_posts_hybrid` RPC에 `p_query_vector`로 전달

- `app/api/embedding/generate/route.ts`
  - 입력 문자열 하나를 바로 임베딩해서 반환하는 간단한 테스트용 API

- `app/api/embedding/generate/document/route.ts`
  - 특정 게시글의 문서 임베딩 생성 진입점

- `app/api/embedding/generate/document/batch/route.ts`
  - 여러 게시글 문서 임베딩을 배치로 생성하는 진입점

- `app/api/embedding/chunks/[postId]/route.ts`
  - 게시글별 청크 임베딩 조회 API

- `app/api/embedding/generate/document/README.md`
  - `post_chunks.embedding` 스키마 설명
  - `vector(768)`로 저장
  - HNSW 인덱스와 `search_post_chunks_cosine` RPC 예시 포함

- `scripts/preload-hf-models.mjs`
  - `EmbeddingGemma` 모델 사전 캐시
  - 기본 임베딩 모델 ID는 `onnx-community/embeddinggemma-300m-ONNX`

- `lib/hf/env.ts`
  - Hugging Face 캐시 경로와 로컬/원격 모델 설정 공통 처리

- `prod.Dockerfile`
  - 빌드 시 임베딩 모델 프리로드
  - 런타임 `TRANSFORMERS_CACHE=/opt/hf-cache`
  - `HF_ALLOW_REMOTE_MODELS=false`로 오프라인 실행

- `app/api/summary/route.ts`
  - 게시글 요약 생성 후 OpenAI `text-embedding-3-small`로 요약 벡터 생성
  - 검색용 EmbeddingGemma와는 별도

- `app/api/summary/update/vectors/route.ts`
  - `ai_summary_vectors`에 없는 요약 벡터를 OpenAI `text-embedding-3-small`로 채움

- `app/api/summary/recommended/route.ts`
  - `ai_summary_vectors.vector`들끼리 코사인 유사도 계산
  - 추천 게시글 저장에 사용

- `app/api/similarity/cluster/generate/utils.ts`
  - 군집 대표 summary/keywords를 OpenAI `text-embedding-3-small`로 벡터화
  - 군집 벡터 생성에 사용

## 짧은 정리

- 검색용 임베딩
  - `EmbeddingGemma`
  - 로컬 캐시 모델 사용
  - 저장 위치는 `post_chunks.embedding`

- 리랭킹
  - `VoyageAI` 우선
  - 실패 시 로컬 `Jina reranker` fallback

- 요약/추천/군집 벡터
  - OpenAI `text-embedding-3-small`

## OpenAI 요약 관련 파일과 부분들

- `app/api/summary/route.ts`
  - OpenAI 요약 생성 핵심 파일
  - 게시글 `title`, `body`를 받아 `gpt-4o-2024-11-20`로 요약 생성
  - 생성된 요약을 `text-embedding-3-small`로 바로 벡터화해서 함께 반환

- `components/post/right-panel/ai-panel.tsx`
  - 게시글 화면에서 `/api/summary` 호출
  - 요약 생성 버튼과 연결된 사용처

- `components/admin/admin-action-buttons.tsx`
  - 관리자 화면에서 `/api/summary` 호출
  - 요약 생성/추천 생성 버튼과 연결된 사용처

- `app/api/crawl/[sSlug]/utils/createCrawledAISummary.ts`
  - 크롤링한 게시글에 대해 `/api/summary` 호출
  - 외부에서 가져온 글의 요약과 벡터를 생성할 때 사용

- `app/api/summary/tags/route.ts`
  - 저장된 요약을 읽어서 OpenAI `gpt-4.1-nano-2025-04-14`로 태그 생성
  - 요약 본문 기반으로 `tags`, `post_tags`를 채움

- `app/api/summary/update/vectors/route.ts`
  - 저장된 요약 중 벡터가 없는 것들을 OpenAI `text-embedding-3-small`로 임베딩
  - `ai_summary_vectors` 테이블 보정용

- `app/api/similarity/cluster/generate/utils.ts`
  - 여러 게시글 요약들을 묶어 OpenAI로 군집 대표 `title`, `summary`, `keywords` 생성
  - 생성한 군집 대표 summary를 다시 `text-embedding-3-small`로 벡터화

- `app/api/summary/recommended/route.ts`
  - OpenAI 호출은 없음
  - 이미 저장된 `ai_summary_vectors.vector`끼리 코사인 유사도 계산만 수행

## OpenAI 요약 흐름 짧은 정리

- 요약 생성
  - `app/api/summary/route.ts`

- 요약 태그 생성
  - `app/api/summary/tags/route.ts`

- 요약 벡터 생성/보정
  - `app/api/summary/update/vectors/route.ts`

- 요약 묶음으로 군집 대표 요약 생성
  - `app/api/similarity/cluster/generate/utils.ts`

## Supabase 셀프호스팅 이전 메모

### 공식 문서 링크

- Supabase Self-Hosting
  - https://supabase.com/docs/guides/self-hosting

- Self-Hosting with Docker
  - https://supabase.com/docs/guides/self-hosting/docker

- Configure Social Login (OAuth) Providers
  - https://supabase.com/docs/guides/self-hosting/self-hosted-oauth

- Login with Google
  - https://supabase.com/docs/guides/auth/social-login/auth-google

- Restore a Platform Project to Self-Hosted
  - https://supabase.com/docs/guides/self-hosting/restore-from-platform

- Supabase CLI `db dump`
  - https://supabase.com/docs/reference/cli/supabase-db-dump

- Copy Storage Objects from Platform
  - https://supabase.com/docs/guides/self-hosting/copy-from-platform-s3

- Configure S3 Storage
  - https://supabase.com/docs/guides/self-hosting/self-hosted-s3

- Storage Buckets
  - https://supabase.com/docs/guides/storage/buckets/fundamentals

- pgvector
  - https://supabase.com/docs/guides/database/extensions/pgvector

- Database Migrations
  - https://supabase.com/docs/guides/deployment/database-migrations

- Declarative database schemas
  - https://supabase.com/docs/guides/local-development/declarative-database-schemas

### 이 프로젝트에서 Supabase 연결하는 부분

- `utils/supabase/client.ts`
  - 브라우저 Supabase client 생성
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용

- `utils/supabase/server.ts`
  - 서버 Supabase client 생성
  - 일반 요청은 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - 업로드/관리성 작업은 `SUPABASE_SERVICE_ROLE_KEY` 사용

- `utils/supabase/middleware.ts`
  - Supabase session refresh
  - `/admin` 보호

- `compose.prod.yaml`
  - 배포 컨테이너에 Supabase env 주입
  - self-hosted로 바꾸면 이 env 값들을 새 Supabase 주소/키로 교체

- `.env`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Google OAuth 연결

- `app/(auth)/login/page.tsx`
  - `supabase.auth.signInWithOAuth({ provider: "google" })`
  - redirectTo는 `${window.location.origin}/callback`

- `app/(auth)/callback/route.ts`
  - `exchangeCodeForSession(code)`로 Supabase auth code를 session으로 교환

- self-hosted Supabase `.env`
  - `SITE_URL=https://blog.jongchoi.com`
  - `API_EXTERNAL_URL=https://supabase.jongchoi.com`
  - `GOOGLE_ENABLED=true`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_SECRET=...`
  - `ADDITIONAL_REDIRECT_URLS=https://blog.jongchoi.com/callback,http://localhost:3000/callback`

- self-hosted Supabase `docker-compose.yml`
  - `auth.environment`에 아래 값 연결

```yaml
GOTRUE_EXTERNAL_GOOGLE_ENABLED: ${GOOGLE_ENABLED}
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
GOTRUE_EXTERNAL_GOOGLE_SECRET: ${GOOGLE_SECRET}
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: ${API_EXTERNAL_URL}/auth/v1/callback
```

- Google Cloud OAuth redirect URI
  - `https://supabase.jongchoi.com/auth/v1/callback`

### Cloud Supabase 덤프와 self-hosted 복원

- 공식 문서 기준으로 raw `pg_dump`보다 `supabase db dump` 사용 권장
  - Supabase 내부 schema/role로 인한 restore 오류를 줄여줌

```bash
npx supabase db dump --db-url "$CLOUD_DB_URL" -f roles.sql --role-only
npx supabase db dump --db-url "$CLOUD_DB_URL" -f schema.sql
npx supabase db dump --db-url "$CLOUD_DB_URL" -f data.sql --use-copy --data-only
```

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "postgres://postgres.<POOLER_TENANT_ID>:<POSTGRES_PASSWORD>@supabase.jongchoi.com:5432/postgres"
```

- 복원에 포함되는 것
  - public schema
  - data
  - roles
  - RLS policies
  - database functions
  - triggers
  - `auth.users`

- 별도 설정이 필요한 것
  - OAuth provider env
  - JWT/API keys
  - Storage 실제 파일
  - SMTP
  - Edge Functions
  - DNS/custom domain

### RLS, 함수, 뷰 연동 확인

- `types/supabase.ts`
  - 현재 DB 타입 기준 파일
  - 복원 후 self-hosted DB 기준으로 다시 생성 필요

- 현재 RPC 의존 함수
  - `batch_update_orders_for_categories`
  - `batch_update_orders_for_posts`
  - `batch_update_orders_for_subcategories`
  - `create_cluster_with_vector`
  - `create_clusters_with_vectors`
  - `search_post_chunks_cosine`
  - `search_posts_hybrid`
  - `search_posts_with_snippet`

- 주요 테이블/뷰
  - `posts`
  - `categories`
  - `subcategories`
  - `ai_summaries`
  - `ai_summary_vectors`
  - `post_chunks`
  - `post_chunk_metadata`
  - `post_similarities`
  - `cluster_vectors`
  - `clusters_with_published_posts`
  - `published_posts_with_tags_summaries`
  - `published_posts_with_tags_summaries_tsv`
  - `admin_posts_with_similarity_counts`

- pgvector 필요

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Storage 이전

- `app/api/uploads/route.ts`
  - `image` bucket에 이미지 업로드

- `app/api/supabase/upload/route.ts`
  - velog 이미지를 받아 `image` bucket에 업로드

- `utils/uploadingUtils.tsx`
  - 기존 cloud Supabase Storage URL이 하드코딩되어 있음
  - self-hosted Storage URL로 바꾸거나 env 기반으로 변경 필요

- `next.config.ts`
  - 기존 cloud Supabase hostname이 이미지 remote pattern에 들어 있음
  - self-hosted Storage hostname 추가/교체 필요

- Storage 파일 이전
  - `volumes/storage`에 직접 복사하지 않기
  - 공식 문서 기준 S3 protocol + rclone으로 이전
  - self-hosted에 같은 `image` bucket이 있어야 함

### 이후 정리

- 현재 repo에는 `supabase/migrations` 폴더가 없음
- 1차 이전은 dump/restore로 진행
- 안정화 후 `supabase db dump` 또는 `supabase db pull`로 schema 기준점 생성
- 이후 RLS/function/view 변경은 migration 파일로 관리

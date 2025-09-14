## 테이블 및 스키마 설명

### `post_chunks` 테이블

게시글을 작은 청크(덩어리)로 나누어 저장하는 테이블입니다. EmbeddingGemma 모델을 사용한 벡터 검색을 위해 설계되었습니다.

| 컬럼명        | 타입        | 제약조건                        | 설명                               |
| ------------- | ----------- | ------------------------------- | ---------------------------------- |
| `id`          | uuid        | PK, default gen_random_uuid()   | 청크 고유 식별자                   |
| `post_id`     | uuid        | FK, NOT NULL, ON DELETE CASCADE | 원본 게시글 ID (posts 테이블 참조) |
| `chunk_index` | int         | NOT NULL                        | 청크 순서 번호 (0부터 시작)        |
| `content`     | text        | NOT NULL                        | 실제 청크 텍스트 내용              |
| `embedding`   | vector(768) | NOT NULL                        | EmbeddingGemma 768차원 임베딩 벡터 |
| `created_at`  | timestamptz | NOT NULL, default now()         | 청크 생성 시간                     |
| `deleted_at`  | timestamptz | default null                    | 청크 삭제 시간                     |

### 인덱스 설명

#### `idx_post_chunks_post_id`

```sql
create index if not exists idx_post_chunks_post_id on public.post_chunks(post_id);
```

**목적:** 특정 게시글의 모든 청크를 빠르게 조회하기 위한 B-Tree 인덱스

#### `idx_post_chunks_embed_hnsw`

```sql
create index if not exists idx_post_chunks_embed_hnsw
on public.post_chunks using hnsw (embedding vector_cosine_ops);
```

**목적:** 벡터 유사도 검색을 위한 HNSW(Hierarchical Navigable Small World) 인덱스

- **거리 함수:** 코사인 거리 (`vector_cosine_ops`)
- **사용 사례:** 의미적으로 유사한 청크 검색, RAG 시스템의 검색 단계

### SQL 스키마

```sql
-- 최소형: 검색 성능과 복원에 꼭 필요한 필드만
create table if not exists public.post_chunks (
id uuid primary key default gen_random_uuid(),
post_id uuid not null references public.posts(id) on delete cascade,
chunk_index int not null, -- 0부터
content text not null, -- 청크 텍스트
embedding vector(768) not null, -- EmbeddingGemma 768차원
created_at timestamptz not null default now(),
deleted_at timestamptz not null default null,
);

create index if not exists idx_post_chunks_post_id on public.post_chunks(post_id);

-- HNSW (가능하면 권장), 코사인 거리
create index if not exists idx_post_chunks_embed_hnsw
on public.post_chunks using hnsw (embedding vector_cosine_ops);
```

## @langchain/textsplitters

### 설치

```bash
npm install @langchain/textsplitters
```

### EmbeddingGemma 모델을 위한 텍스트 분할 설정

EmbeddingGemma는 **2048 토큰 컨텍스트 길이**를 가지므로, 청크 크기를 적절히 조정해야 합니다.

#### 토큰 기반 분할

gpt-4 토크나이저를 사용하면 정확한 토큰 기반 분할이 가능합니다.

```ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// gpt-4 토크나이저를 사용한 정확한 토큰 기반 분할
const splitter = RecursiveCharacterTextSplitter.fromTiktoken({
  model: "gpt-4", // 또는 "gpt-3.5-turbo"
  chunkSize: 1200, // EmbeddingGemma 컨텍스트(2048)의 약 60%
  chunkOverlap: 200, // 약 17% 오버랩으로 문맥 보존
});

const chunks = await splitter.splitText(text);
```

#### 다국어 지원 설정

| 모델           | 컨텍스트 길이 | 권장 청크 크기  | 권장 오버랩    | 비고           |
| -------------- | ------------- | --------------- | -------------- | -------------- |
| EmbeddingGemma | 2048 토큰     | 1200 토큰 (60%) | 200 토큰 (17%) | 768차원 임베딩 |

EmbeddingGemma는 100+ 언어를 지원하므로 한국어 텍스트 분할에 특화된 설정:

```ts
const multilingualSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
  separators: [
    "\n\n", // 문단 구분
    "\n", // 줄 구분
    ".", // 마침표
    "!", // 느낌표
    "?", // 물음표
    ";", // 세미콜론
    "。", // 일본어 마침표
    "．", // 전각 마침표
    " ", // 공백
    "", // 문자 단위
  ],
});
```

#### 실제 사용 예제

```ts
async function processPostContent(postId: string, content: string) {
  const splitter = new TokenTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 200,
    encodingName: "cl100k_base", //gpt-4 호환
  });

  // 텍스트를 청크로 분할
  const textChunks = await splitter.splitText(content);

  // 각 청크를 데이터베이스에 저장
  for (let i = 0; i < textChunks.length; i++) {
    const chunkContent = textChunks[i];

    // EmbeddingGemma로 임베딩 생성 (별도 구현 필요)
    const embedding = await generateEmbedding(chunkContent);

    // post_chunks 테이블에 저장
    await saveChunk({
      post_id: postId,
      chunk_index: i,
      content: chunkContent,
      embedding: embedding,
    });

    // post_chunk_metadata 테이블에 메타데이터 저장
    await saveChunkMetadata({
      chunk_id: chunkId,
      start_token: calculateStartToken(i, textChunks),
      end_token: calculateEndToken(i, textChunks),
      token_count: await estimateTokenCount(chunkContent),
      overlap_tokens: 200,
    });
  }
}
```

## RPC

```SQL
-- 코사인 유사도 기반 청크 검색 RPC
create or replace function public.search_post_chunks_cosine(
  p_query float4[],             -- 쿼리 임베딩(숫자 배열)
  p_match_count int default 10, -- 반환 개수 K
  p_min_similarity float4 default 0 -- 최소 유사도 (0~1)
)
returns table (
  chunk_id uuid,
  post_id uuid,
  chunk_index int,
  content text,
  similarity float4
)
language sql
stable
as $$
  select
    pc.id as chunk_id,
    pc.post_id,
    pc.chunk_index,
    pc.content,
    1 - (pc.embedding <=> (p_query::vector(768))) as similarity -- 코사인 유사도
  from public.post_chunks pc
  where (1 - (pc.embedding <=> (p_query::vector(768)))) >= p_min_similarity
  order by pc.embedding <=> (p_query::vector(768)) -- 코사인 "거리" 오름차순 = 유사도 내림차순
  limit p_match_count
$$;
```

# 시맨틱 검색 API 스키마

## 기존 구현 테이블

### 1. published_posts_with_tags_summaries_tsv (뷰)

- **목적**: 게시글 전체의 tsvector와 게시글 정보를 저장
- **관계**: 게시글과 tsv는 1:1 관계
- **주요 컬럼**:
  - `id`: 게시글 ID
  - `title`: 게시글 제목
  - `body`: 게시글 본문
  - `short_description`: 게시글 요약
  - `url_slug`: URL 슬러그
  - `thumbnail`: 썸네일 이미지
  - `released_at`: 발행일
  - `is_private`: 비공개 여부
  - `order`: 정렬 순서
  - `subcategory_id`: 하위 카테고리 ID
  - `tags`: 태그 배열 (JSON)
  - `tsv`: PostgreSQL tsvector (전체 텍스트 검색용)

### 2. post_chunks (테이블)

- **목적**: 게시글을 청크 단위로 나누어 pgvector 임베딩 저장
- **관계**: 게시글과 post_chunks는 1:N 관계
- **주요 컬럼**:
  - `id`: 청크 ID
  - `post_id`: 게시글 ID (외래키)
  - `chunk_index`: 청크 인덱스
  - `content`: 청크 내용
  - `embedding`: pgvector 임베딩 (문자열로 저장)
  - `created_at`: 생성일
  - `deleted_at`: 삭제일 (소프트 삭제)

### 3. post_chunk_metadata (테이블)

- **목적**: 청크의 메타데이터 정보 저장
- **관계**: post_chunks와 1:1 관계
- **주요 컬럼**:
  - `chunk_id`: 청크 ID (외래키)
  - `start_token`: 시작 토큰 위치
  - `end_token`: 끝 토큰 위치
  - `token_count`: 토큰 수
  - `overlap_tokens`: 겹치는 토큰 수
  - `char_start`: 시작 문자 위치
  - `char_end`: 끝 문자 위치

## 기존 검색 함수

### search_post_chunks_cosine

- **목적**: 코사인 유사도를 사용한 청크 검색
- **매개변수**:
  - `p_query`: 검색 쿼리 벡터 (number[])
  - `p_match_count`: 매치할 최대 개수 (기본값: 10)
  - `p_min_similarity`: 최소 유사도 임계값 (기본값: 0.5)
- **반환값**: 청크 정보와 유사도 점수

### search_posts_with_snippet

- **목적**: 텍스트 검색으로 게시글 검색 (스니펫 포함)
- **매개변수**:
  - `search_text`: 검색 텍스트
  - `page`: 페이지 번호
  - `page_size`: 페이지 크기
- **반환값**: 게시글 정보와 검색 스니펫

## 구현 목표

RRF를 이용한 하이브리드 시멘틱 서치

### RRF (Reciprocal Rank Fusion) 알고리즘 상세

#### RRF 점수 계산 공식

RRF 점수는 다음 공식을 사용합니다:

```
RRF_score = Σ(1 / (k + rank_i))
```

여기서:

- `k`: 평활화 상수 (일반적으로 60)
- `rank_i`: 각 검색 방법에서의 순위 (1부터 시작)

#### 하이브리드 가중치 적용

최종 점수는 다음과 같이 계산됩니다:

```
RRF_score = (FTS_weight × FTS_RRF_score) + (Vector_weight × Vector_RRF_score)
```

여기서:

- `FTS_RRF_score = 1 / (k + fts_rank_position)`
- `Vector_RRF_score = 1 / (k + vector_rank_position)`

## 참고 자료 링크

1. **pgvector 공식 문서**: https://github.com/pgvector/pgvector
2. **PostgreSQL FTS 문서**: https://www.postgresql.org/docs/current/textsearch.html
3. **RRF 알고리즘**:
   - Microsoft Azure AI Search RRF 구현: https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking
   - Elastic Search RRF 문서: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion
4. **하이브리드 검색 구현 사례**:
   - TigerData 블로그: https://www.tigerdata.com/blog/postgresql-hybrid-search-using-pgvector-and-cohere
   - Jonathan Katz 블로그: https://jkatz05.com/post/postgres/hybrid-search-postgres-pgvector/
5. **리랭킹 모델**: Jina AI Reranker v2 Base Multilingual - https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual

## DB 함수 구현

### search_posts_hybrid

```SQL
DROP FUNCTION IF EXISTS public.search_posts_hybrid(text, real[], integer, numeric, numeric, integer);

CREATE OR REPLACE FUNCTION search_posts_hybrid(
    p_search_text TEXT,
    p_query_vector FLOAT4[],
    p_oversample_count INTEGER DEFAULT 25,
    p_fts_weight NUMERIC DEFAULT 0.5,
    p_vector_weight NUMERIC DEFAULT 0.5,
    p_rrf_k INTEGER DEFAULT 60
)
RETURNS TABLE (
    post_id TEXT,
    title TEXT,
    body TEXT,
    short_description TEXT,
    url_slug TEXT,
    thumbnail TEXT,
    released_at TIMESTAMPTZ,
    tags JSONB,
    chunk_content TEXT,
    chunk_index INTEGER,
    fts_rank double precision,
    cosine_similarity double precision,
    rrf_score double precision,
    final_score double precision
) AS $$
BEGIN
    RETURN QUERY
    WITH fts_search AS (
        SELECT
            p.id::TEXT AS source_post_id,
            p.title,
            p.body,
            p.short_description,
            p.url_slug,
            p.thumbnail,
            p.released_at::timestamptz AS released_at,
            to_jsonb(p.tags) AS tags,
            -- 검색어가 있을 때는 본문에서 하이라이트 스니펫을 생성해 chunk_content로 반환
            CASE
                WHEN COALESCE(p_search_text, '') = '' THEN NULL
                ELSE ts_headline(
                    'simple',
                    p.body,
                    plainto_tsquery('simple', p_search_text),
                    'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,FragmentDelimiter=...,MaxWords=20,MinWords=5'
                )
            END AS chunk_content,
            NULL::INTEGER AS chunk_index,
            ts_rank_cd(p.tsv, plainto_tsquery('simple', p_search_text))::double precision AS fts_rank,
            NULL::double precision AS cosine_similarity,
            ROW_NUMBER() OVER (
              ORDER BY ts_rank_cd(p.tsv, plainto_tsquery('simple', p_search_text)) DESC
            ) AS fts_rank_position
        FROM published_posts_with_tags_summaries_tsv p
        WHERE p.tsv @@ plainto_tsquery('simple', p_search_text)
        ORDER BY ts_rank_cd(p.tsv, plainto_tsquery('simple', p_search_text)) DESC
        LIMIT p_oversample_count * 2
    ),
    vector_search AS (
        SELECT
            pc.post_id::TEXT AS source_post_id,
            p.title,
            p.body,
            p.short_description,
            p.url_slug,
            p.thumbnail,
            p.released_at::timestamptz AS released_at,
            to_jsonb(p.tags) AS tags,
            pc.content AS chunk_content,
            pc.chunk_index,
            NULL::double precision AS fts_rank,
            (1 - (pc.embedding::vector <=> p_query_vector::vector))::double precision AS cosine_similarity,
            ROW_NUMBER() OVER (
              ORDER BY pc.embedding::vector <=> p_query_vector::vector
            ) AS vector_rank_position
        FROM post_chunks pc
        JOIN published_posts_with_tags_summaries_tsv p ON pc.post_id = p.id
        WHERE pc.deleted_at IS NULL
        ORDER BY pc.embedding::vector <=> p_query_vector::vector
        LIMIT p_oversample_count * 2
    ),
    combined AS (
        SELECT DISTINCT ON (unified.source_post_id)
            unified.source_post_id,
            unified.title,
            unified.body,
            unified.short_description,
            unified.url_slug,
            unified.thumbnail,
            unified.released_at,
            unified.tags,
            unified.chunk_content,
            unified.chunk_index,
            unified.fts_rank,
            unified.cosine_similarity,
            unified.fts_rank_position,
            unified.vector_rank_position
        FROM (
            SELECT *, NULL::BIGINT AS vector_rank_position FROM fts_search
            UNION ALL
            SELECT *, NULL::BIGINT AS fts_rank_position FROM vector_search
        ) AS unified
        ORDER BY
            unified.source_post_id,
            unified.fts_rank DESC NULLS LAST,
            unified.cosine_similarity DESC NULLS LAST
    ),
    rrf_scored AS (
        SELECT
            c.*,
            (CASE
                WHEN c.fts_rank_position IS NOT NULL
                  THEN p_fts_weight::double precision * (1.0 / (p_rrf_k + c.fts_rank_position))
                ELSE 0.0
            END)
            +
            (CASE
                WHEN c.vector_rank_position IS NOT NULL
                  THEN p_vector_weight::double precision * (1.0 / (p_rrf_k + c.vector_rank_position))
                ELSE 0.0
            END) AS rrf_score
        FROM combined c
    )
    SELECT
        rs.source_post_id AS post_id,
        rs.title,
        rs.body,
        rs.short_description,
        rs.url_slug,
        rs.thumbnail,
        rs.released_at,
        rs.tags,
        rs.chunk_content,
        rs.chunk_index,
        COALESCE(rs.fts_rank, 0.0)::double precision AS fts_rank,
        COALESCE(rs.cosine_similarity, 0.0)::double precision AS cosine_similarity,
        rs.rrf_score,
        rs.rrf_score AS final_score
    FROM rrf_scored rs
    ORDER BY rs.rrf_score DESC
    LIMIT p_oversample_count;
END;
$$ LANGUAGE plpgsql;
```

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
-- 기존에 충돌을 일으키는 함수들을 모두 삭제합니다.
DROP FUNCTION IF EXISTS public.search_posts_hybrid(text, real[], integer, numeric, numeric, integer, numeric, integer);
DROP FUNCTION IF EXISTS public.search_posts_hybrid(text, real[], integer, numeric, numeric, integer, real);
DROP FUNCTION IF EXISTS public.search_posts_hybrid(text, real[], integer, numeric, numeric, integer);

-- 최종 버전의 함수를 다시 생성합니다.
CREATE OR REPLACE FUNCTION search_posts_hybrid(
    p_search_text TEXT,
    p_query_vector FLOAT4[],
    p_oversample_count INTEGER DEFAULT 25,
    p_fts_weight NUMERIC DEFAULT 0.5,
    p_vector_weight NUMERIC DEFAULT 0.5,
    p_rrf_k INTEGER DEFAULT 60,
    p_min_similarity FLOAT4 DEFAULT 0.55
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
        -- Full-Text Search 결과
        SELECT
            p.id::TEXT AS post_id,
            p.title,
            p.body,
            p.short_description,
            p.url_slug,
            p.thumbnail,
            p.released_at::timestamptz,
            to_jsonb(p.tags) AS tags,
            CASE
                WHEN COALESCE(p_search_text, '') = '' THEN NULL
                ELSE ts_headline(
                    'simple',
                    p.body,
                    plainto_tsquery('simple', p_search_text),
                    'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,FragmentDelimiter=...,MaxWords=20,MinWords=5'
                )
            END AS chunk_content,
            ts_rank_cd(p.tsv, plainto_tsquery('simple', p_search_text))::double precision AS fts_rank,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(p.tsv, plainto_tsquery('simple', p_search_text)) DESC) AS rank_position
        FROM published_posts_with_tags_summaries_tsv p
        WHERE p.tsv @@ plainto_tsquery('simple', p_search_text)
        ORDER BY fts_rank DESC
        LIMIT p_oversample_count * 2
    ),
    ranked_chunks AS (
        -- 유사도 높은 순으로 청크 정렬
        SELECT
            pc.post_id,
            pc.content,
            pc.chunk_index,
            (1 - (pc.embedding::vector <=> p_query_vector::vector))::double precision AS cosine_similarity
        FROM post_chunks pc
        WHERE pc.deleted_at IS NULL AND (1 - (pc.embedding::vector <=> p_query_vector::vector)) >= p_min_similarity
        ORDER BY cosine_similarity DESC
        LIMIT p_oversample_count * 5
    ),
    deduped_chunks AS (
        -- 게시글 ID별로 가장 유사도 높은 청크 하나만 선택
        SELECT DISTINCT ON (rc.post_id)
            rc.post_id,
            rc.content,
            rc.chunk_index,
            rc.cosine_similarity
        FROM ranked_chunks rc
        ORDER BY rc.post_id, rc.cosine_similarity DESC
    ),
    vector_search AS (
        -- Vector Search 결과
        SELECT
            dc.post_id::TEXT,
            p.title,
            p.body,
            p.short_description,
            p.url_slug,
            p.thumbnail,
            p.released_at::timestamptz, -- 'timestamz'를 'timestamptz'로 수정
            to_jsonb(p.tags) AS tags,
            dc.content AS chunk_content,
            dc.chunk_index,
            dc.cosine_similarity,
            ROW_NUMBER() OVER (ORDER BY dc.cosine_similarity DESC) AS rank_position
        FROM deduped_chunks dc
        JOIN published_posts_with_tags_summaries_tsv p ON dc.post_id = p.id
    ),
    combined_ranks AS (
        -- FTS와 Vector 검색 결과를 FULL OUTER JOIN으로 결합하여 순위 정보 통합
        SELECT
            COALESCE(fts.post_id, vec.post_id) as post_id,
            fts.rank_position as fts_rank_position,
            vec.rank_position as vector_rank_position
        FROM fts_search fts
        FULL OUTER JOIN vector_search vec ON fts.post_id = vec.post_id
    ),
    rrf_scored AS (
        -- RRF 점수 계산
        SELECT
            cr.post_id,
            (CASE
                WHEN cr.fts_rank_position IS NOT NULL
                  THEN p_fts_weight::double precision * (1.0 / (p_rrf_k + cr.fts_rank_position))
                ELSE 0.0
            END)
            +
            (CASE
                WHEN cr.vector_rank_position IS NOT NULL
                  THEN p_vector_weight::double precision * (1.0 / (p_rrf_k + cr.vector_rank_position))
                ELSE 0.0
            END) AS rrf_score
        FROM combined_ranks cr
    )
    -- 최종 결과 조합
    SELECT
        rs.post_id,
        COALESCE(fts.title, vec.title) as title,
        COALESCE(fts.body, vec.body) as body,
        COALESCE(fts.short_description, vec.short_description) as short_description,
        COALESCE(fts.url_slug, vec.url_slug) as url_slug,
        COALESCE(fts.thumbnail, vec.thumbnail) as thumbnail,
        COALESCE(fts.released_at, vec.released_at) as released_at,
        COALESCE(fts.tags, vec.tags) as tags,
        COALESCE(fts.chunk_content, vec.chunk_content) as chunk_content,
        vec.chunk_index,
        COALESCE(fts.fts_rank, 0.0) as fts_rank,
        COALESCE(vec.cosine_similarity, 0.0) as cosine_similarity,
        rs.rrf_score,
        rs.rrf_score AS final_score
    FROM rrf_scored rs
    LEFT JOIN fts_search fts ON rs.post_id = fts.post_id
    LEFT JOIN vector_search vec ON rs.post_id = vec.post_id
    ORDER BY rs.rrf_score DESC
    LIMIT p_oversample_count;
END;
$$ LANGUAGE plpgsql;
```

### DB 함수 상세 로직 (search_posts_hybrid)

이 함수는 Full-Text Search(FTS)와 Vector Search를 결합하여 검색 정확도를 높이는 하이브리드 검색을 수행합니다. Reciprocal Rank Fusion (RRF) 알고리즘을 사용하여 두 검색 결과의 순위를 지능적으로 통합합니다.

#### 1. `fts_search` (Full-Text Search)

- `published_posts_with_tags_summaries_tsv` 뷰에서 `p_search_text`를 이용해 전체 텍스트 검색을 수행합니다.
- `ts_rank_cd` 함수로 검색 결과의 순위를 매기고, `ts_headline` 함수를 사용해 검색어 주변에 `<mark>` 태그가 포함된 하이라이트 스니펫(`chunk_content`)을 생성합니다.
- 결과는 FTS 순위(`fts_rank`)를 기준으로 정렬되며, RRF 계산을 위해 `ROW_NUMBER()`를 사용해 순위 번호(`rank_position`)를 부여합니다.
- 안정적인 RRF 계산을 위해 `p_oversample_count`의 2배만큼 결과를 가져옵니다.

#### 2. `ranked_chunks` & `deduped_chunks` (Vector Search 준비)

- **`ranked_chunks`**:
  - `post_chunks` 테이블에서 `p_query_vector`와 코사인 유사도(`cosine_similarity`)가 가장 높은 청크들을 검색합니다.
  - `p_min_similarity` 임계값보다 높은 유사도를 가진 청크만 필터링합니다.
  - 다양한 게시글에서 후보군을 확보하기 위해 `p_oversample_count`의 5배만큼 많은 청크를 가져옵니다 (오버샘플링).
- **`deduped_chunks`**:
  - 한 게시글에서 여러 청크가 검색될 경우, 가장 유사도가 높은 청크 하나만 남깁니다.
  - `DISTINCT ON (rc.post_id)` 구문을 사용하여 각 `post_id`별로 `cosine_similarity`가 가장 높은 첫 번째 행만 선택합니다. 이를 통해 결과의 중복을 방지하고 다양성을 확보합니다.

#### 3. `vector_search` (Vector Search)

- `deduped_chunks`에서 정제된 청크 정보를 `published_posts_with_tags_summaries_tsv` 뷰와 조인하여 완전한 게시글 메타데이터를 가져옵니다.
- 결과는 코사인 유사도(`cosine_similarity`)를 기준으로 정렬되며, RRF 계산을 위해 `ROW_NUMBER()`를 사용해 순위 번호(`rank_position`)를 부여합니다.

#### 4. `combined_ranks` (순위 통합)

- `fts_search`와 `vector_search`의 결과를 `FULL OUTER JOIN`을 사용하여 `post_id`를 기준으로 통합합니다.
- 이 조인을 통해 특정 게시글이 FTS, Vector Search 또는 두 검색 모두에서 어떤 순위를 차지했는지(`fts_rank_position`, `vector_rank_position`)를 하나의 테이블로 합칩니다.

#### 5. `rrf_scored` (RRF 점수 계산)

- `combined_ranks`에서 얻은 각 검색 방법의 순위를 RRF 공식에 대입하여 최종 `rrf_score`를 계산합니다.
- `p_fts_weight`와 `p_vector_weight` 파라미터를 사용하여 각 검색 방법의 중요도를 조절할 수 있습니다.
- 공식: `rrf_score = (p_fts_weight * (1 / (k + fts_rank))) + (p_vector_weight * (1 / (k + vector_rank)))`

#### 6. 최종 결과 조합 및 반환

- `rrf_scored` 테이블을 기준으로 `fts_search`와 `vector_search`의 상세 정보를 `LEFT JOIN`으로 다시 결합합니다.
- `chunk_content` 필드는 `COALESCE(fts.chunk_content, vec.chunk_content)`를 사용하여 FTS 검색 결과(하이라이트 스니펫)가 존재하면 그 값을 우선적으로 사용하고, 없으면 Vector 검색의 원본 청크 내용을 사용합니다.
- 최종 결과는 `rrf_score`가 높은 순으로 정렬되며, `p_oversample_count` 개수만큼 잘라서 반환합니다.

### 단계별 함수 로직 요약

1.  **1단계: 텍스트로 검색 (FTS)**
    - 사용자가 입력한 텍스트(`p_search_text`)를 기반으로 전체 게시글에서 관련 내용을 검색하고, 일치도 순으로 순위를 매깁니다.

2.  **2단계: 의미로 검색 (Vector Search)**
    - 사용자의 검색 의도를 담은 벡터(`p_query_vector`)와 가장 의미적으로 유사한 텍스트 조각(청크)들을 대량으로(요청 개수의 5배) 찾아냅니다.

3.  **3단계: 중복 제거 및 정제**
    - 2단계에서 찾은 결과 중, 동일한 게시글에 속한 여러 텍스트 조각이 있다면 가장 유사도가 높은 하나만 남기고 모두 제거합니다.

4.  **4단계: 두 검색 결과의 순위 통합**
    - 1단계(텍스트 검색)와 3단계(의미 검색)의 결과 목록을 하나로 합쳐, 각 게시물이 어떤 검색 방식에서 몇 위를 차지했는지 순위 정보를 정리합니다.

5.  **5단계: 최종 점수 계산 (RRF)**
    - 4단계에서 정리된 순위 정보에 가중치(`p_fts_weight`, `p_vector_weight`)를 적용하여 RRF 공식을 통해 최종 점수를 계산합니다.

6.  **6단계: 결과 반환**
    - 계산된 최종 점수가 높은 순으로 게시글을 정렬합니다.
    - 만약 텍스트 검색 결과에 하이라이트된 요약문이 있다면 그것을 우선적으로 보여주고, 없다면 의미 검색으로 찾은 원본 텍스트 조각을 보여줍니다.
    - 최종적으로 정렬된 결과를 요청한 개수(`p_oversample_count`)만큼 반환합니다.

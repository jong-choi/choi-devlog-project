import { NextResponse } from "next/server";
import { z } from "zod";
import { selectOptimalResults } from "@/app/api/(fetchers)/posts/semantic-search/_utils/selection";
import {
  formatSearchResponse,
  transformToCombinedRows,
} from "@/app/api/(fetchers)/posts/semantic-search/_utils/transforms";
import { validateAndNormalizeSearchParams } from "@/app/api/(fetchers)/posts/semantic-search/_utils/validation";
import { embeddings } from "@/app/api/embedding/_model/embeddings";
import { applyReranking } from "@/app/api/embedding/_model/reranker";
import {
  HybridSearchRequest,
  RerankedCombinedRow,
  SemanticSearchResult,
} from "@/types/semantic-search";
import { createClient } from "@/utils/supabase/server";

const fallbackTagsSchema: z.ZodType<SemanticSearchResult["tags"]> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(fallbackTagsSchema),
    z.record(fallbackTagsSchema),
  ]),
);

const fallbackPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  short_description: z.string().nullable(),
  url_slug: z.string(),
  thumbnail: z.string().nullable(),
  released_at: z.string().nullable(),
  snippet: z.string().nullable(),
  tags: fallbackTagsSchema,
});

const fallbackPostsSchema = z.array(fallbackPostSchema);

const searchWithSnippetFallback = async (
  query: string,
  limit: number,
): Promise<SemanticSearchResult[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_posts_with_snippet", {
    search_text: query,
    page: 1,
    page_size: limit,
  });

  if (error) {
    console.error("기본 검색 fallback 실패", error);
    throw new Error(`기본 검색 fallback 실패: ${error.message}`);
  }

  return fallbackPostsSchema.parse(data ?? []).map((post) => ({
    post_id: post.id,
    title: post.title,
    short_description: post.short_description,
    url_slug: post.url_slug,
    thumbnail: post.thumbnail,
    released_at: post.released_at,
    chunk_content: post.snippet,
    chunk_index: null,
    rerank_score: undefined,
    fts_rank: 0,
    cosine_similarity: 0,
    tags: post.tags,
  }));
};

export async function POST(req: Request) {
  try {
    const requestBody = (await req
      .json()
      .catch(() => ({}))) as Partial<HybridSearchRequest>;

    const searchParams = validateAndNormalizeSearchParams(requestBody);
    const effectiveMinResults = Math.min(
      searchParams.minResults,
      searchParams.maxResults,
    );

    // 1) 쿼리 임베딩 생성
    let queryVector: number[];
    try {
      queryVector = await embeddings.embedQuery(searchParams.query);
    } catch (error) {
      console.error("쿼리 임베딩 생성 실패, 기본 검색으로 fallback", error);
      const results = await searchWithSnippetFallback(
        searchParams.query,
        searchParams.maxResults,
      );
      return NextResponse.json({ results });
    }

    // 2) Supabase RPC 호출 (DB 하이브리드 검색)
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_posts_hybrid", {
      p_search_text: searchParams.query,
      p_query_vector: queryVector,
      p_oversample_count: searchParams.overSampleCount,
      p_fts_weight: searchParams.ftsWeight,
      p_vector_weight: searchParams.vectorWeight,
      p_rrf_k: searchParams.rrfK,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: `Supabase RPC 실패: ${error.message}` },
        { status: 500 },
      );
    }

    const dbResults = Array.isArray(data) ? data : [];

    // 리랭킹 적용 준비 (전체 후보군에 대해 적용)
    const combinedResults = transformToCombinedRows(dbResults);

    const rerankedResults: RerankedCombinedRow[] = await applyReranking(
      combinedResults,
      searchParams.query,
    );

    // 선택 규칙 적용
    const finalSelected = selectOptimalResults(
      rerankedResults,
      combinedResults,
      {
        minThreshold: searchParams.minThreshold,
        maxResults: searchParams.maxResults,
        effectiveMinResults,
      },
    );

    // 최종 결과 변환 (UI에서 사용하는 필드만 반환)
    const results = formatSearchResponse(finalSelected);

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: `요청 처리 실패: ${String(error)}` },
      { status: 500 },
    );
  }
}

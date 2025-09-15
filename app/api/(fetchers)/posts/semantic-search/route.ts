import { NextResponse } from "next/server";
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
} from "@/types/semantic-search";
import { createClient } from "@/utils/supabase/server";

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
    const queryVector = await embeddings.embedQuery(searchParams.query);

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

    const rerankedResults = (await applyReranking(
      combinedResults,
      searchParams.query,
    )) as RerankedCombinedRow[];

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

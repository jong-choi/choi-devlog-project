import { NextResponse } from "next/server";
import { embeddings } from "@/app/api/embedding/_model/embeddings";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type SearchRequest = {
  query?: string;
  k?: number;
  minSimilarity?: number;
};

type SearchRow = {
  chunk_id: string;
  post_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

// 코사인 유사도로 post_chunks를 검색하는 엔드포인트
export async function POST(req: Request) {
  try {
    const { query, k, minSimilarity }: SearchRequest = await req.json();

    if (typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "'query'가 필요합니다." },
        { status: 400 },
      );
    }

    // 1) 쿼리 임베딩 생성
    const vector = await embeddings.embedQuery(query);

    if (!Array.isArray(vector) || vector.length === 0) {
      return NextResponse.json(
        { error: "임베딩 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    // 2) Supabase RPC 호출
    const supabase = await createClient();
    const matchCount =
      typeof k === "number" && k > 0 && k <= 100 ? Math.floor(k) : 10;
    const minSim =
      typeof minSimilarity === "number"
        ? Math.max(0, Math.min(1, minSimilarity))
        : 0;

    console.log({
      p_query: vector,
      p_match_count: matchCount,
      p_min_similarity: minSim,
    });

    const { data, error } = await supabase.rpc("search_post_chunks_cosine", {
      p_query: vector,
      p_match_count: matchCount,
      p_min_similarity: minSim,
    });

    console.log(data);

    if (error) {
      console.error("검색 RPC 호출 실패", error);
      return NextResponse.json(
        {
          error: "검색 RPC 호출 실패",
          details: (error as { message?: string }).message,
        },
        { status: 500 },
      );
    }
    const results = (data as SearchRow[]) ?? [];
    return NextResponse.json({ results });
  } catch (error) {
    console.error("검색 처리 오류", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

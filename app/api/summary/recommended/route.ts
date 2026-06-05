import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseStoredVector } from "@/lib/supabase/vector";
import { cosineSimilarity } from "@/utils/api/analysis-utils";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const user = await supabase.auth.getUser();

  if (!user.data) {
    console.error("로그인되지 않은 사용자");
    return NextResponse.json(
      { error: "사용자 정보 불러오기 실패" },
      { status: 500 },
    );
  }

  try {
    const { postId } = await req.json();

    const { data: sourceNestedData } = await supabase
      .from("ai_summaries")
      .select(
        `
        id,
        post_id,
        ai_summary_vectors (
          vector
        ),
        posts (
          title,
          url_slug
        )
      `,
      )
      .eq("post_id", postId)
      .limit(1)
      .single();

    // AI 요약이 없는 상황
    if (!sourceNestedData) {
      console.error("AI 요약 데이터가 없음");
      return NextResponse.json(
        { error: "AI 요약을 먼저 생성하세요." },
        { status: 500 },
      );
    }

    const sourceVector = parseStoredVector(
      sourceNestedData.ai_summary_vectors?.vector ?? null,
    );

    if (!sourceNestedData.id || !sourceNestedData.post_id || !sourceVector) {
      console.error("소스 벡터가 없거나 파싱에 실패함");
      return NextResponse.json(
        { error: "소스 벡터를 불러오는데 오류가 발생하였습니다." },
        { status: 500 },
      );
    }

    const sourceData: SummaryVector = {
      id: sourceNestedData.id,
      post_id: sourceNestedData.post_id,
      vector: sourceVector,
    };

    const { data: targetNestedata } = await supabase
      .from("ai_summaries")
      .select(
        `
        id,
        post_id,
        ai_summary_vectors (
          vector
        ),
        posts (
          title,
          url_slug
        )
      `,
      )
      .neq("post_id", postId)
      .or("is_private.is.null,is_private.eq.false", { foreignTable: "posts" });

    if (!targetNestedata) {
      console.error("타겟 AI 요약 데이터 조회 실패");
      return NextResponse.json(
        { error: "요약 목록를 불러오는데 오류가 발생하였습니다." },
        { status: 500 },
      );
    }

    const targetDataRaw =
      targetNestedata?.map((item) => ({
        id: item.id,
        post_id: item.post_id,
        vector: parseStoredVector(item.ai_summary_vectors?.vector ?? null),
      })) ?? [];

    // 데이터 중복 방지 (map을 이용해서 중복된 key 제거)
    const targetData = Array.from(
      new Map(
        targetDataRaw
          .filter(
            (item): item is SummaryVector =>
              Boolean(item.id && item.post_id && item.vector),
          )
          .map((item) => [item.post_id, item]),
      ).values(),
    );

    const sims = findTopSimilarPosts(sourceData, targetData);

    if (!sims || sims.length === 0) {
      console.error("유사도 계산 결과가 비어있음");
      return NextResponse.json(
        { error: "유사한 계산을 할 수 없습니다." },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("post_similarities")
      .upsert(sims, {
        onConflict: "source_post_id, target_post_id",
      })
      .select();

    if (error) {
      console.error("DB 저장 오류:", error);
      return NextResponse.json(
        { error: "추천 게시글 저장 중 오류가 발생하였습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "추천 게시글을 생성하였습니다",
      data: data,
    });
  } catch (error) {
    console.error("추천 게시글 생성 오류", error);
    return NextResponse.json(
      { error: "추천 게시글 생성 중 오류가 발생하였습니다" },
      { status: 500 },
    );
  }
}

type SummaryVector = {
  id: string;
  post_id: string;
  vector: number[];
};

// 유사도 기반 정렬 후 상위 10개 필터링
function findTopSimilarPosts(
  sourceData: SummaryVector,
  targetData: SummaryVector[],
) {
  // id가 다른 게시글만 필터링

  // sourceData와 targetData 벡터 유사도 계산
  const similarities = targetData.map((target) => {
    return {
      target_post_id: target.post_id,
      similarity: cosineSimilarity(sourceData.vector, target.vector),
    };
  });

  // 유사도 기준으로 정렬 후 상위 10개 추출
  const top10 = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  // 결과 포맷 변환
  const res = top10.map((item) => {
    const [a, b] = [sourceData.post_id, item.target_post_id].sort(); // 단방향 제약 추가
    return {
      source_post_id: a,
      target_post_id: b,
      similarity: item.similarity,
    };
  });

  return res;
}

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const user = await supabase.auth.getUser();

  if (!user.data) {
    console.error("로그인되지 않은 사용자");
    return NextResponse.json(
      { error: "사용자 정보 불러오기 실패" },
      { status: 500 }
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
      `
      )
      .eq("post_id", postId)
      .limit(1)
      .single();

    // AI 요약이 없는 상황
    if (!sourceNestedData) {
      console.error("AI 요약 데이터가 없음");
      return NextResponse.json(
        { error: "AI 요약을 먼저 생성하세요." },
        { status: 500 }
      );
    }

    const sourceData = {
      id: sourceNestedData.id,
      post_id: sourceNestedData.post_id,
      vector: sourceNestedData.ai_summary_vectors?.vector ?? null,
      posts: sourceNestedData.posts,
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
      `
      )
      .neq("post_id", postId)
      .or("is_private.is.null,is_private.eq.false", { foreignTable: "posts" });

    if (!targetNestedata) {
      console.error("타겟 AI 요약 데이터 조회 실패");
      return NextResponse.json(
        { error: "요약 목록를 불러오는데 오류가 발생하였습니다." },
        { status: 500 }
      );
    }

    const targetData =
      targetNestedata?.map((item) => ({
        id: item.id,
        post_id: item.post_id,
        vector: item.ai_summary_vectors?.vector ?? null,
        posts: item.posts ?? null,
      })) ?? [];

    // @ts-expect-error: Supabase가 posts 데이터를 배열로 반환하는 경우가 있어서 첫 번째 요소를 사용
    const sims = findTopSimilarPosts(sourceData, targetData);

    if (!sims || sims.length === 0) {
      console.error("유사도 계산 결과가 비어있음");
      return NextResponse.json(
        { error: "유사한 계산을 할 수 없습니다." },
        { status: 500 }
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
        { status: 500 }
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
      { status: 500 }
    );
  }
}

interface VectorJsonData {
  sourceData: {
    id: string;
    vector: number[];
    post_id: string;
    posts: {
      title: string;
      url_slug: string;
    };
  };
  targetData: VectorJsonData["sourceData"][];
}

function cosineSimilarity(
  vec1raw: number[] | string,
  vec2raw: number[] | string
) {
  const vec1 = typeof vec1raw === "string" ? JSON.parse(vec1raw) : vec1raw;
  const vec2 = typeof vec2raw === "string" ? JSON.parse(vec2raw) : vec2raw;
  const dotProduct = vec1.reduce(
    (sum: number, v: number, i: string | number) => sum + v * vec2[i],
    0
  );
  const magnitudeA = Math.sqrt(
    vec1.reduce((sum: number, v: number) => sum + v ** 2, 0)
  );
  const magnitudeB = Math.sqrt(
    vec2.reduce((sum: number, v: number) => sum + v ** 2, 0)
  );
  return dotProduct / (magnitudeA * magnitudeB);
}

// 유사도 기반 정렬 후 상위 10개 필터링
function findTopSimilarPosts(
  sourceData: VectorJsonData["sourceData"],
  targetData: VectorJsonData["targetData"]
) {
  // sourceData와 targetData 벡터 유사도 계산
  const similarities = targetData.map((target) => ({
    target_post_id: target.post_id,
    similarity: cosineSimilarity(sourceData.vector, target.vector),
  }));

  // 유사도 기준으로 정렬 후 상위 10개 추출
  const top10 = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  // 중복 제거를 위해 Set 사용
  const seenPairs = new Set<string>();
  const res = top10
    .map((item) => {
      const [a, b] = [sourceData.post_id, item.target_post_id].sort();
      const pairKey = `${a}-${b}`;
      
      if (seenPairs.has(pairKey)) {
        return null; // 중복된 쌍은 제외
      }
      
      seenPairs.add(pairKey);
      return {
        source_post_id: a,
        target_post_id: b,
        similarity: item.similarity,
      };
    })
    .filter((item) => item !== null) as Array<{
      source_post_id: string;
      target_post_id: string;
      similarity: number;
    }>;

  return res;
}

// 추천 게시글 불러오는 로직
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// const res = await fetch("/api/summary/recommended", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({ postId }),
// });
export async function POST(req: Request) {
  const supabase = await createClient(undefined, true);

  try {
    const { postId } = await req.json();

    // 데이터가 있는지 확인
    const { data: recommendedData } = await supabase
      .from("post_similarities")
      .select("*")
      .eq("source_post_id", postId);

    if (recommendedData && recommendedData.length) {
      return NextResponse.json({
        message: "이미 추천 게시글 데이터가 있습니다",
        data: recommendedData,
      });
    }

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

    const { data } = await supabase
      .from("post_similarities")
      .insert(sims)
      .select();

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
    target_title: target.posts.title,
    target_url_slug: target.posts.url_slug,
    similarity: cosineSimilarity(sourceData.vector, target.vector),
  }));

  // 유사도 기준으로 정렬 후 상위 10개 추출
  const top10 = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  // 결과 포맷 변환
  const res = top10.map((item) => ({
    source_post_id: sourceData.post_id,
    source_title: sourceData.posts.title,
    source_url_slug: sourceData.posts.url_slug,
    target_post_id: item.target_post_id,
    target_title: item.target_title,
    target_url_slug: item.target_url_slug,
    similarity: item.similarity,
  }));

  return res;
}

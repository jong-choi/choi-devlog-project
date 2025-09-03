import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60 * 60 * 24 * 7; //7일 캐싱
//revalidatePath("/api/admin")로 리발리데이트;

export async function GET() {
  const supabase = await createClient(undefined, true);

  const {
    data: posts,
    error: postsError,
    count,
  } = await supabase.from("published_posts").select(
    `
      id,
      title,
      url_slug,
      created_at,
      ai_summaries(count)
    `,
    { count: "exact" },
  );

  if (postsError) {
    console.error("Supabase 게시글 데이터 가져오기 오류:", postsError);
    return Response.json({ error: postsError }, { status: 500 });
  }

  // 각 게시글별로 정확한 추천(유사도) 개수를 조회
  const similarityCountMap = new Map<string, number>();
  if (posts && posts.length > 0) {
    const countResults = await Promise.all(
      posts.map((post) =>
        supabase
          .from("post_similarities_with_target_info")
          .select("target_post_id", { head: true, count: "exact" })
          .eq("source_post_id", post.id as string),
      ),
    );

    countResults.forEach((res, idx) => {
      const postId = posts[idx]?.id;
      if (res.error) {
        console.error(
          "유사도 개수 조회 오류 (post_id=",
          postId,
          "):",
          res.error,
        );
      }
      if (postId) {
        similarityCountMap.set(postId, res.count ?? 0);
      }
    });
  }

  // posts 데이터에 정확한 similarity count 추가
  const postsWithCounts = posts?.map((post) => {
    const postId = typeof post.id === "string" ? post.id : undefined;
    const countVal = postId ? (similarityCountMap.get(postId) ?? 0) : 0;
    return {
      ...post,
      post_similarities: [{ count: countVal }],
    };
  });

  return Response.json({ data: postsWithCounts ?? [], total: count ?? 0 });
}

export async function POST() {
  revalidatePath("/api/(fetchers)/admin");

  return Response.json({ revalidated: true, now: Date.now() });
}

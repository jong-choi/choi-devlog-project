import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type AdminPostData = {
  id: string | null;
  title: string | null;
  url_slug: string | null;
  created_at: string | null;
  body?: string;
  ai_summaries: { id: string } | null;
  post_similarities: { count: number }[];
};

export type AdminPostRes = {
  data: AdminPostData[];
  total: number;
};

export const revalidate = 604800; //7일 캐싱

export async function GET() {
  const supabase = await createClient(undefined, true);

  const {
    data: posts,
    error: postsError,
    count,
  } = await supabase.from("admin_posts_with_similarity_counts").select(
    `
        id,
        title,
        url_slug,
        created_at,
        ai_summaries,
        post_similarities
      `,
    { count: "exact" },
  );

  if (postsError) {
    console.error("Supabase 게시글 데이터 가져오기 오류:", postsError);
    return Response.json({ error: postsError }, { status: 500 });
  }

  const res: AdminPostRes = {
    data: (posts as AdminPostData[]) ?? [],
    total: count ?? 0,
  };

  return Response.json(res);
}

export async function POST() {
  revalidatePath("/api/admin");

  return Response.json({ revalidated: true, now: Date.now() });
}

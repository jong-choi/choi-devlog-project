import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient(undefined, true);

  const { data, error, count } = await supabase.from("published_posts").select(
    `
      id,
      title,
      url_slug,
      created_at,
      ai_summaries(count),
      post_similarities:post_similarities!source_post_id(count)
    `,
    { count: "exact" },
  );

  if (error) {
    console.error("Supabase 데이터 가져오기 오류:", error);
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({
    data: data ?? [],
    total: count ?? 0,
  });
}

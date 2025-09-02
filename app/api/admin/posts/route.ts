import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const filters = searchParams.getAll("filter");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "released_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  try {
    let query = supabase
      .from("posts")
      .select(
        `
        id,
        title,
        url_slug,
        released_at,
        is_private,
        created_at,
        ai_summaries (
          id,
          summary,
          created_at
        )
      `,
      )
      .not("deleted_at", "is", null);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    filters.forEach(f => {
      if (f === "with_summary") {
        query = query.not("ai_summaries", "is", null);
      } else if (f === "without_summary") {
        query = query.is("ai_summaries", null);
      } else if (f === "public_only") {
        query = query.eq("is_private", false);
      } else if (f === "private_only") {
        query = query.eq("is_private", true);
      }
    });

    const {
      data: posts,
      error,
      count,
    } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Posts query error:", error);
      return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    let postsWithRecommendations = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: recommendCount } = await supabase
          .from("post_similarities")
          .select("*", { count: "exact", head: true })
          .eq("source_post_id", post.id);

        return {
          ...post,
          ai_summary: post.ai_summaries?.[0] || null,
          recommended_count: recommendCount || 0,
        };
      }),
    );

    if (filters.includes("less_than_10_recommendations")) {
      postsWithRecommendations = postsWithRecommendations.filter(
        (p) => p.recommended_count < 10,
      );
    }

    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null);

    const { count: withAISummary } = await supabase
      .from("posts")
      .select("*, ai_summaries(*)", { count: "exact", head: true })
      .not("deleted_at", "is", null)
      .not("ai_summaries", "is", null);

    const { data: recommendationsData } = await supabase
      .from("post_similarities")
      .select("source_post_id");

    const uniquePostsWithRecommendations = new Set(
      recommendationsData?.map((item) => item.source_post_id) || [],
    );

    const totalRecommendations = recommendationsData?.length || 0;
    const averageRecommendations = totalPosts
      ? totalRecommendations / totalPosts
      : 0;

    return Response.json({
      posts: postsWithRecommendations,
      total: count || 0,
      summary: {
        totalPosts: totalPosts || 0,
        withAISummary: withAISummary || 0,
        withRecommendations: uniquePostsWithRecommendations.size,
        averageRecommendations: Math.round(averageRecommendations * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Admin posts API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

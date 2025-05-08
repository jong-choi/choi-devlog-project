import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const seriesId = searchParams.get("seriesId");

  const result = await supabase
    .from("published_posts_with_tags_summaries")
    .select("*")
    .eq("subcategory_id", seriesId ?? "")
    .order("order", { ascending: true });

  return Response.json(result);
}

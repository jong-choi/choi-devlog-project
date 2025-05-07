import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const keyword = searchParams.get("keyword") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  const result = await supabase.rpc("search_posts_with_snippet", {
    search_text: keyword,
    page,
    page_size: limit,
  });

  return Response.json(result);
}

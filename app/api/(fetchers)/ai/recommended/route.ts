import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const post_id = searchParams.get("post_id");

  const result = await supabase
    .from("post_similarities_with_target_info")
    .select("*")
    .eq("source_post_id", post_id ?? "")
    .order("similarity", { ascending: false });

  return Response.json(result);
}

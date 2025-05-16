import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const post_id = searchParams.get("post_id");

  const result = await supabase
    .from("ai_summaries")
    .select("*")
    .eq("post_id", post_id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return Response.json(result);
}

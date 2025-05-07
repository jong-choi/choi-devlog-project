import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  const result = await supabase
    .from("clusters_with_published_posts")
    .select("*")
    .eq("id", id ?? "")
    .single();

  return Response.json(result);
}

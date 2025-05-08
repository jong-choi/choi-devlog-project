import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const urlSlug = searchParams.get("urlSlug");

  const result = await supabase
    .from("subcategories_with_published_meta")
    .select("*")
    .eq("url_slug", urlSlug ?? "")
    .single();

  return Response.json(result);
}

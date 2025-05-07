import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const categoryId = searchParams.get("categoryId") ?? undefined;
  const recommended = searchParams.get("recommended") === "true";

  const query = supabase
    .from("subcategories_with_published_meta")
    .select("*")
    .not("latest_post_date", "is", null)
    .order("latest_post_date", { ascending: false });

  if (categoryId) {
    query.eq("category_id", categoryId).order("order", { ascending: true });
  }

  if (recommended) {
    query.is("recommended", true).order("order", { ascending: true });
  }

  const result = await query;

  return Response.json(result);
}

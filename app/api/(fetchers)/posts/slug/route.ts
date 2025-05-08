import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const urlSlug = searchParams.get("urlSlug");

  if (!urlSlug) {
    return new Response(JSON.stringify({ error: "Missing urlSlug" }), {
      status: 400,
    });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const isLoggedIn = Boolean(sessionData.session);

  const result = await supabase
    .from("posts")
    .select("*")
    .eq("url_slug", urlSlug)
    .is("deleted_at", null)
    .or(
      isLoggedIn
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .single();

  return Response.json(result);
}

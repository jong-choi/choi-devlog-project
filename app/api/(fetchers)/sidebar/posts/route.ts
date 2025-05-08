import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getClientSidebarPublishedPosts } from "@/app/post/fetchers/client/sidebar";

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  const result = await getClientSidebarPublishedPosts(supabase);

  return Response.json(result);
}

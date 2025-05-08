import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getClientSidebarCategory } from "@/app/post/fetchers/client/sidebar";

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  const result = await getClientSidebarCategory(supabase);

  return Response.json(result);
}

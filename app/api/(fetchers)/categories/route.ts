import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  const result = await supabase
    .from("categories")
    .select()
    .is("deleted_at", null)
    .order("order", { ascending: true });

  return Response.json(result);
}

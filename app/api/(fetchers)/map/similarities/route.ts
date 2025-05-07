import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const threshold = parseFloat(searchParams.get("threshold") ?? "0.6");

  const result = await supabase
    .from("cluster_similarities")
    .select("*")
    .gte("similarity", threshold)
    .order("similarity", { ascending: false });

  return Response.json(result);
}

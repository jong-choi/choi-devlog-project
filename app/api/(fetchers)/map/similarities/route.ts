import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const threshold = parseFloat(searchParams.get("threshold") ?? "0.6");

  const result = await supabase
    .from("cluster_similarities")
    .select("*")
    .gte("similarity", threshold)
    .order("similarity", { ascending: false });

  return Response.json(result);
}

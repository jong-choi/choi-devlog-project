import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const result = await supabase
    .from("clusters")
    .select("*")
    .order("quality", { ascending: true });

  return Response.json(result);
}

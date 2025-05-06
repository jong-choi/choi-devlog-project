import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const supabase = await createClient();
  const id = ctx.params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing `id`" }), {
      status: 400,
    });
  }

  const result = await supabase
    .from("clusters_with_published_posts")
    .select("*")
    .eq("id", id)
    .single();

  return Response.json(result);
}

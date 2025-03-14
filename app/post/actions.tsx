import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";

export const createPost = async (
  payload: Database["public"]["Tables"]["posts"]["Insert"]
): Promise<Database["public"]["Tables"]["posts"]["Insert"] | null> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .insert(payload)
    .select()
    .limit(1)
    .single();
  return result.data;
};

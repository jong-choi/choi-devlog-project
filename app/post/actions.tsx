import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";

export const createPost = async (
  payload: Database["public"]["Tables"]["posts"]["Insert"],
  isServiceRole: boolean = false
): Promise<Database["public"]["Tables"]["posts"]["Insert"] | null> => {
  const supabase = await createClient(undefined, isServiceRole);
  const result = await supabase
    .from("posts")
    .insert(payload)
    .select()
    .limit(1)
    .single();
  return result.data;
};

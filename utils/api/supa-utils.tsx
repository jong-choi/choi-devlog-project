import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export async function supaValidCheck(supabaseClient: SupabaseClient<Database>) {
  const userCreatedAt = (await supabaseClient.auth.getSession()).data.session
    ?.user.created_at;

  return process.env.VALID_USER_CREATED_AT === userCreatedAt;
}

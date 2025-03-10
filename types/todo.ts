import { Database } from "./supabase";

export type Todo = Pick<
  Database["public"]["Tables"]["todos_with_rls"]["Row"],
  "content" | "created_at" | "id" | "updated_at" | "user_id" | "deleted_at"
>;

import { Database } from "@/types/supabase";

export type Series =
  Database["public"]["Views"]["subcategories_with_meta"]["Row"];

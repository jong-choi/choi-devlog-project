import { Database } from "@/types/supabase";

export type Post = {
  id: string;
  url_slug: string;
  title: string;
  short_description: string;
  is_private: boolean | null;
  order: number;
};
export type Subcategory = {
  id: string;
  name: string;
  order: number;
};

export type Category = {
  id: string;
  name: string;
  order: number;
  subcategories: Subcategory[];
};

export type SidebarSelectedData = {
  post: Post;
  subcategory: Subcategory;
  category: Category;
};

export type RecommendedPost =
  Database["public"]["Tables"]["post_similarities"]["Row"];

export type Panel = "category" | "subcategory" | "post" | "recommended";

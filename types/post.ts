export type Post = {
  id: number;
  url_slug: string;
  title: string;
  short_description: string;
  is_private: boolean | null;
  order: number;
};
export type Subcategory = {
  id: number;
  name: string;
  order: number;
};

export type Category = {
  id: number;
  name: string;
  order: number;
  subcategories: Subcategory[];
};

export type Panel = "category" | "subcategory" | "post";

export type Post = {
  id: number;
  name: string;
};
export type Subcategory = {
  id: number;
  name: string;
  posts: Post[];
};

export type Category = {
  id: number;
  name: string;
  subcategories: Subcategory[];
};

export type Penel = "category" | "subcategory" | "post";

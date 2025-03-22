import { Category, Subcategory, Post, Panel } from "@/types/post";
import { Database } from "@/types/supabase";
import { createStore } from "zustand";

export interface SidebarState {
  categories: Category[];
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  selectedPostsData: Post[] | null;
  selectedPost: Post | null;
  selectedRecommendedPosts:
    | Database["public"]["Tables"]["post_similarities"]["Row"][]
    | null;
  selectedPanel: Panel;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSubcategory: (subcategory: Subcategory | null) => void;
  setSelectedPostsData: (posts: Post[] | null) => void;
  setSelectedRecommendedPosts: (
    recommendedPosts:
      | Database["public"]["Tables"]["post_similarities"]["Row"][]
      | null
  ) => void;
  setSelectedPost: (post: Post | null) => void;
  setSelectedPanel: (panel: Panel) => void;
}

export const createSidebarStore = (initialState?: Partial<SidebarState>) =>
  createStore<SidebarState>((set) => ({
    categories: [],
    selectedCategory: null,
    selectedSubcategory: null,
    selectedPostsData: null,
    selectedPost: null,
    selectedRecommendedPosts: null,
    selectedPanel: "category",
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSelectedSubcategory: (subcategory) =>
      set({ selectedSubcategory: subcategory }),
    setSelectedPostsData: (posts) => set({ selectedPostsData: posts }),
    setSelectedPost: (post) => set({ selectedPost: post }),
    setSelectedRecommendedPosts: (recommendedPosts) =>
      set({ selectedRecommendedPosts: recommendedPosts }),
    setSelectedPanel: (Panel: Panel) => set({ selectedPanel: Panel }),
    ...initialState, // 초기값 덮어쓰기
  }));

import { Category, Subcategory, Post, Panel } from "@/types/post";
import { createStore } from "zustand";

export interface SidebarState {
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  selectedPost: Post | null;
  selectedPanel: "category" | "subcategory" | "post";
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSubcategory: (subcategory: Subcategory | null) => void;
  setSelectedPost: (post: Post | null) => void;
  setSelectedPanel: (panel: Panel) => void;
}

export const createSidebarStore = (initialState?: Partial<SidebarState>) =>
  createStore<SidebarState>((set) => ({
    selectedCategory: null,
    selectedSubcategory: null,
    selectedPost: null,
    selectedPanel: "category",
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSelectedSubcategory: (subcategory) =>
      set({ selectedSubcategory: subcategory }),
    setSelectedPost: (post) => set({ selectedPost: post }),
    setSelectedPanel: (Panel: Panel) => set({ selectedPanel: Panel }),
    ...initialState, // 초기값 덮어쓰기
  }));

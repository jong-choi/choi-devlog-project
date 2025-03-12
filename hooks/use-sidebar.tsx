import { Category, Subcategory, Post, Penel } from "@/types/post";
import { create } from "zustand";

interface SidebarState {
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  selectedPost: Post | null;
  selectedPanel: "category" | "subcategory" | "post";
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSubcategory: (subcategory: Subcategory | null) => void;
  setSelectedPost: (post: Post | null) => void;
  setSelectedPanel: (panel: Penel) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  selectedCategory: null,
  selectedSubcategory: null,
  selectedPost: null,
  selectedPanel: "category",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedSubcategory: (subcategory) =>
    set({ selectedSubcategory: subcategory }),
  setSelectedPost: (post) => set({ selectedPost: post }),
  setSelectedPanel: (penel: Penel) => set({ selectedPanel: penel }),
}));

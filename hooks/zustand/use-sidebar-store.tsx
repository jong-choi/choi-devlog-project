import { Category, Post } from "@/types/post";
import { createStore } from "zustand";

export interface SidebarState {
  categories: Category[] | null;
  posts: Post[] | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedSubcategoryName: string | null;
  selectedPostId: string | null;
  openedCategories: Record<string, boolean>;
  mobileOpen: boolean;
  loading: boolean;
  categoryPending: boolean;
  setCategory: (id: string | null) => void;
  setCategories: (categories: Category[]) => void;
  setSubcategory: (subcategory: { id: string; name: string } | null) => void;
  setPost: (id: string | null) => void;
  setPosts: (posts: Post[] | null) => void;
  setOpenCategory: (categoryId: string, open: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  toggleMobileOpen: () => void;
  setLoaded: () => void;
  setMobileClosed: () => void;
  setCategoryPending: (state: boolean) => void;
}

export const createSidebarStore = (initialState?: Partial<SidebarState>) =>
  createStore<SidebarState>((set) => ({
    categories: null,
    posts: null,
    selectedCategoryId: null,
    selectedSubcategoryId: null,
    selectedSubcategoryName: null,
    selectedPostId: null,
    openedCategories: {},
    mobileOpen: false,
    loading: true,
    categoryPending: false,
    setCategory: (id) =>
      set({ selectedCategoryId: id, selectedSubcategoryId: null }),
    setCategories: (categories) => set({ categories }),
    setSubcategory: (subcategory) =>
      set({
        selectedSubcategoryId: subcategory?.id ?? null,
        selectedSubcategoryName: subcategory?.name ?? null,
      }),
    setPost: (id) => set({ selectedPostId: id }),
    setPosts: (posts) => set({ posts: posts }),
    setOpenCategory: (categoryId, open) =>
      set((state) => ({
        openedCategories: {
          ...state.openedCategories,
          [categoryId]: open,
        },
      })),
    toggleCategory: (categoryId) =>
      set((state) => ({
        openedCategories: {
          ...state.openedCategories,
          [categoryId]: !state.openedCategories[categoryId],
        },
      })),
    toggleMobileOpen: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
    setLoaded: () => set({ loading: false }),
    setMobileClosed: () => set({ mobileOpen: false }),
    setCategoryPending: (state) => set({ categoryPending: state }),
    ...initialState, // 초기값 덮어쓰기
  }));

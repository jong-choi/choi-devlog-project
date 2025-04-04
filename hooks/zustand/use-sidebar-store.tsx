import { Category } from "@/types/post";
import { createStore } from "zustand";

export interface SidebarState {
  categories: Category[] | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedSubcategoryName: string | null;
  selectedPostId: string | null;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  openedCategories: Record<string, boolean>;
  mobileOpen: boolean;
  isSortable: boolean;
  setCategory: (id: string | null) => void;
  setSubcategory: (subcategory: { id: string; name: string } | null) => void;
  setPost: (id: string | null) => void;
  setLeftCollapsed: (state: boolean) => void;
  setRightCollapsed: (state: boolean) => void;
  setOpenCategory: (categoryId: string, open: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  toggleMobileOpen: () => void;
  toggleIsSortable: () => void;
}

export const createSidebarStore = (initialState?: Partial<SidebarState>) =>
  createStore<SidebarState>((set) => ({
    categories: null,
    selectedCategoryId: null,
    selectedSubcategoryId: null,
    selectedSubcategoryName: null,
    selectedPostId: null,
    leftCollapsed: false,
    rightCollapsed: false,
    openedCategories: {},
    mobileOpen: false,
    isSortable: true,
    setCategory: (id) =>
      set({ selectedCategoryId: id, selectedSubcategoryId: null }),
    setSubcategory: (subcategory) =>
      set({
        selectedSubcategoryId: subcategory?.id ?? null,
        selectedSubcategoryName: subcategory?.name ?? null,
      }),
    setPost: (id) => set({ selectedPostId: id }),
    setLeftCollapsed: (state) => set({ leftCollapsed: state }),
    setRightCollapsed: (state) => set({ rightCollapsed: state }),
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
    toggleIsSortable: () => set((state) => ({ isSortable: !state.isSortable })),
    ...initialState, // 초기값 덮어쓰기
  }));

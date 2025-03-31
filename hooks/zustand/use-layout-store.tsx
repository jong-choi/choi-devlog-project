import { createStore } from "zustand";

export interface LayoutState {
  leftOpen: boolean;
  rightOpen: boolean;
  topBarHeightRem: string;
  setLeftOpen: (open: boolean) => void;
  setRightOpen: (open: boolean) => void;
  toggleLeftOpen: () => void;
}

export const createLayoutStore = (initialState?: Partial<LayoutState>) =>
  createStore<LayoutState>((set, get) => ({
    leftOpen: true,
    rightOpen: true,
    topBarHeightRem: "3.5rem",
    setLeftOpen: (open) => set({ leftOpen: open }),
    setRightOpen: (open) => set({ rightOpen: open }),
    toggleLeftOpen: () => set({ leftOpen: !get().leftOpen }),
    ...initialState, // 초기값 덮어쓰기
  }));

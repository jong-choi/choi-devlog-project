import { createStore } from "zustand";

export interface LayoutState {
  leftOpen: boolean;
  rightOpen: boolean;
  topBarHeightRem: string;
  panelMode: "summary" | "recommend";
  setLeftOpen: (open: boolean) => void;
  setRightOpen: (open: boolean) => void;
  toggleLeftOpen: () => void;
  setPenelMode: (mode: "summary" | "recommend") => void;
}

export const createLayoutStore = (initialState?: Partial<LayoutState>) =>
  createStore<LayoutState>((set, get) => ({
    leftOpen: true,
    rightOpen: true,
    topBarHeightRem: "3.5rem",
    panelMode: "summary",
    setLeftOpen: (open) => set({ leftOpen: open }),
    setRightOpen: (open) => set({ rightOpen: open }),
    toggleLeftOpen: () => set({ leftOpen: !get().leftOpen }),
    setPenelMode: (mode) => set({ panelMode: mode }),
    ...initialState, // 초기값 덮어쓰기
  }));

import { createStore } from "zustand";

export interface LayoutState {
  sidebarLeftCollapsed: boolean;
  sidebarRightCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelMode: "summary" | "recommend";
  setSidebarLeftCollapsed: (state: boolean) => void;
  setSidebarRightCollapsed: (state: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelMode: (mode: "summary" | "recommend") => void;
}

export const createLayoutStore = (initialState?: Partial<LayoutState>) =>
  createStore<LayoutState>((set) => ({
    sidebarLeftCollapsed: false,
    sidebarRightCollapsed: false,
    rightPanelOpen: true,
    rightPanelMode: "summary",
    setSidebarLeftCollapsed: (state) => set({ sidebarLeftCollapsed: state }),
    setSidebarRightCollapsed: (state) => set({ sidebarRightCollapsed: state }),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
    ...initialState, // 초기값 덮어쓰기
  }));

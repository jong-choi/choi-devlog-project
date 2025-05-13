import { createStore } from "zustand";

export interface LayoutState {
  sidebarLeftCollapsed: boolean;
  sidebarRightCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelMode: "summary" | "recommend";
  isEditMode: boolean;
  isMilkdownOn: boolean;
  isRawOn: boolean;
  isSortable: boolean;
  isMounted: boolean;
  setSidebarLeftCollapsed: (state: boolean) => void;
  setSidebarRightCollapsed: (state: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelMode: (mode: "summary" | "recommend") => void;
  setIsEditMode: (value: boolean) => void;
  setIsMarkdown: (value: boolean) => void;
  setIsRaw: (value: boolean) => void;
  toggleIsSortable: () => void;
}

export const createLayoutStore = (initialState?: Partial<LayoutState>) =>
  createStore<LayoutState>((set) => ({
    sidebarLeftCollapsed: false,
    sidebarRightCollapsed: false,
    rightPanelOpen: true,
    rightPanelMode: "summary",
    isEditMode: false,
    isMilkdownOn: false,
    isRawOn: false,
    isSortable: false,
    isMounted: false,
    setSidebarLeftCollapsed: (state) => set({ sidebarLeftCollapsed: state }),
    setSidebarRightCollapsed: (state) => set({ sidebarRightCollapsed: state }),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
    setIsEditMode: (value) => {
      set({ isEditMode: value, isMounted: true });
    },
    setIsMarkdown: (value) => {
      set({ isMilkdownOn: value });
    },
    setIsRaw: (value) => {
      set({ isRawOn: value });
    },
    toggleIsSortable: () =>
      set((state) => {
        return { isSortable: !state.isSortable };
      }),
    ...initialState, // 초기값 덮어쓰기
  }));

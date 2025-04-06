import { createStore } from "zustand";

export interface LayoutState {
  sidebarLeftCollapsed: boolean;
  sidebarRightCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelMode: "summary" | "recommend";
  isEditMode: boolean;
  isMarkdownOn: boolean;
  isRawOn: boolean;
  isSortable: boolean;
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
    isMarkdownOn: false,
    isRawOn: false,
    isSortable: false,
    setSidebarLeftCollapsed: (state) => set({ sidebarLeftCollapsed: state }),
    setSidebarRightCollapsed: (state) => set({ sidebarRightCollapsed: state }),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
    setIsEditMode: (value) => {
      set({ isEditMode: value });
    },
    setIsMarkdown: (value) => {
      set({ isMarkdownOn: value });
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

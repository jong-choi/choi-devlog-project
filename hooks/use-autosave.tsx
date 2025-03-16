import { createStore } from "zustand";

export interface AutosaveState {
  isUploaded: boolean;
  isUploading: boolean;
  isAutoSaved: boolean;
  isAutoSaving: boolean;
  recentAutoSavedData: {
    postId: string;
    data: { timestamp: number; title: string; body: string };
  } | null;

  setIsUploaded: (value: boolean) => void;
  setIsUploading: (value: boolean) => void;
  setIsAutoSaved: (value: boolean) => void;
  setIsAutoSaving: (value: boolean) => void;
  setRecentAutoSavedData: (data: AutosaveState["recentAutoSavedData"]) => void;
}

export const createAutosaveStore = (initialState?: Partial<AutosaveState>) =>
  createStore<AutosaveState>((set) => ({
    isUploaded: false,
    isUploading: false,
    isAutoSaved: false,
    isAutoSaving: false,
    recentAutoSavedData: null,

    setIsUploaded: (value) => set({ isUploaded: value }),
    setIsUploading: (value) => set({ isUploading: value }),
    setIsAutoSaved: (value) => set({ isAutoSaved: value }),
    setIsAutoSaving: (value) => set({ isAutoSaving: value }),
    setRecentAutoSavedData: (data) => set({ recentAutoSavedData: data }),

    ...initialState, // 초기값 덮어쓰기
  }));

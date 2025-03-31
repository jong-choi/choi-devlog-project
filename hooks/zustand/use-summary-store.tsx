import { createStore } from "zustand";

export interface SummaryState {
  summaryId: string | null;
  summary: string;
  loading: boolean;
  setSummary: (summary: string) => void;
  setSummaryId: (summaryId: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const createSummaryStore = (initialState?: Partial<SummaryState>) =>
  createStore<SummaryState>((set) => ({
    summaryId: null,
    summary: "",
    loading: false,
    setSummary: (summary) => set({ summary }),
    setSummaryId: (summaryId) => set({ summaryId }),
    setLoading: (isLoading) => set({ loading: isLoading }),
    ...initialState,
  }));

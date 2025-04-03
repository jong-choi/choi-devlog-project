import { Post } from "@/types/post";
import { createStore } from "zustand";

export interface SummaryState {
  summaryId: string | null;
  summary: string;
  recommendedPosts: Post[];
  loading: boolean;
  setSummary: (summary: string) => void;
  setSummaryId: (summaryId: string) => void;
  setRecommendedPosts: (recommendedPosts: Post[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const createSummaryStore = (initialState?: Partial<SummaryState>) =>
  createStore<SummaryState>((set) => ({
    summaryId: null,
    summary: "",
    recommendedPosts: [],
    loading: false,
    setSummary: (summary) => set({ summary }),
    setSummaryId: (summaryId) => set({ summaryId }),
    setRecommendedPosts: (recommendedPosts) => set({ recommendedPosts }),
    setLoading: (isLoading) => set({ loading: isLoading }),
    ...initialState,
  }));

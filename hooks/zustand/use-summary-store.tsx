import { createStore } from "zustand";
type RecommendedPost = {
  id: string;
  title: string;
  urlSlug: string;
};

export interface SummaryState {
  summaryId: string | null;
  summary: string;
  recommendedPosts: RecommendedPost[];
  loading: boolean;
  setSummary: (summary: string) => void;
  setSummaryId: (summaryId: string) => void;
  setRecommendedPosts: (recommendedPosts: RecommendedPost[]) => void;
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

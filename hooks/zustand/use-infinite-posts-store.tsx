import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import { CardPost } from "@/types/post";
import { createStore } from "zustand";

export interface InfinitePostsState {
  posts: CardPost[];
  page: number;
  keyword: string;
  loading: boolean;
  hasMore: boolean;
  setKeyword: (keyword: string) => void;
  fetchNextPage: () => Promise<void>;
}

export const createInfinitePostsStore = (
  initialState?: Partial<InfinitePostsState>
) =>
  createStore<InfinitePostsState>((set, get) => ({
    posts: [],
    page: 0,
    keyword: "",
    loading: false,
    hasMore: true,
    setKeyword: (keyword) => set({ keyword }),
    fetchNextPage: async () => {
      const { page, posts, keyword, loading, hasMore } = get();
      if (loading || !hasMore) return;
      set({ loading: true });
      const { data } = await getPublishedPosts({ page, keyword });
      const nextPosts = data || [];
      set({
        posts: [...posts, ...nextPosts],
        page: page + 1,
        loading: false,
        hasMore: nextPosts.length > 0,
      });
    },
    ...initialState, // 초기값 덮어쓰기
  }));

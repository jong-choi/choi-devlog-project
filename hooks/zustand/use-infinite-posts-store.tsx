import { getPosts } from "@/components/posts/infinite-scroll/actions";
import { CardPost } from "@/types/post";
import { createStore } from "zustand";

export interface InfinitePostsState {
  posts: CardPost[];
  page: number;
  search: string;
  loading: boolean;
  hasMore: boolean;
  setSearch: (search: string) => void;
  resetPosts: () => void;
  fetchNextPage: () => Promise<void>;
}

export const createInfinitePostsStore = (
  initialState?: Partial<InfinitePostsState>
) =>
  createStore<InfinitePostsState>((set, get) => ({
    posts: [],
    page: 0,
    search: "",
    loading: false,
    hasMore: true,
    setSearch: (search) => set({ search }),
    resetPosts: () => set({ posts: [], page: 0, hasMore: true }),
    fetchNextPage: async () => {
      const { page, posts, search, loading, hasMore } = get();
      if (loading || !hasMore) return;
      set({ loading: true });
      const { data } = await getPosts({ page, search });
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

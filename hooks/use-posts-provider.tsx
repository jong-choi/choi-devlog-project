import { ClusteredPostGroup } from "@/types/graph";
import { createStore } from "zustand";

export interface PostsState {
  selectedCluster: ClusteredPostGroup | null;
  setSelectedCluster: (cluster: ClusteredPostGroup) => void;
}

export const createPostsStore = (initialState?: Partial<PostsState>) =>
  createStore<PostsState>((set) => ({
    selectedCluster: null,
    setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
    ...initialState,
  }));

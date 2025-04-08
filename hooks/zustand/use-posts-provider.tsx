import { ClusteredPostGroup, ClusterWithPosts } from "@/types/graph";
import { createStore } from "zustand";

export interface PostsState {
  selectedCluster: ClusteredPostGroup | null;
  clusterPostList: ClusterWithPosts[];
  isManualScrolling: boolean;
  isMain: boolean;
  setSelectedCluster: (cluster: ClusteredPostGroup) => void;
  setManualSelectedCluster: (cluster: ClusteredPostGroup) => void;
  setManualScrolling: (flag: boolean) => void;
  setClusterPostList: (list: ClusterWithPosts[]) => void;
}

export const createPostsStore = (initialState?: Partial<PostsState>) =>
  createStore<PostsState>((set) => ({
    selectedCluster: null,
    clusterPostList: [],
    isManualScrolling: false,
    isMain: false,
    setSelectedCluster: (c) =>
      set({ selectedCluster: c, isManualScrolling: false }),
    setManualSelectedCluster: (c) =>
      set({ selectedCluster: c, isManualScrolling: true }),
    setManualScrolling: (flag) => set({ isManualScrolling: flag }),
    setClusterPostList: (list) => set({ clusterPostList: list }),
    ...initialState,
  }));

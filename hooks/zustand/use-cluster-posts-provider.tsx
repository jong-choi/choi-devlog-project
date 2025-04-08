import { ClusteredPostGroup, ClusterWithPosts } from "@/types/graph";
import { createStore } from "zustand";

export interface ClusterPostsState {
  selectedCluster: ClusteredPostGroup | null;
  clusterWithPosts: ClusterWithPosts | null;
  clusters: ClusteredPostGroup[];
  setSelectedCluster: (cluster: ClusteredPostGroup) => void;
  setClusterWithPost: (cluster: ClusterWithPosts) => void;
}

export const createClusterPostsStore = (
  initialState?: Partial<ClusterPostsState>
) =>
  createStore<ClusterPostsState>((set) => ({
    selectedCluster: null,
    clusterWithPosts: null,
    clusters: [],
    setSelectedCluster: (c) => set({ selectedCluster: c }),
    setClusterWithPost: (cluster) => set({ clusterWithPosts: cluster }),
    ...initialState,
  }));

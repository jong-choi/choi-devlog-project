"use client";

import {
  ClusterPostsState,
  createClusterPostsStore,
} from "@/hooks/zustand/use-cluster-posts-provider";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type ClusterPostsApi = ReturnType<typeof createClusterPostsStore>;

const ClusterPostsContext = createContext<ClusterPostsApi | undefined>(
  undefined
);

interface ClusterPostsProviderProps {
  children: ReactNode;
  initialState?: Partial<ClusterPostsState>;
}

export const ClusterPostsProvider = ({
  children,
  initialState,
}: ClusterPostsProviderProps) => {
  const storeRef = useRef<ClusterPostsApi>(null);

  if (!storeRef.current) {
    storeRef.current = createClusterPostsStore(initialState);
  }

  return (
    <ClusterPostsContext.Provider value={storeRef.current}>
      {children}
    </ClusterPostsContext.Provider>
  );
};

export const useClusterPosts = <T,>(
  selector: (store: ClusterPostsState) => T
): T => {
  const clusterPostsContext = useContext(ClusterPostsContext);

  if (!clusterPostsContext) {
    throw new Error("useClusterPosts must be used within ClusterPostsProvider");
  }

  return useStore(clusterPostsContext, selector);
};

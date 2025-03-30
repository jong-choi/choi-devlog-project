"use client";

import {
  createInfinitePostsStore,
  InfinitePostsState,
} from "@/components/post/infinite-scroll/use-infinite-posts-store";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type InfinitePostsStoreApi = ReturnType<typeof createInfinitePostsStore>;

const InfinitePostsStoreContext = createContext<
  InfinitePostsStoreApi | undefined
>(undefined);

interface InfinitePostsStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<InfinitePostsState>;
}

export const InfinitePostsStoreProvider = ({
  children,
  initialState, // provider에 초기값 넣을 수 있도록 설정.
}: InfinitePostsStoreProviderProps) => {
  const storeRef = useRef<InfinitePostsStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createInfinitePostsStore(initialState);
  }

  return (
    <InfinitePostsStoreContext.Provider value={storeRef.current}>
      {children}
    </InfinitePostsStoreContext.Provider>
  );
};

export const useInfinitePostsStore = <T,>(
  selector: (store: InfinitePostsState) => T
): T => {
  const infinitePostsStoreContext = useContext(InfinitePostsStoreContext);

  if (!infinitePostsStoreContext) {
    throw new Error(
      "useInfinitePostsStore must be used within InfinitePostsStoreProvider"
    );
  }

  return useStore(infinitePostsStoreContext, selector);
};

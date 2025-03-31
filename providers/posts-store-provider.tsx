"use client";

import {
  createPostsStore,
  PostsState,
} from "@/hooks/zustand/use-posts-provider";
import { createContext, useRef, useContext, ReactNode } from "react";
import { useStore } from "zustand";

export type PostsApi = ReturnType<typeof createPostsStore>;

const PostsContext = createContext<PostsApi | undefined>(undefined);

interface PostsProviderProps {
  children: ReactNode;
  initialState?: Partial<PostsState>;
}

export const PostsProvider = ({
  children,
  initialState,
}: PostsProviderProps) => {
  const storeRef = useRef<PostsApi>(null);

  if (!storeRef.current) {
    storeRef.current = createPostsStore(initialState);
  }

  return (
    <PostsContext.Provider value={storeRef.current}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = <T,>(selector: (store: PostsState) => T): T => {
  const postsContext = useContext(PostsContext);

  if (!postsContext) {
    throw new Error("usePosts must be used within PostsProvider");
  }

  return useStore(postsContext, selector);
};

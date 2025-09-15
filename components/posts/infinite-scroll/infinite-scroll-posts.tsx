"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { ScrollCard } from "@/components/posts/infinite-scroll/scroll-card";
import { useInfinitePostsStore } from "@/providers/infinite-posts-provider";

export default function InfiniteScrollPosts() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const { fetchNextPage, loading, hasMore, resetState } = useInfinitePostsStore(
    useShallow((store) => {
      return {
        fetchNextPage: store.fetchNextPage,
        loading: store.loading,
        hasMore: store.hasMore,
        resetState: store.resetState,
      };
    }),
  );
  const ids = useInfinitePostsStore(
    useShallow((store) => {
      return store.posts.map((post) => post.id);
    }),
  );
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, loading, hasMore]);

  useEffect(() => {
    resetState({ keyword, hasMore: !keyword });
  }, [resetState, keyword]);

  return (
    <>
      {ids.map((id) => (
        <ScrollCard key={id} id={id || ""} />
      ))}
      {loading && <div className="text-center text-color-base">Loading...</div>}
      {!hasMore && (
        <div className="text-center text-color-base">No more posts</div>
      )}
      <div ref={observerRef} className="h-10" />
    </>
  );
}

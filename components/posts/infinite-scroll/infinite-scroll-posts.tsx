"use client";

import { useInfinitePostsStore } from "@/components/posts/infinite-scroll/infinite-posts-provider";
import { PostCard } from "@/components/posts/post-card";
import { useEffect, useRef } from "react";

export default function InfiniteScrollPosts() {
  const { posts, fetchNextPage, loading, hasMore } = useInfinitePostsStore(
    (store) => store
  );
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, loading, hasMore]);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {loading && <div className="text-center text-color-base">Loading...</div>}
      {!hasMore && (
        <div className="text-center text-color-base">No more posts</div>
      )}
      <div ref={observerRef} className="h-10" />
    </>
  );
}

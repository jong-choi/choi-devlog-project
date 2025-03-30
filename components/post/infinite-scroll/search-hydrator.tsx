"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInfinitePostsStore } from "@/components/post/infinite-scroll/infinite-posts-provider";

export default function SearchHydrator() {
  const params = useSearchParams();
  const initialSearch = params.get("search") || "";
  const { setSearch, resetPosts, fetchNextPage } = useInfinitePostsStore(
    (state) => state
  );

  useEffect(() => {
    setSearch(initialSearch);
    resetPosts();
    fetchNextPage();
  }, [initialSearch, setSearch, resetPosts, fetchNextPage]);

  return null;
}

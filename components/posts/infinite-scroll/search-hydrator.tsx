"use client";

import { useInfinitePostsStore } from "@/providers/infinite-posts-provider";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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

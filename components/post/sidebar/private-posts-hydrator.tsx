"use client";

import { useEffect, useRef } from "react";
import { fetchPrivatePosts } from "@/app/post/actions/sidebar";
import { useSidebarStore } from "@/providers/sidebar-store-provider";

export default function PrivatePostsHydrator() {
  const hasMergedRef = useRef(false);
  const posts = useSidebarStore((state) => state.posts);
  const setPosts = useSidebarStore((state) => state.setPosts);

  useEffect(() => {
    if (hasMergedRef.current || !posts?.length) return;
    (async () => {
      const privates = await fetchPrivatePosts();
      if (!privates?.length) return;
      const idsSet = new Set(posts.map((p) => p.id));
      const newPosts = privates.filter((p) => !idsSet.has(p.id));
      const merged = [...posts, ...newPosts];
      setPosts(merged);
      hasMergedRef.current = true;
    })();
  }, [posts, setPosts]);

  return null;
}

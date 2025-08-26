"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";

export default function IndexSelectionInitializer() {
  const setCategory = useSidebarStore((state) => state.setCategory);
  const setSubcategory = useSidebarStore((state) => state.setSubcategory);
  const setPost = useSidebarStore((state) => state.setPost);
  const setLoaded = useSidebarStore((state) => state.setLoaded);

  useEffect(() => {
    setCategory(null);
    setSubcategory(null);
    setPost(null);
    setLoaded();
  }, [setCategory, setSubcategory, setPost, setLoaded]);

  return null;
}

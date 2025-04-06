"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";

interface SidebarHydratorProps {
  urlSlug?: string;
}

export default function SidebarHydrator({
  urlSlug = "",
}: SidebarHydratorProps) {
  const {
    categories,
    posts,
    setCategory,
    setSubcategory,
    setPost,
    setOpenCategory,
  } = useSidebarStore(
    useShallow((state) => ({
      categories: state.categories,
      posts: state.posts,
      setCategory: state.setCategory,
      setSubcategory: state.setSubcategory,
      setPost: state.setPost,
      setOpenCategory: state.setOpenCategory,
    }))
  );

  useEffect(() => {
    if (!categories || !posts) return;
    const decodedSlug = decodeURIComponent(urlSlug);
    const post = posts.find((p) => p.url_slug === decodedSlug);

    let selectedCategoryId = categories[0]?.id ?? null;

    if (post) {
      setPost(post.id);

      for (const category of categories) {
        const subcategory = category.subcategories.find(
          (sub) => sub.id === post.subcategory_id
        );

        if (subcategory) {
          selectedCategoryId = category.id;
          setCategory(category.id);
          setSubcategory({ id: subcategory.id, name: subcategory.name });
          setOpenCategory(category.id, true);
          break;
        }
      }
    } else {
      setCategory(selectedCategoryId);
    }
  }, [
    categories,
    posts,
    urlSlug,
    setCategory,
    setSubcategory,
    setPost,
    setOpenCategory,
  ]);

  return null;
}

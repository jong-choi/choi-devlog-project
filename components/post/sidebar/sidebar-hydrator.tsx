"use client";

import { useEffect, useState } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import { PostgrestResponse } from "@supabase/supabase-js";
import { useAuthStore } from "@/providers/auth-provider";
import { useParams } from "next/navigation";

export default function SidebarHydrator() {
  const params = useParams();
  const rawSlug = params?.urlSlug;
  const urlSlug =
    typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";
  const {
    categories,
    posts,
    post,
    publishedPostsLength,
    setCategory,
    setSubcategory,
    setPost,
    setPosts,
    setOpenCategory,
    setLoaded,
    setMobileClosed,
  } = useSidebarStore(
    useShallow((state) => ({
      categories: state.categories,
      posts: state.posts,
      publishedPostsLength: state.posts?.filter((post) => !post.is_private)
        .length,
      post: state.posts?.find(
        (post) => post.url_slug === decodeURIComponent(urlSlug)
      ),
      loading: state.loading,
      setCategory: state.setCategory,
      setSubcategory: state.setSubcategory,
      setPost: state.setPost,
      setPosts: state.setPosts,
      setOpenCategory: state.setOpenCategory,
      setLoaded: state.setLoaded,
      setMobileClosed: state.setMobileClosed,
    }))
  );
  const { uid } = useAuthStore(
    useShallow((state) => ({
      uid: state.user?.id,
    }))
  );

  useEffect(() => setMobileClosed(), [setMobileClosed]);

  const [privateChecked, setPriavateCheked] = useState(false);
  // 공개된 게시글 숫자가 변할 때에 한번 더 체크
  useEffect(() => {
    setPriavateCheked(false);
  }, [publishedPostsLength]);
  useEffect(() => {
    if (!uid) return;
    if (privateChecked) return;
    void (async () => {
      const privatePosts = await getPrivatePosts(); // supabase로 가져옴
      const merged = [...(posts ?? []), ...(privatePosts ?? [])];
      const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());
      setPosts(unique);
      setPriavateCheked(true);
    })();
  }, [uid, posts, setPosts, privateChecked]);

  useEffect(() => {
    if (!categories) return;
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
    setLoaded();
  }, [
    categories,
    post,
    setCategory,
    setLoaded,
    setOpenCategory,
    setPost,
    setSubcategory,
  ]);

  return null;
}

export const getPrivatePosts = async (): Promise<Post[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user?.id ?? "";
  const { data, error }: PostgrestResponse<Post> = await supabase
    .from("posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id"
    )
    .eq("is_private", true)
    .eq("user_id", uid)
    .is("deleted_at", null)
    .order("order", { ascending: true });

  if (error) {
    console.error("Failed to fetch private posts:", error.message);
    return [];
  }

  return data ?? [];
};

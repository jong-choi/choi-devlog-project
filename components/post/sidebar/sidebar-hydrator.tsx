"use client";

import { useEffect, useState } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/providers/auth-provider";
import { useParams } from "next/navigation";
import {
  getClientSidebarCategory,
  getClientSidebarPrivatePosts,
  getClientSidebarPublishedPosts,
} from "@/app/post/fetchers/client/sidebar";

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
    ctegoriesPending,
    postsPending,
    setCategory,
    setCategories,
    setSubcategory,
    setPost,
    setPosts,
    setOpenCategory,
    setLoaded,
    setMobileClosed,
    setCtegoriesPending,
    setPostsPending,
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
      ctegoriesPending: state.ctegoriesPending,
      postsPending: state.postsPending,
      setCategory: state.setCategory,
      setCategories: state.setCategories,
      setSubcategory: state.setSubcategory,
      setPost: state.setPost,
      setPosts: state.setPosts,
      setOpenCategory: state.setOpenCategory,
      setLoaded: state.setLoaded,
      setMobileClosed: state.setMobileClosed,
      setCtegoriesPending: state.setCtegoriesPending,
      setPostsPending: state.setPostsPending,
    }))
  );
  const { uid } = useAuthStore(
    useShallow((state) => ({
      uid: state.user?.id,
    }))
  );

  useEffect(() => setMobileClosed(), [setMobileClosed]);

  // 카테고리/시리즈 생성/수정/삭제할 때 다시 한번 더 가져오기
  useEffect(() => {
    if (!ctegoriesPending) return;
    (async () => {
      const supabase = createClient();
      const { data } = await getClientSidebarCategory(supabase);
      if (data) {
        setCategories(data);
      }
      setCtegoriesPending(false);
    })();
  }, [ctegoriesPending, setCategories, setCtegoriesPending]);

  const [privateChecked, setPriavateCheked] = useState(false);
  // 게시글 생성/수정/삭제할 때 다시 한번 더 가져오기
  useEffect(() => {
    if (!postsPending) return;
    (async () => {
      const supabase = createClient();
      const { data } = await getClientSidebarPublishedPosts(supabase);
      if (data) {
        setPosts(data);
      }
      setPostsPending(false);
      setPriavateCheked(false);
    })();
  }, [postsPending, setPosts, setPostsPending]);

  // 공개된 게시글 숫자가 변할 때에 한번 더 체크
  useEffect(() => {
    setPriavateCheked(false);
  }, [publishedPostsLength]);

  useEffect(() => {
    if (!uid) return;
    if (privateChecked) return;
    void (async () => {
      const supabase = createClient();
      const { data } = await getClientSidebarPrivatePosts(supabase, uid); // supabase로 가져옴
      const merged = [...(posts ?? []), ...(data ?? [])];
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

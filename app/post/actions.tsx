import { Database } from "@/types/supabase";
import { CACHE_TAGS, createCachedFunction } from "@/utils/nextCache";

import { createClient } from "@/utils/supabase/server";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

export const createAISummary = async (
  payload: Omit<
    Database["public"]["Tables"]["ai_summaries"]["Insert"],
    "vector"
  > & { vector: number[] | null }
): Promise<
  PostgrestSingleResponse<
    Omit<Database["public"]["Tables"]["ai_summaries"]["Insert"], "vector"> & {
      vector: number[] | null;
    }
  >
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("ai_summaries")
    .insert(payload)
    .select()
    .limit(1)
    .single();

  return result;
};

const _getAISummaryByPostId = async (
  post_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["ai_summaries"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("ai_summaries")
    .select()
    .eq("post_id", post_id) // 특정 게시글에 대한 요약만 조회
    .order("created_at", { ascending: false }) // 최신 요약이 가장 위로 오도록 정렬
    .limit(1)
    .single(); // 가장 최신 요약 하나만 가져옴

  return result;
};

export const getAISummaryByPostId = createCachedFunction(
  CACHE_TAGS.AI_SUMMARY.BY_POST_ID(),
  _getAISummaryByPostId
);

// 대분류 CRUD
const _getAllCategories = async (): Promise<
  PostgrestResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("categories")
    .select()
    .is("deleted_at", null)
    .order("order", { ascending: true }); // 생성순 정렬

  return result;
};

export const getAllCategories = createCachedFunction(
  CACHE_TAGS.CATEGORY.ALL(),
  _getAllCategories
);

const createCategory = async (
  payload: Omit<Database["public"]["Tables"]["categories"]["Insert"], "order">
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const supabase = await createClient();

  // 현재 가장 큰 order 값을 조회
  const { data: maxOrderData } = await supabase
    .from("categories")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0; // 최대 order 값이 없으면 기본값 0
  const newOrder = maxOrder + 100000; // 새로운 order 값

  // 2️⃣ 새로운 카테고리 생성
  const result = await supabase
    .from("categories")
    .insert({ ...payload, order: newOrder })
    .select()
    .limit(1)
    .single();

  revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  return result;
};

export const updateCategory = async (
  category_id: string,
  payload: Partial<Database["public"]["Tables"]["categories"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("categories")
    .update(payload)
    .eq("id", category_id)
    .select()
    .limit(1)
    .single();

  revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  return result;
};

export const softDeleteCategory = async (
  category_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", category_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .limit(1)
    .single();

  revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  return result;
};

// 중분류 CRUD
const _getSubcategoriesByCategoryId = async (
  category_id: string
): Promise<
  PostgrestResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("subcategories")
    .select()
    .eq("category_id", category_id) // category_id 일치
    .is("deleted_at", null) // 삭제되지 않은 항목만 조회
    .order("order", { ascending: true }); // order 기준 오름차순 정렬

  return result;
};

export const getSubcategoriesByCategoryId = createCachedFunction(
  CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(),
  _getSubcategoriesByCategoryId
);

export const createSubcategory = async (
  payload: Omit<
    Database["public"]["Tables"]["subcategories"]["Insert"],
    "order"
  >
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const supabase = await createClient();

  // 1️⃣ 현재 subcategories 테이블에서 가장 큰 order 값을 조회
  const { data: maxOrderData } = await supabase
    .from("subcategories")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0; // 최대 order 값이 없으면 기본값 0
  const newOrder = maxOrder + 100000; // 새로운 order 값

  // 2️⃣ 새로운 서브카테고리 생성
  const result = (await supabase
    .from("subcategories")
    .insert({ ...payload, order: newOrder }) // 자동 order 값 추가
    .select()
    .limit(1)
    .single()) as PostgrestSingleResponse<
    Database["public"]["Tables"]["subcategories"]["Row"]
  >;

  revalidateTag(
    CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
  );
  return result;
};

export const updateSubcategory = async (
  subcategory_id: string,
  payload: Partial<Database["public"]["Tables"]["subcategories"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("subcategories")
    .update(payload)
    .eq("id", subcategory_id)
    .select()
    .limit(1)
    .single();

  revalidateTag(
    CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
  );
  return result;
};

export const softDeleteSubcategory = async (
  subcategory_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("subcategories")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", subcategory_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .limit(1)
    .single();

  revalidateTag(
    CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
  );
  return result;
};

// 게시글 CRUD
const _getPostsBySubcategoryId = async (
  subcategory_id: string
): Promise<PostgrestResponse<Database["public"]["Tables"]["posts"]["Row"]>> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .select()
    .eq("subcategory_id", subcategory_id) // subcategory_id 일치
    .is("deleted_at", null) // 삭제되지 않은 게시글만 조회
    .not("released_at", "is", null) // released_at이 null이 아닌 것만 조회 (공개된 게시글)
    .order("order", { ascending: true }); // 최신순 정렬

  return result;
};

export const getPostsBySubcategoryId = createCachedFunction(
  CACHE_TAGS.POST.BY_SUBCATEGORY_ID(),
  _getPostsBySubcategoryId
);

export const _getPostByUrlSlug = async (
  url_slug: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .select()
    .eq("url_slug", url_slug) // URL 슬러그 일치
    .is("deleted_at", null) // 삭제되지 않은 게시글만 조회
    .not("released_at", "is", null) // 공개된 게시글만 조회
    .limit(1)
    .single(); // 단일 객체 반환

  return result;
};

export const getPostByUrlSlug = createCachedFunction(
  CACHE_TAGS.POST.BY_URL_SLUG(),
  _getPostByUrlSlug
);

export const createPost = async (
  payload: Omit<Database["public"]["Tables"]["posts"]["Insert"], "order">
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = await createClient();

  // 해당 subcategory_id 내에서 가장 큰 order 값을 조회
  const { data: maxOrderData } = await supabase
    .from("posts")
    .select("order")
    .eq("subcategory_id", payload.subcategory_id) // 같은 subcategory_id 내에서 조회
    .order("order", { ascending: false }) // order 기준 내림차순 정렬
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0; // 최대 order 값이 없으면 기본값 0
  const newOrder = maxOrder + 100000; // 새로운 order 값

  // 새로운 게시글 생성
  const result = (await supabase
    .from("posts")
    .insert({ ...payload, order: newOrder }) // 자동 order 값 추가
    .select()
    .limit(1)
    .single()) as PostgrestSingleResponse<
    Database["public"]["Tables"]["posts"]["Row"]
  >;

  revalidateTag(CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id));
  revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  return result;
};

export const updatePost = async (
  post_id: string,
  payload: Partial<Database["public"]["Tables"]["posts"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .update(payload)
    .eq("id", post_id)
    .select()
    .limit(1)
    .single();

  revalidateTag(CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id));
  revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  return result;
};

export const softDeletePost = async (
  post_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", post_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .limit(1)
    .single();

  revalidateTag(CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id));
  revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  return result;
};

export const AIActions = { createAISummary, getAISummaryByPostId };
export const CategoryActions = {
  getAllCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
};

export const SubcategoryActions = {
  getSubcategoriesByCategoryId,
  createSubcategory,
  updateSubcategory,
  softDeleteSubcategory,
};

export const PostActions = {
  getPostsBySubcategoryId,
  getPostByUrlSlug,
  createPost,
  updatePost,
  softDeletePost,
};

const ServerActions = {
  AIActions,
  CategoryActions,
  SubcategoryActions,
  PostActions,
};

export default ServerActions;

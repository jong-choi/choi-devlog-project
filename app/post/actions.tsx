"use server";
import { Database } from "@/types/supabase";
import {
  CACHE_TAGS,
  createCachedFunction,
  createWithInvalidation,
} from "@/utils/nextCache";

import { createClient } from "@/utils/supabase/client"; //nextCache를 사용하기 위해 client로...
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

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

const _createAISummary = async (
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

export const createAISummary = createWithInvalidation(
  _createAISummary,
  async () => {
    // AI 요약 캐시 무효화 로직이 필요한 경우 여기에 추가 가능
    // 예: revalidateTag(CACHE_TAGS.AI_SUMMARY.BY_POST_ID(payload.post_id));
  }
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

const _createCategory = async (
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

  return result;
};

export const createCategory = createWithInvalidation(
  _createCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  }
);

const _updateCategory = async (
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

  return result;
};

export const updateCategory = createWithInvalidation(
  _updateCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  }
);

const _softDeleteCategory = async (
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

  return result;
};

export const softDeleteCategory = createWithInvalidation(
  _softDeleteCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  }
);

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

const _createSubcategory = async (
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
  const result = await supabase
    .from("subcategories")
    .insert({ ...payload, order: newOrder }) // 자동 order 값 추가
    .select()
    .limit(1)
    .single();

  return result;
};

export const createSubcategory = createWithInvalidation(
  _createSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
  }
);

const _updateSubcategory = async (
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

  return result;
};

export const updateSubcategory = createWithInvalidation(
  _updateSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
  }
);

const _softDeleteSubcategory = async (
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

  return result;
};

export const softDeleteSubcategory = createWithInvalidation(
  _softDeleteSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
  }
);

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

const _getPostByUrlSlug = async (
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

const _createPost = async (
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
  const result = await supabase
    .from("posts")
    .insert({ ...payload, order: newOrder }) // 자동 order 값 추가
    .select()
    .limit(1)
    .single();

  return result;
};

export const createPost = createWithInvalidation(
  _createPost,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id)
    );
    revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  }
);

const _updatePost = async (
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

  return result;
};

export const updatePost = createWithInvalidation(
  _updatePost,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id)
    );
    revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  }
);

const _softDeletePost = async (
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

  return result;
};

export const softDeletePost = createWithInvalidation(
  _softDeletePost,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.POST.BY_SUBCATEGORY_ID(result.data?.subcategory_id)
    );
    revalidateTag(CACHE_TAGS.POST.BY_URL_SLUG(result.data?.url_slug));
  }
);

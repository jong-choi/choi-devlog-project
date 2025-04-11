"use server";
import { Database } from "@/types/supabase";
import { createWithInvalidation, CACHE_TAGS } from "@/utils/nextCache";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getUniqueSlug } from "@/app/post/actions";

const _createSubcategory = async (
  payload: Omit<
    Database["public"]["Tables"]["subcategories"]["Insert"],
    "order"
  >
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 1️⃣ 현재 subcategories 테이블에서 가장 큰 order 값을 조회
  const { data: maxOrderData } = await supabase
    .from("subcategories")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0; // 최대 order 값이 없으면 기본값 0
  const newOrder = maxOrder + 100000; // 새로운 order 값

  const uniqueSlug = await getUniqueSlug({
    baseSlug: payload.url_slug,
    supabaseClient: supabase,
    table: "subcategories",
  });
  // 2️⃣ 새로운 서브카테고리 생성
  const result = await supabase
    .from("subcategories")
    .insert({ ...payload, order: newOrder, url_slug: uniqueSlug }) // 자동 order 값 추가
    .select()
    .single();

  return result;
};

export const createSubcategory = createWithInvalidation(
  _createSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
    revalidateTag(CACHE_TAGS.SUBCATEGORY.ALL());
  }
);

const _updateSubcategory = async (
  subcategory_id: string,
  payload: Partial<Database["public"]["Tables"]["subcategories"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  if (payload.url_slug) {
    const uniqueSlug = await getUniqueSlug({
      baseSlug: payload.url_slug,
      supabaseClient: supabase,
      table: "subcategories",
      id: payload.id,
    });
    payload.url_slug = uniqueSlug;
  }
  const result = await supabase
    .from("subcategories")
    .update(payload)
    .eq("id", subcategory_id)
    .select()
    .single();

  return result;
};

export const updateSubcategory = createWithInvalidation(
  _updateSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
    revalidateTag(CACHE_TAGS.SUBCATEGORY.ALL());
  }
);

const _softDeleteSubcategory = async (
  subcategory_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("subcategories")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", subcategory_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .single();

  return result;
};

export const softDeleteSubcategory = createWithInvalidation(
  _softDeleteSubcategory,
  async (result) => {
    revalidateTag(
      CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(result.data?.category_id || "")
    );
    revalidateTag(CACHE_TAGS.SUBCATEGORY.ALL());
  }
);

"use server";

import { Database } from "@/types/supabase";
import { createWithInvalidation, CACHE_TAGS } from "@/utils/nextCache";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const _createCategory = async (
  payload: Omit<Database["public"]["Tables"]["categories"]["Insert"], "order">
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: maxOrderData } = await supabase
    .from("categories")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0;
  const newOrder = maxOrder + 100000;

  const result = await supabase
    .from("categories")
    .insert({ ...payload, order: newOrder })
    .select()
    .single();

  return result;
};

export const createCategory = createWithInvalidation(
  _createCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
    revalidateTag(CACHE_TAGS.SIDEBAR.CATEGORY());
  }
);

const _updateCategory = async (
  category_id: string,
  payload: Partial<Database["public"]["Tables"]["categories"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("categories")
    .update(payload)
    .eq("id", category_id)
    .select()
    .single();

  return result;
};

export const updateCategory = createWithInvalidation(
  _updateCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
    revalidateTag(CACHE_TAGS.SIDEBAR.CATEGORY());
  }
);

const _softDeleteCategory = async (
  category_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", category_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .single();

  return result;
};

export const softDeleteCategory = createWithInvalidation(
  _softDeleteCategory,
  async () => {
    revalidateTag(CACHE_TAGS.CATEGORY.ALL());
  }
);

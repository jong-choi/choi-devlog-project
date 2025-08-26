"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { CACHE_TAGS, createWithInvalidation } from "@/utils/nextCache";
import { createClient } from "@/utils/supabase/server";

export type UpdateOrdersPayload = {
  mode: "categories" | "subcategories" | "posts";
  data: { id: string; order: number | null }[];
};

export const _updateOrders = async (
  payload: UpdateOrdersPayload,
): Promise<PostgrestSingleResponse<UpdateOrdersPayload>> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const result = await supabase.rpc(`batch_update_orders_for_${payload.mode}`, {
    data: payload.data,
  });

  if (result.error) {
    return result;
  }

  const parsedData =
    typeof result.data === "string"
      ? JSON.parse(result.data)
      : (result.data ?? []);

  return {
    ...result,
    data: {
      mode: payload.mode,
      data: parsedData,
    },
  };
};

export const updateOrders = createWithInvalidation(
  _updateOrders,
  async (result) => {
    if (result.data?.mode === "posts") {
      revalidateTag(CACHE_TAGS.POST.ALL());
    } else if (result.data?.mode) {
      revalidateTag(CACHE_TAGS.SIDEBAR.CATEGORY());
    }
  },
);

// 비밀글 조회: 로그인된 사용자 기준으로만 반환
export const fetchPrivatePosts = async () => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const result = await supabase
    .from("posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id",
    )
    .eq("is_private", true)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("order", { ascending: true });

  return result.data ?? [];
};

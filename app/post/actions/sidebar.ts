"use server";
import { CACHE_TAGS, createWithInvalidation } from "@/utils/nextCache";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

type UpdateOrdersPayload = {
  mode: "categories" | "subcategories" | "posts";
  data: { id: string; order: number | null }[];
};

export const _updateOrders = async (
  payload: UpdateOrdersPayload
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
      : result.data ?? [];

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
  }
);

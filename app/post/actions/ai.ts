"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, createWithInvalidation } from "@/utils/nextCache";
import { createClient } from "@/utils/supabase/server";

const _createAISummary = async (
  payload: Omit<
    Database["public"]["Tables"]["ai_summaries"]["Insert"],
    "vector"
  > & { vector: number[] | null },
): Promise<
  PostgrestSingleResponse<
    Database["public"]["Tables"]["ai_summaries"]["Insert"]
  >
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { vector, ...rest } = payload;
  const result = await supabase
    .from("ai_summaries")
    .upsert(rest, { onConflict: "post_id" })
    .select()
    .single();

  let vecResult = null;
  if (result.data?.id) {
    vecResult = await supabase
      .from("ai_summary_vectors")
      //@ts-expect-error : vector값이 불일치
      .upsert(
        {
          summary_id: result.data.id,
          vector,
        },
        { onConflict: "summary_id" },
      )
      .select()
      .single();
  } else {
    console.error(result.error);
  }

  if (vecResult && !vecResult?.data) {
    return vecResult;
  }

  return result;
};

export const createAISummary = createWithInvalidation(
  _createAISummary,
  async (result) => {
    revalidateTag(CACHE_TAGS.AI_SUMMARY.BY_POST_ID(result.data?.post_id || ""));
  },
);

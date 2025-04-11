"use server";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, createWithInvalidation } from "@/utils/nextCache";
import { createClient as createClientClient } from "@/utils/supabase/client";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const _createTagsByPostId = async (payload: {
  id: string;
  summary: string;
  post_id: string;
}): Promise<{
  post_id: string;
  message: string;
  success: number;
  failed: number;
  skipped: number;
  failedPosts: string[];
  skippedPosts: string[];
}> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  if (!(await supabase.auth.getSession()).data.session?.user) {
    throw new Error("태그 생성 실패: 인증되지 않은 사용자");
  }
  const { id, summary, post_id } = payload;
  const tagResponse = await fetch("/api/summary/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, summary, post_id }),
  });

  const tagResult = await tagResponse.json();
  if (!tagResponse.ok) {
    const errorData = tagResult as { error: string };
    throw new Error(errorData.error || "태그 생성 실패");
  }
  tagResult.post_id = post_id;

  return tagResult;
};

export const createTagsByPostId = createWithInvalidation(
  _createTagsByPostId,
  async (result) => {
    revalidateTag(CACHE_TAGS.AI_SUMMARY.BY_POST_ID(result.post_id || ""));
  }
);

interface GetUniqueSlugParams {
  baseSlug: string;
  table: keyof Pick<Database["public"]["Tables"], "posts" | "subcategories">;
  supabaseClient?: SupabaseClient;
  id?: string;
}
// url_slug 중복 방지
export const getUniqueSlug = async ({
  baseSlug,
  table,
  supabaseClient,
  id,
}: GetUniqueSlugParams) => {
  const supabase = supabaseClient || createClientClient();

  let query = supabase
    .from(table)
    .select("url_slug")
    .like("url_slug", `${baseSlug}%`);

  if (id) {
    query = query.neq("id", id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Error fetching slugs from the database");
  }

  if (!data || data.length === 0) return baseSlug;

  const existingSlugs = new Set(data.map((row) => row.url_slug));

  let count = 1;
  let slug = baseSlug;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

const _createPost = async (
  payload: Omit<Database["public"]["Tables"]["posts"]["Insert"], "order">
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
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

  const uniqueSlug = await getUniqueSlug({
    baseSlug: payload.url_slug,
    supabaseClient: supabase,
    table: "posts",
  });
  // 새로운 게시글 생성
  const result = await supabase
    .from("posts")
    .insert({ ...payload, order: newOrder, url_slug: uniqueSlug }) // 자동 order 값 추가
    .select()
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
    revalidateTag(CACHE_TAGS.POST.ALL());
  }
);

const _updatePost = async (
  post_id: string,
  payload: Partial<Database["public"]["Tables"]["posts"]["Update"]>
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  if (payload.url_slug) {
    const uniqueSlug = await getUniqueSlug({
      baseSlug: payload.url_slug || "",
      supabaseClient: supabase,
      table: "posts",
      id: post_id,
    });
    payload.url_slug = uniqueSlug;
  }

  const result = await supabase
    .from("posts")
    .update(payload)
    .eq("id", post_id)
    .select()
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
    revalidateTag(CACHE_TAGS.POST.ALL());
  }
);

const _softDeletePost = async (
  post_id: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", post_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
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
    revalidateTag(CACHE_TAGS.POST.ALL());
  }
);

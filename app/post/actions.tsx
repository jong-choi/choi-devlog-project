"use server";
import { Category, Post, SidebarSelectedData } from "@/types/post";
import { Database } from "@/types/supabase";
import {
  CACHE_TAGS,
  createCachedFunction,
  createWithInvalidation,
} from "@/utils/nextCache";

import { createClient as createClientClient } from "@/utils/supabase/client"; //nextCache를 사용하기 위해 client로...
import { createClient } from "@/utils/supabase/server";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const _getAISummaryByPostId = async (
  post_id?: string
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["ai_summaries"]["Row"]>
> => {
  const supabase = createClientClient();
  const result = await supabase
    .from("ai_summaries")
    .select()
    .eq("post_id", post_id || "") // 특정 게시글에 대한 요약만 조회
    .order("created_at", { ascending: false }) // 최신 요약이 가장 위로 오도록 정렬
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
      vector: string | null;
    }
  >
> => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("ai_summaries")
    //@ts-expect-error : vector값이 불일치
    .insert(payload)
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
    .limit(1)
    .single();

  return result;
};

export const createAISummary = createWithInvalidation(
  _createAISummary,
  async (result) => {
    revalidateTag(CACHE_TAGS.AI_SUMMARY.BY_POST_ID(result.data?.post_id || ""));
  }
);

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

const _getRecommendedByPostId = async (
  post_id: string
): Promise<
  PostgrestResponse<
    Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
  >
> => {
  const supabase = createClientClient();
  const result = await supabase
    .from("post_similarities_with_target_info")
    .select()
    .eq("source_post_id", post_id) // 특정 게시글에 대한 요약만 조회
    .order("similarity", { ascending: false }); // 최신 요약이 가장 위로 오도록 정렬

  return result;
};

export const getRecommendedByPostId = createCachedFunction(
  CACHE_TAGS.AI_SUMMARY.BY_POST_ID(),
  _getRecommendedByPostId
);

// 사이드바
const _getSidebarCategory = async (): Promise<PostgrestResponse<Category>> => {
  const supabase = createClientClient();
  const result = await supabase
    .from("categories")
    .select(
      `
  id,
  name,
  order,
  subcategories (
    id,
    name,
    order
  )
  `
    )
    .order("order", { ascending: true }) // categories를 order 기준으로 정렬
    .select("id, name, order, subcategories!inner(id, name, order)")
    .order("order", { ascending: true, referencedTable: "subcategories" });

  return result;
};

export const getSidebarCategory = createCachedFunction(
  CACHE_TAGS.SIDEBAR.CATEGORY(),
  _getSidebarCategory,
  [CACHE_TAGS.CATEGORY.ALL(), CACHE_TAGS.SUBCATEGORY.ALL()]
);

const _getSelectedCategoriesByUrl = async (
  urlSlug: string,
  ...arg: boolean[]
): Promise<PostgrestSingleResponse<SidebarSelectedData>> => {
  const supabase = createClientClient();
  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  let query = supabase
    .from("posts")
    .select(
      `
    id,
    url_slug,
    title,
    short_description,
    is_private,
    order,
    subcategories (
      id, name, order,
      categories ( id, name, order,
        subcategories ( id, name, order)
      )
    )
  `
    )
    .eq("url_slug", urlSlug)
    .is("deleted_at", null);

  if (!isValid) {
    query = query.or("is_private.is.false,is_private.is.null");
  }

  const result = (await query.limit(1).single()) as PostgrestSingleResponse<{
    id: unknown;
    url_slug: unknown;
    title: unknown;
    short_description: unknown;
    is_private: unknown;
    order: unknown;
    subcategories: {
      id: unknown;
      name: unknown;
      order: unknown;
      categories: {
        id: unknown;
        name: unknown;
        order: unknown;
        subcategories: {
          id: unknown;
          name: unknown;
          order: unknown;
        }[];
      };
    };
  }>;
  if (!result.data) return result;
  const data = result.data;

  const parsedDate = {
    post: {
      id: data.id,
      url_slug: data.url_slug,
      title: data.title,
      short_description: data.short_description,
      is_private: data.is_private,
    },
    subcategory: {
      id: data.subcategories.id,
      name: data.subcategories.name,
      order: data.subcategories.order,
    },
    category: {
      id: data.subcategories.categories.id,
      name: data.subcategories.categories.name,
      order: data.subcategories.categories.order,
      subcategories: data.subcategories.categories.subcategories,
    },
  };
  const parsedResult = { ...result, data: parsedDate as SidebarSelectedData };
  return parsedResult;
};

const _getPostsBySubcategoryId = async (
  subcategoryId: string,
  ...arg: boolean[]
): Promise<PostgrestResponse<Post>> => {
  const supabase = createClientClient();
  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  const result = await supabase
    .from("posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id"
    )
    .is("deleted_at", null)
    .eq("subcategory_id", subcategoryId)
    .or(
      isValid
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .order("order", { ascending: true });

  return result;
};

export const getPostsBySubcategoryId = createCachedFunction(
  CACHE_TAGS.POST.BY_SUBCATEGORY_ID(),
  _getPostsBySubcategoryId
);

export const getSelectedCategoriesByUrl = createCachedFunction(
  CACHE_TAGS.SIDEBAR.SELECTED_BY_URL_SLUG(),
  _getSelectedCategoriesByUrl,
  [CACHE_TAGS.CATEGORY.ALL(), CACHE_TAGS.SUBCATEGORY.ALL()]
);

// 대분류 CRUD
const _getAllCategories = async (): Promise<
  PostgrestResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const supabase = createClientClient();
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
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 현재 가장 큰 order 값을 조회
  const { data: maxOrderData } = await supabase
    .from("categories")
    .select("order")
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("categories")
    .update(payload)
    .eq("id", category_id)
    .select()
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() }) // Soft Delete
    .eq("id", category_id)
    .is("deleted_at", null) // 이미 삭제되지 않은 항목만 처리
    .select()
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
  const supabase = createClientClient();
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

// 중분류 CRUD
const _getSubcategories = async (): Promise<
  PostgrestResponse<Database["public"]["Tables"]["subcategories"]["Row"]>
> => {
  const supabase = createClientClient();
  const result = await supabase
    .from("subcategories")
    .select()
    .is("deleted_at", null) // 삭제되지 않은 항목만 조회
    .order("order", { ascending: true }); // order 기준 오름차순 정렬

  return result;
};

export const getSubcategories = createCachedFunction(
  CACHE_TAGS.SUBCATEGORY.ALL(),
  _getSubcategories
);

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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
  const result = await supabase
    .from("subcategories")
    .update(payload)
    .eq("id", subcategory_id)
    .select()
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    revalidateTag(CACHE_TAGS.SUBCATEGORY.ALL());
  }
);

// // 게시글 CRUD
// const _getPostsBySubcategoryId = async (
//   subcategory_id: string
// ): Promise<PostgrestResponse<Database["public"]["Tables"]["posts"]["Row"]>> => {
//     const cookieStore = await cookies()
// const supabase = await createClient(cookieStore);
//   const result = await supabase
//     .from("posts")
//     .select()
//     .eq("subcategory_id", subcategory_id) // subcategory_id 일치
//     .is("deleted_at", null) // 삭제되지 않은 게시글만 조회
//     .not("released_at", "is", null) // released_at이 null이 아닌 것만 조회 (공개된 게시글)
//     .order("order", { ascending: true }); // 최신순 정렬

//   return result;
// };

// export const getPostsBySubcategoryId = createCachedFunction(
//   CACHE_TAGS.POST.BY_SUBCATEGORY_ID(),
//   _getPostsBySubcategoryId
// );

const _getPostByUrlSlug = async (
  url_slug: string,
  ...arg: boolean[]
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = createClientClient();
  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  const result = await supabase
    .from("posts")
    .select()
    .eq("url_slug", url_slug) // URL 슬러그 일치
    .is("deleted_at", null) // 삭제되지 않은 게시글만 조회
    .or(
      isValid
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    ) // 공개된 게시글만 조회
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
    .limit(1)
    .single(); // 단일 객체 반환

  return result;
};

export const getPostByUrlSlug = createCachedFunction(
  CACHE_TAGS.POST.BY_URL_SLUG(),
  _getPostByUrlSlug
);

// url_slug 중복 방지
const generateUniqueSlug = async (
  baseSlug: string,
  supabaseClient?: SupabaseClient,
  postId?: string
) => {
  const supabase = supabaseClient || createClientClient();

  let query = supabase
    .from("posts")
    .select("url_slug")
    .like("url_slug", `${baseSlug}%`);

  if (postId) {
    query = query.neq("id", postId);
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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
    .order("order", { ascending: false }) // order 기준 내림차순 정렬
    .limit(1)
    .single();

  const maxOrder = maxOrderData?.order ?? 0; // 최대 order 값이 없으면 기본값 0
  const newOrder = maxOrder + 100000; // 새로운 order 값

  const uniqueSlug = await generateUniqueSlug(payload.url_slug, supabase);
  // 새로운 게시글 생성
  const result = await supabase
    .from("posts")
    .insert({ ...payload, order: newOrder, url_slug: uniqueSlug }) // 자동 order 값 추가
    .select()
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
  const uniqueSlug = await generateUniqueSlug(
    payload.url_slug || "",
    supabase,
    post_id
  );

  const result = await supabase
    .from("posts")
    .update({ ...payload, url_slug: uniqueSlug })
    .eq("id", post_id)
    .select()
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    .order("id", { ascending: false }) // 추가 정렬 (유니크)
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
    revalidateTag(CACHE_TAGS.POST.ALL());
  }
);

const _getSidebarPosts = async (
  ...arg: boolean[]
): Promise<PostgrestResponse<Post>> => {
  const supabase = createClientClient();
  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  const result = await supabase
    .from("posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id"
    )
    .is("deleted_at", null)
    .or(
      isValid
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .order("order", { ascending: true });

  return result;
};

export const getSidebarPosts = createCachedFunction(
  CACHE_TAGS.POST.ALL(),
  _getSidebarPosts
);

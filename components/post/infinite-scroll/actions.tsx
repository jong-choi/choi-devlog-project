"use server";

import { PostTags, GraphPost } from "@/types/graph";
import { CardPost } from "@/types/post";
import { createClient } from "@/utils/supabase/server";

interface GetPostsParams {
  page: number;
  limit?: number;
  search?: string;
}

export const getPosts = async ({
  page,
  limit = 10,
  search = "",
}: GetPostsParams) => {
  const supabase = await createClient();
  const query = supabase
    .from("posts")
    .select("id, title, short_description, thumbnail, released_at, url_slug")
    .or("is_private.is.null,is_private.is.false")
    .order("released_at", { ascending: false });

  // 검색 조건 처리
  if (search) {
    query.ilike("title", `%${search}%`);
  }

  query.range(page * limit, (page + 1) * limit - 1);

  const { data: posts, error: postError } = await query;

  if (postError || !posts)
    throw new Error("게시글 데이터를 불러올 수 없습니다.");

  const postIds = posts.map((post) => post.id);
  // 4. 태그 붙이기
  const { data: taggedPosts, error: tagError } = await supabase
    .from("post_tags")
    .select("post_id, tags(id, name)")
    .in("post_id", postIds);

  if (tagError || !taggedPosts)
    throw new Error("태그 데이터를 불러올 수 없습니다.");

  // 5. short_description 없는 post만 추려서 AI summary 가져오기
  const missingDescIds = posts
    .filter((p) => !p.short_description)
    .map((p) => p.id);

  const { data: aiSummaries, error: summaryError } = await supabase
    .from("ai_summaries")
    .select("post_id, summary")
    .in("post_id", missingDescIds);

  if (summaryError || !aiSummaries)
    throw new Error("AI 요약 데이터를 불러올 수 없습니다.");

  // 6. post_id → tags[] 맵
  const postTagsMap = new Map<string, PostTags[]>();
  for (const item of taggedPosts) {
    if (!item.tags) continue;
    if (!postTagsMap.has(item.post_id)) {
      postTagsMap.set(item.post_id, []);
    }
    postTagsMap.get(item.post_id)!.push(item.tags);
  }

  // 7. post_id → summary 맵
  const summaryMap = new Map<string, string>();
  for (const item of aiSummaries) {
    if (item.post_id && item.summary) {
      summaryMap.set(item.post_id, item.summary);
    }
  }

  // 8. posts에 tags + summary 붙이기
  const postMap = new Map<string, GraphPost & { tags: PostTags[] }>();

  for (const post of posts) {
    postMap.set(post.id, {
      ...post,
      short_description:
        post.short_description ?? summaryMap.get(post.id) ?? null,
      tags: postTagsMap.get(post.id) ?? [],
    });
  }

  const result: CardPost[] = posts.map((post) => {
    return {
      ...post,
      short_description:
        post.short_description ?? summaryMap.get(post.id) ?? null,
      tags: postTagsMap.get(post.id) ?? [],
    };
  });

  return result;
};

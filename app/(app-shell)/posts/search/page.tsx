import { Metadata } from "next";
import { redirect } from "next/navigation";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";
import { CardPost } from "@/types/post";
import { PostTags } from "@/types/graph";
import { SemanticSearchResult } from "@/types/semantic-search";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ keyword: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const keyword = decodeURIComponent((await searchParams).keyword);
  return {
    title: `검색 - ${keyword}`,
    description: `"${keyword}"로 검색한 결과입니다.`,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const keyword = decodeURIComponent((await searchParams).keyword);
  if (!keyword) return redirect("/post");

  // 시멘틱 서치 API 호출
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/semantic-search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: keyword,
        overSampleCount: 10,
        maxResults: 10,
        minResults: 0,
      }),
    },
  );

  let postLists: CardPost[] = [];

  if (response.ok) {
    const data = await response.json();
    // 시멘틱 서치 결과를 CardPost 형식으로 변환
    postLists =
      data.results?.map((result: SemanticSearchResult) => ({
        id: result.post_id,
        title: result.title,
        short_description: result.short_description,
        thumbnail: result.thumbnail,
        released_at: result.released_at,
        url_slug: result.url_slug,
        snippet: result.chunk_content, // chunk_content를 snippet으로 매핑
        tags: result.tags as PostTags[] | null,
      })) || [];
  }

  return <PostsPageRenderer keyword={keyword} initialPosts={postLists} />;
}

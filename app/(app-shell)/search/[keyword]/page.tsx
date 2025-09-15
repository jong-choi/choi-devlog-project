import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import { PostTags } from "@/types/graph";
import { CardPost } from "@/types/post";
import {
  HybridSearchRequest,
  SemanticSearchResult,
} from "@/types/semantic-search";
import { withJosa } from "@/utils/withJosa";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const keyword = decodeURIComponent((await params).keyword);
  return {
    title: `검색 - ${keyword}`,
    description: `"${keyword}"로 검색한 결과입니다.`,
  };
}

export default async function SearchPage({ params }: PageProps) {
  const keyword = decodeURIComponent((await params).keyword);
  if (!keyword) return redirect("/post");
  const req: HybridSearchRequest = {
    query: keyword,
    overSampleCount: 10,
    maxResults: 10,
    minResults: 0,
    minThreshold: 0.2,
  };
  // 시멘틱 서치 API 호출
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/semantic-search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );

  let initialPosts: CardPost[] = [];

  if (response.ok) {
    const data = await response.json();
    initialPosts =
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

  return (
    <>
      <span className="text-sm text-color-base">
        {`${withJosa(`"${keyword}"`, ["으로", "로"])} 검색한 결과${
          initialPosts.length > 0 ? "입니다." : "가 없습니다."
        }`}
      </span>
      {initialPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}

export const dynamic = "force-dynamic";
import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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
  if (!keyword) return redirect("/posts");

  const { data: postLists } = await getPublishedPosts({ page: 0, keyword });
  return <PostsPageRenderer keyword={keyword} initialPosts={postLists || []} />;
}

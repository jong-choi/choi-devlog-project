export const dynamic = "force-dynamic";
import { getPosts } from "@/components/posts/infinite-scroll/actions";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ keyword: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const keyword = decodeURIComponent((await searchParams).keyword);
  if (!keyword) return redirect("/posts");

  const { data: postLists } = await getPosts({ page: 0, keyword });
  return <PostsPageRenderer keyword={keyword} initialPosts={postLists || []} />;
}

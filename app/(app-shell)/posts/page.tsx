import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "게시글 목록",
    description: "Scribbly의 최신 게시글입니다.",
  };
}

export default async function PostsPage() {
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  return <PostsPageRenderer initialPosts={postLists || []} />;
}

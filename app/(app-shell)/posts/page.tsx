import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function PostsPage() {
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  return <PostsPageRenderer initialPosts={postLists || []} />;
}

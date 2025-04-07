import { getPosts } from "@/components/posts/infinite-scroll/actions";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function PostsPage() {
  const { data: postLists } = await getPosts({ page: 0 });

  return <PostsPageRenderer initialPosts={postLists || []} />;
}

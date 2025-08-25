import { PostCard } from "@/components/posts/post-card";
import { useInfinitePostsStore } from "@/providers/infinite-posts-provider";
import { useShallow } from "zustand/react/shallow";

export function ScrollCard({ id }: { id: string }) {
  const post = useInfinitePostsStore(
    useShallow((store) => {
      return store.posts.find((post) => post.id === id);
    })
  );
  if (!post) return null;
  return <PostCard key={id} post={post} />;
}

import { PostCard } from "@/components/post/post-list/post-card";
import { CardPost } from "@/types/post";
import { GlassBox } from "@ui/glass-container";

export function LatestPostsSection({ posts }: { posts: CardPost[] }) {
  const [firstPost, secondPost, ...restPosts] = posts;

  return (
    <GlassBox className="w-full flex flex-col lg:flex-row gap-4 p-4">
      {/* 첫번째 큰 카드 */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <PostCard post={firstPost} isFeatured />
        <PostCard post={secondPost} />
      </div>
      {/* 나머지 작은 카드들 */}
      <div className="flex flex-col gap-2 md:justify-between flex-1">
        {restPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </GlassBox>
  );
}

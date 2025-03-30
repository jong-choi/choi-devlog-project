import { PostCard } from "@/components/post/post-list/post-card";
import { CardPost } from "@/types/post";
import { GlassBox } from "@ui/glass-container";

export function LatestPostsSection({
  posts,
  limit = 10,
}: {
  posts: CardPost[];
  limit?: number;
}) {
  const sliced = posts.slice(0, limit);
  if (sliced.length === 0) return null;

  const [first, ...rest] = sliced;

  return (
    <GlassBox className="w-full p-4 bg-glass-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 첫 번째 카드: 세로 2칸 차지 */}
        {first && (
          <div className="md:row-span-2">
            <PostCard post={first} isFeatured />
          </div>
        )}
        {/* 나머지 카드들 */}
        {rest.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </GlassBox>
  );
}

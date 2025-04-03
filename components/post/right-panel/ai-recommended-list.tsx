import { Post } from "@/types/post";
import Link from "next/link";

export default function AiRecommendedList({ posts }: { posts: Post[] }) {
  return (
    <div className="hidden md:flex flex-col border-x border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden w-full">
      <div className="px-4 w-full overflow-auto space-y-1 scrollbar flex flex-col">
        <div className="flex flex-col px-3 pb-2">
          <div className="font-extralight select-none">추천 게시글</div>
          <div className="select-none text-sm">
            ✨ 유사도 분석으로 찾은 추천 게시글입니다.
          </div>
        </div>
        <hr />
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.url_slug}`}
            className="block px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-100  transition"
          >
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

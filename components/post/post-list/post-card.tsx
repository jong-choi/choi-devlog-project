import { Logo } from "@/components/post/topBar/post-top-bar";
import { formatKoreanDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GraphPost, PostTags } from "@/types/graph";
import Image from "next/image";

export function PostCard({
  post,
  isFeatured = false,
}: {
  post: GraphPost & { tags: PostTags[] };
  isFeatured?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full bg-glass-bg text-base backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-glass-border",
        isFeatured ? "lg:w-1/2 flex flex-col lg:flex-row" : ""
      )}
    >
      {/* 이미지 영역 */}
      {isFeatured && (
        <div className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:h-auto">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className=" bg-glass-neutral w-full h-full flex justify-center items-center">
              <Logo />
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "p-6 flex flex-col justify-between",
          isFeatured && "lg:w-1/2"
        )}
      >
        {/* 태그 */}
        <div className="text-sm mb-2 hidden md:flex gap-2 flex-wrap">
          <span>📎</span>
          {post.tags.slice(0, 5).map((tag) => (
            <span key={tag.id} className="bg-glass-primary px-2 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>

        {/* 제목 + 설명 + 날짜 */}
        <div className={cn("flex flex-col", !isFeatured && "flex-row")}>
          <div className="flex-1">
            <h3
              className={cn(
                "font-bold",
                isFeatured ? "text-2xl lg:text-3xl" : "text-lg"
              )}
            >
              {post.title}
            </h3>
            <p
              className={cn(
                "whitespace-pre-line",
                isFeatured ? "text-base line-clamp-6" : "text-sm line-clamp-3"
              )}
            >
              {post.short_description
                ?.replaceAll("&#x3A;", ":")
                .replaceAll("https", "\nhttps")}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              🗓️ {formatKoreanDate(post.released_at || "")}
            </div>
          </div>
          {/* 일반 카드의 썸네일 */}
          {!isFeatured && post.thumbnail && (
            <div className="aspect-[3/2] w-[150px] mt-0 ml-4 relative overflow-hidden rounded-xl shadow-md flex-shrink-0">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

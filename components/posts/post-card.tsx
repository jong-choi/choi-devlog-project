import { Logo } from "@/components/ui/post-top-bar";
import { formatKoreanDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { PostTags } from "@/types/graph";
import { CardPost } from "@/types/post";
import { LinkLoader } from "@ui/route-loader";
import { Calendar, Paperclip } from "lucide-react";
import Image from "next/image";

export function PostCard({
  post,
  isFeatured = false,
}: {
  post: CardPost;
  isFeatured?: boolean;
}) {
  return (
    <LinkLoader
      href={`/post/${post.url_slug}`}
      className={cn(
        "w-full bg-glass-bg-80 text-color-base rounded-xl overflow-hidden shadow-glass transition-all duration-200 border border-glass-border cursor-pointer",
        isFeatured ? "flex flex-col lg:flex-row lg:flex-1 h-full" : "flex"
      )}
    >
      {/* 이미지 영역 */}
      {isFeatured && (
        <div className="aspect-[3/2] w-full lg:w-1/2 mt-0  relative overflow-hidden shadow-glass flex-shrink-0">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title || ""}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 200px"
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
          "p-6 flex flex-col gap-1 w-full",
          isFeatured && "lg:w-1/2"
        )}
      >
        {/* 태그 */}
        <div className="text-sm mb-2 hidden md:flex gap-2 flex-wrap items-center">
          <span className="text-xs text-color-muted">
            <Paperclip className="w-4 h-4 -scale-x-100" />
          </span>
          {post.tags?.slice(0, 3).map((tag) => {
            const safeTag = tag as PostTags;
            return (
              <span
                key={safeTag.id}
                className="bg-glass-primary px-2 text-xs rounded-full"
              >
                {safeTag.name}
              </span>
            );
          })}
        </div>

        {/* 제목 + 설명 + 날짜 */}
        <div className={cn("flex flex-col flex-1", !isFeatured && "flex-row")}>
          <div className="flex-1 flex flex-col justify-between gap-2">
            <h3
              className={cn(
                "font-bold line-clamp-2",
                isFeatured ? "text-xl lg:text-2xl" : "text-lg"
              )}
            >
              {post.title}
            </h3>
            {post.snippet ? (
              <p
                className={cn(
                  "whitespace-pre-line",
                  isFeatured ? "text-base line-clamp-6" : "text-sm line-clamp-2"
                )}
                dangerouslySetInnerHTML={{ __html: post.snippet }}
              />
            ) : (
              <p
                className={cn(
                  "whitespace-pre-line",
                  isFeatured ? "text-base line-clamp-6" : "text-sm line-clamp-2"
                )}
              >
                {post.short_description
                  ?.replaceAll("&#x3A;", ":")
                  .replaceAll("https", "\nhttps")}
              </p>
            )}
            <div className="text-sm text-gray-500 flex gap-1 items-center">
              <span className="text-xs text-color-muted">
                <Calendar className="w-4 h-4" />
              </span>
              <span>{formatKoreanDate(post.released_at || "")}</span>
            </div>
          </div>
          {/* 일반 카드의 썸네일 */}
          {!isFeatured && post.thumbnail && (
            <div className="aspect-[3/2] w-[150px] mt-0 ml-4 relative overflow-hidden border border-glass-border flex-shrink-0">
              <Image
                src={post.thumbnail}
                alt={post.title || ""}
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          )}
        </div>
      </div>
    </LinkLoader>
  );
}

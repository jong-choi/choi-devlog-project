import Image from "next/image";
import { Series } from "@/types/series";
import { formatKoreanDate } from "@/lib/date";

export function SeriesInfoPanel({ series }: { series: Series }) {
  const { name, description, latest_post_date, thumbnail, post_count } = series;

  return (
    <div className="w-full pt-2 md:pt-0 bg-glass-bg text-color-base border border-glass-border shadow-glass flex flex-col md:flex-row justify-between overflow-hidden">
      {/* 왼쪽 썸네일 */}
      {thumbnail && (
        <div className="aspect-[3/2] w-full max-w-[250px] mx-auto relative overflow-hidden border border-glass-border flex-shrink-0">
          <Image
            src={thumbnail}
            alt={name ?? thumbnail}
            fill
            className="object-cover"
            sizes="144px"
          />
        </div>
      )}
      {/* 오른쪽 텍스트 */}
      <div className="flex flex-col flex-1 min-w-0 justify-between p-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-extrabold text-3xl line-clamp-2">{name}</h3>
          <p className="whitespace-pre-line">{description}</p>
        </div>
        <div className="flex gap-4 divide-x">
          {latest_post_date && (
            <div className="flex flex-col gap-1 text-sm text-color-muted mt-2">
              <span>최근 연재일</span>
              <span>{formatKoreanDate(latest_post_date || "")}</span>
            </div>
          )}
          {post_count && (
            <div className="flex flex-col gap-1 text-sm text-color-muted mt-2 pl-4">
              <span>연재수</span>
              <span>{post_count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

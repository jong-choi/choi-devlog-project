"use client";
import { formatKoreanDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Series } from "@/types/series";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@ui/carousel";
import Image from "next/image";

export default function SeriesCarousel({
  seriesList,
  setSeries,
}: {
  seriesList: Series[];
  setSeries?: (series: Series) => void;
}) {
  return (
    <div className="w-full flex flex-col">
      <Carousel className="w-full relative">
        {/* ✅ 캐러셀 컨텐츠 */}
        <CarouselContent className="md:pl-[3vw] lg:ml-3 xl:ml-1">
          {seriesList.map((series, index) => (
            <CarouselItem
              key={series.id}
              className="basis-1/1 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <div
                className="cursor-pointer"
                onClick={() => setSeries && setSeries(series)}
              >
                <SeriesCard series={series} index={index} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white shadow-md backdrop-blur-sm border border-gray-200" />
        <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white shadow-md backdrop-blur-sm border border-gray-200" />
      </Carousel>
    </div>
  );
}

// 2. 시리즈 카드 컴포넌트 (캐러셀용)
export const SeriesCard = ({
  series,
  index,
}: {
  series: Series;
  index: number;
}) => (
  <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden shadow-glass">
    {series.thumbnail && (
      <Image
        src={series.thumbnail}
        alt={series.name!}
        sizes="192px"
        fill
        className="object-cover"
        priority={index <= 5}
      />
    )}
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/50 to-black/90  p-4 text-white break-keep",
        !series.thumbnail && "bg-slate-300 dark:bg-slate-700 text-color-base"
      )}
    >
      <h3 className="font-bold text-lg line-clamp-2 mb-auto">{series.name}</h3>
      <div className="w-full flex flex-col items-end">
        {series.post_count && (
          <div className="flex gap-1 text-sm text-zinc-200">
            <span>{series.post_count}개의 게시글</span>
            <span></span>
          </div>
        )}
        {series.latest_post_date && (
          <div className="flex gap-1 text-sm text-zinc-200 mt-1">
            <span>
              {formatKoreanDate(series.latest_post_date || "").split(" ")[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

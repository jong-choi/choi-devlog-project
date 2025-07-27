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
import { LinkLoader } from "@ui/route-loader";
import { ClockFading } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function SeriesCarousel({
  seriesList,
}: {
  seriesList: Series[];
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
                // onClick={() => setSeries && setSeries(series)}
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
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative h-48 w-48 flex-shrink-0 cursor-pointer perspective-1000"
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* 앞면 */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full w-full overflow-hidden shadow-glass">
            {series.thumbnail && (
              <Image
                src={series.thumbnail}
                alt={series.name!}
                sizes="192px"
                fill
                className="object-cover"
                priority={index <= 3}
              />
            )}
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/50 to-black/90 p-4 text-white break-keep",
                !series.thumbnail &&
                  "bg-slate-300 dark:bg-slate-700 text-color-base"
              )}
            >
              <h3 className="font-bold text-lg line-clamp-2 mb-auto">
                {series.name}
              </h3>
              <div className="w-full flex flex-col items-end">
                {series.post_count && (
                  <div className="flex gap-1 text-sm text-zinc-200">
                    <span>{series.post_count}개의 게시글</span>
                    <span></span>
                  </div>
                )}
                {series.latest_post_date && (
                  <div className="flex gap-1 text-sm text-zinc-200 mt-1 items-center">
                    <ClockFading size={14} />
                    <span>
                      {
                        formatKoreanDate(series.latest_post_date || "").split(
                          " "
                        )[0]
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 뒷면 */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="relative h-full w-full overflow-hidden shadow-glass">
            {series.thumbnail && (
              <Image
                src={series.thumbnail}
                alt={series.name!}
                sizes="192px"
                fill
                className="object-cover"
                priority={index <= 3}
              />
            )}
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-white/80 to-white/95 p-4 text-gray-800 break-keep",
                !series.thumbnail &&
                  "bg-slate-100 dark:bg-slate-200 text-gray-800"
              )}
            >
              <div className="mb-auto">
                <h3 className="font-bold text-lg line-clamp-2">
                  {series.name}
                </h3>
                <div className="w-full flex flex-col items-start">
                  {series.post_count && (
                    <div className="flex gap-1 text-sm text-gray-600">
                      <span className="line-clamp-4">{series.description}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex flex-col items-end">
                <LinkLoader href={"/series/" + series.url_slug} className="">
                  <button className="w-full text-slate-700 border shadow-md border-blue-500/20 font-bold bg-blue-50 hover:bg-blue-100 transition-colors duration-300 px-3 py-1 text-sm">
                    보러 가기
                  </button>
                </LinkLoader>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

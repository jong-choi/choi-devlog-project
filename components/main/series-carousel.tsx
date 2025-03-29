import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@ui/carousel";
import { GlassBox } from "@ui/glass-container";
import Image from "next/image";

export default function SeriesCarousel({
  seriesList,
}: {
  seriesList: Database["public"]["Tables"]["subcategories"]["Row"][];
}) {
  return (
    <Carousel className="w-full relative">
      {/* ✅ 캐러셀 컨텐츠 */}
      <CarouselContent className="md:pl-[3vw] lg:ml-3 xl:ml-1">
        {seriesList.map((series) => (
          <CarouselItem
            key={series.id}
            className="basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <SeriesCard series={series} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white shadow-md backdrop-blur-sm border border-gray-200" />
      <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white shadow-md backdrop-blur-sm border border-gray-200" />
    </Carousel>
  );
}

// 2. 시리즈 카드 컴포넌트 (캐러셀용)
export const SeriesCard = ({
  series,
}: {
  series: Database["public"]["Tables"]["subcategories"]["Row"];
}) => (
  <GlassBox className="relative h-48 w-48 flex-shrink-0 overflow-hidden">
    {series.thumbnail && (
      <Image
        src={series.thumbnail}
        alt={series.name}
        fill
        className="object-cover"
      />
    )}
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-transparent to-black/70  p-4 text-white",
        !series.thumbnail && "bg-slate-300 dark:bg-slate-700 text-foreground"
      )}
    >
      <h3 className="font-bold text-lg line-clamp-2 mb-auto">{series.name}</h3>
    </div>
  </GlassBox>
);

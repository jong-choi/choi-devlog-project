"use client";
import SeriesCarousel from "@/components/series/series-carousel";
import { SeriesInfoPanel } from "@/components/series/series-info-panel";
import { Series } from "@/types/series";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Drawer, DrawerContent } from "@ui/drawer";
import { GlassButton } from "@ui/glass-button";
import { GlassBox } from "@ui/glass-container";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SeriesApp({ seriesList }: { seriesList: Series[] }) {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

  return (
    <>
      <div className="w-full">
        <GlassBox className="w-full bg-glass-border">
          <SeriesCarousel
            seriesList={seriesList || []}
            setSeries={setSelectedSeries}
          />
        </GlassBox>
      </div>
      {selectedSeries && (
        <Drawer
          open={!!selectedSeries}
          onOpenChange={(open) => {
            if (!open) setSelectedSeries(null);
          }}
        >
          <DrawerContent className=" z-50 bg-color-hover dark:bg-zinc-800 p-0 ">
            <div className="relative h-full w-full flex flex-col ">
              <button
                onClick={() => setSelectedSeries(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex justify-center items-center bg-glass-bg shadow-glass border-color-muted text-color-muted text-sm z-10"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
              <DialogTitle className="sr-only">
                {selectedSeries?.name}
              </DialogTitle>
              <div className="w-full max-w-[50wh] md:max-w-screen-lg mx-auto pb-60 flex flex-col gap-2">
                <SeriesInfoPanel series={selectedSeries} />
                <Link href={"/series/" + selectedSeries.url_slug} className="">
                  <GlassButton className="w-full">보러 가기</GlassButton>
                </Link>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

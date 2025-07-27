"use client";
import SeriesCarousel from "@/components/series/series-carousel";
import { Series } from "@/types/series";
import { SectionInnerContainer } from "@ui/glass-container";

export default function SeriesApp({ seriesList }: { seriesList: Series[] }) {
  return (
    <>
      <SectionInnerContainer>
        <SeriesCarousel seriesList={seriesList || []} />
      </SectionInnerContainer>
    </>
  );
}

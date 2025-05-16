import { PageContainer, SectionContainer } from "@ui/glass-container";
import SeriesApp from "@/components/series/series-app";
import {
  getCategories,
  getSeriesList,
} from "@/app/(app-shell)/series/fetchers";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "시리즈",
    description: "Scribbly에서 연재중인 시리즈 목록입니다.",
  };
}

export default async function Page() {
  const { data: categories } = await getCategories();
  const { data: recommendedSeriesList } = await getSeriesList({
    recommended: true,
  });
  return (
    <PageContainer>
      <h2 className="text-2xl font-extrabold tracking-tighter text-shadow">
        시리즈
      </h2>
      {/* 캐러셀 */}
      <SectionContainer title={"추천 시리즈"} titleSize="xl">
        <SeriesApp seriesList={recommendedSeriesList ?? []} />
      </SectionContainer>
      {categories?.map(async (category) => {
        const { data } = await getSeriesList({ categoryId: category.id });
        if (!data) return null;
        return (
          <SectionContainer
            key={category.id}
            title={category.name}
            titleSize="xl"
          >
            <SeriesApp seriesList={data ?? []} />
          </SectionContainer>
        );
      })}
    </PageContainer>
  );
}

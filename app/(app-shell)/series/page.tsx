import { SectionContainer } from "@ui/glass-container";
import { getAllCategories } from "@/app/post/actions";
import SeriesApp from "@/components/series/series-app";
import { getSeriesList } from "@/components/series/actions";

export default async function Page() {
  const { data: categories } = await getAllCategories();
  const { data: recommendedSeriesList } = await getSeriesList({
    recommended: true,
  });
  return (
    <>
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
    </>
  );
}

import { GlassBox } from "@ui/glass-container";
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
      <h2 className="text-2xl font-extrabold tracking-tighter text-shadow pb-2">
        시리즈
      </h2>
      {/* 캐러셀 */}
      <GlassBox className="w-full flex flex-col gap-3">
        <h2 className="text-xl font-extrabold tracking-tighter text-shadow pb-2">
          추천 시리즈
        </h2>
        <SeriesApp seriesList={recommendedSeriesList ?? []} />
      </GlassBox>
      {categories?.map(async (category) => {
        const { data } = await getSeriesList({ categoryId: category.id });
        if (!data) return null;
        return (
          <GlassBox key={category.id} className="w-full flex flex-col gap-3">
            <h2 className="text-xl font-extrabold tracking-tighter text-shadow pb-2">
              {category.name}
            </h2>
            <SeriesApp seriesList={data ?? []} />
          </GlassBox>
        );
      })}
    </>
  );
}

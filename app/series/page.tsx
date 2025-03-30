import { TopBar } from "@/components/post/topBar/post-top-bar";
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
    <div className="flex flex-col text-color-base font-sans">
      <TopBar />
      <div className="flex flex-1 flex-col overflow-auto">
        {/* 메인 섹션 */}
        <main className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-4 py-4 md:py-8">
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
              <GlassBox
                key={category.id}
                className="w-full flex flex-col gap-3"
              >
                <h2 className="text-xl font-extrabold tracking-tighter text-shadow pb-2">
                  {category.name}
                </h2>
                <SeriesApp seriesList={data ?? []} />
              </GlassBox>
            );
          })}
        </main>
      </div>
    </div>
  );
}

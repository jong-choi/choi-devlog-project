import { TopBar } from "@/components/post/topBar/post-top-bar";
import {
  getPostsBySeriesId,
  getSeriesByUrlSlug,
} from "@/components/series/actions";
import { PostCard } from "@/components/post/post-list/post-card";
import { SeriesInfoPanel } from "@/components/series/series-info-panel";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const { data: seriesData } = await getSeriesByUrlSlug(
    decodeURIComponent(urlSlug)
  );
  if (!seriesData) return redirect("/series");

  const posts = seriesData.id
    ? (await getPostsBySeriesId(seriesData.id)).data || []
    : [];

  return (
    <div className="flex flex-col text-color-base font-sans">
      <TopBar />
      <main className="flex flex-1 flex-col overflow-auto">
        {/* 메인 섹션 */}
        <div className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-8 py-4 md:py-8">
          <SeriesInfoPanel series={seriesData} />
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <div key={post.id}>
                <PostCard key={post.id} post={post} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

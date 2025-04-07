import {
  getPostsBySeriesId,
  getSeriesByUrlSlug,
} from "@/components/series/actions";
import { PostCard } from "@/components/posts/post-card";
import { SeriesInfoPanel } from "@/components/series/series-info-panel";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@ui/glass-container";
import { LinkLoader } from "@ui/route-loader";

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
    <>
      <LinkLoader
        href={"/series"}
        className="-mt-5 text-color-muted hover:text-color-base underline flex w-fit items-center"
      >
        <ChevronLeft className="w-5 h-5" />
        다른 시리즈 보기
      </LinkLoader>
      <PageContainer>
        <SeriesInfoPanel series={seriesData} />
        {posts.map((post) => (
          <div key={post.id}>
            <PostCard key={post.id} post={post} />
          </div>
        ))}
      </PageContainer>
    </>
  );
}

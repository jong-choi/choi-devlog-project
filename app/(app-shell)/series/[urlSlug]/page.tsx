import { PostCard } from "@/components/posts/post-card";
import {
  getSeriesByUrlSlug,
  getPostsBySeriesId,
} from "@/app/(app-shell)/series/[urlSlug]/fetchers";
import { SeriesInfoPanel } from "@/components/series/series-info-panel";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@ui/glass-container";
import { LinkLoader } from "@ui/route-loader";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { urlSlug } = await params;
  const { data } = await getSeriesByUrlSlug(decodeURIComponent(urlSlug));
  if (data?.name) {
    return {
      title: `시리즈 - ${data.name}`,
      description: `"${data.name}"의 게시글 목록입니다.`,
    };
  }

  return {
    title: "시리즈",
  };
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

import { SectionLinkText } from "@ui/glass-button";
import {
  GlassBox,
  SectionContainer,
  SectionInnerContainer,
} from "@ui/glass-container";
import { LogoBigText } from "@ui/post-top-bar";
import { LinkLoader } from "@ui/route-loader";
import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import { getSeriesList } from "@/app/(app-shell)/series/fetchers";
import ClusterGraphSection from "@/components/main/cluster-graph-section";
import { LatestPostsSection } from "@/components/main/latest-posts-section";
import SeriesApp from "@/components/series/series-app";

export default async function Page() {
  const { data: recentPosts } = await getPublishedPosts({ page: 0 });
  const { data: subcategories } = await getSeriesList();
  return (
    <>
      {/* 상단 블로그 소개 */}
      <GlassBox className="w-full" mobileTransperency>
        <LogoBigText />
        <div className="mt-2">
          <p className="whitespace-pre-wrap">
            {`프론트엔드 개발을 공부하며 작성하는 블로그입니다.\n주로 Next.js와 관련된 게시글을 올립니다.`}
          </p>

          <div className="mt-4 text-xs text-left flex flex-col gap-1">
            <hr />
            <span>
              블로그 개발기{" "}
              <LinkLoader
                href={"/series/nextjs-dev-blog"}
                className="text-color-muted hover:text-color-base hover:underline"
              >
                보러가기
              </LinkLoader>
            </span>
            <span>
              GitHub{" "}
              <LinkLoader
                href={"https://github.com/jong-Choi/choi-devlog-project"}
                className="text-color-muted hover:text-color-base hover:underline"
              >
                @jong-Choi
              </LinkLoader>
            </span>
          </div>
        </div>
      </GlassBox>
      {/* 캐러셀 */}
      <SectionContainer title={"시리즈"}>
        <SeriesApp seriesList={subcategories || []} />
        <SectionLinkText href="/series">더 보기</SectionLinkText>
      </SectionContainer>
      {/* 최신글 */}
      <SectionContainer title={"최신글"}>
        <LatestPostsSection posts={recentPosts || []} limit={5} />
        <SectionLinkText href="/post">더 보기</SectionLinkText>
      </SectionContainer>
      {/* 리스트 섹션 */}
      <SectionContainer
        title={"지식의 여정"}
        description={"유사한 게시글을 인공지능으로 분류한 지도입니다"}
      >
        <SectionInnerContainer className="flex h-[600px] flex-col">
          <ClusterGraphSection />
        </SectionInnerContainer>
        <SectionLinkText href="/map">더 크게 보기</SectionLinkText>
      </SectionContainer>
    </>
  );
}

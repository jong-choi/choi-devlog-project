import {
  GlassBox,
  SectionContainer,
  SectionInnerContainer,
} from "@ui/glass-container";
import { LatestPostsSection } from "@/components/main/latest-posts-section";
import ClusterGraphSection from "@/components/main/cluster-graph-section";
import { getPosts } from "@/components/posts/infinite-scroll/actions";
import { getSeriesList } from "@/components/series/actions";
import SeriesApp from "@/components/series/series-app";
import { SectionLinkText } from "@ui/glass-button";

export default async function Page() {
  const { data: recentPosts } = await getPosts({ page: 0 });
  const { data: subcategories } = await getSeriesList();
  return (
    <>
      {/* 상단 블로그 소개 */}
      <GlassBox className="w-full" mobileTransperency>
        <h2 className="text-2xl font-extrabold tracking-tighter text-shadow pb-2">
          소개
        </h2>
        <div className="">
          <p className="">
            Next.js 좋아하는 프론트엔드 개발자입니다.{" "}
            <span>블로그 개발기 보러가기</span>
          </p>

          <div className="mt-4 text-sm text-right flex flex-col gap-1">
            <p className="">마크다운...좋아하세요? 마크다운 에디터</p>
            <p className="">깃허브 @bluecoolgod80</p>
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
        <SectionLinkText href="/posts">더 보기</SectionLinkText>
      </SectionContainer>
      {/* 리스트 섹션 */}
      <SectionContainer
        title={"지식의 여정"}
        description={"유사한 게시글을 인공지능으로 분류한 지도입니다"}
      >
        <SectionInnerContainer className="flex h-[600px] flex-col">
          <ClusterGraphSection isMain />
        </SectionInnerContainer>
        <SectionLinkText href="/map">더 크게 보기</SectionLinkText>
      </SectionContainer>
    </>
  );
}

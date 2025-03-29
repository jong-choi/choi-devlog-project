import { TopBar } from "@/components/post/topBar/post-top-bar";
import { GlassBox } from "@ui/glass-container";
import { LatestPostsSection } from "@/components/main/latest-posts-section";
import { getRecentFeed } from "@/components/post/cluster/actions";
import { getSubcategories } from "@/app/post/actions";
import SeriesCarousel from "@/components/main/series-carousel";
import ClusterGraphSection from "@/components/main/cluster-graph-section";
import { ReactNode } from "react";
import Link from "next/link";
import { GlassButton } from "@ui/glass-button";

export default async function Page() {
  const recentPosts = await getRecentFeed();
  const { data: subcategories } = await getSubcategories();
  return (
    <div className="flex flex-col text-foreground font-sans">
      <TopBar />
      <div className="flex flex-1 flex-col overflow-auto">
        {/* 메인 섹션 */}
        <main className="w-full lg:max-w-screen-xl mx-auto flex flex-col gap-8 py-4 md:py-8">
          {/* 상단 블로그 소개 */}
          <GlassBox className="w-full">
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
          <GlassBox className="w-full flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-tighter text-shadow pb-2">
              시리즈
            </h2>
            <GlassBox className="w-full bg-glass-border">
              <SeriesCarousel seriesList={subcategories || []} />
            </GlassBox>
            <SectionLinkText href="/series">더 보기</SectionLinkText>
          </GlassBox>
          {/* 최신글 */}
          <GlassBox className="w-full flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-tighter text-shadow pb-2">
              최신글
            </h2>
            <LatestPostsSection posts={recentPosts} />
            <SectionLinkText href="/post">더 보기</SectionLinkText>
          </GlassBox>
          {/* 리스트 섹션 */}
          <GlassBox className="w-full flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-tighter text-shadow pb-2">
              지식의 여정
            </h2>
            <span className="text-sm text-shadow -mt-2">
              유사한 게시글을 인공지능으로 분류한 지도입니다
            </span>
            <GlassBox className="w-full flex h-[600px] flex-col text-foreground font-sans">
              <ClusterGraphSection />
            </GlassBox>
            <SectionLinkText href="/map">더 크게 보기</SectionLinkText>
          </GlassBox>
        </main>
      </div>
    </div>
  );
}

export function SectionLinkText({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="self-end">
      <GlassButton className="text-shadow">{children}</GlassButton>
    </Link>
  );
}

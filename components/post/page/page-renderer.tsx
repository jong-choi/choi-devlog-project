import { Lock } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { SidebarTrigger } from "@ui/sidebar-trigger";
import {
  getAISummaryByPostId,
  getRecommendedListByPostId,
  getSidebarCategory,
  getSidebarPublishedPosts,
} from "@/app/post/fetchers";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import ToggleEditButton from "@/components/markdown/milkdown-app/toggle-edit-button";
import SummaryHydrator from "@/components/post/ai-chat-panel/summary-hyrator";
import AutosaveStoreWrapper from "@/components/post/autosave-store-wrapper";
import AutosaveApp from "@/components/post/autosave/autosave-app";
import MainPostSectionContainer from "@/components/post/main-post-section-container";
import PostBreadcrumb from "@/components/post/post-breadcrumb";
import MobileCloseOnMount from "@/components/post/sidebar/mobile-close-on-mount";
import SelectionInitializer from "@/components/post/sidebar/selection-initializer";
import TitleEditor from "@/components/post/title-editor";
import { formatKoreanDate } from "@/lib/date";
import { Database } from "@/types/supabase";
import { findCategoryAndSubcategoryById } from "@/utils/uploadingUtils";

interface PageProps {
  data: Database["public"]["Tables"]["posts"]["Row"];
  urlSlug: string;
}

export default async function PostPageRenderer({ data, urlSlug }: PageProps) {
  // 병렬로 모든 데이터 fetching
  const [categoryRes, summaryRes, recommendedRes, postsRes] = await Promise.all(
    [
      getSidebarCategory(),
      getAISummaryByPostId(data.id),
      getRecommendedListByPostId(data.id),
      getSidebarPublishedPosts(),
    ],
  );

  const categoryData = categoryRes.data ?? [];
  const summaryData = summaryRes.data;
  const recommendedPosts = recommendedRes.data ?? [];
  const posts = postsRes.data ?? [];

  const { category, subcategory } = findCategoryAndSubcategoryById(
    categoryData,
    data.subcategory_id,
  );

  // 선택 상태를 서버에서 계산 (공개 데이터 기준)
  const currentPost = posts.find((post) => post.url_slug === urlSlug) ?? null;

  let selectedCategoryId: string | null = categoryData[0]?.id ?? null;
  let selectedSubcategory: { id: string; name: string } | null = null;
  let openCategoryId: string | null = null;

  if (currentPost) {
    for (const category of categoryData) {
      const foundSubcategory = category.subcategories.find(
        (subcategory) => subcategory.id === currentPost.subcategory_id,
      );
      if (foundSubcategory) {
        selectedCategoryId = category.id;
        selectedSubcategory = {
          id: foundSubcategory.id,
          name: foundSubcategory.name,
        };
        openCategoryId = category.id;
        break;
      }
    }
  }

  const selection = {
    selectedPostId: currentPost?.id ?? null,
    selectedCategoryId,
    selectedSubcategory,
    openCategoryId,
  };

  return (
    <>
      <MobileCloseOnMount />
      <SelectionInitializer selection={selection} />
      <AutosaveStoreWrapper
        data={data}
        subcategoryId={data.subcategory_id}
        categoryData={categoryData}
      >
        <SummaryHydrator
          summary={summaryData?.summary ?? ""}
          recommendedPosts={recommendedPosts}
          postId={data.id}
        />
        <main
          id="메인레퍼"
          className="flex flex-1 flex-col h-full min-w-0 bg-glass-bg backdrop-blur-2xl text-gray-800 dark:text-white"
        >
          <header
            data-component-name="main-header"
            className="h-[48px] border-b border-border flex justify-between items-center  dark:from-[#1b1b1b] dark:to-[#121212] text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <PostBreadcrumb
                category={category}
                subcategory={subcategory}
                title={data?.title}
              />
            </div>
            <div className="flex items-center gap-2 px-4 lg:mr-10 xl:mr-0">
              <ToggleEditButton />
            </div>
          </header>
          <AutosaveApp />
          <MainPostSectionContainer>
            <div className="main-post-section min-w-0">
              <div className="px-4 sm:px-14 mb-5 flex flex-col gap-2">
                <div className="text-xs">{subcategory?.name}</div>
                <div className="flex gap-1">
                  {data?.is_private && (
                    <Lock
                      className={
                        "h-5 w-5 text-color-muted inline-block my-auto"
                      }
                    />
                  )}
                  <TitleEditor defaultValue={data?.title || ""} />
                </div>
                <div className="text-end text-xs">
                  {data?.released_at ? formatKoreanDate(data?.released_at) : ""}
                </div>
                <hr />
              </div>
              <MarkdownEditor markdown={data?.body || ""} />
            </div>
          </MainPostSectionContainer>
        </main>
      </AutosaveStoreWrapper>
    </>
  );
}

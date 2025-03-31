import { Separator } from "@radix-ui/react-separator";
import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { SidebarTrigger } from "@ui/sidebar-trigger";
import PostBreadcrumb from "@/components/post/post-breadcrumb";
import TitleEditor from "@/components/post/title-editor";
import { getPostByUrlSlug, getSidebarCategory } from "@/app/post/actions";
import CreatePostButton from "@/components/post/create-post-button";
import SidebarHydrator from "@/components/post/sidebar/sidebar-hydrator";
import { findCategoryAndSubcategoryById } from "@/utils/uploadingUtils";
import AIPanelWrapper from "@/components/post/right-panel/ai-panel-wrapper";
import PostMainWrapper from "@/components/post/right-panel/post-main-wrapper";
import { RightPanelWrapper } from "@/components/post/right-panel/right-panel-wrapper";
import AISummary from "@/components/post/right-panel/ai-summary";
import AutosaveApp from "@/components/post/autosave/autosave-app";

// app/post/dashboard/ai-panel-wrapper.tsx
interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
  searchParams: Promise<{
    subcategory_id: string;
  }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { urlSlug } = await params;
  const { subcategory_id } = await searchParams; //?subcategory_id=123
  const { data: categoryData } = await getSidebarCategory();

  const result = await getPostByUrlSlug(decodeURIComponent(urlSlug));
  const { data } = result;

  const { category, subcategory } = findCategoryAndSubcategoryById(
    categoryData,
    data?.subcategory_id || subcategory_id
  );

  return (
    <PostMainWrapper
      data={data}
      subcategoryId={subcategory_id}
      categoryData={categoryData}
    >
      <SidebarHydrator
        category={category}
        subcategory={subcategory}
        postId={data?.id || ""}
      />
      <main
        id="메인레퍼"
        className="flex flex-1 flex-col h-full bg-glass-bg backdrop-blur-sm text-gray-800 dark:text-white"
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
          <div className="flex items-center gap-2 px-4">
            <CreatePostButton subcategoryId={data?.subcategory_id} />
          </div>
        </header>
        <AutosaveApp />
        <section
          data-component-name="main-post-section"
          className="flex flex-1 overflow-auto scrollbar py-6 bg-white dark:bg-neutral-900"
        >
          <div className="main-post-section ">
            <TitleEditor defaultValue={data?.title || ""} />
            <MarkdownEditor markdown={data?.body || ""} />
          </div>
        </section>
      </main>
      <AIPanelWrapper data={data}>
        <RightPanelWrapper>
          <AISummary />
        </RightPanelWrapper>
      </AIPanelWrapper>
    </PostMainWrapper>
  );
}

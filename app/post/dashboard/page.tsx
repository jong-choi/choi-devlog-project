import { Separator } from "@radix-ui/react-separator";
import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { SidebarTrigger } from "@ui/sidebar";
import PostBreadcrumb from "@/components/post/main/post-breadcrumb";
import PostControllerWrapper from "@/components/post/main/post-controller/post-controller-wrapper";
import TitleEditor from "@/components/post/main/title-editor";
import { getPostByUrlSlug } from "@/app/post/actions";
import AIGeneration from "@/components/post/main/ai-generation";
import PostMainWrapper from "@/app/post/dashboard/post-main-wrapper";
import AIPanelWrapper from "@/app/post/dashboard/ai-panel-wrapper";
import { RightPanelWrapper } from "@/app/post/right-panel-wrapper";

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
  const result = await getPostByUrlSlug(decodeURIComponent(urlSlug));
  const { data } = result;

  return (
    <PostMainWrapper data={data} subcategoryId={subcategory_id}>
      <main
        id="메인레퍼"
        className="flex flex-1 flex-col h-full bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white"
      >
        <header
          data-component-name="main-header"
          className="h-[48px] border-b border-border flex justify-between items-center px-6 bg-gradient-to-r from-indigo-50 to-white dark:from-[#1b1b1b] dark:to-[#121212] text-sm text-gray-600 dark:text-gray-400"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <PostBreadcrumb />
          </div>
          <div className="flex items-center gap-2 px-4"></div>
        </header>
        <PostControllerWrapper />
        <section
          data-component-name="main-post-section"
          className="flex flex-col p-4 md:px-8 pt-0 overflow-auto scrollbar"
        >
          <TitleEditor defaultValue={data?.title || ""} />
          <MarkdownEditor markdown={data?.body || ""} />
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </section>
      </main>
      <AIPanelWrapper data={data}>
        <RightPanelWrapper>
          <AIGeneration />
        </RightPanelWrapper>
      </AIPanelWrapper>
    </PostMainWrapper>
  );
}

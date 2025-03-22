import { Separator } from "@radix-ui/react-separator";
import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { SidebarTrigger } from "@ui/sidebar";
import PostBreadcrumb from "@/components/post/main/post-breadcrumb";
import PostControllerWrapper from "@/components/post/main/post-controller/post-controller-wrapper";
import TitleEditor from "@/components/post/main/title-editor";
import {
  getPostByUrlSlug,
  getPostsBySubcategoryId,
  getSidebarCategory,
} from "@/app/post/actions";
import AIGeneration from "@/components/post/main/ai-generation";
import PostMainWrapper from "@/app/post/dashboard/post-main-wrapper";
import AIPanelWrapper from "@/app/post/dashboard/ai-panel-wrapper";
import { RightPanelWrapper } from "@/app/post/right-panel-wrapper";
import CreatePostButton from "@/components/post/sidebar/panels/create-post-button";
import { Category, Subcategory } from "@/types/post";
import SidebarHydrator from "@/components/post/sidebar/sidebar-hydrator";

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
  const { category, subcategory } = findCategoryAndSubcategoryById(
    categoryData,
    subcategory_id
  );
  const { data: postsData } = subcategory?.id
    ? await getPostsBySubcategoryId(subcategory_id)
    : { data: [] };
  const result = await getPostByUrlSlug(decodeURIComponent(urlSlug));
  const { data } = result;

  return (
    <PostMainWrapper
      data={data}
      subcategoryId={subcategory_id}
      categoryData={categoryData}
    >
      <SidebarHydrator
        category={category}
        subcategory={subcategory}
        posts={postsData}
      />
      <main
        id="메인레퍼"
        className="flex flex-1 flex-col h-full bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white"
      >
        <header
          data-component-name="main-header"
          className="h-[48px] border-b border-border flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white dark:from-[#1b1b1b] dark:to-[#121212] text-sm text-gray-600 dark:text-gray-400"
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
        <PostControllerWrapper />
        <section
          data-component-name="main-post-section"
          className="flex flex-1 overflow-auto scrollbar"
        >
          <div className="main-post-section">
            <TitleEditor defaultValue={data?.title || ""} />
            <MarkdownEditor markdown={data?.body || ""} />
          </div>
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

function findCategoryAndSubcategoryById(
  categories: Category[] | null,
  subcategoryId: string
): { category: Category | null; subcategory: Subcategory | null } {
  if (!categories) {
    return { category: null, subcategory: null };
  }

  for (const category of categories) {
    const subcategory = category.subcategories.find(
      (s) => s.id === subcategoryId
    );
    if (subcategory) {
      return { category, subcategory };
    }
  }

  return { category: null, subcategory: null };
}

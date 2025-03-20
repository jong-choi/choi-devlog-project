import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";

import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { SidebarTrigger } from "@ui/sidebar";
import PostBreadcrumb from "@/components/post/main/post-breadcrumb";
import PostControllerWrapper from "@/components/post/main/post-controller/post-controller-wrapper";
import { AutosaveProvider } from "@/providers/autosave-store-provider";
import TitleEditor from "@/components/post/main/title-editor";
import { getAISummaryByPostId, getPostByUrlSlug } from "@/app/post/actions";
import AiMarkdownWrapper from "@/components/markdown/ai-markdown-wrapper/ai-markdown-wrapper";
import { Pencil } from "lucide-react";

interface PageProps {
  params: Promise<{
    urlSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { urlSlug } = await params;
  const result = await getPostByUrlSlug(decodeURIComponent(urlSlug));
  const { data } = result;
  const { data: aISummary } = data
    ? await getAISummaryByPostId(data.id)
    : { data: null };

  return (
    <AutosaveProvider
      initialState={{
        postId: data?.id,
        recentAutoSavedData: {
          title: data?.title || "",
          body: data?.body || "",
          timestamp: Date.now(),
        },
      }}
    >
      <div className="bg-gray-200 w-full h-full">
        <main className="p-2 flex gap-2">
          {/* 상단바의 크기를 4rem이라고 가정 */}
          <MainContainer className="bg-white md:h-[calc(100vh-4rem)]">
            <header
              data-component-name="main-header"
              className="flex h-16 shrink-0 items-center gap-2 justify-between"
            >
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <PostBreadcrumb />
              </div>
              <div className="flex items-center gap-2 px-4">
                <PostControllerWrapper />
              </div>
            </header>
            <section
              data-component-name="main-post-section"
              className="flex flex-1 flex-col gap-4 p-4 md:px-8 pt-0 overflow-auto scrollbar "
            >
              <TitleEditor defaultValue={data?.title || ""} />
              <MarkdownEditor markdown={data?.body || ""} />
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
            </section>
          </MainContainer>
          <MainContainer className="bg-white md:h-[calc(100vh-4rem)] max-w-[20vw] p-3 rounded-xl shadow-sm">
            <div className="pl-4 tracking-wide flex items-center text-sm">
              <Pencil className="w-4 h-4 text-gray-500" />
              AI 멘토의 요약
            </div>
            <section
              data-component-name="main-post-section"
              className="flex flex-1 overflow-auto scrollbar-hidden"
            >
              <AiMarkdownWrapper>{aISummary?.summary || ""}</AiMarkdownWrapper>
            </section>
          </MainContainer>
        </main>
      </div>
    </AutosaveProvider>
  );
}

function MainContainer({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:rounded-xl md:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

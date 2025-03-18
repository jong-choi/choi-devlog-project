import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Separator } from "@radix-ui/react-separator";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { postDummyDataString } from "@/app/post/[urlSlug]/dummy-data";
import { SidebarTrigger } from "@ui/sidebar";
import PostBreadcrumb from "@/components/post/main/post-breadcrumb";
import PostControllerWrapper from "@/components/post/main/post-controller/post-controller-wrapper";
import { AutosaveProvider } from "@/providers/autosave-store-provider";
import TitleEditor from "@/components/post/main/title-editor";
// import dynamic from "next/dynamic";

export default function Page() {
  const result: PostgrestSingleResponse<
    Database["public"]["Tables"]["posts"]["Row"]
  > = JSON.parse(postDummyDataString);
  const { data } = result;

  return (
    <AutosaveProvider
      initialState={{
        recentAutoSavedData: {
          title: data?.title || "",
          body: data?.body || "",
          timestamp: Date.now(),
        },
      }}
    >
      <div className="bg-gray-200 w-full h-full">
        <main className="p-2">
          {/* 상단바의 크기를 4rem이라고 가정 */}
          <MainContainer className="bg-white md:max-h-[calc(100vh-4rem)]">
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

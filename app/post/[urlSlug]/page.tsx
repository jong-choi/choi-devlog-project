import { Separator } from "@radix-ui/react-separator";
import "@mdxeditor/editor/style.css";
import MarkdownEditor from "@/components/markdown/markdown-editor";
import { SidebarTrigger } from "@ui/sidebar";
import PostBreadcrumb from "@/components/post/main/post-breadcrumb";
import PostControllerWrapper from "@/components/post/main/post-controller/post-controller-wrapper";
import { AutosaveProvider } from "@/providers/autosave-store-provider";
import TitleEditor from "@/components/post/main/title-editor";
import {
  getAISummaryByPostId,
  getPostByUrlSlug,
  getSidebarCategory,
} from "@/app/post/actions";
import { MainContainer } from "@ui/main-container";
import AIGeneration from "@/components/post/main/ai-generation";
import { SummaryProvider } from "@/providers/summary-store-provider";

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
  const { data: categoryData } = await getSidebarCategory();
  let summary = defaultSummary;
  let summaryId = null;
  if (data?.id) {
    const { data: aiData } = await getAISummaryByPostId(data.id);
    if (aiData?.summary) {
      summary = aiData.summary;
      summaryId = aiData.id;
    }
  }

  return (
    <AutosaveProvider
      initialState={{
        postId: data?.id,
        recentAutoSavedData: {
          title: data?.title || "",
          body: data?.body || "",
          timestamp: Date.now(),
        },
        draftPostData: {
          title: data?.title || "",
          body: data?.body || "",
          is_private: false,
          released_at: new Date().toISOString(),
          short_description: "",
          subcategory_id:
            data?.subcategory_id ||
            subcategory_id ||
            "524bdc55-932b-4ea5-b9f0-44fc05ec372f",
          thumbnail: data?.thumbnail || "",
          url_slug: data?.url_slug || "",
        },
        categoryData,
      }}
    >
      <div className="bg-gray-200 w-full h-full" spellCheck="false">
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
              className="flex flex-1 flex-col p-4 md:px-8 pt-0 overflow-auto scrollbar "
            >
              <TitleEditor defaultValue={data?.title || ""} />
              <MarkdownEditor markdown={data?.body || ""} />
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
            </section>
          </MainContainer>
          <SummaryProvider initialState={{ summary, summaryId }}>
            <AIGeneration />
          </SummaryProvider>
        </main>
      </div>
    </AutosaveProvider>
  );
}

const defaultSummary = `
## 🌟 안녕하세요! AI 요약 기능을 소개할게요! 🤖✨

이제 인공지능(AI) 친구가 여러분의 긴 글을 똑똑하게 요약해 드려요! 📝💡  
글을 다 읽기 전에 **핵심 내용만 쏙쏙!** 빠르게 확인해 보세요! 🚀 

---

### ⚠️ **잠깐! 게스트 모드에서는 사용할 수 없어요!**
AI 요약 기능은 **로그인한 사용자만 이용 가능**해요. 🛑  

---

### 🧐 **AI 요약 기능이 뭐예요?**
- 긴 글을 AI가 분석해서 **중요한 부분만 깔끔하게 요약**해 드려요!
- 바쁜 당신을 위해 **빠르고 간편하게 핵심 파악**이 가능해요!
- **공부, 글쓰기, 정리**할 때 너무 유용하답니다! 🏆

---

### 🎈 **어떻게 사용하나요?**
1. **게시글을 작성**하거나 불러와 주세요! 📄
2. **"AI 요약 생성" 버튼을 클릭**하면, AI가 마법처럼 요약해 줘요! ✨
3. 자동 생성된 요약을 확인하고, **필요하면 살짝 수정**해 주세요! 💖

---

### 🛎 **알아두면 좋아요!**
🔹 AI가 요약을 잘하지만, **완벽하진 않아요!** 가끔 귀여운 실수를 할 수도 있어요. 🥹  
🔹 중요한 내용이 빠질 수도 있으니, **최종 확인은 꼭!** 해 주세요. 🧐✔️  
🔹 그래도 AI 요약이 있으면, 긴 글 읽는 부담이 확 줄어든답니다! 🎉  

---

💡 **이제 AI 요약 기능으로 편리하게 정보 정리해 보세요!**  
언제든지 도움이 필요하면 **클릭 한 번**으로 AI 친구가 도와줄게요! 🤖💕
`;

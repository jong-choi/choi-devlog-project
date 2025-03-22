"use client";
import { createAISummary } from "@/app/post/actions";
import AiMarkdownWrapper from "@/components/markdown/ai-markdown-wrapper/ai-markdown-wrapper";
import { useAuthStore } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useSummary } from "@/providers/summary-store-provider";
import { Button } from "@ui/button";
import { MainContainer } from "@ui/main-container";
import { Loader2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function AIGeneration() {
  const summary = useSummary((state) => state.summary);
  const summaryId = useSummary((state) => state.summaryId);
  const setSummary = useSummary((state) => state.setSummary);
  const setSummaryId = useSummary((state) => state.setSummaryId);
  const isLoading = useSummary((state) => state.loading);
  const setIsLoading = useSummary((state) => state.setLoading);
  const postId = useAutosave((state) => state.postId);
  const isValid = useAuthStore((state) => state.isValid);
  const title = useAutosave((state) => state.recentAutoSavedData?.title);
  const body = useAutosave((state) => state.recentAutoSavedData?.body);

  const createSummary = async (title: string, body: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      console.error(data.error);
      return null;
    }

    const data = await response.json();
    return data;
  };

  const onClick = async () => {
    setIsLoading(true);
    if (!isValid) {
      return setTimeout(() => {
        setSummary(guestSummary);
        setSummaryId("guest");
        return setIsLoading(false);
      }, 300);
    }
    if (!title || !body) {
      toast.error("데이터를 입력하세요.");
      return setIsLoading(false);
    }
    const data = await createSummary(title, body);

    if (!data || !data.summary) {
      toast.error("인공지능 요약 생성에 실패하였습니다.");
      return setIsLoading(false);
    }
    const { summary, vector } = data;
    const payload = {
      post_id: postId,
      summary,
      vector,
    };

    const { data: AIData } = await createAISummary(payload);
    if (!AIData || !AIData.id) {
      toast.error("요약을 DB에 등록하지 못 하였습니다.");
      return setIsLoading(false);
    }

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/summary/recommended`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
    }).then(() => toast.success("추천 게시글 분석이 완료되었습니다."));
    setSummary(AIData.summary);
    setSummaryId(AIData!.id);
    toast.success("요약 생성에 성공하였습니다.");
    return setIsLoading(false);
  };

  const rightOpen = useLayoutStore((state) => state.rightOpen);
  const setRightOpen = useLayoutStore((state) => state.setRightOpen);

  if (!postId) return <></>;
  return (
    <MainContainer className="text-gray-700 dark:text-gray-300  overflow-scroll scrollbar-hidden px-2">
      <button
        onClick={() => setRightOpen(!rightOpen)}
        className="absolute top-2 left-2 z-10 text-xs bg-gray-200 dark:bg-neutral-700 px-2 py-1 rounded"
      >
        {!rightOpen ? "<" : ">"}
      </button>
      <div className="px-4 py-3 flex justify-center">
        <div className="flex gap-1 items-center text-gray-800 dark:text-white font-semibold">
          <Pencil className="w-4 h-4 text-gray-500" />
          AI 멘토의 요약
        </div>
      </div>
      <Button
        onClick={onClick}
        variant="outline"
        size="sm"
        className={cn(summaryId || isLoading ? "hidden" : "h-fit py-0.5")}
      >
        AI 요약 생성하기
      </Button>
      <section
        data-component-name="main-post-section"
        className="flex flex-1 overflow-auto scrollbar-hidden"
      >
        {isLoading ? (
          <Loader2
            className="w-40 h-40 opacity-10 mx-auto animate-spin text-gray-500"
            strokeWidth={0.4}
          />
        ) : (
          <AiMarkdownWrapper>{summary}</AiMarkdownWrapper>
        )}
      </section>
    </MainContainer>
  );
}

const guestSummary = `
## ✨ 가짜로 보는 요약
이 블로그에서는 **최신 인공지능(AI) 기술**을 활용할 수 있지만...**게스트 모드에서는 사용할 수 없어요!** 😭  
왜냐구요? **서버 비용이 너무 비싸거든요...!** 🫠  
AI 기능을 막 쓰다 보면 Supabase 사용량이 폭발하고, Vercel이 트래픽 경고를 보내고, OpenAI 토큰 요금이 끝없이 올라가면서...  
결국 개발자의 통장은 **텅장**이 되어버린답니다. 😭💸  

---

## 🔥 핵심 포인트
- **편리한 글 작성** → WYSIWYG 마크다운 에디터로 Typora, 에버노트 부럽지 않게 글을 작성하고 수정할 수 있어요. ✍️  
- **AI 요약 기능** → AI가 게시글을 자동으로 요약해 한눈에 핵심 내용을 파악할 수 있어요. 🧠  
- **연관 지식 정리** → AI가 지금껏 공부한 정보를 연결해 정리하고, 복습을 도와줘요. 🔗  
- **안타까운 디자인 감각** → 뭔가 열심히 꾸몄는데 왜 이렇죠? *1rem이 몇 cm인가요?* 🤔


---

## 📚 더 공부하면 좋은 주제
### 🧠 **AI와 자연어 처리 (NLP)**
1. **OpenAI API를 활용한 AI 요약** – 실제 ChatGPT API를 이용해 긴 문서를 자동 요약하는 방법 📑  
2. **임베딩 벡터(Embedding Vector)란?** – AI가 단어와 문장을 수치화해서 이해하는 원리 🧩  
3. **Cosine Similarity와 벡터 연산** – AI가 두 개의 문장이 얼마나 유사한지 계산하는 방식 📊  
4. **CSS란?** – *"어? 이거 왜 정렬이 안되지?"* 🫠 
`;

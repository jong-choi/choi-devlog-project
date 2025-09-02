import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createAISummary } from "@/app/post/actions/ai";
import { summaryParser } from "@/utils/api/analysis-utils";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postIds } = await request.json();

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return Response.json({ error: "Invalid postIds array" }, { status: 400 });
    }

    const results = {
      success: [] as string[],
      failed: [] as Array<{ postId: string; error: string }>,
    };

    for (const postId of postIds) {
      try {
        const { data: post } = await supabase
          .from("posts")
          .select("title, body")
          .eq("id", postId)
          .single();

        if (!post || !post.title || !post.body) {
          results.failed.push({
            postId,
            error: "Post not found or missing title/body",
          });
          continue;
        }

        const prompt = `제목: ${post.title}\n\n본문: ${post.body}`;

        const summaryResponse = await openai.chat.completions.create({
          model: "gpt-4o-2024-11-20",
          messages: [
            {
              role: "system",
              content: `The response must be **strictly** limited to ${
                ~~((MAX_TOKENS * 0.9) / 100) * 100
              } tokens or fewer. Keep the answer concise and within the specified token limit.`,
            },
            {
              role: "system",
              content: `당신은 개발자를 위한 AI 멘토입니다. 유저로부터 기술블로그의 게시글을 전달받으면, 내용을 요약하고 공부할 거리를 추천해줍니다. 다음의 예시와 같이 작성하여 반환하여주세요.`,
            },
            { role: "system", content: MARKDOWN_SUMMARY },
            { role: "user", content: prompt },
          ],
          max_tokens: MAX_TOKENS,
        });

        const summary =
          summaryResponse.choices[0]?.message?.content?.trim() ||
          "요약을 생성하지 못했습니다.";

        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: summaryParser(summary),
        });

        const vector = embeddingResponse.data[0]?.embedding || [];

        const payload = {
          post_id: postId,
          summary,
          vector,
        };

        const { data: aiData } = await createAISummary(payload);

        if (aiData?.id) {
          results.success.push(postId);
        } else {
          results.failed.push({
            postId,
            error: "Failed to save AI summary to database",
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to create AI summary for post ${postId}:`, error);
        results.failed.push({
          postId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error("Batch AI summary creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

const MAX_TOKENS = 600;

const MARKDOWN_SUMMARY = `
## ✨ 한눈에 보는 요약
Next.js 14의 App Router를 활용하면 폴더 구조만으로 직관적인 라우팅을 구성할 수 있어요.  
이 글에서는 Supabase와 연동해 서버 없이도 데이터베이스를 구축하는 방법을 알아보고,  
Zustand를 활용해 클라이언트 상태를 깔끔하게 관리하는 팁을 소개합니다.  
또한, Next.js의 서버 컴포넌트를 활용해 **더 빠르고 효율적인 웹 앱**을 만드는 방법도 다뤄요. 🚀  

---

## 🔥 핵심 포인트
- **App Router의 강점** → 폴더 기반 라우팅과 SSR을 쉽게 적용할 수 있어요.  
- **Supabase와 데이터 관리** → 인증 & 실시간 데이터 연동까지 한 번에!  
- **Zustand 활용법** → 가벼우면서도 강력한 글로벌 상태 관리  
- **Next.js 성능 최적화** → 서버 컴포넌트와 캐싱을 제대로 활용해보자.  

---

## 📚 더 공부하면 좋은 주제
1. **React Server Components (RSC)** – 서버에서 렌더링을 최적화하는 최신 트렌드  
2. **Edge Functions** – Vercel을 활용해 더 빠른 API 응답 받기  
3. **Database Indexing & Optimization** – Supabase에서 쿼리 성능 높이기  
4. **React Query vs Zustand** – 어떤 상황에서 어떤 상태 관리가 더 좋을까?  
5. **Vercel & Cloudflare Optimization** – Next.js 배포 후 속도 최적화하는 법 🚀  
`;

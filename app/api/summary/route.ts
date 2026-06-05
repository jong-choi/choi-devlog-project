// app/api/summary/route.ts (서버 전용 API Route)
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { mediumModel } from "@/app/api/chat/_controllers/utils/model";
import {
  DEFAULT_EMBEDDING_GEMMA_PRESET,
  embedSummary,
  EMBEDDING_GEMMA_PRESETS,
  parseEmbeddingGemmaPreset,
} from "@/lib/ai/embedding-gemma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const user = await supabase.auth.getUser();
  if (!user.data) {
    console.error("로그인되지 않은 사용자:");
    return NextResponse.json(
      { error: "사용자 정보 불러오기 실패" },
      { status: 500 }
    );
  }

  try {
    const { title, body, embeddingPreset } =
      (await req.json()) as SummaryRequestBody;

    if (!title || !body) {
      return NextResponse.json(
        { error: "title과 body가 필요합니다." },
        { status: 400 }
      );
    }

    const resolvedPreset =
      embeddingPreset === undefined
        ? DEFAULT_EMBEDDING_GEMMA_PRESET
        : parseEmbeddingGemmaPreset(embeddingPreset);

    if (!resolvedPreset) {
      return NextResponse.json(
        {
          error: "Invalid embeddingPreset",
          allowedPresets: EMBEDDING_GEMMA_PRESETS,
        },
        { status: 400 },
      );
    }

    const prompt = `제목: ${title}\n\n본문: ${body}`;

    const summaryResponse = await mediumModel.invoke([
      new SystemMessage(
        `The response must be strictly limited to ${
          ~~((MAX_TOKENS * 0.9) / 100) * 100
        } tokens or fewer. Keep the answer concise and within the specified token limit.`,
      ),
      new SystemMessage(
        "당신은 개발자를 위한 AI 멘토입니다. 유저로부터 기술블로그의 게시글을 전달받으면, 내용을 요약하고 공부할 거리를 추천해줍니다. 다음의 예시와 같이 작성하여 반환하여주세요.",
      ),
      new SystemMessage(MARKDOWN_SUMMARY),
      new HumanMessage(prompt),
    ]);

    const summary = summaryResponse.text.trim() || "요약을 생성하지 못했습니다.";
    const vector = await embedSummary(summary, resolvedPreset);

    return NextResponse.json({ summary, vector, preset: resolvedPreset });
  } catch (error) {
    console.error("요약 생성 오류:", error);
    return NextResponse.json(
      { error: "요약 생성 중 오류 발생" },
      { status: 500 }
    );
  }
}

const MAX_TOKENS = 600;

type SummaryRequestBody = {
  body: string;
  embeddingPreset?: string;
  title: string;
};

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

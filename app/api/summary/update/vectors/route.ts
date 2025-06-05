import { summaryParser } from "@/utils/api/analysis-utils";
// app/api/ai-summaries/embed/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
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
    // 1. 요약 목록 가져오기 (벡터가 아직 없는 것만)
    const { data: summaries, error } = await supabase
      .from("ai_summaries_with_vectors")
      .select("id, summary")
      .is("vector", null);

    if (error) throw error;
    if (!summaries || summaries.length === 0) {
      return NextResponse.json({ message: "No summaries to embed." });
    }

    // 2. 각 summary를 embedding 처리 - promise.all을 쓰면 더 빠르긴 한데 일단 이렇게 유지.
    for (const summary of summaries) {
      if (!summary.summary || !summary.id) break;
      summary.summary = summaryParser(summary.summary);
      const response = await openai.embeddings.create({
        input: summaryParser(summary.summary),
        model: "text-embedding-3-small",
      });

      const [embedding] = response.data;
      if (!embedding || !embedding.embedding) continue;

      // 3. Supabase에 vector 업데이트
      await supabase
        .from("ai_summary_vectors")
        // @ts-expect-error : vector 타입 불일치
        .update({ vector: embedding.embedding })
        .eq("summary_id", summary.id);
    }

    return NextResponse.json({
      message: "Embedding update completed",
      summaries,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("[EMBEDDING ERROR]", e.message);
      return NextResponse.json({ error: e.message }, { status: 500 });
    } else {
      console.error("[EMBEDDING ERROR]", e);
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

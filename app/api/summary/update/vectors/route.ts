import { summaryParser } from "@/utils/api/analysis-utils";
// app/api/ai-summaries/embed/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
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

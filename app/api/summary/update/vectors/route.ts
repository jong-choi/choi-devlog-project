import { embedSummary } from "@/lib/ai/embedding-gemma";
import { serializeVector } from "@/lib/supabase/vector";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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
      if (!summary.summary || !summary.id) continue;
      const vector = await embedSummary(summary.summary);
      if (vector.length === 0) continue;

      // 3. Supabase에 vector 업데이트
      const { error: upsertError } = await supabase
        .from("ai_summary_vectors")
        .upsert(
          {
            summary_id: summary.id,
            vector: serializeVector(vector),
          },
          { onConflict: "summary_id" },
        );

      if (upsertError) throw upsertError;
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

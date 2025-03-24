import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { cosineSimilarity } from "@/utils/api/analysis-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // 1. 요약 벡터 전체 불러오기
    const { data: summaries, error } = await supabase
      .from("ai_summaries")
      .select("post_id, vector")
      .not("vector", "is", null);

    if (error || !summaries) {
      console.error("데이터 로딩 실패:", error);
      return NextResponse.json(
        { error: "벡터 데이터를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    // 3. 유사도 계산 및 쌍 정리
    const pairs: Database["public"]["Tables"]["post_similarities"]["Insert"][] =
      [];

    for (let i = 0; i < summaries.length; i++) {
      for (let j = i + 1; j < summaries.length; j++) {
        const a = summaries[i];
        const b = summaries[j];

        if (!a.post_id || !b.post_id) continue;

        const sim = cosineSimilarity(
          JSON.parse(a.vector!),
          JSON.parse(b.vector!)
        );

        const [source_post_id, target_post_id] = [a.post_id, b.post_id].sort();
        pairs.push({
          created_at: new Date().toISOString(),
          similarity: sim,
          source_post_id,
          target_post_id,
        });
      }
    }

    const { error: insertError } = await supabase
      .from("post_similarities")
      .insert(pairs);

    if (insertError) {
      console.error("삽입 실패:", insertError);
      return NextResponse.json({ error: "삽입 실패" }, { status: 500 });
    }

    return NextResponse.json({
      message: "유사도 계산 및 저장 완료",
      count: pairs.length,
    });
  } catch (err) {
    console.error("[SIMILARITY ERROR]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

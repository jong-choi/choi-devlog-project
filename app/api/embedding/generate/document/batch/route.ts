import { NextResponse } from "next/server";
import { generateDocumentEmbeddingsForPost } from "@/app/api/embedding/_service/generate";
import {
  createEmptySummary,
  summarizeResults,
  updateSummary,
} from "@/app/api/embedding/_service/summary";
import { createClient } from "@/utils/supabase/server";

type BatchGenerateRequest = {
  post_ids: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BatchGenerateRequest;
    const { post_ids } = body || {};

    if (!Array.isArray(post_ids) || post_ids.length === 0) {
      return NextResponse.json(
        { error: "'post_ids' 배열이 필요합니다." },
        { status: 400 },
      );
    }

    const uniqueIds = Array.from(
      new Set(post_ids.filter((id) => typeof id === "string" && id.trim())),
    );
    if (uniqueIds.length === 0) {
      return NextResponse.json(
        { error: "유효한 post_id가 없습니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const results = [] as Awaited<
      ReturnType<typeof generateDocumentEmbeddingsForPost>
    >[];

    // await로 순차 처리
    for (const postId of uniqueIds) {
      const result = await generateDocumentEmbeddingsForPost(supabase, postId);
      results.push(result);
    }

    const summary = summarizeResults(results);

    return NextResponse.json({
      count: uniqueIds.length,
      ...summary,
      results,
    });
  } catch (error) {
    console.error("배치 임베딩 생성 실패", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// 처리 진행 상황을 이벤트로 전송
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return new Response("missing ids", { status: 400 });
    }

    const rawIds = idsParam.split(",").map((s) => s.trim());
    const uniqueIds = Array.from(
      new Set(rawIds.filter((id) => typeof id === "string" && id)),
    );
    if (uniqueIds.length === 0) {
      return new Response("no valid ids", { status: 400 });
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const supabase = await createClient();
        const summary = createEmptySummary();

        const send = (event: string, data: unknown) => {
          const payload =
            `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          for (const postId of uniqueIds) {
            const result = await generateDocumentEmbeddingsForPost(
              supabase,
              postId,
            );
            // 누적 집계 업데이트
            updateSummary(summary, result);
            send("item", result);
          }

          // 완료 이벤트 전송
          send("done", { count: uniqueIds.length, ...summary });
        } catch (e) {
          send("error", {
            error: (e as Error).message,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }
}

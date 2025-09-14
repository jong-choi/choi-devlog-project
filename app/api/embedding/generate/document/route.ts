import { NextResponse } from "next/server";
import { generateDocumentEmbeddingsForPost } from "@/app/api/embedding/_service/generate";
import { createClient } from "@/utils/supabase/server";

type GenerateRequest = {
  post_id: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { post_id } = body;
    const supabase = await createClient();

    if (typeof post_id !== "string" || post_id.trim().length === 0) {
      return NextResponse.json(
        { error: "'post_id'가 필요합니다." },
        { status: 400 },
      );
    }

    const result = await generateDocumentEmbeddingsForPost(supabase, post_id);

    if (result.status === "ok") {
      return NextResponse.json({
        postId: result.postId,
        chunkCount: result.chunkCount,
        insertedCount: result.insertedCount,
        updatedOldEmbeddings: result.updatedOldEmbeddings,
      });
    }

    if (result.status === "not_found") {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다.", details: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "청크 저장 중 오류가 발생했습니다.", details: result.error },
      { status: 500 },
    );
  } catch (error) {
    console.error("임베딩 생성 실패", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: (error as Error).message },
      { status: 500 },
    );
  }
}

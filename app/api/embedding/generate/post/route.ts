import { NextResponse } from "next/server";
import { OllamaEmbeddings } from "@langchain/ollama";
import { TokenTextSplitter } from "@langchain/textsplitters";
// import { embeddings } from "@/app/api/embedding/_model/embeddings";
import { createClient } from "@/utils/supabase/server";

export const embeddings = new OllamaEmbeddings({
  model: "embeddinggemma:300m",
  baseUrl: "http://localhost:11434",
});

type GenerateRequest = {
  post_id: string;
};

// 벡터 정규화 함수 (Ollama EmbeddingGemma는 자동 정규화되지 않음)
function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / norm);
}

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

    const effectivePostId = post_id;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, body")
      .eq("id", effectivePostId)
      .is("deleted_at", null)
      .single();

    if (postError || !post || !post.body) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다.", details: postError?.message },
        { status: 404 },
      );
    }

    const postBody = post.body;

    const splitter = new TokenTextSplitter({
      chunkSize: 250,
      chunkOverlap: 50,
      encodingName: "cl100k_base",
    });

    // Document 생성으로 변경하여 시작 위치 추적 가능
    const documents = await splitter.createDocuments([postBody]);
    const textChunks = documents.map((doc) => doc.pageContent);

    // 임베딩 생성 (Ollama Embeddings - EmbeddingGemma)
    const vectors = await Promise.all(
      textChunks.map((t) => embeddings.embedQuery(t)),
    );

    // 벡터 정규화 (Ollama는 자동 정규화되지 않음)
    const normalizedVectors = vectors.map((vector) => normalizeVector(vector));
    console.log(normalizedVectors);

    // 저장 payload 작성
    const insertRows = textChunks.map((content, i) => ({
      post_id: effectivePostId,
      chunk_index: i,
      content,
      // string으로 임의 캐스팅
      embedding: normalizedVectors[i] as unknown as string,
    }));

    // 기존 임베딩이 있으면 deleted_at을 현재 시각으로 업데이트
    const { data: existingChunks } = await supabase
      .from("post_chunks")
      .select("id")
      .eq("post_id", effectivePostId)
      .is("deleted_at", null);

    if (existingChunks?.length) {
      const existingIds = existingChunks.map((chunk) => chunk.id);
      await supabase
        .from("post_chunks")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", existingIds);
    }

    const { data: inserted, error: insertError } = await supabase
      .from("post_chunks")
      .insert(insertRows)
      .select("id");

    if (insertError) {
      console.error("청크 저장 실패", insertError);
      return NextResponse.json(
        {
          error: "청크 저장 중 오류가 발생했습니다.",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      postId: effectivePostId,
      chunkCount: textChunks.length,
      insertedCount: inserted?.length || 0,
      updatedOldEmbeddings: existingChunks?.length || 0,
    });
  } catch (error) {
    console.error("임베딩 생성 실패", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: (error as Error).message },
      { status: 500 },
    );
  }
}

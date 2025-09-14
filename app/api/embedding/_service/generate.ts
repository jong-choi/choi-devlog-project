import { TokenTextSplitter } from "@langchain/textsplitters";
import { SupabaseClient } from "@supabase/supabase-js";
import { embeddings } from "@/app/api/embedding/_model/embeddings";
import { Database } from "@/types/supabase";

export type GenerateDocumentEmbeddingResult = {
  postId: string;
  title?: string;
  chunkCount: number;
  insertedCount: number;
  updatedOldEmbeddings: number;
  status: "ok" | "not_found" | "error";
  error?: string;
};

// 게시글 하나당 임베딩 생성 및 저장
export async function generateDocumentEmbeddingsForPost(
  supabase: SupabaseClient<Database>,
  postId: string,
): Promise<GenerateDocumentEmbeddingResult> {
  try {
    if (typeof postId !== "string" || postId.trim().length === 0) {
      return {
        postId,
        chunkCount: 0,
        insertedCount: 0,
        updatedOldEmbeddings: 0,
        status: "not_found",
        error: "'post_id'가 필요합니다.",
      };
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, title, body")
      .eq("id", postId)
      .is("deleted_at", null)
      .single();

    if (postError || !post || !post.body) {
      return {
        postId,
        chunkCount: 0,
        insertedCount: 0,
        updatedOldEmbeddings: 0,
        status: "not_found",
        error: postError?.message || "게시글을 찾을 수 없습니다.",
      };
    }

    const postBody: string = post.body as string;
    const postTitle: string | undefined = post.title as string | undefined;

    // 짧은 쿼리에 특화되도록 350으로 값 설정(크지 않은 값)
    const splitter = new TokenTextSplitter({
      chunkSize: 350,
      chunkOverlap: 50,
      encodingName: "cl100k_base",
    });

    const documents = await splitter.createDocuments([postBody]);
    const textChunks = documents.map((doc) => doc.pageContent);

    // 임베딩 생성 (Transformers.js - EmbeddingGemma)
    const vectors = await embeddings.embedDocuments(textChunks);

    // 저장 payload 작성
    const insertRows = textChunks.map((content, i) => ({
      post_id: postId,
      chunk_index: i,
      content,
      // string으로 임의 캐스팅 (DB 스키마 상 text/array 저장 방식에 따라 조정)
      embedding: vectors[i] as unknown as string,
    }));

    // 기존 임베딩이 있으면 deleted_at을 현재 시각으로 업데이트
    const { data: existingChunks } = await supabase
      .from("post_chunks")
      .select("id")
      .eq("post_id", postId)
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
      return {
        postId,
        title: postTitle,
        chunkCount: textChunks.length,
        insertedCount: 0,
        updatedOldEmbeddings: existingChunks?.length || 0,
        status: "error",
        error: insertError.message,
      };
    }

    return {
      postId,
      title: postTitle,
      chunkCount: textChunks.length,
      insertedCount: inserted?.length || 0,
      updatedOldEmbeddings: existingChunks?.length || 0,
      status: "ok",
    };
  } catch (error) {
    return {
      postId,
      title: undefined,
      chunkCount: 0,
      insertedCount: 0,
      updatedOldEmbeddings: 0,
      status: "error",
      error: (error as Error).message,
    };
  }
}

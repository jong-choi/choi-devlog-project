import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
        const { data: sourceNestedData } = await supabase
          .from("ai_summaries")
          .select(
            `
            id,
            post_id,
            ai_summary_vectors (
              vector
            ),
            posts (
              title,
              url_slug
            )
          `,
          )
          .eq("post_id", postId)
          .limit(1)
          .single();

        if (!sourceNestedData) {
          results.failed.push({
            postId,
            error: "AI summary not found. Generate AI summary first.",
          });
          continue;
        }

        const sourceData = {
          id: sourceNestedData.id,
          post_id: sourceNestedData.post_id as string,
          vector:
            (
              sourceNestedData.ai_summary_vectors as unknown as {
                vector: VectorLike;
              } | null
            )?.vector ?? [],
          posts: sourceNestedData.posts ?? null,
        };

        if (!sourceData.vector) {
          results.failed.push({
            postId,
            error: "AI summary vector not found",
          });
          continue;
        }

        const { data: targetNestedata } = await supabase
          .from("ai_summaries")
          .select(
            `
            id,
            post_id,
            ai_summary_vectors (
              vector
            ),
            posts (
              title,
              url_slug
            )
          `,
          )
          .neq("post_id", postId)
          .or("is_private.is.null,is_private.eq.false", {
            foreignTable: "posts",
          });

        if (!targetNestedata || targetNestedata.length === 0) {
          results.failed.push({
            postId,
            error: "No target posts found for similarity calculation",
          });
          continue;
        }

        const targetData = targetNestedata
          .map((item) => ({
            id: item.id,
            post_id: item.post_id as string,
            vector:
              (
                item.ai_summary_vectors as unknown as {
                  vector: VectorLike;
                } | null
              )?.vector ?? [],
            posts: item.posts ?? null,
          }))
          .filter(
            (item) =>
              (Array.isArray(item.vector) && item.vector.length > 0) ||
              typeof item.vector === "string",
          );

        if (targetData.length === 0) {
          results.failed.push({
            postId,
            error: "No target posts with vectors found",
          });
          continue;
        }

        const similarities = findTopSimilarPosts(sourceData, targetData);

        if (similarities.length === 0) {
          results.failed.push({
            postId,
            error: "Failed to calculate similarities",
          });
          continue;
        }

        const { error: upsertError } = await supabase
          .from("post_similarities")
          .upsert(similarities, {
            onConflict: "source_post_id, target_post_id",
          });

        if (upsertError) {
          results.failed.push({
            postId,
            error: `Failed to save similarities: ${upsertError.message}`,
          });
          continue;
        }

        results.success.push(postId);

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `Failed to create recommendations for post ${postId}:`,
          error,
        );
        results.failed.push({
          postId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error("Batch recommendations creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

type VectorLike = number[] | string;

interface VectorSource {
  id: string;
  vector: VectorLike;
  post_id: string;
  posts: {
    title: string;
    url_slug: string;
  } | null;
}

function cosineSimilarity(vec1raw: VectorLike, vec2raw: VectorLike) {
  const vec1 = typeof vec1raw === "string" ? JSON.parse(vec1raw) : vec1raw;
  const vec2 = typeof vec2raw === "string" ? JSON.parse(vec2raw) : vec2raw;
  const dotProduct = vec1.reduce(
    (sum: number, v: number, i: string | number) => sum + v * vec2[i],
    0,
  );
  const magnitudeA = Math.sqrt(
    vec1.reduce((sum: number, v: number) => sum + v ** 2, 0),
  );
  const magnitudeB = Math.sqrt(
    vec2.reduce((sum: number, v: number) => sum + v ** 2, 0),
  );
  return dotProduct / (magnitudeA * magnitudeB);
}

function findTopSimilarPosts(
  sourceData: Pick<VectorSource, "post_id" | "vector">,
  targetData: Array<Pick<VectorSource, "post_id" | "vector">>,
) {
  const similarities = targetData.map((target) => ({
    target_post_id: target.post_id,
    similarity: cosineSimilarity(sourceData.vector, target.vector),
  }));

  const top10 = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  // 중복 제거를 위해 Set 사용
  const seenPairs = new Set<string>();
  const res = top10
    .map((item) => {
      const [a, b] = [sourceData.post_id, item.target_post_id].sort();
      const pairKey = `${a}-${b}`;
      
      if (seenPairs.has(pairKey)) {
        return null; // 중복된 쌍은 제외
      }
      
      seenPairs.add(pairKey);
      return {
        source_post_id: a,
        target_post_id: b,
        similarity: item.similarity,
      };
    })
    .filter((item) => item !== null) as Array<{
      source_post_id: string;
      target_post_id: string;
      similarity: number;
    }>;

  return res;
}

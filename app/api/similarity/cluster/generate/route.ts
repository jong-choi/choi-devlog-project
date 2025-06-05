import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DBSCAN } from "density-clustering";
import { cosineSimilarity, summaryParser } from "@/utils/api/analysis-utils";
import { generateClusterTitleAndSummary } from "@/app/api/similarity/cluster/generate/utils";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
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

    // 1. 인공지능 요약에서 벡터 데이터를 가져옵니다.
    const { data, error } = await supabase
      .from("ai_summaries_with_vectors")
      .select("post_id, vector, summary")
      .is("deleted_at", null)
      .not("vector", "is", null);

    if (error || !data) {
      console.error("벡터 로딩 실패:", error);
      return NextResponse.json({ error: "벡터 로딩 실패" }, { status: 500 });
    }

    if (!data) {
      console.error("벡터 로딩 실패:");
      return NextResponse.json({ error: "벡터 로딩 실패" }, { status: 500 });
    }

    const vectors: number[][] = [];
    const postIds: string[] = [];
    const summaries: string[] = [];

    // 2. 인공지능 요약 테이블의 데이터를 DBSCAN이 적합한 형태로 FLATTEN합니다.
    for (const item of data) {
      if (!item.vector || !item.post_id) continue;

      try {
        const parsed =
          typeof item.vector === "string"
            ? JSON.parse(item.vector)
            : item.vector;

        if (Array.isArray(parsed)) {
          vectors.push(parsed);
          postIds.push(item.post_id);
          summaries.push(summaryParser(item.summary || ""));
        }
      } catch (_e) {
        console.warn("파싱 실패:", item.vector);
      }
    }

    if (vectors.length === 0) {
      return NextResponse.json({ message: "유효한 벡터가 없습니다." });
    }

    // 3. DB스캔 단계
    const dbscan = new DBSCAN();
    const distance = (a: number[], b: number[]) => 1 - cosineSimilarity(a, b);
    const epsilons = [
      // 고밀도
      0.33, 0.34, 0.35,
      // 중간 밀도 (간격 넓힘)
      0.37, 0.39, 0.41,
      // 느슨한 군집 (0.04 간격)
      0.44, 0.48, 0.52, 0.56, 0.6,
      // 끝물
      0.65, 0.7, 0.75,
    ];
    const MIN_SAMPLES = 4;

    // 군집들을 저장할 배혈
    const allClusters: {
      clusterId: number;
      post_ids: string[];
      summaries: string[];
      quality: number; // 낮을수록 품질이 좋음 (초기 eps에서 나왔으니까)
      result: {
        title: string;
        summary: string;
        keywords: string[];
        vector: number[];
      };
    }[] = [];

    let remainingIndices = vectors.map((_, i) => i); // 군집화되지 않은 게시글들
    let clusterIdCounter = 0; // 군집을 실행한  횟수

    // epsilons을 따라서 군집화를 반복시행
    for (let level = 0; level < epsilons.length; level++) {
      const epsilon = epsilons[level];
      const currentVectors = remainingIndices.map((i) => vectors[i]);

      const clusters = dbscan.run(
        currentVectors,
        epsilon,
        MIN_SAMPLES,
        distance
      );

      for (const cluster of clusters) {
        const clusterData = {
          clusterId: clusterIdCounter++,
          post_ids: cluster.map((i) => postIds[remainingIndices[i]]),
          summaries: cluster.map((i) => summaries[remainingIndices[i]]),
          quality: level + 1,
          result: {} as {
            title: string;
            summary: string;
            keywords: string[];
            vector: number[];
          },
        };

        // 4. AI 태깅 단계! 군집화가 끝난 후, 군집에 대한 요약, 키워드, 군집의 이름을 CHATGPT로 생성함!
        const result = await generateClusterTitleAndSummary(
          clusterData.summaries
        );

        if (!result.vector.length) {
          console.error("벡터 생성 실패:", result.title);
          console.log();
          return NextResponse.json(
            {
              error: "벡터 생성 실패:",
              cluster: result,
              clusterData: clusterData,
            },
            { status: 500 }
          );
        }
        clusterData.result = result;
        allClusters.push(clusterData);
      }

      const clusteredIndices = clusters.flat();
      remainingIndices = remainingIndices.filter(
        (_, i) => !clusteredIndices.includes(i)
      );

      if (remainingIndices.length === 0) break;
    }

    const resultSummary = allClusters.map((c) => c.post_ids.length);
    const totalClustered = resultSummary.reduce((a, b) => a + b, 0);

    // 5. 생성된 군집 배열을 clusters 테이블에 삽입함.
    const { data: groups, error: insertError } = await supabase.rpc(
      "create_clusters_with_vectors",
      {
        clusters: allClusters.map((cluster) => ({
          title: cluster.result.title,
          summary: cluster.result.summary,
          keywords: cluster.result.keywords,
          vector: cluster.result.vector,
          quality: cluster.quality,
          post_ids: cluster.post_ids,
        })),
      }
    );

    if (insertError) {
      console.error("삽입 실패:", insertError);
      return NextResponse.json(
        {
          error: "군집을 군집 테이블에 삽입 실패",
          clusters: allClusters.map((cluster) => ({
            title: cluster.result.title,
            summary: cluster.result.summary,
            keywords: cluster.result.keywords,
            vector: cluster.result.vector,
            quality: cluster.quality,
            post_ids: cluster.post_ids,
          })),
        },
        { status: 500 }
      );
    }

    // 6. 군집 간 코사인 유사도를 분석하는 단계
    const similarities: {
      source_id: string;
      target_id: string;
      similarity: number;
    }[] = [];

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const vectorI =
          typeof groups[i].vector === "string"
            ? JSON.parse(groups[i].vector || "")
            : groups[i].vector;
        const vectorJ =
          typeof groups[j].vector === "string"
            ? JSON.parse(groups[j].vector || "")
            : groups[j].vector;

        if (!vectorI || !vectorJ) continue;
        const sim = cosineSimilarity(vectorI, vectorJ);

        similarities.push({
          source_id: groups[i].id,
          target_id: groups[j].id,
          similarity: sim,
        });
      }
    }

    // 7. 군집 간 코사인 유사도를 cluster_similarities 테이블에 삽입하는 단계
    const CLUSTER_SIM_THRESHOLD = 0.2; // 군집 간 유사도가 적으면 삽입 안함.
    const cleanedSimilarities = similarities
      .filter((item) => item.similarity > CLUSTER_SIM_THRESHOLD)
      .map((item) => {
        const [source_id, target_id] =
          item.source_id < item.target_id
            ? [item.source_id, item.target_id]
            : [item.target_id, item.source_id]; // 다시 한 번 정렬

        return {
          source_id,
          target_id,
          similarity: item.similarity,
        };
      });
    const { error: simInsertError } = await supabase
      .from("cluster_similarities")
      .insert(cleanedSimilarities);

    if (simInsertError) {
      console.error("유사도 삽입 실패:", simInsertError);
      return NextResponse.json(
        { error: "군집 군집 테이블에 삽입 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: allClusters.length, // 생성된 군집의 수
      clusteredPostCount: totalClustered, // 군집에 포함된 게시글 수
      results: resultSummary, // 군집 결과 배열
    });
  } catch (err) {
    console.error("[CLUSTER ERROR]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

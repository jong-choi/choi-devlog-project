// import { Database } from "@/types/supabase";

/**
 * ai_summaries 데이터를 파싱합니다.
 * @param {string} summary ai_summaries.summary 원본
 * @returns {string} summary의 '한 눈에 보는 요약' 부분
 */
export function summaryParser(summary: string): string {
  return summary.split("---")[0]?.replace(/##[\s\S]*?요약\s*\n?/m, "");
}

/**
 * 두 벡터 간의 코사인 유사도를 계산합니다.
 *
 * 코사인 유사도는 두 벡터의 방향 유사도를 측정하며,
 * 값은 -1(반대 방향)부터 1(같은 방향) 사이를 가집니다.
 *
 * @param {number[]} a - 첫 번째 벡터 (number 배열)
 * @param {number[]} b - 두 번째 벡터 (number 배열)
 * @returns {number} 두 벡터의 코사인 유사도 (0~1 사이의 값, 예외 시 0 반환)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// dbscan

// export function dbScanclustering(data);

// export async function POST() {
//   const eps = 0.3; // cosine distance = 1 - sim(0.7)
//   const minPts = 3;

//   // 1. 벡터 불러오기
//   const { data, error } = await supabase
//     .from("post_embeddings")
//     .select("post_id, embedding");

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   const vectors = data.map((d) => d.embedding);
//   const postIds = data.map((d) => d.post_id);

//   // 2. distance matrix 생성
//   const distanceMatrix = vectors.map((a) =>
//     vectors.map((b) => cosineDistance(a, b))
//   );

//   // 3. DBSCAN 실행
//   const dbscan = new DBSCAN();
//   const clusters = dbscan.run(distanceMatrix, eps, minPts, true); // true = distanceMatrix 모드
//   const noise = dbscan.noise; // 군집되지 않은 글들

//   // 4. 결과 정리
//   const clusterResults = clusters.flatMap((cluster, clusterId) =>
//     cluster.map((vectorIndex) => ({
//       post_id: postIds[vectorIndex],
//       cluster_id: clusterId,
//     }))
//   );

//   const noiseResults = noise.map((vectorIndex) => ({
//     post_id: postIds[vectorIndex],
//     cluster_id: null, // 노이즈는 클러스터 없음
//   }));

//   const resultToSave = [...clusterResults, ...noiseResults];

//   // 5. Supabase에 저장
//   const { error: insertError } = await supabase
//     .from("post_clusters")
//     .upsert(resultToSave);

//   if (insertError) {
//     return NextResponse.json({ error: insertError.message }, { status: 500 });
//   }

//   return NextResponse.json({
//     message: "DBSCAN clustering complete",
//     total: resultToSave.length,
//     clusters: clusters.length,
//     noise: noise.length,
//   });
// }

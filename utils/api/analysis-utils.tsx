// import { Database } from "@/types/supabase";

/**
 * ai_summaries 데이터를 파싱합니다.
 * @param {string} summary ai_summaries.summary 원본
 * @returns {string} summary의 '한 눈에 보는 요약' 부분
 */
export function summaryParser(summary: string): string {
  return summary
    .split("---")[0]
    ?.replace(/##[\s\S]*?요약\s*\n?/m, "")
    .trim();
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

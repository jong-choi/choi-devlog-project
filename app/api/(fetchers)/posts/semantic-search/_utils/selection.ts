import { CombinedRow, RerankedCombinedRow } from "@/types/semantic-search";

export const selectOptimalResults = (
  rerankedResults: RerankedCombinedRow[],
  originalResults: CombinedRow[],
  params: {
    minThreshold: number;
    maxResults: number;
    effectiveMinResults: number;
  }
): RerankedCombinedRow[] => {
  const { minThreshold, maxResults, effectiveMinResults } = params;

  const aboveThreshold = rerankedResults.filter(
    (result) => Number(result.rerankScore ?? -1) >= minThreshold
  );

  let finalSelected: RerankedCombinedRow[] = [];

  if (aboveThreshold.length >= maxResults) {
    finalSelected = aboveThreshold.slice(0, maxResults);
  } else if (aboveThreshold.length < effectiveMinResults) {
    const needed = effectiveMinResults - aboveThreshold.length;
    const selectedIds = new Set(aboveThreshold.map((result) => result.chunk_id));

    const finalScoreSorted = [...originalResults].sort(
      (a, b) => (b?.final_score ?? 0) - (a?.final_score ?? 0)
    );

    const rerankedById = new Map(
      rerankedResults.map((result) => [result.chunk_id, result] as const)
    );

    const fillers: RerankedCombinedRow[] = [];
    for (const originalResult of finalScoreSorted) {
      if (fillers.length >= needed) break;
      if (selectedIds.has(originalResult.chunk_id)) continue;
      const withScore = rerankedById.get(originalResult.chunk_id);
      if (withScore) fillers.push(withScore);
    }

    finalSelected = [...aboveThreshold, ...fillers];
  } else {
    finalSelected = aboveThreshold;
  }

  return finalSelected;
};
import type { GenerateDocumentEmbeddingResult } from "@/app/api/embedding/_service/generate";

export type BatchSummary = {
  success: number;
  not_found: number;
  error: number;
  totalChunks: number;
  totalInserted: number;
  totalUpdated: number;
};

export const createEmptySummary = (): BatchSummary => ({
  success: 0,
  not_found: 0,
  error: 0,
  totalChunks: 0,
  totalInserted: 0,
  totalUpdated: 0,
});

export const updateSummary = (
  summary: BatchSummary,
  r: GenerateDocumentEmbeddingResult,
): BatchSummary => {
  if (r.status === "ok") summary.success += 1;
  else if (r.status === "not_found") summary.not_found += 1;
  else summary.error += 1;

  summary.totalChunks += r.chunkCount;
  summary.totalInserted += r.insertedCount;
  summary.totalUpdated += r.updatedOldEmbeddings;
  return summary;
};

export const summarizeResults = (
  results: GenerateDocumentEmbeddingResult[],
): BatchSummary =>
  results.reduce((acc, r) => updateSummary(acc, r), createEmptySummary());

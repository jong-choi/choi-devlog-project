import { HybridSearchRequest } from "@/types/semantic-search";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const validateAndNormalizeSearchParams = (
  body: Partial<HybridSearchRequest>
) => {
  const query = (body?.query || "").trim();

  if (!query) {
    throw new Error("query는 필수입니다");
  }

  return {
    query,
    overSampleCount: clamp(Number(body?.overSampleCount ?? 25), 10, 50),
    minThreshold: clamp(Number(body?.minThreshold ?? 0.3), 0, 1),
    maxResults: clamp(Number(body?.maxResults ?? 10), 1, 50),
    minResults: clamp(Number(body?.minResults ?? 5), 0, 20),
    ftsWeight: clamp(Number(body?.ftsWeight ?? 0.5), 0, 1),
    vectorWeight: clamp(Number(body?.vectorWeight ?? 0.5), 0, 1),
    rrfK: clamp(Number(body?.rrfK ?? 60), 1, 200),
  };
};
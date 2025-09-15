import { HybridSearchDbRow, CombinedRow, RerankedCombinedRow, SemanticSearchResult } from "@/types/semantic-search";

export const transformToCombinedRows = (searchResults: HybridSearchDbRow[]): CombinedRow[] => {
  return searchResults.map((searchResult) => {
    const normalizedChunkIndex = Number(searchResult.chunk_index ?? 0);
    const content =
      (searchResult.chunk_content ||
       searchResult.short_description ||
       searchResult.body ||
       searchResult.title || "") + "";

    const combinedRow: CombinedRow = {
      // HybridSearchDbRow 필드
      post_id: String(searchResult.post_id),
      title: searchResult.title,
      body: searchResult.body ?? null,
      short_description: searchResult.short_description ?? null,
      url_slug: searchResult.url_slug,
      thumbnail: searchResult.thumbnail ?? null,
      released_at: searchResult.released_at ?? null,
      tags: searchResult.tags,
      chunk_content: searchResult.chunk_content ?? null,
      chunk_index: normalizedChunkIndex,
      fts_rank: searchResult.fts_rank ?? null,
      cosine_similarity: searchResult.cosine_similarity ?? null,
      rrf_score: searchResult.rrf_score ?? null,
      final_score: searchResult.final_score ?? null,
      // RerankerInputRow 필드
      chunk_id: `${searchResult.post_id}:${normalizedChunkIndex}`,
      content,
      similarity: Number(searchResult.cosine_similarity ?? 0),
    };

    return combinedRow;
  });
};

export const formatSearchResponse = (selectedResults: RerankedCombinedRow[]): SemanticSearchResult[] => {
  return selectedResults.map((searchResult) => ({
    post_id: searchResult.post_id,
    title: searchResult.title,
    short_description: searchResult.short_description ?? null,
    url_slug: searchResult.url_slug,
    thumbnail: searchResult.thumbnail ?? null,
    released_at: searchResult.released_at ?? null,
    chunk_content: searchResult.chunk_content ?? null,
    chunk_index: searchResult.chunk_index ?? null,
    rerank_score: searchResult.rerankScore ?? undefined,
    fts_rank: Number(searchResult.fts_rank ?? 0),
    cosine_similarity: Number(searchResult.cosine_similarity ?? 0),
    tags: searchResult.tags ?? null,
  }));
};
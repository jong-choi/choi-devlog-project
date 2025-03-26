export type ClusteredPostGroup = {
  id: string;
  title: string | null;
  quality: number | null;
  post_ids: string[] | null;
};

export type ClusteredPostSimilarity = {
  source_id: string | null;
  target_id: string | null;
  similarity: number;
};

export type GraphNode = {
  id: string;
  label: string;
  quality: number;
};

export type GraphLink = {
  source: string;
  target: string;
  similarity: number;
};

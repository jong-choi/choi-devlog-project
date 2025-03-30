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

type Cluster = {
  id: string;
  title: string | null;
  post_ids: string[] | null;
  quality: number | null;
  summary: string | null;
};

export type GraphPost = {
  id: string;
  title: string;
  short_description: string | null;
  thumbnail: string | null;
  released_at: string | null;
  url_slug: string;
};

export type PostTags = {
  id: string;
  name: string;
};

export type ClusterWithPosts = Cluster & {
  posts: (GraphPost & { tags: PostTags[] })[];
};

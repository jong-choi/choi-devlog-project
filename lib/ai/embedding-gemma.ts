import { pipeline } from "@huggingface/transformers";
import "@/lib/hf/env";
import { summaryParser } from "@/utils/api/analysis-utils";

const EMBEDDING_MODEL_ID =
  process.env.HF_EMBEDDING_MODEL_ID ||
  "onnx-community/embeddinggemma-300m-ONNX";

export const EMBEDDING_GEMMA_DIMENSION = 768;

interface FeatureExtractionOutput {
  data: Float32Array | number[];
}

type FeatureExtractionPipeline = {
  (
    input: string,
    options?: { pooling?: string; normalize?: boolean },
  ): Promise<FeatureExtractionOutput>;
};

type ClusterEmbeddingInput = {
  summary: string;
  keywords: string[];
};

const createFeatureExtractionPipeline = pipeline as unknown as (
  task: "feature-extraction",
  model: string,
  options: { dtype: "fp32"; local_files_only: true },
) => Promise<FeatureExtractionPipeline>;

let cachedPipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

const loadEmbeddingPipeline = async (): Promise<FeatureExtractionPipeline> => {
  if (!cachedPipelinePromise) {
    cachedPipelinePromise = createFeatureExtractionPipeline(
      "feature-extraction",
      EMBEDDING_MODEL_ID,
      {
        dtype: "fp32",
        local_files_only: true,
      },
    );
  }

  return cachedPipelinePromise;
};

const formatSearchQuery = (query: string): string =>
  `task: search result | query: ${query}`;

const formatSearchDocument = (content: string): string =>
  `title: none | text: ${content}`;

const embed = async (input: string): Promise<number[]> => {
  if (input.trim().length === 0) return [];

  const extractor = await loadEmbeddingPipeline();
  const result = (await extractor(input, {
    pooling: "mean",
    normalize: true,
  }));

  return Array.from(result.data);
};

export const embedSearchQuery = async (query: string): Promise<number[]> =>
  embed(formatSearchQuery(query));

export const embedSearchDocument = async (text: string): Promise<number[]> =>
  embed(formatSearchDocument(text));

export const embedSearchDocuments = async (
  texts: string[],
): Promise<number[][]> =>
  Promise.all(texts.map((text) => embedSearchDocument(text)));

export const embedSummary = async (
  summaryMarkdown: string,
): Promise<number[]> => {
  const parsedSummary = summaryParser(summaryMarkdown);
  return embedSearchDocument(parsedSummary);
};

export const embedClusterText = async ({
  summary,
  keywords,
}: ClusterEmbeddingInput): Promise<number[]> => {
  const combined = [summary.trim(), keywords.join(" ").trim()]
    .filter(Boolean)
    .join(" ");

  return embedSearchDocument(combined);
};

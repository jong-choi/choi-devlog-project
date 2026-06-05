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

export const EMBEDDING_GEMMA_PRESETS = [
  "search_query",
  "search_document",
  "clustering",
  "sentence_similarity",
  "classification",
  "question_answering",
  "fact_checking",
  "code_retrieval",
] as const;

export type EmbeddingGemmaPreset =
  (typeof EMBEDDING_GEMMA_PRESETS)[number];

export const DEFAULT_EMBEDDING_GEMMA_PRESET: EmbeddingGemmaPreset =
  "search_document";

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

const EMBEDDING_INPUT_TEMPLATES: Record<EmbeddingGemmaPreset, string> = {
  search_query: "task: search result | query: {{text}}",
  search_document: "title: none | text: {{text}}",
  clustering: "task: clustering | query: {{text}}",
  sentence_similarity: "task: sentence similarity | query: {{text}}",
  classification: "task: classification | query: {{text}}",
  question_answering: "task: question answering | query: {{text}}",
  fact_checking: "task: fact checking | query: {{text}}",
  code_retrieval: "task: code retrieval | query: {{text}}",
};

const embed = async (input: string): Promise<number[]> => {
  if (input.trim().length === 0) return [];

  const extractor = await loadEmbeddingPipeline();
  const result = (await extractor(input, {
    pooling: "mean",
    normalize: true,
  }));

  return Array.from(result.data);
};

const isEmbeddingGemmaPreset = (
  value: string,
): value is EmbeddingGemmaPreset =>
  (EMBEDDING_GEMMA_PRESETS as readonly string[]).includes(value);

export const parseEmbeddingGemmaPreset = (
  value: string | null | undefined,
): EmbeddingGemmaPreset | null =>
  value && isEmbeddingGemmaPreset(value) ? value : null;

const formatEmbeddingInput = (
  preset: EmbeddingGemmaPreset,
  text: string,
): string => EMBEDDING_INPUT_TEMPLATES[preset].replace("{{text}}", text);

const embedWithPreset = async (
  text: string,
  preset: EmbeddingGemmaPreset,
): Promise<number[]> => embed(formatEmbeddingInput(preset, text));

export const embedSearchQuery = async (query: string): Promise<number[]> =>
  embedWithPreset(query, "search_query");

export const embedSearchDocument = async (text: string): Promise<number[]> =>
  embedWithPreset(text, "search_document");

export const embedSearchDocuments = async (
  texts: string[],
): Promise<number[][]> =>
  Promise.all(texts.map((text) => embedSearchDocument(text)));

export const embedSummary = async (
  summaryMarkdown: string,
  preset: EmbeddingGemmaPreset = DEFAULT_EMBEDDING_GEMMA_PRESET,
): Promise<number[]> => {
  const parsedSummary = summaryParser(summaryMarkdown);
  return embedWithPreset(parsedSummary, preset);
};

export const embedClusterText = async ({
  summary,
  keywords,
}: ClusterEmbeddingInput,
  preset: EmbeddingGemmaPreset = DEFAULT_EMBEDDING_GEMMA_PRESET,
): Promise<number[]> => {
  const combined = [summary.trim(), keywords.join(" ").trim()]
    .filter(Boolean)
    .join(" ");

  return embedWithPreset(combined, preset);
};

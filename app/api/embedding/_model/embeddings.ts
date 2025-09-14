import { pipeline } from "@huggingface/transformers";
import "@/lib/hf/env";

const EMBEDDING_MODEL_ID = "onnx-community/embeddinggemma-300m-ONNX";

interface FeatureExtractionOutput {
  data: Float32Array | number[];
}

type FeatureExtractionPipeline = {
  (
    input: string,
    options?: { pooling?: string; normalize?: boolean },
  ): Promise<FeatureExtractionOutput>;
};

let cachedPipeline: FeatureExtractionPipeline | null = null;

const loadEmbeddingPipeline = async (): Promise<FeatureExtractionPipeline> => {
  if (!cachedPipeline) {
    const pipelineResult = await pipeline(
      "feature-extraction",
      EMBEDDING_MODEL_ID,
      {
        dtype: "fp32",
        local_files_only: true,
      },
    );
    cachedPipeline = pipelineResult as FeatureExtractionPipeline;
  }
  return cachedPipeline;
};

// https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX 구조화된 포맷
const formatQuery = (query: string): string => {
  return `task: search result | query: ${query}`;
};

const formatDocument = (content: string): string => {
  return `title: none | text: ${content}`;
};

export const embeddings = {
  async embedQuery(query: string): Promise<number[]> {
    const extractor = await loadEmbeddingPipeline();
    const formattedQuery = formatQuery(query);
    const result = (await extractor(formattedQuery, {
      pooling: "mean",
      normalize: true,
    })) as FeatureExtractionOutput;
    return Array.from(result.data) as number[];
  },

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const extractor = await loadEmbeddingPipeline();
    const formattedDocs = documents.map(formatDocument);
    const results = await Promise.all(
      formattedDocs.map(async (doc) => {
        const result = (await extractor(doc, {
          pooling: "mean",
          normalize: true,
        })) as FeatureExtractionOutput;
        return Array.from(result.data) as number[];
      }),
    );
    return results;
  },

  async embedDocument(document: string): Promise<number[]> {
    const extractor = await loadEmbeddingPipeline();
    const formattedDoc = formatDocument(document);
    const result = (await extractor(formattedDoc, {
      pooling: "mean",
      normalize: true,
    })) as FeatureExtractionOutput;
    return Array.from(result.data) as number[];
  },
};

import { summaryParser } from "@/utils/api/analysis-utils";

const OLLAMA_EMBED_BASE_URL = process.env.OLLAMA_EMBED_BASE_URL;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "embeddinggemma";

export const EMBEDDING_GEMMA_DIMENSION = 768;

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

type OllamaEmbedResponse = {
  embeddings?: number[][];
};

const getEmbedEndpoint = (): string => {
  if (!OLLAMA_EMBED_BASE_URL || OLLAMA_EMBED_BASE_URL.trim().length === 0) {
    throw new Error("OLLAMA_EMBED_BASE_URL environment variable is required");
  }

  if (!OLLAMA_API_KEY || OLLAMA_API_KEY.trim().length === 0) {
    throw new Error("OLLAMA_API_KEY environment variable is required");
  }

  return new URL("/api/embed", OLLAMA_EMBED_BASE_URL).toString();
};

const requestEmbeddings = async (inputs: string[]): Promise<number[][]> => {
  if (inputs.length === 0) return [];

  const response = await fetch(getEmbedEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      input: inputs,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response
      .text()
      .catch(() => "응답 본문을 읽지 못했습니다.");
    throw new Error(
      `Ollama embed 요청 실패 (${response.status}): ${errorMessage}`,
    );
  }

  const payload = (await response.json()) as OllamaEmbedResponse;
  if (
    !payload ||
    !Array.isArray(payload.embeddings) ||
    payload.embeddings.some(
      (embedding) =>
        !Array.isArray(embedding) ||
        embedding.some((value) => typeof value !== "number"),
    )
  ) {
    throw new Error("Ollama embed 응답 형식이 올바르지 않습니다.");
  }

  return payload.embeddings;
};

const embed = async (input: string): Promise<number[]> => {
  if (input.trim().length === 0) return [];

  const [embedding] = await requestEmbeddings([input]);
  return embedding ?? [];
};

const embedMany = async (inputs: string[]): Promise<number[][]> => {
  if (inputs.length === 0) return [];

  const nonEmptyEntries = inputs
    .map((input, index) => ({ input, index }))
    .filter(({ input }) => input.trim().length > 0);

  if (nonEmptyEntries.length === 0) {
    return inputs.map(() => []);
  }

  const embeddings = await requestEmbeddings(
    nonEmptyEntries.map(({ input }) => input),
  );

  if (embeddings.length !== nonEmptyEntries.length) {
    throw new Error("Ollama embed 응답 개수가 요청 개수와 일치하지 않습니다.");
  }

  const results = inputs.map(() => [] as number[]);
  nonEmptyEntries.forEach(({ index }, embeddingIndex) => {
    results[index] = embeddings[embeddingIndex] ?? [];
  });

  return results;
};

const embedWithPreset = async (
  text: string,
  preset: EmbeddingGemmaPreset,
): Promise<number[]> => embed(formatEmbeddingInput(preset, text));

const embedManyWithPreset = async (
  texts: string[],
  preset: EmbeddingGemmaPreset,
): Promise<number[][]> =>
  embedMany(texts.map((text) => formatEmbeddingInput(preset, text)));

export const embedSearchQuery = async (query: string): Promise<number[]> =>
  embedWithPreset(query, "search_query");

export const embedSearchDocument = async (text: string): Promise<number[]> =>
  embedWithPreset(text, "search_document");

export const embedSearchDocuments = async (
  texts: string[],
): Promise<number[][]> => embedManyWithPreset(texts, "search_document");

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

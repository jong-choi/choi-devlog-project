import {
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  XLMRobertaModel,
} from "@huggingface/transformers";
import "@/lib/hf/env";
import { Reranked, RerankerInputRow } from "@/types/semantic-search";

const RERANKER_MODEL_ID =
  process.env.HF_RERANKER_MODEL_ID ||
  "jinaai/jina-reranker-v2-base-multilingual";

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY

let cachedTokenizerPromise: Promise<PreTrainedTokenizer> | null = null;
let cachedModelPromise: Promise<PreTrainedModel> | null = null;

type RankedDocument = {
  corpus_id: number;
  score: number;
};

// 서버 시작 시 리랭킹 모델 초기화
const loadReranker = async () => {
  if (!cachedTokenizerPromise) {
    cachedTokenizerPromise = AutoTokenizer.from_pretrained(RERANKER_MODEL_ID, {
      local_files_only: true,
    });
  }
  if (!cachedModelPromise) {
    cachedModelPromise = XLMRobertaModel.from_pretrained(RERANKER_MODEL_ID, {
      dtype: "q4",
      local_files_only: true,
    });
  }
  const [tokenizer, model] = await Promise.all([
    cachedTokenizerPromise,
    cachedModelPromise,
  ]);
  return { tokenizer, model };
};

const rerankWithLocalModel = async (
  query: string,
  documents: string[],
  options: { top_k?: number } = {},
): Promise<RankedDocument[]> => {
  if (documents.length === 0) return [];

  const { tokenizer, model } = await loadReranker();

  const inputs = tokenizer(new Array(documents.length).fill(query), {
    text_pair: documents,
    padding: true,
    truncation: true,
  });

  // 모델 추론 후 시그모이드로 0-1 사이 점수 변환
  const { logits } = await model(inputs);
  const scores = logits.sigmoid().tolist() as [number][];

  // 리랭킹 점수 순으로 반환
  return scores
    .map(([score], i) => ({ corpus_id: i, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.top_k || documents.length);
};

const rerankWithVoyage = async (
  query: string,
  documents: string[],
  options: { top_k?: number } = {},
): Promise<RankedDocument[]> => {
  if (documents.length === 0) return [];

  if (!VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.voyageai.com/v1/rerank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      documents,
      model: "rerank-2.5-lite",
    }),
  });

  if (!response.ok) {
    const errorMessage = await response
      .text()
      .catch(() => "응답 본문을 읽지 못했습니다.");
    throw new Error(
      `VoyageAI rerank 요청 실패 (${response.status}): ${errorMessage}`,
    );
  }

  const payload: unknown = await response.json();

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data)
  ) {
    throw new Error("VoyageAI rerank 응답 형식이 올바르지 않습니다.");
  }

  const ranked = payload.data
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.index === "number" &&
        typeof item.relevance_score === "number" &&
        item.index >= 0 &&
        item.index < documents.length,
    )
    .map((item) => ({
      corpus_id: item.index,
      score: item.relevance_score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.top_k || documents.length);

  if (ranked.length === 0) {
    throw new Error("VoyageAI rerank 결과가 비어 있습니다.");
  }

  return ranked;
};

export const applyReranking = async <T extends RerankerInputRow>(
  results: T[],
  query: string,
): Promise<Array<Reranked<T>>> => {
  if (results.length <= 1) {
    return results.map((r) => ({ ...r, rerankScore: null }));
  }

  try {
    const docs = results.map((r) => r.content ?? "");
    let ranked: RankedDocument[] = [];

    try {
      ranked = await rerankWithVoyage(query, docs, { top_k: results.length });
    } catch (voyageError) {
      console.warn(
        "VoyageAI 리랭킹 실패, 로컬 리랭커로 실행",
        voyageError,
      );
      ranked = await rerankWithLocalModel(query, docs, {
        top_k: results.length,
      });
    }

    return ranked.map((r) => ({
      ...results[r.corpus_id],
      rerankScore: r.score,
    }));
  } catch (error) {
    console.error("리랭킹 실패", error);
    return results.map((r) => ({ ...r, rerankScore: null }));
  }
};

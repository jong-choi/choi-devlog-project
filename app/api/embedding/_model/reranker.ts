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

let cachedTokenizerPromise: Promise<PreTrainedTokenizer> | null = null;
let cachedModelPromise: Promise<PreTrainedModel> | null = null;

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

const rerank = async (
  query: string,
  documents: string[],
  options: { top_k?: number } = {},
) => {
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

export const applyReranking = async <T extends RerankerInputRow>(
  results: T[],
  query: string,
): Promise<Array<Reranked<T>>> => {
  if (results.length <= 1) {
    return results.map((r) => ({ ...r, rerankScore: null }));
  }

  try {
    const docs = results.map((r) => r.content ?? "");
    const ranked = await rerank(query, docs, { top_k: results.length });

    return ranked.map((r) => ({
      ...results[r.corpus_id],
      rerankScore: r.score,
    }));
  } catch (error) {
    console.error("리랭킹 실패", error);
    return results.map((r) => ({ ...r, rerankScore: null }));
  }
};

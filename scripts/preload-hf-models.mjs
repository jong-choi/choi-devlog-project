// 모델을 빌드/로컬 최초 실행 시 미리 받아서 캐시에 저장하는 스크립트
// - transformers.js API를 그대로 사용하여 실제 추론 파이프라인을 초기화
// - env.allowRemoteModels=true, env.cacheDir 설정이 필요
import fs from "node:fs";
import path from "node:path";
import {
  AutoTokenizer,
  XLMRobertaModel,
  env,
  pipeline,
} from "@huggingface/transformers";

// 이 스크립트는 TS 빌드 산출물 없이도 단독 실행 가능해야 하므로
// 여기에서 직접 env.cacheDir 및 allowRemoteModels를 설정한다.
const resolveCacheDir = () => {
  const explicit = process.env.TRANSFORMERS_CACHE;
  if (explicit && explicit.trim().length > 0) return explicit;
  const hfHome = process.env.HF_HOME;
  if (hfHome && hfHome.trim().length > 0)
    return path.join(hfHome, "transformers");
  return path.join(process.cwd(), ".cache", "transformers");
};

env.useBrowserCache = false;
env.allowLocalModels = true;
env.cacheDir = resolveCacheDir();
// 사전 다운로드 시에는 반드시 원격 허용
env.allowRemoteModels = true;

const embeddingModelId =
  process.env.HF_EMBEDDING_MODEL_ID ||
  "onnx-community/embeddinggemma-300m-ONNX";
const rerankerModelId =
  process.env.HF_RERANKER_MODEL_ID ||
  "jinaai/jina-reranker-v2-base-multilingual";

const ensureWritable = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
  } catch (e) {
    console.warn(`[preload] 캐시 디렉토리 쓰기 불가: ${dir} (${e?.message})`);
  }
};

async function preloadEmbedding() {
  console.log(`[preload] Embedding pipeline warm-up: ${embeddingModelId}`);
  const extractor = await pipeline("feature-extraction", embeddingModelId, {
    dtype: "fp32",
  });
  await extractor("task: search result | query: preload", {
    pooling: "mean",
    normalize: true,
  });
  console.log(`[preload] Embedding model cached at: ${env.cacheDir}`);
}

async function preloadReranker() {
  console.log(`[preload] Reranker model warm-up: ${rerankerModelId}`);
  const tokenizer = await AutoTokenizer.from_pretrained(rerankerModelId);
  const model = await XLMRobertaModel.from_pretrained(rerankerModelId, {
    dtype: "fp32",
  });
  const inputs = tokenizer(["q"], {
    text_pair: ["d"],
    padding: true,
    truncation: true,
  });
  await model(inputs);
  console.log(`[preload] Reranker model cached at: ${env.cacheDir}`);
}

async function main() {
  const cacheDir =
    env.cacheDir || path.join(process.cwd(), ".cache", "transformers");
  ensureWritable(cacheDir);

  // 원격 다운로드 허용 강제 (사전 다운로드 목적)
  env.allowRemoteModels = true;

  const targets = (process.env.HF_PRELOAD_TARGETS || "embedding,reranker")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (targets.includes("embedding")) {
    await preloadEmbedding();
  }
  if (targets.includes("reranker")) {
    await preloadReranker();
  }
}

main().catch((err) => {
  console.error("[preload] 실패", err);
  process.exit(1);
});

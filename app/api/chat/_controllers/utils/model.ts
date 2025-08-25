import { ChatOllama } from "@langchain/ollama";

const MODEL_NAME =
  "hf.co/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF:Q4_K_M";

export const MAX_MESSAGES_LEN = 5;

const fetchWithSecretKey = (
  url: RequestInfo | URL,
  options: RequestInit | undefined = {},
) => {
  options.headers = {
    ...options.headers,
    "LLM-SECRET-KEY": process.env.LLM_SECRET_KEY || "",
  };
  return fetch(url, options);
};

// 환경변수 확인
const OLLAMA_HOST = process.env.ORACLE_OLLAMA_HOST;
if (!OLLAMA_HOST) {
  console.error("ORACLE_OLLAMA_HOST environment variable is not set"); //디버깅
  throw new Error("ORACLE_OLLAMA_HOST environment variable is required");
}


export const llmModel = new ChatOllama({
  baseUrl: OLLAMA_HOST,
  model: MODEL_NAME,
  streaming: true,
  fetch: fetchWithSecretKey,
  numPredict: 2000, // 최대 토큰 수 제한 걸어서 무한반복이슈 중단
});

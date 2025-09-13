import { OllamaEmbeddings } from "@langchain/ollama";

const fetchWithSecretKey = (
  url: Request | string | URL,
  options: RequestInit | undefined = {},
) => {
  options.headers = {
    ...options.headers,
    "LLM-SECRET-KEY": process.env.LLM_SECRET_KEY!,
  };
  return fetch(url, options);
};

export const embeddings = new OllamaEmbeddings({
  model: "embeddinggemma:300m",
  baseUrl: process.env.ORACLE_OLLAMA_HOST,
  fetch: fetchWithSecretKey,
});

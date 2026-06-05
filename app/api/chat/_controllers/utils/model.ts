import { ChatOllama } from "@langchain/ollama";

export const MAX_MESSAGES_LEN = 10;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
const OLLAMA_SMALL_MODEL = process.env.OLLAMA_SMALL_MODEL;
const OLLAMA_MEDIUM_MODEL = process.env.OLLAMA_MEDIUM_MODEL;

if (!OLLAMA_API_KEY || !OLLAMA_BASE_URL || !OLLAMA_SMALL_MODEL || !OLLAMA_MEDIUM_MODEL) {
  throw new Error(
    "OLLAMA_API_KEY, OLLAMA_BASE_URL, OLLAMA_SMALL_MODEL, OLLAMA_MEDIUM_MODEL environment variables are required",
  );
}

const headers = {
  Authorization: `Bearer ${OLLAMA_API_KEY}`,
};

export const mediumModel = new ChatOllama({
  model: OLLAMA_MEDIUM_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  headers,
  think: "low" as unknown as boolean, // gpt-oss는 예외적으로 string 허용
  numPredict: 32768,
});

export const smallModel = new ChatOllama({
  model: OLLAMA_SMALL_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  headers,
  think: "low" as unknown as boolean, // gpt-oss는 예외적으로 string 허용
  numPredict: 8192,
  streaming: false,
});

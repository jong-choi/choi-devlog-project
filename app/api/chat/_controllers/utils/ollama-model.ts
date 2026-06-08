import { ChatOllama } from "@langchain/ollama";

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;

if (!OLLAMA_API_KEY || !OLLAMA_BASE_URL) {
  throw new Error(
    "OLLAMA_API_KEY and OLLAMA_BASE_URL environment variables are required",
  );
}

const headers = {
  Authorization: `Bearer ${OLLAMA_API_KEY}`,
};

export const createOllamaModel = ({
  model,
  numPredict,
  streaming,
}: {
  model: string;
  numPredict: number;
  streaming?: boolean;
}) =>
  new ChatOllama({
    model,
    baseUrl: OLLAMA_BASE_URL,
    headers,
    think: "low" as unknown as boolean,
    numPredict,
    ...(streaming === undefined ? {} : { streaming }),
  });

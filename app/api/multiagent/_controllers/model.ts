import { ChatOpenAI } from "@langchain/openai";
import { MODEL_NAME } from "./constants";

export const createLLMModel = () => {
  return new ChatOpenAI({
    model: MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    streaming: true,
    temperature: 0.7,
  });
};

export const createSystemPrompt = (
  message: string,
  systemContext: string,
  isToolsAllowed: boolean
) => {
  const prompt = `당신은 개발 블로그 도우미 챗봇입니다.
항상 한국어로 답변하며, 개발 관련 질문에 친절하고 정확하게 답변합니다.
user message: ${message}
${
  isToolsAllowed
    ? "도구 사용이 가능합니다. Tools : Allowed\n"
    : "Tools : NOT Allowed\n"
}
${
  systemContext
    ? `추가 컨텍스트: ${systemContext}\n`
    : ""
}
500자 이내로 간결하게 답변하세요.`;
  return prompt;
};
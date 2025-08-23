import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch";
import { MultiAgentState } from "./graph-state";
import { SearchApiResponse, SummaryApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

// HyperCLOVA 모델 설정 (실제로는 OpenAI를 사용)
const createLLMModel = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const { ChatOpenAI } = require("@langchain/openai");
  return new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    streaming: true,
  });
};

// Decision node - 타입에 따라 라우팅
export const decisionNode = async (state: typeof MultiAgentState.State) => {
  // 이미 타입이 설정되어 있으므로 그대로 반환
  return { type: state.type };
};

// Search node - API 조회 + HyperCLOVA 응답 생성
export const searchNode = async (state: typeof MultiAgentState.State) => {
  try {
    // 1. Search API 호출
    const keyword =
      (typeof (state as any).context?.keyword === "string"
        ? (state as any).context.keyword
        : undefined) || state.userMessage;
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      page: "1",
      limit: "5",
    });

    const response = await fetch(`${BASE_URL}/api/posts/search?${params}`);
    if (!response.ok) {
      return { finalResponse: `검색 API 호출 실패: ${response.status}` };
    }

    const result: SearchApiResponse = await response.json();

    if (result.error || !result.data || result.data.length === 0) {
      return {
        finalResponse: `"${keyword}"에 대한 검색 결과를 찾을 수 없습니다.`,
      };
    }

    // 2. 검색 결과를 프롬프트에 포함하여 HyperCLOVA 응답 생성
    const searchResultsText = result.data
      .map(
        (post, index) =>
          `${index + 1}. **${post.title}**\n` +
          `   - URL: /${post.url_slug}\n` +
          `   - Category: ${post.category_name} > ${post.subcategory_name}\n` +
          `   - Date: ${new Date(post.created_at).toLocaleDateString(
            "ko-KR"
          )}\n` +
          `   - Preview: ${
            post.snippet ||
            post.description?.substring(0, 150) ||
            "미리보기 없음"
          }\n`
      )
      .join("\n");

    const llm = createLLMModel();
    const prompt = `사용자가 "${keyword}"로 검색했습니다. 다음은 검색 결과입니다:

${searchResultsText}

검색 결과를 바탕으로 사용자에게 도움이 되는 응답을 작성해주세요. 관련된 포스트들을 소개하고, 어떤 내용을 다루고 있는지 설명해주세요.`;

    const history = Array.isArray((state as any).messages)
      ? ((state as any).messages as any[])
      : [];
    const llmResponse = await llm.invoke([
      ...history,
      new HumanMessage(prompt),
    ]);

    const answer =
      typeof llmResponse.content === "string"
        ? llmResponse.content
        : String(llmResponse.content);

    return {
      finalResponse: answer,
      messages: [new AIMessage(answer)],
    } as any;
  } catch (error) {
    console.error("Search node error:", error);
    return { finalResponse: "검색 중 오류가 발생했습니다. 다시 시도해주세요." };
  }
};

// Summary node - API 조회 결과를 그대로 응답
export const summaryNode = async (state: typeof MultiAgentState.State) => {
  try {
    const ctx = (state as any).context || {};
    const postIdFromContext = (ctx as any).post_id || (ctx as any).postId;
    const postId = postIdFromContext || state.post_id;

    if (!postId) {
      return { finalResponse: "요약을 위한 포스트 ID가 필요합니다." };
    }

    const params = new URLSearchParams({
      post_id: postId,
    });

    const response = await fetch(`${BASE_URL}/api/ai/summary?${params}`);
    if (!response.ok) {
      return { finalResponse: `요약 API 호출 실패: ${response.status}` };
    }

    const result: SummaryApiResponse = await response.json();

    if (result.error || !result.data) {
      return {
        finalResponse: `포스트 ID "${postId}"에 대한 AI 요약을 찾을 수 없습니다.`,
      };
    }

    const summary = result.data;
    const formattedResponse =
      `**AI 요약**\n\n` +
      `${summary.summary}\n\n` +
      `**태그:** ${summary.tags ? summary.tags.join(", ") : "없음"}\n\n` +
      `**주요 포인트:** ${
        summary.key_points ? summary.key_points.join(", ") : "없음"
      }`;

    return { finalResponse: formattedResponse };
  } catch (error) {
    console.error("Summary node error:", error);
    return {
      finalResponse: "요약 조회 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
};

// Chat node - HyperCLOVA 응답 생성만
export const chatNode = async (state: typeof MultiAgentState.State) => {
  try {
    const llm = createLLMModel();
    const history = Array.isArray((state as any).messages)
      ? ((state as any).messages as any[])
      : [];
    const lastTurn = new HumanMessage(state.userMessage);
    const llmResponse = await llm.invoke([...history, lastTurn]);

    const answer =
      typeof llmResponse.content === "string"
        ? llmResponse.content
        : String(llmResponse.content);

    return {
      finalResponse: answer,
      messages: [new AIMessage(answer)],
    } as any;
  } catch (error) {
    console.error("Chat node error:", error);
    return {
      finalResponse: "응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
};

// Finish node - 결과 수집 및 이벤트 발생
export const finishNode = async (state: typeof MultiAgentState.State) => {
  await dispatchCustomEvent("task_completed", {
    type: state.type,
    response: state.finalResponse,
  });
  return state;
};

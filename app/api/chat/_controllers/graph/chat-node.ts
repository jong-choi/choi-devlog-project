import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import {
  MAX_MESSAGES_LEN,
  llmModel,
} from "@/app/api/chat/_controllers/utils/model";
import { LangNodeName } from "@/types/chat";
import { SessionMessagesAnnotation } from "./graph";

// 게시글 요약문을 기반으로 대화함
export async function chatNode(state: typeof SessionMessagesAnnotation.State) {
  const contextMessages = state.messages.slice(0 - MAX_MESSAGES_LEN);
  const systemPrompt = [
    new SystemMessage(
      `당신은 프론트엔드 기술블로그의 관리 챗봇입니다. 블로그의 주제는 React, Next.js, 자바스크립트, 타입스크립트, 알고리즘.`,
    ),
  ];

  if (state.postSummary) {
    try {
      systemPrompt.push(new HumanMessage(`지금 내가 보는 게시글을 요약해줘.`));
      systemPrompt.push(
        new AIMessage(
          `사용자님께서 보고 있는 게시글입니다!\n\n ${state.postSummary.summary}`,
        ),
      );
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  }
  systemPrompt.push(new HumanMessage(`다음에는 7줄 이내로 요약해줘.`));
  systemPrompt.push(new AIMessage(`네 알겠습니다.`));

  // 최신 대화 n개 + 시스템 프롬프트
  const aiMessage = await llmModel.invoke([
    ...systemPrompt,
    ...contextMessages,
  ]);

  const nextState = {
    ...state,
    routeType: "" as const,
    messages: [aiMessage],
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}

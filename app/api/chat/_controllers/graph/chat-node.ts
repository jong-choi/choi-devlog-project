import { LangNodeName } from "@/types/chat";
import {
  llmModel,
  MAX_MESSAGES_LEN,
} from "@/app/api/chat/_controllers/utils/model";
import { getAISummaryByPostId } from "@/app/post/fetchers/ai";
import { AIMessage } from "@langchain/core/messages";

import { Command } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "./graph";

// 게시글 요약문을 기반으로 대화함
export async function chatNode(state: typeof SessionMessagesAnnotation.State) {
  const contextMessages = state.messages.slice(0 - MAX_MESSAGES_LEN);
  const systemPrompt = [
    new AIMessage(
      `당신은 프론트엔드 기술블로그의 관리 챗봇입니다. 당신은 프론트엔드에 대한 전문지식이 뛰어납니다. React, Next.js, 자바스크립트, 타입스크립트, 알고리즘.`
    ),
  ];

  if (state.postId) {
    try {
      // 요약 게시글이 있을 때 시스템 프롬프트에 추가
      const summaryResponse = await getAISummaryByPostId(state.postId);
      if (summaryResponse.data?.summary) {
        systemPrompt.push(
          new AIMessage(
            `다음은 현재 게시글의 요약입니다: ${summaryResponse.data.summary}`
          )
        );
      }
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  }

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

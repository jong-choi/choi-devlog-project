import { LangNodeName } from "@/types/chat";
import { llmModel } from "@/app/api/chat/_controllers/utils/model";
import { getAISummaryByPostId } from "@/app/post/fetchers/ai";
import { AIMessage } from "@langchain/core/messages";

import { Command } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "./graph";

export async function chatNode(state: typeof SessionMessagesAnnotation.State) {
  let contextMessages = state.messages.slice(-5);

  // postId가 있으면 summary를 컨텍스트 첫 번째에 추가
  if (state.postId) {
    try {
      const summaryResponse = await getAISummaryByPostId(state.postId);
      if (summaryResponse.data?.summary) {
        const summaryMessage = new AIMessage(
          `다음은 현재 게시글의 요약입니다: ${summaryResponse.data.summary}`
        );
        contextMessages = [summaryMessage, ...contextMessages];
      }
    } catch (error) {
      console.error("Failed to load summary:", error);
      // summary 로드 실패해도 채팅은 계속 진행
    }
  } else {
    contextMessages = [
      new AIMessage(
        `당신은 프론트엔드 기술블로그의 관리 챗봇입니다. 당신은 프론트엔드에 대한 전문지식이 뛰어납니다. React, Next.js, 자바스크립트, 타입스크립트, 알고리즘.`
      ),
      ...contextMessages,
    ];
  }

  const aiMessage = await llmModel.invoke(contextMessages);

  const nextState = {
    ...state,
    routeType: "" as const,
    messages: [aiMessage],
  };

  return new Command({
    goto: LangNodeName.decision,
    update: nextState,
  });
}

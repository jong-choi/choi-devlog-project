import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { routingModel } from "@/app/api/chat/_controllers/utils/model";
import { LangNodeName, RouteType, routeKeys } from "@/types/chat";

// 라우트 타입 확인하고 라우팅함
export async function routingNode(
  state: typeof SessionMessagesAnnotation.State,
) {
  let next = state.routeType;

  // 라우트 타입 없이 진입
  if (!next) {
    const lastUserMessage = state.messages
      .filter((message) => message.getType() === "human")
      .at(-1);

    if (!lastUserMessage) {
      return new Command({
        goto: END,
      });
    }

    const lol = await routingModel.invoke([
      new SystemMessage(
        `당신은 블로그 챗봇의 라우팅을 결정하는 AI입니다. 사용자의 질문을 분석하여 'google', 'chat', 'getSummary' 세 가지 경로 중 가장 적절한 하나를 결정해야 합니다.
- 'google': 최신 정보나 웹 검색이 필요한 일반적인 질문일 경우 사용합니다.
- 'chat': 간단한 인사, 대화, 또는 AI 자신에 대한 질문일 경우 사용합니다.
- 'summary': 자신이 보고 있는 게시글에 대해 질문하거나 블로그에 대한 질문을 하는 경우 사용합니다.
당신의 답변은 반드시 'google', 'chat', 'summary' 이 세 가지 문자열 중 하나여야 합니다. 다른 어떤 설명이나 텍스트도 포함해서는 안 됩니다.`,
      ),
      new HumanMessage(lastUserMessage.content as string),
    ]);
    if (typeof lol.content === "string") {
      const decision = lol.content.trim();
      if (routeKeys.includes(decision as RouteType)) {
        next = decision as RouteType;
      }
    } else {
      next = "chat";
    }
  }

  // end면 종료 - 없어도 __end__로 이동하면서 작동함
  if (next == "end") {
    return new Command({
      goto: END,
    });
  }

  if (next in LangNodeName) {
    return new Command({
      update: { routeType: next },
      goto: LangNodeName[next as keyof typeof LangNodeName],
    });
  }

  return new Command({
    goto: END,
  });
}

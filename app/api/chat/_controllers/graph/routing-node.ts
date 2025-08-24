import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/types/chat";
import { Command, END } from "@langchain/langgraph";

// 라우트 타입 확인하고 라우팅함
export async function routingNode(
  state: typeof SessionMessagesAnnotation.State
) {
  const route = state.routeType;

  if (!route) {
    return new Command({
      goto: END,
    });
  }

  if (route in LangNodeName) {
    return new Command({
      goto: LangNodeName[route as keyof typeof LangNodeName],
    });
  }

  return new Command({
    goto: END,
  });
}

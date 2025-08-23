import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/app/api/chat/_controllers/types/chat";
import { Command, END } from "@langchain/langgraph";

// 의사결정 노드: routeType에 따라 다음 노드 실행
export async function decisionNode(
  state: typeof SessionMessagesAnnotation.State
) {
  const route = state.routeType;
  console.log("state", route);
  if (!route) {
    return new Command({
      goto: END,
    });
  } else {
    return new Command({
      goto: LangNodeName[route],
    });
  }
}

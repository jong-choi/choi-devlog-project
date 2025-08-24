import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/types/chat";
import { Command, END } from "@langchain/langgraph";

// 의사결정 노드: routeType에 따라 다음 노드 실행
export async function decisionNode(
  state: typeof SessionMessagesAnnotation.State
) {
  const route = state.routeType;
  if (!route) {
    return new Command({
      goto: END,
    });
  }
  
  // 타입 안전성을 위한 매핑
  const nodeMap = {
    chat: LangNodeName.chat,
    google: LangNodeName.google,
    decision: LangNodeName.decision,
  } as const;
  
  // 지원되는 노드만 처리
  if (route in nodeMap) {
    return new Command({
      goto: nodeMap[route as keyof typeof nodeMap],
    });
  }
  
  // summary, recommend 등은 아직 구현되지 않은 경우 END로 처리
  return new Command({
    goto: END,
  });
}

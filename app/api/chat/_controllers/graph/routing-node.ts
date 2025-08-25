import { Command, END } from "@langchain/langgraph";
import { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/types/chat";

// 라우트 타입 확인하고 라우팅함
export async function routingNode(
  state: typeof SessionMessagesAnnotation.State,
) {
  console.log("Routing node - route type:", state.routeType); //디버깅
  const route = state.routeType;

  if (!route) {
    return new Command({
      goto: END,
    });
  }

  const currentPostId = state.postId || null;
  const prevPostId = state.postSummary?.id || null;
  if (currentPostId !== prevPostId) {
    console.log("Post ID changed - current:", currentPostId, "prev:", prevPostId); //디버깅
    return new Command({
      goto: LangNodeName.fetchSummary,
    });
  }

  if (route in LangNodeName) {
    console.log("Routing to node:", LangNodeName[route as keyof typeof LangNodeName]); //디버깅
    return new Command({
      goto: LangNodeName[route as keyof typeof LangNodeName],
    });
  }

  console.log("Routing to END"); //디버깅
  return new Command({
    goto: END,
  });
}

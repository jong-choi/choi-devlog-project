import { chatNode } from "@/app/api/chat/_controllers/graph/chat-node";
import { decisionNode } from "@/app/api/chat/_controllers/graph/decision-node";
import { googleNode } from "@/app/api/chat/_controllers/graph/google-node";
import {
  LangNodeKeys,
  LangNodeName,
} from "@/app/api/chat/_controllers/types/chat";
import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MemorySaver,
  messagesStateReducer,
  START,
  StateGraph,
} from "@langchain/langgraph";

export const SessionMessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  // 노드 이름
  routeType: Annotation<LangNodeKeys>({
    default: () => "chat",
    reducer: (_, update) => update,
  }),
});

export const checkpointer = new MemorySaver();

export function buildGraph() {
  return (
    new StateGraph(SessionMessagesAnnotation)
      // decision: chat | google | END 로만 이동
      .addNode(LangNodeName.decision, decisionNode, {
        ends: [LangNodeName.chat, LangNodeName.google, LangNodeName.blog, END],
      })
      // chat/google: 처리 후 decision으로 복귀
      .addNode(LangNodeName.chat, chatNode, { ends: [LangNodeName.decision] })
      .addNode(LangNodeName.google, googleNode, {
        ends: [LangNodeName.decision],
      })
      .addEdge(START, LangNodeName.decision)
      .compile({ checkpointer })
  );
}

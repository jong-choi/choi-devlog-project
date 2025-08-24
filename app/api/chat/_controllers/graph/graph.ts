import { simpleChatNode } from "@/app/api/chat/_controllers/graph/simple-chat-node";
import { chatNode } from "@/app/api/chat/_controllers/graph/chat-node";
import { routingNode } from "@/app/api/chat/_controllers/graph/routing-node";
import { googleNode } from "@/app/api/chat/_controllers/graph/google-node";
import { LangNodeKeys, LangNodeName } from "@/types/chat";
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
  // 현재 게시글 ID
  postId: Annotation<string | undefined>({
    default: () => undefined,
    reducer: (_, update) => update,
  }),
});

export const checkpointer = new MemorySaver();

export function buildGraph() {
  return new StateGraph(SessionMessagesAnnotation)
    .addNode(LangNodeName.routing, routingNode, {
      ends: [
        LangNodeName.chat,
        LangNodeName.google,
        LangNodeName.simpleChat,
        END,
      ],
    })
    .addNode(LangNodeName.chat, chatNode, {
      ends: [LangNodeName.routing],
    })
    .addNode(LangNodeName.simpleChat, simpleChatNode, {
      ends: [LangNodeName.routing],
    })
    .addNode(LangNodeName.google, googleNode, {
      ends: [LangNodeName.routing],
    })
    .addEdge(START, LangNodeName.routing)
    .compile({ checkpointer });
}

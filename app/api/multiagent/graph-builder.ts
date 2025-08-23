import { StateGraph, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { MultiAgentState } from "./graph-state";
import {
  decisionNode,
  searchNode,
  summaryNode,
  chatNode,
  finishNode,
} from "./nodes";

export function createMultiAgentGraph() {
  const checkpointer = new MemorySaver();
  return (
    new StateGraph(MultiAgentState)
      // 노드 추가
      .addNode("decision", decisionNode)
      .addNode("search", searchNode)
      .addNode("summary", summaryNode)
      .addNode("chat", chatNode)
      .addNode("finish", finishNode)
      // 엣지 연결
      .addEdge(START, "decision")
      // 타입에 따른 조건부 분기
      .addConditionalEdges("decision", (state) => state.type, {
        search: "search",
        summary: "summary",
        chat: "chat",
      })
      // 각 노드에서 finish로
      .addEdge("search", "finish")
      .addEdge("summary", "finish")
      .addEdge("chat", "finish")
      .addEdge("finish", END)
      .compile({ checkpointer })
  );
}

export const multiAgentGraph = createMultiAgentGraph();

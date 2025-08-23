import { HumanMessage } from "@langchain/core/messages";
import { multiAgentGraph } from "./graph-builder";
import { SSE_HEADERS, writeSSE } from "./sse-utils";
import { MultiAgentRequest, RequestType } from "./types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();
  const headers = new Headers(SSE_HEADERS);

  (async () => {
    try {
      const requestBody = await req.json().catch(() => ({}));
      const {
        message,
        context,
        type: legacyType,
        post_id: legacyPostId,
        sessionId,
      }: MultiAgentRequest = requestBody;

      if (!message) {
        await writeSSE(writer, "error", {
          message: "message가 필요합니다.",
          received: requestBody,
        });
        return;
      }

      const resolvedType: RequestType = (context?.type ||
        legacyType ||
        "chat") as RequestType;
      const resolvedPostId =
        context?.post_id || context?.postId || legacyPostId;

      // 초기 상태 설정
      const initialState = {
        messages: [new HumanMessage(message)],
        type: resolvedType,
        userMessage: message,
        post_id: resolvedPostId,
        finalResponse: "",
        context: context || {},
        sessionId: sessionId || "",
      } as any;

      await writeSSE(writer, "start", { type: resolvedType });

      // 그래프 실행 및 스트리밍
      for await (const event of multiAgentGraph.streamEvents(initialState, {
        version: "v2",
        configurable: { thread_id: sessionId || "" },
      })) {
        // LLM 토큰 스트리밍
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk?.content || "";
          if (chunk) {
            await writeSSE(writer, "chunk", { text: chunk });
          }
        }

        // 노드 시작/종료 이벤트
        if (
          event.event === "on_chain_start" &&
          event.metadata?.langgraph_node
        ) {
          const nodeName = event.metadata.langgraph_node;
          await writeSSE(writer, "node_start", { node: nodeName });
        }

        if (event.event === "on_chain_end" && event.metadata?.langgraph_node) {
          const nodeName = event.metadata.langgraph_node;
          await writeSSE(writer, "node_end", { node: nodeName });
        }

        // 커스텀 완료 이벤트
        if (
          event.event === "on_custom_event" &&
          event.name === "task_completed"
        ) {
          const payload = event.data;
          await writeSSE(writer, "task_completed", payload);
        }
      }

      await writeSSE(writer, "end", { message: "완료되었습니다." });
    } catch (error) {
      console.error("MultiAgent graph error:", error);
      await writeSSE(writer, "error", {
        message: "처리 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await writer.close();
    }
  })().catch(async (error) => {
    console.error("Unexpected error:", error);
    try {
      await writer.close();
    } catch {}
  });

  return new Response(readable, { headers });
}

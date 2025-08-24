import { buildGraph } from "@/app/api/chat/_controllers/graph/graph";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";
import { AIMessage } from "@langchain/core/messages";
import { NextRequest, NextResponse } from "next/server";
import {
  bipassEventHander,
  chatEventHander,
} from "@/app/api/chat/_controllers/utils/chat-event";

export async function handleStream(request: NextRequest, sessionId: string) {
  try {
    const session = sessionStore.get(sessionId);
    const inputs = session?.state;

    if (!inputs) {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const data = {
            event: "error",
            name: "chatNode",
            message: "전송할 메시지가 없음",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const app = buildGraph();

        // 1) summary 라우트: 즉시 사용자에게 이벤트 전송
        if (
          inputs.routeType === "summary" ||
          inputs.routeType === "recommend"
        ) {
          try {
            // 1) DB에서 결과 조회 (요구사항에 맞게 구현)
            const content = "임의의 문자열";

            bipassEventHander({
              controller,
              content,
            });

            await app.updateState(
              { configurable: { thread_id: sessionId } },
              { messages: [new AIMessage(content)], routeType: "" as const }
            );
          } catch {
            const data = { event: "error", message: "stream error" };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          } finally {
            controller.close();
          }
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        try {
          for await (const chunk of app.streamEvents(inputs, {
            version: "v2",
            configurable: { thread_id: sessionId },
          })) {
            chatEventHander({ controller, chunk });
          }
        } catch (_error) {
          const data = { event: "error", message: "stream error" };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to get stream" },
      { status: 500 }
    );
  }
}

import { buildGraph } from "@/app/api/chat/_controllers/graph/graph";
import { sessionStore } from "@/app/api/chat/_controllers/utils/sessionStore";
import { NextRequest, NextResponse } from "next/server";

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

        try {
          for await (const chunk of app.streamEvents(inputs, {
            version: "v2",
            configurable: { thread_id: sessionId },
          })) {
            const event = chunk.event;
            let data: unknown = null;

            if (event === "on_chat_model_start") {
              data = { event, name: "chatNode" };
            } else if (event === "on_chat_model_stream") {
              data = {
                event,
                name: "chatNode",
                chunk: { content: chunk.data.chunk.content },
              };
            } else if (event === "on_chat_model_end") {
              data = { event, name: "chatNode" };
            } else if (event === "on_chat_model_end") {
              data = { event, name: "chatNode" };
            } else {
              console.log(chunk);
            }
            if (data) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            }
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

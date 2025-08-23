import { StreamEvent } from "@langchain/core/tracers/log_stream";

export const chatEventHander = ({
  controller,
  chunk,
}: {
  controller: ReadableStreamDefaultController;
  chunk: StreamEvent;
}) => {
  let data = null;
  const event = chunk.event;
  const encoder = new TextEncoder();

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
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }
};

export const bipassEventHander = ({
  content,
  controller,
}: {
  controller: ReadableStreamDefaultController;
  content: string;
}) => {
  const encoder = new TextEncoder();

  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({
        event: "on_chat_model_start",
        name: "chatNode",
      })}\n\n`
    )
  );

  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({
        event: "on_chat_model_stream",
        name: "chatNode",
        chunk: { content },
      })}\n\n`
    )
  );

  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({
        event: "on_chat_model_end",
        name: "chatNode",
      })}\n\n`
    )
  );
};

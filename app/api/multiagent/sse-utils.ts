export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no",
};

export function writeSSE(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  event: string,
  data?: unknown
): Promise<void> {
  const encoder = new TextEncoder();
  const eventData = 
    `event: ${event}\n` +
    (data !== undefined ? `data: ${JSON.stringify(data)}\n` : "") +
    "\n";
  
  return writer.write(encoder.encode(eventData));
}
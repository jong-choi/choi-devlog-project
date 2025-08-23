import type { SSEWriter } from "../_types";

// SSE 종료/중단 시에도 안전하게 write 하기 위한 헬퍼
const safeSSEWrite = (writer: SSEWriter | undefined, chunk: string): boolean => {
  try {
    if (!writer || writer.isEnded()) return false;
    writer.write(chunk);
    return true;
  } catch {
    return false;
  }
};

export const safeSSEvent = (
  writer: SSEWriter | undefined,
  event: string,
  data?: unknown
): boolean => {
  const body =
    `event: ${event}\n` +
    (typeof data !== "undefined" ? `data: ${JSON.stringify(data)}\n` : "") +
    "\n";
  return safeSSEWrite(writer, body);
};
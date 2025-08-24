import { checkpointer } from "@/app/api/chat/_controllers/graph/graph";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { SessionResponse, SessionErrorResponse } from "@/types/chat";
const SESSION_IDLE_TIMEOUT_MS = 1000 * 60 * 2; // 세션은 2분간 유지

export async function handleConnect() {
  try {
    const id = randomUUID();
    sessionStore.set({ id });
    sessionStore.setIdleTimer(id, SESSION_IDLE_TIMEOUT_MS, () => {
      checkpointer.deleteThread(id);
      sessionStore.delete(id);
    });

    const response: SessionResponse = {
      success: true,
      data: { sessionId: id },
    };
    return NextResponse.json(response);
  } catch (_error) {
    const errorResponse: SessionErrorResponse = {
      error: "Failed to create session",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

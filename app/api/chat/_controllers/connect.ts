import { checkpointer } from "@/app/api/chat/_controllers/graph/graph";
import { sessionStore } from "@/app/api/chat/_controllers/utils/sessionStore";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
const SESSION_IDLE_TIMEOUT_MS = 1000 * 60 * 2; // 세션은 2분간 유지

export async function handleConnect() {
  try {
    const id = randomUUID();
    sessionStore.set({ id });
    sessionStore.setIdleTimer(id, SESSION_IDLE_TIMEOUT_MS, () => {
      checkpointer.deleteThread(id);
      sessionStore.delete(id);
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: id },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

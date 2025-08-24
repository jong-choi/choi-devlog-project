import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";
import { HumanMessage } from "@langchain/core/messages";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { MessageRequest, MessageResponse } from "@/types/chat";

export async function handleSend(request: NextRequest, sessionId: string) {
  try {
    const body = (await request.json()) as MessageRequest;

    if (!body) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const routeType = body.type || "chat";
    sessionStore.set({
      id: sessionId,
      state: {
        messages: [new HumanMessage(body.message)],
        routeType,
      },
    });

    const response: MessageResponse = {
      success: true,
      requestId: randomUUID(),
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
